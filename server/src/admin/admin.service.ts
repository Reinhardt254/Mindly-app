import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { AccountStatus } from "../generated/prisma/client";
import { addDays, toDateString } from "../common/dates";
import { env } from "../config/env";
import { PrismaService } from "../prisma/prisma.service";
import { StorageService } from "../storage/storage.service";

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async overview() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfToday = new Date(`${toDateString(now)}T00:00:00.000Z`);
    const chartStart = addDays(toDateString(now), -13);

    const [users, newUsers7d, admins, premium, moodCheckins7d, aiGenerationsToday, voiceRecordings, signupRows] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        this.prisma.user.count({ where: { role: "ADMIN" } }),
        this.prisma.entitlement.count({
          where: {
            entitlementId: env.REVENUECAT_ENTITLEMENT_ID,
            isActive: true,
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
        }),
        this.prisma.moodEntry.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        this.prisma.aiGeneration.count({ where: { createdAt: { gte: startOfToday } } }),
        this.prisma.voiceRecording.count(),
        this.prisma.$queryRaw<{ date: string; count: number }[]>`
          SELECT to_char("createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date, COUNT(*)::int AS count
          FROM "user"
          WHERE "createdAt" >= ${new Date(`${chartStart}T00:00:00.000Z`)}
          GROUP BY 1
        `,
      ]);

    const byDate = new Map(signupRows.map((row) => [row.date, Number(row.count)]));
    const signups = Array.from({ length: 14 }, (_, i) => {
      const date = addDays(chartStart, i);
      return { date, count: byDate.get(date) ?? 0 };
    });

    return { users, newUsers7d, admins, premium, moodCheckins7d, aiGenerationsToday, voiceRecordings, signups };
  }

  async users(query?: string) {
    const term = query?.trim();
    const accounts = await this.prisma.user.findMany({
      where: term
        ? {
            OR: [
              { email: { contains: term, mode: "insensitive" } },
              { name: { contains: term, mode: "insensitive" } },
            ],
          }
        : {},
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    });

    const now = new Date();
    const entitlements = await this.prisma.entitlement.findMany({
      where: {
        userId: { in: accounts.map((account) => account.id) },
        entitlementId: env.REVENUECAT_ENTITLEMENT_ID,
        isActive: true,
      },
      select: { userId: true, expiresAt: true },
    });
    const premiumIds = new Set(
      entitlements.filter((entitlement) => !entitlement.expiresAt || entitlement.expiresAt > now).map((entitlement) => entitlement.userId),
    );

    return {
      items: accounts.map((account) => ({
        ...account,
        premium: account.role === "ADMIN" || premiumIds.has(account.id),
      })),
    };
  }

  async promote(email: string) {
    const account = await this.prisma.user.findFirst({
      where: { email: { equals: email.trim(), mode: "insensitive" } },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!account) {
      throw new NotFoundException({
        code: "USER_NOT_FOUND",
        message: "No account with that email. They need to sign up first.",
      });
    }
    if (account.role === "ADMIN") return { ...account, premium: true };
    const updated = await this.prisma.user.update({
      where: { id: account.id },
      data: { role: "ADMIN" },
      select: { id: true, name: true, email: true, role: true },
    });
    return { ...updated, premium: true };
  }

  async demote(userId: string) {
    const account = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!account) throw new NotFoundException({ code: "USER_NOT_FOUND", message: "Account not found." });
    if (account.role !== "ADMIN") return { id: account.id, role: account.role };

    const admins = await this.prisma.user.count({ where: { role: "ADMIN" } });
    if (admins <= 1) {
      throw new ForbiddenException({ code: "LAST_ADMIN", message: "Can't remove the last admin." });
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: "USER" },
      select: { id: true, role: true },
    });
  }

  async setStatus(actorId: string, userId: string, status: AccountStatus) {
    this.assertNotSelf(actorId, userId);
    const account = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!account) throw new NotFoundException({ code: "USER_NOT_FOUND", message: "Account not found." });
    if (status === "SUSPENDED" && account.role === "ADMIN") await this.assertNotLastAdmin();

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: userId }, data: { status } });
      if (status === "SUSPENDED") await tx.session.deleteMany({ where: { userId } });
    });
    return { id: userId, status };
  }

  async removeAccount(actorId: string, userId: string) {
    this.assertNotSelf(actorId, userId);
    const account = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!account) throw new NotFoundException({ code: "USER_NOT_FOUND", message: "Account not found." });
    if (account.role === "ADMIN") await this.assertNotLastAdmin();

    const recordings = await this.prisma.voiceRecording.findMany({ where: { userId }, select: { objectKey: true } });
    if (recordings.length) await this.storage.removeMany(recordings.map((recording) => recording.objectKey));
    await this.prisma.user.delete({ where: { id: userId } });
  }

  private assertNotSelf(actorId: string, userId: string) {
    if (actorId === userId) {
      throw new ForbiddenException({ code: "SELF_ACTION", message: "You can't change your own account this way." });
    }
  }

  private async assertNotLastAdmin() {
    const admins = await this.prisma.user.count({ where: { role: "ADMIN" } });
    if (admins <= 1) {
      throw new ForbiddenException({ code: "LAST_ADMIN", message: "Can't change the last admin." });
    }
  }
}

import { Controller, Delete, Get, HttpCode, Query } from "@nestjs/common";
import { Session } from "@thallesp/nestjs-better-auth";
import { ActivityService } from "../activity/activity.service";
import { DATE_RE, toDateString } from "../common/dates";
import type { UserSession } from "../common/session";
import { env } from "../config/env";
import { PremiumService } from "../premium/premium.service";
import { PrismaService } from "../prisma/prisma.service";
import { StorageService } from "../storage/storage.service";

@Controller("me")
export class MeController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly premium: PremiumService,
    private readonly activity: ActivityService,
    private readonly storage: StorageService,
  ) {}

  @Get()
  async me(@Session() session: UserSession, @Query("date") date?: string) {
    const userId = session.user.id;
    const today = date && DATE_RE.test(date) ? date : toDateString(new Date());
    const [isPremium, streak, customCount, favoritesCount, account] = await Promise.all([
      this.premium.isPremium(userId),
      this.activity.getStreak(userId, today),
      this.prisma.customAffirmation.count({ where: { userId } }),
      this.prisma.favorite.count({ where: { userId } }),
      this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
    ]);
    return {
      user: { id: userId, name: session.user.name, email: session.user.email, image: session.user.image },
      role: account?.role ?? "USER",
      isPremium,
      streak,
      limits: { customAffirmations: isPremium ? null : env.FREE_CUSTOM_AFFIRMATION_LIMIT },
      counts: { customAffirmations: customCount, favorites: favoritesCount },
    };
  }

  @Delete()
  @HttpCode(204)
  async deleteAccount(@Session() session: UserSession) {
    const userId = session.user.id;
    const recordings = await this.prisma.voiceRecording.findMany({ where: { userId }, select: { objectKey: true } });
    if (recordings.length) await this.storage.removeMany(recordings.map((r) => r.objectKey));
    await this.prisma.user.delete({ where: { id: userId } });
  }
}

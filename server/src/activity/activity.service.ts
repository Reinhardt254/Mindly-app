import { Injectable } from "@nestjs/common";
import { addDays } from "../common/dates";
import { PrismaService } from "../prisma/prisma.service";

export interface ActivityIncrements {
  viewed?: number;
  liked?: number;
  shared?: number;
  practiceSessions?: number;
}

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async checkin(userId: string, date: string, inc: ActivityIncrements = {}) {
    await this.prisma.activityDay.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, ...inc },
      update: {
        viewed: { increment: inc.viewed ?? 0 },
        liked: { increment: inc.liked ?? 0 },
        shared: { increment: inc.shared ?? 0 },
        practiceSessions: { increment: inc.practiceSessions ?? 0 },
      },
    });
    return this.touchStreak(userId, date);
  }

  /** Streak counts consecutive calendar days with any activity. */
  async touchStreak(userId: string, date: string) {
    const stats = await this.prisma.userStats.findUnique({ where: { userId } });
    if (stats?.lastActiveDate && stats.lastActiveDate >= date) return this.getStreak(userId, date);

    const continues = stats?.lastActiveDate === addDays(date, -1);
    const currentStreak = continues ? (stats?.currentStreak ?? 0) + 1 : 1;
    const longestStreak = Math.max(currentStreak, stats?.longestStreak ?? 0);

    await this.prisma.userStats.upsert({
      where: { userId },
      create: { userId, currentStreak, longestStreak, lastActiveDate: date },
      update: { currentStreak, longestStreak, lastActiveDate: date },
    });
    return { currentStreak, longestStreak, lastActiveDate: date };
  }

  /** Current streak as seen on `today`: broken if the last active day is older than yesterday. */
  async getStreak(userId: string, today: string) {
    const stats = await this.prisma.userStats.findUnique({ where: { userId } });
    if (!stats) return { currentStreak: 0, longestStreak: 0, lastActiveDate: null };
    const alive = stats.lastActiveDate !== null && stats.lastActiveDate >= addDays(today, -1);
    return {
      currentStreak: alive ? stats.currentStreak : 0,
      longestStreak: stats.longestStreak,
      lastActiveDate: stats.lastActiveDate,
    };
  }

  /** Rebuild the streak from the full set of active dates (used on import). */
  async recomputeFromDays(userId: string) {
    const days = await this.prisma.activityDay.findMany({
      where: { userId },
      select: { date: true },
      orderBy: { date: "asc" },
    });
    let current = 0;
    let longest = 0;
    let prev: string | null = null;
    for (const { date } of days) {
      current = prev && addDays(prev, 1) === date ? current + 1 : 1;
      longest = Math.max(longest, current);
      prev = date;
    }
    await this.prisma.userStats.upsert({
      where: { userId },
      create: { userId, currentStreak: current, longestStreak: longest, lastActiveDate: prev },
      update: { currentStreak: current, longestStreak: longest, lastActiveDate: prev },
    });
  }
}

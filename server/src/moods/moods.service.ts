import { Injectable } from "@nestjs/common";
import { Mood } from "../../prisma/content";
import { ActivityService } from "../activity/activity.service";
import { AffirmationsService } from "../affirmations/affirmations.service";
import { addDays, toDateString } from "../common/dates";
import { PrismaService } from "../prisma/prisma.service";

export const MOOD_SCORES: Record<Mood, number> = {
  happy: 5,
  grateful: 5,
  calm: 4,
  tired: 2,
  stressed: 2,
  anxious: 1,
  sad: 1,
  angry: 1,
};

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
}

@Injectable()
export class MoodsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly affirmations: AffirmationsService,
    private readonly activity: ActivityService,
  ) {}

  async checkin(userId: string, mood: Mood, date: string, note?: string) {
    const affirmation =
      (await this.affirmations.random(userId, { mood })) ?? (await this.affirmations.random(userId, {}));
    const entry = await this.prisma.moodEntry.create({
      data: { userId, mood, note, affirmationId: affirmation?.id },
    });
    const streak = await this.activity.checkin(userId, date);
    return { entry, affirmation, streak };
  }

  recent(userId: string, limit: number) {
    return this.prisma.moodEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /** `tzOffsetMinutes` is the client's Date#getTimezoneOffset(), used to bucket entries by local day. */
  async insights(userId: string, range: "week" | "month", today: string, tzOffsetMinutes: number) {
    const days = range === "week" ? 7 : 30;
    const from = addDays(today, -(days - 1));
    const prevFrom = addDays(from, -days);
    const localDate = (d: Date) => toDateString(new Date(d.getTime() - tzOffsetMinutes * 60_000));
    const utcStart = (date: string) => new Date(new Date(`${date}T00:00:00Z`).getTime() + tzOffsetMinutes * 60_000);

    const [entries, prevEntries, activityDays, favorites, streak] = await Promise.all([
      this.prisma.moodEntry.findMany({
        where: { userId, createdAt: { gte: utcStart(from) } },
        orderBy: { createdAt: "asc" },
      }),
      this.prisma.moodEntry.findMany({
        where: { userId, createdAt: { gte: utcStart(prevFrom), lt: utcStart(from) } },
        select: { mood: true },
      }),
      this.prisma.activityDay.findMany({ where: { userId, date: { gte: from, lte: today } } }),
      this.prisma.favorite.findMany({
        where: { userId, createdAt: { gte: utcStart(from) } },
        select: { affirmation: { select: { categoryId: true } } },
      }),
      this.activity.getStreak(userId, today),
    ]);

    const score = (m: string) => MOOD_SCORES[m as Mood] ?? 3;

    const moodCounts: Record<string, number> = {};
    for (const e of entries) moodCounts[e.mood] = (moodCounts[e.mood] ?? 0) + 1;

    const byDay = new Map<string, string[]>();
    for (const e of entries) {
      const key = localDate(e.createdAt);
      byDay.set(key, [...(byDay.get(key) ?? []), e.mood]);
    }
    const daily = Array.from({ length: days }, (_, i) => {
      const date = addDays(from, i);
      const moods = byDay.get(date) ?? [];
      const counts: Record<string, number> = {};
      for (const m of moods) counts[m] = (counts[m] ?? 0) + 1;
      const topMood = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
      return { date, count: moods.length, averageScore: average(moods.map(score)), topMood };
    });

    const matchedIds = entries.map((e) => e.affirmationId).filter((id): id is string => !!id);
    const matched = matchedIds.length
      ? await this.prisma.affirmation.findMany({ where: { id: { in: matchedIds } }, select: { id: true, categoryId: true } })
      : [];
    const categoryOf = new Map(matched.map((a) => [a.id, a.categoryId]));
    const themeCounts: Record<string, number> = {};
    for (const id of matchedIds) {
      const c = categoryOf.get(id);
      if (c) themeCounts[c] = (themeCounts[c] ?? 0) + 1;
    }
    for (const f of favorites) themeCounts[f.affirmation.categoryId] = (themeCounts[f.affirmation.categoryId] ?? 0) + 1;
    const categories = await this.prisma.category.findMany({
      where: { id: { in: Object.keys(themeCounts) } },
      select: { id: true, name: true, color: true, icon: true },
    });
    const topThemes = categories
      .map((c) => ({ ...c, count: themeCounts[c.id] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const sum = (k: "viewed" | "liked" | "shared" | "practiceSessions") =>
      activityDays.reduce((acc, d) => acc + d[k], 0);

    return {
      range,
      from,
      to: today,
      totalCheckins: entries.length,
      moodCounts,
      averageScore: average(entries.map((e) => score(e.mood))),
      previousAverageScore: average(prevEntries.map((e) => score(e.mood))),
      daily,
      topThemes,
      activity: {
        activeDays: activityDays.length,
        dates: activityDays.map((d) => d.date).sort(),
        viewed: sum("viewed"),
        liked: sum("liked"),
        shared: sum("shared"),
        practiceSessions: sum("practiceSessions"),
      },
      streak,
    };
  }
}

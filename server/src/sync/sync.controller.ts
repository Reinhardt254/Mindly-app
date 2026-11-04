import { Body, Controller, Post } from "@nestjs/common";
import { Session } from "@thallesp/nestjs-better-auth";
import { z } from "zod";
import { ActivityService } from "../activity/activity.service";
import { DATE_RE } from "../common/dates";
import type { UserSession } from "../common/session";
import { ZodPipe } from "../common/zod.pipe";
import { PrismaService } from "../prisma/prisma.service";

const n = z.number().int().min(0).max(100_000).default(0);
const importSchema = z.object({
  customAffirmations: z
    .array(
      z.object({
        clientId: z.string().max(100),
        text: z.string().trim().min(1).max(1000),
        isEnabled: z.boolean().default(true),
        createdAt: z.coerce.date().optional(),
      }),
    )
    .max(500)
    .default([]),
  favoriteAffirmationIds: z.array(z.string().max(100)).max(1000).default([]),
  activity: z
    .array(
      z.object({
        date: z.string().regex(DATE_RE),
        viewed: n,
        liked: n,
        shared: n,
        practiceSessions: n,
      }),
    )
    .max(3660)
    .default([]),
});

type ImportBody = z.infer<typeof importSchema>;

/** One-time upload of data created while the app was offline-only. Idempotent. */
@Controller("sync")
export class SyncController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activity: ActivityService,
  ) {}

  @Post("import")
  async import(@Session() session: UserSession, @Body(new ZodPipe(importSchema)) body: ImportBody) {
    const userId = session.user.id;

    // Pre-existing local custom affirmations are kept regardless of the free-tier cap.
    for (const c of body.customAffirmations) {
      await this.prisma.customAffirmation.upsert({
        where: { userId_clientId: { userId, clientId: c.clientId } },
        create: { userId, clientId: c.clientId, text: c.text, isEnabled: c.isEnabled, createdAt: c.createdAt },
        update: {},
      });
    }

    const knownIds = await this.prisma.affirmation.findMany({
      where: { id: { in: body.favoriteAffirmationIds } },
      select: { id: true },
    });
    if (knownIds.length) {
      await this.prisma.favorite.createMany({
        data: knownIds.map(({ id }) => ({ userId, affirmationId: id })),
        skipDuplicates: true,
      });
    }

    for (const day of body.activity) {
      const { date, ...counts } = day;
      await this.prisma.activityDay.upsert({
        where: { userId_date: { userId, date } },
        create: { userId, date, ...counts },
        update: {},
      });
    }
    if (body.activity.length) await this.activity.recomputeFromDays(userId);

    return {
      customAffirmations: body.customAffirmations.length,
      favorites: knownIds.length,
      activityDays: body.activity.length,
    };
  }
}

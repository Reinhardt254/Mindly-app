import { BadRequestException, Body, Controller, Get, Post, Query } from "@nestjs/common";
import { Session } from "@thallesp/nestjs-better-auth";
import { z } from "zod";
import { MOODS } from "../../prisma/content";
import { DATE_RE, isPlausibleClientDate, toDateString } from "../common/dates";
import type { UserSession } from "../common/session";
import { ZodPipe } from "../common/zod.pipe";
import { Premium } from "../premium/premium.guard";
import { MoodsService } from "./moods.service";

const checkinSchema = z.object({
  mood: z.enum(MOODS),
  note: z.string().trim().max(1000).optional(),
  date: z.string().regex(DATE_RE),
});

const insightsQuery = z.object({
  range: z.enum(["week", "month"]).default("week"),
  today: z.string().regex(DATE_RE).optional(),
  tz: z.coerce.number().int().min(-840).max(840).default(0),
});

@Controller("moods")
export class MoodsController {
  constructor(private readonly moods: MoodsService) {}

  @Post()
  checkin(@Session() session: UserSession, @Body(new ZodPipe(checkinSchema)) body: z.infer<typeof checkinSchema>) {
    if (!isPlausibleClientDate(body.date)) throw new BadRequestException("Date out of range");
    return this.moods.checkin(session.user.id, body.mood, body.date, body.note);
  }

  @Get("recent")
  recent(@Session() session: UserSession) {
    return this.moods.recent(session.user.id, 7);
  }

  @Get("insights")
  @Premium()
  insights(@Session() session: UserSession, @Query(new ZodPipe(insightsQuery)) q: z.infer<typeof insightsQuery>) {
    return this.moods.insights(session.user.id, q.range, q.today ?? toDateString(new Date()), q.tz);
  }
}

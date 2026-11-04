import { BadRequestException, Body, Controller, Get, Post, Query } from "@nestjs/common";
import { Session } from "@thallesp/nestjs-better-auth";
import { z } from "zod";
import { DATE_RE, isPlausibleClientDate, toDateString } from "../common/dates";
import type { UserSession } from "../common/session";
import { ZodPipe } from "../common/zod.pipe";
import { ActivityService } from "./activity.service";

const count = z.number().int().min(0).max(500).optional();
const checkinSchema = z.object({
  date: z.string().regex(DATE_RE),
  viewed: count,
  liked: count,
  shared: count,
  practiceSessions: count,
});

@Controller("activity")
export class ActivityController {
  constructor(private readonly activity: ActivityService) {}

  @Post("checkin")
  checkin(@Session() session: UserSession, @Body(new ZodPipe(checkinSchema)) body: z.infer<typeof checkinSchema>) {
    if (!isPlausibleClientDate(body.date)) throw new BadRequestException("Date out of range");
    const { date, ...inc } = body;
    return this.activity.checkin(session.user.id, date, inc);
  }

  @Get("streak")
  streak(@Session() session: UserSession, @Query("date") date?: string) {
    const today = date && DATE_RE.test(date) ? date : toDateString(new Date());
    return this.activity.getStreak(session.user.id, today);
  }
}

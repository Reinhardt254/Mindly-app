import { Controller, Get, Query } from "@nestjs/common";
import { OptionalAuth, Session } from "@thallesp/nestjs-better-auth";
import { z } from "zod";
import { DATE_RE, toDateString } from "../common/dates";
import type { UserSession } from "../common/session";
import { ZodPipe } from "../common/zod.pipe";
import { AffirmationsService } from "./affirmations.service";

const listQuery = z.object({
  category: z.string().max(50).optional(),
  mood: z.string().max(30).optional(),
  lang: z.string().max(10).optional(),
});

const dailyQuery = z.object({
  date: z.string().regex(DATE_RE).optional(),
  lang: z.string().max(10).optional(),
});

@Controller("affirmations")
@OptionalAuth()
export class AffirmationsController {
  constructor(private readonly affirmations: AffirmationsService) {}

  @Get("categories")
  categories(@Session() session?: UserSession) {
    return this.affirmations.categories(session?.user.id);
  }

  @Get("daily")
  daily(
    @Query(new ZodPipe(dailyQuery)) query: z.infer<typeof dailyQuery>,
    @Session() session?: UserSession,
  ) {
    return this.affirmations.daily(session?.user.id, query.date ?? toDateString(new Date()), query.lang);
  }

  @Get()
  list(
    @Query(new ZodPipe(listQuery)) query: z.infer<typeof listQuery>,
    @Session() session?: UserSession,
  ) {
    return this.affirmations.list(session?.user.id, query);
  }
}

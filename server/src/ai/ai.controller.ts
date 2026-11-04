import { Body, Controller, Get, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { Session } from "@thallesp/nestjs-better-auth";
import { z } from "zod";
import type { UserSession } from "../common/session";
import { ZodPipe } from "../common/zod.pipe";
import { Premium } from "../premium/premium.guard";
import { AiService } from "./ai.service";

const generateSchema = z.object({
  situation: z.string().trim().min(3).max(500),
  lang: z.string().max(20).default("English"),
});

@Controller("ai")
@Premium()
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Get("usage")
  usage(@Session() session: UserSession) {
    return this.ai.usage(session.user.id);
  }

  @Post("affirmations")
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  generate(@Session() session: UserSession, @Body(new ZodPipe(generateSchema)) body: z.infer<typeof generateSchema>) {
    return this.ai.generate(session.user.id, body.situation, body.lang);
  }
}

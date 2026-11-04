import { Body, Controller, Headers, HttpCode, Post, UnauthorizedException } from "@nestjs/common";
import { AllowAnonymous, Session } from "@thallesp/nestjs-better-auth";
import { SkipThrottle } from "@nestjs/throttler";
import { timingSafeEqual } from "crypto";
import { env } from "../config/env";
import type { UserSession } from "../common/session";
import { BillingService, RevenueCatEvent } from "./billing.service";

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

@Controller()
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Post("billing/refresh")
  @HttpCode(200)
  async refresh(@Session() session: UserSession) {
    return { isPremium: await this.billing.refresh(session.user.id) };
  }

  @Post("webhooks/revenuecat")
  @AllowAnonymous()
  @SkipThrottle()
  @HttpCode(200)
  async webhook(@Headers("authorization") authorization: string | undefined, @Body() body: { event?: RevenueCatEvent }) {
    const secret = env.REVENUECAT_WEBHOOK_SECRET;
    const provided = (authorization ?? "").replace(/^Bearer\s+/i, "");
    if (!secret || !safeEqual(provided, secret)) throw new UnauthorizedException();
    if (body.event) await this.billing.handleEvent(body.event);
    return { ok: true };
  }
}

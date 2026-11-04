import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { Session } from "@thallesp/nestjs-better-auth";
import { z } from "zod";
import { env } from "../config/env";
import type { UserSession } from "../common/session";
import { ZodPipe } from "../common/zod.pipe";
import { PremiumService } from "../premium/premium.service";
import { PrismaService } from "../prisma/prisma.service";

const createSchema = z.object({
  text: z.string().trim().min(1).max(1000),
  clientId: z.string().max(100).optional(),
  source: z.enum(["user", "ai"]).default("user"),
});

const updateSchema = z.object({
  text: z.string().trim().min(1).max(1000).optional(),
  isEnabled: z.boolean().optional(),
});

@Controller("custom-affirmations")
export class CustomAffirmationsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly premium: PremiumService,
  ) {}

  @Get()
  async list(@Session() session: UserSession) {
    const [items, isPremium] = await Promise.all([
      this.prisma.customAffirmation.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      }),
      this.premium.isPremium(session.user.id),
    ]);
    return {
      items,
      limit: isPremium ? null : env.FREE_CUSTOM_AFFIRMATION_LIMIT,
    };
  }

  @Post()
  async create(@Session() session: UserSession, @Body(new ZodPipe(createSchema)) body: z.infer<typeof createSchema>) {
    const userId = session.user.id;
    if (body.clientId) {
      const existing = await this.prisma.customAffirmation.findUnique({
        where: { userId_clientId: { userId, clientId: body.clientId } },
      });
      if (existing) return existing;
    }
    if (!(await this.premium.isPremium(userId))) {
      const count = await this.prisma.customAffirmation.count({ where: { userId } });
      if (count >= env.FREE_CUSTOM_AFFIRMATION_LIMIT) {
        throw new ForbiddenException({
          code: "PREMIUM_REQUIRED",
          message: `Free accounts can save up to ${env.FREE_CUSTOM_AFFIRMATION_LIMIT} custom affirmations`,
        });
      }
    }
    return this.prisma.customAffirmation.create({ data: { userId, ...body } });
  }

  @Patch(":id")
  async update(
    @Session() session: UserSession,
    @Param("id") id: string,
    @Body(new ZodPipe(updateSchema)) body: z.infer<typeof updateSchema>,
  ) {
    const { count } = await this.prisma.customAffirmation.updateMany({
      where: { id, userId: session.user.id },
      data: body,
    });
    if (!count) throw new NotFoundException();
    return this.prisma.customAffirmation.findUnique({ where: { id } });
  }

  @Delete(":id")
  @HttpCode(204)
  async remove(@Session() session: UserSession, @Param("id") id: string) {
    await this.prisma.customAffirmation.deleteMany({ where: { id, userId: session.user.id } });
  }
}

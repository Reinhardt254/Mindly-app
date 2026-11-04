import { Injectable } from "@nestjs/common";
import { env } from "../config/env";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PremiumService {
  constructor(private readonly prisma: PrismaService) {}

  async isPremium(userId: string): Promise<boolean> {
    const entitlement = await this.prisma.entitlement.findUnique({
      where: {
        userId_entitlementId: { userId, entitlementId: env.REVENUECAT_ENTITLEMENT_ID },
      },
    });
    if (!entitlement?.isActive) return false;
    return !entitlement.expiresAt || entitlement.expiresAt > new Date();
  }
}

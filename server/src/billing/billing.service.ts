import { Injectable, Logger } from "@nestjs/common";
import { env } from "../config/env";
import { PremiumService } from "../premium/premium.service";
import { PrismaService } from "../prisma/prisma.service";

export interface RevenueCatEvent {
  type: string;
  app_user_id?: string;
  original_app_user_id?: string;
  aliases?: string[];
  transferred_from?: string[];
  transferred_to?: string[];
  product_id?: string;
  entitlement_ids?: string[] | null;
  expiration_at_ms?: number | null;
}

const GRANT_EVENTS = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "NON_RENEWING_PURCHASE",
  "UNCANCELLATION",
  "PRODUCT_CHANGE",
  "SUBSCRIPTION_EXTENDED",
  "TEMPORARY_ENTITLEMENT_GRANT",
]);

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly premium: PremiumService,
  ) {}

  async handleEvent(event: RevenueCatEvent) {
    const candidates = new Set(
      [event.app_user_id, event.original_app_user_id, ...(event.aliases ?? []), ...(event.transferred_from ?? []), ...(event.transferred_to ?? [])]
        .filter((id): id is string => !!id && !id.startsWith("$RCAnonymousID")),
    );
    const users = await this.prisma.user.findMany({ where: { id: { in: [...candidates] } }, select: { id: true } });

    for (const { id } of users) {
      if (env.REVENUECAT_SECRET_API_KEY) {
        await this.refresh(id);
      } else {
        await this.applyEvent(id, event);
      }
    }
  }

  /** Source of truth: ask RevenueCat for the subscriber's current entitlements. */
  async refresh(userId: string): Promise<boolean> {
    if (!env.REVENUECAT_SECRET_API_KEY) return this.premium.isPremium(userId);

    const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Bearer ${env.REVENUECAT_SECRET_API_KEY}` },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      this.logger.error(`RevenueCat lookup failed for ${userId}: ${res.status}`);
      return this.premium.isPremium(userId);
    }
    const data = (await res.json()) as {
      subscriber?: { entitlements?: Record<string, { expires_date: string | null; product_identifier?: string }> };
    };
    const ent = data.subscriber?.entitlements?.[env.REVENUECAT_ENTITLEMENT_ID];
    const expiresAt = ent?.expires_date ? new Date(ent.expires_date) : null;
    const isActive = !!ent && (!expiresAt || expiresAt > new Date());
    await this.save(userId, isActive, expiresAt, ent?.product_identifier);
    return isActive;
  }

  private async applyEvent(userId: string, event: RevenueCatEvent) {
    const entitlements = event.entitlement_ids ?? [];
    if (entitlements.length && !entitlements.includes(env.REVENUECAT_ENTITLEMENT_ID)) return;
    const expiresAt = event.expiration_at_ms ? new Date(event.expiration_at_ms) : null;

    if (GRANT_EVENTS.has(event.type)) {
      await this.save(userId, true, expiresAt, event.product_id);
    } else if (event.type === "EXPIRATION") {
      await this.save(userId, false, expiresAt, event.product_id);
    } else if (event.type === "TRANSFER" && event.transferred_from?.includes(userId)) {
      await this.save(userId, false, null, event.product_id);
    }
  }

  private async save(userId: string, isActive: boolean, expiresAt: Date | null, productId?: string) {
    await this.prisma.entitlement.upsert({
      where: { userId_entitlementId: { userId, entitlementId: env.REVENUECAT_ENTITLEMENT_ID } },
      create: { userId, entitlementId: env.REVENUECAT_ENTITLEMENT_ID, isActive, expiresAt, productId },
      update: { isActive, expiresAt, productId },
    });
    await this.prisma.user.update({ where: { id: userId }, data: { isPremium: isActive } });
  }
}

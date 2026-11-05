import { Module } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { ActivityModule } from "./activity/activity.module";
import { AdminModule } from "./admin/admin.module";
import { AffirmationsModule } from "./affirmations/affirmations.module";
import { AiModule } from "./ai/ai.module";
import { AccountStatusInterceptor } from "./auth/account-status.interceptor";
import { auth } from "./auth/auth";
import { BillingModule } from "./billing/billing.module";
import { CustomAffirmationsModule } from "./custom-affirmations/custom-affirmations.module";
import { FavoritesModule } from "./favorites/favorites.module";
import { HealthController } from "./health.controller";
import { MeModule } from "./me/me.module";
import { MoodsModule } from "./moods/moods.module";
import { PremiumModule } from "./premium/premium.module";
import { PrismaModule } from "./prisma/prisma.module";
import { StorageModule } from "./storage/storage.module";
import { SyncModule } from "./sync/sync.module";
import { VoiceModule } from "./voice/voice.module";

@Module({
  imports: [
    AuthModule.forRoot({
      auth,
      bodyParser: { json: { limit: "1mb" }, urlencoded: { limit: "1mb", extended: true } },
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    PremiumModule,
    StorageModule,
    AffirmationsModule,
    FavoritesModule,
    CustomAffirmationsModule,
    ActivityModule,
    MoodsModule,
    SyncModule,
    MeModule,
    AiModule,
    VoiceModule,
    BillingModule,
    AdminModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: AccountStatusInterceptor },
  ],
})
export class AppModule {}

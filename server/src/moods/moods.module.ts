import { Module } from "@nestjs/common";
import { ActivityModule } from "../activity/activity.module";
import { AffirmationsModule } from "../affirmations/affirmations.module";
import { MoodsController } from "./moods.controller";
import { MoodsService } from "./moods.service";

@Module({
  imports: [AffirmationsModule, ActivityModule],
  controllers: [MoodsController],
  providers: [MoodsService],
})
export class MoodsModule {}

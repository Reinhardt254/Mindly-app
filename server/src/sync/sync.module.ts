import { Module } from "@nestjs/common";
import { ActivityModule } from "../activity/activity.module";
import { SyncController } from "./sync.controller";

@Module({
  imports: [ActivityModule],
  controllers: [SyncController],
})
export class SyncModule {}

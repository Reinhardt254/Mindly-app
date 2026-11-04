import { Module } from "@nestjs/common";
import { ActivityModule } from "../activity/activity.module";
import { MeController } from "./me.controller";

@Module({
  imports: [ActivityModule],
  controllers: [MeController],
})
export class MeModule {}

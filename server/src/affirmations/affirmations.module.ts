import { Module } from "@nestjs/common";
import { AffirmationsController } from "./affirmations.controller";
import { AffirmationsService } from "./affirmations.service";

@Module({
  controllers: [AffirmationsController],
  providers: [AffirmationsService],
  exports: [AffirmationsService],
})
export class AffirmationsModule {}

import { Module } from "@nestjs/common";
import { CustomAffirmationsController } from "./custom-affirmations.controller";

@Module({ controllers: [CustomAffirmationsController] })
export class CustomAffirmationsModule {}

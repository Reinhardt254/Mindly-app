import { Module } from "@nestjs/common";
import { AdminBootstrap } from "./admin.bootstrap";
import { AdminContentService } from "./admin-content.service";
import { AdminController } from "./admin.controller";
import { AdminGuard } from "./admin.guard";
import { AdminService } from "./admin.service";

@Module({
  controllers: [AdminController],
  providers: [AdminService, AdminContentService, AdminGuard, AdminBootstrap],
})
export class AdminModule {}

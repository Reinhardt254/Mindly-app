import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { env } from "../config/env";
import { PrismaService } from "../prisma/prisma.service";

/** Grants admin to accounts whose email is listed in ADMIN_EMAILS. */
@Injectable()
export class AdminBootstrap implements OnModuleInit {
  private readonly logger = new Logger(AdminBootstrap.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    if (!env.ADMIN_EMAILS.length) return;
    const result = await this.prisma.user.updateMany({
      where: { email: { in: env.ADMIN_EMAILS, mode: "insensitive" }, role: { not: "ADMIN" } },
      data: { role: "ADMIN" },
    });
    if (result.count) this.logger.log(`Granted admin to ${result.count} account(s) from ADMIN_EMAILS`);
  }
}

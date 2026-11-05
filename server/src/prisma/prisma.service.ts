import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "../generated/prisma/client";
import { prismaAdapterOptions } from "./client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    super(prismaAdapterOptions());
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

/** Shared by Nest and Better Auth so the app uses a single connection pool. */
export const prisma = new PrismaService();

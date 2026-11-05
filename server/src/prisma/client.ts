import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

/** node-pg treats sslmode=require as full certificate verification. Prisma 6 did not. */
function poolConfig(connectionString: string) {
  const url = new URL(connectionString);
  const sslmode = url.searchParams.get("sslmode");
  url.searchParams.delete("sslmode");
  if (!sslmode || sslmode === "disable") return { connectionString: url.toString() };
  const verify = sslmode === "verify-full" || sslmode === "verify-ca";
  return { connectionString: url.toString(), ssl: { rejectUnauthorized: verify } };
}

export function prismaAdapterOptions() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  return { adapter: new PrismaPg(poolConfig(connectionString)) };
}

export function createPrismaClient() {
  return new PrismaClient(prismaAdapterOptions());
}

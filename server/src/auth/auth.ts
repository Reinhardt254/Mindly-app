import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { env } from "../config/env";
import { prisma } from "../prisma/prisma.service";

const trustedOrigins = [
  `${env.APP_SCHEME}://`,
  ...env.TRUSTED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean),
];
if (env.NODE_ENV !== "production") {
  trustedOrigins.push("exp://");
}

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  socialProviders:
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {},
  user: {
    additionalFields: {
      isPremium: { type: "boolean", defaultValue: false, input: false },
      role: { type: "string", defaultValue: "USER", input: false },
      status: { type: "string", defaultValue: "ACTIVE", input: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const email = String(user.email ?? "").toLowerCase();
          if (email && env.ADMIN_EMAILS.includes(email)) {
            return { data: { ...user, role: "ADMIN", status: "ACTIVE" } };
          }
          return { data: { ...user, status: user.status ?? "ACTIVE" } };
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          if (!session.userId) return;
          const account = await prisma.user.findUnique({ where: { id: session.userId }, select: { status: true } });
          if (account?.status === "SUSPENDED") {
            throw new APIError("FORBIDDEN", { message: "This account is suspended." });
          }
        },
      },
    },
  },
  plugins: [expo()],
});

export type Auth = typeof auth;

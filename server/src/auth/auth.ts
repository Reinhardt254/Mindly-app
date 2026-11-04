import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
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
    },
  },
  plugins: [expo()],
});

export type Auth = typeof auth;

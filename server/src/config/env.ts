import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),

  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  APP_SCHEME: z.string().default("moodly"),
  TRUSTED_ORIGINS: z.string().default(""),

  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),

  DEEPSEEK_API_KEY: z.string().default(""),
  DEEPSEEK_BASE_URL: z.string().url().default("https://api.deepseek.com"),
  DEEPSEEK_MODEL: z.string().default("deepseek-chat"),
  AI_DAILY_LIMIT: z.coerce.number().int().positive().default(20),

  S3_ENDPOINT: z.string().url(),
  S3_REGION: z.string().default("us-east-1"),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_BUCKET: z.string().default("moodly"),

  REVENUECAT_WEBHOOK_SECRET: z.string().default(""),
  REVENUECAT_SECRET_API_KEY: z.string().default(""),
  REVENUECAT_ENTITLEMENT_ID: z.string().default("premium"),

  FREE_CUSTOM_AFFIRMATION_LIMIT: z.coerce.number().int().nonnegative().default(5),
});

export type Env = z.infer<typeof schema>;

export const env: Env = schema.parse(process.env);

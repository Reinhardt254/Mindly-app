CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

ALTER TABLE "user" ADD COLUMN "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE "category" ADD COLUMN "imageKey" TEXT;

ALTER TABLE "affirmation" ADD COLUMN "imageKey" TEXT;

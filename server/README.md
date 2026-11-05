# Moodly API

NestJS + Prisma (Postgres) + Better Auth + SeaweedFS + DeepSeek + RevenueCat.

## Local development

```bash
cd server
npm install
cp .env.example .env        # fill in DATABASE_URL, BETTER_AUTH_SECRET, S3_* ...
npx prisma migrate deploy
npm run seed
npm run start:dev
node scripts/smoke.mjs      # end-to-end check against http://localhost:3000
```

Voice uploads need a SeaweedFS S3 gateway on port 8333 (the defaults in `.env.example`):

```bash
docker run -d --name seaweedfs -p 8333:8333 -e AWS_ACCESS_KEY_ID=admin -e AWS_SECRET_ACCESS_KEY=secret -e S3_BUCKET=moodly chrislusf/seaweedfs
```

Affirmation content lives in `prisma/content.ts`. After editing it, run `npm run seed` (server) and
`npm run export-content` (regenerates the app's offline copy in `../app/constants/affirmationContent.json`).

Schema changes: edit `prisma/schema.prisma`, then `npx prisma migrate dev --name <change>` against a dev database.

## Deploying on Coolify

All three resources go in the same Coolify project so they share the internal Docker network.

### 1. Postgres

1. **+ New > Database > PostgreSQL 16**, name it `moodly-postgres`.
2. Copy the **Postgres URL (internal)**; this becomes `DATABASE_URL` (append `?schema=public`).
3. Enable scheduled backups (S3 destination) under **Backups**.

### 2. SeaweedFS (file storage)

1. **+ New > Service > SeaweedFS**.
2. Assign a public domain to the **S3** port (`8333`), e.g. `https://s3.yourdomain.com`. Leave the admin UI (`23646`) on its own domain or private.
   The S3 domain must be public because the app uploads and plays voice recordings via presigned URLs.
3. Copy the generated S3 user and password (`SERVICE_USER_S3` / `SERVICE_PASSWORD_S3`) into `S3_ACCESS_KEY` and `S3_SECRET_KEY`.
   The API creates the private bucket `moodly` on startup.
4. Coolify's default S3 config allows anonymous reads. Open the service compose file and delete the `anonymous` identity from `base-config.json`, leaving only `admin`, then redeploy. Voice files stay readable only through URLs the API signs.

### 3. API

1. **+ New > Application > Public/Private Git repository**, select this repo.
2. Build pack **Dockerfile**. Leave the base directory empty so Coolify uses the Dockerfile at the repo root. Port `3000`.
3. Domain: `https://api.yourdomain.com`.
4. Environment variables (see `.env.example`):

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | internal Postgres URL from step 1 |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | `https://api.yourdomain.com` |
| `APP_SCHEME` | `moodly` (must match `scheme` in `app.json`) |
| `ADMIN_EMAILS` | comma-separated emails that start as admins |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google Cloud OAuth **Web** client |
| `DEEPSEEK_API_KEY` | from platform.deepseek.com |
| `S3_ENDPOINT` | public SeaweedFS S3 URL from step 2, e.g. `https://s3.yourdomain.com` |
| `S3_ACCESS_KEY` / `S3_SECRET_KEY` / `S3_BUCKET` | S3 user, S3 password, and `moodly` |
| `REVENUECAT_WEBHOOK_SECRET` | any long random string |
| `REVENUECAT_SECRET_API_KEY` | RevenueCat secret key (`sk_...`) |

5. Deploy. On every start the container runs `prisma migrate deploy`, upserts the seed content, then starts the API.
   Health check: `GET /health`.

### Google sign-in

In Google Cloud Console create an OAuth client of type **Web application** with the authorized redirect URI
`https://api.yourdomain.com/api/auth/callback/google`. Better Auth runs the OAuth flow in the browser and returns to
the app through the `moodly://` scheme, so no Android/iOS client IDs are needed for this flow.

### RevenueCat

1. Create a project, connect the Google Play app (and App Store if needed).
2. Products: `moodly_monthly`, `moodly_yearly` (7-day free trial configured in Play Console), `moodly_lifetime` (non-consumable).
3. Entitlement `premium` attached to all three; an offering `default` with packages Monthly, Annual, Lifetime.
4. **Integrations > Webhooks**: URL `https://api.yourdomain.com/webhooks/revenuecat`, Authorization header = `REVENUECAT_WEBHOOK_SECRET`.
5. Put the public Android SDK key (`goog_...`) in the app as `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` (and `EXPO_PUBLIC_REVENUECAT_IOS_KEY` for iOS).

## API overview

All routes need a Better Auth session cookie unless noted.

| Route | Notes |
| --- | --- |
| `/api/auth/*` | Better Auth (email/password, Google) |
| `GET /health` | public |
| `GET /me`, `DELETE /me` | profile, premium status, streak; account deletion |
| `GET /affirmations`, `/affirmations/categories`, `/affirmations/daily` | optional auth; premium content only for premium users |
| `GET/PUT/DELETE /favorites/:affirmationId` | |
| `GET/POST/PATCH/DELETE /custom-affirmations` | free accounts capped at `FREE_CUSTOM_AFFIRMATION_LIMIT` |
| `POST /moods`, `GET /moods/recent` | mood check-in returns a matching affirmation |
| `GET /moods/insights?range=week\|month&tz=` | premium |
| `POST /activity/checkin`, `GET /activity/streak` | streak = consecutive local days with activity |
| `POST /sync/import` | one-time upload of pre-account local data (idempotent) |
| `POST /ai/affirmations`, `GET /ai/usage` | premium, DeepSeek, `AI_DAILY_LIMIT` per 24h |
| `POST /voice/upload-url`, `POST/GET /voice`, `DELETE /voice/:id` | premium, SeaweedFS presigned URLs |
| `POST /billing/refresh` | re-check entitlement with RevenueCat after a purchase |
| `POST /webhooks/revenuecat` | public, Authorization header checked |

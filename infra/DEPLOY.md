# Deploying Armoi to Fly.io

The API lives in `infra/`. The Expo app talks to it over HTTPS once
`EXPO_PUBLIC_API_BASE_URL` points at the Fly hostname.

## Prerequisites

- [flyctl](https://fly.io/docs/hands-on/install-flyctl/) logged in
- Google Cloud OAuth client IDs (iOS + Android, optionally Web)
- Apple Developer: App ID `com.armoi.app` with Sign in with Apple enabled

## One-time setup

```bash
cd infra
fly apps create armoi-api          # or reuse the name in fly.toml
fly postgres create --name armoi-db
fly postgres attach armoi-db       # sets DATABASE_URL; map it below
fly storage create                 # Tigris bucket + access keys
```

Set secrets (names match `ARMOI_*` settings):

```bash
fly secrets set \
  ARMOI_DATABASE_URL="postgres://..." \
  ARMOI_JWT_SECRET="$(openssl rand -hex 32)" \
  ARMOI_GOOGLE_CLIENT_IDS="ios-client-id,android-client-id" \
  ARMOI_APPLE_CLIENT_ID="com.armoi.app" \
  ARMOI_MEDIA_BACKEND=s3 \
  ARMOI_S3_ENDPOINT_URL="https://fly.storage.tigris.dev" \
  ARMOI_S3_REGION=auto \
  ARMOI_S3_BUCKET="..." \
  ARMOI_S3_ACCESS_KEY_ID="..." \
  ARMOI_S3_SECRET_ACCESS_KEY="..."
```

`fly.toml` runs `alembic upgrade head` as the release command, so the schema
is applied on every deploy.

## Deploy

```bash
cd infra
fly deploy
curl https://armoi-api.fly.dev/health
```

Or from the repo root: `make deploy`.

## Point the app at Fly

In `mobile/.env` (and EAS secrets for production builds):

```
EXPO_PUBLIC_API_BASE_URL=https://armoi-api.fly.dev
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=….apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=….apps.googleusercontent.com
EXPO_PUBLIC_APPLE_CLIENT_ID=com.armoi.app
```

Apple and Google Sign-In need a **development build / EAS Build** — Expo Go
does not include the native Apple Authentication module.

## Local development

Local `make dev` still uses SQLite + `./media`. Auth requires the same OAuth
client IDs on both sides; without them the API starts but sign-in fails.

Existing single-user SQLite files are incompatible with the multi-user schema
(`user_id` is NOT NULL). Run `make db reset` once to recreate an empty library.

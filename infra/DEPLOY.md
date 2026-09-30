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
fly postgres attach armoi-db       # injects DATABASE_URL (read as a fallback)
fly storage create                 # Tigris: AWS_* + BUCKET_NAME (also fallbacks)
```

The app prefers `ARMOI_*` settings, but also accepts Fly-native
`DATABASE_URL`, `AWS_*`, and `BUCKET_NAME` so those provisioned secrets do
not need to be copied. `fly.toml` already sets `ARMOI_MEDIA_BACKEND=s3`.

Still set auth secrets explicitly:

```bash
fly secrets set \
  ARMOI_JWT_SECRET="$(openssl rand -hex 32)" \
  ARMOI_GOOGLE_CLIENT_IDS="ios-client-id,android-client-id" \
  ARMOI_APPLE_CLIENT_ID="com.armoi.app"
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

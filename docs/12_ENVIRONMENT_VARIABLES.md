# Environment Variables

Create an actual `.env.example` on-site without secret values.

## Public/browser-safe

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- optional public map style/token only when the provider explicitly allows browser exposure.

## Server-only

- `SUPABASE_SERVICE_ROLE_KEY`
- `AI_API_KEY`
- `AI_MODEL`
- `EMBEDDING_MODEL`
- `GEOCODING_API_KEY`
- optional `EMAIL_API_KEY` or SMS credentials.
- rate-limit store credentials if used.

## Configuration

- `APP_BASE_URL`
- `DUPLICATE_RADIUS_METERS`
- `DUPLICATE_TIME_WINDOW_DAYS`
- `DUPLICATE_SCORE_THRESHOLD`
- `MAX_EVIDENCE_BYTES`
- `AI_TIMEOUT_MS`

## Rules

- Validate required server configuration at application startup.
- Never prefix a secret with `NEXT_PUBLIC_`.
- Never commit actual values.
- Maintain separate local, preview, and production values.
- Rotate any credential that appears in chat, logs, screenshots, or Git history.

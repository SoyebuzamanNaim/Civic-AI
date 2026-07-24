# Security and RLS Plan

## Threat boundaries

- Anonymous citizen browser.
- Authenticated government browser.
- Next.js server runtime.
- Supabase Data API, Auth, Storage, and Realtime.
- AI, mapping, and notification providers.
- Uploaded evidence and citizen-supplied URLs.

## Mandatory controls

### Secrets

- Browser receives only the Supabase publishable key.
- Service-role key and AI/map provider secrets are server-only.
- Never place secret values in prompts, logs, screenshots, or repository files.

### Government authorization

- Use Supabase Auth for officials.
- Store application role/department in a controlled profile or custom claim strategy.
- Check authorization in server code and RLS. UI hiding is not authorization.
- Department officers should see/update only the rows permitted by the role model.

### Public submission

Preferred pattern: submit through a Next.js server action/route with validation, rate limiting, bot protection, and service-side repository calls. Do not grant broad anonymous table permissions merely for convenience.

### Public tracking

- Use a high-entropy tracking code, not a sequential ID.
- Rate-limit lookup attempts.
- Return a whitelisted DTO only.
- Consider returning the same safe not-found response for invalid and unknown codes.

### RLS principles

- Enable RLS on every exposed table.
- Apply least-privilege grants before policies.
- Contact and audit tables have no anonymous access.
- Storage buckets require policies; evidence is private by default.
- Service-role usage remains isolated to trusted server modules.

### Upload safety

- Allowlist image MIME types.
- Enforce file size and count limits.
- Generate random storage paths.
- Do not trust file extension or client MIME alone.
- Never render arbitrary HTML/SVG as trusted content.
- Use signed URLs for private evidence.

### External URLs

- Validate scheme (`https` preferred).
- Do not server-fetch arbitrary citizen URLs during MVP; this creates SSRF risk.
- Display links with safe attributes and clear external-link treatment.

### AI prompt injection

- Delimit citizen content as data.
- State that content may contain instructions and must not alter system behavior.
- Use structured output schemas.
- Do not give the AI direct database or secret access in the runtime analysis call.
- Validate and normalize all AI output before persistence.

### Abuse and availability

- Rate-limit submission, tracking lookup, login, and AI-triggering endpoints.
- Add provider timeouts and bounded retries.
- Limit description length and evidence size.
- Use idempotency to prevent duplicate records from retries.

### Auditability

Log:

- government login/security events where available.
- assignment and status changes.
- note creation and visibility changes.
- duplicate confirmation/rejection.
- administrative changes.

Do not log contact values, raw tokens, or full provider payloads.

## Security release gate

Do not demo or deploy until:

- service role cannot be found in client bundle or repository.
- anonymous users cannot query contact/internal tables.
- tracking API has a strict response allowlist.
- all government mutations reject anonymous and unauthorized roles.
- evidence URLs are not permanently public.
- AI and mapping failures do not leak internals.

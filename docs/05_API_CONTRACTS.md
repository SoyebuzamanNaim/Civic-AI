# API Contracts

Use a consistent response envelope for Route Handlers. Server Actions may return typed result objects using the same error vocabulary.

## Success envelope

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "..."
  }
}
```

## Error envelope

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable safe message",
    "fieldErrors": {},
    "requestId": "..."
  }
}
```

Never return raw stack traces, SQL errors, provider payloads, secrets, or internal identifiers to public clients.

## Proposed endpoints

### Public

- `POST /api/reports` - submit report.
- `GET /api/tracking/{trackingCode}` - safe public tracking view.
- `POST /api/evidence/upload-intent` - optional controlled upload intent.

### Government

- `GET /api/government/reports` - paginated search/filter.
- `GET /api/government/reports/{reportId}` - full authorized detail.
- `PATCH /api/government/reports/{reportId}/assignment`.
- `PATCH /api/government/reports/{reportId}/status`.
- `POST /api/government/reports/{reportId}/notes`.
- `PATCH /api/government/duplicate-links/{linkId}`.
- `GET /api/government/metrics`.

## Status code rules

- `200` successful read/update.
- `201` successful creation.
- `400` malformed request or business validation failure.
- `401` unauthenticated.
- `403` authenticated but unauthorized.
- `404` safe not-found response.
- `409` idempotency conflict or invalid state transition.
- `413` evidence too large.
- `415` unsupported evidence type.
- `422` structurally valid but semantically unacceptable input.
- `429` rate limit.
- `502/503/504` upstream AI/map service unavailable or timed out.

## State transition policy

Define allowed transitions centrally. Suggested baseline:

```text
submitted -> under_review | rejected
under_review -> assigned | rejected
assigned -> in_progress | under_review
in_progress -> resolved | assigned
resolved -> in_progress only with explicit reopen reason
rejected -> under_review only with explicit reopen reason
```

Every successful transition must insert a history record in the same database operation.

## Public tracking DTO

May include:

- tracking code.
- safe summary.
- category.
- severity level and public rationale.
- current status.
- assigned department name.
- submitted/updated dates.
- public progress history.

Must exclude:

- citizen contact data.
- internal notes.
- government user details.
- raw AI output.
- duplicate-review internal notes.
- audit logs.

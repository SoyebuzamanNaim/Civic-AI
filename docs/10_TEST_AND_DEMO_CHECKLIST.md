# Test and Demo Checklist

## Automated test pyramid

### Unit

- category/schema validation.
- status transition policy.
- severity guardrail.
- duplicate score components and thresholds.
- tracking code format.
- public DTO redaction.

### Integration

- report creation persists all linked records.
- RLS/grant expectations for anonymous and government roles.
- assignment/status creates history.
- tracking query returns only public fields.
- AI invalid output triggers retry/fallback.
- duplicate candidate query and link persistence.

### End-to-end

1. Submit a report.
2. Copy tracking code.
3. Track report.
4. Government login.
5. Find report.
6. Assign department.
7. Move to in progress.
8. Add public update.
9. Confirm public page reflects update.
10. Submit a near-duplicate and confirm suggestion.

## Manual UX checks

- phone-width form and dashboard.
- keyboard navigation.
- labels and visible focus.
- loading, error, empty, and success states.
- long descriptions and locations.
- Bangla text rendering even if full translation is not implemented.
- no layout shift around AI/loading results.

## Security checks

- inspect browser bundle/environment exposure.
- anonymous API attempts against government endpoints.
- direct Supabase queries against protected tables.
- tracking-code brute-force rate limit.
- oversized/unsupported upload.
- malicious text attempting prompt injection.
- unsafe external URL.

## Demo dataset

Prepare deterministic examples:

- severe water leak near a hospital.
- pothole on a main road.
- broken streetlight.
- illegal dumping.
- two paraphrased reports at nearly the same coordinates.
- similar description far away that should not be a duplicate.

## Five-minute demo script

1. State the civic problem and architecture in 20 seconds.
2. Submit a report and show structured AI output.
3. Show tracking code and public tracking.
4. Submit the duplicate example.
5. Log in to government portal.
6. Show filters, AI rationale, and duplicate explanation.
7. Assign, update status, and add a public note.
8. Refresh tracking page/realtime view.
9. Show one architecture/security decision and one test artifact.
10. End with measurable real-world value and completed bonus features.

## Release gate

- all mandatory requirements mapped to evidence.
- production build passes.
- migrations reproduce the database.
- demo credentials work.
- no secrets in Git history.
- external services have quota and fallback.
- README credits libraries/APIs.
- deployed URL works in a private/incognito browser.

---
name: testing-quality-gate
description: Runs the project quality gate across type safety, lint, unit, integration, E2E, production build, responsive UX, accessibility, privacy, and error states. Use before merging phases, deployment, or demo.
---

# Testing Quality Gate

## Steps

1. Map tests to requirement IDs.
2. Run formatter/check, TypeScript, lint, focused tests, full tests, and production build.
3. Rebuild/apply database migrations in a disposable environment when available.
4. Run the end-to-end golden path.
5. Verify phone and desktop viewport behavior.
6. Verify loading, empty, validation, provider failure, database failure, and safe not-found states.
7. Confirm public DTO redaction and role authorization.
8. Produce a prioritized defect list: blocker, high, medium, low.
9. Do not approve release with blockers or unresolved privacy/secret failures.

## Required report

- Commands and exit results.
- Tests added/changed.
- Browser evidence.
- Coverage gaps.
- Known flaky or manual checks.
- Release recommendation.

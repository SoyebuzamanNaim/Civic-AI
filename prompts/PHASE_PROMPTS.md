# Phase Prompts

Use one prompt per focused Antigravity conversation or worktree.

## 1. Requirements and architecture

Read `docs/01_PROJECT_BRIEF.md`, `docs/02_REQUIREMENTS_TRACEABILITY.md`, `docs/03_ARCHITECTURE.md`, and `docs/11_DECISIONS_AND_TRADEOFFS.md`. Produce an implementation plan and ADRs. Identify contradictions, missing decisions, risky assumptions, and the smallest complete vertical MVP. Do not write source code.

## 2. Supabase schema and RLS

Use the `supabase-secure-data` skill. Design migrations for the approved tables, enums, constraints, indexes, and RLS/grants. Produce a permission matrix before SQL. Keep contact and audit data private. Use migration files only. Add database tests or reproducible SQL verification steps. Do not modify UI.

## 3. Citizen submission

Use `nextjs-clean-architecture`, `api-contracts`, and `requirements-guardian`. Implement the submission vertical slice with shared validation, application use case, repository adapter, success page, idempotency, loading/errors, and tests. Use a deterministic analysis adapter until the AI contract is stable. Do not implement government dashboard.

## 4. Public tracking

Implement a strict public DTO and tracking-code lookup. Add rate-limit integration point, safe not-found behavior, status timeline, and privacy tests proving contact/internal fields cannot leak. Verify on mobile and desktop.

## 5. Government management

Implement Supabase Auth SSR, server-side role checks, dashboard search/filter/pagination, report detail, department assignment, controlled status transitions, public/internal notes, and metrics. Every mutation must produce history/audit records. Add unauthorized-access tests.

## 6. AI analysis

Use `ai-report-analysis`. Implement a provider-neutral adapter with structured output, timeout, retry, validation, fallback, manual-review state, prompt/model versioning, and tests using a fake provider. Do not place provider SDK calls in domain/application modules.

## 7. Duplicate detection

Use `duplicate-detection`. Implement candidate filtering and transparent component scoring. Store suggestions without blocking or deleting reports. Create labeled examples and tests for true duplicate, nearby-different, far-away-similar, and time-separated cases.

## 8. Quality gate

Use `testing-quality-gate`, `stride-threat-model`, and `hackathon-demo-readiness`. Run typecheck, lint, unit, integration, E2E, production build, dependency/security checks, responsive browser verification, and privacy review. Produce a prioritized defect report and fix only high-impact issues before bonuses.

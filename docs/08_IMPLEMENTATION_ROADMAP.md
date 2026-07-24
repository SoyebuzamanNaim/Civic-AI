# Implementation Roadmap

This roadmap prioritizes complete vertical slices over many half-built modules.

## Phase 0 - On-site initialization

- Create the new public GitHub repository after the official start.
- Initialize Next.js with TypeScript, App Router, linting, and the agreed package manager.
- Initialize Supabase local project/migrations.
- Add `.agents/`, docs, environment template, and attribution notes.
- Configure branch rules and task ownership.
- Record the initial architecture decision.

**Exit:** app boots, CI/lint runs, Supabase local/remote connection strategy is confirmed.

## Phase 1 - Data and security foundation

- Create departments, reports, contacts, analysis, evidence, history, duplicate links, and profiles schema.
- Add constraints and indexes.
- Add RLS/grants.
- Create government seed accounts through a safe documented process.
- Implement server/browser Supabase clients correctly.

**Exit:** migration can rebuild the schema; unauthorized access tests pass.

## Phase 2 - Citizen submission vertical slice

- Responsive form.
- Client/server validation.
- Location input.
- Optional evidence.
- Server use case.
- Tracking code generation.
- Success page.

Initially allow a deterministic analysis adapter so the flow works before AI integration.

**Exit:** a citizen can create and receive a trackable report.

## Phase 3 - Public tracking and lifecycle

- Safe tracking lookup.
- Current status and assigned department.
- Public history timeline.
- Empty/error/not-found states.

**Exit:** submission-to-tracking flow works without exposing PII.

## Phase 4 - Government management

- Authenticated login.
- Dashboard table/cards.
- Search/filter/pagination.
- Report detail.
- Assignment.
- Validated status transitions.
- Public/internal progress notes.
- Basic metrics.

**Exit:** officials can manage the complete lifecycle.

## Phase 5 - Real AI analysis

- Provider adapter.
- Strict structured schema.
- confidence, summary, category, severity score/rationale.
- fallback, timeout, retry, and manual-review state.
- model/prompt version metadata.

**Exit:** every new report receives valid structured analysis or a visible fallback.

## Phase 6 - Duplicate detection

- Embedding generation.
- candidate prefilter.
- weighted similarity score.
- duplicate links and official review.
- labeled test examples.

**Exit:** similar reports are linked, not blocked, with explainable scores.

## Phase 7 - Quality and demo hardening

- E2E golden path.
- responsive checks.
- accessibility review.
- loading/error states.
- security review.
- production deployment.
- README, schema/architecture diagrams, attribution, demo script.

## Phase 8 - Bonus features

Choose at most two high-value bonuses based on remaining time. Recommended: map visualization and realtime dashboard. Do not begin a bonus while any core traceability row is incomplete.

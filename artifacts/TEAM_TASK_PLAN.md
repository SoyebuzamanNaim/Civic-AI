# Team Task Allocation & Execution Plan

## 1. Team Role Allocation

| Role | Lead Name | Primary Responsibilities | Scope Boundaries & Allowed Files |
|---|---|---|---|
| **Person A** | Architecture & Integration Lead (`@architect`) | Clean Architecture enforcement, DTOs, domain models, Server Action/Route Handler interfaces, integration testing, final code reviews. | `src/shared/`, `src/features/*/application/`, `src/features/*/domain/`, `implementation_plan.md` |
| **Person B** | Citizen & Public Experience Lead (`@nextjs`) | Citizen submission form, location picker, photo upload UI, success page, public tracking timeline, responsive layout, accessibility. | `src/app/(public)/`, `src/features/reporting/presentation/`, `src/features/tracking/presentation/` |
| **Person C** | Data, Security & Government Lead (`@data`) | Supabase migrations, RLS policies, Auth SSR, profile setup, government dashboard UI, department assignment, status lifecycle, history logs. | `supabase/`, `src/app/(government)/`, `src/features/government-management/`, `src/features/departments/` |
| **Person D** | AI, Duplicates & QA Lead (`@ai` / `@qa`) | Structured AI prompt engineering, AI provider adapter, embeddings generation, duplicate detection multi-signal algorithm, test suites, E2E Playwright, demo dataset. | `src/features/ai-analysis/`, `src/features/duplicate-detection/`, `tests/`, `artifacts/DEMO_RUNBOOK.md` |

---

## 2. Phase-by-Phase Task Breakdown & Ownership Matrix

| Phase | Phase Description | Lead Owner | Tasks | Deliverables | Est. Hours |
|---|---|---|---|---|---|
| **Phase 1** | Repository & Environment Setup | Person A | Initialize Next.js App Router, TypeScript strict config, Tailwind CSS, Supabase local project, environment templates. | Clean repo, `.env.example`, `pnpm-lock.yaml`, directory structure | 1.5h |
| **Phase 2** | Supabase Schema, RLS & Auth | Person C | Create PostgreSQL tables, enums, indexes, RPC transaction, RLS policies, Storage buckets, seed government accounts. | Migration files `supabase/migrations/`, RLS tests passing | 3.0h |
| **Phase 3** | Citizen Report Submission | Person B | Build responsive submission form (`/report/new`), client/server Zod validation, location geocoding integration, evidence upload. | Submission form UI, Server Action `submitReportAction`, unit tests | 3.5h |
| **Phase 4** | Confirmation & Public Tracking | Person B | Build submission success screen (`/report/success/[trackingCode]`), high-entropy tracking generator, public tracking timeline (`/track/[trackingCode]`). | Tracking UI, safe public DTO transformer, E2E tracking test | 2.5h |
| **Phase 5** | Government Auth & Dashboard | Person C | Build Supabase Auth SSR login (`/government/login`), dashboard layout, paginated report list, multi-criteria filtering, search. | Government auth middleware, dashboard UI, search server actions | 4.0h |
| **Phase 6** | Gov Detail & Report Management | Person C | Build detail page (`/government/reports/[reportId]`), department assignment, status state machine transitions, public/internal notes. | Report detail view, assignment drawer, status transition tests | 3.5h |
| **Phase 7** | Real AI Report Analysis | Person D | Build replaceable `ReportAnalysisProvider`, Gemini/OpenAI adapter, structured JSON schema, 5s timeout, retry, deterministic fallback. | AI provider adapter, fallback handler, AI structured output tests | 3.5h |
| **Phase 8** | Multi-Signal Duplicate Detection | Person D | Build embedding generator, candidate prefilter query, 4-signal scoring engine (0.45 semantic, 0.30 distance, 0.15 time, 0.10 category), official review UI. | Scoring algorithm, duplicate links UI, labeled duplicate test set | 4.0h |
| **Phase 9** | Realtime Updates & Polish | Person B & C | Integrate Supabase Realtime channel for live dashboard updates, interactive map view bonus, Bangla/English text, Toast feedback. | Live dashboard indicator, map component, accessibility polish | 2.5h |
| **Phase 10** | Testing, Security & Quality Gate | Person D & A | Run full test suite (Unit, Integration, RLS, E2E Playwright), STRIDE security review, production build check, environment bundle scan. | Quality gate report, Playwright test video artifacts, green build | 2.5h |
| **Phase 11** | Demo Readiness & Release Gate | Person A & D | Seed deterministic demo dataset (hospital water leak, pothole, duplicates), record 5-min demo runbook, final release tag. | `artifacts/DEMO_RUNBOOK.md`, `artifacts/JUDGE_QA.md`, working live demo | 1.5h |

---

## 3. Collaboration & Integration Protocols

1. **Strict Interface Contracts First**: Before parallel development in Phases 3-8, Person A locks the domain interfaces (`ReportRepository`, `ReportAnalysisProvider`, `DuplicateScorer`) and DTO types in `src/shared/domain/`.
2. **One Feature Branch per Task**: Branch naming format: `feat/<person>-<phase>-<short-name>` (e.g. `feat/person-b-ph3-submission-form`).
3. **Mandatory Peer Code Review**:
   - Data/Security changes require Person C + Person A approval.
   - Domain/API contract changes require Person A approval.
   - AI scoring/duplicate logic changes require Person D + Person A approval.
4. **Clean Handoff Checkpoint**: Every merged PR must include:
   - Modified file list.
   - Terminal test passing output screenshot or text log.
   - Verification evidence (Playwright screenshot or UI recording).

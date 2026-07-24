# Requirements Traceability Matrix and Gap Report

## 1. Requirement Traceability Matrix

| ID | Requirement Description | Category | Technical Implementation Strategy | Verification Method | Status |
|---|---|---|---|---|---|
| **FR-01** | Citizen enters issue description | Core Submission | Next.js Client & Server Form with Zod validation. Min length 10, max 2000 chars. | Unit test Zod schema + E2E Playwright form test | Planned |
| **FR-02** | Citizen supplies location | Core Submission | Address string input + optional Lat/Lng coordinates. Standardized geocoding adapter. | Integration test geocoding fallback | Planned |
| **FR-03** | Optional citizen contact details | Privacy & Contact | `report_contacts` table separate from `reports`. `name`, `email`, `phone`. Restricted to Service Role & Auth Officials. | RLS test verifying `anon` access is denied | Planned |
| **FR-04** | Optional photo or URL evidence | Evidence | Supabase Storage private bucket `report-evidence`. Max 5MB images (JPEG/PNG/WebP). Signed URL generation. | Upload limit integration test + mime check | Planned |
| **FR-05** | Unique internal report ID | System ID | PostgreSQL `UUID` primary key (`gen_random_uuid()`). | Schema migration check | Planned |
| **FR-06** | Public tracking code | Public Tracking | Cryptographically secure high-entropy alphanumeric string (e.g., `TRK-8K9P2X4M`). Unique index. | Unit test entropy & collision resistance | Planned |
| **FR-07** | Supported issue categories | Taxonomy | Enum: `pothole`, `broken_streetlight`, `water_leak`, `illegal_dumping`, `other`. | Zod & DB constraint check | Planned |
| **FR-08** | AI validates or generates category | AI Analysis | Structured AI adapter returns allowed category enum & confidence score (0.00-1.00). | Mocked AI provider unit/integration test | Planned |
| **FR-09** | AI concise summary | AI Analysis | AI generates 1-2 sentence objective summary without PII. Persisted in `report_ai_analyses`. | Unit test schema validation & output sanitization | Planned |
| **FR-10** | Severity assessment | AI & Guardrail | AI returns `severityLevel` (low/medium/high/critical), `severityScore` (0-100), and `severityRationale`. | Unit test score bounds & rationale non-empty | Planned |
| **FR-11** | Duplicate detection | AI & Vector | Multi-signal algorithm: Cosine similarity on embeddings (0.45), Geographic distance (0.30), Time proximity (0.15), Category match (0.10). Creates `report_duplicate_links` (`suggested`). Reports are never deleted/rejected. | Integration test multi-signal scoring logic | Planned |
| **FR-12** | Government secure login | Auth & Security | Supabase Auth SSR (`@supabase/ssr`) email/password login. Protected `(government)` layout with middleware role check. | E2E login flow & unauthorized redirect test | Planned |
| **FR-13** | Dashboard list | Gov Operations | Server Component table with client filtering, pagination (20/page), loading skeletons, empty states. | Playwright E2E dashboard rendering test | Planned |
| **FR-14** | Search | Gov Operations | Server action/route searching description, AI summary, location text, tracking code, or UUID. SQL ILIKE / Full-Text search. | Integration search query test | Planned |
| **FR-15** | Filters | Gov Operations | Multi-select filters by status, severity, category, department. Query parameters synced to URL. | E2E filter interaction test | Planned |
| **FR-16** | Department assignment | Gov Operations | Officials assign/re-assign department (`assigned_department_id`). Inserts record in `report_assignments` & history. | Integration test assignment transaction | Planned |
| **FR-17** | Status lifecycle | Gov Operations | Strict state machine transition validation (`submitted` -> `under_review` -> `assigned` -> `in_progress` -> `resolved` / `rejected`). | Unit test state machine guard rules | Planned |
| **FR-18** | Progress notes | Gov Operations | Officials add notes with explicit visibility flag (`public` vs `internal`). Immutable insertion into `report_status_history`. | Integration test visibility filtering | Planned |
| **FR-19** | Operational analytics | Gov Metrics | Dashboard summary metrics: counts by status, severity, category, department, resolution lead time. | Database RPC integration test | Planned |
| **FR-20** | Public tracking page | Public Tracking | Page `/track/[trackingCode]` displays safe DTO: status, category, severity level, public rationale, assigned department name, public timeline notes. | E2E tracking lookup test | Planned |
| **FR-21** | Privacy protection | Privacy & Security | Public DTO explicitly redacts citizen contact data, internal notes, raw AI JSON payloads, and administrative audit trails. | API contract integration test for DTO leakage | Planned |
| **FR-22** | Persistent database | Infrastructure | Supabase Postgres storing reports, contacts, AI analyses, evidence metadata, status history, assignments, duplicate links, profiles, departments. | Migration rebuild smoke test | Planned |
| **FR-23** | Meaningful external API | Integration | Structured AI provider (OpenAI / Gemini) + Geocoding API (Nominatim / Mapbox) + Private Evidence Storage. | Provider integration & fallback unit tests | Planned |
| **NFR-01** | Responsive UX | UX & Design | Mobile-first CSS/Tailwind layout tested on phone (375px), tablet (768px), and desktop (1280px+). | Playwright multi-viewport visual test | Planned |
| **NFR-02** | API consistency | API Architecture | Standard JSON envelope `{ success, data, error, meta }` with appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 409, 422, 429, 502/503). | API contract integration test suite | Planned |
| **NFR-03** | Error handling | Resiliency | Graceful fallbacks: AI failure -> `needs_manual_review = true` with deterministic summary; Geocoding failure -> raw location text stored. | Fault injection integration test | Planned |
| **NFR-04** | Security | Security & RLS | Row Level Security (RLS) enabled on 100% of exposed tables. No service-role key in client bundle. Rate limiting on public endpoints. | RLS security test suite | Planned |
| **NFR-05** | Code quality | Clean Architecture | Strict separation: Presentation (`app/`), Application (`use-cases/`), Domain (`entities/`), Infrastructure (`adapters/`). No framework imports in domain. | Architecture boundary lint check | Planned |
| **NFR-06** | Documentation | Transparency | Architectural diagrams, schema specifications, API contracts, deployment guide, seed data scripts, judge QA guide. | Release gate checklist review | Planned |

---

## 2. Requirements Gap Analysis & Risk Assessment

### Gap 1: Citizen Contact Privacy vs Public Transparency
- **Issue**: Citizens may provide contact details (name, email, phone) for updates. If stored directly on the `reports` table, an accidental `SELECT *` in public tracking API handlers would leak PII.
- **Resolution**: Enforce normalized physical separation. `report_contacts` table is created as a 1-to-1 extension with strict RLS policies prohibiting `anon` SELECT access. Server Actions and Route Handlers use explicitly typed `PublicReportDTO` transformers that never request `report_contacts`.

### Gap 2: AI Availability, Rate Limiting & Provider Outage Failures
- **Issue**: Primary AI API (Gemini) can experience rate limits (429), timeouts (8s), model deprecations, or schema validation failures. If submission relies on a single provider without automatic multi-provider failover, citizen submissions could freeze or fail during provider downtime.
- **Resolution**: Implement a provider-independent adapter with server-side automatic failover:
  1. Primary Provider: `GeminiReportAnalysisProvider` (Attempt 1 with 8s timeout).
  2. Gemini Retry: If Attempt 1 fails (timeout, rate limit, schema error), retry Gemini once (Attempt 2).
  3. Secondary Provider: If Gemini Attempt 2 fails, automatically switch to `GroqReportAnalysisProvider` (Attempt 1 with 8s timeout).
  4. Deterministic Fallback: If Groq fails or returns invalid schema, trigger `FallbackReportAnalysisProvider` (`needsManualReview: true`, `analysis_status: 'completed_deterministic'`, citizen category or `OTHER`, safe truncated summary).
  5. The report submission **NEVER FAILS** due to AI outage, and citizens are never shown internal API errors or provider secrets.

### Gap 3: Duplicate Detection False Positives
- **Issue**: Automated merging or deletion of duplicates could erase distinct citizen reports or cause loss of location evidence for widespread civic failures.
- **Resolution**: Explicit requirement enforcement: duplicate detection **only creates non-destructive links** (`report_duplicate_links` table with status `suggested`). Both reports remain fully active, trackable, and stored. Government officials review suggestions and manually confirm or reject.

### Gap 4: Realtime Dashboard Load under High Concurrency
- **Issue**: Supabase Realtime subscriptions on table `reports` could broadcast sensitive internal metadata or overload client browsers during mass reporting events.
- **Resolution**: Scope Realtime broadcasts to public-safe event payloads or filter updates on authorized government dashboard clients using client-side Supabase channel subscriptions scoped to `authenticated` users.

### Gap 5: PostGIS vs standard Lat/Long Distance Queries
- **Issue**: Full PostGIS extension setup in Supabase requires spatial indexes and complex SQL functions, which might add setup overhead for a hackathon environment.
- **Resolution**: Provide a dual strategy: Use PostGIS `geography(Point, 4326)` and `ST_DWithin` if extension `postgis` is enabled; otherwise fallback to Haversine distance formula implemented via a standard SQL function using numeric `latitude` and `longitude` columns. Both interfaces satisfy the candidate generation port.

# Open Questions, Technical Trade-Offs & Dependency Specifications

## 1. Top Unresolved Architecture & Design Questions

### Question 1: PostGIS Extension vs Haversine Lat/Long SQL Approximation
- **Context**: Geographic distance queries are required for candidate prefiltering during duplicate detection (e.g. find reports within 500 meters).
- **Option A (PostGIS)**: Use PostGIS extension `GEOGRAPHY(Point, 4326)` and `ST_DWithin`. Highly accurate, spatial GiST indexing.
- **Option B (Haversine SQL)**: Use standard Postgres math functions with numeric `latitude` and `longitude` columns. Zero extra extension dependencies.
- **Recommendation**: Implement Haversine SQL formula in Postgres migration as baseline default; enable PostGIS conditionally if Supabase environment supports extension initialization cleanly.

### Question 2: Synchronous vs Asynchronous AI Report Analysis
- **Context**: AI analysis generates summary, category, confidence, and severity scores for citizen reports.
- **Option A (Synchronous)**: Execute AI analysis within the `submitReportAction` execution flow (5s timeout). Citizen immediately sees AI results on the confirmation page.
- **Option B (Asynchronous)**: Submit report instantly (`analysis_status: 'pending'`), trigger background worker / Edge Function for AI analysis, push result via Realtime or polling.
- **Recommendation**: **Synchronous with Fallback**. Attempt synchronous AI call with a strict 5-second timeout and 1 retry. If AI times out or fails, store deterministic fallback (`analysis_status: 'fallback'`, `needs_manual_review: true`). This guarantees fast citizen response time (<2s) while attempting instant AI analysis.

### Question 3: Embedding Model & Dimension Selection
- **Context**: Semantic duplicate detection requires vector embeddings stored in `pgvector`.
- **Option A (OpenAI text-embedding-3-small)**: 1536 dimensions (or 768 via dimensions parameter). Requires OpenAI API key.
- **Option B (Google Gemini text-embedding-004)**: 768 dimensions. Excellent multi-lingual support (English & Bangla).
- **Recommendation**: Configure `vector(768)` in database schema and use Google Gemini / OpenAI 768-dim output to keep vector index memory footprints low.

---

## 2. Technical Trade-offs Log

| Decision Area | Selected Choice | Rejected Alternative | Rationale & Trade-off |
|---|---|---|---|
| Framework Architecture | Modular Monolith in Next.js App Router | Separate React SPA + Express API microservices | Faster hackathon iteration, shared TypeScript types, single deployment pipeline, zero CORS complexity. |
| Data Access Layer | Supabase JS Client + Direct SQL Migrations | Prisma / Drizzle ORM | Eliminates ORM generation overhead; native Supabase RLS and pgvector integration work seamlessly out of the box. |
| Form Mutation Pattern | Next.js Server Actions | REST API route fetch calls | Type-safe form validation, zero boilerplate fetch code, native progressive enhancement, automatic path revalidation. |
| Duplicate Handling | Non-destructive linking (`report_duplicate_links`) | Automatic report merging / deletion | Prevents accidental loss of valid citizen evidence; preserves citizen submission trust; allows official audit. |

---

## 3. Required Environment Variables

```env
# Public Client-Safe Variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Server-Only Private Keys (NEVER EXPOSE TO BROWSER)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
AI_API_KEY=AIzaSy...
AI_MODEL=gemini-2.5-flash
EMBEDDING_MODEL=text-embedding-004
GEOCODING_API_KEY=nominatim_or_mapbox_key

# Runtime Configuration & Tuning Thresholds
DUPLICATE_RADIUS_METERS=500
DUPLICATE_TIME_WINDOW_DAYS=14
DUPLICATE_SCORE_THRESHOLD=0.70
AI_TIMEOUT_MS=5000
MAX_EVIDENCE_BYTES=5242880
```

---

## 4. Required NPM Packages & External Antigravity Skills

### Required NPM Packages
| Package Name | Category | Reason for Requirement |
|---|---|---|
| `@supabase/supabase-js` | Core Infrastructure | Official Supabase Postgres, Auth, and Storage SDK |
| `@supabase/ssr` | Core Auth | Official server-side authentication SSR adapter for Next.js App Router cookies |
| `zod` | Core Validation | Shared schema validation for citizen forms, API DTOs, and AI structured outputs |
| `@google/genai` or `openai` | AI Provider | Replaceable SDK adapter for LLM report analysis and vector embeddings |
| `lucide-react` | UI Components | Lightweight accessible icon set for status badges, categories, and navigation |
| `clsx` & `tailwind-merge` | UI Styling | Utility for conditional CSS class merging in Tailwind components |
| `playwright` (dev) | QA & Testing | Automated browser E2E test suite for submission to government workflow |

### External Antigravity Skills to Install
1. `supabase/agent-skills` (`supabase`, `supabase-postgres-best-practices`): Ensures proper SQL migration writing and secure RLS policy formulation.
2. `vercel-labs/agent-skills` (`react-best-practices`, `web-design-guidelines`): Enforces Server Components by default and high-aesthetic UI patterns.

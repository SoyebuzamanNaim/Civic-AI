# Judge QA & Technical Defense Guide

## 1. Architectural & Engineering Questions

### Q1: Why did you build a Next.js App Router Modular Monolith instead of separate Microservices?
- **Answer**: A modular monolith in Next.js App Router provides maximum velocity during hackathon iteration, single-command deployment, zero CORS network latency, and shared TypeScript type safety between presentation, use cases, and database repositories. Clean Architecture layer boundaries (`src/app` -> `src/features/*/application` -> `src/features/*/domain` -> `src/features/*/infrastructure`) ensure that external dependencies like Supabase or Gemini can be swapped without touching core domain rules.

### Q2: How does your system handle AI service outages or rate limits?
- **Answer**: The system uses a provider-neutral `ReportAnalysisProvider` with a 5-second timeout and 1-time retry loop. If the AI service fails or times out, the system executes a deterministic fallback (`analysis_status: 'fallback'`, `needs_manual_review: true`, category = citizen_category || 'other'). **Citizen report submissions NEVER drop or fail due to AI downtime.**

### Q3: How do you prevent Prompt Injection attacks from malicious citizen text?
- **Answer**: Untrusted citizen text is wrapped inside explicit structural tags (`<citizen_untrusted_input>`) with system prompt framing explicitly commanding the LLM to treat the content solely as data and ignore embedded instructions. Furthermore, all AI outputs are parsed through a strict Zod schema enforcing allowed enums and bounded numeric ranges before persistence.

---

## 2. Security, RLS & Privacy Questions

### Q4: How do you guarantee citizen contact details cannot leak to the public?
- **Answer**: Citizen contact data is stored in a physically separate table (`report_contacts`) with a 1-to-1 foreign key to `reports`. Row Level Security (RLS) policies on `report_contacts` **completely deny `anon` select access**. Public tracking endpoints consume `GetPublicTrackingViewUseCase` which uses an explicitly typed `PublicReportDTO` transformer that never queries `report_contacts`.

### Q5: Is the Supabase Service-Role key ever exposed to the client browser?
- **Answer**: No. `SUPABASE_SERVICE_ROLE_KEY` is loaded strictly in server-side modules (`src/shared/infrastructure/supabase/admin.ts`). Browser components only receive `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. All public submissions pass through Next.js Server Actions / Route Handlers.

---

## 3. Duplicate Detection Questions

### Q6: How does your duplicate detection algorithm work?
- **Answer**: Duplicate detection uses a transparent 4-signal weighted scoring formula:
  $$\text{Score} = 0.45 \times S_{\text{semantic}} + 0.30 \times S_{\text{distance}} + 0.15 \times S_{\text{temporal}} + 0.10 \times S_{\text{category}}$$
  - **Semantic Similarity ($S_{\text{semantic}}$)**: Cosine similarity of 768-dimensional text embeddings in `pgvector`.
  - **Geographic Distance ($S_{\text{distance}}$)**: Linear decay from 1.0 (at 0m) to 0.0 (at 500m radius).
  - **Temporal Proximity ($S_{\text{temporal}}$)**: Linear decay over a 14-day window.
  - **Category Match ($S_{\text{category}}$)**: 1.0 for exact category match.

### Q7: What happens when a duplicate is detected? Does the system delete the report?
- **Answer**: **No.** Per requirements, duplicate detection **NEVER deletes, rejects, or merges citizen reports.** It inserts a candidate record into `report_duplicate_links` with status `suggested`. Both reports remain fully stored, active, and trackable. Government officials inspect explainable component scores and manually confirm or reject the link.

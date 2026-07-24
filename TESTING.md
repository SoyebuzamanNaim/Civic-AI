# Civic Infrastructure AI Platform - Testing Suite Documentation

> [!NOTE]
> This document describes the automated test suite, unit/integration verification patterns, mock strategy vs live credentials, and execution commands for the Civic Infrastructure AI Platform.

---

## 1. Running Tests

The application uses **Vitest** for fast unit and integration testing, and **TypeScript (`tsc`)** for static type checks.

### 1.1 Execute All Tests
```bash
npm test
```

### 1.2 Type Checking
```bash
npm run check-types
```

### 1.3 Watch Mode (Development)
```bash
npx vitest
```

---

## 2. Test Suite Architecture & Coverage

The test suite consists of 18 dedicated test modules located in the `tests/` directory:

```
tests/
├── aiAnalysis.test.ts             # AI output schema & fallback verification
├── aiAnalysisBanglish.test.ts     # Banglish NLP classification & transliteration tests
├── aiAnalysisFailover.test.ts     # Multi-tier AI failover engine (Gemini -> Groq -> Fallback)
├── caseManagement.test.ts         # Government status transition & timeline note tests
├── citizenSubmission.test.ts      # Form validation & submission use case tests
├── cloudinaryUpload.test.ts       # Evidence image upload handling & Cloudinary mock
├── databaseRls.test.ts            # Supabase Row Level Security & access control tests
├── duplicateEngine.test.ts        # Candidate prefiltering & query orchestration
├── duplicateReportView.test.ts    # Duplicate detail UI & link resolution
├── duplicateScoring.test.ts       # Multi-signal similarity scoring mathematics
├── governmentAuth.test.ts         # Server-side auth, session cookies & role checks
├── liveEndToEndSubmission.test.ts # End-to-end report creation & public tracking query
├── liveGeminiAiProvider.test.ts   # Live Google Gemini 2.5 Flash API & prompt injection test
├── liveGroqAiProvider.test.ts     # Live Groq Llama 3.3 API & rate-limit resilience
├── publicTrackingPrivacy.test.ts  # Public tracking PII redaction & visibility checks
├── setupEnv.ts                    # Test environment variables initialization
├── trackingCode.test.ts           # Tracking code generation & uniqueness tests
└── validation.test.ts             # Zod input validation schemas
```

---

## 3. Key Verification Areas

### 3.1 AI Analysis & Banglish NLP
- Tests that Banglish descriptions (e.g. *"Rastar majhe boro khana khondho, gari cholachole shomossha"*) are correctly categorized as `pothole` with accurate severity scores.
- Verifies that malformed or rate-limited AI responses seamlessly fallback to the deterministic engine without throwing unhandled exceptions.

### 3.2 Explainable Duplicate Detection
- Validates the composite similarity formula:
  $$\text{Score} = (0.40 \times \text{Semantic}) + (0.30 \times \text{Distance}) + (0.15 \times \text{Temporal}) + (0.15 \times \text{Category})$$
- Confirms that potential duplicate reports are flagged for government review rather than automatically suppressing citizen submissions.

### 3.3 Security & Privacy Redaction
- Ensures `report_contacts` table and internal progress notes (`visibility = 'internal'`) are never exposed in public tracking responses.
- Verifies RLS policies prevent unauthenticated anonymous callers from reading citizen PII.

---

## 4. Environment Configuration for Tests

Tests automatically fall back to mock adapters if live API keys are not present in `.env.local`:

```env
# Optional Live API Keys for E2E integration tests
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
CLOUDINARY_URL=cloudinary://key:secret@cloud_name
```

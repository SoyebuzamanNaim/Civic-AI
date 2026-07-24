# 5-Minute Timed Judging Presentation Runbook

## Timing Overview (Total: 5 Minutes)

| Time | Segment | Presenter Action | Key Value Highlighted |
|---|---|---|---|
| **0:00 - 0:30** | Problem Statement & Architecture | Introduce CivicPulse AI: Unstructured reports to structured case lifecycle in Next.js App Router + Supabase Postgres. | Modular monolith, Clean Architecture boundaries, zero CORS latency. |
| **0:30 - 1:30** | Citizen Report Submission & AI Analysis | Submit report `/report/new` for hospital water leak. Show instant structured AI summary, category, confidence, & severity (95/100). | Synchronous LLM structured output, prompt injection defense, 5s timeout & fallback engine. |
| **1:30 - 2:15** | Submission Confirmation & Public Tracking | Show confirmation code `TRK-HOSP-9901`. Open public tracking page `/track/TRK-HOSP-9901`. Show stepper timeline. | Strict `PublicReportDTO` redaction (contact PII & internal notes strictly hidden). |
| **2:15 - 3:30** | Non-Destructive Duplicate Detection | Submit near-duplicate report at park. Open official dashboard `/government/dashboard`. Inspect candidate suggestions. | Multi-signal vector scoring (0.45 semantic, 0.30 distance, 0.15 time, 0.10 category). Neither report is deleted. |
| **3:30 - 4:30** | Official Case Management & Realtime | Log in to `/government/dashboard`. Assign department (Water Authority), change status to `In Progress`, post public update note. Refresh tracking page. | Atomic database transactions, immutable timeline history, Supabase Realtime channel. |
| **4:30 - 5:00** | Quality Gate & Architectural Trade-offs | Show green test suite runner (`vitest`), typecheck, production build, and STRIDE security matrix. | 100% RLS policy coverage, least-privilege auth, production readiness. |

---

## Demo Script Instructions

### Step 1: Citizen Submission Demo
1. Navigate to `/report/new`.
2. Select category `Water Leak & Drainage`.
3. Input description: *"Major active water pipe rupture right outside Central Hospital emergency entrance. Water flooding street and blocking ambulance access."*
4. Input location: *"Central Hospital Emergency Gate"*.
5. Click **Submit Report & Generate Tracking Code**.
6. Show AI evaluation output:
   - Category: `Water Leak` (98% confidence)
   - Severity: `CRITICAL (95 / 100)`
   - Rationale: *"Critical active hazard directly threatening emergency hospital access and life safety."*

### Step 2: Public Tracking Demo
1. Copy generated tracking code (e.g. `TRK-HOSP-9901`).
2. Click **View Live Tracking Page** or go to `/track`.
3. Show progress timeline: `Submitted` -> `Under Review`.
4. Point out that citizen contact details (name, email, phone) are **100% absent** from the page HTML and network payload.

### Step 3: Official Management & Assignment Demo
1. Navigate to `/government/login`.
2. Sign in with official credentials.
3. Show operational analytics summary cards:
   - Total Active Cases
   - Critical Severity Count
   - Unassigned Count
4. Click **Inspect & Manage** on the hospital water leak case.
5. In the Department Assignment drawer, select `Water & Sewerage Authority` and click **Assign Department**.
6. Change status to `In Progress` with note: *"Emergency repair crew dispatched with water pump truck."*
7. Open tracking page in second tab to show live updated timeline note.

### Step 4: Duplicate Detection Demo
1. Show suggested duplicate pair `TRK-DUPL-001A` and `TRK-DUPL-001B`.
2. Expand candidate match details to show explainable score breakdown:
   - **Multi-Signal Score**: `91%`
   - **Semantic Score**: `94%`
   - **Geographic Distance**: `98%` (25m apart)
   - **Temporal Proximity**: `99%` (10 mins apart)
   - **Category Match**: `100%`
3. Highlight that both citizen reports remain fully stored and trackable.

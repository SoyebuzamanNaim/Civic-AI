# Route & Screen Map

## 1. Application Layout & Route Architecture

```text
src/app/
├── layout.tsx                      # Root HTML layout (Inter font, theme provider, toast container)
├── page.tsx                        # Public landing page (Hero, quick track input, report issue CTA)
├── (public)/                       # Public Citizen Route Group (No authentication required)
│   ├── layout.tsx                  # Public navbar & footer layout
│   ├── report/
│   │   ├── page.tsx                # Redirects to /report/new
│   │   ├── new/
│   │   │   └── page.tsx            # Minimum Screen 1: Citizen Report Submission Form
│   │   └── success/
│   │       └── [trackingCode]/
│   │           └── page.tsx        # Minimum Screen 2: Submission Confirmation & Tracking Code Display
│   └── track/
│       ├── page.tsx                # Minimum Screen 3: Public Tracking Search Page
│       └── [trackingCode]/
│           └── page.tsx            # Minimum Screen 3 (Detail): Public Report Lifecycle & Timeline View
├── (government)/                   # Protected Government Route Group
│   ├── layout.tsx                  # Government dashboard shell (Header, Sidebar, User Menu)
│   └── government/
│       ├── login/
│       │   └── page.tsx            # Minimum Screen 4 (Auth): Secure Official Login
│       ├── dashboard/
│       │   └── page.tsx            # Minimum Screen 4 (Main): Operational Dashboard & Metrics
│       └── reports/
│           └── [reportId]/
│               └── page.tsx        # Minimum Screen 5: Comprehensive Report Management & Detail View
└── api/                            # RESTful Route Handlers & Integration Endpoints
    ├── reports/
    │   └── route.ts                # POST: Public report submission endpoint
    ├── tracking/
    │   └── [trackingCode]/
    │       └── route.ts            # GET: Public safe tracking lookup endpoint
    ├── evidence/
    │   └── upload-intent/
    │       └── route.ts            # POST: Controlled signed URL generator for evidence
    ├── government/
    │   ├── reports/
    │   │   ├── route.ts            # GET: Authenticated paginated report search & filtering
    │   │   └── [reportId]/
    │   │       ├── route.ts        # GET: Full report details including contact & internal data
    │   │       ├── assignment/
    │   │       │   └── route.ts    # PATCH: Assign/reassign responsible department
    │   │       ├── status/
    │   │       │   └── route.ts    # PATCH: Controlled status state machine transition
    │   │       └── notes/
    │   │           └── route.ts    # POST: Add public or internal progress note
    │   ├── duplicate-links/
    │   │   └── [linkId]/
    │   │       └── route.ts        # PATCH: Confirm or reject suggested duplicate link
    │   └── metrics/
    │       └── route.ts            # GET: Operational analytics summary counts
    └── webhooks/
        └── ai/
            └── route.ts            # POST: Asynchronous AI analysis webhook callback (if async mode used)
```

---

## 2. Page & Screen Detailed Mapping

### Screen 1: Citizen Report Submission (`/report/new`)
- **Type**: Server Component wrapping a Client Component form (`SubmissionForm`).
- **Features**:
  - Issue Category selector (`pothole`, `broken_streetlight`, `water_leak`, `illegal_dumping`, `other`).
  - Problem Description textarea (client validation min 10 chars, max 2000 chars, character counter).
  - Location picker: Geolocation button + manual address search input + interactive coordinates fallback.
  - Optional Contact section: Name, Email, Phone with explicit privacy disclaimer ("Contact details remain private and are only visible to official dispatchers").
  - Photo evidence upload zone (drag & drop, max 5MB, JPG/PNG/WebP, immediate client preview).
- **Server Action**: `submitReportAction(formData)` -> invokes `SubmitReportUseCase`.

### Screen 2: Submission Confirmation (`/report/success/[trackingCode]`)
- **Type**: Server Component (fetches safe public summary via `GetPublicTrackingViewUseCase`).
- **Features**:
  - High-visibility Tracking Code display box with 1-click "Copy Code" button and QR code generator.
  - Formatted status badge (`Submitted` / `Under Review`).
  - Direct link to track progress (`/track/[trackingCode]`).
  - Summary card of submitted details (Category, Location, Date, AI initial summary if synchronous).

### Screen 3: Public Tracking Search & Detail (`/track` and `/track/[trackingCode]`)
- **Type**: Server Component with interactive search form.
- **Features**:
  - Direct tracking code input field with instant lookup.
  - Public Lifecycle Timeline (submitted -> under review -> assigned -> in progress -> resolved).
  - Assigned Department display (e.g. "Roads Maintenance Department").
  - Public Progress Notes timeline (shows notes marked `visibility = 'public'`).
  - AI-validated summary and public severity badge (`Low`, `Medium`, `High`, `Critical`) with public rationale.
  - **Privacy Guarantee**: Contact info, internal official notes, and raw AI payloads are strictly omitted.

### Screen 4: Government Login & Dashboard (`/government/login` and `/government/dashboard`)
- **Type**: Server Component shell + Client Component filters/tables.
- **Authentication**: Redirects to `/government/login` if unauthenticated or unauthorized role.
- **Dashboard Features**:
  - Operational Analytics Summary Cards: Total Open, Critical Severity, Unassigned, Average Resolution Time.
  - Multicriteria Search Bar (searches ID, tracking code, description, location, AI summary).
  - Filter Bar: Category, Severity Level, Status, Assigned Department, Needs Review flag.
  - Data Table with column sorting, severity indicator badges, department pills, and row actions.
  - Realtime badge indicating live updates via Supabase Realtime channel.

### Screen 5: Government Report Detail & Management (`/government/reports/[reportId]`)
- **Type**: Server Component (fetches full report aggregate including contact & duplicates).
- **Features**:
  - Split View: Citizen Original Submission vs AI Analysis Inspector.
  - AI Inspector Box: Confidence score meter, Severity score (0-100) & rationale, suggested department, uncertainty flags.
  - Duplicate Suggestions Panel: List of candidate duplicates with multi-signal score breakdown (Semantic %, Distance %, Time %, Category %). Actions: "Confirm Duplicate" / "Reject Duplicate".
  - Department Assignment Drawer: Select active department, assign officer, add optional assignment note.
  - Status Lifecycle Action Buttons: Next valid state transition trigger (e.g. "Mark In Progress", "Resolve Report").
  - Notes & History Timeline: Add progress note with radio toggle `[Public Note | Internal Note]`. Immutable history audit log.

---

## 3. Server Actions vs Route Handlers Assignment

| Operation | Implementation Type | Justification |
|---|---|---|
| Citizen Report Submit | Server Action (`submitReportAction`) | Native form integration, revalidation, direct server-side execution without exposing API endpoints |
| Tracking Lookup | Server Component / Route Handler | Route Handler (`GET /api/tracking/[trackingCode]`) enables external integration & rate limiting |
| Evidence Upload Pre-sign | Route Handler (`POST /api/evidence/upload-intent`) | Handles file MIME/size metadata validation and returns signed upload tokens |
| Official Login / Logout | Supabase SSR Auth Actions | Direct server action handling auth cookie setting via `@supabase/ssr` |
| Department Assignment | Server Action (`assignDepartmentAction`) | Mutates report state and revalidates dashboard route cache (`revalidatePath`) |
| Status Transition | Server Action (`changeStatusAction`) | Enforces state machine rules and updates history timeline |
| Add Progress Note | Server Action (`addProgressNoteAction`) | Validates note visibility and inserts history record |
| Search & Filter Reports | Server Component URL SearchParams | Server-side rendering driven by URL query parameters (`?status=open&severity=high`) |

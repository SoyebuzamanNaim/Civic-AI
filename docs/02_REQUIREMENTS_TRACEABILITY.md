# Requirements Traceability Matrix

Use this file as the source of truth. Mark each row only after implementation, automated checks, and browser verification.

| ID | Requirement | Acceptance evidence | Status |
|---|---|---|---|
| FR-01 | Citizen enters issue description | Required field; client and server validation; useful error text | DONE |
| FR-02 | Citizen supplies location | Address and/or map coordinate is stored and displayed | DONE |
| FR-03 | Optional citizen contact | Stored separately; never exposed publicly | DONE |
| FR-04 | Optional photo or URL evidence | Valid type/size/URL; secure storage reference | DONE |
| FR-05 | Unique internal report ID | UUID or equivalent, unique in database | DONE |
| FR-06 | Public tracking code | High-entropy, unique, copyable, rate-limited lookup | DONE |
| FR-07 | Supported issue categories | Pothole, Broken Streetlight, Water Leak, Illegal Dumping, Other | DONE |
| FR-08 | AI validates or generates category | Structured output and confidence score | DONE |
| FR-09 | AI concise summary | Stored and visible to officials/public as approved | DONE |
| FR-10 | Severity assessment | Level, numeric score, and brief rationale | DONE |
| FR-11 | Duplicate detection | Uses multiple signals; links rather than rejects | DONE |
| FR-12 | Government secure login | Supabase Auth; protected server routes; role checks | DONE |
| FR-13 | Dashboard list | Pagination, loading, empty, and error states | DONE |
| FR-14 | Search | Keyword, location, report ID, or tracking code | DONE |
| FR-15 | Filters | Category, severity, status, department | DONE |
| FR-16 | Assignment | Official can assign responsible department | DONE |
| FR-17 | Status lifecycle | Controlled transitions and immutable history | DONE |
| FR-18 | Progress notes | Public/internal visibility explicitly selected | DONE |
| FR-19 | Operational analytics | At minimum counts by status/category/severity/department | DONE |
| FR-20 | Public tracking page | Summary, category, severity, status, department, dates, history | DONE |
| FR-21 | Privacy | No contact PII, internal notes, raw AI payload, or audit metadata publicly | DONE |
| FR-22 | Persistent database | All reports, analysis, history, assignments, duplicate links, metadata persisted | DONE |
| FR-23 | Meaningful external API | AI plus mapping/storage/notification integration with visible value | DONE |
| NFR-01 | Responsive UX | Mobile, tablet, desktop verified | DONE |
| NFR-02 | API consistency | Standard success/error envelope and correct HTTP status | DONE |
| NFR-03 | Error handling | Validation, AI, database, mapping, upload, and unexpected errors handled | DONE |
| NFR-04 | Security | RLS, least privilege, secrets, rate limits, upload controls, audit log | DONE |
| NFR-05 | Code quality | Feature boundaries, SOLID ports, no business logic in UI/API controllers | DONE |
| NFR-06 | Documentation | Setup, architecture, schema, API, attribution, testing, demo credentials | DONE |

## Completion rule

A row is `DONE` only when:

1. The implementation exists.
2. The relevant unit/integration/E2E test passes.
3. Antigravity produces a browser screenshot or walkthrough artifact.
4. No unresolved critical security or privacy finding remains.

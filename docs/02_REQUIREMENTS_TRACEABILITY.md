# Requirements Traceability Matrix

Use this file as the source of truth. Mark each row only after implementation, automated checks, and browser verification.

| ID | Requirement | Acceptance evidence | Status |
|---|---|---|---|
| FR-01 | Citizen enters issue description | Required field; client and server validation; useful error text | TODO |
| FR-02 | Citizen supplies location | Address and/or map coordinate is stored and displayed | TODO |
| FR-03 | Optional citizen contact | Stored separately; never exposed publicly | TODO |
| FR-04 | Optional photo or URL evidence | Valid type/size/URL; secure storage reference | TODO |
| FR-05 | Unique internal report ID | UUID or equivalent, unique in database | TODO |
| FR-06 | Public tracking code | High-entropy, unique, copyable, rate-limited lookup | TODO |
| FR-07 | Supported issue categories | Pothole, Broken Streetlight, Water Leak, Illegal Dumping, Other | TODO |
| FR-08 | AI validates or generates category | Structured output and confidence score | TODO |
| FR-09 | AI concise summary | Stored and visible to officials/public as approved | TODO |
| FR-10 | Severity assessment | Level, numeric score, and brief rationale | TODO |
| FR-11 | Duplicate detection | Uses multiple signals; links rather than rejects | TODO |
| FR-12 | Government secure login | Supabase Auth; protected server routes; role checks | TODO |
| FR-13 | Dashboard list | Pagination, loading, empty, and error states | TODO |
| FR-14 | Search | Keyword, location, report ID, or tracking code | TODO |
| FR-15 | Filters | Category, severity, status, department | TODO |
| FR-16 | Assignment | Official can assign responsible department | TODO |
| FR-17 | Status lifecycle | Controlled transitions and immutable history | TODO |
| FR-18 | Progress notes | Public/internal visibility explicitly selected | TODO |
| FR-19 | Operational analytics | At minimum counts by status/category/severity/department | TODO |
| FR-20 | Public tracking page | Summary, category, severity, status, department, dates, history | TODO |
| FR-21 | Privacy | No contact PII, internal notes, raw AI payload, or audit metadata publicly | TODO |
| FR-22 | Persistent database | All reports, analysis, history, assignments, duplicate links, metadata persisted | TODO |
| FR-23 | Meaningful external API | AI plus mapping/storage/notification integration with visible value | TODO |
| NFR-01 | Responsive UX | Mobile, tablet, desktop verified | TODO |
| NFR-02 | API consistency | Standard success/error envelope and correct HTTP status | TODO |
| NFR-03 | Error handling | Validation, AI, database, mapping, upload, and unexpected errors handled | TODO |
| NFR-04 | Security | RLS, least privilege, secrets, rate limits, upload controls, audit log | TODO |
| NFR-05 | Code quality | Feature boundaries, SOLID ports, no business logic in UI/API controllers | TODO |
| NFR-06 | Documentation | Setup, architecture, schema, API, attribution, testing, demo credentials | TODO |

## Completion rule

A row is `DONE` only when:

1. The implementation exists.
2. The relevant unit/integration/E2E test passes.
3. Antigravity produces a browser screenshot or walkthrough artifact.
4. No unresolved critical security or privacy finding remains.

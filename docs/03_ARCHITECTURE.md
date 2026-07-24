# Architecture

## Architectural style

Use a **modular monolith** in one Next.js repository, organized by feature and Clean Architecture boundaries. This gives hackathon speed without mixing UI, business rules, database code, and external APIs.

Do not force classic MVC onto the App Router. Use this mapping instead:

- **Presentation**: routes, pages, React components, forms, server actions, route handlers.
- **Application**: use cases that coordinate domain rules and ports.
- **Domain**: entities, value objects, policies, status transitions, scoring contracts.
- **Infrastructure**: Supabase repositories, AI adapter, geocoder, storage, notifications.

## Dependency direction

```text
presentation -> application -> domain
infrastructure -> application/domain ports
```

The domain and application layers must not import Next.js, Supabase, or a specific AI SDK.

## Suggested source tree

```text
src/
  app/
    (public)/
      report/new/
      report/success/[trackingCode]/
      track/
      track/[trackingCode]/
    (government)/
      government/login/
      government/dashboard/
      government/reports/[reportId]/
    api/
      reports/
      tracking/[trackingCode]/
      government/reports/[reportId]/
      webhooks/
  features/
    reporting/
      domain/
      application/
      infrastructure/
      presentation/
    tracking/
    government-management/
    ai-analysis/
    duplicate-detection/
    departments/
  shared/
    domain/
    application/
    infrastructure/
      supabase/
      auth/
      observability/
    presentation/
      components/
      validation/
```

Keep the tree practical. Do not create an interface for every function. Introduce a port only when it isolates business logic from an external dependency or supports test substitution.

## Core use cases

- `SubmitReport`
- `AnalyzeReport`
- `AssessSeverity`
- `DetectPotentialDuplicates`
- `GetPublicTrackingView`
- `SearchGovernmentReports`
- `AssignReportDepartment`
- `ChangeReportStatus`
- `AddProgressNote`
- `GetDashboardMetrics`

## External ports

- `ReportRepository`
- `ReportAnalysisProvider`
- `EmbeddingProvider`
- `GeocodingProvider`
- `EvidenceStorage`
- `NotificationProvider`
- `Clock`
- `IdGenerator`

## Request flow: citizen submission

1. Client validates basic form shape.
2. Server action/route validates again with the canonical schema.
3. Normalize description and location.
4. Upload evidence through a controlled server flow or signed upload policy.
5. Geocode address if coordinates are missing.
6. Request strict structured AI analysis.
7. Validate AI response; retry once if invalid.
8. If AI fails, use a deterministic fallback and mark `needs_manual_review`.
9. Generate embedding.
10. Query likely duplicate candidates using location/time/category prefilters.
11. Calculate explainable duplicate score.
12. Store report, analysis, evidence, duplicate links, and initial history in a transaction/RPC.
13. Return tracking code and safe public summary.

## Server Actions versus Route Handlers

Use **Server Actions** for authenticated form mutations tightly coupled to Next.js pages. Use **Route Handlers** for public API endpoints, webhooks, file flows, callbacks, or endpoints that need explicit HTTP semantics. Both must call application use cases rather than containing business logic.

## SOLID application

- **Single Responsibility**: parsing, AI analysis, duplicate scoring, persistence, and notification are separate units.
- **Open/Closed**: AI/geocoder/notifier implementations can be replaced through adapters.
- **Liskov Substitution**: every adapter obeys the same input/output/error contract.
- **Interface Segregation**: use narrow ports such as `findDuplicateCandidates`, not a giant database service.
- **Dependency Inversion**: use cases depend on ports; infrastructure implements them.

## Reliability rules

- Add timeouts around AI, geocoding, and notifications.
- Never let notification failure roll back a successful report.
- Store provider/model/prompt version for AI reproducibility.
- Use idempotency keys for repeat submission requests.
- Use optimistic UI only where rollback behavior is clear.

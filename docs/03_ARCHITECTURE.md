# Architecture Documentation

> [!TIP]
> **Master Architecture Document**: See [ARCHITECTURE.md](file:///c:/Users/Naiminator/Codebase/hacka-final/ARCHITECTURE.md) at the repository root for dynamic Mermaid sequence & component diagrams, Clean Architecture layer boundaries, and failover design.

---

## Architectural style

Use a **modular monolith** in one Next.js repository, organized by feature and Clean Architecture boundaries. This gives hackathon speed without mixing UI, business rules, database code, and external APIs.

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

## Reliability rules

- Add timeouts around AI, geocoding, and notifications.
- Never let notification failure roll back a successful report.
- Multi-tier AI failover (Gemini 2.5 Flash -> Groq Llama 3.3 -> Deterministic Fallback Engine).
- Store provider/model/prompt version for AI reproducibility.
- Security and PII redaction enforced at database RLS level.

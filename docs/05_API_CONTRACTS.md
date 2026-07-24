# API Contracts & Server Actions

> [!TIP]
> **Master API Documentation**: See [API.md](file:///c:/Users/Naiminator/Codebase/hacka-final/API.md) at the repository root for full endpoint specs, Next.js Server Actions, DTO envelope formats, HTTP status codes, and PII protection rules.

---

## Response Envelope Overview

All server operations return a standardized JSON envelope structure:

```json
{
  "success": true,
  "data": {},
  "error": "Optional human-readable error message",
  "fieldErrors": {}
}
```

## Primary Actions

- **`submitReportAction`**: Public citizen report submission form handler. Accepts English and Banglish input, triggers AI classification, uploads media to Cloudinary, runs duplicate scoring, and returns a unique tracking code.
- **`getPublicReportByTrackingCode`**: Safe public tracking view. Redacts citizen PII and internal notes.
- **`updateReportStatusAction`**: Government status transition & timeline note creation.
- **`assignDepartmentAction`**: Government department dispatching.
- **`addProgressNoteAction`**: Adds public or internal case timeline notes.

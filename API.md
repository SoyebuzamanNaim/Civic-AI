# Civic Infrastructure AI Platform - API Documentation

> [!NOTE]
> This document specifies all public and government-authenticated endpoints, Next.js Server Actions, DTO formats, status codes, error handling rules, and privacy mechanisms.

---

## 1. Standard Response & Error Envelopes

All Server Actions and API endpoints adhere to a unified response structure.

### 1.1 Success Response Envelope (`ActionState<T>`)

```typescript
type ActionState<T> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};
```

#### JSON Response Structure
```json
{
  "success": true,
  "data": {
    "trackingCode": "CIV-2026-8A9X2B",
    "reportId": "b18274a2-9b21-4d3e-9081-81766a2b8e01",
    "status": "submitted",
    "summary": "Deep pothole reported near Farmgate station",
    "severityLevel": "high"
  }
}
```

### 1.2 Error Response Envelope
```json
{
  "success": false,
  "error": "Validation failed for report submission",
  "fieldErrors": {
    "description": ["Description must be at least 10 characters long"],
    "locationText": ["Location details are required"]
  }
}
```

---

## 2. HTTP Status Code Conventions

| Status Code | Description | Usage |
| :--- | :--- | :--- |
| `200 OK` | Request succeeded | Successful report fetch, status update, note addition |
| `201 Created` | Resource created | Successful report submission |
| `400 Bad Request` | Input validation failure | Invalid form schema or missing parameters |
| `401 Unauthorized` | Unauthenticated | Missing or expired government auth session |
| `403 Forbidden` | Access denied | Insufficient permissions for requested resource |
| `404 Not Found` | Resource non-existent | Invalid report ID or tracking code |
| `409 Conflict` | Invalid state transition | Attempting illegal status transition |
| `422 Unprocessable` | Semantic validation error | Malformed data format |
| `429 Too Many Requests`| Rate limit exceeded | External AI or Geocoding API rate limited |
| `502 / 503` | Gateway failure | Primary and Secondary AI providers unavailable |

---

## 3. Public API & Server Actions

### 3.1 Submit Citizen Report
- **Action**: `submitReportAction(prevState, formData)`
- **File**: [`src/features/reporting/presentation/actions.ts`](file:///c:/Users/Naiminator/Codebase/hacka-final/src/features/reporting/presentation/actions.ts)
- **Access**: Public / Anonymous

#### Request Parameters (`FormData`)

| Field | Type | Required | Constraints / Description |
| :--- | :--- | :--- | :--- |
| `description` | `string` | **Yes** | 10 to 2000 characters. Supports English & Banglish NLP. |
| `locationText` | `string` | **Yes** | Textual address or landmark. |
| `citizenCategory` | `string` | No | `pothole`, `broken_streetlight`, `water_leak`, `illegal_dumping`, `other`. |
| `latitude` | `number` | No | Numeric coordinate (-90 to 90). |
| `longitude` | `number` | No | Numeric coordinate (-180 to 180). |
| `contactName` | `string` | No | Citizen name (Optional, PII isolated). |
| `contactEmail` | `string` | No | Valid email address. |
| `contactPhone` | `string` | No | Phone number string. |
| `consentToContact` | `boolean` | No | Consent flag for progress updates. |
| `evidenceFile` | `File` | No | Image file (Max 5MB, JPG/PNG/WEBP). Uploaded to Cloudinary. |

#### Response (`ActionState<{ trackingCode: string; reportId: string }>`)
```json
{
  "success": true,
  "data": {
    "trackingCode": "CIV-2026-X9A2M4",
    "reportId": "c8f2b380-492e-4e21-b3b2-72120011ee49"
  }
}
```

---

### 3.2 Fetch Public Tracking View
- **Function**: `getPublicReportByTrackingCode(trackingCode)`
- **File**: [`src/app/(public)/track/[trackingCode]/page.tsx`](file:///c:/Users/Naiminator/Codebase/hacka-final/src/app/(public)/track/[trackingCode]/page.tsx)
- **Access**: Public / Anonymous

> [!IMPORTANT]
> **PII Protection Guarantee**: This endpoint returns only non-sensitive, public-facing report details. Citizen contact details (`name`, `email`, `phone`) and internal government notes are strictly redacted.

#### Public Tracking DTO Output
```json
{
  "trackingCode": "CIV-2026-X9A2M4",
  "category": "pothole",
  "status": "in_progress",
  "severityLevel": "high",
  "locationText": "Farmgate Overbridge, Dhaka",
  "submittedAt": "2026-07-24T10:15:00.000Z",
  "summary": "Large crater on main road near bus stand causing severe vehicle damage.",
  "departmentName": "Public Works Department",
  "publicHistory": [
    {
      "toStatus": "submitted",
      "note": "Report submitted by citizen.",
      "createdAt": "2026-07-24T10:15:00.000Z"
    },
    {
      "toStatus": "in_progress",
      "note": "Repair crew dispatched to site.",
      "createdAt": "2026-07-24T11:00:00.000Z"
    }
  ]
}
```

---

## 4. Government API & Management Server Actions

### 4.1 Update Report Status & Timeline Note
- **Action**: `updateReportStatusAction(reportId, newStatus, note, visibility)`
- **File**: [`src/features/government-management/presentation/managementActions.ts`](file:///c:/Users/Naiminator/Codebase/hacka-final/src/features/government-management/presentation/managementActions.ts)
- **Access**: Government Authenticated (`admin`, `dispatcher`, `department_officer`)

#### Input Parameters
```typescript
{
  reportId: "c8f2b380-492e-4e21-b3b2-72120011ee49",
  newStatus: "in_progress", // submitted | under_review | assigned | in_progress | resolved | rejected
  note: "Work order #4092 issued to field team.",
  visibility: "public" // public | internal
}
```

#### Valid State Transitions Policy
```
submitted ───► under_review ───► assigned ───► in_progress ───► resolved
    │                │                                                │
    └───────────────┴────────────────────────► rejected ─────────────┘
```

---

### 4.2 Assign Department
- **Action**: `assignDepartmentAction(reportId, departmentId)`
- **File**: [`src/features/government-management/presentation/managementActions.ts`](file:///c:/Users/Naiminator/Codebase/hacka-final/src/features/government-management/presentation/managementActions.ts)
- **Access**: Government Authenticated

---

### 4.3 Add Case Progress Note
- **Action**: `addProgressNoteAction(reportId, noteText, visibility)`
- **File**: [`src/features/government-management/presentation/managementActions.ts`](file:///c:/Users/Naiminator/Codebase/hacka-final/src/features/government-management/presentation/managementActions.ts)
- **Access**: Government Authenticated

---

### 4.4 Export Reports CSV
- **Action**: `exportReportsAction(filters)`
- **File**: [`src/features/government-management/presentation/exportActions.ts`](file:///c:/Users/Naiminator/Codebase/hacka-final/src/features/government-management/presentation/exportActions.ts)
- **Access**: Government Authenticated (`admin`, `dispatcher`)

---

### 4.5 Government SSR Authentication
- **Actions**: `loginAction(formData)`, `logoutAction()`
- **File**: [`src/features/government-management/presentation/authActions.ts`](file:///c:/Users/Naiminator/Codebase/hacka-final/src/features/government-management/presentation/authActions.ts)
- **Access**: Public for login / Authenticated for logout

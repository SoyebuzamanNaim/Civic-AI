# Civic Infrastructure Platform - Requirement & Bonus Audit (`task.md`)

## Core Functional Requirements (`pdf.pdf`)

- [x] **Module 1 — Citizen Report Submission Core**: Citizen submission interface with description, location, category selection, optional contact info, and tracking code generation.
- [ ] **Module 1 — Optional Photo/URL Evidence Upload**: Input for photo image upload or image URL in `SubmissionForm`, saving evidence metadata into `report_evidence` table.
- [x] **Module 2 — AI Report Analysis**: Gemini & Groq structured LLM analysis producing concise summary, category classification, confidence score, with 5s timeout & fallback guard.
- [x] **Module 3 — Severity Assessment**: 0–100 severity score, severity level (`low`, `medium`, `high`, `critical`), and public safety rationale.
- [x] **Module 4 — Duplicate Detection System**: 4-signal multi-signal candidate scoring engine ($S_{\text{semantic}}, S_{\text{distance}}, S_{\text{temporal}}, S_{\text{category}}$) linking suggested duplicates without blocking or deleting submissions.
- [x] **Module 5 — Government Management Dashboard**: Centralized dashboard for reviewing, filtering (status, severity, category), keyword searching, department assignment, and lifecycle management.
- [x] **Module 6 — Public Progress Tracking System**: Public tracking screen with progress timeline steps, department assignment, status notes, with strict PII privacy protection.
- [x] **Module 7 — Data Management & External Integrations**: Persistent Supabase database tables, RLS security policies, atomic RPC transaction (`create_citizen_report_transaction`), and external AI & OpenStreetMap integrations.

---

## Minimum Required Screens

- [x] **Screen 1 — Citizen Report Submission** (`/report/new`)
- [x] **Screen 2 — Submission Success Page** (`/report/success/[trackingCode]`)
- [x] **Screen 3 — Public Tracking Page** (`/track` & `/track/[trackingCode]`)
- [x] **Screen 4 — Government Management Dashboard** (`/government/dashboard`)
- [x] **Screen 5 — Report Details & Management** (`/government/reports/[reportId]`)

---

## Bonus Criteria Audit Checklist (10 Items from `pdf.pdf` Page 8)

- [x] **Bonus 1 — Interactive Map-Based Issue Visualization**: Interactive Leaflet / OpenStreetMap component rendering incident pins and severity markers on the government dashboard.
- [x] **Bonus 2 — Functional Deployment Readiness**: Clean production build (`npm run build`), environment templates, and Vercel/Supabase host readiness.
- [ ] **Bonus 3 — Image-Based Issue Analysis using AI**: Allow image evidence upload/URL in submission form and process images via Gemini Multimodal Vision API to detect structural damage and enrich AI analysis.
- [x] **Bonus 4 — Real-time Dashboard Updates**: Live Supabase Realtime channel listener updating incident queue & metric cards immediately when new reports are submitted.
- [ ] **Bonus 5 — Multilingual Support (Bangla & English)**: Complete client-side i18n translation dictionary & React Language Context supporting seamless toggle between Bangla (বাংলা) and English across all public and government pages.
- [x] **Bonus 6 — Smart Department Recommendation**: AI taxonomy recommending responsible municipal agency during automated analysis and surfacing recommendation in official detail view.
- [ ] **Bonus 7 — AI-Generated Resolution Suggestions**: Dynamic AI-generated resolution plan & step-by-step action guidance tailored to each specific incident (replacing hardcoded placeholder text).
- [ ] **Bonus 8 — Email/SMS & System Notifications**: Status update notification dispatcher providing citizen/official notification logs and simulated email alerts upon report status transitions.
- [ ] **Bonus 9 — Offline-First / PWA Implementation**: PWA Web App Manifest (`manifest.json`), service worker script for offline asset caching, and installation support.
- [ ] **Bonus 10 — Innovative Features (CSV Export & AI Executive Summary)**: Export government reports to CSV/JSON dataset and generate AI Executive Summary reports for municipal department heads.

---

## Implementation & Fix Execution Order

1. **Fix Task 1 (Bonus 3)**: Image Upload & Gemini Multimodal Vision Analysis (`report_evidence` + AI image input).
2. **Fix Task 2 (Bonus 5)**: Comprehensive Multilingual Support (English & Bangla i18n provider & dictionary for all screens).
3. **Fix Task 3 (Bonus 7)**: AI-Generated Resolution Suggestions (Dynamic AI-driven resolution steps per report).
4. **Fix Task 4 (Bonus 8)**: Notification Dispatcher & Email/SMS Simulation on status transitions.
5. **Fix Task 5 (Bonus 9)**: PWA Implementation (Web App Manifest, Service Worker & offline banner).
6. **Fix Task 6 (Bonus 10)**: CSV Data Export & AI Executive Summary feature for government dashboard.

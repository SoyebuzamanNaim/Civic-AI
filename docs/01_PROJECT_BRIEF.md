# Project Brief

## Problem

Citizens report infrastructure issues through fragmented channels. Reports are often incomplete, duplicated, poorly located, and difficult for authorities to triage. The product must transform unstructured submissions into structured, actionable cases and support the entire lifecycle from submission to resolution.

## Primary users

### Citizen

- Submit a public infrastructure report.
- Add description, location, optional contact details, and optional evidence.
- Receive a unique report ID and public tracking code.
- Track status, assigned department, severity, and public progress history.

### Government official

- Authenticate securely.
- Search, filter, prioritize, and inspect reports.
- Review AI analysis and potential duplicate links.
- Assign departments.
- Update status and add progress notes.
- Monitor operational analytics.

## Mandatory modules

1. Citizen report submission.
2. AI category, concise summary, and confidence score.
3. Severity level, score, and rationale.
4. Duplicate detection using location, category, semantic similarity, timing, and optionally image similarity.
5. Government management dashboard.
6. Public tracking by tracking code with no sensitive information.
7. Persistent storage and at least one meaningful external integration.

## Minimum screens

1. Citizen Report Submission.
2. Submission Success with tracking code.
3. Public Tracking.
4. Government Dashboard.
5. Report Details and Management.

## Evaluation-driven priority

The scoring puts the greatest weight on:

- Government dashboard and report management.
- Progress tracking and status history.
- AI categorization and structured output.
- Duplicate detection.

Severity, reporting experience, and database/validation/error handling are also substantial. UI polish and documentation matter, but they must not displace unfinished core functionality.

## Definition of MVP

A judge can complete this end-to-end scenario without manual database editing:

1. Submit a report with description and location.
2. Receive a tracking code.
3. See AI-generated category, summary, confidence, severity, score, and rationale.
4. Submit a similar nearby report and see it flagged as a possible duplicate while both reports remain stored.
5. Log in as an official.
6. Find both reports, inspect AI analysis, assign a department, change status, and add a public progress note.
7. Open the tracking page and see the updated lifecycle without any private data.

## Recommended bonus order

Only after the MVP passes:

1. Interactive map.
2. Public deployment.
3. Realtime dashboard updates.
4. Bangla and English UI.
5. Smart department recommendation.
6. Email/SMS updates.
7. Image-based analysis.
8. Offline/PWA.

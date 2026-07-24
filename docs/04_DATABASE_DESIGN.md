# Database Design

Use Supabase Postgres migrations. Do not create production schema manually in the dashboard without a matching migration.

## Recommended extensions

- `pgcrypto` for UUID/random helpers where needed.
- `vector` for semantic embeddings.
- `postgis` for accurate geographic distance queries if time permits.

## Tables

### `profiles`

Government user profile linked to `auth.users`.

- `id` UUID primary key referencing auth user.
- `full_name`.
- `role`: `admin`, `dispatcher`, `department_officer`, `viewer`.
- `department_id` nullable.
- timestamps.

### `departments`

- `id` UUID.
- `name` unique.
- `description`.
- `is_active`.

Seed examples: Roads, Street Lighting, Water and Sewerage, Waste Management, General/Public Works.

### `reports`

- `id` UUID primary key.
- `tracking_code` unique, high entropy, indexed.
- `description` original citizen text.
- `citizen_category` nullable.
- `final_category`.
- `status`.
- `severity_level`.
- `severity_score` numeric constrained to the agreed range.
- `location_text`.
- `latitude`, `longitude`, or a PostGIS geography point.
- `assigned_department_id` nullable.
- `needs_manual_review` boolean.
- `analysis_status`.
- `submitted_at`, `updated_at`, `resolved_at`.

### `report_contacts`

Separate sensitive contact data from public report fields.

- `report_id` primary key/foreign key.
- `name`, `email`, `phone` nullable.
- consent flags if notifications are offered.

### `report_ai_analyses`

- `id` UUID.
- `report_id`.
- `summary`.
- `category`.
- `category_confidence`.
- `severity_level`.
- `severity_score`.
- `severity_rationale`.
- `department_recommendation` nullable.
- `embedding` vector with dimension matching the selected model.
- `provider`, `model`, `prompt_version`.
- `raw_output` JSONB stored only if necessary and never exposed publicly.
- timestamps.

### `report_evidence`

- `id` UUID.
- `report_id`.
- `type`: image or URL.
- `storage_path` or `external_url`.
- `mime_type`, `size_bytes`.
- optional checksum for deduplication.

### `report_duplicate_links`

Preserves all reports and records the relationship.

- `id` UUID.
- `report_id`.
- `candidate_report_id`.
- `similarity_score`.
- component scores: semantic, distance, time, category, optional image.
- `status`: suggested, confirmed, rejected.
- `primary_report_id` nullable.
- reviewed by/at.
- unique unordered pair constraint or canonical ordering rule.

### `report_status_history`

Immutable lifecycle timeline.

- `id` UUID.
- `report_id`.
- `from_status`, `to_status`.
- `note`.
- `visibility`: public or internal.
- `changed_by` nullable for system-created entries.
- `created_at`.

### `report_assignments`

Optional if assignment history is not fully represented in status history.

- `id` UUID.
- `report_id`.
- `department_id`.
- `assigned_by`.
- `assigned_at`, `unassigned_at`.

### `audit_logs`

- actor, action, entity, entity ID, safe metadata, timestamp.
- Do not log secrets or full contact details.

## Suggested enums

```text
category: pothole | broken_streetlight | water_leak | illegal_dumping | other
severity: low | medium | high | critical
status: submitted | under_review | assigned | in_progress | resolved | rejected
analysis_status: pending | completed | fallback | failed
visibility: public | internal
```

## Indexes

- unique index on `tracking_code`.
- reports by `status`, `severity_level`, `final_category`, `assigned_department_id`, `submitted_at`.
- location index using GiST when PostGIS is used.
- vector index only after confirming the embedding model and data volume; for a small demo, exact cosine search may be adequate.
- full-text index on description and AI summary for dashboard search.

## Transaction boundary

Create a Postgres function/RPC or server-side transaction-like operation that commits:

1. Report.
2. Contact.
3. AI analysis.
4. Evidence metadata.
5. Initial `submitted` history.
6. Duplicate links.

The system should not leave a partially created report with missing mandatory linked records.

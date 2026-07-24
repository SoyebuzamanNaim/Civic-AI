# Civic Infrastructure AI Platform - Database Schema & Security Specification

> [!NOTE]
> This document details the relational database schema, custom ENUM types, PostGIS/vector indexes, stored procedure transactions, and Row Level Security (RLS) policies implemented in Supabase Postgres.

---

## 1. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    departments ||--o{ profiles : "employs"
    departments ||--o{ reports : "assigned to"
    auth_users ||--|| profiles : "extends"
    
    reports ||--|| report_contacts : "has isolated PII"
    reports ||--o{ report_ai_analyses : "analyzed by"
    reports ||--o{ report_evidence : "contains"
    reports ||--o{ report_duplicate_links : "has duplicates"
    reports ||--o{ report_status_history : "tracks timeline"
    reports ||--o{ report_assignments : "department logs"
    
    profiles ||--o{ report_status_history : "changed by"
    profiles ||--o{ audit_logs : "performed by"

    reports {
        uuid id PK
        string tracking_code UK
        text description
        issue_category citizen_category
        issue_category final_category
        report_status status
        severity_level severity_level
        numeric severity_score
        text location_text
        numeric latitude
        numeric longitude
        uuid assigned_department_id FK
        boolean needs_manual_review
        analysis_status analysis_status
        timestamptz submitted_at
        timestamptz updated_at
        timestamptz resolved_at
    }

    report_contacts {
        uuid report_id PK, FK
        text name
        text email
        text phone
        boolean consent_to_contact
        timestamptz created_at
    }

    report_ai_analyses {
        uuid id PK
        uuid report_id FK
        text summary
        issue_category category
        numeric category_confidence
        severity_level severity_level
        numeric severity_score
        text severity_rationale
        vector_768 embedding
        text provider
        text model
        text prompt_version
        jsonb raw_output
        timestamptz created_at
    }

    report_evidence {
        uuid id PK
        uuid report_id FK
        evidence_type type
        text storage_path
        text external_url
        text mime_type
        bigint size_bytes
        text checksum
        timestamptz created_at
    }

    report_duplicate_links {
        uuid id PK
        uuid report_id FK
        uuid candidate_report_id FK
        numeric similarity_score
        numeric semantic_score
        numeric distance_score
        numeric temporal_score
        numeric category_score
        duplicate_status status
        uuid primary_report_id FK
        uuid reviewed_by FK
        timestamptz reviewed_at
    }

    report_status_history {
        uuid id PK
        uuid report_id FK
        report_status from_status
        report_status to_status
        text note
        note_visibility visibility
        uuid changed_by FK
        timestamptz created_at
    }

    departments {
        uuid id PK
        text name UK
        text description
        boolean is_active
        timestamptz created_at
    }

    profiles {
        uuid id PK, FK
        text full_name
        government_role role
        uuid department_id FK
        timestamptz created_at
    }

    audit_logs {
        uuid id PK
        uuid actor_id FK
        text action
        text entity_type
        uuid entity_id
        jsonb metadata
        timestamptz created_at
    }
```

---

## 2. Custom Enumeration Types

| Enum Name | Allowed Values |
| :--- | :--- |
| `government_role` | `'admin'`, `'dispatcher'`, `'department_officer'`, `'viewer'` |
| `issue_category` | `'pothole'`, `'broken_streetlight'`, `'water_leak'`, `'illegal_dumping'`, `'other'` |
| `severity_level` | `'low'`, `'medium'`, `'high'`, `'critical'` |
| `report_status` | `'submitted'`, `'under_review'`, `'assigned'`, `'in_progress'`, `'resolved'`, `'rejected'` |
| `analysis_status` | `'pending'`, `'completed'`, `'fallback'`, `'failed'` |
| `note_visibility` | `'public'`, `'internal'` |
| `duplicate_status` | `'suggested'`, `'confirmed'`, `'rejected'` |
| `evidence_type` | `'image'`, `'url'` |

---

## 3. Database Indexes

```sql
-- High Entropy Tracking Code Lookup
CREATE UNIQUE INDEX idx_reports_tracking_code ON reports(tracking_code);

-- Search & Filter Indexes
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_severity ON reports(severity_level);
CREATE INDEX idx_reports_category ON reports(final_category);
CREATE INDEX idx_reports_dept ON reports(assigned_department_id);
CREATE INDEX idx_reports_submitted_at ON reports(submitted_at DESC);

-- English & Banglish Full-Text Search (GIN Index)
CREATE INDEX idx_reports_fts ON reports USING gin(to_tsvector('english', description || ' ' || location_text));

-- Vector Cosine Similarity Search (HNSW Index for 768-dim Embeddings)
CREATE INDEX idx_ai_analyses_embedding ON report_ai_analyses USING hnsw (embedding vector_cosine_ops);
```

---

## 4. Stored Procedures & Functions

### 4.1 Geographic Haversine Distance Calculation
```sql
CREATE OR REPLACE FUNCTION calculate_haversine_distance(
  lat1 NUMERIC, lon1 NUMERIC,
  lat2 NUMERIC, lon2 NUMERIC
) RETURNS NUMERIC AS $$
-- Calculates distance in meters between two lat/lon coordinates
```

### 4.2 Atomic Report Creation Transaction (`create_citizen_report_transaction`)
Executes an atomic database transaction that commits the core report, isolated contact details, initial AI analysis, and initial status timeline record in a single database operation, preventing orphan records.

---

## 5. Security & Row Level Security (RLS) Policies

Database security is enforced via strict Supabase Postgres RLS policies:

### 5.1 `reports` Table Policies
- **Public Select**: Anyone (`anon`, `authenticated`) can SELECT non-sensitive report fields.
- **Government Full Access**: Authenticated users with valid `profiles` can SELECT, UPDATE, and DELETE.
- **Insert Policy**: Anyone can insert via the RPC transaction function (`SECURITY DEFINER`).

### 5.2 `report_contacts` Table (PII Protection)
- **Public Select**: **DISABLED** (0 rows returned to unauthenticated calls).
- **Government Select/Update**: Only authenticated government officers can access contact info.

### 5.3 `report_status_history` Table
- **Public Select**: Allowed ONLY where `visibility = 'public'`. Internal notes are hidden from citizens.

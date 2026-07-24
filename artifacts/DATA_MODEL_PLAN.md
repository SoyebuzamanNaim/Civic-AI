# Database Data Model Plan

## 1. PostgreSQL Schema & Extensions

### Required Extensions
- `pgcrypto`: Provides `gen_random_uuid()` and cryptographic helper functions.
- `vector`: Enables `pgvector` for storing 768-dimensional or 1536-dimensional report text embeddings and performing fast cosine distance queries (`<=>`).
- `postgis` (Optional/Graceful): Provides spatial index support and `ST_DWithin` geography distance calculations.

---

## 2. Custom Enumeration Types

```sql
CREATE TYPE government_role AS ENUM (
  'admin',
  'dispatcher',
  'department_officer',
  'viewer'
);

CREATE TYPE issue_category AS ENUM (
  'pothole',
  'broken_streetlight',
  'water_leak',
  'illegal_dumping',
  'other'
);

CREATE TYPE severity_level AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

CREATE TYPE report_status AS ENUM (
  'submitted',
  'under_review',
  'assigned',
  'in_progress',
  'resolved',
  'rejected'
);

CREATE TYPE analysis_status AS ENUM (
  'pending',
  'completed_primary',
  'completed_fallback',
  'completed_deterministic',
  'failed'
);

CREATE TYPE note_visibility AS ENUM (
  'public',
  'internal'
);

CREATE TYPE duplicate_status AS ENUM (
  'suggested',
  'confirmed',
  'rejected'
);

CREATE TYPE evidence_type AS ENUM (
  'image',
  'url'
);
```

---

## 3. Entity Definitions & DDL Specifications

### Table 1: `departments`
Stores city administrative departments responsible for resolving infrastructure issues.

```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table 2: `profiles`
Maps Supabase Auth users (`auth.users`) to government roles and department affiliations.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role government_role NOT NULL DEFAULT 'department_officer',
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table 3: `reports`
Core entity containing infrastructure report lifecycle data and location coordinates.

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL CHECK (char_length(description) >= 10 AND char_length(description) <= 2000),
  citizen_category issue_category,
  final_category issue_category NOT NULL DEFAULT 'other',
  status report_status NOT NULL DEFAULT 'submitted',
  severity_level severity_level NOT NULL DEFAULT 'medium',
  severity_score NUMERIC(5,2) NOT NULL DEFAULT 50.00 CHECK (severity_score >= 0.00 AND severity_score <= 100.00),
  location_text TEXT NOT NULL,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  location_point GEOGRAPHY(Point, 4326),
  assigned_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  needs_manual_review BOOLEAN NOT NULL DEFAULT false,
  analysis_status analysis_status NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
```

### Table 4: `report_contacts` (PII Isolation Table)
Stores citizen contact details. Restricted to authenticated government officials; hidden from public APIs and anonymous RLS queries.

```sql
CREATE TABLE report_contacts (
  report_id UUID PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  consent_to_contact BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table 5: `report_ai_analyses`
Stores AI-generated metadata, severity rationales, structured fields, and text embeddings.

```sql
CREATE TABLE report_ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  category issue_category NOT NULL,
  category_confidence NUMERIC(3,2) NOT NULL CHECK (category_confidence >= 0.00 AND category_confidence <= 1.00),
  severity_level severity_level NOT NULL,
  severity_score NUMERIC(5,2) NOT NULL CHECK (severity_score >= 0.00 AND severity_score <= 100.00),
  severity_rationale TEXT NOT NULL,
  recommended_department TEXT,
  safety_risks JSONB DEFAULT '[]'::jsonb,
  uncertainties JSONB DEFAULT '[]'::jsonb,
  needs_manual_review BOOLEAN NOT NULL DEFAULT false,
  embedding VECTOR(768),
  provider_used TEXT NOT NULL,
  model_used TEXT NOT NULL,
  fallback_triggered BOOLEAN NOT NULL DEFAULT false,
  fallback_reason TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  analysis_status analysis_status NOT NULL DEFAULT 'completed_primary',
  prompt_version TEXT NOT NULL DEFAULT 'v1',
  raw_output JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table 6: `report_evidence`
Tracks photo uploads and external link evidence attached to reports.

```sql
CREATE TABLE report_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  type evidence_type NOT NULL DEFAULT 'image',
  storage_path TEXT,
  external_url TEXT,
  mime_type TEXT,
  size_bytes BIGINT CHECK (size_bytes <= 5242880), -- 5MB max size limit
  checksum TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table 7: `report_duplicate_links`
Preserves all reports while storing multi-signal duplicate candidate linkages and human review status.

```sql
CREATE TABLE report_duplicate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  candidate_report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  similarity_score NUMERIC(5,4) NOT NULL CHECK (similarity_score >= 0.0000 AND similarity_score <= 1.0000),
  semantic_score NUMERIC(5,4) NOT NULL,
  distance_score NUMERIC(5,4) NOT NULL,
  temporal_score NUMERIC(5,4) NOT NULL,
  category_score NUMERIC(5,4) NOT NULL,
  status duplicate_status NOT NULL DEFAULT 'suggested',
  primary_report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_different_reports CHECK (report_id <> candidate_report_id),
  CONSTRAINT uq_report_pair UNIQUE (report_id, candidate_report_id)
);
```

### Table 8: `report_status_history`
Immutable timeline audit log tracking every report status transition and official note.

```sql
CREATE TABLE report_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  from_status report_status,
  to_status report_status NOT NULL,
  note TEXT,
  visibility note_visibility NOT NULL DEFAULT 'public',
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table 9: `report_assignments`
Tracks department assignment and re-assignment history.

```sql
CREATE TABLE report_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unassigned_at TIMESTAMPTZ
);
```

### Table 10: `audit_logs`
Security and compliance audit trail recording all privileged actions.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 4. Performance Indexes

```sql
-- High entropy unique tracking code lookup
CREATE UNIQUE INDEX idx_reports_tracking_code ON reports(tracking_code);

-- Dashboard query filtering indexes
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_severity ON reports(severity_level);
CREATE INDEX idx_reports_category ON reports(final_category);
CREATE INDEX idx_reports_dept ON reports(assigned_department_id);
CREATE INDEX idx_reports_submitted_at ON reports(submitted_at DESC);

-- Full text search index on description & location
CREATE INDEX idx_reports_fts ON reports USING gin(to_tsvector('english', description || ' ' || location_text));

-- Vector similarity index (HNSW for fast cosine search)
CREATE INDEX idx_ai_analyses_embedding ON report_ai_analyses USING hnsw (embedding vector_cosine_ops);

-- Spatial index for geographic radius queries (if PostGIS enabled)
CREATE INDEX idx_reports_spatial ON reports USING gist(location_point);
```

---

## 5. Atomic Report Submission Transaction (RPC)

To prevent orphaned or incomplete database states, submissions execute within a single PostgreSQL transaction function:

```sql
CREATE OR REPLACE FUNCTION create_citizen_report_transaction(
  p_tracking_code TEXT,
  p_description TEXT,
  p_citizen_category issue_category,
  p_location_text TEXT,
  p_latitude NUMERIC,
  p_longitude NUMERIC,
  p_contact_name TEXT DEFAULT NULL,
  p_contact_email TEXT DEFAULT NULL,
  p_contact_phone TEXT DEFAULT NULL,
  p_consent_contact BOOLEAN DEFAULT false,
  p_ai_summary TEXT DEFAULT NULL,
  p_ai_category issue_category DEFAULT NULL,
  p_category_confidence NUMERIC DEFAULT 0.00,
  p_severity_level severity_level DEFAULT 'medium',
  p_severity_score NUMERIC DEFAULT 50.00,
  p_severity_rationale TEXT DEFAULT NULL,
  p_provider TEXT DEFAULT 'fallback',
  p_model TEXT DEFAULT 'none',
  p_prompt_version TEXT DEFAULT 'v1'
) RETURNS UUID AS $$
DECLARE
  v_report_id UUID;
  v_final_cat issue_category;
BEGIN
  v_final_cat := COALESCE(p_ai_category, p_citizen_category, 'other');

  -- 1. Insert Core Report
  INSERT INTO reports (
    tracking_code, description, citizen_category, final_category,
    status, severity_level, severity_score, location_text,
    latitude, longitude,
    location_point,
    analysis_status
  ) VALUES (
    p_tracking_code, p_description, p_citizen_category, v_final_cat,
    'submitted', p_severity_level, p_severity_score, p_location_text,
    p_latitude, p_longitude,
    CASE WHEN p_latitude IS NOT NULL AND p_longitude IS NOT NULL 
         THEN ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography 
         ELSE NULL END,
    CASE WHEN p_ai_summary IS NOT NULL THEN 'completed'::analysis_status ELSE 'fallback'::analysis_status END
  ) RETURNING id INTO v_report_id;

  -- 2. Insert Contact Details (if provided)
  IF p_contact_name IS NOT NULL OR p_contact_email IS NOT NULL OR p_contact_phone IS NOT NULL THEN
    INSERT INTO report_contacts (report_id, name, email, phone, consent_to_contact)
    VALUES (v_report_id, p_contact_name, p_contact_email, p_contact_phone, p_consent_contact);
  END IF;

  -- 3. Insert Initial AI Analysis Record (if available)
  IF p_ai_summary IS NOT NULL THEN
    INSERT INTO report_ai_analyses (
      report_id, summary, category, category_confidence,
      severity_level, severity_score, severity_rationale,
      provider, model, prompt_version
    ) VALUES (
      v_report_id, p_ai_summary, v_final_cat, p_category_confidence,
      p_severity_level, p_severity_score, COALESCE(p_severity_rationale, 'Initial analysis'),
      p_provider, p_model, p_prompt_version
    );
  END IF;

  -- 4. Insert Initial Lifecycle Status History Entry
  INSERT INTO report_status_history (report_id, from_status, to_status, note, visibility)
  VALUES (v_report_id, NULL, 'submitted', 'Report submitted by citizen.', 'public');

  RETURN v_report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

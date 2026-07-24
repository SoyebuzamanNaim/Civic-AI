-- Migration 000000: Initial Database Schema, Enums, Tables, Indexes, and Functions

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";
-- Enable PostGIS if supported by Postgres host (handled gracefully if missing)
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS "postgis";
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'PostGIS extension not supported on this host; falling back to Haversine functions.';
END $$;

-- 2. Custom Enumerations
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
  'completed',
  'fallback',
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

-- 3. Core Tables

-- Departments
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles (Linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role government_role NOT NULL DEFAULT 'department_officer',
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Core Reports Table
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
  assigned_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  needs_manual_review BOOLEAN NOT NULL DEFAULT false,
  analysis_status analysis_status NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Report Contacts (Isolated PII)
CREATE TABLE report_contacts (
  report_id UUID PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  consent_to_contact BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Report AI Analyses
CREATE TABLE report_ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  category issue_category NOT NULL,
  category_confidence NUMERIC(3,2) NOT NULL CHECK (category_confidence >= 0.00 AND category_confidence <= 1.00),
  severity_level severity_level NOT NULL,
  severity_score NUMERIC(5,2) NOT NULL CHECK (severity_score >= 0.00 AND severity_score <= 100.00),
  severity_rationale TEXT NOT NULL,
  department_recommendation TEXT,
  embedding VECTOR(768),
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  raw_output JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Report Evidence Metadata
CREATE TABLE report_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  type evidence_type NOT NULL DEFAULT 'image',
  storage_path TEXT,
  external_url TEXT,
  mime_type TEXT,
  size_bytes BIGINT CHECK (size_bytes <= 5242880),
  checksum TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Report Duplicate Links
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

-- Immutable Report Status History & Timeline Notes
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

-- Department Assignments Log
CREATE TABLE report_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unassigned_at TIMESTAMPTZ
);

-- Security Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Indexes
CREATE UNIQUE INDEX idx_reports_tracking_code ON reports(tracking_code);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_severity ON reports(severity_level);
CREATE INDEX idx_reports_category ON reports(final_category);
CREATE INDEX idx_reports_dept ON reports(assigned_department_id);
CREATE INDEX idx_reports_submitted_at ON reports(submitted_at DESC);
CREATE INDEX idx_reports_fts ON reports USING gin(to_tsvector('english', description || ' ' || location_text));
CREATE INDEX idx_ai_analyses_embedding ON report_ai_analyses USING hnsw (embedding vector_cosine_ops);

-- 5. Helper Distance Calculation Function (Haversine Formula in meters)
CREATE OR REPLACE FUNCTION calculate_haversine_distance(
  lat1 NUMERIC, lon1 NUMERIC,
  lat2 NUMERIC, lon2 NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
  r NUMERIC := 6371000; -- Earth radius in meters
  dlat NUMERIC;
  dlon NUMERIC;
  a NUMERIC;
  c NUMERIC;
BEGIN
  IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
    RETURN 9999999;
  END IF;

  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  a := sin(dlat/2)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)^2;
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE;

-- 6. Atomic Citizen Report Creation RPC Transaction
CREATE OR REPLACE FUNCTION create_citizen_report_transaction(
  p_tracking_code TEXT,
  p_description TEXT,
  p_citizen_category issue_category,
  p_location_text TEXT,
  p_latitude NUMERIC DEFAULT NULL,
  p_longitude NUMERIC DEFAULT NULL,
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
    latitude, longitude, analysis_status
  ) VALUES (
    p_tracking_code, p_description, p_citizen_category, v_final_cat,
    'submitted', p_severity_level, p_severity_score, p_location_text,
    p_latitude, p_longitude,
    CASE WHEN p_ai_summary IS NOT NULL THEN 'completed'::analysis_status ELSE 'fallback'::analysis_status END
  ) RETURNING id INTO v_report_id;

  -- 2. Insert Contact Details (if provided)
  IF p_contact_name IS NOT NULL OR p_contact_email IS NOT NULL OR p_contact_phone IS NOT NULL THEN
    INSERT INTO report_contacts (report_id, name, email, phone, consent_to_contact)
    VALUES (v_report_id, p_contact_name, p_contact_email, p_contact_phone, p_consent_contact);
  END IF;

  -- 3. Insert Initial AI Analysis (if provided)
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

  -- 4. Insert Initial Timeline Entry
  INSERT INTO report_status_history (report_id, from_status, to_status, note, visibility)
  VALUES (v_report_id, NULL, 'submitted', 'Report submitted by citizen.', 'public');

  RETURN v_report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

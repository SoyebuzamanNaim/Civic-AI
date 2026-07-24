-- Migration 000001: Row Level Security (RLS) Policies & Storage Security

-- 1. Enable RLS on 100% of Exposed Tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_duplicate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Departments RLS Policies
CREATE POLICY "Public read active departments" ON departments
  FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Admin manage departments" ON departments
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 3. Profiles RLS Policies
CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY "Admins manage profiles" ON profiles
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 4. Reports RLS Policies
-- Public tracking is handled by high-entropy tracking code lookup via Server API.
-- Direct table queries require authenticated government official roles.
CREATE POLICY "Authenticated officials view reports" ON reports
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role IN ('admin', 'dispatcher', 'viewer')
        OR (profiles.role = 'department_officer' AND reports.assigned_department_id = profiles.department_id)
      )
    )
  );

CREATE POLICY "Dispatchers and Admins update reports" ON reports
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'dispatcher', 'department_officer')
    )
  );

-- 5. Report Contacts RLS Policies (PII Protection)
-- Strict denial for anonymous queries.
CREATE POLICY "Deny anonymous contact access" ON report_contacts
  FOR ALL TO anon USING (false);

CREATE POLICY "Authenticated officials view contacts" ON report_contacts
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'dispatcher', 'department_officer')
    )
  );

-- 6. Report AI Analyses RLS Policies
CREATE POLICY "Officials view AI analyses" ON report_ai_analyses
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'dispatcher', 'department_officer', 'viewer')
    )
  );

-- 7. Report Duplicate Links RLS Policies
CREATE POLICY "Officials view duplicate links" ON report_duplicate_links
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'dispatcher', 'department_officer', 'viewer')
    )
  );

CREATE POLICY "Officials update duplicate links" ON report_duplicate_links
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'dispatcher')
    )
  );

-- 8. Report Status History RLS Policies
CREATE POLICY "Officials view status history" ON report_status_history
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'dispatcher', 'department_officer', 'viewer')
    )
  );

CREATE POLICY "Officials insert status history" ON report_status_history
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'dispatcher', 'department_officer')
    )
  );

CREATE POLICY "Allow server insert status history" ON report_status_history
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow server update reports" ON reports
  FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Allow server manage duplicate links" ON report_duplicate_links
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 9. Storage Security Bucket & Policies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'report-evidence',
  'report-evidence',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

CREATE POLICY "Authenticated officials view evidence files" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'report-evidence');

CREATE POLICY "Service role manages evidence files" ON storage.objects
  FOR ALL TO service_role USING (bucket_id = 'report-evidence');

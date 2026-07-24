import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

describe('Database Schema and RLS Security Policy Verification', () => {
  it('should verify initial migration SQL exists and defines all 10 core tables', () => {
    const migrationPath = path.join(
      process.cwd(),
      'supabase/migrations/20260724000000_initial_schema.sql'
    );
    expect(fs.existsSync(migrationPath)).toBe(true);

    const sqlContent = fs.readFileSync(migrationPath, 'utf8');

    expect(sqlContent).toContain('CREATE TABLE departments');
    expect(sqlContent).toContain('CREATE TABLE profiles');
    expect(sqlContent).toContain('CREATE TABLE reports');
    expect(sqlContent).toContain('CREATE TABLE report_contacts');
    expect(sqlContent).toContain('CREATE TABLE report_ai_analyses');
    expect(sqlContent).toContain('CREATE TABLE report_evidence');
    expect(sqlContent).toContain('CREATE TABLE report_duplicate_links');
    expect(sqlContent).toContain('CREATE TABLE report_status_history');
    expect(sqlContent).toContain('CREATE TABLE report_assignments');
    expect(sqlContent).toContain('CREATE TABLE audit_logs');
  });

  it('should verify security RLS policies migration explicitly enables RLS on 100% of tables', () => {
    const rlsPath = path.join(
      process.cwd(),
      'supabase/migrations/20260724000001_security_rls_policies.sql'
    );
    expect(fs.existsSync(rlsPath)).toBe(true);

    const rlsSql = fs.readFileSync(rlsPath, 'utf8');

    expect(rlsSql).toContain('ALTER TABLE departments ENABLE ROW LEVEL SECURITY;');
    expect(rlsSql).toContain('ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;');
    expect(rlsSql).toContain('ALTER TABLE reports ENABLE ROW LEVEL SECURITY;');
    expect(rlsSql).toContain('ALTER TABLE report_contacts ENABLE ROW LEVEL SECURITY;');
    expect(rlsSql).toContain('ALTER TABLE report_ai_analyses ENABLE ROW LEVEL SECURITY;');
    expect(rlsSql).toContain('ALTER TABLE report_evidence ENABLE ROW LEVEL SECURITY;');
    expect(rlsSql).toContain('ALTER TABLE report_duplicate_links ENABLE ROW LEVEL SECURITY;');
    expect(rlsSql).toContain('ALTER TABLE report_status_history ENABLE ROW LEVEL SECURITY;');
    expect(rlsSql).toContain('ALTER TABLE report_assignments ENABLE ROW LEVEL SECURITY;');
    expect(rlsSql).toContain('ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;');

    expect(rlsSql).toContain('CREATE POLICY "Deny anonymous contact access" ON report_contacts');
  });
});

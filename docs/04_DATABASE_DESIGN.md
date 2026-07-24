# Database Design & Schema

> [!TIP]
> **Master Database Schema Document**: See [DATABASE_SCHEMA.md](file:///c:/Users/Naiminator/Codebase/hacka-final/DATABASE_SCHEMA.md) at the repository root for the complete Mermaid ERD, table definitions, custom ENUMs, PostGIS/vector indexes, stored procedure RPC functions, and Row Level Security (RLS) policies.

---

## Key Tables Overview

- **`reports`**: Core infrastructure report table. Contains tracking code, description, location, status, and severity.
- **`report_contacts`**: Isolated citizen contact information (name, email, phone) to protect PII.
- **`report_ai_analyses`**: AI categorization results, confidence scores, severity rationale, and 768-dim embeddings.
- **`report_evidence`**: Evidence media attachments (Cloudinary URLs/paths, image metadata).
- **`report_duplicate_links`**: Preserves submitted reports while recording explainable duplicate candidate relationships.
- **`report_status_history`**: Immutable lifecycle timeline notes and status change records.
- **`departments`**: Government department records.
- **`profiles`**: Government user profile linked to Supabase Auth `auth.users`.
- **`audit_logs`**: System security audit trail.

## Migrations

1. `supabase/migrations/20260724000000_initial_schema.sql`
2. `supabase/migrations/20260724000001_security_rls_policies.sql`

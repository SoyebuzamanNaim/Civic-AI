---
name: supabase-secure-data
description: Designs secure Supabase Postgres schemas, migrations, Auth SSR, RLS, grants, Storage policies, and Realtime access for the civic reporting platform. Use for any database, auth, storage, permission, or migration task.
---

# Supabase Secure Data

## Required reading

- `docs/04_DATABASE_DESIGN.md`
- `docs/07_SECURITY_RLS.md`

## Procedure

1. Produce a role-to-operation permission matrix before policies.
2. Use migration files as the source of truth.
3. Add database constraints for every invariant that can be enforced in Postgres.
4. Enable RLS on exposed tables and combine it with least-privilege grants.
5. Keep contact, raw AI, audit, and private evidence inaccessible to anonymous users.
6. Use current Supabase SSR patterns; do not use deprecated auth-helper packages.
7. Keep service-role access in a clearly marked server-only adapter.
8. Use private Storage buckets and signed access where evidence must be shown.
9. Add indexes based on actual query paths.
10. Verify policies with anonymous, government role, department role, and service contexts.

## Forbidden shortcuts

- Disabling RLS.
- Granting blanket access to `anon` or `authenticated`.
- Running untracked dashboard schema changes.
- Returning table rows directly as public API DTOs.
- Exposing service-role credentials to the browser.

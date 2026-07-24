---
name: nextjs-clean-architecture
description: Designs and reviews Next.js App Router features using feature-first Clean Architecture and SOLID boundaries. Use for pages, Server Components, Server Actions, Route Handlers, use cases, repositories, and refactors.
---

# Next.js Clean Architecture

## Rules

1. Read `docs/03_ARCHITECTURE.md`.
2. Identify presentation, application, domain, and infrastructure responsibilities.
3. Keep React/Next.js imports out of domain/application modules.
4. Keep Supabase/provider SDK calls in infrastructure adapters.
5. Use Server Components by default and minimize Client Component boundaries.
6. Use Server Actions for page-coupled mutations and Route Handlers for explicit HTTP APIs/webhooks.
7. Validate at the presentation boundary and again at trusted domain/database boundaries.
8. Use typed result/error contracts.
9. Add ports only for external dependencies or meaningful test substitution.
10. Test use cases with fakes before testing framework adapters.

## Review checklist

- Does each module have one reason to change?
- Can an external provider be swapped without changing business logic?
- Are status/severity/duplicate rules centralized?
- Are route handlers/controllers thin?
- Are client bundles free of server-only code and secrets?
- Are loading, empty, error, and success states explicit?

# Civic Infrastructure AI Platform - Antigravity Project Pack

This pack converts the AI & API Hackathon 2026 brief into a disciplined execution system for Google Antigravity, Next.js, and Supabase.

## Recommended system boundary

- **Next.js App Router**: citizen UI, government UI, server actions, route handlers, orchestration, validation, and authorization checks.
- **Supabase**: Postgres database, Auth for government officials, Storage for evidence, Realtime for dashboard updates, and pgvector/PostGIS where useful.
- **AI provider adapter**: structured category, summary, confidence, severity, rationale, and optional department recommendation.
- **Mapping/geocoding adapter**: normalized address and coordinates.
- **Notification adapter**: optional email/SMS status notifications.

Supabase is not the frontend. It is the managed data/auth/storage platform behind the Next.js application.

## Important hackathon compliance note

The brief requires a new public repository during the on-site hackathon and prohibits pre-written source code or reusable project templates. This pack intentionally contains **planning, prompts, rules, workflows, and non-executable architecture guidance only**. Confirm with the organizers whether project-specific planning documents may be prepared before the event. The safest approach is to study this pack now, then create or regenerate the repository files after the official start time.

## Start here

1. Read `docs/01_PROJECT_BRIEF.md`.
2. Review `docs/02_REQUIREMENTS_TRACEABILITY.md` and lock the MVP scope.
3. Read `docs/03_ARCHITECTURE.md` and `docs/04_DATABASE_DESIGN.md`.
4. Install only the trusted skills listed in `install/INSTALL_COMMANDS.md`.
5. Copy the `.agents/` folder into the fresh on-site repository.
6. Run the `/start-hackathon` workflow.
7. Use `prompts/MASTER_BUILD_PROMPT.md` for the first Antigravity planning conversation.
8. Implement vertically: submission -> tracking -> government management -> AI -> duplicates -> polish.

## Pack contents

- `docs/`: product, architecture, data, API, AI, security, roadmap, team, testing, and decision documents.
- `prompts/`: master and phase-specific prompts.
- `.agents/agents.md`: specialized AI team roles.
- `.agents/rules/`: always-on project guardrails.
- `.agents/workflows/`: repeatable slash-command workflows.
- `.agents/skills/`: project-specific reusable skills.
- `install/INSTALL_COMMANDS.md`: trusted external skills and local tooling.

## Non-negotiable engineering principles

- Build core requirements before bonuses.
- Keep business rules out of React components and route handlers.
- Validate all external input on client and server.
- Government authorization must be enforced server-side and in database policies.
- Never expose the Supabase service-role key to browser code.
- Public tracking responses must never return contact information or internal-only notes.
- AI output is untrusted input: validate it against a strict schema.
- Duplicate detection flags and links reports; it never deletes or blocks citizen submissions.
- Every status change creates immutable history and an audit event.
- Every feature is complete only after tests and a browser verification artifact.

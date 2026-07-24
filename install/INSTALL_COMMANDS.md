# Installation and Trusted Skills

Run installation only in the fresh on-site repository, subject to the competition rules.

## Local prerequisites

- Google Antigravity IDE or CLI.
- Git and a GitHub account.
- Current Node.js LTS and Corepack/pnpm.
- Chrome for Antigravity browser verification.
- Supabase project and Supabase CLI workflow.
- AI provider account/key.
- Mapping/geocoding provider account if required.
- Deployment account.

## Initialize the application

Use a fresh directory/repository and create the application during the official event. A typical command is:

```bash
pnpm create next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Initialize Supabase migrations locally:

```bash
pnpm add -D supabase
pnpm exec supabase init
```

## Trusted external agent skills

### Supabase official skills

Install the two focused Supabase skills into Antigravity project scope:

```bash
npx skills add supabase/agent-skills \
  --skill supabase \
  --skill supabase-postgres-best-practices \
  --agent antigravity \
  --copy \
  --yes
```

### Vercel-maintained React/Next.js and web review skills

```bash
npx skills add vercel-labs/agent-skills \
  --skill react-best-practices \
  --skill web-design-guidelines \
  --agent antigravity \
  --copy \
  --yes
```

Review every installed `SKILL.md` before allowing an autonomous agent to execute commands. Pin or record the commit/version used for reproducibility.

## Project-specific skills

The `.agents/skills/` folder in this pack already contains the required custom skills. Copy it into the repository rather than searching for untrusted equivalents.

## Optional Supabase MCP

The Supabase MCP server can let the coding agent inspect schema, run migrations, and manage project resources. Enable it only after reviewing permissions. Scope it to one hackathon project and prefer read-only mode until migration workflows are understood. Never give a broadly scoped production account to an autonomous agent.

## Runtime package categories

Install only when the relevant phase begins:

### Core

- `@supabase/supabase-js`
- `@supabase/ssr`
- `zod`
- form library and Zod resolver if the team chooses one.

### Dashboard/UI

- accessible component primitives or a credited UI library.
- table library only if native implementation would consume excessive time.
- date formatting utility.

### AI and duplicates

- one provider SDK, not several.
- vector support through Supabase/Postgres.
- geospatial helper only if PostGIS/SQL is not used.

### Testing

- unit/integration runner.
- Playwright for browser E2E.

## Package approval checklist

Before installing:

1. Is it necessary for a mapped requirement?
2. Is the exact package name verified from the official source?
3. Is it actively maintained and compatible with the current stack?
4. Can built-in platform functionality do the job?
5. What client bundle, security, and hackathon attribution cost does it add?

## Recommended package policy

- Avoid ORM introduction unless the team is already highly fluent; Supabase migrations plus typed clients are sufficient for this prototype.
- Avoid Redux/global state unless a concrete cross-route client-state problem appears.
- Avoid multiple component libraries.
- Avoid multiple AI SDKs/providers in the MVP.
- Avoid adding microservices, queues, or workers unless provider latency makes them necessary.

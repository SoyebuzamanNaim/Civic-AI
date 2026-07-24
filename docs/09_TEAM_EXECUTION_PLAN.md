# Team Execution Plan

Assumption: four people total - you plus three teammates.

## Roles

### Person A - Architecture and integration lead

- Owns repository conventions, application use cases, shared types, integration decisions, and final merges.
- Coordinates Antigravity prompts and keeps architecture consistent.
- Avoids becoming the only person who understands the system.

### Person B - Citizen and public experience

- Submission form, evidence UX, success page, tracking page, responsive/accessibility states.
- Works against mocked application interfaces before backend completion.

### Person C - Data, auth, and government management

- Supabase migrations, RLS, government auth, dashboard queries, assignment/status/history.
- Pairs with Person A on security-critical changes.

### Person D - AI, duplicates, testing, and demo

- AI structured output, severity policy, embeddings, duplicate scoring, labeled test cases.
- Owns E2E smoke test and demo dataset/script.

## Integration contracts before parallel work

Agree on these first:

- category/status/severity enums.
- public and government DTOs.
- application use-case signatures.
- table names and migration ownership.
- error codes.
- design primitives and route map.

## Git strategy

- One short-lived branch per feature/task.
- Small PRs; avoid one giant AI-generated commit.
- Require one human reviewer for data/security/AI scoring changes.
- Rebase or merge main frequently.
- Never allow two people or agents to edit the same migration file concurrently.

## Antigravity agent allocation

Use separate conversations/worktrees for:

- architecture/requirements.
- citizen UI.
- database/security.
- AI/duplicates.
- QA/review.

Each agent receives a narrow task, relevant files, acceptance criteria, and explicit forbidden scope. The integration lead reviews artifacts before accepting changes.

## Communication cadence

- 10-minute kickoff: contracts and ownership.
- 5-minute sync every 60-90 minutes: blockers and changed interfaces.
- Integration checkpoint after every vertical phase.
- Feature freeze before final demo; only critical fixes afterward.

## Human understanding rule

Before merging AI-generated code, the owner must explain:

1. What changed.
2. Why the design is correct.
3. How it fails.
4. How it is tested.
5. What secret/permission/data boundary it touches.

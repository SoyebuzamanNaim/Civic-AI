---
description: Run the final engineering, security, deployment, and demo release gate.
---

# Review Release

1. Activate `requirements-guardian`, `testing-quality-gate`, `stride-threat-model`, and `hackathon-demo-readiness`.
2. Audit every mandatory requirement and attach evidence.
3. Run full typecheck, lint, tests, production build, and migration rebuild verification.
4. Verify anonymous, authenticated, and role-scoped permissions.
5. Inspect client assets and repository history for secrets.
6. Exercise AI timeout, invalid output, mapping failure, upload failure, and database error paths.
7. Verify tracking privacy and duplicate behavior.
8. Test the deployed application in an incognito browser.
9. Run the timed demo script using deterministic data.
10. Produce `artifacts/RELEASE_REPORT.md` with blockers, warnings, completed bonuses, deployment URL placeholder, and demo credentials instructions.

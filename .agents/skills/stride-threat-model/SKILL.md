---
name: stride-threat-model
description: Performs a STRIDE threat model for the Next.js, Supabase, AI, mapping, storage, and public tracking architecture. Use during architecture, security review, and release gating.
---

# STRIDE Threat Model

1. Map trust boundaries, identities, data stores, entry points, and external providers.
2. Evaluate:
   - Spoofing: government identity/session and tracking-code guessing.
   - Tampering: report/status/assignment/history/evidence manipulation.
   - Repudiation: missing audit trail for official actions.
   - Information disclosure: contact data, internal notes, signed URLs, secrets, raw AI output.
   - Denial of service: submission spam, AI cost abuse, tracking enumeration, large uploads, expensive vector queries.
   - Elevation of privilege: role/department bypass, service-role leakage, unsafe database functions.
3. For each threat, record asset, attacker, path, impact, existing control, gap, mitigation, owner, and verification.
4. Save/update `artifacts/THREAT_MODEL.md`.
5. Escalate critical/high findings before further bonus work or deployment.

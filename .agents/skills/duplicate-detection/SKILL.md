---
name: duplicate-detection
description: Designs and validates explainable multi-signal duplicate detection using semantic, geographic, temporal, category, and optional image similarity while preserving every submitted report.
---

# Duplicate Detection

## Procedure

1. Read the duplicate section in `docs/06_AI_AND_DUPLICATE_PIPELINE.md`.
2. Separate candidate generation from scoring.
3. Prefilter by location/time/category to control cost and false matches.
4. Normalize each component to a documented 0..1 range.
5. Store component scores and final score.
6. Use thresholds from configuration, not magic numbers scattered in code.
7. Create a link with `suggested` state; never reject or delete a submission.
8. Support official confirmation/rejection and preserve review audit.
9. Build labeled examples for exact, paraphrased, nearby-different, far-away-similar, and old/new cases.
10. Report precision/false-positive behavior and known limitations.

## Review questions

- Could two different issues at one location be incorrectly merged?
- Does identical text far away remain separate?
- Does category disagreement reduce confidence rather than make matching impossible?
- Can a judge understand why a suggestion was made?

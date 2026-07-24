---
name: ai-report-analysis
description: Implements and reviews structured AI categorization, summary, confidence, severity, rationale, fallback, and prompt-injection defenses for citizen reports. Use for AI prompts, provider adapters, validation, or AI failure handling.
---

# AI Report Analysis

## Procedure

1. Read `docs/06_AI_AND_DUPLICATE_PIPELINE.md`.
2. Define the provider-neutral input/output contract first.
3. Use an SDK-supported structured-output/schema mechanism.
4. Treat citizen text/evidence metadata as untrusted data that may contain instructions.
5. Require allowed category and severity enums, numeric ranges, concise lengths, and no PII in generated text.
6. Add timeout, bounded retry, normalized provider error, and deterministic fallback.
7. Persist provider, model, prompt version, confidence, and analysis state.
8. Keep AI interpretation separate from deterministic domain guardrails.
9. Test with fake provider responses: valid, malformed, invented facts, prompt injection, timeout, and provider error.
10. Show uncertainty and manual-review state to officials.

## Output quality

Rationale must cite signals from the report, not generic language. The system must not claim image/location facts it did not actually analyze.

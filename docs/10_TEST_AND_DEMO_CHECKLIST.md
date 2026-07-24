# Test & Demo Checklist

> [!TIP]
> **Master Testing Documentation**: See [TESTING.md](file:///c:/Users/Naiminator/Codebase/hacka-final/TESTING.md) at the repository root for detailed test suite execution, Vitest configurations, and coverage notes across all 18 test files.

---

## Quick Test Verification Commands

```bash
# Run complete Vitest test suite
npm test

# Run TypeScript static type check
npm run check-types
```

## Core Test Suites Summary

1. **AI Analysis & Banglish NLP**: Verifies English & Banglish issue classification and fallback handling (`aiAnalysis.test.ts`, `aiAnalysisBanglish.test.ts`, `aiAnalysisFailover.test.ts`).
2. **Explainable Duplicate Scoring**: Validates multi-signal similarity calculation math (`duplicateEngine.test.ts`, `duplicateScoring.test.ts`, `duplicateReportView.test.ts`).
3. **Security & PII Redaction**: Guarantees citizen PII isolation and public tracking privacy (`publicTrackingPrivacy.test.ts`, `databaseRls.test.ts`).
4. **Government Workflows**: Tests department assignment, status updates, timeline notes, and authentication (`caseManagement.test.ts`, `governmentAuth.test.ts`).
5. **End-to-End & Provider Integration**: Validates submission flow and external APIs (`liveEndToEndSubmission.test.ts`, `liveGeminiAiProvider.test.ts`, `cloudinaryUpload.test.ts`).

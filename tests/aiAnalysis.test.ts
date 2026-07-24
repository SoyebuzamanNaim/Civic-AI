import { GeminiReportAnalysisAdapter } from '@/features/ai-analysis/infrastructure/GeminiReportAnalysisAdapter';
import { describe, expect, it } from 'vitest';

describe('Phase 7 AI Analysis & Fallback Engine Unit Tests', () => {
  const adapter = new GeminiReportAnalysisAdapter();

  it('should generate valid structured analysis output or deterministic fallback', async () => {
    const output = await adapter.analyzeReport(
      'Dangerous deep pothole on Main Street causing vehicular accidents.',
      'Main Street & 4th Ave',
      'pothole'
    );

    expect(output.category).toBe('pothole');
    expect(output.summary).toBeTruthy();
    expect(['low', 'medium', 'high', 'critical']).toContain(output.severityLevel);
    expect(output.severityScore).toBeGreaterThanOrEqual(0);
    expect(output.severityScore).toBeLessThanOrEqual(100);
    expect(output.severityRationale).toBeTruthy();
  });

  it('should generate 768-dimensional vector embedding', async () => {
    const embedding = await adapter.generateEmbedding('Dangerous pothole on road');
    expect(embedding.length).toBe(768);
    expect(embedding.every((v) => typeof v === 'number')).toBe(true);
  });
});

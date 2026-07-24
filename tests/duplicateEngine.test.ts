import { DuplicateScoringEngine } from '@/features/duplicate-detection/application/DuplicateScoringEngine';
import { describe, expect, it } from 'vitest';

describe('Phase 8 Multi-Signal Duplicate Engine Detailed Tests', () => {
  const scorer = new DuplicateScoringEngine();
  const baseTime = new Date('2026-07-24T12:00:00Z');

  it('should compute explainable 4-signal component scores', () => {
    const target = {
      category: 'water_leak' as const,
      latitude: 23.8103,
      longitude: 90.4125,
      submittedAt: baseTime,
      embedding: [0.2, 0.4, 0.6, 0.8],
    };

    const candidate = {
      id: 'cand-water-1',
      trackingCode: 'TRK-9999-8888',
      description: 'Major water pipe leak near street corner',
      category: 'water_leak' as const,
      latitude: 23.8105, // ~25 meters away
      longitude: 90.4127,
      submittedAt: new Date(baseTime.getTime() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours prior
      embedding: [0.2, 0.4, 0.6, 0.8],
    };

    const result = scorer.scoreCandidate(target, candidate);
    expect(result.semanticScore).toBe(1.0);
    expect(result.distanceScore).toBeGreaterThan(0.9);
    expect(result.temporalScore).toBeGreaterThan(0.9);
    expect(result.categoryScore).toBe(1.0);
    expect(result.similarityScore).toBeGreaterThanOrEqual(0.70);
    expect(result.isSuggested).toBe(true);
  });
});

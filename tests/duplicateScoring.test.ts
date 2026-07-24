import { DuplicateScoringEngine } from '@/features/duplicate-detection/application/DuplicateScoringEngine';
import { describe, expect, it } from 'vitest';

describe('DuplicateScoringEngine Unit Tests', () => {
  const engine = new DuplicateScoringEngine();
  const now = new Date('2026-07-24T10:00:00Z');

  it('should score exact duplicate candidate above threshold', () => {
    const target = {
      category: 'pothole' as const,
      latitude: 23.8103,
      longitude: 90.4125,
      submittedAt: now,
      embedding: [0.1, 0.2, 0.3, 0.4],
    };

    const candidate = {
      id: 'cand-1',
      trackingCode: 'TRK-AAAA-BBBB',
      description: 'Pothole on main road',
      category: 'pothole' as const,
      latitude: 23.8103,
      longitude: 90.4125,
      submittedAt: now.toISOString(),
      embedding: [0.1, 0.2, 0.3, 0.4],
    };

    const score = engine.scoreCandidate(target, candidate);
    expect(score.similarityScore).toBeGreaterThanOrEqual(0.70);
    expect(score.isSuggested).toBe(true);
    expect(score.categoryScore).toBe(1.0);
    expect(score.distanceScore).toBe(1.0);
  });

  it('should score far away issue below duplicate threshold', () => {
    const target = {
      category: 'pothole' as const,
      latitude: 23.8103,
      longitude: 90.4125,
      submittedAt: now,
      embedding: [0.1, 0.2, 0.3, 0.4],
    };

    const candidate = {
      id: 'cand-2',
      trackingCode: 'TRK-CCCC-DDDD',
      description: 'Pothole on main road far away',
      category: 'pothole' as const,
      latitude: 24.8103, // ~111km away
      longitude: 91.4125,
      submittedAt: now.toISOString(),
      embedding: [-0.1, -0.2, 0.8, -0.4],
    };

    const score = engine.scoreCandidate(target, candidate);
    expect(score.distanceScore).toBe(0);
    expect(score.isSuggested).toBe(false);
  });
});

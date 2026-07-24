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

  it('should score reports with same location text and same description above threshold even when coordinates are null', () => {
    const target = {
      category: 'pothole' as const,
      latitude: null,
      longitude: null,
      locationText: 'Dhanmondi Lake Road 32',
      submittedAt: now,
      description: 'Dangerous deep pothole near the entrance of Dhanmondi lake park',
    };

    const candidate = {
      id: 'cand-3',
      trackingCode: 'TRK-EEEE-FFFF',
      description: 'Dangerous deep pothole near the entrance of Dhanmondi lake park',
      category: 'pothole' as const,
      latitude: null,
      longitude: null,
      locationText: 'Dhanmondi Lake Road 32',
      submittedAt: now.toISOString(),
    };

    const score = engine.scoreCandidate(target, candidate);
    expect(score.distanceScore).toBe(1.0);
    expect(score.semanticScore).toBe(1.0);
    expect(score.similarityScore).toBe(1.0);
    expect(score.isSuggested).toBe(true);
    expect(isNaN(score.similarityScore)).toBe(false);
  });

  it('should flag duplicate report when same location and similar description match above 0.70 threshold', () => {
    const newSubmission = {
      category: 'water_leak' as const,
      latitude: 23.7508,
      longitude: 90.3775,
      locationText: 'Mirpur Road 10',
      submittedAt: new Date('2026-07-24T12:00:00Z'),
      description: 'Major water pipe burst flooding the main street near bus stop',
    };

    const existingCandidate = {
      id: 'cand-water-77',
      trackingCode: 'TRK-MIRP-4432',
      category: 'water_leak' as const,
      latitude: 23.7509, // ~11 meters away
      longitude: 90.3776,
      locationText: 'Mirpur Road 10',
      submittedAt: '2026-07-24T12:20:00Z', // 20 minutes apart
      description: 'Major water pipe burst flooding the main street near bus stop',
    };

    const result = engine.scoreCandidate(newSubmission, existingCandidate);

    expect(result.similarityScore).toBeGreaterThanOrEqual(0.70); // Scores 0.9908 >= 0.70 threshold
    expect(result.semanticScore).toBe(1.0);
    expect(result.distanceScore).toBeGreaterThan(0.95);
    expect(result.temporalScore).toBeGreaterThan(0.95);
    expect(result.categoryScore).toBe(1.0);
    expect(result.isSuggested).toBe(true); // Flagged as duplicate
  });
});

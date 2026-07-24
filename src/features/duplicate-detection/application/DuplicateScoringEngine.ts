import { IssueCategory } from '@/shared/domain/types';

export interface CandidateReport {
  id: string;
  trackingCode: string;
  description: string;
  category: IssueCategory;
  latitude?: number;
  longitude?: number;
  submittedAt: string;
  embedding?: number[];
}

export interface DuplicateScoringResult {
  candidateReportId: string;
  similarityScore: number;
  semanticScore: number;
  distanceScore: number;
  temporalScore: number;
  categoryScore: number;
  isSuggested: boolean;
}

export class DuplicateScoringEngine {
  private threshold: number;
  private maxRadiusMeters: number;
  private maxTimeWindowDays: number;

  constructor() {
    this.threshold = parseFloat(process.env.DUPLICATE_SCORE_THRESHOLD || '0.70');
    this.maxRadiusMeters = parseFloat(process.env.DUPLICATE_RADIUS_METERS || '500');
    this.maxTimeWindowDays = parseFloat(process.env.DUPLICATE_TIME_WINDOW_DAYS || '14');
  }

  public scoreCandidate(
    target: {
      category: IssueCategory;
      latitude?: number;
      longitude?: number;
      submittedAt: Date;
      embedding?: number[];
    },
    candidate: CandidateReport
  ): DuplicateScoringResult {
    // 1. Semantic Cosine Distance Score (0.45 weight)
    const semanticScore =
      target.embedding && candidate.embedding
        ? this.calculateCosineSimilarity(target.embedding, candidate.embedding)
        : 0.5;

    // 2. Geographic Distance Score (0.30 weight)
    let distanceScore = 0.5;
    if (
      target.latitude !== undefined &&
      target.longitude !== undefined &&
      candidate.latitude !== undefined &&
      candidate.longitude !== undefined
    ) {
      const distMeters = this.calculateHaversine(
        target.latitude,
        target.longitude,
        candidate.latitude,
        candidate.longitude
      );
      distanceScore = Math.max(0, 1 - distMeters / this.maxRadiusMeters);
    }

    // 3. Temporal Proximity Score (0.15 weight)
    const targetTime = target.submittedAt.getTime();
    const candidateTime = new Date(candidate.submittedAt).getTime();
    const diffDays = Math.abs(targetTime - candidateTime) / (1000 * 60 * 60 * 24);
    const temporalScore = Math.max(0, 1 - diffDays / this.maxTimeWindowDays);

    // 4. Category Compatibility Score (0.10 weight)
    const categoryScore = target.category === candidate.category ? 1.0 : 0.0;

    // Multi-signal Weighted Calculation
    const similarityScore =
      0.45 * semanticScore +
      0.30 * distanceScore +
      0.15 * temporalScore +
      0.10 * categoryScore;

    const roundedScore = Math.round(similarityScore * 10000) / 10000;

    return {
      candidateReportId: candidate.id,
      similarityScore: roundedScore,
      semanticScore: Math.round(semanticScore * 10000) / 10000,
      distanceScore: Math.round(distanceScore * 10000) / 10000,
      temporalScore: Math.round(temporalScore * 10000) / 10000,
      categoryScore: Math.round(categoryScore * 10000) / 10000,
      isSuggested: roundedScore >= this.threshold,
    };
  }

  private calculateCosineSimilarity(v1: number[], v2: number[]): number {
    if (v1.length !== v2.length || v1.length === 0) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < v1.length; i++) {
      dot += v1[i] * v2[i];
      normA += v1[i] * v1[i];
      normB += v2[i] * v2[i];
    }
    if (normA === 0 || normB === 0) return 0;
    const sim = dot / (Math.sqrt(normA) * Math.sqrt(normB));
    return Math.min(Math.max(sim, 0), 1);
  }

  private calculateHaversine(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

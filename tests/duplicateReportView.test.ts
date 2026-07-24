import { describe, expect, it } from 'vitest';

interface DuplicateLinkRow {
  id: string;
  report_id: string;
  candidate_report_id: string;
  similarity_score: number;
  semantic_score: number;
  distance_score: number;
  temporal_score: number;
  category_score: number;
  status: string;
  candidate_report?: {
    id: string;
    tracking_code: string;
    description: string;
    final_category: string;
    submitted_at: string;
  } | {
    id: string;
    tracking_code: string;
    description: string;
    final_category: string;
    submitted_at: string;
  }[];
  source_report?: {
    id: string;
    tracking_code: string;
    description: string;
    final_category: string;
    submitted_at: string;
  } | {
    id: string;
    tracking_code: string;
    description: string;
    final_category: string;
    submitted_at: string;
  }[];
}

function resolveCandidateReport(link: DuplicateLinkRow, currentReportId: string) {
  const rawCand = link.report_id === currentReportId ? link.candidate_report : link.source_report;
  const cand = Array.isArray(rawCand) ? rawCand[0] : rawCand;
  return cand;
}

describe('Bidirectional Duplicate Report Resolution', () => {
  const reportA = {
    id: 'report-a-id',
    tracking_code: 'TRK-AAAA-1111',
    description: 'Deep pothole on 5th street',
    final_category: 'pothole',
    submitted_at: '2026-07-24T10:00:00Z',
  };

  const reportB = {
    id: 'report-b-id',
    tracking_code: 'TRK-BBBB-2222',
    description: 'Big pothole on 5th avenue intersection',
    final_category: 'pothole',
    submitted_at: '2026-07-24T10:05:00Z',
  };

  // Row inserted when B is submitted: report_id = B, candidate_report_id = A
  const linkRow: DuplicateLinkRow = {
    id: 'link-1',
    report_id: reportB.id,
    candidate_report_id: reportA.id,
    similarity_score: 0.85,
    semantic_score: 0.8,
    distance_score: 0.9,
    temporal_score: 0.95,
    category_score: 1.0,
    status: 'suggested',
    candidate_report: reportA,
    source_report: reportB,
  };

  it('should correctly resolve Report A as candidate when viewing Report B', () => {
    const cand = resolveCandidateReport(linkRow, reportB.id);
    expect(cand).toBeDefined();
    expect(cand?.id).toBe(reportA.id);
    expect(cand?.tracking_code).toBe('TRK-AAAA-1111');
  });

  it('should correctly resolve Report B as candidate when viewing Report A', () => {
    const cand = resolveCandidateReport(linkRow, reportA.id);
    expect(cand).toBeDefined();
    expect(cand?.id).toBe(reportB.id);
    expect(cand?.tracking_code).toBe('TRK-BBBB-2222');
  });
});

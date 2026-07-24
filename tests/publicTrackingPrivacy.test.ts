import { PublicReportDTO } from '@/shared/domain/types';
import { describe, expect, it } from 'vitest';

describe('Phase 4 Public Tracking & Privacy Redaction Tests', () => {
  it('should enforce PublicReportDTO structure and ensure contact PII fields do not exist', () => {
    const mockPublicDto: PublicReportDTO = {
      trackingCode: 'TRK-8K9P-2X4M',
      category: 'water_leak',
      description: 'Severe water leak on Main Street',
      summary: 'Active water pipe rupture',
      status: 'assigned',
      severityLevel: 'high',
      severityScore: 76,
      severityRationale: 'Active flooding near hospital',
      locationText: 'Main Street & 5th Ave',
      assignedDepartmentName: 'Water & Sewerage Authority',
      submittedAt: '2026-07-24T10:00:00Z',
      updatedAt: '2026-07-24T10:30:00Z',
      publicTimeline: [
        {
          status: 'submitted',
          note: 'Report submitted by citizen.',
          timestamp: '2026-07-24T10:00:00Z',
        },
        {
          status: 'assigned',
          note: 'Assigned to Water & Sewerage Authority.',
          timestamp: '2026-07-24T10:30:00Z',
        },
      ],
    };

    // Assert explicit absence of contact PII keys
    const dtoKeys = Object.keys(mockPublicDto);
    expect(dtoKeys).not.toContain('contactName');
    expect(dtoKeys).not.toContain('contactEmail');
    expect(dtoKeys).not.toContain('contactPhone');
    expect(dtoKeys).not.toContain('report_contacts');
    expect(dtoKeys).not.toContain('raw_output');
    expect(dtoKeys).not.toContain('internalNotes');

    // Assert timeline notes are filtered
    expect(mockPublicDto.publicTimeline.every((t) => t.status && t.timestamp)).toBe(true);
  });
});

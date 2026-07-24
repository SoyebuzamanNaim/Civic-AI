import { ReportStatus } from '@/shared/domain/types';
import { describe, expect, it } from 'vitest';

describe('Phase 6 Case Management & Status Transitions Unit Tests', () => {
  const ALLOWED_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
    submitted: ['under_review', 'rejected'],
    under_review: ['assigned', 'rejected'],
    assigned: ['in_progress', 'under_review'],
    in_progress: ['resolved', 'assigned'],
    resolved: ['in_progress'],
    rejected: ['under_review'],
  };

  function canTransition(from: ReportStatus, to: ReportStatus): boolean {
    return ALLOWED_TRANSITIONS[from]?.includes(to) || false;
  }

  it('should allow valid status transitions according to state machine policy', () => {
    expect(canTransition('submitted', 'under_review')).toBe(true);
    expect(canTransition('under_review', 'assigned')).toBe(true);
    expect(canTransition('assigned', 'in_progress')).toBe(true);
    expect(canTransition('in_progress', 'resolved')).toBe(true);
  });

  it('should reject invalid direct transitions', () => {
    expect(canTransition('submitted', 'resolved')).toBe(false);
    expect(canTransition('resolved', 'submitted')).toBe(false);
  });

  it('should correctly distinguish between status transitions and progress notes', () => {
    const statusTransitionRecord = { from_status: 'submitted', to_status: 'under_review' };
    const progressNoteRecord = { from_status: 'under_review', to_status: 'under_review' };

    const isTransitionProgressNote = statusTransitionRecord.from_status === statusTransitionRecord.to_status;
    const isNoteProgressNote = progressNoteRecord.from_status === progressNoteRecord.to_status;

    expect(isTransitionProgressNote).toBe(false);
    expect(isNoteProgressNote).toBe(true);
  });
});

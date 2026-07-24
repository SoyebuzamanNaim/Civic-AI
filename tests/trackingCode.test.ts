import { generateTrackingCode } from '@/features/reporting/domain/generateTrackingCode';
import { describe, expect, it } from 'vitest';

describe('Tracking Code Generator Unit Tests', () => {
  it('should generate valid TRK-XXXX-XXXX format', () => {
    const code = generateTrackingCode();
    expect(code).toMatch(/^TRK-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/);
  });

  it('should produce distinct high-entropy codes on consecutive calls', () => {
    const code1 = generateTrackingCode();
    const code2 = generateTrackingCode();
    expect(code1).not.toEqual(code2);
  });
});

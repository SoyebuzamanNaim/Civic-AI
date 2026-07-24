import { generateTrackingCode } from '@/features/reporting/domain/generateTrackingCode';
import { citizenReportFormSchema } from '@/features/reporting/presentation/validationSchema';
import { describe, expect, it } from 'vitest';

describe('Phase 3 Citizen Submission Vertical Slice Tests', () => {
  it('should validate complete citizen report input', () => {
    const validForm = {
      description: 'Deep hazardous pothole on Main Street near central school gate.',
      citizenCategory: 'pothole',
      locationText: 'Main Street & 4th Avenue',
      latitude: 23.8103,
      longitude: 90.4125,
      contactName: 'Citizen Jane',
      contactEmail: 'jane@example.com',
      contactPhone: '+8801700000000',
      consentToContact: true,
    };

    const parseResult = citizenReportFormSchema.safeParse(validForm);
    expect(parseResult.success).toBe(true);
  });

  it('should generate high-entropy tracking code with TRK prefix', () => {
    const code = generateTrackingCode();
    expect(code.startsWith('TRK-')).toBe(true);
    expect(code.length).toBe(13); // TRK-XXXX-XXXX
  });

  it('should reject descriptions shorter than 10 characters', () => {
    const invalidForm = {
      description: 'Too short',
      locationText: 'Main Street',
    };

    const parseResult = citizenReportFormSchema.safeParse(invalidForm);
    expect(parseResult.success).toBe(false);
    if (!parseResult.success) {
      expect(parseResult.error.issues[0].message).toContain('at least 10 characters');
    }
  });
});

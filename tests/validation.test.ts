import { citizenReportFormSchema } from '@/features/reporting/presentation/validationSchema';
import { describe, expect, it } from 'vitest';

describe('Citizen Report Validation Schema Unit Tests', () => {
  it('should pass valid citizen report input', () => {
    const input = {
      description: 'Severe water leak near hospital gate causing road flood.',
      citizenCategory: 'water_leak',
      locationText: 'Main Street & 5th Avenue',
      contactName: 'John Doe',
      contactEmail: 'john@example.com',
      consentToContact: true,
    };

    const res = citizenReportFormSchema.safeParse(input);
    expect(res.success).toBe(true);
  });

  it('should fail when description is under 10 characters', () => {
    const input = {
      description: 'Short',
      locationText: 'Main Street',
    };

    const res = citizenReportFormSchema.safeParse(input);
    expect(res.success).toBe(false);
  });
});

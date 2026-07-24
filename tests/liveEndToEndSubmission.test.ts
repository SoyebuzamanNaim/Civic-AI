import { describe, expect, it } from 'vitest';
import { SubmitReportUseCase } from '@/features/reporting/application/SubmitReportUseCase';
import { GetPublicTrackingViewUseCase } from '@/features/tracking/application/GetPublicTrackingViewUseCase';

describe('Live End-to-End Report Submission & Public Tracking Test', () => {
  it('should submit a report to live Supabase database and retrieve it via public tracking code without 404 error', async () => {
    const submitUseCase = new SubmitReportUseCase();
    const trackingUseCase = new GetPublicTrackingViewUseCase();

    // 1. Submit a report
    const submitResult = await submitUseCase.execute({
      description: 'Severe water pipeline leakage flooding Mirpur 10 roundabout causing traffic disruption.',
      locationText: 'Mirpur 10 Circle, Dhaka',
      citizenCategory: 'water_leak',
      contactName: 'Test Citizen',
      contactEmail: 'citizen@example.com',
      consentToContact: true,
    });

    expect(submitResult.success).toBe(true);
    if (!submitResult.success) return;

    const { trackingCode, category, summary, severityLevel } = submitResult.data;
    expect(trackingCode).toBeTruthy();
    expect(trackingCode.length).toBeGreaterThan(6);
    expect(category).toBe('water_leak');
    expect(summary).toBeTruthy();
    expect(severityLevel).toBeTruthy();

    // 2. Query Public Tracking View (simulating /report/success/[trackingCode] and /track/[trackingCode])
    const trackResult = await trackingUseCase.execute(trackingCode);

    expect(trackResult.success).toBe(true);
    if (!trackResult.success) return;

    const publicReport = trackResult.data;
    expect(publicReport.trackingCode).toBe(trackingCode);
    expect(publicReport.category).toBe('water_leak');
    expect(publicReport.summary).toBeTruthy();
    expect(publicReport.status).toBe('submitted');
    expect(publicReport.publicTimeline.length).toBeGreaterThan(0);
  }, 20000);
});

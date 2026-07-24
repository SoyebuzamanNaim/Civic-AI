import { err, ok, Result } from '@/shared/domain/Result';
import { PublicReportDTO } from '@/shared/domain/types';
import { createAdminClient } from '@/shared/infrastructure/supabase/admin';

export class GetPublicTrackingViewUseCase {
  async execute(trackingCode: string): Promise<Result<PublicReportDTO>> {
    try {
      const adminClient = createAdminClient();

      // 1. Query Core Report Record
      const { data: report, error: reportError } = await adminClient
        .from('reports')
        .select(`
          id,
          tracking_code,
          description,
          final_category,
          status,
          severity_level,
          severity_score,
          location_text,
          assigned_department_id,
          submitted_at,
          updated_at,
          departments ( name )
        `)
        .eq('tracking_code', trackingCode)
        .single();

      if (reportError || !report) {
        return err(new Error('Report not found with the specified tracking code.'));
      }

      // 2. Query Latest AI Analysis for Summary & Public Rationale
      const { data: aiAnalysis } = await adminClient
        .from('report_ai_analyses')
        .select('summary, severity_rationale')
        .eq('report_id', report.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // 3. Query Public Timeline Status History (Strictly visibility == 'public')
      const { data: historyRows } = await adminClient
        .from('report_status_history')
        .select('to_status, note, created_at')
        .eq('report_id', report.id)
        .eq('visibility', 'public')
        .order('created_at', { ascending: true });

      const publicTimeline = (historyRows || []).map((h) => ({
        status: h.to_status,
        note: h.note,
        timestamp: h.created_at,
      }));

      // 4. Construct Explicit Redacted Public DTO
      const publicDto: PublicReportDTO = {
        trackingCode: report.tracking_code,
        category: report.final_category,
        description: report.description,
        summary: aiAnalysis?.summary || report.description.substring(0, 150),
        status: report.status,
        severityLevel: report.severity_level,
        severityRationale: aiAnalysis?.severity_rationale || 'Evaluated by civic infrastructure management.',
        locationText: report.location_text,
        assignedDepartmentName: (report.departments as unknown as { name: string } | null)?.name || null,
        submittedAt: report.submitted_at,
        updatedAt: report.updated_at,
        publicTimeline,
      };

      return ok(publicDto);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to retrieve public tracking information.';
      return err(new Error(msg));
    }
  }
}

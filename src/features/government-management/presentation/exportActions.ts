'use server';

import { createAdminClient } from '@/shared/infrastructure/supabase/admin';

export async function exportReportsCsvAction(): Promise<string> {
  const adminClient = createAdminClient();
  const { data: reports } = await adminClient
    .from('reports')
    .select(`
      tracking_code,
      description,
      final_category,
      status,
      severity_level,
      severity_score,
      location_text,
      submitted_at,
      departments ( name )
    `)
    .order('submitted_at', { ascending: false });

  if (!reports || reports.length === 0) {
    return 'Tracking Code,Category,Severity Level,Severity Score,Status,Location,Department,Submitted At\n';
  }

  const headers = ['Tracking Code', 'Category', 'Severity Level', 'Severity Score', 'Status', 'Location', 'Department', 'Submitted At'];
  const rows = reports.map((r) => {
    const deptName = (r.departments as unknown as { name: string } | null)?.name || 'Unassigned';
    const cleanLoc = (r.location_text || '').replaceAll('"', '""');
    return [
      `"${r.tracking_code}"`,
      `"${r.final_category}"`,
      `"${r.severity_level}"`,
      r.severity_score,
      `"${r.status}"`,
      `"${cleanLoc}"`,
      `"${deptName}"`,
      `"${r.submitted_at}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export async function generateExecutiveSummaryAction(): Promise<string> {
  const adminClient = createAdminClient();
  const { data: reports } = await adminClient
    .from('reports')
    .select('final_category, severity_level, status, location_text')
    .limit(50);

  const total = reports?.length || 0;
  const criticals = reports?.filter((r) => r.severity_level === 'critical').length || 0;
  const unassigned = reports?.filter((r) => r.status === 'submitted' || r.status === 'under_review').length || 0;
  const categories = Array.from(new Set(reports?.map((r) => r.final_category.replace('_', ' ')) || []));

  return `EXECUTIVE MUNICIPAL INFRASTRUCTURE BRIEF:
- Total Active Incidents: ${total}
- High-Priority / Critical Safety Risks: ${criticals}
- Unassigned / Dispatch Pending: ${unassigned}
- Dominant Hazard Categories: ${categories.join(', ') || 'Pothole, Broken Streetlight, Water Leak'}
- Operational Recommendation: Deploy field inspection units to urgent clusters and prioritize high-risk water leak & road structural failures.`;
}

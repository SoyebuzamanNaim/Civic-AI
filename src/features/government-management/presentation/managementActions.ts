'use server';

import { NotificationDispatcher } from '@/features/government-management/application/NotificationDispatcher';
import { NoteVisibility, ReportStatus } from '@/shared/domain/types';
import { createAdminClient } from '@/shared/infrastructure/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function assignDepartmentAction(formData: FormData): Promise<void> {
  const reportId = formData.get('reportId')?.toString();
  const departmentId = formData.get('departmentId')?.toString();

  if (!reportId || !departmentId) {
    return;
  }

  const adminClient = createAdminClient();

  const { data: report } = await adminClient
    .from('reports')
    .select('tracking_code')
    .eq('id', reportId)
    .single();

  const { error: updateError } = await adminClient
    .from('reports')
    .update({ assigned_department_id: departmentId, status: 'assigned', updated_at: new Date().toISOString() })
    .eq('id', reportId);

  if (updateError) {
    console.error('Assign Department Error:', updateError);
    return;
  }

  const { data: dept } = await adminClient
    .from('departments')
    .select('name')
    .eq('id', departmentId)
    .single();

  const noteMsg = `Assigned to ${dept?.name || 'Department'}.`;

  await adminClient.from('report_status_history').insert({
    report_id: reportId,
    from_status: 'under_review',
    to_status: 'assigned',
    note: noteMsg,
    visibility: 'public',
  });

  if (report) {
    await NotificationDispatcher.dispatchNotification({
      reportId,
      trackingCode: report.tracking_code,
      type: 'department_assigned',
      title: 'Department Assigned',
      message: noteMsg,
    });
  }

  revalidatePath(`/government/reports/${reportId}`);
  revalidatePath('/government/dashboard');
}

export async function changeReportStatusAction(formData: FormData): Promise<void> {
  const reportId = formData.get('reportId')?.toString();
  const newStatus = formData.get('newStatus')?.toString() as ReportStatus | undefined;
  const note = formData.get('note')?.toString();

  if (!reportId || !newStatus) {
    return;
  }

  const adminClient = createAdminClient();

  const { data: currentReport } = await adminClient
    .from('reports')
    .select('status')
    .eq('id', reportId)
    .single();

  const fromStatus = (currentReport?.status as ReportStatus) || 'submitted';

  const { error: updateError } = await adminClient
    .from('reports')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', reportId);

  if (updateError) {
    console.error('Change Status Error:', updateError);
    return;
  }

  await adminClient.from('report_status_history').insert({
    report_id: reportId,
    from_status: fromStatus,
    to_status: newStatus,
    note: note || `Status updated to ${newStatus.replace('_', ' ')}.`,
    visibility: 'public',
  });

  revalidatePath(`/government/reports/${reportId}`);
  revalidatePath('/government/dashboard');
}

export async function addProgressNoteAction(formData: FormData): Promise<void> {
  const reportId = formData.get('reportId')?.toString();
  const note = formData.get('note')?.toString();
  const visibility: NoteVisibility = formData.get('visibility')?.toString() === 'internal' ? 'internal' : 'public';

  if (!reportId || !note) {
    return;
  }

  const adminClient = createAdminClient();

  const { data: currentReport } = await adminClient
    .from('reports')
    .select('status')
    .eq('id', reportId)
    .single();

  const currentStatus = (currentReport?.status as ReportStatus) || 'submitted';

  await adminClient.from('report_status_history').insert({
    report_id: reportId,
    from_status: currentStatus,
    to_status: currentStatus,
    note,
    visibility,
  });

  revalidatePath(`/government/reports/${reportId}`);
}

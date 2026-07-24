'use server';

import { NotificationDispatcher } from '@/features/government-management/application/NotificationDispatcher';
import { DuplicateStatus, NoteVisibility, ReportStatus } from '@/shared/domain/types';
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
    .select('tracking_code, status')
    .eq('id', reportId)
    .single();

  const fromStatus = (report?.status as ReportStatus) || 'submitted';

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
    from_status: fromStatus,
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
    revalidatePath(`/track/${report.tracking_code}`);
    revalidatePath('/track');
  }

  revalidatePath(`/government/reports/${reportId}`);
  revalidatePath('/government/dashboard');
}

export async function changeReportStatusAction(formData: FormData): Promise<void> {
  const reportId = formData.get('reportId')?.toString();
  const newStatus = formData.get('newStatus')?.toString() as ReportStatus | undefined;
  const note = formData.get('note')?.toString()?.trim();

  if (!reportId || !newStatus) {
    return;
  }

  const adminClient = createAdminClient();

  const { data: currentReport } = await adminClient
    .from('reports')
    .select('status, tracking_code')
    .eq('id', reportId)
    .single();

  const fromStatus = (currentReport?.status as ReportStatus) || 'submitted';
  const statusNote = note || `Status updated from ${fromStatus.replace('_', ' ')} to ${newStatus.replace('_', ' ')}.`;

  const updateData: Record<string, unknown> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (newStatus === 'resolved') {
    updateData.resolved_at = new Date().toISOString();
  } else {
    updateData.resolved_at = null;
  }

  const { error: updateError } = await adminClient
    .from('reports')
    .update(updateData)
    .eq('id', reportId);

  if (updateError) {
    console.error('Change Status Error:', updateError);
    return;
  }

  await adminClient.from('report_status_history').insert({
    report_id: reportId,
    from_status: fromStatus,
    to_status: newStatus,
    note: statusNote,
    visibility: 'public',
  });

  if (currentReport?.tracking_code) {
    await NotificationDispatcher.dispatchNotification({
      reportId,
      trackingCode: currentReport.tracking_code,
      type: 'status_update',
      title: `Status Updated to ${newStatus.replace('_', ' ')}`,
      message: statusNote,
    });
    revalidatePath(`/track/${currentReport.tracking_code}`);
    revalidatePath('/track');
  }

  revalidatePath(`/government/reports/${reportId}`);
  revalidatePath('/government/dashboard');
}

export async function addProgressNoteAction(formData: FormData): Promise<void> {
  const reportId = formData.get('reportId')?.toString();
  const note = formData.get('note')?.toString()?.trim();
  const visibility: NoteVisibility = formData.get('visibility')?.toString() === 'internal' ? 'internal' : 'public';

  if (!reportId || !note) {
    return;
  }

  const adminClient = createAdminClient();

  const { data: currentReport } = await adminClient
    .from('reports')
    .select('status, tracking_code')
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

  if (visibility === 'public' && currentReport?.tracking_code) {
    await NotificationDispatcher.dispatchNotification({
      reportId,
      trackingCode: currentReport.tracking_code,
      type: 'progress_note',
      title: 'New Public Progress Note Added',
      message: note,
    });
    revalidatePath(`/track/${currentReport.tracking_code}`);
    revalidatePath('/track');
  }

  revalidatePath(`/government/reports/${reportId}`);
  revalidatePath('/government/dashboard');
}

export async function updateDuplicateStatusAction(formData: FormData): Promise<void> {
  const linkId = formData.get('linkId')?.toString();
  const newStatus = formData.get('status')?.toString() as DuplicateStatus;
  const reportId = formData.get('reportId')?.toString();

  if (!linkId || !newStatus || !['confirmed', 'rejected', 'suggested'].includes(newStatus)) {
    return;
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from('report_duplicate_links')
    .update({ status: newStatus, reviewed_at: new Date().toISOString() })
    .eq('id', linkId);

  if (error) {
    console.error('Update Duplicate Status Error:', error);
    return;
  }

  if (reportId) {
    revalidatePath(`/government/reports/${reportId}`);
    revalidatePath('/government/dashboard');
  }
}

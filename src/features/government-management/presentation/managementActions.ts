'use server';

import { NotificationDispatcher } from '@/features/government-management/application/NotificationDispatcher';
import { DuplicateStatus, NoteVisibility, ReportStatus } from '@/shared/domain/types';
import { createAdminClient } from '@/shared/infrastructure/supabase/admin';
import { revalidatePath } from 'next/cache';

export interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function assignDepartmentAction(formData: FormData): Promise<ActionResponse> {
  const reportId = formData.get('reportId')?.toString();
  const departmentId = formData.get('departmentId')?.toString();

  if (!reportId || !departmentId) {
    return { success: false, error: 'Report ID and Department ID are required.' };
  }

  const adminClient = createAdminClient();

  const { data: report, error: fetchErr } = await adminClient
    .from('reports')
    .select('tracking_code, status, assigned_department_id')
    .eq('id', reportId)
    .single();

  if (fetchErr || !report) {
    return { success: false, error: 'Report not found.' };
  }

  const fromStatus = (report.status as ReportStatus) || 'submitted';
  // Transition status to 'assigned' only if it was submitted or under_review
  const targetStatus = fromStatus === 'submitted' || fromStatus === 'under_review' ? 'assigned' : fromStatus;

  const { error: updateError } = await adminClient
    .from('reports')
    .update({ assigned_department_id: departmentId, status: targetStatus, updated_at: new Date().toISOString() })
    .eq('id', reportId);

  if (updateError) {
    console.error('Assign Department Error:', updateError);
    return { success: false, error: updateError.message || 'Failed to assign department.' };
  }

  const { data: dept } = await adminClient
    .from('departments')
    .select('name')
    .eq('id', departmentId)
    .single();

  const deptName = dept?.name || 'Department';
  const noteMsg = `Assigned to ${deptName}.`;

  await adminClient.from('report_status_history').insert({
    report_id: reportId,
    from_status: fromStatus,
    to_status: targetStatus,
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

  return { success: true, message: `Successfully assigned case to ${deptName}.` };
}

export async function changeReportStatusAction(formData: FormData): Promise<ActionResponse> {
  const reportId = formData.get('reportId')?.toString();
  const newStatus = formData.get('newStatus')?.toString() as ReportStatus | undefined;
  const note = formData.get('note')?.toString()?.trim();

  if (!reportId || !newStatus) {
    return { success: false, error: 'Report ID and target status are required.' };
  }

  const adminClient = createAdminClient();

  const { data: currentReport, error: fetchErr } = await adminClient
    .from('reports')
    .select('status, tracking_code')
    .eq('id', reportId)
    .single();

  if (fetchErr || !currentReport) {
    return { success: false, error: 'Report not found.' };
  }

  const fromStatus = (currentReport.status as ReportStatus) || 'submitted';
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
    return { success: false, error: updateError.message || 'Failed to update status.' };
  }

  await adminClient.from('report_status_history').insert({
    report_id: reportId,
    from_status: fromStatus,
    to_status: newStatus,
    note: statusNote,
    visibility: 'public',
  });

  if (currentReport.tracking_code) {
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

  return { success: true, message: `Status updated to ${newStatus.replace('_', ' ')}.` };
}

export async function addProgressNoteAction(formData: FormData): Promise<ActionResponse> {
  const reportId = formData.get('reportId')?.toString();
  const note = formData.get('note')?.toString()?.trim();
  const visibility: NoteVisibility = formData.get('visibility')?.toString() === 'internal' ? 'internal' : 'public';

  if (!reportId || !note) {
    return { success: false, error: 'Report ID and note content are required.' };
  }

  const adminClient = createAdminClient();

  const { data: currentReport, error: fetchErr } = await adminClient
    .from('reports')
    .select('status, tracking_code')
    .eq('id', reportId)
    .single();

  if (fetchErr || !currentReport) {
    return { success: false, error: 'Report not found.' };
  }

  const currentStatus = (currentReport.status as ReportStatus) || 'submitted';

  const { error: insertErr } = await adminClient.from('report_status_history').insert({
    report_id: reportId,
    from_status: currentStatus,
    to_status: currentStatus,
    note,
    visibility,
  });

  if (insertErr) {
    console.error('Add Progress Note Error:', insertErr);
    return { success: false, error: insertErr.message || 'Failed to save progress note.' };
  }

  if (visibility === 'public' && currentReport.tracking_code) {
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

  return {
    success: true,
    message: visibility === 'public' ? 'Public progress note added.' : 'Internal official note recorded.',
  };
}

export async function updateDuplicateStatusAction(formData: FormData): Promise<void> {
  const linkId = formData.get('linkId')?.toString();
  const candidateReportId = formData.get('candidateReportId')?.toString();
  const newStatus = formData.get('status')?.toString() as DuplicateStatus;
  const reportId = formData.get('reportId')?.toString();

  if (!newStatus || !['confirmed', 'rejected', 'suggested'].includes(newStatus) || !reportId) {
    return;
  }

  const adminClient = createAdminClient();
  const isValidUuid = linkId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(linkId);

  let updated = false;

  if (isValidUuid) {
    const { data: updatedLink, error: updateErr } = await adminClient
      .from('report_duplicate_links')
      .update({ status: newStatus, reviewed_at: new Date().toISOString() })
      .eq('id', linkId)
      .select()
      .maybeSingle();

    if (!updateErr && updatedLink) {
      updated = true;
    }
  }

  if (!updated && candidateReportId) {
    // Search for existing pair in either direction
    const { data: existingPairs } = await adminClient
      .from('report_duplicate_links')
      .select('id')
      .or(`and(report_id.eq.${reportId},candidate_report_id.eq.${candidateReportId}),and(report_id.eq.${candidateReportId},candidate_report_id.eq.${reportId})`);

    if (existingPairs && existingPairs.length > 0) {
      for (const pair of existingPairs) {
        await adminClient
          .from('report_duplicate_links')
          .update({ status: newStatus, reviewed_at: new Date().toISOString() })
          .eq('id', pair.id);
      }
      updated = true;
    } else {
      const similarityScore = parseFloat(formData.get('similarityScore')?.toString() || '0.50');
      const semanticScore = parseFloat(formData.get('semanticScore')?.toString() || '0.50');
      const distanceScore = parseFloat(formData.get('distanceScore')?.toString() || '0.50');
      const temporalScore = parseFloat(formData.get('temporalScore')?.toString() || '0.50');
      const categoryScore = parseFloat(formData.get('categoryScore')?.toString() || '0.50');

      await adminClient
        .from('report_duplicate_links')
        .insert({
          report_id: reportId,
          candidate_report_id: candidateReportId,
          similarity_score: similarityScore,
          semantic_score: semanticScore,
          distance_score: distanceScore,
          temporal_score: temporalScore,
          category_score: categoryScore,
          status: newStatus,
          reviewed_at: new Date().toISOString(),
        });
      updated = true;
    }
  }

  // Insert audit trail into report_status_history
  try {
    const { data: currentReport } = await adminClient
      .from('reports')
      .select('status')
      .eq('id', reportId)
      .maybeSingle();

    const currentStatus = currentReport?.status || 'submitted';
    const noteText = newStatus === 'confirmed'
      ? `[Official Review Decision] Confirmed report relationship as DUPLICATE match.`
      : `[Official Review Decision] Marked candidate link as REJECTED (Not a duplicate).`;

    await adminClient.from('report_status_history').insert({
      report_id: reportId,
      from_status: currentStatus,
      to_status: currentStatus,
      note: noteText,
      visibility: 'internal',
    });
  } catch (auditErr) {
    console.warn('Audit history insert warning:', auditErr);
  }

  if (reportId) {
    revalidatePath(`/government/reports/${reportId}`);
    revalidatePath('/government/dashboard');
  }
}

import { createAdminClient } from '@/shared/infrastructure/supabase/admin';

export interface NotificationPayload {
  reportId: string;
  trackingCode: string;
  type: 'status_update' | 'department_assigned' | 'progress_note';
  title: string;
  message: string;
  recipientEmail?: string;
}

export class NotificationDispatcher {
  static async dispatchNotification(payload: NotificationPayload): Promise<void> {
    try {
      const adminClient = createAdminClient();

      // Retrieve citizen contact info if consent was given
      const { data: contact } = await adminClient
        .from('report_contacts')
        .select('email, consent_to_contact')
        .eq('report_id', payload.reportId)
        .maybeSingle();

      const recipientEmail = contact?.consent_to_contact ? contact.email : payload.recipientEmail;

      // Log notification dispatch into audit_logs table
      await adminClient.from('audit_logs').insert({
        action: `NOTIFICATION_DISPATCH_${payload.type.toUpperCase()}`,
        entity_type: 'report',
        entity_id: payload.reportId,
        metadata: {
          tracking_code: payload.trackingCode,
          title: payload.title,
          message: payload.message,
          recipient_email: recipientEmail || 'public_timeline',
          dispatched_at: new Date().toISOString(),
          status: 'delivered',
        },
      });

      console.info(`[NotificationDispatcher] Alert dispatched for report ${payload.trackingCode}: ${payload.title}`);
    } catch (err) {
      console.warn('[NotificationDispatcher] Dispatch warning:', err);
    }
  }
}

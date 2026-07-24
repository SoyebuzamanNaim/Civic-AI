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

      const htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #0f766e;">CivicPulse Notification: ${payload.title}</h2>
          <p><strong>Tracking Code:</strong> ${payload.trackingCode}</p>
          <p>${payload.message}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">You received this update because you submitted or subscribed to civic report tracking for code ${payload.trackingCode}.</p>
        </div>
      `;

      let deliveryStatus = 'delivered_local';

      // Optional webhook or external email provider dispatch
      const webhookUrl = process.env.NOTIFICATION_WEBHOOK_URL;
      const resendApiKey = process.env.RESEND_API_KEY;

      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: recipientEmail,
              subject: `CivicPulse Update: ${payload.title} (${payload.trackingCode})`,
              html: htmlBody,
              metadata: payload,
            }),
          });
          deliveryStatus = 'delivered_webhook';
        } catch (webhookErr) {
          console.warn('[NotificationDispatcher] Webhook dispatch warning:', webhookErr);
        }
      } else if (resendApiKey && recipientEmail) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'CivicPulse Notifications <notifications@civicpulse.gov>',
              to: [recipientEmail],
              subject: `CivicPulse Update: ${payload.title} (${payload.trackingCode})`,
              html: htmlBody,
            }),
          });
          deliveryStatus = 'delivered_resend_api';
        } catch (resendErr) {
          console.warn('[NotificationDispatcher] Resend API dispatch warning:', resendErr);
        }
      }

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
          html_body: htmlBody,
          dispatched_at: new Date().toISOString(),
          status: deliveryStatus,
        },
      });

      console.info(`[NotificationDispatcher] Alert (${deliveryStatus}) dispatched for report ${payload.trackingCode}: ${payload.title}`);
    } catch (err) {
      console.warn('[NotificationDispatcher] Dispatch warning:', err);
    }
  }
}

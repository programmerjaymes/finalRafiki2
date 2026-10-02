import { prisma } from '@/lib/prisma';
import { sendSms } from '@/lib/smsGateway';
import { logApplicationError, recordAudit } from '@/lib/activityLog';

export async function notifyApprovalAdministrator(business: { id: string; name: string; owner?: { name: string } | null }) {
  try {
    const settings = await prisma.systemSetting.findUnique({ where: { id: 'global' }, select: { approvalSmsNotificationsEnabled: true } });
    if (!settings?.approvalSmsNotificationsEnabled) return;

    const administrators = await prisma.user.findMany({
      where: { role: 'ADMIN', receivesApprovalNotifications: true, phone: { not: null } },
      select: { id: true, name: true, phone: true },
    });
    if (!administrators.length) {
      await logApplicationError({ level: 'WARN', message: 'Approval SMS enabled, but no selected administrator has a phone number', route: '/api/businesses', method: 'POST', metadata: { businessId: business.id } });
      return;
    }

    const message = `Rafiki: New business "${business.name}" by ${business.owner?.name || 'a business owner'} requires your approval. Sign in to review it.`;
    for (const administrator of administrators) {
      if (!administrator.phone) continue;
      try {
        const result = await sendSms(administrator.phone, message);
        await prisma.smsMessage.create({
          data: {
            recipientId: administrator.id,
            sentById: null,
            recipientName: administrator.name,
            phone: administrator.phone,
            message,
            status: result.success ? 'SENT' : 'FAILED',
            errorMessage: result.error || null,
            gatewaySenderId: result.senderIdUsed || null,
            creditsRemaining: result.creditsRemaining ?? null,
          },
        });
        await recordAudit({ action: result.success ? 'APPROVAL_SMS_SENT' : 'APPROVAL_SMS_FAILED', entityType: 'Business', entityId: business.id, description: `${result.success ? 'Sent' : 'Failed to send'} approval request SMS to ${administrator.name}`, metadata: { recipientId: administrator.id, error: result.error || null } });
        if (!result.success) await logApplicationError({ message: result.error || 'Approval notification SMS failed', route: '/api/businesses', method: 'POST', statusCode: 502, metadata: { businessId: business.id, recipientId: administrator.id } });
      } catch (recipientError) {
        await logApplicationError({ message: recipientError instanceof Error ? recipientError.message : 'Unable to notify approval recipient', route: '/api/businesses', method: 'POST', statusCode: 500, metadata: { businessId: business.id, recipientId: administrator.id } });
      }
    }
  } catch (error) {
    await logApplicationError({ message: error instanceof Error ? error.message : 'Unable to send approval notification SMS', route: '/api/businesses', method: 'POST', statusCode: 500, metadata: { businessId: business.id } });
  }
}

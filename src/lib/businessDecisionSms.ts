import { prisma } from '@/lib/prisma';
import { sendSms } from '@/lib/smsGateway';
import { logApplicationError, recordAudit } from '@/lib/activityLog';
import {
  buildBusinessDecisionMessage,
  type BusinessDecisionLanguage,
} from '@/lib/businessDecisionMessage';

type Decision = 'APPROVED' | 'DISAPPROVED';

export async function notifyBusinessDecision(
  businessId: string,
  decision: Decision,
  sentById: string,
  language: BusinessDecisionLanguage = 'sw',
) {
  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        name: true,
        phone: true,
        owner: { select: { id: true, name: true, phone: true } },
        bundle: { select: { name: true, duration: true } },
        deactivationReason: true,
      },
    });
    if (!business) return;
    const phone = business.owner.phone?.trim() || business.phone?.trim();
    if (!phone) {
      await logApplicationError({ level: 'WARN', message: `Business ${decision.toLowerCase()} but owner has no SMS phone number`, route: `/api/businesses/${businessId}`, method: 'PUT', metadata: { businessId, ownerId: business.owner.id, decision } });
      return;
    }

    const message = buildBusinessDecisionMessage({
      decision,
      language,
      ownerName: business.owner.name,
      businessName: business.name,
      bundleName: business.bundle.name,
      bundleDuration: business.bundle.duration,
      disapprovalReason:
        business.deactivationReason || (language === 'sw' ? 'Haijatajwa' : 'Not specified'),
    });

    const result = await sendSms(phone, message);
    await prisma.smsMessage.create({
      data: {
        recipientId: business.owner.id,
        sentById,
        recipientName: business.owner.name,
        phone,
        message,
        status: result.success ? 'SENT' : 'FAILED',
        errorMessage: result.error || null,
        gatewaySenderId: result.senderIdUsed || null,
        creditsRemaining: result.creditsRemaining ?? null,
      },
    });
    await recordAudit({ actorId: sentById, action: result.success ? 'BUSINESS_DECISION_SMS_SENT' : 'BUSINESS_DECISION_SMS_FAILED', entityType: 'Business', entityId: businessId, description: `${decision} notification SMS ${result.success ? 'sent to' : 'failed for'} ${business.owner.name}`, metadata: { decision, phone, error: result.error || null } });
    if (!result.success) await logApplicationError({ message: result.error || 'Business decision SMS failed', route: `/api/businesses/${businessId}`, method: 'PUT', statusCode: 502, metadata: { businessId, ownerId: business.owner.id, decision } });
  } catch (error) {
    await logApplicationError({ message: error instanceof Error ? error.message : 'Unable to send business decision SMS', route: `/api/businesses/${businessId}`, method: 'PUT', statusCode: 500, metadata: { businessId, decision } });
  }
}

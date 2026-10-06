import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendSms } from '@/lib/smsGateway';
import { logApplicationError, recordAudit } from '@/lib/activityLog';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const original = await prisma.smsMessage.findUnique({ where: { id } });
  if (!original) {
    return NextResponse.json({ error: 'SMS message not found.' }, { status: 404 });
  }
  if (original.status !== 'FAILED') {
    return NextResponse.json({ error: 'Only failed outbox messages can be resent.' }, { status: 409 });
  }

  const result = await sendSms(original.phone, original.message);
  const attempt = await prisma.smsMessage.create({
    data: {
      recipientId: original.recipientId,
      sentById: session.user.id,
      recipientName: original.recipientName,
      phone: result.phone,
      message: original.message,
      status: result.success ? 'SENT' : 'FAILED',
      errorMessage: result.error || null,
      gatewaySenderId: result.senderIdUsed || null,
      creditsRemaining: result.creditsRemaining ?? null,
    },
  });

  await recordAudit({
    actorId: session.user.id,
    action: result.success ? 'SMS_RESENT' : 'SMS_RESEND_FAILED',
    entityType: 'SmsMessage',
    entityId: attempt.id,
    description: `${result.success ? 'Resent' : 'Failed to resend'} SMS to ${original.recipientName}`,
    metadata: { originalMessageId: original.id, phone: result.phone, error: result.error || null },
    request,
  });

  if (!result.success) {
    await logApplicationError({
      level: 'ERROR',
      message: result.error || 'SMS resend failed',
      route: `/api/sms/history/${id}/resend`,
      method: 'POST',
      statusCode: 502,
      metadata: { originalMessageId: original.id, retryMessageId: attempt.id },
    });
  }

  return NextResponse.json(
    { success: result.success, message: attempt, error: result.error },
    { status: result.success ? 200 : 502, headers: { 'Cache-Control': 'no-store' } },
  );
}

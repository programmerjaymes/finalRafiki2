import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendSms } from '@/lib/smsGateway';
import { logApplicationError, recordAudit } from '@/lib/activityLog';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const { notifyBySms = false } = await request.json().catch(() => ({}));
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, phone: true } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (notifyBySms && !user.phone) return NextResponse.json({ error: 'This user has no phone number for SMS notification' }, { status: 400 });

  const temporaryPassword = `Rafiki-${crypto.randomBytes(5).toString('base64url')}`;
  const hashedPassword = await bcrypt.hash(temporaryPassword, 12);
  await prisma.user.update({ where: { id }, data: { hashedPassword, activeSessionToken: null } });

  let smsSent = false;
  let smsError: string | undefined;
  if (notifyBySms && user.phone) {
    const message = `Rafiki: Your temporary password is ${temporaryPassword}. Please sign in and change it immediately.`;
    const result = await sendSms(user.phone, message);
    smsSent = result.success;
    smsError = result.error;
    await prisma.smsMessage.create({ data: { recipientId: user.id, sentById: session.user.id, recipientName: user.name, phone: user.phone, message, status: result.success ? 'SENT' : 'FAILED', errorMessage: result.error || null, gatewaySenderId: result.senderIdUsed || null, creditsRemaining: result.creditsRemaining ?? null } });
    if (!result.success) await logApplicationError({ message: result.error || 'Password reset SMS failed', route: `/api/users/${id}/reset-password`, method: 'POST', statusCode: 502, metadata: { userId: id } });
  }
  await recordAudit({ actorId: session.user.id, action: 'USER_PASSWORD_RESET', entityType: 'User', entityId: id, description: `Reset password for ${user.name}${notifyBySms ? ' with SMS notification' : ''}`, metadata: { notifyBySms, smsSent }, request });
  return NextResponse.json({ temporaryPassword, smsSent, smsError });
}

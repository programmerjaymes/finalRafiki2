import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendSms } from '@/lib/smsGateway';
import { logApplicationError, recordAudit } from '@/lib/activityLog';
import { formatFullPhone } from '@/lib/phoneNumber';

export const dynamic = 'force-dynamic';

const requestSchema = z.object({
  recipientIds: z.array(z.string().min(1)).min(1).max(500),
  message: z.string().trim().min(1).max(1_000),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [users, businesses] = await Promise.all([
    prisma.user.findMany({
      where: { phone: { not: null } },
      select: { id: true, name: true, email: true, phone: true, role: true },
      orderBy: { name: 'asc' },
    }),
    prisma.business.findMany({
      where: { phone: { not: null } },
      select: {
        id: true,
        name: true,
        phone: true,
        owner: { select: { name: true, email: true, role: true } },
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  return NextResponse.json({
    recipients: [
      ...users
        .filter((user): user is typeof user & { phone: string } => Boolean(user.phone?.trim()))
        .map((user) => ({
          id: `user:${user.id}`,
          type: 'USER' as const,
          name: user.name,
          email: user.email,
          phone: user.phone,
          label: user.role,
        })),
      ...businesses
        .filter((business): business is typeof business & { phone: string } => Boolean(business.phone?.trim()))
        .map((business) => ({
          id: `business:${business.id}`,
          type: 'BUSINESS' as const,
          name: business.name,
          email: business.owner.email,
          phone: business.phone,
          label: business.owner.role === 'ADMIN' ? 'Admin-managed business' : 'Business contact',
          ownerName: business.owner.name,
        })),
    ],
  }, { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    await logApplicationError({ level: 'WARN', message: 'SMS dispatch rejected: invalid request payload', route: '/api/sms/send', method: 'POST', statusCode: 400 });
    return NextResponse.json(
      { error: 'Select at least one recipient and enter a message of up to 1,000 characters.' },
      { status: 400 },
    );
  }

  const uniqueIds = [...new Set(parsed.data.recipientIds)];
  const userIds = uniqueIds.filter((id) => id.startsWith('user:')).map((id) => id.slice(5));
  const businessIds = uniqueIds.filter((id) => id.startsWith('business:')).map((id) => id.slice(9));
  const [users, businesses] = await Promise.all([
    prisma.user.findMany({
    where: {
      id: { in: userIds },
      phone: { not: null },
    },
    select: { id: true, name: true, phone: true },
    }),
    prisma.business.findMany({
      where: {
        id: { in: businessIds },
        phone: { not: null },
      },
      select: { id: true, name: true, phone: true },
    }),
  ]);

  const candidates = [
    ...users
      .filter((user): user is typeof user & { phone: string } => Boolean(user.phone?.trim()))
      .map((user) => ({ key: `user:${user.id}`, recipientId: user.id, name: user.name, phone: user.phone })),
    ...businesses
      .filter((business): business is typeof business & { phone: string } => Boolean(business.phone?.trim()))
      .map((business) => ({ key: `business:${business.id}`, recipientId: null, name: business.name, phone: business.phone })),
  ];

  const recipients = [...candidates
    .reduce((byPhone, recipient) => {
      const normalized = formatFullPhone(recipient.phone) || recipient.phone.replace(/\D/g, '');
      if (!byPhone.has(normalized)) byPhone.set(normalized, { ...recipient, phone: normalized });
      return byPhone;
    }, new Map<string, typeof candidates[number]>())
    .values()];

  if (recipients.length === 0) {
    await logApplicationError({ level: 'WARN', message: 'SMS dispatch rejected: selected recipients have no phone numbers', route: '/api/sms/send', method: 'POST', statusCode: 400, metadata: { recipientIds: uniqueIds } });
    return NextResponse.json({ error: 'None of the selected recipients has a phone number.' }, { status: 400 });
  }

  const results = [];
  const batchSize = 5;
  for (let index = 0; index < recipients.length; index += batchSize) {
    const batch = recipients.slice(index, index + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (recipient) => {
        const result = await sendSms(recipient.phone, parsed.data.message);
        return { recipientKey: recipient.key, recipientId: recipient.recipientId, name: recipient.name, ...result };
      }),
    );
    results.push(...batchResults);
  }

  await prisma.smsMessage.createMany({
    data: results.map((result) => ({
      recipientId: result.recipientId,
      sentById: session.user.id,
      recipientName: result.name,
      phone: result.phone,
      message: parsed.data.message,
      status: result.success ? 'SENT' : 'FAILED',
      errorMessage: result.error || null,
      gatewaySenderId: result.senderIdUsed || null,
      creditsRemaining: result.creditsRemaining ?? null,
    })),
  });

  await recordAudit({
    actorId: session.user.id,
    action: 'SMS_DISPATCH',
    entityType: 'User',
    description: `SMS dispatch requested for ${uniqueIds.length} recipients`,
    metadata: { requestedCount: uniqueIds.length, recipientCount: recipients.length },
    request,
  });

  for (const failure of results.filter((result) => !result.success)) {
    await logApplicationError({
      level: 'ERROR',
      message: failure.error || 'SMS gateway dispatch failed',
      route: '/api/sms/send',
      method: 'POST',
      statusCode: 502,
      metadata: { recipientKey: failure.recipientKey },
    });
  }

  const sentCount = results.filter((result) => result.success).length;
  const failedCount = results.length - sentCount;
  const creditsRemaining = [...results]
    .reverse()
    .find((result) => result.creditsRemaining !== undefined)?.creditsRemaining;

  return NextResponse.json(
    {
      success: failedCount === 0,
      sentCount,
      failedCount,
      requestedCount: uniqueIds.length,
      skippedCount: uniqueIds.length - recipients.length,
      creditsRemaining,
      results,
    },
    { status: sentCount === 0 ? 502 : 200, headers: { 'Cache-Control': 'no-store' } },
  );
}

import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendSms } from '@/lib/smsGateway';
import { logApplicationError, recordAudit } from '@/lib/activityLog';

export const dynamic = 'force-dynamic';

const requestSchema = z.object({
  userIds: z.array(z.string().min(1)).min(1).max(500),
  message: z.string().trim().min(1).max(1_000),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Select at least one recipient and enter a message of up to 1,000 characters.' },
      { status: 400 },
    );
  }

  const uniqueIds = [...new Set(parsed.data.userIds)];
  const users = await prisma.user.findMany({
    where: {
      id: { in: uniqueIds },
      phone: { not: null },
    },
    select: { id: true, name: true, phone: true },
  });

  const recipients = users.filter(
    (user): user is typeof user & { phone: string } => Boolean(user.phone?.trim()),
  );

  if (recipients.length === 0) {
    return NextResponse.json({ error: 'None of the selected users has a phone number.' }, { status: 400 });
  }

  const results = [];
  const batchSize = 5;
  for (let index = 0; index < recipients.length; index += batchSize) {
    const batch = recipients.slice(index, index + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (recipient) => {
        const result = await sendSms(recipient.phone, parsed.data.message);
        return { userId: recipient.id, name: recipient.name, ...result };
      }),
    );
    results.push(...batchResults);
  }

  await recordAudit({
    actorId: session.user.id,
    action: 'SMS_DISPATCH',
    entityType: 'User',
    description: `SMS dispatch requested for ${uniqueIds.length} users`,
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
      metadata: { userId: failure.userId },
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

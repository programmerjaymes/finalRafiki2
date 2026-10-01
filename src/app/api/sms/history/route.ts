import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { SmsDeliveryStatus } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get('status') === 'FAILED' ? SmsDeliveryStatus.FAILED : SmsDeliveryStatus.SENT;
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit')) || 20));
  const search = url.searchParams.get('search')?.trim() || '';
  const where = {
    status,
    ...(search ? {
      OR: [
        { recipientName: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search } },
        { message: { contains: search, mode: 'insensitive' as const } },
        { sentBy: { name: { contains: search, mode: 'insensitive' as const } } },
      ],
    } : {}),
  };

  const [messages, total, sentTotal, failedTotal, latestBalance] = await Promise.all([
    prisma.smsMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { sentBy: { select: { id: true, name: true, email: true } } },
    }),
    prisma.smsMessage.count({ where }),
    prisma.smsMessage.count({ where: { status: SmsDeliveryStatus.SENT } }),
    prisma.smsMessage.count({ where: { status: SmsDeliveryStatus.FAILED } }),
    prisma.smsMessage.findFirst({ where: { creditsRemaining: { not: null } }, orderBy: { createdAt: 'desc' }, select: { creditsRemaining: true } }),
  ]);

  return NextResponse.json({
    messages,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit), sentTotal, failedTotal, creditsRemaining: latestBalance?.creditsRemaining ?? null },
  }, { headers: { 'Cache-Control': 'no-store' } });
}

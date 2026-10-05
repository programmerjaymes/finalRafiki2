import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const business = await prisma.business.findUnique({ where: { id } });
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    const body = await request.json().catch(() => ({})) as { action?: string };
    const allowedActions = new Set(['PHONE', 'WHATSAPP', 'EMAIL', 'WEBSITE', 'FACEBOOK', 'INSTAGRAM', 'TWITTER', 'BOOKING']);
    const action = allowedActions.has(body.action || '') ? body.action : 'CONTACT';
    const updated = await prisma.$transaction(async (tx) => {
      const changed = await tx.business.update({
        where: { id },
        data: { clickCount: { increment: 1 } },
      });
      await tx.$executeRaw`
        INSERT INTO "business_events" ("id", "businessId", "userId", "eventType", "action", "createdAt")
        VALUES (${randomUUID()}, ${id}, ${session?.user?.id || null}, 'CLICK', ${action}, NOW())
      `;
      return changed;
    });

    return NextResponse.json({ success: true, clickCount: updated.clickCount });
  } catch (error) {
    console.error('call tracking:', error);
    return NextResponse.json({ error: 'Failed to record call' }, { status: 500 });
  }
}

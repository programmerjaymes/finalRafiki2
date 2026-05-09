import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const business = await prisma.business.findUnique({ where: { id } });
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const updated = await prisma.business.update({
      where: { id },
      data: { clickCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true, clickCount: updated.clickCount });
  } catch (error) {
    console.error('call tracking:', error);
    return NextResponse.json({ error: 'Failed to record call' }, { status: 500 });
  }
}

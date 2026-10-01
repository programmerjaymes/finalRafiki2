import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) return NextResponse.json({ enabled: false }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { receivesApprovalNotifications: true } });
  return NextResponse.json({ enabled: Boolean(user?.receivesApprovalNotifications) }, { headers: { 'Cache-Control': 'no-store' } });
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const [settings] = await prisma.$queryRaw<Array<{ agentCommissionAmount: number }>>`SELECT "agentCommissionAmount" FROM system_settings WHERE id = 'global' LIMIT 1`;
  return NextResponse.json({ amount: settings?.agentCommissionAmount || 0 });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const amount = Number((await request.json()).amount);
  if (!Number.isFinite(amount) || amount < 0) return NextResponse.json({ error: 'Enter a valid non-negative amount' }, { status: 400 });
  await prisma.$executeRaw`
    INSERT INTO system_settings (id, "approvalSmsNotificationsEnabled", "agentCommissionAmount", "createdAt", "updatedAt")
    VALUES ('global', true, ${amount}, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET "agentCommissionAmount" = ${amount}, "updatedAt" = NOW()
  `;
  return NextResponse.json({ amount });
}

import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const [applicationLogs, auditTrails] = await prisma.$transaction([
    prisma.applicationLog.deleteMany(),
    prisma.auditTrail.deleteMany(),
  ]);
  return NextResponse.json({ deleted: { applicationLogs: applicationLogs.count, auditTrails: auditTrails.count } });
}

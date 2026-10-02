import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { recordAudit } from '@/lib/activityLog';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, role: true } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Only administrators can receive approval notifications' }, { status: 400 });
  const enabled = Boolean(body.enabled);
  const updated = await prisma.user.update({
    where: { id },
    data: { receivesApprovalNotifications: enabled },
    select: { id: true, receivesApprovalNotifications: true },
  });
  await recordAudit({ actorId: session.user.id, action: 'APPROVAL_NOTIFICATION_SETTING_CHANGED', entityType: 'User', entityId: id, description: `${enabled ? 'Enabled' : 'Disabled'} approval notifications for ${user.name}`, request });
  return NextResponse.json({ user: updated });
}

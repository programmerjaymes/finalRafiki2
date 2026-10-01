import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { recordAudit } from '@/lib/activityLog';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const [settings, administrator] = await Promise.all([
    prisma.systemSetting.upsert({ where: { id: 'global' }, create: { id: 'global' }, update: {}, select: { approvalSmsNotificationsEnabled: true } }),
    prisma.user.findFirst({ where: { role: 'ADMIN', receivesApprovalNotifications: true }, select: { id: true, name: true, phone: true } }),
  ]);
  return NextResponse.json({ enabled: settings.approvalSmsNotificationsEnabled, administrator }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  if (typeof body.enabled !== 'boolean') return NextResponse.json({ error: 'enabled must be a boolean' }, { status: 400 });
  if (body.enabled) {
    const administrator = await prisma.user.findFirst({ where: { role: 'ADMIN', receivesApprovalNotifications: true }, select: { phone: true } });
    if (!administrator) return NextResponse.json({ error: 'Select a notification administrator from the Users page first' }, { status: 400 });
    if (!administrator.phone) return NextResponse.json({ error: 'The selected administrator needs a phone number before SMS notifications can be enabled' }, { status: 400 });
  }
  const settings = await prisma.systemSetting.upsert({ where: { id: 'global' }, create: { id: 'global', approvalSmsNotificationsEnabled: body.enabled }, update: { approvalSmsNotificationsEnabled: body.enabled }, select: { approvalSmsNotificationsEnabled: true } });
  await recordAudit({ actorId: session.user.id, action: 'APPROVAL_SMS_SETTING_CHANGED', entityType: 'SystemSetting', entityId: 'global', description: `${body.enabled ? 'Enabled' : 'Disabled'} SMS notifications for new business approvals`, request });
  return NextResponse.json({ enabled: settings.approvalSmsNotificationsEnabled });
}

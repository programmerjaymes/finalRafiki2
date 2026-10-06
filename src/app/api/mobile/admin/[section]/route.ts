import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMobileUser } from '@/lib/mobileAuth';

export const dynamic = 'force-dynamic';
const safe = <T,>(value: T): T => JSON.parse(JSON.stringify(value, (_k, v) => typeof v === 'bigint' ? v.toString() : v));

export async function GET(request: Request, { params }: { params: Promise<{ section: string }> }) {
  const user = await getMobileUser(request);
  if (user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { section } = await params;
  let items: unknown[] = [];
  if (section === 'categories') items = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  else if (section === 'regions') items = await prisma.region.findMany({ orderBy: { name: 'asc' } });
  else if (section === 'districts') items = await prisma.district.findMany({ include: { region: { select: { name: true } } }, orderBy: { name: 'asc' } });
  else if (section === 'wards') items = await prisma.ward.findMany({ include: { district: { select: { name: true } } }, orderBy: { name: 'asc' } });
  else if (section === 'streets') items = await prisma.street.findMany({ include: { ward: { select: { name: true } } }, orderBy: { name: 'asc' } });
  else if (section === 'approval-logs') items = await prisma.businessApprovalLog.findMany({ include: { business: { select: { name: true } }, approvedBy: { select: { name: true } } }, orderBy: { approvedAt: 'desc' }, take: 100 });
  else if (section === 'expenses') items = await prisma.appExpense.findMany({ include: { createdBy: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 100 });
  else if (section === 'sms') items = await prisma.smsMessage.findMany({ include: { sentBy: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 100 });
  else if (section === 'logs') {
    const [application, audit] = await Promise.all([
      prisma.$queryRaw<Array<Record<string, unknown> & { createdAt: Date }>>`SELECT * FROM application_logs ORDER BY "createdAt" DESC LIMIT 50`,
      prisma.$queryRaw<Array<Record<string, unknown> & { createdAt: Date }>>`SELECT a.*, u.name AS "actorName" FROM audit_trail a LEFT JOIN users u ON u.id = a."actorId" ORDER BY a."createdAt" DESC LIMIT 50`,
    ]);
    items = [...application.map(x => ({ ...x, logType: 'Application' })), ...audit.map(x => ({ ...x, logType: 'Audit' }))].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  } else if (section === 'activity') {
    const [views, clicks, inquiries, usage] = await Promise.all([prisma.business.aggregate({ _sum: { viewCount: true } }), prisma.business.aggregate({ _sum: { clickCount: true } }), prisma.business.aggregate({ _sum: { inquiryCount: true } }), prisma.$queryRaw<Array<{ source: string; people: bigint; signedIn: bigint }>>`SELECT source, COUNT(DISTINCT "installationId")::bigint AS people, COUNT(DISTINCT "userId") FILTER (WHERE "userId" IS NOT NULL)::bigint AS "signedIn" FROM usage_sessions WHERE "lastSeenAt" >= NOW() - INTERVAL '30 days' GROUP BY source`]);
    items = [{ name: 'Business views', value: views._sum.viewCount || 0 }, { name: 'Customer clicks', value: clicks._sum.clickCount || 0 }, { name: 'Customer inquiries', value: inquiries._sum.inquiryCount || 0 }, ...usage.map(row => ({ name: `${row.source} users (last 30 days)`, value: Number(row.people), signedIn: Number(row.signedIn), source: row.source }))];
  } else if (section === 'settings') {
    const rows = await prisma.$queryRaw<Array<{ approvalSmsNotificationsEnabled: boolean; agentCommissionAmount: number }>>`SELECT "approvalSmsNotificationsEnabled", "agentCommissionAmount" FROM system_settings WHERE id = 'global'`;
    items = [{ name: 'Approval SMS notifications', value: rows[0]?.approvalSmsNotificationsEnabled ? 'Enabled' : 'Disabled' }, { name: 'Agent commission per business', value: `TZS ${rows[0]?.agentCommissionAmount || 0}` }];
  } else return NextResponse.json({ error: 'Unknown admin section' }, { status: 404 });
  return NextResponse.json(safe({ items }));
}

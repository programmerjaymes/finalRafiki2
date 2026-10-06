import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { recordAudit } from '@/lib/activityLog';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.roles?.includes('ADMIN') || session?.user?.role === 'ADMIN' ? session : null;
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const agents = await prisma.$queryRaw<Array<Record<string, unknown>>>`
    SELECT u.id, u.name, u.email, u.phone, u."referralCode",
      COALESCE((SELECT array_agg(r.role::text ORDER BY r.role::text) FROM user_role_assignments r WHERE r."userId" = u.id), ARRAY[u.role::text]) AS roles,
      (SELECT COUNT(*)::int FROM businesses b WHERE b."referralAgentId" = u.id) AS "businessCount",
      COALESCE((SELECT SUM(b."agentCommissionAmount") FROM businesses b WHERE b."referralAgentId" = u.id), 0)::float8 AS "totalEarned",
      COALESCE((SELECT SUM(b."agentCommissionAmount") FROM businesses b WHERE b."referralAgentId" = u.id AND b."agentCommissionPaid"), 0)::float8 AS "totalPaid",
      COALESCE((SELECT SUM(b."agentCommissionAmount") FROM businesses b WHERE b."referralAgentId" = u.id AND NOT b."agentCommissionPaid"), 0)::float8 AS "amountOwed",
      COALESCE((SELECT json_agg(json_build_object('id', b.id, 'name', b.name, 'createdAt', b."createdAt", 'isApproved', b."isApproved", 'commission', b."agentCommissionAmount", 'paid', b."agentCommissionPaid") ORDER BY b."createdAt" DESC) FROM businesses b WHERE b."referralAgentId" = u.id), '[]') AS businesses
    FROM users u
    WHERE u.role = 'AGENT' OR EXISTS (SELECT 1 FROM user_role_assignments r WHERE r."userId" = u.id AND r.role = 'AGENT')
    ORDER BY "amountOwed" DESC, u.name ASC
  `;
  return NextResponse.json({ agents });
}

export async function PATCH(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { businessId, paid } = await request.json();
  if (typeof businessId !== 'string' || typeof paid !== 'boolean') return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  const count = await prisma.$executeRaw`UPDATE businesses SET "agentCommissionPaid" = ${paid}, "agentCommissionPaidAt" = ${paid ? new Date() : null} WHERE id = ${businessId} AND "referralAgentId" IS NOT NULL`;
  if (!count) return NextResponse.json({ error: 'Referred business not found' }, { status: 404 });
  await recordAudit({ actorId: session.user.id, action: paid ? 'AGENT_COMMISSION_PAID' : 'AGENT_COMMISSION_REOPENED', entityType: 'Business', entityId: businessId, description: paid ? 'Marked agent commission as paid' : 'Marked agent commission as unpaid', request });
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function payload(agentId: string) {
  const [agent] = await prisma.$queryRaw<Array<{ id: string; name: string; referralCode: string }>>`
    SELECT id, name, "referralCode" FROM users u WHERE id = ${agentId} AND (role::text = 'AGENT' OR EXISTS (SELECT 1 FROM user_role_assignments r WHERE r."userId" = u.id AND r.role = 'AGENT')) LIMIT 1
  `;
  if (!agent) return null;
  const businesses = await prisma.$queryRaw<Array<{ id: string; name: string; createdAt: Date; isApproved: boolean; agentCommissionAmount: number | null; agentCommissionPaid: boolean; agentCommissionPaidAt: Date | null }>>`
    SELECT id, name, "createdAt", "isApproved", "agentCommissionAmount", "agentCommissionPaid", "agentCommissionPaidAt"
    FROM businesses WHERE "referralAgentId" = ${agentId} ORDER BY "createdAt" DESC
  `;
  const totalEarned = businesses.reduce((sum, b) => sum + (b.agentCommissionAmount || 0), 0);
  const totalPaid = businesses.reduce((sum, b) => sum + (b.agentCommissionPaid ? (b.agentCommissionAmount || 0) : 0), 0);
  return { agent, businesses, totals: { totalEarned, totalPaid, amountClaimable: totalEarned - totalPaid } };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !(session.user.roles?.includes('AGENT') || session.user.role === 'AGENT')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json(await payload(session.user.id));
}

// Mobile authentication until the app adopts cookie sessions.
export async function POST(request: NextRequest) {
  const { email, phone, password } = await request.json();
  if ((!email && !phone) || !password) return NextResponse.json({ error: 'Credentials are required' }, { status: 400 });
  const [user] = email
    ? await prisma.$queryRaw<Array<{ id: string; hashedPassword: string | null }>>`SELECT id, "hashedPassword" FROM users u WHERE email = ${email} AND (role::text = 'AGENT' OR EXISTS (SELECT 1 FROM user_role_assignments r WHERE r."userId" = u.id AND r.role = 'AGENT')) LIMIT 1`
    : await prisma.$queryRaw<Array<{ id: string; hashedPassword: string | null }>>`SELECT id, "hashedPassword" FROM users u WHERE phone = ${phone} AND (role::text = 'AGENT' OR EXISTS (SELECT 1 FROM user_role_assignments r WHERE r."userId" = u.id AND r.role = 'AGENT')) LIMIT 1`;
  if (!user?.hashedPassword || !(await bcrypt.compare(password, user.hashedPassword))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await payload(user.id));
}

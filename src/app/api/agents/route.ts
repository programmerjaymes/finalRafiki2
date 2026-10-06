import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Public, deliberately limited directory used by business registration forms.
export async function GET() {
  const agents = await prisma.$queryRaw<Array<{ id: string; name: string }>>`
    SELECT id, name FROM users u WHERE role::text = 'AGENT' OR EXISTS (SELECT 1 FROM user_role_assignments r WHERE r."userId" = u.id AND r.role = 'AGENT') ORDER BY name ASC
  `;
  return NextResponse.json({ agents });
}

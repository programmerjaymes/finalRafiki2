import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Public, deliberately limited directory used by business registration forms.
export async function GET() {
  const agents = await prisma.$queryRaw<Array<{ id: string; name: string }>>`
    SELECT id, name FROM users WHERE role::text = 'AGENT' ORDER BY name ASC
  `;
  return NextResponse.json({ agents });
}

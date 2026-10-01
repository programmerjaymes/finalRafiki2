import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { recordAudit } from '@/lib/activityLog';

const schema = z.object({ path: z.string().trim().min(1).max(500).refine((value) => value.startsWith('/') && !value.startsWith('/api/')) });

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  await recordAudit({
    actorId: session.user.id,
    action: 'PAGE_VISITED',
    entityType: 'Route',
    entityId: parsed.data.path,
    description: `${session.user.role === 'ADMIN' ? 'Administrator' : 'User'} visited ${parsed.data.path}`,
    metadata: { path: parsed.data.path, role: session.user.role },
    request,
  });
  return new NextResponse(null, { status: 204 });
}

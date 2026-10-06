import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { getMobileUser } from '@/lib/mobileAuth';
import { recordAudit } from '@/lib/activityLog';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const installationId = typeof body.installationId === 'string' ? body.installationId.trim().slice(0, 100) : '';
  const action = typeof body.action === 'string' ? body.action.trim().slice(0, 100) : 'APP_ACTIVE';
  const route = typeof body.route === 'string' ? body.route.trim().slice(0, 300) : null;
  const appVersion = typeof body.appVersion === 'string' ? body.appVersion.trim().slice(0, 50) : null;
  if (!installationId) return NextResponse.json({ error: 'installationId is required' }, { status: 400 });
  const source = request.headers.get('x-client-source')?.toUpperCase() === 'APP' ? 'APP' : 'WEB';
  const mobileUser = source === 'APP' ? await getMobileUser(request) : null;
  const webSession = source === 'WEB' ? await getServerSession(authOptions) : null;
  const userId = mobileUser?.id || webSession?.user?.id || null;
  await prisma.$executeRaw`
    INSERT INTO usage_sessions (id, "installationId", source, "userId", "firstSeenAt", "lastSeenAt", "lastActivity", "appVersion")
    VALUES (${randomUUID()}, ${installationId}, ${source}, ${userId}, NOW(), NOW(), ${action}, ${appVersion})
    ON CONFLICT (source, "installationId") DO UPDATE SET
      "userId" = COALESCE(${userId}, usage_sessions."userId"), "lastSeenAt" = NOW(), "lastActivity" = ${action}, "appVersion" = COALESCE(${appVersion}, usage_sessions."appVersion")
  `;
  if (!action.endsWith('_HEARTBEAT')) await recordAudit({ actorId: userId || undefined, action, entityType: 'UsageActivity', entityId: route || installationId, description: route ? `${source === 'APP' ? 'App' : 'Web'} activity on ${route}` : `${source === 'APP' ? 'Mobile app' : 'Web'} activity`, metadata: { route, installationId, appVersion }, source, request });
  return new NextResponse(null, { status: 204 });
}

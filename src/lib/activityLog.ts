import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

type ApplicationLogInput = {
  level?: 'ERROR' | 'WARN' | 'INFO';
  message: string;
  route?: string;
  method?: string;
  statusCode?: number;
  stack?: string;
  metadata?: Prisma.InputJsonValue;
  source?: 'APP' | 'WEB' | 'SYSTEM';
};

type AuditInput = {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  description?: string;
  metadata?: Prisma.InputJsonValue;
  request?: Request;
  source?: 'APP' | 'WEB' | 'SYSTEM';
};

export async function logApplicationError(input: ApplicationLogInput) {
  try {
    const { source = 'WEB', ...data } = input;
    const row = await prisma.applicationLog.create({ data: { level: data.level || 'ERROR', ...data } });
    await prisma.$executeRaw`UPDATE application_logs SET source = ${source} WHERE id = ${row.id}`;
  } catch (loggingError) {
    console.error('Unable to persist application log:', loggingError);
  }
}

export async function recordAudit(input: AuditInput) {
  try {
    const forwarded = input.request?.headers.get('x-forwarded-for');
    const source = input.source || (input.request?.headers.get('x-client-source')?.toUpperCase() === 'APP' ? 'APP' : 'WEB');
    const row = await prisma.auditTrail.create({
      data: {
        actorId: input.actorId || null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId || null,
        description: input.description,
        metadata: input.metadata,
        ipAddress: forwarded?.split(',')[0]?.trim() || input.request?.headers.get('x-real-ip') || null,
        userAgent: input.request?.headers.get('user-agent') || null,
      },
    });
    await prisma.$executeRaw`UPDATE audit_trail SET source = ${source} WHERE id = ${row.id}`;
  } catch (loggingError) {
    console.error('Unable to persist audit trail:', loggingError);
  }
}

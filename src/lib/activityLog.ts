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
};

type AuditInput = {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  description?: string;
  metadata?: Prisma.InputJsonValue;
  request?: Request;
};

export async function logApplicationError(input: ApplicationLogInput) {
  try {
    await prisma.applicationLog.create({ data: { level: input.level || 'ERROR', ...input } });
  } catch (loggingError) {
    console.error('Unable to persist application log:', loggingError);
  }
}

export async function recordAudit(input: AuditInput) {
  try {
    const forwarded = input.request?.headers.get('x-forwarded-for');
    await prisma.auditTrail.create({
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
  } catch (loggingError) {
    console.error('Unable to persist audit trail:', loggingError);
  }
}

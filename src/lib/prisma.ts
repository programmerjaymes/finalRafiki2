import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

/** Prefer pooled / serverless-friendly URLs (e.g. Neon “pooler” / -pooler in host). */
const getDatabaseUrl = () => {
  const url =
    process.env.DATABASE_URL?.trim() ||
    process.env.NETLIFY_DATABASE_URL?.trim();
  if (!url) {
    throw new Error('DATABASE_URL or NETLIFY_DATABASE_URL must be set');
  }
  return normalizePostgresUrl(url);
};

/**
 * Neon / Supabase / many cloud Postgres hosts require SSL. Missing sslmode often
 * works locally (no TLS) but fails in production with connection errors → API 500.
 */
function normalizePostgresUrl(url: string): string {
  if (!url) return url;
  let out = url;
  const lower = out.toLowerCase();
  const hostMatch = out.match(/@([^/:?]+)/);
  const host = hostMatch?.[1]?.toLowerCase() ?? '';

  const likelyNeedsSsl =
    host.includes('neon.tech') ||
    host.includes('supabase.co') ||
    host.includes('amazonaws.com') ||
    host.includes('azure.com');
  if (likelyNeedsSsl && !lower.includes('sslmode=')) {
    out = out.includes('?') ? `${out}&sslmode=require` : `${out}?sslmode=require`;
  }

  // Neon "pooler" endpoints use PgBouncer in transaction mode. Without this, Prisma
  // can see sporadic `Error { kind: Closed }` when the pooler reclaims connections.
  const lowerOut = out.toLowerCase();
  if (
    host.includes('neon.tech') &&
    (host.includes('pooler') || lowerOut.includes('pooler')) &&
    !lowerOut.includes('pgbouncer=true') &&
    !lowerOut.includes('pgbouncer=1')
  ) {
    out = out.includes('?') ? `${out}&pgbouncer=true` : `${out}?pgbouncer=true`;
  }

  return out;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
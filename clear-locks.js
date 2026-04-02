/**
 * Inspect Postgres activity (Netlify DB / local Postgres).
 * For MySQL legacy tooling, use git history or a MySQL client.
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearLocks() {
  try {
    console.log('Checking database connection...');

    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection OK', result);

    const processes = await prisma.$queryRaw`
      SELECT pid, usename, state, query_start, left(query, 120) AS query_preview
      FROM pg_stat_activity
      WHERE datname = current_database()
        AND pid <> pg_backend_pid()
      ORDER BY query_start NULLS LAST
    `;

    console.log('\nActive sessions:', processes.length);
    processes.forEach((proc, idx) => {
      console.log(`Session ${idx + 1}:`, proc);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

clearLocks();

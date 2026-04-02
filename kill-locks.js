/**
 * Terminate long-running queries on PostgreSQL (use with care).
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function killLocks() {
  try {
    console.log('Looking for sessions idle in transaction or active > 120s...');

    const victims = await prisma.$queryRaw`
      SELECT pid, usename, state, query_start, left(query, 200) AS query_preview
      FROM pg_stat_activity
      WHERE datname = current_database()
        AND pid <> pg_backend_pid()
        AND (
          state = 'idle in transaction'
          OR (state = 'active' AND now() - query_start > interval '120 seconds')
        )
    `;

    console.log(`Found ${victims.length} session(s)`);

    for (const row of victims) {
      console.log(`Terminating pid ${row.pid}:`, row.state, row.query_preview?.slice?.(0, 80));
      try {
        await prisma.$executeRawUnsafe(`SELECT pg_terminate_backend(${Number(row.pid)})`);
        console.log(`✅ pg_terminate_backend(${row.pid})`);
      } catch (err) {
        console.log(`⚠️  Could not terminate ${row.pid}:`, err.message);
      }
    }

    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

killLocks();

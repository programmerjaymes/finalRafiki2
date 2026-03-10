const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function killLocks() {
  try {
    console.log('Finding and killing locked processes...');
    
    // Get all processes that are in a locked state or sleeping with long time
    const processes = await prisma.$queryRaw`
      SELECT Id, User, Host, db, Command, Time, State, Info
      FROM information_schema.PROCESSLIST
      WHERE (State LIKE '%lock%' OR State LIKE '%Locked%' OR (Command = 'Sleep' AND Time > 50))
      AND User != 'system user'
    `;
    
    console.log(`Found ${processes.length} processes to kill`);
    
    if (processes.length === 0) {
      console.log('No locked processes found. Checking for long-running queries...');
      
      const longRunning = await prisma.$queryRaw`
        SELECT Id, User, Host, db, Command, Time, State, Info
        FROM information_schema.PROCESSLIST
        WHERE Time > 30 AND Command != 'Sleep' AND User != 'system user'
      `;
      
      console.log(`Found ${longRunning.length} long-running queries`);
      
      for (const proc of longRunning) {
        console.log(`Killing process ${proc.Id}: ${proc.State} - ${proc.Info?.substring(0, 50)}`);
        try {
          await prisma.$executeRawUnsafe(`KILL ${proc.Id}`);
          console.log(`✅ Killed process ${proc.Id}`);
        } catch (err) {
          console.log(`⚠️  Could not kill process ${proc.Id}:`, err.message);
        }
      }
    } else {
      for (const proc of processes) {
        console.log(`Killing locked process ${proc.Id}: ${proc.State}`);
        try {
          await prisma.$executeRawUnsafe(`KILL ${proc.Id}`);
          console.log(`✅ Killed process ${proc.Id}`);
        } catch (err) {
          console.log(`⚠️  Could not kill process ${proc.Id}:`, err.message);
        }
      }
    }
    
    console.log('\n✅ Lock cleanup complete');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

killLocks();

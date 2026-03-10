const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearLocks() {
  try {
    console.log('Checking database connection...');
    
    // Execute a simple query to check connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection OK');
    
    // Show current processes
    console.log('\nChecking for locks...');
    const processes = await prisma.$queryRaw`SHOW PROCESSLIST`;
    console.log('Active processes:', processes.length);
    
    processes.forEach((proc, idx) => {
      if (proc.Info && proc.Info.includes('user')) {
        console.log(`Process ${idx + 1}:`, {
          Id: proc.Id,
          User: proc.User,
          Command: proc.Command,
          Time: proc.Time,
          State: proc.State,
          Info: proc.Info?.substring(0, 100)
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

clearLocks();

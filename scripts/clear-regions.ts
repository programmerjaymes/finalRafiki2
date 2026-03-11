import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Disable FK checks, truncate, re-enable
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`;
  await prisma.$executeRaw`TRUNCATE TABLE wards`;
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`;
  console.log('✅ Wards table cleared successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

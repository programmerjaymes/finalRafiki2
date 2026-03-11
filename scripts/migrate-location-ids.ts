import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up database for schema migration...');
  
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`;
  
  // Drop all business-related tables
  const tablesToDrop = [
    'business_events',
    'search_result_businesses', 
    'reviews',
    'payments',
    'business_images',
    'category_on_businesses',
    'category_business',
    'business_registrations',
    'businesses',
    'location_searches',
    'category_searches',
    'search_queries',
    'search_results',
    'streets',
    'wards',
    'districts',
    'regions'
  ];
  
  for (const table of tablesToDrop) {
    try {
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS ${table}`);
      console.log(`Dropped ${table}`);
    } catch (err) {
      console.log(`Skipped ${table} (doesn't exist)`);
    }
  }
  
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`;
  
  console.log('✅ All tables dropped. Run: npx prisma db push');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

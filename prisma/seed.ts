import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create admin user
  const adminPassword = await hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@rafiki.com' },
    update: {},
    create: {
      email: 'admin@rafiki.com',
      name: 'System Admin',
      hashedPassword: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log(`Created admin user: ${admin.name}`);

  // Create bundle plans
  const bundles = [
    {
      name: 'Free',
      price: 0,
      duration: 30, // 30 days
      description: 'Basic listing with limited features',
      allowedFields: JSON.stringify([
        'name', 'description', 'phone', 'email',
        'regionId', 'districtId', 'wardId', 'street'
      ]),
      maxImages: 1,
      allowsVideo: false,
      allowsAnalytics: false,
      advancedAnalytics: false,
      featured: false,
    },
    {
      name: 'Standard',
      price: 20000, // Price in TZS
      duration: 90, // 90 days
      description: 'Enhanced listing with more visibility',
      allowedFields: JSON.stringify([
        'name', 'description', 'phone', 'email', 'website',
        'regionId', 'districtId', 'wardId', 'street',
        'facebook', 'instagram', 'twitter',
        'allowsOnlineBooking', 'allowsDelivery',
        'logo', 'coverImage'
      ]),
      maxImages: 5,
      allowsVideo: false,
      allowsAnalytics: true,
      advancedAnalytics: false,
      featured: false,
    },
    {
      name: 'Premium',
      price: 50000, // Price in TZS
      duration: 180, // 180 days
      description: 'Premium listing with maximum exposure and all features',
      allowedFields: JSON.stringify([
        'name', 'description', 'phone', 'email', 'website',
        'regionId', 'districtId', 'wardId', 'street',
        'facebook', 'instagram', 'twitter',
        'allowsOnlineBooking', 'allowsDelivery',
        'logo', 'coverImage', 'latitude', 'longitude'
      ]),
      maxImages: 10,
      allowsVideo: true,
      allowsAnalytics: true,
      advancedAnalytics: true,
      featured: true,
    },
  ];

  for (const bundle of bundles) {
    await prisma.bundle.upsert({
      where: { name: bundle.name },
      update: bundle,
      create: bundle,
    });
    console.log(`Created/updated bundle: ${bundle.name}`);
  }

  // Create business categories (English + Swahili; Swahili starts as copy of English)
  const categories = [
    { nameEn: 'Restaurants', descriptionEn: 'Food & Dining establishments', icon: '🍽️' },
    { nameEn: 'Hotels', descriptionEn: 'Accommodation & Lodging', icon: '🏨' },
    { nameEn: 'Shopping', descriptionEn: 'Retail stores & Shops', icon: '🛍️' },
    { nameEn: 'Health', descriptionEn: 'Hospitals, Clinics & Pharmacies', icon: '🏥' },
    { nameEn: 'Education', descriptionEn: 'Schools, Colleges & Training centers', icon: '🎓' },
    { nameEn: 'Professional Services', descriptionEn: 'Consultants, Lawyers & Accountants', icon: '💼' },
    { nameEn: 'Tourism', descriptionEn: 'Tour operators & Travel agencies', icon: '🏝️' },
    { nameEn: 'Transportation', descriptionEn: 'Transport services', icon: '🚕' },
    { nameEn: 'Entertainment', descriptionEn: 'Cinemas, Theaters & Recreation', icon: '🎬' },
    { nameEn: 'Beauty', descriptionEn: 'Salons, Spas & Barber shops', icon: '💇' },
  ];

  for (const c of categories) {
    const nameSw = c.nameEn;
    const descriptionSw = c.descriptionEn;
    const row = {
      name: c.nameEn,
      nameEn: c.nameEn,
      nameSw,
      description: c.descriptionEn,
      descriptionEn: c.descriptionEn,
      descriptionSw,
      icon: c.icon,
    };
    await prisma.category.upsert({
      where: { name: row.name },
      update: row,
      create: row,
    });
    console.log(`Created/updated category: ${c.nameEn}`);
  }

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
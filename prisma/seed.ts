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

  // Create regions
  const regions = [
    { name: 'Dar es Salaam', code: 'DSM', tamisemiId: BigInt(3849) },
    { name: 'Arusha', code: 'ARU', tamisemiId: BigInt(3850) },
    { name: 'Mwanza', code: 'MWZ', tamisemiId: BigInt(3851) },
    { name: 'Zanzibar', code: 'ZNZ', tamisemiId: BigInt(3852) },
    { name: 'Dodoma', code: 'DDM', tamisemiId: BigInt(3853) },
  ];

  for (const region of regions) {
    await prisma.region.upsert({
      where: { code: region.code },
      update: { name: region.name },
      create: region,
    });
    console.log(`Created/updated region: ${region.name}`);
  }

  // Create districts for Dar es Salaam
  const darRegion = await prisma.region.findFirst({
    where: { name: 'Dar es Salaam', code: 'DSM' },
  });

  if (darRegion) {
    const districts = [
      { name: 'Ilala', code: 'ILA', regionId: 'DSM', tamisemiId: BigInt(4034), parentArea: darRegion.tamisemiId },
      { name: 'Kinondoni', code: 'KIN', regionId: 'DSM', tamisemiId: BigInt(4035), parentArea: darRegion.tamisemiId },
      { name: 'Temeke', code: 'TEM', regionId: 'DSM', tamisemiId: BigInt(4036), parentArea: darRegion.tamisemiId },
      { name: 'Kigamboni', code: 'KIG', regionId: 'DSM', tamisemiId: BigInt(4037), parentArea: darRegion.tamisemiId },
      { name: 'Ubungo', code: 'UBG', regionId: 'DSM', tamisemiId: BigInt(4038), parentArea: darRegion.tamisemiId },
    ];

    for (const district of districts) {
      await prisma.district.upsert({
        where: { code: district.code },
        update: { name: district.name },
        create: district,
      });
      console.log(`Created/updated district: ${district.name}`);
    }

    // Create wards for Ilala
    const ilalaDistrict = await prisma.district.findFirst({
      where: { name: 'Ilala', code: 'ILA' },
    });

    if (ilalaDistrict) {
      const wards = [
        { name: 'Kariakoo', code: 'KAR', districtId: 'ILA', tamisemiId: BigInt(5001), parentArea: ilalaDistrict.tamisemiId },
        { name: 'Kisutu', code: 'KIS', districtId: 'ILA', tamisemiId: BigInt(5002), parentArea: ilalaDistrict.tamisemiId },
        { name: 'Pugu', code: 'PUG', districtId: 'ILA', tamisemiId: BigInt(5003), parentArea: ilalaDistrict.tamisemiId },
        { name: 'Vingunguti', code: 'VIN', districtId: 'ILA', tamisemiId: BigInt(5004), parentArea: ilalaDistrict.tamisemiId },
        { name: 'Buguruni', code: 'BUG', districtId: 'ILA', tamisemiId: BigInt(5005), parentArea: ilalaDistrict.tamisemiId },
      ];

      for (const ward of wards) {
        await prisma.ward.upsert({
          where: { code: ward.code },
          update: { name: ward.name },
          create: ward,
        });
        console.log(`Created/updated ward: ${ward.name}`);
      }
    }
  }

  // Create business categories
  const categories = [
    { name: 'Restaurants', description: 'Food & Dining establishments', icon: '🍽️' },
    { name: 'Hotels', description: 'Accommodation & Lodging', icon: '🏨' },
    { name: 'Shopping', description: 'Retail stores & Shops', icon: '🛍️' },
    { name: 'Health', description: 'Hospitals, Clinics & Pharmacies', icon: '🏥' },
    { name: 'Education', description: 'Schools, Colleges & Training centers', icon: '🎓' },
    { name: 'Professional Services', description: 'Consultants, Lawyers & Accountants', icon: '💼' },
    { name: 'Tourism', description: 'Tour operators & Travel agencies', icon: '🏝️' },
    { name: 'Transportation', description: 'Transport services', icon: '🚕' },
    { name: 'Entertainment', description: 'Cinemas, Theaters & Recreation', icon: '🎬' },
    { name: 'Beauty', description: 'Salons, Spas & Barber shops', icon: '💇' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: category,
      create: category,
    });
    console.log(`Created/updated category: ${category.name}`);
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
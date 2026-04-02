/* eslint-disable no-console */
/**
 * One-time migration: MySQL -> Netlify Database (Postgres).
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." MYSQL_DATABASE_URL="mysql://..." node scripts/migrate-mysql-to-postgres.js --core
 *
 * Notes:
 * - Assumes Netlify/Postgres schema already exists (run `npx prisma migrate deploy` first).
 * - Copies a "core" set of tables; analytics/search tables can be added later.
 */

const mysql = require('mysql2/promise');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function toBigInt(v) {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'bigint') return v;
  // mysql2 may return big ints as strings when bigNumberStrings=true
  return BigInt(v);
}

function toNumber(v) {
  if (v === null || v === undefined) return v;
  if (typeof v === 'number') return v;
  return Number(v);
}

async function fetchAll(mysqlConn, query, params = []) {
  const [rows] = await mysqlConn.execute(query, params);
  return rows;
}

async function insertChunk(createManyFn, rows, chunkSize, label) {
  let i = 0;
  while (i < rows.length) {
    const slice = rows.slice(i, i + chunkSize);
    await createManyFn({ data: slice, skipDuplicates: true });
    i += chunkSize;
    if (label) console.log(`${label}: inserted ${Math.min(i, rows.length)}/${rows.length}`);
  }
}

async function migrateCore() {
  const MYSQL_DATABASE_URL = requireEnv('MYSQL_DATABASE_URL');
  // DATABASE_URL is used by Prisma internally via prisma/schema.prisma

  console.log('Connecting to MySQL...');
  const mysqlConn = await mysql.createConnection({
    uri: MYSQL_DATABASE_URL,
    bigNumberStrings: true,
    decimalNumbers: false,
  });

  try {
    console.log('Starting migration (core tables)...');

    // USERS
    {
      const rows = await fetchAll(
        mysqlConn,
        `SELECT id, name, email, hashedPassword, emailVerified, image, role, created_at, updated_at, phone
         FROM users`
      );
      console.log(`MySQL users: ${rows.length}`);

      const data = rows.map(r => ({
        id: r.id,
        name: r.name,
        email: r.email ?? null,
        hashedPassword: r.hashedPassword ?? null,
        emailVerified: r.emailVerified ?? null,
        image: r.image ?? null,
        role: r.role,
        createdAt: r.created_at ?? undefined,
        updatedAt: r.updated_at ?? undefined,
        phone: r.phone ?? null,
      }));

      await insertChunk(d => prisma.user.createMany(d), data, 500, 'users');
    }

    // BUNDLES
    {
      const rows = await fetchAll(
        mysqlConn,
        `SELECT id, name, price, duration, description, allowedFields, maxImages, allowsVideo, allowsAnalytics,
                advancedAnalytics, featured, createdAt, updatedAt, allowedFormFields
         FROM bundles`
      );
      console.log(`MySQL bundles: ${rows.length}`);

      const data = rows.map(r => ({
        id: r.id,
        name: r.name,
        price: toNumber(r.price),
        duration: r.duration,
        description: r.description ?? null,
        allowedFields: r.allowedFields,
        maxImages: r.maxImages,
        allowsVideo: !!r.allowsVideo,
        allowsAnalytics: !!r.allowsAnalytics,
        advancedAnalytics: !!r.advancedAnalytics,
        featured: !!r.featured,
        createdAt: r.createdAt ?? undefined,
        updatedAt: r.updatedAt ?? undefined,
        allowedFormFields: r.allowedFormFields ?? null,
      }));

      await insertChunk(d => prisma.bundle.createMany(d), data, 200, 'bundles');
    }

    // CATEGORIES (needs name_en/name_sw/description_en/description_sw in MySQL)
    {
      const rows = await fetchAll(
        mysqlConn,
        `SELECT id, name, description,
                name_en, name_sw, description_en, description_sw,
                icon, createdAt, updatedAt
         FROM categories`
      );
      console.log(`MySQL categories: ${rows.length}`);

      const data = rows.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description ?? null,
        nameEn: r.name_en ?? r.name,
        nameSw: r.name_sw ?? r.name,
        descriptionEn: r.description_en ?? null,
        descriptionSw: r.description_sw ?? null,
        icon: r.icon ?? null,
        createdAt: r.createdAt ?? undefined,
        updatedAt: r.updatedAt ?? undefined,
      }));

      await insertChunk(d => prisma.category.createMany(d), data, 200, 'categories');
    }

    // GEOGRAPHY
    // Regions
    {
      const rows = await fetchAll(
        mysqlConn,
        `SELECT id, \`RegionName\` as name, \`RegionCode\` as code, tamisemi_id, created_at, updated_at
         FROM regions`
      );
      console.log(`MySQL regions: ${rows.length}`);
      const data = rows.map(r => ({
        id: toBigInt(r.id),
        name: r.name ?? null,
        code: r.code ?? null,
        tamisemiId: toBigInt(r.tamisemi_id),
        createdAt: r.created_at ?? null,
        updatedAt: r.updated_at ?? null,
      }));
      await insertChunk(d => prisma.region.createMany(d), data, 200, 'regions');
    }

    // Districts
    {
      const rows = await fetchAll(
        mysqlConn,
        `SELECT id, \`LgaName\` as name, \`LgaCode\` as code, \`RegionCode\` as regionCode, parent_area, tamisemi_id, created_at, updated_at
         FROM districts`
      );
      console.log(`MySQL districts: ${rows.length}`);
      const data = rows.map(r => ({
        id: toBigInt(r.id),
        name: r.name ?? null,
        code: r.code ?? null,
        regionCode: r.regionCode,
        // In the existing MySQL data, `parent_area` references regions.tamisemi_id,
        // not regions.id. Our Prisma/Postgres FK expects regions.id, so we set it to NULL.
        regionId: null,
        tamisemiId: toBigInt(r.tamisemi_id),
        createdAt: r.created_at ?? null,
        updatedAt: r.updated_at ?? null,
      }));
      await insertChunk(d => prisma.district.createMany(d), data, 200, 'districts');
    }

    // Wards
    {
      const rows = await fetchAll(
        mysqlConn,
        `SELECT id, \`WardName\` as name, \`WardCode\` as code, parent_area, tamisemi_id, created_at, updated_at
         FROM wards`
      );
      console.log(`MySQL wards: ${rows.length}`);
      const data = rows.map(r => ({
        id: toBigInt(r.id),
        name: r.name ?? null,
        code: r.code ?? null,
        // In the existing MySQL data, `parent_area` references districts.tamisemi_id,
        // not districts.id. Our Prisma/Postgres FK expects districts.id, so we set it to NULL.
        districtId: null,
        tamisemiId: toBigInt(r.tamisemi_id),
        createdAt: r.created_at ?? null,
        updatedAt: r.updated_at ?? null,
      }));
      await insertChunk(d => prisma.ward.createMany(d), data, 200, 'wards');
    }

    // Streets
    {
      // In the existing MySQL data, streets.parent_area references wards.tamisemi_id.
      // Our Prisma/Postgres FK expects wards.id, so we remap via a lookup.
      const wardsForMap = await fetchAll(
        mysqlConn,
        `SELECT id, tamisemi_id, \`WardCode\` as wardCode FROM wards`
      );
      const wardsByTamisemiId = new Map(
        wardsForMap.map(w => [String(w.tamisemi_id), String(w.id)])
      );
      const wardsByWardCode = new Map(
        wardsForMap
          .filter(w => w.wardCode !== null && w.wardCode !== undefined)
          .map(w => [String(w.wardCode), String(w.id)])
      );

      const rows = await fetchAll(
        mysqlConn,
        `SELECT id, StreetName as name, parent_area, WardCode as wardCode, StreetCode as code, created_at, updated_at
         FROM streets`
      );
      console.log(`MySQL streets: ${rows.length}`);
      const data = rows.map(r => ({
        id: toBigInt(r.id),
        name: r.name,
        wardId: (() => {
          const byParentArea =
            r.parent_area !== null && r.parent_area !== undefined
              ? wardsByTamisemiId.get(String(r.parent_area))
              : null;
          const byWardCode =
            r.wardCode !== null && r.wardCode !== undefined
              ? wardsByWardCode.get(String(r.wardCode))
              : null;
          const wardIdStr = byParentArea ?? byWardCode;
          if (!wardIdStr) {
            throw new Error(
              `No ward match for streets (parent_area=${r.parent_area}, wardCode=${r.wardCode})`
            );
          }
          return toBigInt(wardIdStr);
        })(),
        code: r.code ?? null,
        createdAt: r.created_at ?? undefined,
        updatedAt: r.updated_at ?? undefined,
      }));
      await insertChunk(d => prisma.street.createMany(d), data, 200, 'streets');
    }

    // BUSINESSES
    {
      const rows = await fetchAll(
        mysqlConn,
        `SELECT * FROM businesses`
      );
      console.log(`MySQL businesses: ${rows.length}`);

      const data = rows.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description ?? null,
        phone: r.phone ?? null,
        email: r.email ?? null,
        website: r.website ?? null,
        logo: r.logo ?? null,
        coverImage: r.coverImage ?? null,
        facebook: r.facebook ?? null,
        instagram: r.instagram ?? null,
        twitter: r.twitter ?? null,
        allowsOnlineBooking: !!r.allowsOnlineBooking,
        allowsDelivery: !!r.allowsDelivery,
        isVerified: !!r.isVerified,
        isApproved: !!r.isApproved,
        bundleId: r.bundleId,
        bundleExpiresAt: r.bundleExpiresAt,
        categoryId: r.categoryId,
        latitude: r.latitude ?? null,
        longitude: r.longitude ?? null,
        regionId: r.regionId !== null ? toBigInt(r.regionId) : null,
        districtId: r.districtId !== null ? toBigInt(r.districtId) : null,
        wardId: r.wardId !== null ? toBigInt(r.wardId) : null,
        street: r.street ?? null,
        avgRating: toNumber(r.avgRating),
        numReviews: r.numReviews,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        ownerId: r.ownerId,
        registrarId: r.registrarId ?? null,
        viewCount: r.viewCount,
        clickCount: r.clickCount,
        inquiryCount: r.inquiryCount,
        categoryId2: r.categoryId2 ?? null,
        deactivationReason: r.deactivationReason ?? null,
      }));

      await insertChunk(d => prisma.business.createMany(d), data, 200, 'businesses');
    }

    // JOIN: category_business (must be after businesses exist)
    {
      const rows = await fetchAll(
        mysqlConn,
        `SELECT businessId, categoryId, createdAt
         FROM category_business`
      );
      console.log(`MySQL category_business: ${rows.length}`);

      const data = rows.map(r => ({
        businessId: r.businessId,
        categoryId: r.categoryId,
        createdAt: r.createdAt ?? undefined,
      }));
      // composite PK => duplicate-safe not needed for fresh DB
      await insertChunk(
        d => prisma.categoryOnBusiness.createMany(d),
        data,
        500,
        'category_business'
      );
    }

    // BUSINESS IMAGES
    {
      const rows = await fetchAll(
        mysqlConn,
        `SELECT id, businessId, imageData, sortOrder, createdAt
         FROM business_images`
      );
      console.log(`MySQL business_images: ${rows.length}`);

      const data = rows.map(r => ({
        id: r.id,
        businessId: r.businessId,
        imageData: r.imageData,
        sortOrder: r.sortOrder,
        createdAt: r.createdAt ?? undefined,
      }));
      await insertChunk(d => prisma.business_images.createMany(d), data, 300, 'business_images');
    }

    // REVIEWS
    {
      const rows = await fetchAll(
        mysqlConn,
        `SELECT id, rating, comment, businessId, userId, createdAt, updatedAt
         FROM reviews`
      );
      console.log(`MySQL reviews: ${rows.length}`);

      const data = rows.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment ?? null,
        businessId: r.businessId,
        userId: r.userId,
        createdAt: r.createdAt ?? undefined,
        updatedAt: r.updatedAt ?? undefined,
      }));
      await insertChunk(d => prisma.review.createMany(d), data, 300, 'reviews');
    }

    // PAYMENTS
    {
      const rows = await fetchAll(
        mysqlConn,
        `SELECT id, amount, currency, paymentReference, paymentStatus, paymentMethod, businessId, userId, bundleId, createdAt, updatedAt
         FROM payments`
      );
      console.log(`MySQL payments: ${rows.length}`);

      const data = rows.map(r => ({
        id: r.id,
        amount: toNumber(r.amount),
        currency: r.currency,
        paymentReference: r.paymentReference ?? null,
        paymentStatus: r.paymentStatus,
        paymentMethod: r.paymentMethod,
        businessId: r.businessId,
        userId: r.userId,
        bundleId: r.bundleId,
        createdAt: r.createdAt ?? undefined,
        updatedAt: r.updatedAt ?? undefined,
      }));
      await insertChunk(d => prisma.payment.createMany(d), data, 300, 'payments');
    }

    // BUSINESS EVENTS (optional but safe if exists)
    {
      // If table doesn't exist in your MySQL DB, this block will throw; we swallow.
      try {
        const rows = await fetchAll(
          mysqlConn,
          `SELECT id, businessId, eventType, createdAt
           FROM business_events`
        );
        console.log(`MySQL business_events: ${rows.length}`);
        const data = rows.map(r => ({
          id: r.id,
          businessId: r.businessId,
          eventType: r.eventType,
          createdAt: r.createdAt ?? undefined,
        }));
        await insertChunk(d => prisma.business_events.createMany(d), data, 300, 'business_events');
      } catch {
        console.log('Skipping business_events (table not found?)');
      }
    }

    console.log('Core migration complete.');
  } finally {
    try {
      await mysqlConn.end();
    } catch {
      // ignore
    }
  }
}

async function migrateAnalytics() {
  const MYSQL_DATABASE_URL = requireEnv('MYSQL_DATABASE_URL');
  console.log('Connecting to MySQL...');
  const mysqlConn = await mysql.createConnection({
    uri: MYSQL_DATABASE_URL,
    bigNumberStrings: true,
    decimalNumbers: false,
  });

  try {
    console.log('Starting migration (analytics tables)...');

    // CATEGORY_SEARCHES
    {
      const rows = await fetchAll(
        mysqlConn,
        `SELECT id, categoryId, searchCount, lastSearched FROM category_searches`
      );
      console.log(`MySQL category_searches: ${rows.length}`);
      const data = rows.map(r => ({
        id: r.id,
        categoryId: r.categoryId,
        searchCount: toNumber(r.searchCount),
        lastSearched: r.lastSearched ?? undefined,
      }));
      await insertChunk(d => prisma.categorySearch.createMany(d), data, 500, 'category_searches');
    }

    // LOCATION_SEARCHES
    {
      const rows = await fetchAll(
        mysqlConn,
        `SELECT id, regionId, searchCount, lastSearched FROM location_searches`
      );
      console.log(`MySQL location_searches: ${rows.length}`);
      const data = rows.map(r => ({
        id: r.id,
        regionId: toBigInt(r.regionId),
        searchCount: toNumber(r.searchCount),
        lastSearched: r.lastSearched ?? undefined,
      }));
      await insertChunk(d => prisma.locationSearch.createMany(d), data, 500, 'location_searches');
    }

    // SEARCH_QUERIES
    {
      const rows = await fetchAll(
        mysqlConn,
        `SELECT id, queryText, userId, regionId, categoryId, resultCount, createdAt FROM search_queries`
      );
      console.log(`MySQL search_queries: ${rows.length}`);
      const data = rows.map(r => ({
        id: r.id,
        queryText: r.queryText,
        userId: r.userId ?? null,
        regionId: r.regionId ?? null,
        categoryId: r.categoryId ?? null,
        resultCount: toNumber(r.resultCount),
        createdAt: r.createdAt ?? undefined,
      }));
      await insertChunk(d => prisma.searchQuery.createMany(d), data, 200, 'search_queries');
    }

    // SEARCH_RESULT_BUSINESSES
    // (must be after search_queries exist)
    {
      const rows = await fetchAll(
        mysqlConn,
        `SELECT id, searchQueryId, businessId, position, wasClicked, createdAt
         FROM search_result_businesses`
      );
      console.log(`MySQL search_result_businesses: ${rows.length}`);
      const data = rows.map(r => ({
        id: r.id,
        searchQueryId: r.searchQueryId,
        businessId: r.businessId,
        position: toNumber(r.position),
        wasClicked: !!r.wasClicked,
        createdAt: r.createdAt ?? undefined,
      }));
      await insertChunk(
        d => prisma.searchResultBusiness.createMany(d),
        data,
        500,
        'search_result_businesses'
      );
    }

    console.log('Analytics migration complete.');
  } finally {
    try {
      await mysqlConn.end();
    } catch {
      // ignore
    }
  }
}

async function main() {
  const arg = process.argv.slice(2).join(' ');
  if (arg.includes('--core')) {
    await migrateCore();
    return;
  }
  if (arg.includes('--analytics')) {
    await migrateAnalytics();
    return;
  }
  console.log('Usage: node scripts/migrate-mysql-to-postgres.js --core');
}

main()
  .catch(async (err) => {
    console.error('Migration failed:', err);
    try {
      await prisma.$disconnect();
    } catch {
      // ignore
    }
    process.exit(1);
  });


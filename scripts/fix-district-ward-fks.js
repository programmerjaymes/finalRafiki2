/* eslint-disable no-console */
/**
 * Fix location foreign keys after migration.
 *
 * In the source MySQL data:
 * - districts.parent_area -> regions.tamisemi_id
 * - wards.parent_area -> districts.tamisemi_id
 *
 * Our Prisma/Postgres FK expects:
 * - districts.parent_area -> regions.id
 * - wards.parent_area -> districts.id
 *
 * During the initial migration we set those FKs to NULL to avoid violations.
 * This script updates the FK columns using the mapping through tamisemi_id.
 *
 * Usage:
 *   MYSQL_DATABASE_URL="mysql://..." node scripts/fix-district-ward-fks.js
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
  return BigInt(v);
}

async function main() {
  const MYSQL_DATABASE_URL = requireEnv('MYSQL_DATABASE_URL');

  console.log('Connecting to MySQL...');
  const mysqlConn = await mysql.createConnection({
    uri: MYSQL_DATABASE_URL,
    bigNumberStrings: true,
    decimalNumbers: false,
  });

  try {
    console.log('Loading Postgres mappings...');
    const pgRegions = await prisma.$queryRaw`
      SELECT id, tamisemi_id
      FROM regions
    `; // returns rows with bigint as string

    const pgDistricts = await prisma.$queryRaw`
      SELECT id, tamisemi_id
      FROM districts
    `;

    const regionsByTamisemiId = new Map(
      pgRegions.map(r => [String(r.tamisemi_id), String(r.id)])
    );
    const districtsByTamisemiId = new Map(
      pgDistricts.map(d => [String(d.tamisemi_id), String(d.id)])
    );

    console.log('Reading MySQL districts/wards...');
    const [mysqlDistricts] = await mysqlConn.execute(
      `SELECT id, parent_area FROM districts`
    );
    const [mysqlWards] = await mysqlConn.execute(
      `SELECT id, parent_area FROM wards`
    );

    console.log(`MySQL districts: ${mysqlDistricts.length}, wards: ${mysqlWards.length}`);

    const districtUpdates = [];
    for (const d of mysqlDistricts) {
      if (d.parent_area === null || d.parent_area === undefined) continue;
      const regionId = regionsByTamisemiId.get(String(d.parent_area));
      if (!regionId) continue;
      districtUpdates.push([String(d.id), String(regionId)]);
    }

    const wardUpdates = [];
    for (const w of mysqlWards) {
      if (w.parent_area === null || w.parent_area === undefined) continue;
      const districtId = districtsByTamisemiId.get(String(w.parent_area));
      if (!districtId) continue;
      wardUpdates.push([String(w.id), String(districtId)]);
    }

    console.log(`Prepared district FK updates: ${districtUpdates.length}`);
    console.log(`Prepared ward FK updates: ${wardUpdates.length}`);

    // Apply updates in chunks using UPDATE ... FROM (VALUES ...)
    const CHUNK = 500;

    if (districtUpdates.length > 0) {
      for (let i = 0; i < districtUpdates.length; i += CHUNK) {
      const slice = districtUpdates.slice(i, i + CHUNK);
      const values = slice.map(([id, regionId]) => `(${id}::bigint, ${regionId}::bigint)`).join(',');
      await prisma.$executeRawUnsafe(`
        UPDATE districts d
        SET parent_area = v.region_id
        FROM (VALUES ${values}) AS v(id, region_id)
        WHERE d.id = v.id
      `);
      console.log(`Districts updated: ${Math.min(i + CHUNK, districtUpdates.length)}/${districtUpdates.length}`);
      }
    }

    if (wardUpdates.length > 0) {
      for (let i = 0; i < wardUpdates.length; i += CHUNK) {
      const slice = wardUpdates.slice(i, i + CHUNK);
      const values = slice.map(([id, districtId]) => `(${id}::bigint, ${districtId}::bigint)`).join(',');
      await prisma.$executeRawUnsafe(`
        UPDATE wards w
        SET parent_area = v.district_id
        FROM (VALUES ${values}) AS v(id, district_id)
        WHERE w.id = v.id
      `);
      console.log(`Wards updated: ${Math.min(i + CHUNK, wardUpdates.length)}/${wardUpdates.length}`);
      }
    }

    const nonNullDistricts = await prisma.district.count({ where: { regionId: { not: null } } });
    const nonNullWards = await prisma.ward.count({ where: { districtId: { not: null } } });

    console.log('Verification after FK fix:', { nonNullDistricts, nonNullWards });
  } finally {
    try {
      await prisma.$disconnect();
    } catch {
      // ignore
    }
    try {
      await mysqlConn.end();
    } catch {
      // ignore
    }
  }
}

main().catch(async (err) => {
  console.error('FK fix failed:', err);
  try {
    await prisma.$disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});


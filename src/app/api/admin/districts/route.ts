import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdmin, jsonSafe } from '@/lib/adminApi';


export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const regionId = new URL(request.url).searchParams.get('regionId');
  const where =
    regionId && regionId.trim()
      ? { regionId: BigInt(regionId) }
      : {};
  const rows = await prisma.district.findMany({
    where,
    include: { region: { select: { id: true, name: true, code: true } } },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(jsonSafe(rows));
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await request.json();
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  
  let regionId: bigint;
  try {
    regionId = BigInt(body.regionId);
  } catch {
    return NextResponse.json(
      { error: 'Valid region id is required' },
      { status: 400 }
    );
  }

  const parent = await prisma.region.findUnique({ where: { id: regionId } });
  if (!parent) {
    return NextResponse.json({ error: 'Region not found' }, { status: 400 });
  }
  
  // Auto-generate unique tamisemiId (timestamp + random)
  const tamisemiId = BigInt(Date.now() * 1000 + Math.floor(Math.random() * 1000));
  
  // Auto-generate unique code (DIST- + timestamp)
  const code = `DIST-${Date.now()}`;
  
  // Use parent region code
  const regionCode = parent.code || '';

  const row = await prisma.district.create({
    data: {
      name,
      code,
      regionCode,
      regionId,
      tamisemiId,
    },
  });
  revalidateTag('districts');
  return NextResponse.json(jsonSafe(row), { status: 201 });
}

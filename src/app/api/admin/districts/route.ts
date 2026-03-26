import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, jsonSafe } from '@/lib/adminApi';

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
  const regionCode =
    typeof body.regionCode === 'string' && body.regionCode.trim()
      ? body.regionCode.trim()
      : '';
  if (!regionCode) {
    return NextResponse.json({ error: 'Region code is required' }, { status: 400 });
  }
  let regionId: bigint;
  let tamisemiId: bigint;
  try {
    regionId = BigInt(body.regionId);
    tamisemiId = BigInt(body.tamisemiId ?? body.tamisemi_id);
  } catch {
    return NextResponse.json(
      { error: 'Valid region and TAMISEMI ids are required' },
      { status: 400 }
    );
  }
  const code =
    typeof body.code === 'string' && body.code.trim() ? body.code.trim() : null;

  const parent = await prisma.region.findUnique({ where: { id: regionId } });
  if (!parent) {
    return NextResponse.json({ error: 'Region not found' }, { status: 400 });
  }

  const row = await prisma.district.create({
    data: {
      name,
      code,
      regionCode,
      regionId,
      tamisemiId,
    },
  });
  return NextResponse.json(jsonSafe(row), { status: 201 });
}

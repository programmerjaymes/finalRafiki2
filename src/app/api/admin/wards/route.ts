import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, jsonSafe } from '@/lib/adminApi';

export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const districtId = new URL(request.url).searchParams.get('districtId');
  const where =
    districtId && districtId.trim()
      ? { districtId: BigInt(districtId) }
      : {};
  const rows = await prisma.ward.findMany({
    where,
    include: {
      district: {
        select: { id: true, name: true, code: true, regionId: true },
      },
    },
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
  let districtId: bigint;
  let tamisemiId: bigint;
  try {
    districtId = BigInt(body.districtId);
    tamisemiId = BigInt(body.tamisemiId ?? body.tamisemi_id);
  } catch {
    return NextResponse.json(
      { error: 'Valid district and TAMISEMI ids are required' },
      { status: 400 }
    );
  }
  const code =
    typeof body.code === 'string' && body.code.trim() ? body.code.trim() : null;

  const d = await prisma.district.findUnique({ where: { id: districtId } });
  if (!d) {
    return NextResponse.json({ error: 'District not found' }, { status: 400 });
  }

  const row = await prisma.ward.create({
    data: { name, code, districtId, tamisemiId },
  });
  return NextResponse.json(jsonSafe(row), { status: 201 });
}

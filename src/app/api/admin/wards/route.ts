import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdmin, jsonSafe } from '@/lib/adminApi';


export const dynamic = 'force-dynamic';

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
  try {
    districtId = BigInt(body.districtId);
  } catch {
    return NextResponse.json(
      { error: 'Valid district id is required' },
      { status: 400 }
    );
  }

  const d = await prisma.district.findUnique({ where: { id: districtId } });
  if (!d) {
    return NextResponse.json({ error: 'District not found' }, { status: 400 });
  }
  
  // Auto-generate unique tamisemiId (timestamp + random)
  const tamisemiId = BigInt(Date.now() * 1000 + Math.floor(Math.random() * 1000));
  
  // Auto-generate unique code (WARD- + timestamp)
  const code = `WARD-${Date.now()}`;

  const row = await prisma.ward.create({
    data: { name, code, districtId, tamisemiId },
  });
  revalidateTag('wards');
  return NextResponse.json(jsonSafe(row), { status: 201 });
}

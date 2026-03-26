import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, jsonSafe } from '@/lib/adminApi';

function parseId(id: string) {
  try {
    return BigInt(id);
  } catch {
    return null;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const id = parseId((await params).id);
  if (id === null) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  const row = await prisma.district.findUnique({
    where: { id },
    include: { region: { select: { id: true, name: true, code: true } } },
  });
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(jsonSafe(row));
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const id = parseId((await params).id);
  if (id === null) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
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

  try {
    const row = await prisma.district.update({
      where: { id },
      data: { name, code, regionCode, regionId, tamisemiId },
    });
    return NextResponse.json(jsonSafe(row));
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const id = parseId((await params).id);
  if (id === null) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  const count = await prisma.ward.count({ where: { districtId: id } });
  if (count > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${count} ward(s) reference this district` },
      { status: 409 }
    );
  }
  try {
    await prisma.district.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

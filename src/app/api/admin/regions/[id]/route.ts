import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
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
  const { id: idStr } = await params;
  const id = parseId(idStr);
  if (id === null) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  const row = await prisma.region.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(jsonSafe(row));
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id: idStr } = await params;
  const id = parseId(idStr);
  if (id === null) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  const body = await request.json();
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  let tamisemiId: bigint;
  try {
    tamisemiId = BigInt(body.tamisemiId ?? body.tamisemi_id);
  } catch {
    return NextResponse.json(
      { error: 'Valid TAMISEMI / numeric id is required' },
      { status: 400 }
    );
  }
  const code =
    typeof body.code === 'string' && body.code.trim() ? body.code.trim() : null;

  try {
    const row = await prisma.region.update({
      where: { id },
      data: { name, code, tamisemiId },
    });
    revalidateTag('regions');
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
  const { id: idStr } = await params;
  const id = parseId(idStr);
  if (id === null) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  const count = await prisma.district.count({ where: { regionId: id } });
  if (count > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${count} district(s) reference this region` },
      { status: 409 }
    );
  }
  try {
    await prisma.region.delete({ where: { id } });
    revalidateTag('regions');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

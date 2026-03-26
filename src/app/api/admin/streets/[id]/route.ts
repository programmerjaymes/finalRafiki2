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
  const row = await prisma.street.findUnique({
    where: { id },
    include: {
      ward: { select: { id: true, name: true, code: true, districtId: true } },
    },
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
  let wardId: bigint;
  try {
    wardId = BigInt(body.wardId);
  } catch {
    return NextResponse.json({ error: 'Valid ward id is required' }, { status: 400 });
  }
  const code =
    typeof body.code === 'string' && body.code.trim() ? body.code.trim() : null;

  const w = await prisma.ward.findUnique({ where: { id: wardId } });
  if (!w) {
    return NextResponse.json({ error: 'Ward not found' }, { status: 400 });
  }

  try {
    const row = await prisma.street.update({
      where: { id },
      data: { name, code, wardId },
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
  try {
    await prisma.street.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

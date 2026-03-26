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
  const row = await prisma.ward.findUnique({
    where: { id },
    include: {
      district: {
        select: { id: true, name: true, code: true, regionId: true },
      },
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

  try {
    const row = await prisma.ward.update({
      where: { id },
      data: { name, code, districtId, tamisemiId },
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
  const [biz, str] = await Promise.all([
    prisma.business.count({ where: { wardId: id } }),
    prisma.street.count({ where: { wardId: id } }),
  ]);
  if (biz > 0 || str > 0) {
    return NextResponse.json(
      {
        error: `Cannot delete: ${biz} business(es) and ${str} street(s) reference this ward`,
      },
      { status: 409 }
    );
  }
  try {
    await prisma.ward.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

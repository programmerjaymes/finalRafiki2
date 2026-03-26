import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, jsonSafe } from '@/lib/adminApi';

export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const wardId = new URL(request.url).searchParams.get('wardId');
  const where =
    wardId && wardId.trim() ? { wardId: BigInt(wardId) } : {};
  const rows = await prisma.street.findMany({
    where,
    include: {
      ward: {
        select: {
          id: true,
          name: true,
          code: true,
          districtId: true,
        },
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

  const row = await prisma.street.create({
    data: { name, code, wardId },
  });
  return NextResponse.json(jsonSafe(row), { status: 201 });
}

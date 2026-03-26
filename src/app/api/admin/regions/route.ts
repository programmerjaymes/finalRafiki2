import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdmin, jsonSafe } from '@/lib/adminApi';

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const rows = await prisma.region.findMany({ orderBy: { name: 'asc' } });
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

  const row = await prisma.region.create({
    data: { name, code, tamisemiId },
  });
  revalidateTag('regions');
  return NextResponse.json(jsonSafe(row), { status: 201 });
}

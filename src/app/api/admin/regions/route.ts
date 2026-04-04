import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdmin, jsonSafe } from '@/lib/adminApi';


export const dynamic = 'force-dynamic';

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
  
  // Auto-generate unique tamisemiId (timestamp + random)
  const tamisemiId = BigInt(Date.now() * 1000 + Math.floor(Math.random() * 1000));
  
  // Auto-generate unique code (REG- + timestamp)
  const code = `REG-${Date.now()}`;

  const row = await prisma.region.create({
    data: { name, code, tamisemiId },
  });
  revalidateTag('regions');
  return NextResponse.json(jsonSafe(row), { status: 201 });
}

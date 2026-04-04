import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'


export const dynamic = 'force-dynamic';

export const revalidate = 3600

function toBigInt(value: string) {
  return BigInt(value);
}

function toJsonWard(w: { id: bigint; name: string | null; code: string | null; districtId: bigint | null }) {
  return {
    ...w,
    id: w.id.toString(),
    districtId: w.districtId ? w.districtId.toString() : null,
  };
}

// GET all wards (cached; districtId filter included in cache key)
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const districtId = url.searchParams.get('districtId');

    const getWards = unstable_cache(
      async (did: string | null) => {
        const where = did ? { districtId: toBigInt(did) } : {};
        const wards = await prisma.ward.findMany({
          where,
          select: {
            id: true,
            name: true,
            code: true,
            districtId: true,
          },
          orderBy: {
            name: 'asc',
          },
        });
        return wards.map(toJsonWard);
      },
      ['wards:v1'],
      { revalidate, tags: ['wards'] },
    );

    const payload = await getWards(districtId);

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching wards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wards' },
      { status: 500 }
    );
  }
} 

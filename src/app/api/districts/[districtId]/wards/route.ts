import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

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

const getWardsByDistrict = unstable_cache(
  async (districtId: string) => {
    const wards = await prisma.ward.findMany({
      where: {
        districtId: toBigInt(districtId),
      },
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
  ['wards-by-district', 'v1'],
  { revalidate, tags: ['wards'] },
)

// GET wards by district ID
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ districtId: string }> }
) {
  try {
    const { districtId } = await params

    const payload = await getWardsByDistrict(districtId)

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

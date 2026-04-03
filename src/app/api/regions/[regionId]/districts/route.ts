import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

export const revalidate = 3600

function toBigInt(value: string) {
  return BigInt(value);
}

function toJsonDistrict(d: { id: bigint; name: string | null; code: string | null; regionId: bigint | null }) {
  return {
    ...d,
    id: d.id.toString(),
    regionId: d.regionId ? d.regionId.toString() : null,
  };
}

const getDistrictsByRegion = unstable_cache(
  async (regionId: string) => {
    const districts = await prisma.district.findMany({
      where: {
        regionId: toBigInt(regionId),
      },
      select: {
        id: true,
        name: true,
        code: true,
        regionId: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return districts.map(toJsonDistrict);
  },
  ['districts-by-region', 'v1'],
  { revalidate, tags: ['districts'] },
)

// GET districts by region ID
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ regionId: string }> }
) {
  try {
    const { regionId } = await params

    const payload = await getDistrictsByRegion(regionId)

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching districts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch districts' },
      { status: 500 }
    );
  }
}

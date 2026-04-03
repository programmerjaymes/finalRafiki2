import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

export const revalidate = 3600

function toJsonDistrict(d: { id: bigint; name: string | null; code: string | null; regionId: bigint | null }) {
  return {
    id: d.id.toString(),
    name: d.name,
    code: d.code,
    regionId: d.regionId ? d.regionId.toString() : null,
  };
}

// GET all districts (cached; regionId filter included in cache key)
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const regionId = url.searchParams.get('regionId');
    
    const getDistricts = unstable_cache(
      async (rid: string | null) => {
        const where = rid ? { regionId: BigInt(rid) } : {};
        const districts = await prisma.district.findMany({
          where,
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
      ['districts:v2'],
      { revalidate, tags: ['districts'] },
    );

    const payload = await getDistricts(regionId);

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
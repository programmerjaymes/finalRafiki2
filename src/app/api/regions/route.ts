import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

export const revalidate = 3600 // 1 hour

function toJsonRegion(r: { id: bigint; name: string | null; code: string | null }) {
  return {
    ...r,
    id: r.id.toString(),
  };
}

// GET all regions
export async function GET(request: Request) {
  try {
    const getRegions = unstable_cache(
      async () => {
        const rows = await prisma.region.findMany({
          select: {
            id: true,
            name: true,
            code: true,
          },
          orderBy: { name: 'asc' },
        });
        // Must return JSON-serializable data: unstable_cache stringifies the result (BigInt breaks).
        return rows.map(toJsonRegion);
      },
      ['regions:v3'],
      { revalidate, tags: ['regions'] }
    );

    const regions = await getRegions();

    return NextResponse.json(regions, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching regions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch regions' },
      { status: 500 }
    );
  }
} 
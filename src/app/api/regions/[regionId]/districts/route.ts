import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

// GET districts by region ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ regionId: string }> }
) {
  try {
    const { regionId } = await params;
    
    const districts = await prisma.district.findMany({
      where: {
        regionId: toBigInt(regionId)
      },
      select: {
        id: true,
        name: true,
        code: true,
        regionId: true,
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json(districts.map(toJsonDistrict));
  } catch (error) {
    console.error('Error fetching districts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch districts' },
      { status: 500 }
    );
  }
}

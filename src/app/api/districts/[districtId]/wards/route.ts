import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

// GET wards by district ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ districtId: string }> }
) {
  try {
    const { districtId } = await params;
    
    const wards = await prisma.ward.findMany({
      where: {
        districtId: toBigInt(districtId)
      },
      select: {
        id: true,
        name: true,
        code: true,
        districtId: true,
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json(wards.map(toJsonWard));
  } catch (error) {
    console.error('Error fetching wards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wards' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET wards by district ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ districtId: string }> }
) {
  try {
    const { districtId } = await params;
    
    const wards = await prisma.ward.findMany({
      where: {
        districtId: districtId
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    // Convert BigInt to string for JSON serialization
    const serializedWards = wards.map(ward => ({
      ...ward,
      id: ward.id.toString(),
      tamisemiId: ward.tamisemiId?.toString() || null,
      parentArea: ward.parentArea?.toString() || null,
      areaTypeId: ward.areaTypeId?.toString() || null,
      areaHqId: ward.areaHqId?.toString() || null,
    }));
    
    return NextResponse.json(serializedWards);
  } catch (error) {
    console.error('Error fetching wards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wards' },
      { status: 500 }
    );
  }
}

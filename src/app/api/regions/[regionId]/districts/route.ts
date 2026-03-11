import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET districts by region ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ regionId: string }> }
) {
  try {
    const { regionId } = await params;
    
    const districts = await prisma.district.findMany({
      where: {
        regionId: regionId
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    // Convert BigInt to string for JSON serialization
    const serializedDistricts = districts.map(district => ({
      ...district,
      id: district.id.toString(),
      tamisemiId: district.tamisemiId?.toString() || null,
      parentArea: district.parentArea?.toString() || null,
      areaTypeId: district.areaTypeId?.toString() || null,
      areaHqId: district.areaHqId?.toString() || null,
    }));
    
    return NextResponse.json(serializedDistricts);
  } catch (error) {
    console.error('Error fetching districts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch districts' },
      { status: 500 }
    );
  }
}

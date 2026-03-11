import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET streets by ward ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ wardId: string }> }
) {
  try {
    const { wardId } = await params;
    
    let streets: any[] = [];
    
    // Find the ward's tamisemi_id first
    const ward = await prisma.ward.findUnique({
      where: { id: BigInt(wardId) },
      select: { tamisemiId: true }
    });
    
    if (ward && ward.tamisemiId) {
      // Find streets where parent_area matches ward's tamisemi_id
      streets = await prisma.street.findMany({
        where: {
          parentArea: ward.tamisemiId
        },
        orderBy: { name: 'asc' }
      });
    }
    
    console.log(`🛣️ Fetched ${streets.length} streets for wardId: ${wardId}`);
    
    
    // Convert BigInt to string for JSON serialization
    const serializedStreets = streets.map(street => ({
      ...street,
      id: street.id.toString(),
      tamisemiId: street.tamisemiId?.toString() || null,
      parentArea: street.parentArea?.toString() || null,
      areaTypeId: street.areaTypeId?.toString() || null,
      areaHqId: street.areaHqId?.toString() || null,
    }));
    
    return NextResponse.json(serializedStreets);
  } catch (error) {
    console.error('Error fetching streets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch streets' },
      { status: 500 }
    );
  }
}

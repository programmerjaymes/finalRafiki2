import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all wards
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const districtId = url.searchParams.get('districtId');
    
    let wards: any[] = [];
    
    if (districtId) {
      // Find the district's tamisemi_id first
      const district = await prisma.district.findUnique({
        where: { id: BigInt(districtId) },
        select: { tamisemiId: true }
      });
      
      if (district && district.tamisemiId) {
        // Find wards where parent_area matches district's tamisemi_id
        wards = await prisma.ward.findMany({
          where: {
            parentArea: district.tamisemiId
          },
          orderBy: {
            name: 'asc'
          }
        });
      } else {
        wards = [];
      }
    } else {
      // Get all wards if no districtId provided
      wards = await prisma.ward.findMany({
        orderBy: {
          name: 'asc'
        }
      });
    }
    
    console.log(`🏘️ Fetched ${wards.length} wards for districtId: ${districtId || 'all'}`);
    
    
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
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all districts
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const regionId = url.searchParams.get('regionId');
    
    let districts: any[] = [];
    
    if (regionId) {
      // Find the region's tamisemi_id first
      const region = await prisma.region.findUnique({
        where: { id: BigInt(regionId) },
        select: { tamisemiId: true }
      });
      
      if (region && region.tamisemiId) {
        // Find districts where parent_area matches region's tamisemi_id
        districts = await prisma.district.findMany({
          where: {
            parentArea: region.tamisemiId
          },
          orderBy: {
            name: 'asc'
          }
        });
      } else {
        districts = [];
      }
    } else {
      // Get all districts if no regionId provided
      districts = await prisma.district.findMany({
        orderBy: {
          name: 'asc'
        }
      });
    }
    
    console.log(`📍 Fetched ${districts.length} districts for regionId: ${regionId || 'all'}`);
    
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
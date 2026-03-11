import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all regions
export async function GET(request: Request) {
  try {
    const regions = await prisma.region.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    // Convert BigInt to string for JSON serialization
    const serializedRegions = regions.map(region => ({
      ...region,
      id: region.id.toString(),
      tamisemiId: region.tamisemiId?.toString() || null,
      parentArea: region.parentArea?.toString() || null,
    }));
    
    return NextResponse.json(serializedRegions);
  } catch (error) {
    console.error('Error fetching regions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch regions' },
      { status: 500 }
    );
  }
} 
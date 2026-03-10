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
    
    return NextResponse.json(regions);
  } catch (error) {
    console.error('Error fetching regions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch regions' },
      { status: 500 }
    );
  }
} 
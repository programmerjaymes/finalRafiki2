import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all districts
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const regionId = url.searchParams.get('regionId');
    
    const where = regionId ? { regionId } : {};
    
    const districts = await prisma.district.findMany({
      where,
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json(districts);
  } catch (error) {
    console.error('Error fetching districts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch districts' },
      { status: 500 }
    );
  }
} 
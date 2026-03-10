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
    
    return NextResponse.json(districts);
  } catch (error) {
    console.error('Error fetching districts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch districts' },
      { status: 500 }
    );
  }
}

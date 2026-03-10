import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all wards
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const districtId = url.searchParams.get('districtId');
    
    const where = districtId ? { districtId } : {};
    
    const wards = await prisma.ward.findMany({
      where,
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json(wards);
  } catch (error) {
    console.error('Error fetching wards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wards' },
      { status: 500 }
    );
  }
} 
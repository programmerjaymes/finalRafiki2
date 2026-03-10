import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Track a business view
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if business exists
    const business = await prisma.business.findUnique({
      where: {
        id: id
      }
    });
    
    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }
    
    // Increment view count
    const updatedBusiness = await prisma.business.update({
      where: {
        id: id
      },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });
    
    return NextResponse.json({ success: true, viewCount: updatedBusiness.viewCount });
  } catch (error) {
    console.error('Error tracking business view:', error);
    return NextResponse.json(
      { error: 'Failed to track business view' },
      { status: 500 }
    );
  }
} 
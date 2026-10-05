import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { randomUUID } from 'crypto';

// POST - Track a business view

export const dynamic = 'force-dynamic';

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
    
    const session = await getServerSession(authOptions);
    const updatedBusiness = await prisma.$transaction(async (tx) => {
      const updated = await tx.business.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });
      await tx.$executeRaw`
        INSERT INTO "business_events" ("id", "businessId", "userId", "eventType", "createdAt")
        VALUES (${randomUUID()}, ${id}, ${session?.user?.id || null}, 'VIEW', NOW())
      `;
      return updated;
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

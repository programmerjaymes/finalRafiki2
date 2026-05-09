import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: businessId } = await params;
    const reviews = await prisma.review.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, image: true } },
      },
    });

    return NextResponse.json(
      reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        userId: r.userId,
        userName: r.user.name,
        userImage: r.user.image,
        createdAt: r.createdAt.toISOString(),
      })),
    );
  } catch (error) {
    console.error('reviews GET:', error);
    return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: businessId } = await params;
    const body = await request.json();
    const { userId, rating, comment } = body as {
      userId?: string;
      rating?: number;
      comment?: string | null;
    };

    if (!userId || rating == null) {
      return NextResponse.json({ error: 'userId and rating are required' }, { status: 400 });
    }

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    await prisma.review.create({
      data: {
        businessId,
        userId,
        rating: Number(rating),
        comment: comment ?? null,
      },
    });

    const agg = await prisma.review.aggregate({
      where: { businessId },
      _avg: { rating: true },
      _count: { id: true },
    });

    await prisma.business.update({
      where: { id: businessId },
      data: {
        avgRating: agg._avg.rating != null ? agg._avg.rating : 0,
        numReviews: agg._count.id,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('reviews POST:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}

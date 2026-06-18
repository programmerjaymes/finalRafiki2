import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import {
  getLocaleFromRequest,
  localizedCategoryFields,
  type AppLocale,
} from '@/lib/categoryLocale';

export const dynamic = 'force-dynamic';

export const revalidate = 60; // seconds

function jsonSafe<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_key, value) => (typeof value === 'bigint' ? value.toString() : value))
  );
}

const getFeaturedBusinesses = unstable_cache(
  async (locale: AppLocale) => {
    const rows = await prisma.business.findMany({
      take: 6,
      where: {
        isApproved: true,
      },
      orderBy: [{ viewCount: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        name: true,
        description: true,
        phone: true,
        logo: true,
        coverImage: true,
        category: {
          select: { name: true, icon: true },
        },
        region: { select: { name: true } },
        district: { select: { name: true } },
        ward: { select: { name: true } },
      },
    });

    // Fetch images for featured businesses
    const businessIds = rows.map(b => b.id);
    let businessImages: Array<{ businessId: string; id: string; imageData: string; sortOrder: number }> = [];
    
    if (businessIds.length > 0) {
      const inClause = businessIds.map(id => `'${id}'`).join(',');
      businessImages = await prisma.$queryRawUnsafe(`
        SELECT DISTINCT ON ("businessId") "businessId", id, "imageData", "sortOrder" 
        FROM business_images 
        WHERE "businessId" IN (${inClause})
        ORDER BY "businessId", "sortOrder" ASC
      `);
    }

    const imagesByBusiness: Record<string, Array<{ id: string; imageData: string; sortOrder: number }>> = {};
    businessImages.forEach((img) => {
      if (!imagesByBusiness[img.businessId]) imagesByBusiness[img.businessId] = [];
      imagesByBusiness[img.businessId].push({ id: img.id, imageData: img.imageData, sortOrder: img.sortOrder });
    });

    return rows.map((b) => ({
      ...b,
      images: imagesByBusiness[b.id] || [],
      category: {
        icon: b.category.icon,
        name: localizedCategoryFields(b.category, locale).name,
      },
    }));
  },
  ['featured-businesses:v5'],
  { revalidate, tags: ['businesses', 'featured-businesses'] },
);

export async function GET(request: Request) {
  try {
    const locale = getLocaleFromRequest(request);
    const businesses = await getFeaturedBusinesses(locale);

    return NextResponse.json(jsonSafe({ businesses }), {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        Vary: 'Cookie',
      },
    });
  } catch (error) {
    console.error('Error fetching featured businesses:', error);
    return NextResponse.json({ error: 'Failed to fetch featured businesses' }, { status: 500 });
  }
}


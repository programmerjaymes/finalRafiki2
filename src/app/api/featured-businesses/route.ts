import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import {
  getLocaleFromRequest,
  localizedCategoryFields,
  type AppLocale,
} from '@/lib/categoryLocale';

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
        category: {
          select: { name: true, icon: true },
        },
        region: { select: { name: true } },
      },
    });

    return rows.map((b) => ({
      ...b,
      category: {
        icon: b.category.icon,
        name: localizedCategoryFields(b.category, locale).name,
      },
    }));
  },
  ['featured-businesses:v3'],
  { revalidate }
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


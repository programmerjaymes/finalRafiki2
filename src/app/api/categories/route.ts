import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getLocaleFromRequest, localizedCategoryFields, type AppLocale } from '@/lib/categoryLocale'

export const revalidate = 3600; // 1 hour

function toPublicCategoryRow(
  cat: {
    id: string
    name: string
    nameEn?: string
    nameSw?: string
    description?: string | null
    descriptionEn?: string | null
    descriptionSw?: string | null
    icon: string | null
    createdAt: Date
    updatedAt: Date
  },
  locale: AppLocale
) {
  const { name, description } = localizedCategoryFields(cat, locale)
  return {
    id: cat.id,
    name,
    description,
    icon: cat.icon,
    createdAt: cat.createdAt,
    updatedAt: cat.updatedAt,
  }
}

// GET all categories
export async function GET(request: NextRequest) {
  try {
    const nocache = request.nextUrl.searchParams.get('nocache') === '1'
    const allLang = request.nextUrl.searchParams.get('allLang') === '1'
    const locale = getLocaleFromRequest(request)

    if (nocache || allLang) {
      const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
      })

      if (allLang) {
        return NextResponse.json(categories, {
          headers: { 'Cache-Control': 'no-store' },
        })
      }

      const mapped = categories.map((c) => toPublicCategoryRow(c, locale))
      return NextResponse.json(mapped, {
        headers: { 'Cache-Control': 'no-store' },
      })
    }

    const getCategories = unstable_cache(
      async (loc: AppLocale) => {
        const rows = await prisma.category.findMany({
          orderBy: { name: 'asc' },
        })
        return rows.map((c) => toPublicCategoryRow(c, loc))
      },
      ['categories:v3'],
      { revalidate }
    )

    const categories = await getCategories(locale)

    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'Vary': 'Cookie',
      },
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST - Create a new category
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const nameEn = typeof body.nameEn === 'string' ? body.nameEn.trim() : ''
    const nameSw = typeof body.nameSw === 'string' ? body.nameSw.trim() : ''
    const descriptionEn =
      typeof body.descriptionEn === 'string'
        ? body.descriptionEn.trim() || null
        : null
    const descriptionSw =
      typeof body.descriptionSw === 'string'
        ? body.descriptionSw.trim() || null
        : null
    const icon =
      typeof body.icon === 'string' && body.icon.trim()
        ? body.icon.trim()
        : null

    if (!nameEn || !nameSw) {
      return NextResponse.json(
        { error: 'Both English and Swahili category names are required' },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name: nameEn,
        nameEn,
        nameSw,
        description: descriptionEn,
        descriptionEn,
        descriptionSw,
        icon,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
import { NextResponse } from 'next/server'
import { unstable_cache, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'


export const dynamic = 'force-dynamic';

export const revalidate = 3600

const getBundles = unstable_cache(
  async () => {
    return prisma.bundle.findMany({
      orderBy: {
        price: 'asc'
      }
    })
  },
  ['bundles', 'v1'],
  { revalidate, tags: ['bundles'] },
)

// GET all bundles
export async function GET(_request: Request) {
  try {
    const bundles = await getBundles()
    return NextResponse.json(bundles, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error fetching bundles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bundles' },
      { status: 500 }
    )
  }
}

// POST - Create a new bundle
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { name, price, duration, description, allowedFields, maxImages, allowsVideo, allowsAnalytics, advancedAnalytics, featured } = body
    
    if (!name || !price || !duration || !allowedFields) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const bundle = await prisma.bundle.create({
      data: {
        name,
        price: parseFloat(price),
        duration: parseInt(duration),
        description,
        allowedFields,
        maxImages: maxImages ? parseInt(maxImages) : 1,
        allowsVideo: Boolean(allowsVideo),
        allowsAnalytics: Boolean(allowsAnalytics),
        advancedAnalytics: Boolean(advancedAnalytics),
        featured: Boolean(featured)
      }
    })

    revalidateTag('bundles')
    return NextResponse.json(bundle, { status: 201 })
  } catch (error) {
    console.error('Error creating bundle:', error)
    return NextResponse.json(
      { error: 'Failed to create bundle' },
      { status: 500 }
    )
  }
} 

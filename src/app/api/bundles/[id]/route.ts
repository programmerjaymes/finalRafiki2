import { NextResponse } from 'next/server'
import { unstable_cache, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'

export const revalidate = 3600

const getBundleById = unstable_cache(
  async (id: string) =>
    prisma.bundle.findUnique({
      where: { id },
    }),
  ['bundle-by-id', 'v1'],
  { revalidate, tags: ['bundles'] },
)

// GET a single bundle by ID
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const bundle = await getBundleById(id)

    if (!bundle) {
      return NextResponse.json(
        { error: 'Bundle not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(bundle, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error fetching bundle:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bundle' },
      { status: 500 }
    )
  }
}

// PUT/PATCH - Update a bundle
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json()
    
    const { name, price, duration, description, allowedFields, maxImages, allowsVideo, allowsAnalytics, advancedAnalytics, featured } = body
    
    // Check if bundle exists
    const bundleExists = await prisma.bundle.findUnique({
      where: {
        id: id
      }
    })
    
    if (!bundleExists) {
      return NextResponse.json(
        { error: 'Bundle not found' },
        { status: 404 }
      )
    }
    
    // Update bundle
    const updatedBundle = await prisma.bundle.update({
      where: {
        id: id
      },
      data: {
        name,
        price: price !== undefined ? parseFloat(price) : undefined,
        duration: duration !== undefined ? parseInt(duration) : undefined,
        description,
        allowedFields,
        maxImages: maxImages !== undefined ? parseInt(maxImages) : undefined,
        allowsVideo: allowsVideo !== undefined ? Boolean(allowsVideo) : undefined,
        allowsAnalytics: allowsAnalytics !== undefined ? Boolean(allowsAnalytics) : undefined,
        advancedAnalytics: advancedAnalytics !== undefined ? Boolean(advancedAnalytics) : undefined,
        featured: featured !== undefined ? Boolean(featured) : undefined
      }
    })

    revalidateTag('bundles')
    return NextResponse.json(updatedBundle)
  } catch (error) {
    console.error('Error updating bundle:', error)
    return NextResponse.json(
      { error: 'Failed to update bundle' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a bundle
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if bundle exists
    const bundleExists = await prisma.bundle.findUnique({
      where: {
        id: id
      }
    })
    
    if (!bundleExists) {
      return NextResponse.json(
        { error: 'Bundle not found' },
        { status: 404 }
      )
    }
    
    // Delete bundle
    await prisma.bundle.delete({
      where: {
        id: id
      }
    })

    revalidateTag('bundles')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting bundle:', error)
    return NextResponse.json(
      { error: 'Failed to delete bundle' },
      { status: 500 }
    )
  }
} 
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all bundles
export async function GET(request: Request) {
  try {
    const bundles = await prisma.bundle.findMany({
      orderBy: {
        price: 'asc'
      }
    })
    return NextResponse.json(bundles)
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
    
    return NextResponse.json(bundle, { status: 201 })
  } catch (error) {
    console.error('Error creating bundle:', error)
    return NextResponse.json(
      { error: 'Failed to create bundle' },
      { status: 500 }
    )
  }
} 
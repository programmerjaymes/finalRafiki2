import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET a single business by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const business = await prisma.business.findFirst({
      where: {
        id: id,
        // Only show approved and verified businesses
        isApproved: true,
        isVerified: true
      },
      include: {
        category: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        region: true,
        district: true,
        ward: true,
        bundle: true
      }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found or not approved' },
        { status: 404 }
      )
    }

    // Fetch business images
    const images = await prisma.$queryRaw`
      SELECT id, imageData, sortOrder FROM business_images 
      WHERE businessId = ${id} ORDER BY sortOrder ASC
    ` as Array<{ id: string; imageData: string; sortOrder: number }>

    return NextResponse.json({ ...business, images })
  } catch (error) {
    console.error('Error fetching business:', error)
    return NextResponse.json(
      { error: 'Failed to fetch business' },
      { status: 500 }
    )
  }
}

// PUT/PATCH - Update a business
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json()
    
    // Check if business exists
    const businessExists = await prisma.business.findUnique({
      where: {
        id: id
      }
    })
    
    if (!businessExists) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }
    
    // Build update data - only include fields that are present
    const updateData: any = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.email !== undefined) updateData.email = body.email
    if (body.website !== undefined) updateData.website = body.website
    if (body.logo !== undefined) updateData.logo = body.logo
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage
    if (body.facebook !== undefined) updateData.facebook = body.facebook
    if (body.instagram !== undefined) updateData.instagram = body.instagram
    if (body.twitter !== undefined) updateData.twitter = body.twitter
    if (body.allowsOnlineBooking !== undefined) updateData.allowsOnlineBooking = body.allowsOnlineBooking
    if (body.allowsDelivery !== undefined) updateData.allowsDelivery = body.allowsDelivery
    if (body.isVerified !== undefined) updateData.isVerified = body.isVerified
    if (body.isApproved !== undefined) updateData.isApproved = body.isApproved
    if (body.bundleId !== undefined) updateData.bundleId = body.bundleId
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId
    if (body.categoryId2 !== undefined) updateData.categoryId2 = body.categoryId2 || null
    if (body.latitude !== undefined) updateData.latitude = body.latitude ? parseFloat(body.latitude) : null
    if (body.longitude !== undefined) updateData.longitude = body.longitude ? parseFloat(body.longitude) : null
    if (body.regionId !== undefined) updateData.regionId = body.regionId || null
    if (body.districtId !== undefined) updateData.districtId = body.districtId || null
    if (body.wardId !== undefined) updateData.wardId = body.wardId || null
    if (body.street !== undefined) updateData.street = body.street
    if (body.ownerId !== undefined) updateData.ownerId = body.ownerId

    // Update business
    const updatedBusiness = await prisma.business.update({
      where: { id },
      data: updateData
    })

    // Handle images if provided
    if (body.images && Array.isArray(body.images)) {
      // Delete existing images
      await prisma.$executeRaw`DELETE FROM business_images WHERE businessId = ${id}`
      // Insert new ones
      for (let i = 0; i < body.images.length; i++) {
        const imgId = crypto.randomUUID().replace(/-/g, '').substring(0, 25)
        await prisma.$executeRaw`
          INSERT INTO business_images (id, businessId, imageData, sortOrder, createdAt)
          VALUES (${imgId}, ${id}, ${body.images[i]}, ${i}, NOW())
        `
      }
    }
    
    return NextResponse.json(updatedBusiness)
  } catch (error) {
    console.error('Error updating business:', error)
    return NextResponse.json(
      { error: 'Failed to update business' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a business
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if business exists
    const businessExists = await prisma.business.findUnique({
      where: {
        id: id
      }
    })
    
    if (!businessExists) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }
    
    // Delete business
    await prisma.business.delete({
      where: {
        id: id
      }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting business:', error)
    return NextResponse.json(
      { error: 'Failed to delete business' },
      { status: 500 }
    )
  }
} 
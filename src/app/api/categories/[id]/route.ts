import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getLocaleFromRequest, localizedCategoryFields } from '@/lib/categoryLocale'

// GET a single category by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const url = new URL(request.url)
    const allLang = url.searchParams.get('allLang') === '1'

    const category = await prisma.category.findUnique({
      where: { id },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (allLang) {
      return NextResponse.json(category)
    }

    const locale = getLocaleFromRequest(request)
    const { name, description } = localizedCategoryFields(category, locale)
    return NextResponse.json({
      ...category,
      name,
      description,
    })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

// PUT/PATCH - Update a category
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const nameEn = typeof body.nameEn === 'string' ? body.nameEn.trim() : ''
    const nameSw = typeof body.nameSw === 'string' ? body.nameSw.trim() : ''
    const descriptionEn =
      typeof body.descriptionEn === 'string'
        ? body.descriptionEn.trim() || null
        : undefined
    const descriptionSw =
      typeof body.descriptionSw === 'string'
        ? body.descriptionSw.trim() || null
        : undefined
    const icon =
      body.icon === undefined
        ? undefined
        : typeof body.icon === 'string' && body.icon.trim()
          ? body.icon.trim()
          : null

    if (!nameEn || !nameSw) {
      return NextResponse.json(
        { error: 'Both English and Swahili category names are required' },
        { status: 400 }
      )
    }

    const categoryExists = await prisma.category.findUnique({
      where: { id },
    })

    if (!categoryExists) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: nameEn,
        nameEn,
        nameSw,
        ...(descriptionEn !== undefined && { description: descriptionEn }),
        ...(descriptionEn !== undefined && { descriptionEn }),
        ...(descriptionSw !== undefined && { descriptionSw }),
        ...(icon !== undefined && { icon }),
      },
    })

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a category
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if category exists
    const categoryExists = await prisma.category.findUnique({
      where: {
        id: id
      }
    })
    
    if (!categoryExists) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }
    
    // TODO: Check if category is in use by any businesses
    // This is important to prevent deletion of categories that are in use
    
    // Delete category
    await prisma.category.delete({
      where: {
        id: id
      }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
} 
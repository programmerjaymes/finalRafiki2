import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET a single category by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const category = await prisma.category.findUnique({
      where: {
        id: id
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
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
    const { id } = await params;
    const body = await request.json()
    
    const { name, description, icon } = body
    
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
    
    // Update category
    const updatedCategory = await prisma.category.update({
      where: {
        id: id
      },
      data: {
        name,
        description,
        icon
      }
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
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all categories
export async function GET(request: Request) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST - Create a new category
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Extract fields from the request body
    const { name, icon, description } = body;
    
    // Check required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }
    
    // Create category
    const category = await prisma.category.create({
      data: {
        name,
        icon,
        description
      }
    });
    
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
} 
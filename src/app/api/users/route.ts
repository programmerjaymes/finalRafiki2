import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Fetch users with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    
    console.log('API request parameters:', { page, limit, search, role })
    
    // Calculate pagination
    const skip = (page - 1) * limit
    
    // Build where conditions for filtering
    const where: any = {}
    
    // Add role filter if provided
    if (role) {
      where.role = role
    }
    
    // Add search filter if provided
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    // Fetch users with filters and pagination
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        // You can add related data if needed
        businesses: {
          select: {
            id: true,
            name: true,
          },
        },
        registeredBusinesses: {
          select: {
            id: true,
            name: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            paymentStatus: true,
          },
          take: 5, // Limit to recent payments
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    // Count total users for pagination metadata
    const total = await prisma.user.count({ where })
    const totalPages = Math.ceil(total / limit)
    
    return NextResponse.json({
      users,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    )
  }
}

// POST: Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.email || !body.role) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, role' },
        { status: 400 }
      )
    }
    
    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 409 }
      )
    }
    
    // Hash password if provided
    let hashedPassword: string | undefined
    if (body.password) {
      // In a real app, you would use bcrypt to hash passwords
      // For example: hashedPassword = await bcrypt.hash(body.password, 10)
      hashedPassword = body.password // This is just a placeholder
    }
    
    // Create new user
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        role: body.role,
        hashedPassword,
      },
      select: {
        id: true,
        name: true, 
        email: true,
        role: true,
        emailVerified: true,
        image: true, 
        createdAt: true,
        updatedAt: true,
      },
    })
    
    return NextResponse.json({ user }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating user:', error)
    
    return NextResponse.json(
      { error: 'Failed to create user', details: error.message },
      { status: 500 }
    )
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { recordAudit } from '@/lib/activityLog'

// GET: Fetch users with filtering and pagination

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const businessStatus = searchParams.get('businessStatus') || ''
    const registrationStatus = searchParams.get('registrationStatus') || ''
    const emailExact = searchParams.get('email')
    const phoneExact = searchParams.get('phone')
    
    console.log('API request parameters:', { page, limit, search, role })
    
    // Calculate pagination
    const skip = (page - 1) * limit
    
    // Build where conditions for filtering
    const where: any = {}
    
    // Add role filter if provided
    if (role) {
      where.role = role
    }

    if (emailExact) {
      where.email = emailExact
    }

    if (phoneExact) {
      where.phone = phoneExact
    }

    if (businessStatus === 'with_business') {
      where.businesses = { some: {} }
    } else if (businessStatus === 'without_business') {
      where.businesses = { none: {} }
    }

    if (registrationStatus === 'not_started') {
      where.businesses = { none: {} }
      where.businessRegistrations = { none: {} }
    } else if (registrationStatus === 'in_progress') {
      where.businesses = { none: {} }
      where.businessRegistrations = { some: { isCompleted: false } }
    } else if (registrationStatus === 'completed') {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { businesses: { some: {} } },
            { businessRegistrations: { some: { isCompleted: true } } },
          ],
        },
      ]
    }

    // Add search filter if provided
    if (search && !emailExact && !phoneExact) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ]
    }
    
    const userQuery = {
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        receivesApprovalNotifications: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        businesses: {
          select: {
            id: true,
            name: true,
          },
        },
        businessRegistrations: {
          select: {
            step: true,
            isCompleted: true,
            updatedAt: true,
          },
          take: 1,
          orderBy: {
            updatedAt: 'desc' as const,
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
          take: 5,
          orderBy: {
            createdAt: 'desc' as const,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc' as const,
      },
    };

    const [users, total, totalUsers, usersWithBusinesses, businessOwners, registrationsInProgress] = await Promise.all([
      prisma.user.findMany(userQuery),
      prisma.user.count({ where }),
      prisma.user.count(),
      prisma.user.count({ where: { businesses: { some: {} } } }),
      prisma.user.count({ where: { role: 'BUSINESS_OWNER' } }),
      prisma.user.count({
        where: {
          businesses: { none: {} },
          businessRegistrations: { some: { isCompleted: false } },
        },
      }),
    ])
    const totalPages = Math.ceil(total / limit)
    
    return NextResponse.json({
      users,
      meta: {
        page,
        limit,
        total,
        totalPages,
        analytics: {
          totalUsers,
          usersWithBusinesses,
          businessOwners,
          registrationsInProgress,
        },
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
        phone: body.phone?.trim() || null,
        role: body.role,
        hashedPassword,
      },
      select: {
        id: true,
        name: true, 
        email: true,
        phone: true,
        role: true,
        receivesApprovalNotifications: true,
        emailVerified: true,
        image: true, 
        createdAt: true,
        updatedAt: true,
      },
    })
    
    const session = await getServerSession(authOptions)
    await recordAudit({ actorId: session?.user.id, action: 'USER_CREATED', entityType: 'User', entityId: user.id, description: `Created user ${user.name}`, request })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating user:', error)
    
    return NextResponse.json(
      { error: 'Failed to create user', details: error.message },
      { status: 500 }
    )
  }
} 

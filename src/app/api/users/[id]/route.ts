import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logApplicationError, recordAudit } from '@/lib/activityLog';
import bcrypt from 'bcryptjs';

// GET: Fetch a specific user

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get user by ID with relations
    const user = await prisma.user.findUnique({
      where: { id },
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
        // Include related data
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
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details', details: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update a user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate that at least one field to update is provided
    if (!body.name && !body.email && body.phone === undefined && !body.role && !body.password) {
      return NextResponse.json(
        { error: 'No update data provided' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if email is already in use by another user
    if (body.email && body.email !== existingUser.email) {
      const userWithEmail = await prisma.user.findUnique({
        where: { email: body.email },
      });
      
      if (userWithEmail && userWithEmail.id !== id) {
        await logApplicationError({ level: 'WARN', message: 'User update rejected: email already in use', route: `/api/users/${id}`, method: 'PUT', statusCode: 409, metadata: { userId: id } });
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 409 }
        );
      }
    }
    const normalizedPhone = body.phone?.trim() || null;
    if (normalizedPhone && normalizedPhone !== existingUser.phone) {
      const userWithPhone = await prisma.user.findUnique({ where: { phone: normalizedPhone } });
      if (userWithPhone && userWithPhone.id !== id) {
        await logApplicationError({ level: 'WARN', message: 'User update rejected: phone number already in use', route: `/api/users/${id}`, method: 'PUT', statusCode: 409, metadata: { userId: id } });
        return NextResponse.json({ error: "Phone number already in use" }, { status: 409 });
      }
    }

    
    // Prepare update data
    const updateData: any = {};
    
    if (body.name) updateData.name = body.name;
    if (body.email) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = normalizedPhone;
    if (body.role) updateData.role = body.role;
    
    // Hash password if provided
    if (body.password) {
      updateData.hashedPassword = await bcrypt.hash(body.password, 12);
    }
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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
    });
    
    const session = await getServerSession(authOptions);
    await recordAudit({ actorId: session?.user.id, action: 'USER_UPDATED', entityType: 'User', entityId: id, description: `Updated user ${updatedUser.name}`, request });

    return NextResponse.json({ user: updatedUser });
  } catch (error: any) {
    console.error('Error updating user:', error);
    await logApplicationError({ level: 'ERROR', message: error instanceof Error ? error.message : 'Failed to update user', route: request.nextUrl.pathname, method: 'PUT', statusCode: 500, stack: error instanceof Error ? error.stack : undefined });
    
    return NextResponse.json(
      { error: 'Failed to update user', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Delete user
    await prisma.user.delete({
      where: { id },
    });
    
    const session = await getServerSession(authOptions);
    await recordAudit({ actorId: session?.user.id, action: 'USER_DELETED', entityType: 'User', entityId: id, description: `Deleted user ${existingUser.name}`, request });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    
    return NextResponse.json(
      { error: 'Failed to delete user', details: error.message },
      { status: 500 }
    );
  }
} 

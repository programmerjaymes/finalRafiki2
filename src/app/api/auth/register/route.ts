import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';


export const dynamic = 'force-dynamic';

type UserRole = 'ADMIN' | 'BUSINESS_OWNER' | 'BUSINESS_REGISTRAR' | 'ACCOUNTANT';

// POST: Handle user registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password, role = 'BUSINESS_OWNER' } = body as {
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
      role?: string;
    };
    
    // Validate required fields
    if (!name || !password || (!email && !phone)) {
      return NextResponse.json(
        { 
          status: 'error',
          error: 'Name, password, and email or phone are required',
          field: !name ? 'name' : !password ? 'password' : 'email'
        },
        { status: 400 }
      );
    }
    
    if (email) {
      const existingByEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingByEmail) {
        return NextResponse.json(
          { 
            status: 'error',
            error: 'This email is already registered. Please use a different email or try logging in.',
            field: 'email'
          },
          { status: 409 }
        );
      }
    }

    if (phone) {
      const existingByPhone = await prisma.user.findUnique({
        where: { phone },
      });
      if (existingByPhone) {
        return NextResponse.json(
          { 
            status: 'error',
            error: 'This phone number is already registered.',
            field: 'phone'
          },
          { status: 409 }
        );
      }
    }
    
    // Hash the password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create the new user
    const user = await prisma.user.create({
      data: {
        name,
        email: email ?? null,
        phone: phone ?? null,
        hashedPassword,
        role: role as UserRole,
      },
    });
    
    // Return user data without sensitive information
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      status: 'success',
      user: userWithoutPassword,
      message: 'Registration successful! You can now log in.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    return NextResponse.json(
      { 
        status: 'error',
        error: 'An unexpected error occurred during registration. Please try again.',
      },
      { status: 500 }
    );
  }
}

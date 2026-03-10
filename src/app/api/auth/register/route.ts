import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

type UserRole = 'ADMIN' | 'BUSINESS_OWNER' | 'BUSINESS_REGISTRAR' | 'ACCOUNTANT';

// POST: Handle user registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role = 'BUSINESS_OWNER' } = body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { 
          status: 'error',
          error: 'Name, email and password are required',
          field: !name ? 'name' : !email ? 'email' : 'password'
        },
        { status: 400 }
      );
    }
    
    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { 
          status: 'error',
          error: 'This email is already registered. Please use a different email or try logging in.',
          field: 'email'
        },
        { status: 409 }
      );
    }
    
    // Hash the password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create the new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
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
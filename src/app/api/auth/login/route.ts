import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// POST: Handle user login

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, password } = body as {
      email?: string;
      phone?: string;
      password?: string;
    };
    
    // Validate required fields
    if ((!email && !phone) || !password) {
      return NextResponse.json(
        { 
          status: 'error',
          error: 'Email or phone, and password are required',
          field: !email && !phone ? 'email' : 'password'
        },
        { status: 400 }
      );
    }

    // Find user by email or phone (mobile app / Rafiki app)
    const user = await prisma.user.findFirst({
      where: email ? { email } : { phone: phone! },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        createdAt: true,
        hashedPassword: true,
      },
    });
    
    // Don't reveal whether a user exists for security
    if (!user || !user.hashedPassword) {
      return NextResponse.json(
        { 
          status: 'error',
          error: 'Invalid email or password',
          field: 'email'  // Start with email field
        },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          status: 'error',
          error: 'Invalid email or password',
          field: 'password'  // Password was wrong
        },
        { status: 401 }
      );
    }

    // Remove hashedPassword from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      status: 'success',
      user: userWithoutPassword,
      message: 'Login successful',
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: 'An unexpected error occurred during login. Please try again.',
      },
      { status: 500 }
    );
  }
}

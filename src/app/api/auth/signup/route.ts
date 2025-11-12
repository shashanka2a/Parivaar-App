import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Sign up user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
        },
      },
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create user in Prisma database
    try {
      const dbUser = await prisma.user.create({
        data: {
          email: authData.user.email!,
          name: name || authData.user.user_metadata?.name || email.split('@')[0],
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });

      return NextResponse.json(
        {
          message: 'User created successfully',
          user: {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
          },
          session: authData.session,
        },
        { status: 201 }
      );
    } catch (dbError: any) {
      // If user already exists in DB, that's okay (might have been created by middleware)
      if (dbError.code === 'P2002') {
        // User already exists, fetch and return
        const existingUser = await prisma.user.findUnique({
          where: { email: authData.user.email! },
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        });

        return NextResponse.json(
          {
            message: 'User created successfully',
            user: existingUser,
            session: authData.session,
          },
          { status: 201 }
        );
      }

      // Other database errors
      console.error('Database error during signup:', dbError);
      return NextResponse.json(
        { error: 'Failed to create user in database' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    const results = {
      timestamp: new Date().toISOString(),
      authenticated: !!user,
      user: user ? {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata,
      } : null,
      error: authError?.message || null,
      databaseUser: null as any,
    };

    // If user is authenticated, check if they exist in Prisma database
    if (user && user.email) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: {
            familyTrees: {
              select: {
                id: true,
                name: true,
                slug: true,
                createdAt: true,
              },
            },
          },
        });

        results.databaseUser = dbUser || 'User not found in database (will be created on first access)';
      } catch (error: any) {
        results.databaseUser = { error: error.message };
      }
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        authenticated: false,
        error: error.message || 'Failed to check authentication',
      },
      { status: 500 }
    );
  }
}


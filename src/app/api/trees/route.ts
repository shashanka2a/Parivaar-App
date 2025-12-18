import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';

// GET /api/trees - list trees for current user
export async function GET() {
  try {
    // Same auth pattern as /api/auth/me
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Ensure Prisma user exists and load their trees
    const dbUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.user_metadata?.name || user.email.split('@')[0],
      },
      create: {
        email: user.email,
        name: user.user_metadata?.name || user.email.split('@')[0],
      },
      include: {
        familyTrees: {
          orderBy: { updatedAt: 'desc' },
          include: {
            _count: { select: { persons: true } },
          },
        },
      },
    });

    const trees = dbUser.familyTrees.map((tree: typeof dbUser.familyTrees[0]) => ({
      id: tree.id,
      name: tree.name,
      slug: tree.slug,
      theme: tree.theme,
      memberCount: tree._count.persons,
      createdAt: tree.createdAt,
      lastModified: tree.updatedAt,
    }));

    return NextResponse.json({ trees }, { status: 200 });
  } catch (error: any) {
    const isVercel = !!process.env.VERCEL;
    console.error('GET /api/trees failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('DIRECT_URL:', process.env.DIRECT_URL ? 'SET' : 'NOT SET');
    console.error('Is Vercel:', isVercel);
    
    // Provide helpful error message
    let errorMessage = error.message || 'Failed to load trees';
    if (error.message?.includes("Can't reach database server") || error.code === 'P1001') {
      if (isVercel) {
        errorMessage = 'Database connection failed. Check Vercel logs for details. Verify DIRECT_URL is set and that Supabase project is active.';
      } else {
        errorMessage = 'Database connection failed. Please check DIRECT_URL in .env.local and restart the dev server.';
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: {
        code: error.code,
        hasDirectUrl: !!process.env.DIRECT_URL,
        isVercel: isVercel,
        directUrlPreview: process.env.DIRECT_URL ? process.env.DIRECT_URL.substring(0, 30) + '...' : 'NOT SET',
      },
    }, { status: 500 });
  }
}

// POST /api/trees - create a new tree for current user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name || '').trim();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const dbUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.user_metadata?.name || user.email.split('@')[0],
      },
      create: {
        email: user.email,
        name: user.user_metadata?.name || user.email.split('@')[0],
      },
    });

    const baseSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    let slug = baseSlug || `tree-${Date.now()}`;
    let counter = 1;
    // Ensure unique slug
    while (await prisma.familyTree.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const tree = await prisma.familyTree.create({
      data: {
        name,
        slug,
        userId: dbUser.id,
      },
    });

    return NextResponse.json(
      {
        id: tree.id,
        name: tree.name,
        slug: tree.slug,
        theme: tree.theme,
        memberCount: 0,
        createdAt: tree.createdAt,
        lastModified: tree.updatedAt,
      },
      { status: 201 },
    );
  } catch (error: any) {
    const isVercel = !!process.env.VERCEL;
    console.error('POST /api/trees failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('DIRECT_URL:', process.env.DIRECT_URL ? 'SET' : 'NOT SET');
    console.error('Is Vercel:', isVercel);
    
    // Provide helpful error message
    let errorMessage = error.message || 'Failed to create tree';
    if (error.message?.includes("Can't reach database server") || error.code === 'P1001') {
      if (isVercel) {
        errorMessage = 'Database connection failed. Check Vercel logs for details. Verify DIRECT_URL is set and that Supabase project is active.';
      } else {
        errorMessage = 'Database connection failed. Please check DIRECT_URL in .env.local and restart the dev server.';
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: {
        code: error.code,
        hasDirectUrl: !!process.env.DIRECT_URL,
        isVercel: isVercel,
        directUrlPreview: process.env.DIRECT_URL ? process.env.DIRECT_URL.substring(0, 30) + '...' : 'NOT SET',
      },
    }, { status: 500 });
  }
}



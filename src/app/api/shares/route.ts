import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';

// POST /api/shares - create a share link for a family tree owned by the current user
export async function POST(request: NextRequest) {
  try {
    const { treeId, expiresInDays } = await request.json();

    if (!treeId || typeof treeId !== 'string') {
      return NextResponse.json({ error: 'treeId is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tree = await prisma.familyTree.findUnique({
      where: { id: treeId },
      select: { id: true, userId: true, slug: true, name: true },
    });

    if (!tree || tree.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Tree not found' }, { status: 404 });
    }

    const baseId = Math.random().toString(36).slice(2, 10);
    const shareId = `${tree.slug || 'tree'}-${baseId}`;

    const expiresAt =
      typeof expiresInDays === 'number' && expiresInDays > 0
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : null;

    const share = await prisma.share.create({
      data: {
        shareId,
        familyTreeId: tree.id,
        isActive: true,
        expiresAt,
      },
    });

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      request.nextUrl.origin ||
      '';

    const url = `${origin}/shared/${share.shareId}`;

    return NextResponse.json(
      {
        shareId: share.shareId,
        url,
        expiresAt: share.expiresAt,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('POST /api/shares failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create share link' },
      { status: 500 },
    );
  }
}



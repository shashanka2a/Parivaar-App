import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// GET /api/shares/:shareId - public read-only access to a shared tree
export async function GET(
  request: NextRequest,
  { params }: { params: { shareId: string } },
) {
  try {
    const share = await prisma.share.findUnique({
      where: { shareId: params.shareId },
      include: {
        familyTree: {
          include: {
            persons: true,
          },
        },
      },
    });

    if (
      !share ||
      !share.isActive ||
      (share.expiresAt && share.expiresAt < new Date())
    ) {
      return NextResponse.json(
        { error: 'Share link is invalid or has expired' },
        { status: 404 },
      );
    }

    const tree = share.familyTree;

    return NextResponse.json(
      {
        shareId: share.shareId,
        familyTree: {
          id: tree.id,
          name: tree.name,
          slug: tree.slug,
          theme: tree.theme,
          createdAt: tree.createdAt,
          lastModified: tree.updatedAt,
          persons: tree.persons,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('GET /api/shares/[shareId] failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load shared tree' },
      { status: 500 },
    );
  }
}



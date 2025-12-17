import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';

// Helper to ensure the current user owns the tree
async function requireOwnTree(treeId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    throw new Error('Unauthorized');
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    select: { id: true },
  });

  if (!dbUser) {
    throw new Error('Unauthorized');
  }

  const tree = await prisma.familyTree.findUnique({
    where: { id: treeId },
    include: { persons: true },
  });

  if (!tree || tree.userId !== dbUser.id) {
    throw new Error('Not found');
  }

  return tree;
}

// GET /api/trees/:id - load full tree with persons
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const tree = await requireOwnTree(params.id);

    return NextResponse.json(
      {
        id: tree.id,
        name: tree.name,
        slug: tree.slug,
        theme: tree.theme,
        createdAt: tree.createdAt,
        lastModified: tree.updatedAt,
        persons: tree.persons,
      },
      { status: 200 },
    );
  } catch (error: any) {
    const message = error.message || 'Failed to load tree';
    const status = message === 'Unauthorized' ? 401 : message === 'Not found' ? 404 : 500;
    console.error('GET /api/trees/[id] failed:', error);
    return NextResponse.json({ error: message }, { status });
  }
}

// PUT /api/trees/:id - replace persons array (simple sync)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const tree = await requireOwnTree(params.id);
    const body = await request.json();
    const incomingPersons = Array.isArray(body.persons) ? body.persons : [];
    const name = typeof body.name === 'string' && body.name.trim() ? body.name.trim() : tree.name;

    // Simple strategy: delete all existing persons and recreate from payload
    await prisma.person.deleteMany({ where: { familyTreeId: tree.id } });

    if (incomingPersons.length) {
      await prisma.person.createMany({
        data: incomingPersons.map((p: any) => ({
          id: p.id || undefined,
          name: p.name,
          relation: p.relation,
          birthYear: p.birthYear ?? null,
          deathYear: p.deathYear ?? null,
          gender: p.gender,
          photo: p.photo ?? null,
          notes: p.notes ?? null,
          parentId: p.parentId ?? null,
          spouseId: p.spouseId ?? null,
          generation: p.generation ?? 0,
          biography: p.biography ?? null,
          dateOfBirth: p.dateOfBirth ?? null,
          birthPlace: p.birthPlace ?? null,
          nakshatram: p.nakshatram ?? null,
          moolaPadam: p.moolaPadam ?? null,
          rasi: p.rasi ?? null,
          height: p.height ?? null,
          weight: p.weight ?? null,
          bloodGroup: p.bloodGroup ?? null,
          complexion: p.complexion ?? null,
          marriageDate: p.marriageDate ?? null,
          timeline: p.timeline ?? null,
          gallery: p.gallery ?? null,
          documents: p.documents ?? null,
          education: p.education ?? null,
          career: p.career ?? null,
          contact: p.contact ?? null,
          familyTreeId: tree.id,
        })),
      });
    }

    const updated = await prisma.familyTree.update({
      where: { id: tree.id },
      data: {
        name,
      },
      include: { persons: true },
    });

    return NextResponse.json(
      {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        theme: updated.theme,
        createdAt: updated.createdAt,
        lastModified: updated.updatedAt,
        persons: updated.persons,
      },
      { status: 200 },
    );
  } catch (error: any) {
    const message = error.message || 'Failed to save tree';
    const status = message === 'Unauthorized' ? 401 : message === 'Not found' ? 404 : 500;
    console.error('PUT /api/trees/[id] failed:', error);
    return NextResponse.json({ error: message }, { status });
  }
}

// DELETE /api/trees/:id - delete tree and related persons/shares
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const tree = await requireOwnTree(params.id);

    await prisma.familyTree.delete({
      where: { id: tree.id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    const message = error.message || 'Failed to delete tree';
    const status = message === 'Unauthorized' ? 401 : message === 'Not found' ? 404 : 500;
    console.error('DELETE /api/trees/[id] failed:', error);
    return NextResponse.json({ error: message }, { status });
  }
}



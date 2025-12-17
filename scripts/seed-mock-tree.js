// Seed a mock Indian family tree with 3 generations using Prisma directly.
// Usage:
//   NODE_ENV=development DATABASE_URL=\"...\" node scripts/seed-mock-tree.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = 'mock.indian.family@parivaar.test';
  const name = 'Mock Indian User';

  console.log('Seeding mock user and family tree...');

  // Upsert user
  const user = await prisma.user.upsert({
    where: { email },
    update: { name },
    create: { email, name },
  });

  // Create family tree
  const treeName = 'Jagannatham Family (Mock)';
  const slugBase = 'jagannatham-family-mock';

  const existingTree = await prisma.familyTree.findFirst({
    where: { userId: user.id, slug: slugBase },
  });

  const tree =
    existingTree ||
    (await prisma.familyTree.create({
      data: {
        name: treeName,
        slug: slugBase,
        userId: user.id,
        theme: 'modern',
      },
    }));

  console.log('Using tree id:', tree.id);

  // Clear existing persons for this mock tree
  await prisma.person.deleteMany({ where: { familyTreeId: tree.id } });

  // 10‑member Indian family (3 generations)
  const persons = [
    // Grandparents (generation -2)
    {
      id: 'gp1',
      name: 'Jagannatham Subhash Chandar',
      relation: 'Grandfather',
      gender: 'male',
      generation: -2,
      dateOfBirth: '1940-01-10',
    },
    {
      id: 'gp2',
      name: 'Jagannatham Soujanya Laxmi',
      relation: 'Grandmother',
      gender: 'female',
      generation: -2,
      dateOfBirth: '1945-06-21',
      spouseId: 'gp1',
    },
    // Uncle & Aunt (generation -1)
    {
      id: 'u1',
      name: 'Jagannatham Raghu Chander',
      relation: 'Uncle',
      gender: 'male',
      generation: -1,
      parentId: 'gp1',
      dateOfBirth: '1968-03-05',
    },
    {
      id: 'a1',
      name: 'Uma Raghu',
      relation: 'Aunt',
      gender: 'female',
      generation: -1,
      spouseId: 'u1',
      dateOfBirth: '1970-09-14',
    },
    // Parents (generation -1)
    {
      id: 'p1',
      name: 'Jagannatham Ravi Chander',
      relation: 'Father',
      gender: 'male',
      generation: -1,
      parentId: 'gp1',
      dateOfBirth: '1972-11-20',
    },
    {
      id: 'p2',
      name: 'Jagannatham Bharathi',
      relation: 'Mother',
      gender: 'female',
      generation: -1,
      spouseId: 'p1',
      dateOfBirth: '1976-08-21',
    },
    // Cousins (children of uncle/aunt, generation 0)
    {
      id: 'c1',
      name: 'Rohit Raghu',
      relation: 'Cousin',
      gender: 'male',
      generation: 0,
      parentId: 'u1',
      dateOfBirth: '1998-02-15',
    },
    {
      id: 'c2',
      name: 'Sneha Raghu',
      relation: 'Cousin',
      gender: 'female',
      generation: 0,
      parentId: 'u1',
      dateOfBirth: '2001-07-09',
    },
    // Children (generation 0)
    {
      id: 'ch1',
      name: 'Jagannatham Shashank',
      relation: 'Son',
      gender: 'male',
      generation: 0,
      parentId: 'p1',
      dateOfBirth: '2000-03-07',
      birthPlace: 'Nizamabad, Telangana, India',
    },
    {
      id: 'ch2',
      name: 'Jagannatham Shivani',
      relation: 'Daughter',
      gender: 'female',
      generation: 0,
      parentId: 'p1',
      dateOfBirth: '2002-04-15',
      birthPlace: 'Nizamabad, Telangana, India',
    },
  ];

  await prisma.person.createMany({
    data: persons.map((p) => ({
      ...p,
      familyTreeId: tree.id,
    })),
  });

  // Create a share link for this tree
  const shareId = `${tree.slug}-mock-${Math.random().toString(36).slice(2, 8)}`;
  const share = await prisma.share.create({
    data: {
      shareId,
      familyTreeId: tree.id,
      isActive: true,
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const shareUrl = `${baseUrl}/shared/${share.shareId}`;

  console.log('\n✅ Mock family tree seeded.');
  console.log('User email:', email);
  console.log('Tree name:', treeName);
  console.log('Tree id:', tree.id);
  console.log('Share link:', shareUrl);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



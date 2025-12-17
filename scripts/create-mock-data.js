/**
 * Create comprehensive mock data: users, trees, and persons
 * Usage: node scripts/create-mock-data.js
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createMockData() {
  console.log('🚀 Creating mock data for testing...\n');

  // Create 3 mock users
  const users = [
    { email: 'alice@parivaar.test', name: 'Alice Smith' },
    { email: 'bob@parivaar.test', name: 'Bob Johnson' },
    { email: 'charlie@parivaar.test', name: 'Charlie Brown' },
  ];

  console.log('👤 Creating mock users...');
  const createdUsers = [];
  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: { name: userData.name },
      create: userData,
    });
    createdUsers.push(user);
    console.log(`   ✅ ${user.name} (${user.email})`);
  }
  console.log(`\n✅ Created ${createdUsers.length} users\n`);

  // Create family trees for each user
  console.log('🌳 Creating family trees...');
  const trees = [];
  for (let i = 0; i < createdUsers.length; i++) {
    const user = createdUsers[i];
    const treeNames = [
      'Smith Family Tree',
      'Johnson Family Tree',
      'Brown Family Tree',
    ];
    const slugs = ['smith-family', 'johnson-family', 'brown-family'];

    const tree = await prisma.familyTree.upsert({
      where: { slug: slugs[i] },
      update: { name: treeNames[i] },
      create: {
        name: treeNames[i],
        slug: slugs[i],
        userId: user.id,
        theme: 'modern',
      },
    });
    trees.push(tree);
    console.log(`   ✅ ${tree.name} (${tree.slug})`);
  }
  console.log(`\n✅ Created ${trees.length} family trees\n`);

  // Create persons for each tree
  console.log('👥 Creating family members...');
  for (let i = 0; i < trees.length; i++) {
    const tree = trees[i];
    const user = createdUsers[i];

    // Clear existing persons
    await prisma.person.deleteMany({
      where: { familyTreeId: tree.id },
    });

    // Create family members (different for each tree)
    const familyMembers = [
      // Tree 1: Simple 3-person family
      [
        { name: 'Alice Smith', relation: 'Self', gender: 'female', generation: 0 },
        { name: 'David Smith', relation: 'Spouse', gender: 'male', generation: 0 },
        { name: 'Emma Smith', relation: 'Daughter', gender: 'female', generation: 1 },
      ],
      // Tree 2: Extended family
      [
        { name: 'Bob Johnson', relation: 'Self', gender: 'male', generation: 0 },
        { name: 'Sarah Johnson', relation: 'Spouse', gender: 'female', generation: 0 },
        { name: 'Michael Johnson', relation: 'Son', gender: 'male', generation: 1 },
        { name: 'Lisa Johnson', relation: 'Daughter', gender: 'female', generation: 1 },
        { name: 'Robert Johnson', relation: 'Father', gender: 'male', generation: -1 },
      ],
      // Tree 3: Multi-generation
      [
        { name: 'Charlie Brown', relation: 'Self', gender: 'male', generation: 0 },
        { name: 'Lucy Brown', relation: 'Spouse', gender: 'female', generation: 0 },
        { name: 'Linus Brown', relation: 'Brother', gender: 'male', generation: 0 },
        { name: 'Sally Brown', relation: 'Sister', gender: 'female', generation: 0 },
        { name: 'Grandpa Brown', relation: 'Grandfather', gender: 'male', generation: -2 },
        { name: 'Grandma Brown', relation: 'Grandmother', gender: 'female', generation: -2 },
      ],
    ];

    const members = familyMembers[i].map((member) => ({
      ...member,
      familyTreeId: tree.id,
    }));

    const created = await prisma.person.createMany({
      data: members,
    });

    console.log(`   ✅ ${tree.name}: ${created.count} members`);
  }
  console.log(`\n✅ Created family members for all trees\n`);

  // Summary
  console.log('📊 Summary:');
  const totalUsers = await prisma.user.count();
  const totalTrees = await prisma.familyTree.count();
  const totalPersons = await prisma.person.count();

  console.log(`   Users: ${totalUsers}`);
  console.log(`   Family Trees: ${totalTrees}`);
  console.log(`   Persons: ${totalPersons}\n`);

  // List all trees with their details
  console.log('🌳 Family Trees:');
  const allTrees = await prisma.familyTree.findMany({
    include: {
      user: true,
      _count: { select: { persons: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  for (const tree of allTrees) {
    console.log(`   ${tree.name}`);
    console.log(`      Owner: ${tree.user.name} (${tree.user.email})`);
    console.log(`      Members: ${tree._count.persons}`);
    console.log(`      ID: ${tree.id}`);
    console.log(`      Slug: ${tree.slug}\n`);
  }

  console.log('🎉 Mock data creation complete!\n');
}

// Run
createMockData()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('\n❌ Failed to create mock data:', error);
    await prisma.$disconnect();
    process.exit(1);
  });


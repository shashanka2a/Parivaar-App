/**
 * Test database connection and create mock users/trees
 * Usage: node scripts/test-db-connection.js
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  console.log('🔍 Testing database connection...\n');

  // Test 1: Basic connection
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful!\n');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check DATABASE_URL in .env.local');
    console.error('   2. Verify Supabase project is active');
    console.error('   3. Check database password is correct');
    console.error('   4. Ensure connection string format is correct');
    process.exit(1);
  }

  // Test 2: Query existing data
  try {
    const userCount = await prisma.user.count();
    const treeCount = await prisma.familyTree.count();
    const personCount = await prisma.person.count();
    
    console.log('📊 Current database stats:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Family Trees: ${treeCount}`);
    console.log(`   Persons: ${personCount}\n`);
  } catch (error) {
    console.error('❌ Failed to query database:', error.message);
    console.error('   This might mean tables don\'t exist. Run: npx prisma db push');
    process.exit(1);
  }

  // Test 3: Create a test user
  console.log('🧪 Creating test user...');
  try {
    const testUser = await prisma.user.upsert({
      where: { email: 'test@parivaar.test' },
      update: { name: 'Test User' },
      create: {
        email: 'test@parivaar.test',
        name: 'Test User',
      },
    });
    console.log(`✅ Test user created: ${testUser.name} (${testUser.email})`);
    console.log(`   User ID: ${testUser.id}\n`);
  } catch (error) {
    console.error('❌ Failed to create test user:', error.message);
    process.exit(1);
  }

  // Test 4: Create a test tree
  console.log('🌳 Creating test family tree...');
  try {
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@parivaar.test' },
    });

    const testTree = await prisma.familyTree.upsert({
      where: { slug: 'test-family-tree' },
      update: { name: 'Test Family Tree' },
      create: {
        name: 'Test Family Tree',
        slug: 'test-family-tree',
        userId: testUser.id,
        theme: 'modern',
      },
    });
    console.log(`✅ Test tree created: ${testTree.name}`);
    console.log(`   Tree ID: ${testTree.id}`);
    console.log(`   Slug: ${testTree.slug}\n`);
  } catch (error) {
    console.error('❌ Failed to create test tree:', error.message);
    process.exit(1);
  }

  // Test 5: Create test persons
  console.log('👥 Creating test persons...');
  try {
    const testTree = await prisma.familyTree.findUnique({
      where: { slug: 'test-family-tree' },
    });

    // Clear existing persons
    await prisma.person.deleteMany({
      where: { familyTreeId: testTree.id },
    });

    // Create test persons
    const persons = [
      {
        name: 'John Doe',
        relation: 'Self',
        gender: 'male',
        generation: 0,
        familyTreeId: testTree.id,
      },
      {
        name: 'Jane Doe',
        relation: 'Spouse',
        gender: 'female',
        generation: 0,
        familyTreeId: testTree.id,
      },
    ];

    const createdPersons = await prisma.person.createMany({
      data: persons,
    });

    console.log(`✅ Created ${createdPersons.count} test persons\n`);
  } catch (error) {
    console.error('❌ Failed to create test persons:', error.message);
    process.exit(1);
  }

  // Test 6: Query everything back
  console.log('🔍 Verifying data...');
  try {
    const testTree = await prisma.familyTree.findUnique({
      where: { slug: 'test-family-tree' },
      include: {
        user: true,
        persons: true,
      },
    });

    console.log(`✅ Verification successful!`);
    console.log(`   Tree: ${testTree.name}`);
    console.log(`   Owner: ${testTree.user.name} (${testTree.user.email})`);
    console.log(`   Members: ${testTree.persons.length} persons\n`);
  } catch (error) {
    console.error('❌ Failed to verify data:', error.message);
    process.exit(1);
  }

  console.log('🎉 All tests passed! Database is working correctly.\n');
}

// Run tests
testConnection()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('\n❌ Test suite failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });



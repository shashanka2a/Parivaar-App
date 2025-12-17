/**
 * Test script to verify Supabase and Prisma connections
 * Run with: node test-connection.js
 */

require('dotenv').config({ path: '.env.local' });

async function testConnections() {
  console.log('🔍 Testing Supabase and Prisma Connections...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('  NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set');
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set');
  console.log('  SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Not set');
  console.log('  DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');
  console.log('');

  // Test Supabase
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Supabase: Missing environment variables');
    } else {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Test connection by getting auth session
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.log('❌ Supabase Connection Error:', error.message);
      } else {
        console.log('✅ Supabase: Connected successfully');
        console.log('   URL:', supabaseUrl);
      }
    }
  } catch (error) {
    console.log('❌ Supabase Test Failed:', error.message);
  }

  console.log('');

  // Test Prisma
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({
      log: ['error'],
    });

    await prisma.$connect();
    console.log('✅ Prisma: Connected to database');

    // Test query
    const userCount = await prisma.user.count();
    console.log('   Users in database:', userCount);

    const treeCount = await prisma.familyTree.count();
    console.log('   Family trees in database:', treeCount);

    await prisma.$disconnect();
  } catch (error) {
    console.log('❌ Prisma Connection Error:', error.message);
    if (error.message.includes('P1001')) {
      console.log('   💡 Tip: Check your DATABASE_URL and ensure the database is accessible');
    } else if (error.message.includes('P1003')) {
      console.log('   💡 Tip: The database schema might not exist. Run: npx prisma migrate dev');
    }
  }

  console.log('\n✨ Test completed!');
  console.log('\n📝 Next steps:');
  console.log('   1. If Supabase failed: Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log('   2. If Prisma failed: Check DATABASE_URL and run: npx prisma migrate dev');
  console.log('   3. Test via API: Visit http://localhost:3000/api/test-connection');
}

testConnections().catch(console.error);


#!/usr/bin/env node

/**
 * Script to push Prisma schema to Supabase
 * Usage: node push-schema.js [DATABASE_PASSWORD]
 * Or: DATABASE_URL="..." node push-schema.js
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function pushSchema() {
  console.log('🚀 Pushing Prisma Schema to Supabase...\n');

  let databaseUrl = process.env.DATABASE_URL;
  let password = process.argv[2];

  // If DATABASE_URL is not set, try to construct it
  if (!databaseUrl) {
    if (!password) {
      console.log('📝 Database password required to push schema.\n');
      password = await question('Enter your Supabase database password: ');
      console.log('');
    }

    if (!password) {
      console.log('❌ Password is required!');
      console.log('\nGet your password from: Supabase Dashboard > Settings > Database\n');
      rl.close();
      process.exit(1);
    }

    databaseUrl = `postgresql://postgres:${password}@db.frxpbnoornbecjutllfv.supabase.co:5432/postgres`;
  }

  // Set DATABASE_URL for this process
  process.env.DATABASE_URL = databaseUrl;

  try {
    console.log('📦 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('');

    console.log('🗄️  Pushing schema to database...');
    execSync('npx prisma db push', { stdio: 'inherit' });

    console.log('\n✅ Schema pushed successfully!');
    console.log('\n📊 Next steps:');
    console.log('   1. Verify tables: npx prisma studio');
    console.log('   2. Test connection: npm run dev (then visit /api/test-connection)');
    console.log('   3. Create .env.local with DATABASE_URL for future use');
  } catch (error) {
    console.log('\n❌ Failed to push schema');
    console.log('\n💡 Common issues:');
    console.log('   - Check your database password');
    console.log('   - Ensure Supabase project is active');
    console.log('   - Verify connection string format');
    process.exit(1);
  } finally {
    rl.close();
  }
}

pushSchema();


#!/usr/bin/env node

// Script to run prisma db pull using .env.local
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load .env.local if it exists
const envLocalPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
  console.log('✅ Loaded .env.local');
} else {
  console.log('⚠️  .env.local not found, using system environment variables');
}

// Run prisma db pull
console.log('🔄 Running prisma db pull...');
try {
  execSync('npx prisma db pull', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: process.env,
  });
  console.log('✅ Prisma db pull completed successfully!');
} catch (error) {
  console.error('❌ Prisma db pull failed:', error.message);
  process.exit(1);
}


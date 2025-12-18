#!/bin/bash

# Fix Prisma for Next.js 16 - Regenerate for Node 20
# This fixes the P1001 "Can't reach database server" error
# which is actually a stale Prisma engine binary issue

set -e

echo "🔧 Fixing Prisma for Next.js 16 / Node 20..."
echo ""

echo "Step 1: Cleaning old Prisma artifacts..."
rm -rf node_modules/.prisma
rm -rf .next

echo "Step 2: Reinstalling dependencies..."
npm install

echo "Step 3: Regenerating Prisma client for Node 20..."
npx prisma generate

echo ""
echo "✅ Prisma regeneration complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Commit these changes:"
echo "      - prisma/schema.prisma (binaryTargets added)"
echo "      - package.json (engines.node added)"
echo "   2. Push to trigger a full Vercel rebuild"
echo "   3. Verify deployment works"
echo ""


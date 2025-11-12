#!/bin/bash

# Script to push Prisma schema to Supabase
# Usage: ./push-schema.sh [DATABASE_PASSWORD]

echo "🚀 Pushing Prisma Schema to Supabase..."
echo ""

# Check if password is provided as argument
if [ -z "$1" ]; then
  echo "❌ Database password required!"
  echo ""
  echo "Usage: ./push-schema.sh [YOUR_DATABASE_PASSWORD]"
  echo ""
  echo "Or set DATABASE_URL environment variable:"
  echo "  export DATABASE_URL='postgresql://postgres:[PASSWORD]@db.frxpbnoornbecjutllfv.supabase.co:5432/postgres'"
  echo ""
  echo "Get your password from: Supabase Dashboard > Settings > Database"
  exit 1
fi

PASSWORD=$1
DATABASE_URL="postgresql://postgres:${PASSWORD}@db.frxpbnoornbecjutllfv.supabase.co:5432/postgres"

echo "📋 Using connection string: postgresql://postgres:****@db.frxpbnoornbecjutllfv.supabase.co:5432/postgres"
echo ""

# Export DATABASE_URL for this session
export DATABASE_URL

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
  echo "❌ Failed to generate Prisma client"
  exit 1
fi

echo ""
echo "🗄️  Pushing schema to database..."
npx prisma db push

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Schema pushed successfully!"
  echo ""
  echo "📊 Next steps:"
  echo "   1. Verify tables: npx prisma studio"
  echo "   2. Test connection: npm run dev (then visit /api/test-connection)"
else
  echo ""
  echo "❌ Failed to push schema"
  echo ""
  echo "💡 Common issues:"
  echo "   - Check your database password"
  echo "   - Ensure Supabase project is active"
  echo "   - Verify connection string format"
  exit 1
fi


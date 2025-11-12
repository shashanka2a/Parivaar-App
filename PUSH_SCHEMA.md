# Push Prisma Schema to Supabase

## Quick Method (Recommended)

### Option 1: Using the Helper Script

**Bash script:**
```bash
./push-schema.sh [YOUR_DATABASE_PASSWORD]
```

**Node.js script:**
```bash
node push-schema.js [YOUR_DATABASE_PASSWORD]
```

Or run without password (will prompt):
```bash
node push-schema.js
```

### Option 2: Direct Command

1. **Get your database password** from Supabase Dashboard:
   - Go to: https://supabase.com/dashboard
   - Project: `frxpbnoornbecjutllfv`
   - Settings > Database
   - Copy your database password

2. **Set DATABASE_URL and push:**
   ```bash
   export DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@db.frxpbnoornbecjutllfv.supabase.co:5432/postgres"
   npx prisma generate
   npx prisma db push
   ```

### Option 3: Create .env.local First

1. **Create `.env.local` file:**
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@db.frxpbnoornbecjutllfv.supabase.co:5432/postgres"
   ```

2. **Then run:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## What This Does

- ✅ Generates Prisma client
- ✅ Creates all tables in Supabase PostgreSQL database
- ✅ Sets up relationships and indexes
- ✅ Maps to your schema (users, family_trees, persons, shares)

## Expected Output

```
🚀 Pushing Prisma Schema to Supabase...

📦 Generating Prisma client...
✔ Generated Prisma Client

🗄️  Pushing schema to database...
✔ Your database is now in sync with your Prisma schema.

✅ Schema pushed successfully!
```

## Verify Schema

After pushing, verify tables were created:

```bash
# Open Prisma Studio to view tables
npx prisma studio
```

Or test via API:
```bash
npm run dev
# Visit: http://localhost:3000/api/test-connection
```

## Troubleshooting

### Error: "Can't reach database server"
- Check your database password
- Verify Supabase project is active
- Ensure connection string format is correct

### Error: "P1003: Database does not exist"
- The database should exist in Supabase
- Try using the direct connection (without pgbouncer)

### Error: "P1001: Can't reach database server"
- Check your network connection
- Verify Supabase project URL is correct
- Ensure database is not paused

## Next Steps

After successful push:

1. **Verify tables:**
   ```bash
   npx prisma studio
   ```

2. **Test connection:**
   ```bash
   npm run dev
   # Visit: http://localhost:3000/api/test-connection
   ```

3. **Create migrations (optional, for production):**
   ```bash
   npx prisma migrate dev --name init
   ```


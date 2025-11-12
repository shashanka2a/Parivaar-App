# Testing Supabase Connection

## Quick Test Methods

### Method 1: API Route Test (Recommended)

1. **Start the development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Open your browser** and visit:
   ```
   http://localhost:3000/api/test-connection
   ```

   This will show:
   - ✅ Supabase connection status
   - ✅ Prisma database connection status
   - ✅ Environment variables check
   - ✅ Error messages with helpful tips

3. **Test Authentication** (if you're logged in):
   ```
   http://localhost:3000/api/test-auth
   ```

### Method 2: Command Line Test

Run the test script:
```bash
node test-connection.js
```

**Note**: This requires `.env.local` file to be set up with your credentials.

### Method 3: Manual Prisma Test

Test Prisma connection directly:
```bash
# Generate Prisma client (if not done)
npx prisma generate

# Test database connection
npx prisma db pull
```

## Setting Up Environment Variables

Before testing, make sure you have a `.env.local` file with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://frxpbnoornbecjutllfv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeHBibm9vcm5iZWNqdXRsbGZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NDU4MDcsImV4cCI6MjA3ODUyMTgwN30.9D8gIrXT1PLeQ3Rtm6W3LulAMCaadz-XbRttbGQQGEo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeHBibm9vcm5iZWNqdXRsbGZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk0NTgwNywiZXhwIjoyMDc4NTIxODA3fQ.wyfgKupWKjivBqjVl53kS5tiy1eenwhaeq6fp9bm614

# Database Connection (get password from Supabase Dashboard)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.frxpbnoornbecjutllfv.supabase.co:5432/postgres"
```

### Getting Your Database Password

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project: `frxpbnoornbecjutllfv`
3. Go to **Settings** > **Database**
4. Find or reset your database password
5. Replace `[YOUR-PASSWORD]` in `DATABASE_URL`

## Expected Results

### ✅ Successful Connection

```json
{
  "timestamp": "2024-01-XX...",
  "supabase": {
    "connected": true,
    "error": null,
    "details": {
      "anonClient": { "connected": true },
      "adminClient": { "connected": true },
      "url": "https://frxpbnoornbecjutllfv.supabase.co"
    }
  },
  "prisma": {
    "connected": true,
    "error": null,
    "details": {
      "connected": true,
      "userCount": 0,
      "treeCount": 0
    }
  }
}
```

### ❌ Common Issues

1. **Missing DATABASE_URL**
   - Error: "DATABASE_URL environment variable not set"
   - Solution: Add DATABASE_URL to `.env.local`

2. **Invalid Database Password**
   - Error: "P1001: Can't reach database server"
   - Solution: Check password in Supabase Dashboard

3. **Schema Not Created**
   - Error: "P1003: Database does not exist"
   - Solution: Run `npx prisma migrate dev`

4. **Supabase Connection Failed**
   - Error: "Failed to connect to Supabase"
   - Solution: Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

## Next Steps After Successful Connection

1. **Run Database Migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```

2. **Verify Tables Created**:
   ```bash
   npx prisma studio
   ```

3. **Test Authentication Flow**:
   - Visit `/api/test-auth` to check if authentication works
   - Try signing in/up to test the full flow


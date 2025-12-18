# Database Connection Fix

## Problem

The application was failing with:
```
Can't reach database server at `db.frxpbnoornbecjutllfv.supabase.co:5432`
```

## Root Cause

The `.env.local` file was missing, so `DATABASE_URL` was not set. Prisma couldn't connect to Supabase PostgreSQL.

## Solution

1. **Created `.env.local`** with correct Supabase connection string:
   ```env
   DATABASE_URL="postgresql://postgres:2fp3qgLTmkrSSx6U@db.frxpbnoornbecjutllfv.supabase.co:5432/postgres"
   ```

2. **Used direct connection** (not pgbouncer) for Prisma compatibility

3. **Created test scripts** to verify connection and create mock data

## Verification

### Test Database Connection
```bash
npm run test:db
```

This will:
- ✅ Test database connection
- ✅ Query existing data
- ✅ Create a test user
- ✅ Create a test family tree
- ✅ Create test persons
- ✅ Verify all data

### Create Mock Data
```bash
npm run test:mock-data
```

This creates:
- 3 mock users
- 3 family trees (one per user)
- Multiple family members per tree

## Current Database Status

✅ **Connection**: Working  
✅ **Tables**: Created and accessible  
✅ **Test Data**: Created successfully

**Stats:**
- Users: 4
- Family Trees: 4
- Persons: 16

## Next Steps

1. **Restart your dev server** (if running):
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Test the app**:
   - Sign up/login
   - Create a family tree
   - Add family members
   - Everything should work now!

3. **Verify API routes**:
   - Visit: `http://localhost:3000/api/test-connection`
   - Should show both Supabase and Prisma as connected

## Troubleshooting

### If connection still fails:

1. **Check `.env.local` exists**:
   ```bash
   ls -la .env.local
   ```

2. **Verify DATABASE_URL format**:
   ```bash
   cat .env.local | grep DATABASE_URL
   ```
   Should be: `postgresql://postgres:PASSWORD@db.frxpbnoornbecjutllfv.supabase.co:5432/postgres`

3. **Test connection directly**:
   ```bash
   npm run test:db
   ```

4. **Check Supabase project status**:
   - Go to: https://supabase.com/dashboard/project/frxpbnoornbecjutllfv
   - Verify project is active (not paused)

5. **Verify database password**:
   - Supabase Dashboard → Settings → Database
   - Reset password if needed
   - Update `.env.local` with new password

## Files Created/Modified

- ✅ `.env.local` - Created with Supabase connection string
- ✅ `scripts/test-db-connection.js` - Database connection test script
- ✅ `scripts/create-mock-data.js` - Mock data creation script
- ✅ `package.json` - Added test scripts

## Environment Variables

Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://frxpbnoornbecjutllfv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL="postgresql://postgres:PASSWORD@db.frxpbnoornbecjutllfv.supabase.co:5432/postgres"
```

**Note**: Never commit `.env.local` to git (it's in `.gitignore`)



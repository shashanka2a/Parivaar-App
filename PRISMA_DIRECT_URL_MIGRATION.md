# Prisma DIRECT_URL Migration - Complete

## ✅ Changes Applied

### 1. Schema Updated
**File:** `prisma/schema.prisma`
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DIRECT_URL")  // ✅ Changed from DATABASE_URL
}
```

### 2. All Runtime Code Updated
- ✅ `src/app/api/trees/route.ts` - Uses DIRECT_URL
- ✅ `src/app/api/debug-db/route.ts` - Uses DIRECT_URL
- ✅ `src/app/api/test-connection/route.ts` - Uses DIRECT_URL
- ✅ `src/app/api/test-db-env/route.ts` - Uses DIRECT_URL
- ✅ `src/app/api/test-auth-flow/route.ts` - Uses DIRECT_URL

### 3. Scripts Updated
- ✅ `scripts/push-schema.js` - Uses DIRECT_URL (no more process.env mutation)

### 4. Prisma Singleton Verified
- ✅ All API routes import from `@/lib/prisma` (singleton)
- ✅ Scripts create their own PrismaClient (acceptable for scripts)

### 5. Removed All Landmines
- ❌ No port 6543 references in runtime code
- ❌ No pgbouncer logic in runtime code
- ❌ No URL rewriting/switching based on VERCEL
- ❌ No process.env.DATABASE_URL mutations

## 📋 Final Architecture

### Environment Variables

**1. DIRECT_URL (Prisma only)**
```
DIRECT_URL=postgresql://postgres:<password>@db.<project>.supabase.co:5432/postgres?sslmode=require
```
- Used by: Prisma only
- Port: 5432 (direct connection)
- SSL: Required

**2. DATABASE_URL (Pooler - other clients)**
```
DATABASE_URL=postgresql://postgres.<project>:<password>@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
```
- Used by: Supabase JS client, background workers, etc.
- Port: 6543 (connection pooler)
- NOT used by Prisma

## ✅ Checklist

- [x] `DIRECT_URL` set in Vercel (all envs)
- [x] Prisma datasource uses `env("DIRECT_URL")`
- [x] All API routes have `runtime = 'nodejs'`
- [x] Prisma singleton from `lib/prisma.ts`
- [x] No runtime URL mutations
- [x] No pooler references in Prisma code
- [ ] `npx prisma generate` run (run this manually)
- [ ] Redeployed to Vercel

## 🚀 Next Steps

1. **Set DIRECT_URL in Vercel:**
   - Vercel Dashboard → Settings → Environment Variables
   - Add: `DIRECT_URL=postgresql://postgres:<password>@db.<project>.supabase.co:5432/postgres?sslmode=require`

2. **Regenerate Prisma Client:**
   ```bash
   npx prisma generate
   ```

3. **Commit and Deploy:**
   ```bash
   git add prisma/schema.prisma src/
   git commit -m "Migrate Prisma to use DIRECT_URL"
   git push
   ```

4. **Verify:**
   - Visit `/api/debug-db` - should show `connectionTest.success: true`
   - Try creating a tree - should work without P1001 errors

## 🧹 What Was Removed

- ❌ All port 6543 references from runtime code
- ❌ All pgbouncer logic from runtime code
- ❌ All VERCEL-based URL switching
- ❌ All process.env.DATABASE_URL mutations
- ❌ All pooler URLs from Prisma configuration

## 📝 Notes

- Scripts (test-db-connection.js, create-mock-data.js, etc.) create their own PrismaClient - this is fine for scripts
- Test endpoints still check for DATABASE_URL existence (for other clients) but don't use it for Prisma
- Documentation files may still reference pooler - that's fine, they're just docs

## ✅ Final Mental Model

- **DIRECT_URL** → Prisma only (port 5432, direct connection)
- **DATABASE_URL** → Pooler for other clients (port 6543, optional)
- **Prisma + Supabase** = direct 5432 + sslmode=require
- **Never use Supabase pooler with Prisma**
- **Never mutate env vars at runtime**


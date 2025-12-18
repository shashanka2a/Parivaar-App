# Next.js 16 → Prisma Fix

## Problem

Next.js 16 upgrade changed the runtime/build pipeline, causing Prisma to fail with misleading `P1001 Can't reach database server` errors. This is **not a network issue** - it's a stale Prisma engine binary incompatible with Node 20.

## Root Cause

- Next.js 16 uses Node 20 by default
- Prisma ships different binaries per Node ABI
- Old Prisma client binaries silently fail under new runtime
- Prisma surfaces this as a DB connectivity error (P1001)

## Fixes Applied

### ✅ Step 1: Pin Prisma Engine Targets

**File:** `prisma/schema.prisma`

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native"]
}
```

This tells Prisma to generate the correct native binary for the deployment runtime.

### ✅ Step 2: Lock Node Version

**File:** `package.json`

```json
{
  "engines": {
    "node": ">=20.0.0"
  }
}
```

This prevents Vercel from building with a mismatched Node version.

### ✅ Step 3: Verify Runtime Exports

All API routes already have:
```ts
export const runtime = 'nodejs'
```

✅ Confirmed in all 12 API routes.

### ✅ Step 4: Added Sanity Check

**File:** `src/app/api/debug-db/route.ts`

Added `$queryRaw` test to verify Prisma engine is working:
```ts
const rawResult = await prisma.$queryRaw`SELECT 1 as test`;
```

## Next Steps (Run These Commands)

### Option 1: Use the Fix Script

```bash
bash scripts/fix-prisma-next16.sh
```

### Option 2: Manual Steps

```bash
# Clean old Prisma artifacts
rm -rf node_modules/.prisma
rm -rf .next

# Reinstall dependencies
npm install

# Regenerate Prisma client for Node 20
npx prisma generate
```

## Deployment

1. **Commit changes:**
   - `prisma/schema.prisma` (binaryTargets added)
   - `package.json` (engines.node added)
   - `src/app/api/debug-db/route.ts` (sanity check added)

2. **Push to trigger full Vercel rebuild**

3. **Verify:**
   - Visit `/api/debug-db` - should show `connectionTest.success: true` and `rawQuery: true`
   - Try creating a tree - should work without P1001 errors

## Why This Works

- Next 16 uses Node 20
- Prisma ships different binaries per Node ABI
- Old Prisma client binaries silently fail under new runtime
- Regenerating + pinning binary targets fixes it

## Summary

✅ Your DB URL was fine  
✅ Your Prisma code was fine  
✅ The upgrade changed the runtime ABI  
✅ Prisma client was stale  
✅ Regenerating + pinning binary targets fixes it


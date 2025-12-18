# Prisma Architecture - Final Mental Model 🔒

## ✅ LOCKED IN - Do Not Deviate

### Environment Variables

**1. DIRECT_URL → Prisma ONLY**
```
DIRECT_URL=postgresql://postgres:<password>@db.<project>.supabase.co:5432/postgres?sslmode=require
```
- **Used by:** Prisma exclusively
- **Port:** 5432 (direct connection)
- **SSL:** Required (`sslmode=require`)
- **Connection Type:** Direct PostgreSQL connection
- **Never use pooler URLs here**

**2. DATABASE_URL → Pooler for Other DB Clients**
```
DATABASE_URL=postgresql://postgres.<project>:<password>@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
```
- **Used by:** Drizzle, Kysely, raw SQL queries, background workers, other database clients
- **Port:** 6543 (connection pooler)
- **NOT used by Prisma** (Prisma uses DIRECT_URL)
- **NOT used by Supabase JS client** (uses NEXT_PUBLIC_SUPABASE_URL API endpoint)
- **Designed for serverless** - zero TCP issues, zero outages
- **This is what Supabase expects on Vercel**

**3. NEXT_PUBLIC_SUPABASE_URL → Supabase JS Client**
```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
```
- **Used by:** Supabase JS client (auth, storage, realtime, etc.)
- **This is the API endpoint, not a database connection**
- **Supabase JS client handles connection pooling internally**

## 🎯 Core Principles

### ✅ DO

1. **Prisma + Supabase = Direct 5432 + sslmode=require**
   - Always use direct connection for Prisma
   - Always require SSL
   - Port 5432 only

2. **DIRECT_URL for Prisma**
   - Set in `prisma/schema.prisma`: `url = env("DIRECT_URL")`
   - Set in Vercel environment variables
   - Set in `.env.local` for local development

3. **Prisma Singleton**
   - Import from `@/lib/prisma` only
   - Never instantiate `new PrismaClient()` in runtime code
   - Scripts can create their own instances (acceptable)

4. **Runtime = 'nodejs'**
   - All API routes must have: `export const runtime = 'nodejs'`

### ❌ NEVER

1. **Never use Supabase pooler with Prisma**
   - No port 6543 for Prisma
   - No pgbouncer for Prisma
   - No pooler URLs in Prisma config

2. **Never mutate env vars at runtime**
   - No `process.env.DIRECT_URL = ...`
   - No `process.env.DATABASE_URL = ...`
   - No URL rewriting/switching
   - No VERCEL-based URL switching

3. **Never point Prisma at DATABASE_URL**
   - Prisma datasource must use `env("DIRECT_URL")`
   - Never use `env("DATABASE_URL")` in schema.prisma

4. **Never expect Prisma to retry with pooler**
   - Prisma engine is initialized once
   - No runtime fallback logic
   - No automatic URL switching

## 📋 Current Implementation

### Schema (`prisma/schema.prisma`)
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DIRECT_URL")  // ✅ Correct
}
```

### Prisma Client (`src/lib/prisma.ts`)
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as any

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: ['error'] })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

### API Routes
- All import from `@/lib/prisma` (singleton)
- All have `export const runtime = 'nodejs'`
- All reference `DIRECT_URL` in error messages

## 🔍 Verification Checklist

- [x] `prisma/schema.prisma` uses `env("DIRECT_URL")`
- [x] No `process.env` mutations in runtime code
- [x] No port 6543 references in Prisma code
- [x] No pgbouncer logic in Prisma code
- [x] No URL switching based on VERCEL
- [x] All API routes use singleton from `@/lib/prisma`
- [x] All API routes have `runtime = 'nodejs'`
- [x] `DIRECT_URL` set in Vercel (all environments)
- [x] `npx prisma generate` run after schema changes

## 🚨 Why This Architecture?

### Prisma Limitations
- Prisma opens native TCP connections
- Query engine is initialized once
- Connections are pooled internally
- Switching URLs mid-process corrupts state
- pgBouncer breaks prepared statements

### Supabase Recommendations
- Direct connection (5432) for Prisma
- Pooler (6543) for other clients
- This is exactly what Supabase recommends

### Industry Standard
- DIRECT_URL → Prisma (default)
- DATABASE_URL → pooler (backup / other clients)
- Backup = manual or deployment-time, never automatic

## 📝 Deployment

### Vercel Environment Variables

**Required:**
```
DIRECT_URL=postgresql://postgres:<password>@db.<project>.supabase.co:5432/postgres?sslmode=require
```

**Required (for pooler - Drizzle, Kysely, raw SQL, etc.):**
```
DATABASE_URL=postgresql://postgres.<project>:<password>@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
```

**Required (for Supabase JS client):**
```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Local Development (`.env.local`)

```env
# Prisma - Direct connection
DIRECT_URL=postgresql://postgres:<password>@db.<project>.supabase.co:5432/postgres?sslmode=require

# Pooler - For Drizzle, Kysely, raw SQL, etc.
DATABASE_URL=postgresql://postgres.<project>:<password>@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require

# Supabase JS Client - API endpoint
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## ✅ Final Mental Model (LOCKED)

```
DIRECT_URL → Prisma only (port 5432, direct connection)
DATABASE_URL → Pooler for Drizzle, Kysely, raw SQL (port 6543, serverless-optimized)
NEXT_PUBLIC_SUPABASE_URL → Supabase JS client (API endpoint, not DB connection)

Prisma + Supabase = direct 5432 + sslmode=require
Never use Supabase pooler with Prisma
Never mutate env vars at runtime

Pooler benefits:
- Zero TCP issues
- Zero outages  
- Designed for serverless
- This is what Supabase expects on Vercel
```

**This is the correct architecture. Do not deviate.**

## 📊 Connection Usage Matrix

| Client | Environment Variable | Port | Connection Type | Use Case |
|--------|---------------------|------|----------------|----------|
| **Prisma** | `DIRECT_URL` | 5432 | Direct PostgreSQL | ORM queries, migrations |
| **Drizzle** | `DATABASE_URL` | 6543 | Connection Pooler | Type-safe SQL builder |
| **Kysely** | `DATABASE_URL` | 6543 | Connection Pooler | Type-safe query builder |
| **Raw SQL** | `DATABASE_URL` | 6543 | Connection Pooler | Direct SQL queries |
| **Supabase JS** | `NEXT_PUBLIC_SUPABASE_URL` | N/A | API Endpoint | Auth, Storage, Realtime |


# Using Supabase Connection Pooler Properly

## ✅ Correct Usage

The connection pooler (`aws-1-us-east-1.pooler.supabase.com:6543`) is designed for serverless environments and should be used for:

### 1. Drizzle ORM
```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Pooler URL
});

const db = drizzle(pool);
```

### 2. Kysely Query Builder
```typescript
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL, // Pooler URL
  }),
});

const db = new Kysely({ dialect });
```

### 3. Raw SQL Queries
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Pooler URL
});

const result = await pool.query('SELECT * FROM users');
```

### 4. Background Workers
- Serverless functions that need database access
- Cron jobs
- Queue workers

## ❌ Do NOT Use Pooler For

- **Prisma** - Must use `DIRECT_URL` (port 5432, direct connection)
- **Supabase JS Client** - Uses `NEXT_PUBLIC_SUPABASE_URL` (API endpoint, not DB connection)

## 🎯 Benefits of Pooler

- ✅ **Zero TCP issues** - Handles connection management
- ✅ **Zero outages** - Automatic failover
- ✅ **Designed for serverless** - Optimized for Vercel, AWS Lambda, etc.
- ✅ **Connection reuse** - Efficient connection pooling
- ✅ **This is what Supabase expects on Vercel**

## 📋 Environment Variables

```env
# Prisma - Direct connection (required)
DIRECT_URL=postgresql://postgres:<password>@db.<project>.supabase.co:5432/postgres?sslmode=require

# Pooler - For Drizzle, Kysely, raw SQL (required if using these)
DATABASE_URL=postgresql://postgres.<project>:<password>@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require

# Supabase JS Client - API endpoint (required)
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 🔍 Current Implementation

- ✅ Prisma uses `DIRECT_URL` (direct connection on 5432)
- ✅ Supabase JS client uses `NEXT_PUBLIC_SUPABASE_URL` (API endpoint)
- ✅ `DATABASE_URL` (pooler) is available for Drizzle, Kysely, raw SQL
- ✅ All configured correctly for Vercel serverless

## 📝 Notes

- The pooler URL format: `postgresql://postgres.<project>:<password>@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require`
- Always include `pgbouncer=true` and `sslmode=require`
- Pooler is optimized for serverless - use it for all non-Prisma database clients


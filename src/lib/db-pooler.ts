import { Pool } from 'pg';

/**
 * Database Pooler Client
 * 
 * Uses Supabase connection pooler (port 6543) for serverless-optimized database access.
 * 
 * Benefits:
 * - Zero TCP issues
 * - Zero outages
 * - Designed for serverless (Vercel, AWS Lambda, etc.)
 * - This is what Supabase expects on Vercel
 * 
 * Use cases:
 * - Raw SQL queries
 * - Drizzle ORM
 * - Kysely query builder
 * - Background workers
 * 
 * DO NOT use for Prisma (Prisma uses DIRECT_URL on port 5432)
 */

const globalForPool = globalThis as unknown as {
  pool: Pool | undefined;
};

// Create singleton pool instance
function createPool(): Pool {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not set. ' +
      'Set DATABASE_URL to the Supabase pooler connection string: ' +
      'postgresql://postgres.<project>:<password>@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require'
    );
  }

  // Validate it's a pooler URL (port 6543)
  if (!databaseUrl.includes(':6543/') && !databaseUrl.includes('pooler.supabase.com')) {
    console.warn(
      '⚠️  WARNING: DATABASE_URL does not appear to be a pooler URL. ' +
      'Expected format: postgresql://postgres.<project>:<password>@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require'
    );
  }

  return new Pool({
    connectionString: databaseUrl,
    // Pool configuration optimized for serverless
    max: 1, // Maximum connections per serverless function
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 10000, // 10s connection timeout
    ssl: {
      rejectUnauthorized: false, // Supabase uses self-signed certs
    },
  });
}

// Export singleton pool instance
export const pool = globalForPool.pool ?? createPool();

if (process.env.NODE_ENV !== 'production') {
  globalForPool.pool = pool;
}

/**
 * Execute a raw SQL query using the pooler
 * 
 * @example
 * ```ts
 * const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
 * ```
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

/**
 * Get a client from the pool for transaction support
 * 
 * @example
 * ```ts
 * const client = await getClient();
 * try {
 *   await client.query('BEGIN');
 *   await client.query('INSERT INTO users ...');
 *   await client.query('COMMIT');
 * } catch (error) {
 *   await client.query('ROLLBACK');
 *   throw error;
 * } finally {
 *   client.release();
 * }
 * ```
 */
export async function getClient() {
  return await pool.connect();
}

/**
 * Close the pool (call this in cleanup/shutdown)
 */
export async function closePool() {
  await pool.end();
}


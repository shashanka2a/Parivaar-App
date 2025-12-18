import { NextResponse } from 'next/server';
import { pool, query } from '@/lib/db-pooler';

export const runtime = 'nodejs';

/**
 * Test endpoint for Supabase connection pooler
 * 
 * Tests the pooler connection (port 6543) which is optimized for serverless.
 * This is separate from Prisma which uses DIRECT_URL (port 5432).
 */
export async function GET() {
  const hasDatabaseUrl = !!process.env.DATABASE_URL;
  const databaseUrlPreview = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.substring(0, 60) + '...'
    : 'NOT SET';

  // Test pooler connection
  let connectionTest = {
    success: false,
    error: null as any,
    rawQuery: false,
    poolStats: null as any,
  };

  try {
    // Test 1: Basic connection
    const client = await pool.connect();
    try {
      // Test 2: Raw query
      const result = await query('SELECT 1 as test, NOW() as timestamp');
      connectionTest.rawQuery = Array.isArray(result) && result.length > 0;

      // Test 3: Query actual data
      const userCount = await query('SELECT COUNT(*) as count FROM users');
      const treeCount = await query('SELECT COUNT(*) as count FROM family_trees');

      // Get pool statistics
      connectionTest.poolStats = {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount,
      };

      connectionTest.success = true;
    } finally {
      client.release();
    }
  } catch (error: any) {
    connectionTest = {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        name: error.name,
      },
      rawQuery: false,
      poolStats: null,
    };
  }

  return NextResponse.json({
    environment: {
      isVercel: !!process.env.VERCEL,
      nodeEnv: process.env.NODE_ENV,
    },
    pooler: {
      hasDatabaseUrl,
      databaseUrlPreview,
      connectionTest,
      note: 'This tests the pooler (port 6543). Prisma uses DIRECT_URL (port 5432).',
    },
  });
}


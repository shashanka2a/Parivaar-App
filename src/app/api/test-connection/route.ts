import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { pool, query } from '@/lib/db-pooler';

// Force Node.js runtime (not Edge) for Prisma support
export const runtime = 'nodejs';

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    supabase: {
      connected: false,
      error: null as string | null,
      details: {} as any,
    },
    prisma: {
      connected: false,
      error: null as string | null,
      details: {} as any,
    },
    pooler: {
      connected: false,
      error: null as string | null,
      details: {} as any,
    },
    environment: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasDirectUrl: !!process.env.DIRECT_URL,
      hasDatabaseUrl: !!process.env.DATABASE_URL, // Pooler URL (for other clients)
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set',
    },
  };

  // Test Supabase Connection
  try {
    // Test anon client - try to get session (doesn't require database)
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    // Test admin client (if available)
    let adminError = null;
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin.auth.getSession();
      adminError = error;
    } else {
      adminError = new Error('Service role key not configured');
    }

    results.supabase.connected = !sessionError && !adminError;
    results.supabase.details = {
      anonClient: sessionError ? { error: sessionError.message } : { connected: true, hasSession: !!sessionData.session },
      adminClient: adminError ? { error: adminError.message || String(adminError) } : { connected: true },
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    };
    
    if (sessionError || adminError) {
      results.supabase.error = sessionError?.message || adminError?.message || 'Unknown error';
    }
  } catch (error: any) {
    results.supabase.error = error.message || 'Failed to connect to Supabase';
    results.supabase.details = { error: error.toString() };
  }

  // Test Prisma Connection
  try {
    if (!process.env.DIRECT_URL) {
      results.prisma.error = 'DIRECT_URL environment variable not set';
      results.prisma.details = { 
        error: 'Please set DIRECT_URL in .env.local file',
        tip: 'Get direct connection string from Supabase Dashboard > Settings > Database (use direct connection, port 5432)'
      };
    } else {
      // Test database connection
      await prisma.$connect();
      
      // Try a simple query
      const userCount = await prisma.user.count();
      const treeCount = await prisma.familyTree.count();
      
      results.prisma.connected = true;
      results.prisma.details = {
        connected: true,
        userCount,
        treeCount,
        directUrl: process.env.DIRECT_URL?.replace(/:[^:@]+@/, ':****@') || 'Not set', // Hide password
      };
      
      await prisma.$disconnect();
    }
  } catch (error: any) {
    results.prisma.error = error.message || 'Failed to connect to database';
    results.prisma.details = { 
      error: error.toString(),
      code: error.code,
      tip: error.code === 'P1001' ? 'Check DIRECT_URL and ensure database is accessible' : 
            error.code === 'P1003' ? 'Run: npx prisma migrate dev' : 
            'Check your database connection settings'
    };
    
    try {
      await prisma.$disconnect();
    } catch {
      // Ignore disconnect errors
    }
  }

  // Test Pooler Connection (DATABASE_URL - port 6543)
  try {
    if (!process.env.DATABASE_URL) {
      results.pooler.error = 'DATABASE_URL environment variable not set';
      results.pooler.details = { 
        error: 'DATABASE_URL is optional but recommended for raw SQL, Drizzle, Kysely',
        tip: 'Set DATABASE_URL to pooler connection string: postgresql://postgres.<project>:<password>@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require'
      };
    } else {
      // Test pooler connection
      const client = await pool.connect();
      try {
        // Test raw query
        const testResult = await query('SELECT 1 as test, NOW() as timestamp');
        const userCount = await query('SELECT COUNT(*) as count FROM users');
        const treeCount = await query('SELECT COUNT(*) as count FROM family_trees');

        results.pooler.connected = true;
        results.pooler.details = {
          connected: true,
          rawQuery: Array.isArray(testResult) && testResult.length > 0,
          userCount: userCount[0]?.count || 0,
          treeCount: treeCount[0]?.count || 0,
          poolStats: {
            totalCount: pool.totalCount,
            idleCount: pool.idleCount,
            waitingCount: pool.waitingCount,
          },
          databaseUrl: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@') || 'Not set',
        };
      } finally {
        client.release();
      }
    }
  } catch (error: any) {
    results.pooler.error = error.message || 'Failed to connect to pooler';
    results.pooler.details = { 
      error: error.toString(),
      code: error.code,
      tip: 'Check DATABASE_URL format. Should be pooler URL (port 6543) with pgbouncer=true'
    };
  }

  // Determine overall status
  const allConnected = results.supabase.connected && results.prisma.connected;
  const statusCode = allConnected ? 200 : 500;

  return NextResponse.json(results, { status: statusCode });
}


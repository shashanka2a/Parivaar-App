import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

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
    environment: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
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
    if (!process.env.DATABASE_URL) {
      results.prisma.error = 'DATABASE_URL environment variable not set';
      results.prisma.details = { 
        error: 'Please set DATABASE_URL in .env.local file',
        tip: 'Get connection string from Supabase Dashboard > Settings > Database'
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
        databaseUrl: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@') || 'Not set', // Hide password
      };
      
      await prisma.$disconnect();
    }
  } catch (error: any) {
    results.prisma.error = error.message || 'Failed to connect to database';
    results.prisma.details = { 
      error: error.toString(),
      code: error.code,
      tip: error.code === 'P1001' ? 'Check DATABASE_URL and ensure database is accessible' : 
            error.code === 'P1003' ? 'Run: npx prisma migrate dev' : 
            'Check your database connection settings'
    };
    
    try {
      await prisma.$disconnect();
    } catch {
      // Ignore disconnect errors
    }
  }

  // Determine overall status
  const allConnected = results.supabase.connected && results.prisma.connected;
  const statusCode = allConnected ? 200 : 500;

  return NextResponse.json(results, { status: statusCode });
}


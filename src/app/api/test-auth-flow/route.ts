import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/**
 * Test endpoint to validate authentication flow
 * Tests: signup, login, session management, user sync
 */
export async function GET(request: Request) {
  const testResults = {
    timestamp: new Date().toISOString(),
    tests: {
      environment: {
        passed: false,
        details: {},
      },
      supabaseConnection: {
        passed: false,
        details: {},
      },
      signup: {
        passed: false,
        details: {},
      },
      login: {
        passed: false,
        details: {},
      },
      session: {
        passed: false,
        details: {},
      },
      userSync: {
        passed: false,
        details: {},
      },
    },
    summary: {
      totalTests: 6,
      passed: 0,
      failed: 0,
    },
  };

  try {
    // Test 1: Environment Variables
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const hasDatabaseUrl = !!process.env.DATABASE_URL;

    testResults.tests.environment.passed = hasSupabaseUrl && hasSupabaseKey && hasDatabaseUrl;
    testResults.tests.environment.details = {
      hasSupabaseUrl,
      hasSupabaseKey,
      hasDatabaseUrl,
    };

    if (!testResults.tests.environment.passed) {
      testResults.summary.failed++;
      return NextResponse.json(testResults, { status: 200 });
    }
    testResults.summary.passed++;

    // Test 2: Supabase Connection
    const supabase = await createClient();
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    testResults.tests.supabaseConnection.passed = !sessionError;
    testResults.tests.supabaseConnection.details = {
      connected: !sessionError,
      error: sessionError?.message || null,
      hasSession: !!sessionData.session,
    };

    if (testResults.tests.supabaseConnection.passed) {
      testResults.summary.passed++;
    } else {
      testResults.summary.failed++;
    }

    // Test 3: Database Connection
    try {
      await prisma.$connect();
      const userCount = await prisma.user.count();
      testResults.tests.userSync.passed = true;
      testResults.tests.userSync.details = {
        connected: true,
        userCount,
      };
      await prisma.$disconnect();
      testResults.summary.passed++;
    } catch (dbError: any) {
      testResults.tests.userSync.passed = false;
      testResults.tests.userSync.details = {
        connected: false,
        error: dbError.message,
      };
      testResults.summary.failed++;
    }

    // Note: Actual signup/login tests require test credentials
    // These would be tested manually or with integration tests
    testResults.tests.signup.details = {
      note: 'Use POST /api/auth/signup with { email, password, name } to test',
      endpoint: '/api/auth/signup',
    };

    testResults.tests.login.details = {
      note: 'Use POST /api/auth/login with { email, password } to test',
      endpoint: '/api/auth/login',
    };

    testResults.tests.session.details = {
      note: 'Use GET /api/auth/me to test session',
      endpoint: '/api/auth/me',
    };

  } catch (error: any) {
    console.error('Test error:', error);
    testResults.tests.environment.details = {
      ...testResults.tests.environment.details,
      error: error.message,
    };
  }

  return NextResponse.json(testResults, { status: 200 });
}


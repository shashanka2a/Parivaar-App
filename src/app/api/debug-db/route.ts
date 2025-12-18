import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  const isVercel = !!process.env.VERCEL;
  const hasDirectUrl = !!process.env.DIRECT_URL;
  const directUrlPreview = process.env.DIRECT_URL 
    ? process.env.DIRECT_URL.substring(0, 50) + '...' 
    : 'NOT SET';

  // Try to connect to database
  let connectionTest = { success: false, error: null as any, rawQuery: false };
  try {
    await prisma.$connect();
    
    // Sanity check: Raw query test (decisive test for Prisma engine)
    try {
      const rawResult = await prisma.$queryRaw`SELECT 1 as test`;
      connectionTest.rawQuery = Array.isArray(rawResult) && rawResult.length > 0;
    } catch (rawError: any) {
      connectionTest.rawQuery = false;
    }
    
    const userCount = await prisma.user.count();
    connectionTest = { success: true, error: null, rawQuery: connectionTest.rawQuery };
    await prisma.$disconnect();
  } catch (error: any) {
    connectionTest = { 
      success: false, 
      error: {
        message: error.message,
        code: error.code,
        name: error.name,
      },
      rawQuery: false,
    };
    try {
      await prisma.$disconnect();
    } catch {
      // Ignore disconnect errors
    }
  }

  return NextResponse.json({
    environment: {
      isVercel,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    },
    database: {
      hasDirectUrl,
      directUrlPreview,
      connectionTest,
    },
    allEnvVars: {
      DIRECT_URL: hasDirectUrl,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  });
}



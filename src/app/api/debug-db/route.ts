import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  const isVercel = !!process.env.VERCEL;
  const hasDatabaseUrl = !!process.env.DATABASE_URL;
  const dbUrlPreview = process.env.DATABASE_URL 
    ? process.env.DATABASE_URL.substring(0, 50) + '...' 
    : 'NOT SET';

  // Try to connect to database
  let connectionTest = { success: false, error: null as any };
  try {
    await prisma.$connect();
    const userCount = await prisma.user.count();
    connectionTest = { success: true, error: null };
    await prisma.$disconnect();
  } catch (error: any) {
    connectionTest = { 
      success: false, 
      error: {
        message: error.message,
        code: error.code,
        name: error.name,
      }
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
      hasDatabaseUrl,
      dbUrlPreview,
      connectionTest,
    },
    allEnvVars: {
      DATABASE_URL: hasDatabaseUrl,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  });
}


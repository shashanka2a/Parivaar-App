import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  // Check if DATABASE_URL is available
  const hasDatabaseUrl = !!process.env.DATABASE_URL;
  const databaseUrlPreview = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.substring(0, 50) + '...'
    : 'NOT SET';

  return NextResponse.json({
    hasDatabaseUrl,
    databaseUrlPreview,
    allEnvVars: {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      DATABASE_URL: hasDatabaseUrl,
    },
    nodeEnv: process.env.NODE_ENV,
  });
}


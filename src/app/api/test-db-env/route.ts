import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  // Check if DIRECT_URL is available (Prisma uses DIRECT_URL)
  const hasDirectUrl = !!process.env.DIRECT_URL;
  const directUrlPreview = process.env.DIRECT_URL
    ? process.env.DIRECT_URL.substring(0, 50) + '...'
    : 'NOT SET';

  return NextResponse.json({
    hasDirectUrl,
    directUrlPreview,
    allEnvVars: {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      DIRECT_URL: hasDirectUrl,
      DATABASE_URL: !!process.env.DATABASE_URL, // Pooler URL (for other clients)
    },
    nodeEnv: process.env.NODE_ENV,
  });
}



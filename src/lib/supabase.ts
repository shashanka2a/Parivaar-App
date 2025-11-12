import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://frxpbnoornbecjutllfv.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeHBibm9vcm5iZWNqdXRsbGZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NDU4MDcsImV4cCI6MjA3ODUyMTgwN30.9D8gIrXT1PLeQ3Rtm6W3LulAMCaadz-XbRttbGQQGEo';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeHBibm9vcm5iZWNqdXRsbGZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk0NTgwNywiZXhwIjoyMDc4NTIxODA3fQ.wyfgKupWKjivBqjVl53kS5tiy1eenwhaeq6fp9bm614';

// Client-side Supabase client (for browser usage)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Server-side Supabase client with service role (for admin operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Helper function to get Supabase client based on context
export function getSupabaseClient(useAdmin = false) {
  return useAdmin ? supabaseAdmin : supabase;
}

// Helper function to verify JWT token
export async function verifyToken(token: string) {
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) {
      return null;
    }
    return data.user;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Helper function to get user from session
export async function getUserFromSession(sessionToken: string) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(sessionToken);
    if (error || !user) {
      return null;
    }
    return user;
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
}


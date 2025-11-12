import { createClient } from '@supabase/supabase-js';

// Supabase configuration - loaded from environment variables
// Never expose these values in client-side code or commit them to git
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client-side Supabase client (for browser usage)
// Use empty strings as fallback to avoid build-time errors
// Actual validation happens at runtime
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Server-side Supabase client with service role (for admin operations)
// Only create if service role key is available
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

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


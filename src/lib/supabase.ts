import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration - loaded from environment variables
// Never expose these values in client-side code or commit them to git
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client-side Supabase client (for browser usage) - uses cookies to sync with server
// This ensures that server-side API routes can read the session
export function createClient() {
  // Validate environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase environment variables not set. Using placeholder values.');
  }
  
  try {
    return createBrowserClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder-key'
    );
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error);
    // Return a client with placeholder values to prevent crashes
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder-key'
    );
  }
}

// Export a singleton instance for convenience
export const supabase = createClient();

// Server-side Supabase client with service role (for admin operations)
// Only create if service role key is available
// Note: This uses @supabase/supabase-js directly since it's server-side only

export const supabaseAdmin = supabaseServiceRoleKey && supabaseUrl
  ? createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
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

// -------- Storage helpers --------

/**
 * Upload a profile image to Supabase Storage and return a public URL.
 * Assumes you have created a public bucket named "avatars" in Supabase.
 */
export async function uploadProfileImage(
  file: File,
  options: { personId: string; treeId?: string },
  client: SupabaseClient = supabase,
): Promise<string> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  const bucket = 'avatars';
  const ext = file.name.split('.').pop() || 'jpg';
  const safeTreeId = options.treeId?.replace(/[^a-zA-Z0-9_-]/g, '') || 'default';
  const path = `${safeTreeId}/${options.personId}-${Date.now()}.${ext}`;

  const { error: uploadError } = await client.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = client.storage.from(bucket).getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error('Failed to get public URL for uploaded image.');
  }

  return data.publicUrl;
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


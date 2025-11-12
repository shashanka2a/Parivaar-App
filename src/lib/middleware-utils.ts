import { NextRequest } from 'next/server';
import { prisma } from './prisma';
import { createMiddlewareClient } from './supabase-server';

/**
 * Check if a user is authenticated based on request using Supabase
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  try {
    const { supabase } = createMiddlewareClient(request);
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Authentication check failed:', error);
    return false;
  }
}

/**
 * Get user from request (if authenticated) using Supabase
 */
export async function getUserFromRequest(request: NextRequest) {
  try {
    const { supabase } = createMiddlewareClient(request);
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }
    
    // Fetch user from Prisma database (sync with Supabase auth)
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
    
    // If user exists in Supabase auth but not in our DB, create them
    if (!dbUser && user.email) {
      const newUser = await prisma.user.create({
        data: {
          email: user.email,
          name: user.user_metadata?.name || user.email.split('@')[0],
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });
      return newUser;
    }
    
    return dbUser;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}

/**
 * Check if user has access to a family tree
 */
export async function hasTreeAccess(
  userId: string,
  treeIdOrSlug: string
): Promise<boolean> {
  try {
    const tree = await prisma.familyTree.findFirst({
      where: {
        OR: [
          { id: treeIdOrSlug },
          { slug: treeIdOrSlug },
        ],
        userId: userId,
      },
    });
    
    return tree !== null;
  } catch (error) {
    console.error('Tree access check failed:', error);
    return false;
  }
}

/**
 * Check if a shared tree link is valid
 */
export async function isValidShareLink(shareId: string): Promise<boolean> {
  try {
    const share = await prisma.share.findUnique({
      where: { shareId },
    });
    
    if (!share || !share.isActive) {
      return false;
    }
    
    // Check if share has expired
    if (share.expiresAt && share.expiresAt < new Date()) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Share link validation failed:', error);
    return false;
  }
}

/**
 * Route configuration helpers
 */
export const routeConfig = {
  public: ['/', '/onboarding', '/api/auth', '/api/public'],
  protected: ['/dashboard', '/trees', '/explore', '/settings'],
  api: ['/api'],
  shared: ['/shared'],
} as const;

export function isPublicRoute(pathname: string): boolean {
  return routeConfig.public.some(route => 
    pathname === route || pathname.startsWith(route)
  );
}

export function isProtectedRoute(pathname: string): boolean {
  return routeConfig.protected.some(route => 
    pathname.startsWith(route)
  );
}

export function isApiRoute(pathname: string): boolean {
  return routeConfig.api.some(route => 
    pathname.startsWith(route)
  );
}

export function isSharedRoute(pathname: string): boolean {
  return routeConfig.shared.some(route => 
    pathname.startsWith(route)
  );
}


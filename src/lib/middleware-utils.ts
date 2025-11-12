import { NextRequest } from 'next/server';
import { prisma } from './prisma';

/**
 * Check if a user is authenticated based on request
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('auth-token')?.value;
  const sessionId = request.cookies.get('session-id')?.value;
  
  if (!token && !sessionId) {
    return false;
  }
  
  // In a real implementation, you would verify the token/session with the database
  // For now, we'll do a basic check
  try {
    if (sessionId) {
      // You could check session in database here
      // const session = await prisma.session.findUnique({ where: { id: sessionId } });
      // return session !== null && session.expiresAt > new Date();
    }
    
    return true;
  } catch (error) {
    console.error('Authentication check failed:', error);
    return false;
  }
}

/**
 * Get user from request (if authenticated)
 */
export async function getUserFromRequest(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const sessionId = request.cookies.get('session-id')?.value;
  const userId = request.cookies.get('user-id')?.value;
  
  if (!userId) {
    return null;
  }
  
  try {
    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
    
    return user;
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


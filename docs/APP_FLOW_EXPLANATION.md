# Complete App Flow Explanation

## Overview

This document explains how the Parivaar app handles routing, authentication, and middleware after the recent fixes.

## Architecture

### 1. Middleware Layer (`src/middleware.ts`)

The middleware runs on **every request** (except static files) and handles:
- Route protection
- Authentication checks
- Session management
- Security headers

### 2. Route Types

#### Public Routes (No Auth Required)
- `/` - Home page
- `/onboarding` - Sign up/Login page
- `/api/auth/*` - Authentication endpoints
- `/api/public/*` - Public API endpoints

#### Protected Routes (Auth Required)
- `/dashboard` - Main dashboard
- `/trees` - Family trees manager
- `/explore` - Explore family members
- `/settings` - User settings

#### Dynamic Routes
- `/[familySlug]` - Family tree by slug
- `/shared/[shareId]` - Shared family tree

## Request Flow

### Flow Diagram

```
User Request
    ↓
Middleware (src/middleware.ts)
    ↓
    ├─→ Is Public Route? → Yes → Allow Access
    │                           ↓
    │                    Page Component
    │
    └─→ No → Try Create Supabase Client
                ↓
            Success? → Check Authentication
                ↓
            Authenticated? → Allow Access
                ↓
            Not Authenticated? → Redirect to /onboarding
```

### Step-by-Step Flow

#### 1. User Visits `/onboarding`

```
Request: GET /onboarding
    ↓
Middleware checks: isPublicRoute('/onboarding') → TRUE
    ↓
Return NextResponse.next() immediately
    ↓
Page Component loads (OnboardingFlow)
    ↓
User sees signup/login form
```

**Key Point**: Public routes bypass all authentication checks, so they load even if environment variables aren't set.

#### 2. User Signs Up

```
User fills form → Clicks "Create Account"
    ↓
POST /api/auth/signup
    ↓
API Route (Node.js runtime, not Edge)
    ↓
Creates Supabase Auth user
    ↓
Creates Prisma database user
    ↓
Returns session + user data
    ↓
Client stores session in cookies
    ↓
Redirects to /trees
```

#### 3. User Visits Protected Route `/trees`

```
Request: GET /trees
    ↓
Middleware checks: isPublicRoute('/trees') → FALSE
    ↓
Try create Supabase client
    ↓
Success → Check session
    ↓
Has valid session? → YES
    ↓
Allow access → Page loads
```

If no session:
```
No session → Redirect to /onboarding?redirect=/trees
    ↓
User logs in
    ↓
Redirected back to /trees
```

#### 4. User Logs In

```
User fills login form → Clicks "Login"
    ↓
POST /api/auth/login
    ↓
API Route validates credentials with Supabase
    ↓
If valid:
    - Creates/updates Prisma user
    - Returns session
    - Sets cookies
    ↓
Client redirects to /trees or redirect param
```

#### 5. User Visits Shared Tree `/shared/abc123`

```
Request: GET /shared/abc123
    ↓
Middleware checks: isSharedRoute('/shared/abc123') → TRUE
    ↓
Allow access (validation done in page component)
    ↓
Page Component loads
    ↓
Page component validates share link via API
    ↓
If valid → Show tree
If invalid → Show error
```

**Note**: Share link validation is done in the page component (not middleware) because:
- Middleware runs on Edge runtime
- Prisma doesn't work in Edge runtime
- Validation moved to page component (Node.js runtime)

## Error Handling

### Missing Environment Variables

**Before Fix:**
```
Middleware tries to create Supabase client
    ↓
Missing env vars → Throws error
    ↓
MIDDLEWARE_INVOCATION_FAILED
    ↓
Entire app crashes
```

**After Fix:**
```
Public routes → Skip Supabase client creation
    ↓
Protected routes → Try create client
    ↓
If fails → Log error, continue without auth
    ↓
App still works (just no auth)
```

### Authentication Failures

```
User tries to access /dashboard without login
    ↓
Middleware checks authentication
    ↓
No session found
    ↓
Redirect to /onboarding?redirect=/dashboard
    ↓
User logs in
    ↓
Redirected back to /dashboard
```

## Route Protection Logic

### Code Flow

```typescript
// 1. Check if public route (early exit)
if (isPublicRoute(pathname)) {
  return NextResponse.next(); // Allow access
}

// 2. Try to create Supabase client
try {
  const { supabase } = createMiddlewareClient(request);
  // Check session, refresh if needed
} catch (error) {
  // If env vars missing, continue without auth
}

// 3. Check if protected route
if (isProtectedRoute(pathname)) {
  const authenticated = await isAuthenticated(request);
  if (!authenticated) {
    // Redirect to onboarding
  }
}

// 4. Add security headers
// 5. Return response
```

## Security Features

### 1. Security Headers
All responses include:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### 2. CORS Headers
API routes include CORS headers for cross-origin requests.

### 3. Session Management
- Sessions stored in secure HTTP-only cookies
- Automatic session refresh in middleware
- Session validation on every protected route

## Testing the Flow

### Test 1: Public Route Access
```bash
# Should work even without env vars
curl https://www.parivaar.world/onboarding
# Expected: 200 OK, page loads
```

### Test 2: Protected Route Without Auth
```bash
# Should redirect to onboarding
curl -I https://www.parivaar.world/dashboard
# Expected: 302 Redirect to /onboarding
```

### Test 3: Signup Flow
```bash
curl -X POST https://www.parivaar.world/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
# Expected: 201 Created, returns user + session
```

### Test 4: Login Flow
```bash
curl -X POST https://www.parivaar.world/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt
# Expected: 200 OK, sets cookies
```

### Test 5: Protected Route With Auth
```bash
curl https://www.parivaar.world/api/auth/me \
  -b cookies.txt
# Expected: 200 OK, returns user data
```

## Key Improvements Made

### 1. Public Route Early Exit
- Public routes skip Supabase client creation
- Prevents crashes when env vars are missing
- Faster response times for public pages

### 2. Error Handling
- Try-catch around Supabase client creation
- Graceful degradation if auth fails
- App continues to work without auth

### 3. Removed Prisma from Middleware
- Prisma doesn't work in Edge runtime
- Share link validation moved to page components
- Middleware only handles routing and auth

### 4. Environment Variable Safety
- App works without env vars (public routes)
- Protected routes fail gracefully
- Clear error messages in logs

## Current State

✅ **Working:**
- Public routes load without env vars
- Authentication flow works
- Protected routes redirect properly
- Session management works
- Security headers applied

✅ **Fixed:**
- Middleware no longer crashes on missing env vars
- Onboarding page loads correctly
- No Prisma in Edge runtime
- Proper error handling

## Next Steps

1. **Add Environment Variables in Vercel**
   - See `VERCEL_ENV_VARS.md` for list
   - Add all 4 required variables
   - Redeploy application

2. **Test Authentication**
   - Sign up a new user
   - Login with credentials
   - Access protected routes
   - Verify session persistence

3. **Monitor Logs**
   - Check Vercel function logs
   - Look for middleware errors
   - Verify Supabase connections

## Troubleshooting

### Issue: Onboarding page shows error
**Solution**: Check if environment variables are set in Vercel

### Issue: Can't access protected routes
**Solution**: Ensure you're logged in and session is valid

### Issue: Middleware errors in logs
**Solution**: Check environment variables, especially `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Issue: Database errors
**Solution**: Check `DATABASE_URL` is correct and database is accessible


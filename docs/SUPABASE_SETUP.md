# Supabase Integration Setup

This document explains how Supabase is integrated with Prisma and Next.js middleware.

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Supabase Service Role Key (Server-side only)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Prisma Database URL (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
```

### Getting Your Database Password

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `YOUR_PROJECT_REF`
3. Go to **Settings** > **Database**
4. Find your database password (or reset it if needed)
5. Replace `[YOUR-PASSWORD]` in the `DATABASE_URL` with your actual password

### Getting the Connection String

1. In Supabase Dashboard, go to **Settings** > **Database**
2. Under **Connection string**, select **URI**
3. Copy the connection string
4. Use it as your `DATABASE_URL`

**Note**: For Prisma migrations, you may need to use the direct connection (without `pgbouncer`):
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"
```

## Files Created

### 1. `src/lib/supabase.ts`
- Client-side Supabase client
- Server-side admin client (with service role)
- Helper functions for token verification

### 2. `src/lib/supabase-server.ts`
- Server-side Supabase client for Next.js App Router
- Middleware client for request/response handling
- Proper cookie management for SSR

### 3. Updated `src/middleware.ts`
- Integrated Supabase authentication
- Automatic session refresh
- Route protection using Supabase auth

### 4. Updated `src/lib/middleware-utils.ts`
- Uses Supabase for authentication checks
- Syncs Supabase auth users with Prisma database
- Auto-creates users in Prisma when they authenticate via Supabase

## Setup Steps

### 1. Install Dependencies
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and fill in your database password.

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Run Database Migrations
```bash
# Create initial migration
npx prisma migrate dev --name init

# Or push schema directly (for development)
npx prisma db push
```

### 5. Verify Connection
```bash
# Open Prisma Studio to verify tables were created
npx prisma studio
```

## How It Works

### Authentication Flow

1. **User Signs In**: User authenticates via Supabase Auth (email/password, OAuth, etc.)
2. **Session Created**: Supabase creates a session and stores it in cookies
3. **Middleware Checks**: On each request, middleware:
   - Reads Supabase session from cookies
   - Refreshes session if needed
   - Checks authentication status
4. **Route Protection**: Protected routes verify authentication before allowing access
5. **User Sync**: When a user authenticates, they're automatically created in Prisma database if they don't exist

### Database Architecture

- **Supabase Auth**: Handles user authentication (users table in Supabase)
- **Prisma/PostgreSQL**: Stores application data (users, family trees, persons, shares)
- **User Sync**: Supabase auth users are synced to Prisma `User` table on first access

## Usage Examples

### Client-Side (React Components)
```typescript
'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export function UserProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  return <div>{user?.email}</div>;
}
```

### Server-Side (Server Components)
```typescript
import { createClient } from '@/lib/supabase-server';

export default async function ServerComponent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  return <div>Hello {user?.email}</div>;
}
```

### API Routes
```typescript
import { createClient } from '@/lib/supabase-server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const trees = await prisma.familyTree.findMany({
    where: { userId: user.id },
  });
  
  return Response.json(trees);
}
```

## Security Notes

1. **Service Role Key**: Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client. It bypasses Row Level Security (RLS).

2. **Anon Key**: The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to expose to the client, but ensure RLS policies are set up in Supabase.

3. **Database Password**: Keep your database password secure. Never commit it to version control.

4. **Environment Variables**: Use `.env.local` for local development and set environment variables in your deployment platform (Vercel, etc.).

## Disable Email Confirmation (Required for MVP)

To allow users to sign up and immediately access the app without email verification:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `YOUR_PROJECT_REF`
3. Navigate to **Authentication** → **Providers**
4. Click on **Email** provider
5. Find the **Confirm Email** toggle
6. **Turn it OFF**
7. Click **Save**

**Why this is needed:**
- By default, Supabase requires email confirmation before creating a session
- With email confirmation enabled, `signUp()` returns a user but no session
- Disabling it allows immediate session creation after signup
- Users can sign up and start using the app right away

**Security Note:** Disabling email confirmation means users can sign up with unverified emails. For production, consider re-enabling it or implementing alternative verification methods.

## Next Steps

1. ✅ **Disable email confirmation** (see above)
2. Set up Row Level Security (RLS) policies in Supabase
3. Configure authentication providers (email, OAuth, etc.) in Supabase Dashboard
4. Create API routes that use both Supabase auth and Prisma
5. Set up database backups in Supabase Dashboard

## Troubleshooting

### Connection Issues
- Verify your database password is correct
- Check if your Supabase project is active
- Ensure the connection string format is correct

### Authentication Issues
- Check that environment variables are set correctly
- Verify Supabase project URL and keys match
- Check browser console for authentication errors

### Prisma Issues
- Run `npx prisma generate` after schema changes
- Use `npx prisma db push` for quick schema updates
- Use `npx prisma migrate dev` for production-ready migrations


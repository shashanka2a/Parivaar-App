# Prisma Middleware with Routing Setup

This document explains the Prisma middleware and Next.js routing middleware setup for the Parivaar app.

## Files Created

### 1. Prisma Schema (`prisma/schema.prisma`)
- Defines database models: `User`, `FamilyTree`, `Person`, and `Share`
- Configured for PostgreSQL database
- Includes relationships and indexes for optimal performance

### 2. Prisma Client (`src/lib/prisma.ts`)
- Singleton Prisma client instance
- Includes Prisma middleware for:
  - **Query Logging**: Logs all queries in development mode
  - **Performance Monitoring**: Tracks query execution time
  - **Error Handling**: Catches and logs database errors
  - **Soft Delete Support**: Ready for soft delete implementation

### 3. Next.js Middleware (`src/middleware.ts`)
- Handles routing and authentication
- Features:
  - **Route Protection**: Protects authenticated routes (`/dashboard`, `/trees`, `/explore`, `/settings`)
  - **Public Routes**: Allows access to public routes (`/`, `/onboarding`)
  - **API Route Handling**: Adds CORS headers and authentication checks for API routes
  - **Shared Tree Validation**: Validates shared tree links
  - **Security Headers**: Adds security headers to all responses
  - **Automatic Redirects**: Redirects based on authentication state

### 4. Middleware Utilities (`src/lib/middleware-utils.ts`)
- Helper functions for middleware:
  - `isAuthenticated()`: Checks if user is authenticated
  - `getUserFromRequest()`: Retrieves user from request
  - `hasTreeAccess()`: Checks if user has access to a family tree
  - `isValidShareLink()`: Validates shared tree links
  - Route type checkers: `isPublicRoute()`, `isProtectedRoute()`, `isApiRoute()`, `isSharedRoute()`

## Setup Instructions

### 1. Install Dependencies
```bash
npm install prisma @prisma/client
```

### 2. Configure Database
Create a `.env.local` file in the root directory with your Supabase connection string:
```env
# Supabase PostgreSQL Connection
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Note**: Replace `[YOUR-PASSWORD]` with your Supabase database password. Get it from Supabase Dashboard > Settings > Database.

For migrations, you may need to use the direct connection (without pgbouncer):
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Run Migrations
```bash
# Create initial migration
npx prisma migrate dev --name init

# Or push schema to database (for development)
npx prisma db push
```

### 5. (Optional) Open Prisma Studio
```bash
npx prisma studio
```

## Usage

### Using Prisma Client
```typescript
import { prisma } from '@/lib/prisma';

// Example: Create a user
const user = await prisma.user.create({
  data: {
    name: 'John Doe',
    email: 'john@example.com',
  },
});

// Example: Query with relations
const familyTree = await prisma.familyTree.findUnique({
  where: { id: 'tree-id' },
  include: {
    persons: true,
    user: true,
  },
});
```

### Middleware Behavior

#### Protected Routes
Routes like `/dashboard`, `/trees`, `/explore`, `/settings` require authentication. Unauthenticated users are redirected to `/onboarding`.

#### Public Routes
Routes like `/`, `/onboarding` are accessible without authentication.

#### Shared Tree Routes
Routes like `/shared/[shareId]` validate the share link before allowing access.

#### API Routes
API routes under `/api` get CORS headers and can be protected based on authentication.

## Customization

### Adding New Protected Routes
Edit `src/lib/middleware-utils.ts`:
```typescript
export const routeConfig = {
  protected: ['/dashboard', '/trees', '/explore', '/settings', '/your-new-route'],
  // ...
};
```

### Custom Prisma Middleware
Edit `src/lib/prisma.ts` to add custom middleware logic:
```typescript
prisma.$use(async (params, next) => {
  // Your custom logic here
  return next(params);
});
```

### Authentication Implementation
Currently, the middleware checks for cookies (`auth-token`, `session-id`). To implement full authentication:

1. Create a session management system
2. Update `isAuthenticated()` in `middleware-utils.ts` to verify tokens
3. Add session verification with database queries

## Notes

- The middleware runs on every request matching the config matcher
- Prisma client uses connection pooling in production
- In development, Prisma logs all queries for debugging
- Security headers are added to all responses automatically
- **Supabase Integration**: Authentication is handled by Supabase, while Prisma manages application data
- Users authenticated via Supabase are automatically synced to the Prisma `User` table

## Next Steps

1. Set up your database connection string
2. Run migrations to create tables
3. Implement authentication logic (JWT, sessions, etc.)
4. Update route protection logic as needed
5. Add API routes that use Prisma client


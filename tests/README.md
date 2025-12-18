# Tests

This directory contains test scripts for validating the application.

## Available Tests

### `test-connection.js`
Test Supabase and Prisma database connections.

**Usage:**
```bash
node tests/test-connection.js
```

**What it tests:**
- Environment variables
- Supabase connection
- Prisma database connection
- User and tree counts

**Requirements:**
- `.env` file with all required variables

### `test-auth.sh`
Test complete authentication flow.

**Usage:**
```bash
./tests/test-auth.sh
```

**What it tests:**
- User signup
- User login
- Get current user
- User logout

**Requirements:**
- Development server running (`npm run dev`)
- Server accessible at `http://localhost:3000`

### `test-flow.sh`
Test application routing and middleware flow.

**Usage:**
```bash
./tests/test-flow.sh [BASE_URL]
```

**Default:** `http://localhost:3000`

**What it tests:**
- Public routes (onboarding)
- Protected routes (dashboard)
- API endpoints
- Root route

**Example:**
```bash
# Test local development
./tests/test-flow.sh

# Test production
./tests/test-flow.sh https://www.parivaar.world
```

## Running All Tests

```bash
# Make scripts executable
chmod +x tests/*.sh

# Run connection test
node tests/test-connection.js

# Run auth flow test (requires dev server)
./tests/test-auth.sh

# Run routing test
./tests/test-flow.sh
```

## Test Endpoints

The application also provides API test endpoints:

- `GET /api/test-connection` - Test Supabase and Prisma connections
- `GET /api/test-auth-flow` - Test authentication flow
- `GET /api/test-auth` - Test current authentication status

## See Also

- [Testing Documentation](../docs/TEST_CONNECTION.md)
- [Authentication Testing](../docs/AUTH_TESTING.md)



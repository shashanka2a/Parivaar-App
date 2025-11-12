# Authentication Testing Guide

## Environment Setup

All environment variables are stored in `.env` file (not committed to git).

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`

## Authentication Endpoints

### 1. Signup
**POST** `/api/auth/signup`

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name" // optional
}
```

Response (201):
```json
{
  "message": "User created successfully",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name"
  },
  "session": { ... }
}
```

### 2. Login
**POST** `/api/auth/login`

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response (200):
```json
{
  "message": "Login successful",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name"
  },
  "session": {
    "access_token": "...",
    "refresh_token": "...",
    "expires_at": 1234567890
  }
}
```

### 3. Get Current User
**GET** `/api/auth/me`

Requires authentication (session cookie).

Response (200):
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "familyTrees": [...]
  }
}
```

### 4. Logout
**POST** `/api/auth/logout`

Requires authentication (session cookie).

Response (200):
```json
{
  "message": "Logged out successfully"
}
```

## Testing Methods

### Method 1: Automated Test Script
```bash
./test-auth.sh
```

This script will:
1. Test signup with a unique email
2. Test login with the created credentials
3. Test getting current user
4. Test logout

### Method 2: Manual Testing with curl

**Signup:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt
```

**Get Current User:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt
```

**Logout:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

### Method 3: Test Auth Flow Endpoint
```bash
curl http://localhost:3000/api/test-auth-flow
```

This endpoint tests:
- Environment variables
- Supabase connection
- Database connection
- Provides instructions for manual testing

## Validation Checklist

- [ ] Environment variables are loaded from `.env`
- [ ] No hardcoded credentials in source code
- [ ] Signup creates user in both Supabase Auth and Prisma DB
- [ ] Login authenticates with Supabase and syncs to Prisma
- [ ] Session is properly managed via cookies
- [ ] Protected routes require authentication
- [ ] Logout clears session
- [ ] Password validation (min 6 characters)
- [ ] Email validation (format check)
- [ ] Error handling for invalid credentials

## Security Notes

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Service Role Key** - Only used server-side, never exposed to client
3. **Password Storage** - Handled by Supabase Auth (hashed)
4. **Session Management** - Handled by Supabase with secure cookies
5. **Environment Variables** - `NEXT_PUBLIC_*` are exposed to client, others are server-only

## Troubleshooting

### "Missing Supabase environment variables"
- Ensure `.env` file exists in project root
- Restart dev server after creating/updating `.env`
- Check variable names match exactly

### "User already exists"
- Email must be unique
- Try a different email or login instead

### "Invalid email or password"
- Check email format
- Verify password is at least 6 characters
- Ensure user exists (signup first)

### Session not persisting
- Check cookies are being set
- Verify middleware is refreshing sessions
- Check browser cookie settings


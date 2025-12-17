# Authentication Testing Guide

## Environment Setup

All environment variables are stored in `.env` file (not committed to git).

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`

## Current Authentication Flow (MVP)

### 1. Client‑side auth (Supabase JS SDK)

For the MVP, the **onboarding UI talks directly to Supabase Auth** using the browser SDK.  
There are **no `/api/auth/signup` / `/api/auth/login` wrappers in the flow anymore.**

In `OnboardingFlow`:

- **Signup:**

```ts
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { name } },
});
```

- **Login:**

```ts
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

On success:

- Supabase sets the **session cookies** in the browser.
- We update `appState.user` from `data.user` and continue onboarding.

### 2. Server‑side auth usage

All server routes that need auth use the **same pattern as `/api/auth/me`**:

```ts
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user || !user.email) return 401;
```

These routes are:

- `GET /api/trees`
- `POST /api/trees`
- `GET /api/trees/[id]`
- `PUT /api/trees/[id]`
- `DELETE /api/trees/[id]`
- `POST /api/shares`
- `GET /api/auth/me`

They all:

- Read the Supabase session from cookies.
- Resolve the corresponding `User` row in Prisma by email.
- Enforce **tree ownership** where relevant (trees & share links).

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

### Manual Testing (MVP)

Because signup/login use the browser SDK, testing is done via the **UI**:

1. Open `/` → you’ll be redirected to `/onboarding`.
2. Use the **Sign Up** tab:
   - Enter name, email, password (≥ 6 chars).
   - On success, you move to the family‑name step.
3. Or use the **Login** tab:
   - Enter existing credentials.
4. After onboarding, you land on `/trees` and should see your trees.

To verify server‑side auth:

1. After logging in in the browser, open devtools → Network.
2. Hit:

```bash
GET /api/auth/me       # should return 200, with your user + familyTrees
GET /api/trees         # should return trees for that user
```

If these return 401, it means the Supabase session cookie isn’t present; in practice, with the client SDK this should work as long as `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct.

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
- Try a different email or use the **Login** tab instead

### "Invalid email or password"
- Check email format
- Verify password is at least 6 characters
- Ensure user exists (signup first)

### Session not persisting
- Check cookies are being set
- Verify middleware is refreshing sessions
- Check browser cookie settings


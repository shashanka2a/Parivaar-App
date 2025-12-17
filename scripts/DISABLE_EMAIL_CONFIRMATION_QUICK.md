# Quick Guide: Disable Email Confirmation

## ⚡ Direct Link

**Click here to go directly to the settings:**
👉 https://supabase.com/dashboard/project/frxpbnoornbecjutllfv/auth/providers

## 📋 Steps (30 seconds)

1. **Click the link above** (or copy-paste into browser)
2. **Log in** to Supabase if prompted
3. **Click on "Email"** provider (in the list)
4. **Find "Confirm Email"** toggle
5. **Turn it OFF** (uncheck/toggle off)
6. **Click "Save"** button

## ✅ Verification

After saving, test by:
1. Signing up with a new account
2. You should immediately get a session (no "check your email" message)
3. You should be able to create trees right away

## 🔧 Alternative: Run Script

If you prefer, you can try running:
```bash
node scripts/disable-email-confirmation.js
```

However, this typically requires dashboard access as email confirmation is a project-level setting.


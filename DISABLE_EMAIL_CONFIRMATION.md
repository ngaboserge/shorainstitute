# 🔧 Disable Email Confirmation in Supabase

## The Issue
You're getting "Email not confirmed" error when trying to login after signup.

## Quick Fix (2 minutes)

### Step 1: Open Supabase Dashboard
https://supabase.com/dashboard

### Step 2: Navigate to Authentication Settings
1. Select your project: **ydldtedpcnpoeznhgsot**
2. Click **Authentication** (left sidebar)
3. Click **Settings** tab
4. Scroll to **Email Auth**

### Step 3: Disable Email Confirmation
1. Find: **"Enable email confirmations"**
2. **Toggle OFF** (disable it)
3. Click **Save**

### Step 4: Update Email Templates (Optional)
1. Click **Email Templates** tab
2. Select **Confirm signup**
3. Change to: Just redirect without requiring confirmation

OR simply keep it disabled for development.

---

## Alternative: Confirm Existing Emails

If you already created accounts that need confirmation:

### Option A: Through Supabase Dashboard
1. Go to **Authentication** → **Users**
2. Find your email
3. Click **...** menu
4. Click **Confirm email**

### Option B: Through SQL
```sql
-- Confirm all existing users
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;
```

---

## For Production

When deploying to production, you should:
1. **Re-enable** email confirmation
2. Configure SMTP settings (custom email server)
3. Customize email templates
4. Set proper redirect URLs

But for development/testing, keep it disabled.

---

## After Disabling

1. Try signup again
2. Should work without email confirmation
3. Can login immediately after signup
4. No confirmation emails sent

Done! ✅

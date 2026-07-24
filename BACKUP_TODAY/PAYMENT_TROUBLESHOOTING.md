# Payment Integration Troubleshooting

## ✅ Issues Resolved

### Issue 1: Backend API Not Running
**Error:** `Failed to load resource: the server responded with a status of 500`

**Cause:** The backend API server (`npm run dev:api`) was not running.

**Solution:** Always run BOTH servers:
```bash
# Terminal 1 - Frontend (Vite)
npm run dev

# Terminal 2 - Backend API
npm run dev:api
```

### Issue 2: Wrong SITE_URL Port
**Error:** Payment callbacks going to wrong port

**Cause:** `.env` had `SITE_URL=http://localhost:3001` but Vite runs on port 3000

**Solution:** Updated `.env` to:
```env
SITE_URL=http://localhost:3000
XENTRIPAY_CARD_RETURN_URL_BASE=http://localhost:3000
```

### Issue 3: Space in SUPABASE_SERVICE_ROLE_KEY
**Cause:** Extra space in `.env` value

**Solution:** Removed space:
```env
# WRONG:
SUPABASE_SERVICE_ROLE_KEY= eyJhbG...

# CORRECT:
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

---

## Server Architecture

### Port Configuration:
- **Frontend (Vite):** `http://localhost:3000`
- **Backend API:** `http://localhost:3001`
- **Proxy:** Vite forwards `/api/*` to port 3001

### How It Works:
```
Browser → http://localhost:3000/api/payment-initiate
         ↓
Vite Proxy → http://localhost:3001/api/payment-initiate
             ↓
Backend API Server handles request
```

---

## Common Errors & Solutions

### Error: "Payment system unavailable"

**Symptoms:**
- 500 error on `/api/payment-initiate`
- "Unexpected end of JSON input"

**Causes & Solutions:**

1. **Backend API not running**
   ```bash
   # Start it:
   npm run dev:api
   ```

2. **Missing SUPABASE_SERVICE_ROLE_KEY**
   - Check `.env` has the key
   - No spaces before the value
   - Restart API server after adding

3. **Wrong port configuration**
   - Vite should be on 3000
   - API should be on 3001
   - SITE_URL should be 3000

### Error: "XentriPay not configured"

**Cause:** Missing `XENTRIPAY_API_KEY` in `.env`

**Solution:**
```env
XENTRIPAY_API_KEY=a81f957023344b199177c7c9a68e9878
XENTRIPAY_SANDBOX=true
XENTRIPAY_BASE_URL=https://test.xentripay.com
```

### Error: "Course not found" or "Already enrolled"

**Causes:**
- Course ID doesn't exist
- Course status is not 'published'
- Learner already enrolled with status 'free' or 'approved'
- Course price is 0 or is_paid is false

**Solution:** Check in Supabase:
```sql
SELECT id, title, price, is_paid, status 
FROM courses 
WHERE id = 'your-course-id';
```

### Error: "Invalid login credentials"

**Note:** This is normal - shown in console when testing wrong passwords.

---

## Required Environment Variables

### ✅ All Set (Already Configured):

```env
# Frontend (Vite uses these)
VITE_SUPABASE_URL=https://ydldtedpcnpoeznhgsot.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_CARD_PAYMENT_ENABLED=false

# Backend API (Node.js uses these)
SUPABASE_URL=https://ydldtedpcnpoeznhgsot.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... (NO SPACE!)

# XentriPay
XENTRIPAY_API_KEY=a81f957023344b199177c7c9a68e9878
XENTRIPAY_SANDBOX=true
XENTRIPAY_BASE_URL=https://test.xentripay.com

# URLs
SITE_URL=http://localhost:3000
XENTRIPAY_CARD_RETURN_URL_BASE=http://localhost:3000

# Currency Conversion
USD_TO_RWF_RATE=1463.5
EUR_TO_RWF_RATE=1590
```

---

## Testing Checklist

Before testing payments:

- [ ] Frontend running: `npm run dev` → http://localhost:3000
- [ ] Backend running: `npm run dev:api` → http://localhost:3001
- [ ] `.env` has all required variables
- [ ] No spaces before `=` in `.env` values
- [ ] Migration applied: `approve_course_payment` function exists
- [ ] Test course exists and is published
- [ ] Test course has price > 0 and is_paid = true

---

## How to Verify Setup

### 1. Check Backend API is Running

Open browser: http://localhost:3001

Should see: `Cannot GET /` (this is fine - routes are at `/api/*`)

### 2. Check API Route Responds

Browser console:
```javascript
fetch('http://localhost:3001/api/payment-status?ref=test')
  .then(r => r.json())
  .then(console.log)
```

Should see: `{success: false, status: "pending", referenceId: "test"}`

### 3. Check Supabase Connection

Run in Supabase SQL Editor:
```sql
-- Should return the service role user
SELECT current_user;
```

### 4. Check Migration Applied

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'approve_course_payment';
```

Should return: `approve_course_payment`

---

## Dev Server Logs

### Normal Backend API Logs:
```
[local-api] Payment API running at http://localhost:3001
[local-api] Start Vite with: npm run dev  →  http://localhost:3000
[local-api] XentriPay webhook (prod): http://localhost:3000/api/webhooks/xentripay
[local-api] Card return URL base: http://localhost:3000/payment/success?ref=...
```

### When Payment Initiated (Success):
```
POST /api/payment-initiate 200
```

### When Payment Initiated (Error):
```
[payment-initiate] Unhandled error: { message: "...", stack: "..." }
POST /api/payment-initiate 500
```

---

## Browser Console

### Ignore These (Normal):
- "Download React DevTools" - Just a suggestion
- "Failed to load favicon.ico" - No icon file
- "via.placeholder.com Failed" - Placeholder images offline
- "AUTH event: TOKEN_REFRESHED" - Normal auth activity

### Watch For These (Errors):
- ❌ "Failed to load resource: 500" on `/api/payment-initiate`
- ❌ "[Payment] Error: Unexpected end of JSON input"
- ❌ "Payment system unavailable"
- ❌ "XentriPay not configured"

---

## Quick Debug Commands

### Check if backend is running:
```bash
curl http://localhost:3001/api/payment-status?ref=test
```

Should return JSON, not HTML error page.

### Check environment variables loaded:
Add to `scripts/local-api-server.mjs` temporarily:
```javascript
console.log('XENTRIPAY_API_KEY:', process.env.XENTRIPAY_API_KEY ? 'SET' : 'MISSING');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');
```

### Restart everything:
```bash
# Stop all
Ctrl+C in both terminals

# Restart frontend
npm run dev

# Restart backend
npm run dev:api
```

---

## Still Having Issues?

### 1. Check Backend Console for Errors
Look at the terminal running `npm run dev:api` for error messages.

### 2. Check Browser Network Tab
- Open DevTools → Network
- Try payment
- Look at `/api/payment-initiate` request
- Check Response tab for error message

### 3. Check Supabase Logs
- Supabase Dashboard → Logs
- Look for errors related to RPC function calls

### 4. Verify Test Data
```sql
-- Check test course exists
SELECT * FROM courses 
WHERE id = '56660c0e-df71-46be-810c-789c56a7d6cb';

-- Check learner not already enrolled
SELECT * FROM enrollments 
WHERE user_id = 'eb6fdd90-2f2d-4ed6-8e6f-a3bebc18f35a'
AND course_id = '56660c0e-df71-46be-810c-789c56a7d6cb';
```

---

## Summary

✅ **All issues resolved!**

**Current Status:**
- Backend API running on port 3001
- Frontend running on port 3000
- All environment variables configured
- Service role key properly set (no spaces)
- SITE_URL pointing to correct port

**To test payment:**
1. Both servers running
2. Login as learner
3. Enroll in paid course
4. Complete payment
5. Check trainer approvals

**Everything should work now!** 🎉

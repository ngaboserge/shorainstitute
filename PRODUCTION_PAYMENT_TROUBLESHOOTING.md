# Production Payment Troubleshooting

## 🚨 Error

`[Payment] Error: TypeError: Failed to fetch at initiatePayment (paymentService.js:28:28)`

This error means the frontend at `https://www.shorainstitute.com` cannot reach the payment API endpoint.

---

## ✅ Production Deployment Checklist

### 1. Verify API Endpoints are Deployed

**Check if these URLs respond:**

```bash
# Test payment status endpoint (should work without auth)
curl https://www.shorainstitute.com/api/payment-status?ref=test123

# Expected response:
{"success":false,"status":"pending","referenceId":"test123"}
```

**If you get 404 or Connection Refused:**
- ❌ The API routes are NOT deployed
- ❌ The `server.js` is not running on production

---

### 2. Check Production Server Status

**On your cPanel/production server, verify:**

```bash
# Check if Node.js app is running
ps aux | grep node

# Check if server.js is active
pm2 list
# OR
node server.js
```

**The server MUST be running** with this command:
```bash
node server.js
```

This serves both:
- Static files from `/dist`
- API routes from `/api/*`

---

### 3. Verify Build is Complete

**Make sure you built the project before deploying:**

```bash
npm run build
```

This creates the `/dist` folder with:
- `index.html`
- `assets/` folder with JS/CSS bundles
- All compiled frontend code

---

### 4. Check cPanel Node.js App Configuration

If using cPanel's "Setup Node.js App":

**Entry point must be:** `server.js`

**Environment variables must include:**
```
SUPABASE_URL=https://ydldtedpcnpoeznhgsot.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
XENTRIPAY_API_KEY=2df181e422b446569cea99d2e96e1b48
XENTRIPAY_SANDBOX=true
XENTRIPAY_BASE_URL=https://test.xentripay.com
SITE_URL=https://www.shorainstitute.com
```

---

### 5. Test API Endpoint Directly

**From your browser console on production site:**

```javascript
fetch('https://www.shorainstitute.com/api/payment-status?ref=test', {
  method: 'GET'
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

**Expected:**
```json
{"success":false,"status":"pending","referenceId":"test"}
```

**If CORS error:**
- Need to add CORS headers to `server.js`

**If 404:**
- Server routes not configured properly

---

## 🔧 Common Production Issues & Fixes

### Issue 1: Server Not Running

**Symptom:** Cannot connect to API endpoints

**Fix:**
```bash
# SSH into production server
cd /path/to/shora_institute
node server.js
```

**Better: Use PM2 to keep it running:**
```bash
npm install -g pm2
pm2 start server.js --name shora-api
pm2 save
pm2 startup
```

---

### Issue 2: Missing /dist Folder

**Symptom:** Blank page or 404 on production

**Fix:**
```bash
npm run build
# Upload /dist folder to production
```

---

### Issue 3: CORS Issues

**Symptom:** CORS error in browser console

**Fix:** Add to `server.js` before routes:
```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://www.shorainstitute.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
```

---

### Issue 4: Environment Variables Not Set

**Symptom:** "XentriPay not configured" error

**Fix:** In cPanel Node.js App settings, add all environment variables from `.env`:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- XENTRIPAY_API_KEY
- XENTRIPAY_SANDBOX
- XENTRIPAY_BASE_URL
- SITE_URL

---

## 📋 Production Deployment Steps

**Complete deployment process:**

### 1. Build locally
```bash
npm run build
```

### 2. Upload to production
Upload these files/folders:
- `dist/` (entire folder)
- `server.js`
- `api/` (entire folder)
- `server/` (entire folder)
- `package.json`
- `package-lock.json`

### 3. Install dependencies on server
```bash
ssh your-server
cd /path/to/shora_institute
npm install --production
```

### 4. Set environment variables
In cPanel → Node.js App → Environment Variables

### 5. Start server
```bash
node server.js
# OR with PM2
pm2 start server.js --name shora-institute
```

### 6. Test
```bash
curl https://www.shorainstitute.com/api/payment-status?ref=test
```

---

## 🎯 Quick Diagnostic

**Run this on production server:**

```bash
# 1. Check if server is running
netstat -tlnp | grep :3000

# 2. Test API locally on server
curl http://localhost:3000/api/payment-status?ref=test

# 3. Check logs
tail -f /path/to/logs/error.log
# OR if using PM2
pm2 logs shora-institute
```

---

## 📞 If Still Not Working

Provide these details:
1. **Server type:** cPanel / VPS / Cloud?
2. **Node.js version:** `node --version`
3. **Is server.js running?** `ps aux | grep node`
4. **Can you access:** https://www.shorainstitute.com/api/payment-status?ref=test
5. **Error in server logs:** Check error logs

---

## ✅ Success Indicators

When properly deployed:
- ✅ `https://www.shorainstitute.com` loads the app
- ✅ `https://www.shorainstitute.com/api/payment-status?ref=test` returns JSON
- ✅ Payment modal opens and processes without "Failed to fetch" error
- ✅ XentriPay integration works end-to-end

---

The issue is **NOT in the code** - it's in the deployment configuration. The payment system is properly coded and configured in `.env`. You just need to ensure the production server is running `server.js` correctly! 🚀

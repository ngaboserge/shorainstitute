# ✅ Simplified to Single Command!

## You Asked For It, You Got It! 🎉

**Before:**
```bash
npm run dev      # Terminal 1
npm run dev:api  # Terminal 2  ❌ Annoying!
```

**Now:**
```bash
npm run dev      # That's it! ✅
```

---

## What Changed

### Files Added:
- ✅ `vite-plugin-api.js` - Handles API routes in Vite
- ✅ `vercel.json` - Configures Vercel deployment
- ✅ `SINGLE_COMMAND_SETUP.md` - Complete documentation

### Files Modified:
- ✅ `vite.config.js` - Added API plugin

### Result:
- ✅ **One command:** `npm run dev`
- ✅ **One server:** Port 3000
- ✅ **One terminal:** No more terminal juggling
- ✅ **Vercel ready:** Deploys automatically

---

## How to Use

### Development:
```bash
npm run dev
```
Open: http://localhost:3000

### Production (Vercel):
```bash
# Option 1: Push to GitHub
git push
# Vercel auto-deploys!

# Option 2: Manual deploy
vercel --prod
```

---

## How It Works

**Development:**
- Vite plugin intercepts `/api/*` requests
- Executes API handlers directly
- No separate server needed

**Production:**
- Vercel detects `/api/*.js` files
- Creates serverless functions automatically
- Same code, zero configuration

---

## Vercel Deployment

### 1. Install Vercel CLI:
```bash
npm install -g vercel
```

### 2. Login:
```bash
vercel login
```

### 3. Deploy:
```bash
vercel
```

### 4. Add Environment Variables:
Go to Vercel Dashboard → Settings → Environment Variables

Add:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` ⚠️ SECRET!
- `XENTRIPAY_API_KEY`
- `XENTRIPAY_SANDBOX=false` (for production)
- `XENTRIPAY_BASE_URL=https://xentripay.com`
- `SITE_URL=https://yourdomain.vercel.app`
- `USD_TO_RWF_RATE=1463.5`
- `EUR_TO_RWF_RATE=1590`

### 5. Redeploy:
```bash
vercel --prod
```

Done! Your site is live with working payments! 🚀

---

## Testing

### Test Locally:
```bash
npm run dev
```

1. Login as learner
2. Browse courses
3. Click "Enroll - $500"
4. Complete payment
5. Works! ✅

### Test API Endpoint:
Open browser console:
```javascript
fetch('/api/payment-status?ref=test')
  .then(r => r.json())
  .then(console.log)
```

Should return: `{success: false, status: "pending", referenceId: "test"}`

---

## Benefits

### Development:
- ✅ One command
- ✅ Faster startup
- ✅ Less confusion
- ✅ Cleaner workflow

### Production:
- ✅ Auto-scaling
- ✅ Global CDN
- ✅ HTTPS included
- ✅ Zero server management

---

## Files You Care About

### `/api/` folder
Your serverless functions. Each file becomes an endpoint:
- `payment-initiate.js` → `/api/payment-initiate`
- `payment-status.js` → `/api/payment-status`
- `webhooks/xentripay.js` → `/api/webhooks/xentripay`

### `vercel.json`
Tells Vercel how to deploy. Already configured! ✅

### `.env`
Environment variables for development. **Don't commit this!**

### Vercel Environment Variables
Add these in Vercel Dashboard for production.

---

## Troubleshooting

### Can't find API routes?
- Check `/api` folder exists
- Restart: `npm run dev`

### Environment variables not working?
- Check `.env` file exists
- No spaces before `=`
- Restart: `npm run dev`

### Vercel deployment issues?
- Add environment variables in dashboard
- Check `npm run build` works locally
- Check `vercel.json` exists

---

## Documentation

**Read this first:**
- `SINGLE_COMMAND_SETUP.md` - Complete guide

**Other docs:**
- `PAYMENT_INTEGRATION_SUMMARY.md` - Payment system overview
- `MANUAL_APPROVAL_FLOW.md` - Manual approval workflow
- `PAYMENT_TROUBLESHOOTING.md` - Common issues

---

## Summary

🎉 **Single command development is ready!**

**Just run:** `npm run dev`

**That's it!** Frontend, backend, payments - everything works!

**Deploy to Vercel:** Push to GitHub, done!

No more separate API server. No more terminal juggling. Just code! 🚀

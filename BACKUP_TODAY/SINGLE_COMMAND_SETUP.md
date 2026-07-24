# Single Command Development Setup ✅

## The Problem (Before)

You had to run TWO separate servers:
```bash
# Terminal 1
npm run dev          # Frontend on port 3000

# Terminal 2
npm run dev:api      # Backend API on port 3001
```

This was annoying! 😤

---

## The Solution (Now)

**Just run ONE command:**
```bash
npm run dev
```

That's it! Everything works! 🎉

---

## How It Works

### Development (Your Computer)

When you run `npm run dev`:

1. **Vite starts** on port 3000
2. **Vite plugin** intercepts `/api/*` requests
3. **API handlers** run directly in the Vite server
4. **One command, one server, one port** ✅

```
Browser → http://localhost:3000
         ↓
Vite Dev Server (port 3000)
         ↓
/api/* → Vite Plugin → API Handlers
         ↓
Your app works!
```

### Production (Vercel)

When you deploy to Vercel:

1. **Vercel builds** your React app
2. **Vercel detects** `/api/*.js` files
3. **Vercel creates** serverless functions automatically
4. **Everything deploys** together ✅

```
Your Domain → https://shora-institute.vercel.app
             ↓
Static Frontend (React build)
             ↓
/api/* → Vercel Serverless Functions
         ↓
Same code, auto-scaling!
```

---

## What Changed

### Files Added:

1. **`vite-plugin-api.js`** (NEW)
   - Vite plugin that handles API routes
   - Loads environment variables
   - Executes API handlers in development
   - Only runs in dev mode (not production)

2. **`vercel.json`** (NEW)
   - Tells Vercel how to deploy
   - Maps `/api/*` routes to serverless functions
   - Configures Node.js runtime
   - Sets memory and timeout limits

### Files Modified:

1. **`vite.config.js`**
   - Added `apiPlugin()` to plugins
   - Removed proxy configuration (not needed anymore)
   - Simplified to single port

### Files Deprecated:

1. **`scripts/local-api-server.mjs`**
   - No longer needed for development
   - Keep it for reference
   - Not used anymore

2. **`npm run dev:api`** command
   - No longer needed
   - Only `npm run dev` required

---

## Development Workflow

### Starting Development:

```bash
# Just this!
npm run dev
```

**That's it!** Open http://localhost:3000

### Testing Payment:

1. Run `npm run dev`
2. Login as learner
3. Click "Enroll" on paid course
4. Complete payment
5. Everything works! ✅

**No second terminal needed!**

---

## Environment Variables

### Development (.env file):

```env
# Frontend
VITE_SUPABASE_URL=https://ydldtedpcnpoeznhgsot.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_CARD_PAYMENT_ENABLED=false

# Backend (API handlers read these)
SUPABASE_URL=https://ydldtedpcnpoeznhgsot.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
XENTRIPAY_API_KEY=a81f957023344b199177c7c9a68e9878
XENTRIPAY_SANDBOX=true
XENTRIPAY_BASE_URL=https://test.xentripay.com
SITE_URL=http://localhost:3000
USD_TO_RWF_RATE=1463.5
EUR_TO_RWF_RATE=1590
```

### Production (Vercel Dashboard):

When deploying to Vercel, add these in:
**Vercel Dashboard → Your Project → Settings → Environment Variables**

```
SUPABASE_URL=https://ydldtedpcnpoeznhgsot.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...  (SECRET!)
XENTRIPAY_API_KEY=your_production_key
XENTRIPAY_SANDBOX=false
XENTRIPAY_BASE_URL=https://xentripay.com
SITE_URL=https://yourdomain.vercel.app
USD_TO_RWF_RATE=1463.5
EUR_TO_RWF_RATE=1590
```

⚠️ **Don't commit `.env` to Git!** It's already in `.gitignore`

---

## Deploying to Vercel

### First Time Setup:

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Add Environment Variables:**
   - Go to Vercel Dashboard
   - Select your project
   - Settings → Environment Variables
   - Add all variables from `.env` (except VITE_* ones)

5. **Redeploy:**
   ```bash
   vercel --prod
   ```

### Every Subsequent Deploy:

**Option 1: Git Push (Recommended)**
```bash
git add .
git commit -m "Your changes"
git push
```
Vercel auto-deploys from GitHub!

**Option 2: Manual Deploy**
```bash
vercel --prod
```

---

## How Vercel Serverless Functions Work

### Your API Files:

```
api/
├── payment-initiate.js       → /api/payment-initiate
├── payment-status.js         → /api/payment-status
└── webhooks/
    └── xentripay.js          → /api/webhooks/xentripay
```

### What Vercel Does:

1. **Detects** `.js` files in `/api` folder
2. **Creates** serverless function for each file
3. **Routes** requests automatically
4. **Scales** to zero when not used (free!)
5. **Scales** up automatically when busy

### Benefits:

- ✅ **Auto-scaling:** Handles 1 or 10,000 requests
- ✅ **No server management:** Vercel handles everything
- ✅ **Pay per use:** Free for most usage
- ✅ **Global CDN:** Fast everywhere
- ✅ **HTTPS automatic:** SSL certificates included

---

## Testing the New Setup

### 1. Stop Old API Server (if running):

```bash
# Find and kill any process on port 3001
# Windows:
netstat -ano | findstr :3001
taskkill /PID <process_id> /F
```

### 2. Start Development:

```bash
npm run dev
```

### 3. Test API Endpoint:

Open browser console:
```javascript
fetch('/api/payment-status?ref=test')
  .then(r => r.json())
  .then(console.log)
```

Should see:
```json
{
  "success": false,
  "status": "pending",
  "referenceId": "test"
}
```

✅ **Working!**

### 4. Test Full Payment Flow:

1. Login as learner
2. Browse courses
3. Click "Enroll - $500"
4. Enter phone: `0788123456`
5. Click "Pay $500"
6. Should initiate payment ✅

---

## Troubleshooting

### Error: "Cannot find module './api/payment-initiate.js'"

**Cause:** Vite plugin can't find API files

**Solution:**
- Check `/api` folder exists
- Check `payment-initiate.js` exists in it
- Restart dev server: `npm run dev`

### Error: "SUPABASE_SERVICE_ROLE_KEY is undefined"

**Cause:** Environment variables not loaded

**Solution:**
- Check `.env` file exists in project root
- Check no spaces before `=` in values
- Restart dev server: `npm run dev`

### Error: Port 3000 already in use

**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <process_id> /F

# Then restart
npm run dev
```

### Vercel Deployment Fails

**Common Issues:**

1. **Missing environment variables**
   - Add them in Vercel Dashboard
   - Redeploy after adding

2. **Build errors**
   - Check `npm run build` works locally
   - Fix any TypeScript/ESLint errors

3. **API routes return 404**
   - Check `vercel.json` exists
   - Check route paths match exactly

---

## Old vs New Comparison

### Before (Complicated):

```bash
# Terminal 1
npm run dev          # Port 3000

# Terminal 2
npm run dev:api      # Port 3001

# Problems:
# - Two commands to remember
# - Two terminals to manage
# - Proxy configuration needed
# - Port conflicts possible
# - Confusing for new developers
```

### After (Simple):

```bash
# Just this!
npm run dev          # Port 3000 only

# Benefits:
# ✅ One command
# ✅ One terminal
# ✅ No proxy needed
# ✅ No port conflicts
# ✅ Same code works on Vercel
# ✅ Easy for everyone
```

---

## Architecture Diagram

### Development:

```
┌─────────────────────────────────────────┐
│  npm run dev                            │
│  ↓                                      │
│  Vite Dev Server (localhost:3000)      │
│  ├── React App (frontend)              │
│  └── API Plugin (backend)              │
│      ├── /api/payment-initiate          │
│      ├── /api/payment-status            │
│      └── /api/webhooks/xentripay        │
└─────────────────────────────────────────┘
```

### Production (Vercel):

```
┌─────────────────────────────────────────┐
│  yourdomain.vercel.app                  │
│  ├── Static Site (React build)         │
│  └── Serverless Functions               │
│      ├── /api/payment-initiate          │
│      ├── /api/payment-status            │
│      └── /api/webhooks/xentripay        │
└─────────────────────────────────────────┘
```

---

## Key Files Reference

### `vite-plugin-api.js`
- Handles API routes in development
- Loads `.env` variables
- Executes serverless function handlers
- Compatible with Vercel handler format

### `vercel.json`
- Configures Vercel deployment
- Maps API routes to functions
- Sets Node.js runtime version
- Configures memory and timeouts

### `vite.config.js`
- Adds API plugin to Vite
- Removes proxy configuration
- Simplified setup

### `/api/*.js` files
- Serverless function handlers
- Work in both dev and production
- Export default handler function
- Receive (req, res) parameters

---

## Benefits Summary

### For Development:
✅ **Simpler:** One command instead of two  
✅ **Faster:** No separate server to start  
✅ **Cleaner:** One terminal, one port  
✅ **Easier:** Less confusion for team members  

### For Production:
✅ **Scalable:** Auto-scales to demand  
✅ **Reliable:** Managed by Vercel  
✅ **Fast:** Global CDN distribution  
✅ **Cheap:** Free for most projects  

### For You:
✅ **Less hassle:** Just `npm run dev`  
✅ **Same everywhere:** Dev matches production  
✅ **No surprises:** What works locally works deployed  
✅ **Happy coding:** Focus on features, not infrastructure  

---

## Next Steps

1. **Stop any old API servers**
2. **Run `npm run dev`** (just this!)
3. **Test payment flow**
4. **Everything should work!**

When ready to deploy:
1. **Push to GitHub**
2. **Connect to Vercel**
3. **Add environment variables**
4. **Deploy!**

---

## Summary

🎉 **You now have a single-command development setup!**

**Before:** Two servers, two terminals, complex proxy  
**After:** One command, one server, simple and clean

**Development:** `npm run dev` → Everything works!  
**Production:** Vercel auto-deploys → Everything scales!

**No more `npm run dev:api` needed!** 🚀

# ✅ Single Command Setup - Ready!

## 🎉 Success! One Command to Run Everything

You can now start both servers with just:

```bash
npm run dev
```

That's it! No more running two terminals!

---

## What Happens When You Run `npm run dev`

```
npm run dev
  ↓
Starts concurrently:
  1. Backend API Server (port 3001)  [Blue prefix]
  2. Frontend Vite Server (port 3000) [Green prefix]
```

Both servers start automatically and run together!

---

## Current Status

✅ **Backend API**: Running on http://localhost:3001  
✅ **Frontend**: Running on http://localhost:3000  
✅ **Both started with**: One command (`npm run dev`)

---

## What Was Done

### 1. Installed `concurrently`:
```bash
npm install --save-dev concurrently
```

### 2. Updated `package.json` scripts:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:api\" \"npm run dev:vite:delay\" --names \"API,Vite\" --prefix-colors \"blue,green\" --kill-others",
    "dev:vite": "vite",
    "dev:vite:delay": "node -e \"setTimeout(() => {}, 2000)\" && vite",
    "dev:api": "node scripts/local-api-server.mjs"
  }
}
```

### Key Features:
- **`--names "API,Vite"`**: Labels each server's output
- **`--prefix-colors "blue,green"`**: Color-codes the output
- **`--kill-others`**: If one server crashes, stops both
- **`dev:vite:delay`**: 2-second delay to avoid port conflicts

---

## How to Use

### Start Development:
```bash
npm run dev
```

### Stop Development:
```bash
Ctrl + C
```
(Stops both servers at once)

### Open Your App:
```
http://localhost:3000
```

---

## Console Output

You'll see both servers running with colored prefixes:

```
[API] Payment API running at http://localhost:3001
[Vite] VITE v5.4.21  ready in 1171 ms
[Vite] ➜  Local:   http://localhost:3000/
```

**Blue = API Server**  
**Green = Vite Server**

---

## Benefits

✅ **Single command**: Just `npm run dev`  
✅ **One terminal**: No more juggling  
✅ **Auto-restart**: Both restart together  
✅ **Color-coded**: Easy to see which server logs what  
✅ **Clean stop**: Ctrl+C stops both  

---

## Individual Server Commands (if needed)

If you ever need to run them separately:

```bash
# Just API server
npm run dev:api

# Just frontend
npm run dev:vite
```

But you probably won't need to! 🎉

---

## Troubleshooting

### Port 3000 already in use?
```bash
# Windows - Kill process on port 3000
Get-NetTCPConnection -LocalPort 3000 | Select OwningProcess
Stop-Process -Id <process_id> -Force

# Then run again
npm run dev
```

### One server not starting?
- Check the colored output to see which one failed
- Each server's errors are clearly labeled

### Want to restart?
```bash
Ctrl + C  # Stop
npm run dev  # Start again
```

---

## Summary

🎉 **You're all set!**

**Before:** Two terminals, two commands, confusing  
**After:** One terminal, one command, simple

Just run:
```bash
npm run dev
```

And both servers start automatically! 🚀

---

## Next Steps

1. ✅ **Single command working** - Both servers start together
2. ⏳ **Get valid XentriPay API key** from your partner
3. ⏳ **Update `.env`** with the key
4. ⏳ **Restart**: `npm run dev`
5. ✅ **Test payments** - Everything should work!

**Current blocker:** XentriPay API key (401 error)  
**Once fixed:** Full payment system working!

# How to Run the Application

## Your Partner's Setup

Your partner created a **two-server architecture**:
- Frontend (React/Vite) on port 3000
- Backend API (Payment processing) on port 3001

## Required: Run Both Servers

### Terminal 1 - Backend API:
```bash
npm run dev:api
```
Should see: `Payment API running at http://localhost:3001`

### Terminal 2 - Frontend:
```bash
npm run dev
```
Should see: `Local: http://localhost:3000/`

## Environment Variables Needed

Add to `.env`:
```env
# Backend API needs these (no VITE_ prefix):
XENTRIPAY_API_KEY=your_key_from_partner
XENTRIPAY_SANDBOX=true
XENTRIPAY_BASE_URL=https://test.xentripay.com
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Testing Payment

1. Make sure both servers are running
2. Open http://localhost:3000
3. Login as learner
4. Try to enroll in paid course
5. Should work now!

## Why Two Servers?

- **Frontend (3000)**: React app, UI, user interactions
- **Backend (3001)**: Payment processing, XentriPay API calls, database operations
- **Proxy**: Vite forwards `/api/*` requests from 3000 to 3001

## Current Status

✅ Backend API server: RUNNING on port 3001
⏳ Frontend: Need to run `npm run dev` in another terminal

---

**Note:** This is your partner's architecture. Both servers are required for payments to work.

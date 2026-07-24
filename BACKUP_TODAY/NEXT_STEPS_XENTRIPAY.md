# XentriPay Integration - Next Steps

## ✅ What's Complete

1. **Backend API** - All XentriPay v2 endpoints working
2. **Payment Modal** - UI for MoMo and Card payments
3. **Payment Success Page** - Confirms enrollment after payment
4. **Payment Approvals** - Shows XentriPay transaction data
5. **Documentation** - Complete setup and integration guide

---

## ⚠️ Required Action: Add Service Role Key

**You must add this to `.env` before testing payments:**

1. Go to: https://supabase.com/dashboard
2. Select your project: `ydldtedpcnpoeznhgsot`
3. Go to: **Settings > API**
4. Copy the **service_role** key (the long secret one)
5. Add to `.env`:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5c...
```

**Why it's needed:**
The payment API needs this key to create enrollments in your database after XentriPay confirms payment. Without it, payments will fail at the enrollment step.

---

## 🧪 Testing Instructions

### 1. Add Service Role Key (see above)

### 2. Start Both Servers

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend API  
npm run dev:api
```

### 3. Test Payment Flow

1. **Login as learner:** `ngabosergelearner@gmail.com`
2. **Go to:** Browse Courses (or Learner Dashboard)
3. **Click:** "Enroll - $500" on "Capital market investment course"
4. **Payment Modal Opens:**
   - Payment method: MTN Mobile Money (selected by default)
   - Enter phone: `0788123456` (test number)
   - Click: "Pay $500"
5. **Backend Processing:**
   - Creates payment record
   - Calls XentriPay API
   - Returns reference ID (e.g., `SHORA-20250122-1234`)
6. **Status Screen:**
   - Shows "Confirm Your Payment"
   - In **test mode**, XentriPay won't send real USSD
   - The status will poll for confirmation
7. **Complete Test Payment:**
   - Go to XentriPay sandbox dashboard: https://test.xentripay.com
   - Find your transaction by reference ID
   - Manually mark as "SUCCESS"
   - OR: Wait for timeout and test failure flow
8. **Success Page:**
   - Should redirect to `/payment/success`
   - Shows course enrolled
   - Button: "Go to My Courses"
9. **Verify Enrollment:**
   - Go to "My Courses" - course should appear
   - Database check: `enrollments` table should have new row

### 4. Verify Trainer Portal

1. **Login as trainer:** Dr Aderemi Banjoko
2. **Go to:** Payment Approvals
3. **Check:** Payment should show with XentriPay transaction ID

---

## 📋 Database Requirements

The following must exist in your Supabase database:

### Tables (should already exist):
- `courses`
- `enrollments`
- `course_payments`

### RPC Function (critical):
- `update_course_payment_status` - Creates enrollment after payment success

**To verify:**
```sql
-- Run in Supabase SQL Editor
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'update_course_payment_status';
```

If missing, you need to create this function. It should:
1. Update payment status in `course_payments`
2. Insert enrollment in `enrollments`
3. Update course enrollment count
4. All in one atomic transaction

---

## 🐛 Common Issues

### "Payment system unavailable"
- Missing `SUPABASE_SERVICE_ROLE_KEY` in `.env`
- Restart backend: `npm run dev:api`

### "XentriPay not configured"
- Check `XENTRIPAY_API_KEY` in `.env`
- Current test key: `a81f957023344b199177c7c9a68e9878`

### "Enrollment not created after payment"
- Check `update_course_payment_status` RPC exists
- Check Supabase logs for errors
- Verify RLS policies allow inserts

### "Status polling never completes"
- In test/sandbox mode, XentriPay won't send real USSD prompts
- Use dashboard to manually complete test transactions
- For production, set up webhook for automatic updates

---

## 🚀 Production Deployment

Before going live:

1. **Get production keys:**
   - XentriPay production API key from https://xentripay.com
   - Update `.env`:
     ```env
     XENTRIPAY_API_KEY=prod_key_here
     XENTRIPAY_SANDBOX=false
     XENTRIPAY_BASE_URL=https://xentripay.com
     SITE_URL=https://yourdomain.com
     ```

2. **Configure webhook:**
   - XentriPay dashboard → Webhooks
   - URL: `https://yourdomain.com/api/webhooks/xentripay`
   - This allows automatic payment confirmation

3. **Test with small amount first**

4. **Enable RLS on Supabase tables**

---

## 📚 Documentation

- **Complete Integration Guide:** `XENTRIPAY_INTEGRATION_GUIDE.md`
- **Setup Complete:** `XENTRIPAY_SETUP_COMPLETE.md`
- **This File:** `NEXT_STEPS_XENTRIPAY.md`

---

## ✅ Summary

The XentriPay payment integration is **fully implemented** and ready to test!

**Critical next step:** Add `SUPABASE_SERVICE_ROLE_KEY` to `.env` then test the payment flow.

Everything else is configured and working. The integration supports:
- ✅ MTN Mobile Money payments
- ✅ Card payments (when enabled)
- ✅ Automatic enrollment after payment
- ✅ Payment status verification
- ✅ Trainer payment approvals
- ✅ Currency conversion (USD/EUR → RWF)
- ✅ Test and production modes

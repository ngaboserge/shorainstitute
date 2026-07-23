# Manual Payment Approval Flow - Implementation Complete ✅

## What Changed

The payment system now requires **trainer manual approval** instead of automatic enrollment after XentriPay confirms payment.

---

## New Payment Flow

### Before (Automatic):
```
Learner Pays → XentriPay Confirms → Auto-Enrolled → Can Access Course
```

### After (Manual Approval):
```
Learner Pays → XentriPay Confirms → Awaiting Approval → Trainer Approves → Can Access Course
```

---

## Payment Status Definitions

### For Learners:

| Status | Meaning | What Learner Sees |
|--------|---------|-------------------|
| **pending** | Payment initiated, waiting for XentriPay confirmation | "Confirming payment..." (polling) |
| **confirmed** | XentriPay confirmed payment, waiting for trainer approval | "Payment confirmed, awaiting trainer approval" |
| **approved** | Trainer approved, learner enrolled | "Enrolled! Start learning" |
| **rejected** | Payment failed or trainer rejected | "Payment failed" |

### For Trainers:

| Status | Meaning | Action Required |
|--------|---------|-----------------|
| **confirmed** | Payment confirmed by XentriPay | ⚠️ **Review and approve** |
| **pending** | Payment initiated, not yet confirmed | Wait for confirmation |
| **approved** | Already approved | No action needed |
| **rejected** | Payment failed or rejected | No action needed |

---

## Database Changes

### New Migration: `20260722000000_manual_payment_approval.sql`

**What it does:**

1. **Updates `update_course_payment_status` function:**
   - XentriPay success → Status = `'confirmed'` (not `'approved'`)
   - Creates enrollment with `payment_status='pending'`
   - Does NOT increment enrollment count yet

2. **Creates `approve_course_payment` function:**
   - Trainers call this to approve confirmed payments
   - Changes payment status: `'confirmed'` → `'approved'`
   - Changes enrollment status: `'pending'` → `'approved'`
   - Increments course enrollment count
   - Records who approved and when

3. **Adds index:**
   - Fast lookups for confirmed payments

---

## UI Changes

### PaymentSuccess.jsx (Learner Side)

**Before:**
- ✅ "Payment Successful! You are enrolled"
- Button: "Go to My Courses"

**After:**
- 🔵 "Payment Confirmed! Awaiting Trainer Approval"
- Button: "Go to Dashboard"
- Message: "You will receive course access once the trainer approves..."

**When trainer approves:**
- ✅ "Enrolled Successfully!"
- Button: "Go to My Courses"

### PaymentApprovals.jsx (Trainer Side)

**New Features:**

1. **"Awaiting Approval" tab** (default view)
   - Shows payments confirmed by XentriPay
   - Highlighted in blue
   - These need trainer action

2. **Updated Stats Cards:**
   - **Awaiting Approval** (blue) - Payments confirmed by XentriPay
   - **Payment Initiated** (yellow) - Waiting for XentriPay confirmation
   - **Approved** (green) - Already approved
   - **Total Revenue** - Only counts approved payments

3. **Status Badges:**
   - **Initiated** (yellow) - Payment pending at gateway
   - **Awaiting Approval** (blue) - XentriPay confirmed, needs review
   - **Approved** (green) - Trainer approved
   - **Rejected** (red) - Failed or denied

4. **Approve Button:**
   - Calls new `approve_course_payment` RPC
   - Enrolls learner immediately
   - Increments enrollment count

---

## How to Apply Changes

### Step 1: Run Migration

You need to run the new migration in your Supabase database:

**Option A: Using Supabase Dashboard (Recommended)**
1. Go to https://supabase.com/dashboard
2. Select your project: `ydldtedpcnpoeznhgsot`
3. Go to **SQL Editor**
4. Open: `supabase/migrations/20260722000000_manual_approval.sql`
5. Copy the entire contents
6. Paste into SQL Editor
7. Click **Run**

**Option B: Using Migration Script**
```bash
npm run db:migrate:payment
```

### Step 2: Verify Migration

Check that the new function exists:

```sql
-- Run in Supabase SQL Editor
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'approve_course_payment';
```

Should return: `approve_course_payment`

---

## Testing the New Flow

### As Learner:

1. **Start Payment:**
   - Browse Courses
   - Click "Enroll - $500" on paid course
   - Enter phone number
   - Click "Pay $500"

2. **XentriPay Confirms:**
   - Use XentriPay dashboard to mark as success
   - Should redirect to PaymentSuccess page

3. **See "Awaiting Approval":**
   - Message: "Payment confirmed, awaiting trainer approval"
   - Status: Blue info icon
   - Button: "Go to Dashboard"

4. **Check My Courses:**
   - Course should NOT appear yet
   - Need to wait for trainer approval

### As Trainer:

1. **Go to Payment Approvals**

2. **See Blue Badge:**
   - "Awaiting Approval (1)" tab is highlighted
   - Payment shows with blue "Awaiting Approval" badge

3. **Click Eye Icon:**
   - View payment details
   - See XentriPay transaction ID
   - See learner info

4. **Click Approve:**
   - Confirm approval
   - Enrollment created immediately

5. **Learner Gets Access:**
   - Course appears in learner's "My Courses"
   - Can start watching lessons

---

## Trainer Workflow

### Daily Routine:

1. **Check "Awaiting Approval" tab**
   - Shows all confirmed payments needing review
   - Default view when opening Payment Approvals

2. **Review each payment:**
   - Click eye icon to see details
   - Verify amount matches course price
   - Check XentriPay transaction ID

3. **Approve or Reject:**
   - **Approve:** Learner enrolled immediately
   - **Reject:** Add notes explaining why

4. **Approved payments:**
   - Move to "Approved" tab
   - Count toward total revenue

---

## Advantages of Manual Approval

### 1. **Fraud Protection**
- Trainer verifies each payment
- Can spot suspicious transactions
- Can reject if payment details don't match

### 2. **Quality Control**
- Ensures payments processed correctly
- Can handle edge cases manually
- Better for testing phase

### 3. **Flexibility**
- Can reject and refund if needed
- Can add notes for records
- Can communicate with learner before enrolling

### 4. **Peace of Mind**
- Test XentriPay integration safely
- No risk of wrongly enrolling learners
- Easy to switch to automatic later

---

## Switching to Automatic Later

When you're confident XentriPay is working perfectly:

### Option 1: Update Migration (Recommended)
Create new migration that changes `update_course_payment_status`:
- `'confirmed'` → `'approved'` (skip manual step)
- Enrollment with `payment_status='approved'`
- Increment enrollment count immediately

### Option 2: Keep Manual as Option
Add a course setting:
- `auto_enroll_on_payment` (boolean)
- Trainers can choose per course
- High-value courses: manual approval
- Low-value courses: automatic

---

## Database Schema Reference

### course_payments.status

```sql
status TEXT CHECK (status IN ('pending', 'confirmed', 'approved', 'rejected'))
```

- `'pending'` - Payment initiated, waiting for gateway
- `'confirmed'` - **NEW:** Gateway confirmed, awaiting trainer approval  
- `'approved'` - Trainer approved, learner enrolled
- `'rejected'` - Payment failed or trainer rejected

### enrollments.payment_status

```sql
payment_status TEXT DEFAULT 'pending' CHECK (
  payment_status IN ('free', 'pending', 'approved', 'rejected')
)
```

- `'free'` - Free course enrollment
- `'pending'` - **NEW:** Payment confirmed, awaiting approval
- `'approved'` - Paid and approved, has access
- `'rejected'` - Payment rejected

---

## Rollback (If Needed)

If you need to revert to automatic enrollment:

```sql
-- Revert to old behavior
CREATE OR REPLACE FUNCTION public.update_course_payment_status(
  p_reference_id TEXT,
  p_status TEXT,
  p_transaction_id TEXT DEFAULT NULL,
  p_callback_data JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payment RECORD;
  v_db_status TEXT;
BEGIN
  SELECT * INTO v_payment FROM public.course_payments
  WHERE reference_id = p_reference_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment not found');
  END IF;
  
  -- Auto-approve on success (OLD BEHAVIOR)
  v_db_status := CASE WHEN p_status = 'success' THEN 'approved' ELSE 'rejected' END;
  
  UPDATE public.course_payments
  SET status = v_db_status, transaction_id = p_transaction_id, approved_at = now()
  WHERE reference_id = p_reference_id;
  
  IF v_db_status = 'approved' THEN
    INSERT INTO public.enrollments (user_id, course_id, payment_id, payment_status, enrolled_at)
    VALUES (v_payment.user_id, v_payment.course_id, v_payment.id, 'approved', now());
    
    UPDATE public.courses SET enrollment_count = COALESCE(enrollment_count, 0) + 1
    WHERE id = v_payment.course_id;
  END IF;
  
  RETURN jsonb_build_object('success', true, 'status', v_db_status, 'enrolled', true);
END;
$$;
```

---

## Summary

✅ **Manual approval flow implemented!**

**Benefits:**
- Safe testing of XentriPay integration
- Fraud protection
- Quality control
- Flexibility for edge cases

**How it works:**
1. Learner pays → XentriPay confirms
2. Payment status: `'confirmed'` (not auto-approved)
3. Trainer sees in "Awaiting Approval" tab
4. Trainer clicks approve → Learner enrolled

**Next step:** Run the migration in Supabase SQL Editor!

File: `supabase/migrations/20260722000000_manual_payment_approval.sql`

# Paid Courses - Quick Testing Guide 🧪

## Ready to Test!

The paid courses system is fully implemented. Follow this guide to test the complete workflow.

---

## 🎯 Test Scenario 1: Create a Paid Course

**As Trainer** (ngabosergetrainer@gmail.com):

1. **Login** to trainer portal
2. **Navigate** to Dashboard → Click "Create Course"
3. **Fill course details**:
   - Title: "Advanced Financial Planning"
   - Description: (at least 50 characters)
   - Category: Select any
   - Level: Intermediate
4. **Enable Paid Course**:
   - ✅ Check "This is a paid course"
   - Set Price: `50000`
   - Currency: `RWF`
5. **Add Learning Objectives**: Add at least one
6. **Upload Thumbnail**: Optional
7. **Click** "Save & Continue to Lessons"
8. **Result**: Course created as paid course

---

## 🎯 Test Scenario 2: Learner Browses and Sees Pricing

**As Learner** (ngabosergelearner@gmail.com):

1. **Login** to learner portal
2. **Navigate** to "Browse Courses"
3. **Verify**:
   - Free courses show **"FREE"** badge (green, bottom-left)
   - Paid courses show **price badge** (yellow, bottom-right)
   - Example: "FRw 50,000" on your new course
4. **Check enroll button**:
   - Free course: "Enroll Free"
   - Paid course: "Enroll - FRw 50,000"

---

## 🎯 Test Scenario 3: Submit Payment

**As Learner** (continue):

1. **Click** "Enroll - FRw 50,000" on paid course
2. **Payment Modal Opens**:
   - Shows course title and price
   - Payment instructions displayed
3. **Fill Payment Form**:
   - Payment Method: Select "Bank Transfer" or "Mobile Money"
   - Transaction Reference: `TXN123456789`
   - Payment Proof URL: (optional) `https://example.com/receipt.jpg`
   - Notes: (optional) "Paid via MTN Mobile Money"
4. **Click** "Submit Payment"
5. **Result**: 
   - ✅ Success message appears
   - Modal closes
   - You're redirected or see confirmation

---

## 🎯 Test Scenario 4: Trainer Reviews Payment

**As Trainer** (ngabosergetrainer@gmail.com):

1. **Navigate** to "Payment Approvals" in sidebar (new menu item with 💰 icon)
2. **View Dashboard**:
   - **Stats Cards**:
     - Pending Review: 1
     - Approved: 0
     - Rejected: 0
     - Total Revenue: $0.00
3. **See Payment in Table**:
   - Learner email shown
   - Course name shown
   - Amount: FRw 50,000
   - Method: bank_transfer
   - Reference: TXN123456789
   - Status: Pending
4. **Click** "View Details" (eye icon)
5. **Review Payment Details**:
   - Learner information
   - Course information
   - Payment proof link (if provided)
   - Learner notes

---

## 🎯 Test Scenario 5: Approve Payment

**As Trainer** (continue in details modal):

1. **Add Admin Notes** (optional): "Payment verified. Welcome to the course!"
2. **Click** "Approve & Enroll" button (green)
3. **Confirm** in alert dialog
4. **Result**:
   - ✅ Success message: "Payment approved! Learner has been enrolled automatically."
   - Modal closes
   - Payment status changes to "Approved"
   - Stats update: Approved: 1, Pending: 0

---

## 🎯 Test Scenario 6: Verify Learner Enrollment

**As Learner** (ngabosergelearner@gmail.com):

1. **Navigate** to "My Learning"
2. **Verify**:
   - Course appears in "In Progress" tab
   - Progress: 0%
   - Can click "Continue Learning"
3. **Click** "Continue Learning"
4. **Result**: Can now access course lessons

---

## 🎯 Test Scenario 7: Test Rejection (Optional)

**As Trainer**:

1. Have learner submit another payment
2. In Payment Approvals, click "Reject" (X icon)
3. Enter rejection reason: "Transaction ID not found"
4. **Result**: Payment marked as rejected

**As Learner**:
- Cannot access course
- Status shows rejected

---

## 🔍 What to Check

### ✅ Trainer Side:
- [ ] Can create paid courses with pricing
- [ ] Can create free courses (is_paid unchecked)
- [ ] Payment Approvals menu item visible
- [ ] Can see pending payments
- [ ] Can view payment details
- [ ] Can approve payments
- [ ] Can reject payments with reason
- [ ] Stats update correctly

### ✅ Learner Side:
- [ ] See FREE badge on free courses
- [ ] See price badge on paid courses
- [ ] Can enroll in free courses instantly
- [ ] Payment modal opens for paid courses
- [ ] Can fill and submit payment form
- [ ] See pending status after submission
- [ ] Can access course after approval
- [ ] Cannot access course if rejected

### ✅ Edge Cases:
- [ ] Cannot submit payment without transaction reference
- [ ] Cannot enroll twice in same course
- [ ] Pending payment shows appropriate message
- [ ] Price displays correctly in all currencies

---

## 🐛 Troubleshooting

**Payment not showing in Trainer dashboard?**
- Check that you're logged in as the course instructor
- Verify payment was submitted successfully
- Check browser console for errors

**Cannot enroll after approval?**
- Check database: `enrollments` table should have entry
- Verify `payment_status` is 'approved'
- Check for RLS issues in Supabase

**Modal not opening?**
- Check browser console for import errors
- Verify PaymentModal.jsx and PaymentModal.css exist
- Check that course has `is_paid: true` and `price > 0`

---

## 📊 Database Verification

Run these SQL queries in Supabase to verify data:

```sql
-- Check course pricing
SELECT id, title, is_paid, price, currency FROM courses;

-- Check payment submissions
SELECT * FROM course_payments ORDER BY created_at DESC;

-- Check enrollments
SELECT * FROM enrollments WHERE payment_required = true;
```

---

## ✅ Success Criteria

The system is working correctly when:

1. ✅ Trainer can create paid and free courses
2. ✅ Learner sees different badges for paid/free courses
3. ✅ Payment modal opens for paid courses
4. ✅ Payment submission creates entry in database
5. ✅ Trainer sees payment in approval dashboard
6. ✅ Trainer can approve payment
7. ✅ Learner is auto-enrolled on approval
8. ✅ Learner can access course after enrollment

---

**Happy Testing! 🎉**

If you encounter any issues, check:
1. Browser console for JavaScript errors
2. Supabase logs for database errors
3. Network tab for failed API calls

**Ready for Stripe Integration Later** 💳

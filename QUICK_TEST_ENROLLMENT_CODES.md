# Quick Test: Enrollment Codes System

## 🚀 5-Minute Test Guide

### Step 1: Generate Codes (As Admin)

1. **Login** as institutional admin
2. **Navigate** to sidebar → Click **"Enrollment Codes"**
   - URL: `http://localhost:3000/institutional/enrollment-codes`
3. **Click** "Generate Codes" button (top right)
4. **Select** a course from dropdown
5. **Enter** quantity: `5`
6. **Click** "Generate Codes"
7. **Result**: Should see 5 codes in format `INST-XXXX-XXXX-XXXX`
8. **Copy** one code (click copy button)

---

### Step 2: Redeem Code (As Employee/Learner)

1. **Login** as learner (or signup new learner account)
2. **Navigate** to sidebar → Click **"Redeem Code"**
   - URL: `http://localhost:3000/learner/redeem-code`
3. **Paste** the code from Step 1
4. **Click** "Validate Code"
5. **Fill** verification form:
   - Employee ID: `EMP-001`
   - Department: `Finance`
   - Job Title: `Analyst`
6. **Click** "Submit Request"
7. **Result**: Should see success message "Request Submitted Successfully!"

---

### Step 3: Approve Redemption (As Admin)

1. **Switch back** to admin account
2. **Navigate** to sidebar → Click **"Code Redemptions"**
   - URL: `http://localhost:3000/institutional/code-redemptions`
3. **Should see**: Pending request from learner in Step 2
4. **Review**: Employee details (name, email, ID, department, job title)
5. **Click** "Approve" button
6. **Result**: Should see "Request approved successfully!" message

---

### Step 4: Verify Enrollment (As Learner)

1. **Switch back** to learner account
2. **Navigate** to sidebar → Click **"My Learning"**
   - URL: `http://localhost:3000/learner/courses`
3. **Should see**: Course appears in dashboard
4. **Click** course card
5. **Result**: Should access course lessons

---

### Step 5: Verify Progress Tracking (As Admin)

1. **Switch back** to admin account
2. **Navigate** to sidebar → Click **"Assignments"**
   - URL: `http://localhost:3000/institutional/assignments`
3. **Should see**: New enrollment from code redemption
4. **Verify**: Employee name displays correctly (not "Employee User...")
5. **Check**: Progress shows 0% (not started yet)

---

## ✅ Expected Results

After completing all 5 steps:

### In Admin Portal:

**Enrollment Codes Page**:
- Shows 1 purchase
- Shows 5 codes generated
- Shows 1 code redeemed
- Shows 4 codes remaining
- Redemption rate: 20%

**Code Redemptions Page**:
- Pending tab: 0 requests
- Approved tab: 1 request
- Shows employee details

**Assignments Page**:
- Shows enrollment from code redemption
- Employee name displays correctly
- Status: "Not Started" or "Enrolled"
- Progress: 0%

### In Learner Portal:

**My Learning Page**:
- Course appears in list
- Can click to access lessons
- Shows course thumbnail and details

**Redeem Code Page**:
- Can see previous redemption succeeded
- Can redeem another code

---

## 🐛 If Something Goes Wrong

### Code doesn't validate
**Check**: 
- Format is `INST-XXXX-XXXX-XXXX`
- Code exists in database
- Code status is "active" (not "redeemed")

**SQL Query**:
```sql
SELECT * FROM institution_enrollment_codes 
WHERE code = 'YOUR-CODE-HERE';
```

### Approval doesn't create enrollment
**Check**:
- Database trigger exists: `auto_approve_redemption()`
- Check `learner_institutional_enrollments` table

**SQL Query**:
```sql
SELECT * FROM learner_institutional_enrollments 
WHERE learner_id = (
  SELECT id FROM institution_learners 
  WHERE user_id = 'LEARNER-USER-ID'
);
```

### Course doesn't appear after approval
**Check**:
- Learner is logged in with correct account
- Enrollment record exists (query above)
- Learner record exists

**SQL Query**:
```sql
SELECT * FROM institution_learners 
WHERE user_id = 'LEARNER-USER-ID';
```

### Employee name shows as "Employee User..."
**Fixed in previous update!** Should now show:
1. Email from invitation, OR
2. Email from pending assignment, OR
3. Learner ID as fallback

---

## 🎯 Success Criteria

You know it's working when:

✅ Admin can generate codes  
✅ Codes have format `INST-XXXX-XXXX-XXXX`  
✅ Learner can redeem code  
✅ Redemption request appears in admin dashboard  
✅ Admin can approve request  
✅ Course appears in learner dashboard after approval  
✅ Employee name displays correctly in assignments  
✅ Progress tracking works (test by completing lessons)  
✅ Statistics update correctly (codes redeemed, redemption rate)  

---

## 📊 Where Everything Lives

### Admin Pages:
- `/institutional/enrollment-codes` - Generate and manage codes
- `/institutional/code-redemptions` - Approve/reject requests
- `/institutional/assignments` - View all enrollments (both systems)

### Learner Pages:
- `/learner/redeem-code` - Redeem enrollment codes
- `/learner/courses` - View enrolled courses

### Database Tables:
- `institution_course_purchases` - Bulk purchases
- `institution_enrollment_codes` - Generated codes
- `code_redemption_requests` - Pending approvals
- `institution_learners` - Employee records
- `learner_institutional_enrollments` - Course enrollments

---

## 🔀 Bonus: Test Both Systems Together

### Test Direct Assignment (System A):
1. Go to `/institutional/assign-course`
2. Enter employee email and course
3. Click "Assign Course"
4. Copy invitation link
5. Open link in browser
6. Employee auto-enrolled (no approval needed)

### Test Enrollment Codes (System B):
1. Go to `/institutional/enrollment-codes`
2. Generate codes
3. Learner redeems code
4. Admin approves request
5. Employee enrolled after approval

### Verify Both Show in Assignments:
1. Go to `/institutional/assignments`
2. Should see BOTH enrollments
3. Each as separate row
4. Different "Invitation Link" vs "Active Enrollment" status

---

Ready to test! 🚀

**Time to complete**: ~5 minutes  
**Difficulty**: Easy  
**Result**: Fully working enrollment code system!

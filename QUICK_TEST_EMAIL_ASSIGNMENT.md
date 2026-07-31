# Quick Test Guide: Email-Based Course Assignment

## 🚀 5-Minute Test

### Step 1: Run Migration (2 minutes)

1. Open Supabase Dashboard: https://ydldtedpcnpoeznhgsot.supabase.co
2. Go to **SQL Editor** (left sidebar)
3. Click **+ New Query**
4. Open `migrations/20260728000002_email_based_course_assignment.sql`
5. Copy entire content
6. Paste in SQL Editor
7. Click **Run** (or Ctrl+Enter)
8. Wait for green success message ✅

### Step 2: Verify Migration (30 seconds)

Run this in SQL Editor:

```sql
-- Check table exists
SELECT COUNT(*) FROM pending_course_assignments;

-- Check function exists
SELECT check_employee_exists('test-id', 'test@test.com');

-- Should return results without errors
```

### Step 3: Test UI (2 minutes)

1. Start dev server if not running:
   ```
   npm run dev
   ```

2. Login as institutional admin:
   - Go to: http://localhost:3000/auth/institutional/login
   - Login with your institutional admin account

3. Navigate to course assignment:
   - Go to **Programmes** or **Learners** page
   - Click **"Assign Course"** button

4. Test email-based assignment:
   - Select a course
   - Choose **"By Email (Like Coursera)"** from "Assign To" dropdown
   - Enter a test email in the input field
   - Click **"Add"**
   - Watch the status badge appear (existing vs new)

### Step 4: Test Complete Flow (1 minute)

**Test A: Existing Employee**
```
1. Enter email of existing employee
2. See "✓ Has Account" badge
3. Assign course
4. Check employee's dashboard - course should appear immediately
```

**Test B: New Employee**
```
1. Enter email of non-existing employee
2. See "ⓘ Will Send Invitation" badge
3. Optionally fill employee details (name, employee ID, etc.)
4. Assign course
5. Check Supabase:
   - Query: SELECT * FROM pending_course_assignments;
   - Should see new record
   - Query: SELECT * FROM learner_invitations WHERE email = 'your-email';
   - Should see invitation created
```

## 🧪 Detailed Test Scenarios

### Scenario 1: Existing Employee (30 seconds)

```javascript
// In AssignProgrammeModal:
1. Select course: "Financial Planning 101"
2. Choose "By Email"
3. Enter: "john.doe@company.com" (existing employee)
4. Click "Add"
5. ✅ Should show: "✓ Has Account" badge
6. Set start date: Today
7. Mark as "Mandatory"
8. Click "Assign to 1 Employee"
9. Success! ✅

// Verify:
- John's dashboard should show new course immediately
- Course should have badges: Institution name, Mandatory
- Notification should be sent
```

### Scenario 2: New Employee (1 minute)

```javascript
// In AssignProgrammeModal:
1. Select course: "Financial Planning 101"
2. Choose "By Email"
3. Enter: "newemployee@company.com" (doesn't exist)
4. Click "Add"
5. ✅ Should show: "ⓘ Will Send Invitation" badge
6. Fill optional fields:
   - Full Name: "Jane Smith"
   - Employee ID: "EMP-123"
   - Department: "Finance"
   - Job Title: "Financial Analyst"
7. Set start date: Tomorrow
8. Mark as "Mandatory"
9. Add message: "Welcome to the team! Complete this by end of week."
10. Click "Assign to 1 Employee"
11. Success! ✅

// Verify in Supabase SQL Editor:
SELECT * FROM pending_course_assignments 
WHERE employee_email = 'newemployee@company.com';
-- Should return 1 record

SELECT * FROM learner_invitations 
WHERE email = 'newemployee@company.com';
-- Should return 1 invitation
```

### Scenario 3: Mixed Batch (2 minutes)

```javascript
// In AssignProgrammeModal:
1. Select course: "Compliance Training"
2. Choose "By Email"
3. Enter emails one by one:
   - "existing1@company.com" → ✓ Has Account
   - "existing2@company.com" → ✓ Has Account
   - "new1@company.com" → ⓘ Will Send Invitation
   - "existing3@company.com" → ✓ Has Account
   - "new2@company.com" → ⓘ Will Send Invitation
4. Should show: "5 employees (3 existing, 2 new)"
5. Click "Assign to 5 Employees"
6. Success! ✅

// Verify:
- 3 existing employees see course immediately
- 2 pending assignments created
- 2 invitations sent (or reused if already invited)

// Check in SQL:
SELECT 
  assignment_type,
  COUNT(*) as count
FROM institution_all_course_assignments
WHERE institution_id = 'your-institution-id'
  AND course_id = 'selected-course-id'
GROUP BY assignment_type;
-- Should show: pending (2), active (3)
```

### Scenario 4: Test Auto-Assignment (3 minutes)

```javascript
// 1. Create pending assignment (from Scenario 2)
// 2. Go to invitation acceptance page

// Open in browser:
// Get invitation token from database:
SELECT invitation_token 
FROM learner_invitations 
WHERE email = 'newemployee@company.com';

// Then visit:
http://localhost:3000/invitation/accept?token=YOUR_TOKEN_HERE

// 3. Complete signup:
- Enter full name: "Jane Smith"
- Create password: "SecurePass123"
- Click "Create Account & Join"

// 4. Should redirect to dashboard

// 5. Verify course appears:
- Go to /learner/courses
- Should see "Financial Planning 101"
- Should have badges:
  - 🏢 Company name
  - ⚠️ Mandatory
  - 📧 Email Assigned

// 6. Check database:
SELECT * FROM learner_institutional_enrollments
WHERE learner_id = (
  SELECT id FROM institution_learners 
  WHERE user_id = (SELECT id FROM auth.users WHERE email = 'newemployee@company.com')
);
-- Should return enrollment record

SELECT status FROM pending_course_assignments
WHERE employee_email = 'newemployee@company.com';
-- Should return: 'assigned'
```

## 🐛 Debugging

### Check if migration ran

```sql
-- Tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'pending_course_assignments';

-- Triggers
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name LIKE '%pending%' OR trigger_name LIKE '%invitation%';

-- Functions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN (
  'check_employee_exists',
  'auto_assign_pending_courses',
  'ensure_invitation_for_pending_assignment'
);
```

### Check if email check works

```sql
-- Test with known email
SELECT * FROM check_employee_exists(
  'your-institution-id',
  'known-employee@company.com'
);
-- Should return: exists = true, learner_id, user_id, full_name
```

### Check pending assignments

```sql
SELECT 
  employee_email,
  status,
  invitation_id,
  course_id,
  created_at
FROM pending_course_assignments
WHERE institution_id = 'your-institution-id'
ORDER BY created_at DESC
LIMIT 10;
```

### Check invitations

```sql
SELECT 
  email,
  status,
  invitation_token,
  expires_at,
  created_at
FROM learner_invitations
WHERE institution_id = 'your-institution-id'
ORDER BY invited_at DESC
LIMIT 10;
```

### Check auto-assignment worked

```sql
-- After employee accepts invitation
SELECT 
  lie.course_id,
  lie.status,
  lie.enrolled_via,
  pca.status as pending_status
FROM learner_institutional_enrollments lie
JOIN pending_course_assignments pca ON lie.course_id = pca.course_id
WHERE lie.learner_id = 'employee-learner-id';
-- pending_status should be 'assigned'
```

## ✅ Success Criteria

Your system is working correctly if:

- ✅ Migration runs without errors
- ✅ Email input field appears in "By Email" mode
- ✅ Email checking returns correct status badges
- ✅ Existing employees get courses immediately
- ✅ New employees create pending assignments
- ✅ Invitations are created/reused correctly
- ✅ Auto-assignment trigger fires on signup
- ✅ Courses appear in employee dashboard
- ✅ All tracking data is captured

## 🚨 Common Issues

### Issue 1: "check_employee_exists function not found"

**Solution**:
```sql
-- Re-run this part of migration:
CREATE OR REPLACE FUNCTION check_employee_exists(
  p_institution_id UUID,
  p_email TEXT
)
RETURNS TABLE (
  exists BOOLEAN,
  learner_id UUID,
  user_id UUID,
  full_name TEXT,
  has_account BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    true as exists,
    il.id as learner_id,
    il.user_id,
    p.full_name,
    true as has_account
  FROM institution_learners il
  JOIN auth.users u ON il.user_id = u.id
  JOIN profiles p ON il.user_id = p.id
  WHERE il.institution_id = p_institution_id
    AND u.email = p_email
    AND il.status = 'active'
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::UUID, NULL::TEXT, false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Issue 2: Auto-assignment not triggering

**Solution**:
```sql
-- Check trigger is enabled
SELECT * FROM pg_trigger 
WHERE tgname = 'trigger_auto_assign_pending_courses';

-- If not found, re-create:
CREATE TRIGGER trigger_auto_assign_pending_courses
  AFTER INSERT ON institution_learners
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_pending_courses();
```

### Issue 3: Email badge not showing

**Solution**:
- Check browser console for errors
- Verify `checkEmployeeEmails()` function in AssignProgrammeModal.jsx
- Verify Supabase RPC call is working
- Check network tab for failed requests

## 📊 Test Data

### Create Test Institution

```sql
INSERT INTO institutions (id, name, total_seats, used_seats)
VALUES (
  'test-inst-123',
  'Test Company Inc',
  100,
  5
);
```

### Create Test Course

```sql
INSERT INTO courses (id, title, trainer_id, status, price)
VALUES (
  'test-course-123',
  'Test Course: Email Assignment',
  'trainer-id',
  'published',
  10000
);
```

### Create Test Employee

```sql
-- 1. Create auth user (do this via Supabase Dashboard → Authentication → Users)
-- Or use signup endpoint

-- 2. Add to institution
INSERT INTO institution_learners (
  institution_id,
  user_id,
  employee_id,
  status
) VALUES (
  'test-inst-123',
  'user-id-from-auth',
  'EMP-001',
  'active'
);
```

## 🎯 Quick Checklist

Before marking as complete, verify:

- [ ] Migration ran successfully
- [ ] All tables created
- [ ] All triggers active
- [ ] All functions work
- [ ] UI shows "By Email" option
- [ ] Email input works
- [ ] Status badges display correctly
- [ ] Existing employee assignment works
- [ ] New employee invitation works
- [ ] Auto-assignment triggers
- [ ] Courses appear in dashboard
- [ ] Notifications sent
- [ ] No console errors

## 🎉 You're Done!

If all tests pass, you have a fully functional **enterprise-grade email-based course assignment system**! 🚀

---

**Next Steps**:
1. Test with real data
2. Train admins on new feature
3. Monitor for issues
4. Collect feedback
5. Iterate based on usage

**Documentation**: See `EMAIL_INVITATION_SYSTEM.md` for complete details

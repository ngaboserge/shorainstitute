# Final Test Checklist - Assignment System

## ✅ Pre-Test Verification

Run these checks in Supabase SQL Editor first:

### 1. Verify Trigger Exists and is Enabled
```sql
SELECT 
  t.tgname as trigger_name,
  CASE t.tgenabled
    WHEN 'O' THEN '✅ ENABLED'
    WHEN 'D' THEN '❌ DISABLED'
  END as status,
  c.relname as table_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE t.tgname = 'trigger_auto_assign_pending_courses';
```
**Expected**: Shows "✅ ENABLED" on table "institution_learners"

### 2. Check RLS Status
```sql
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '❌ ENABLED' ELSE '✅ DISABLED' END as rls_status
FROM pg_tables 
WHERE tablename IN (
  'pending_course_assignments',
  'learner_invitations',
  'institution_learners',
  'learner_institutional_enrollments'
)
AND schemaname = 'public';
```
**Expected**: All should show "✅ DISABLED" for testing

### 3. Verify Tables Exist
```sql
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN (
  'pending_course_assignments',
  'learner_invitations',
  'institution_learners',
  'learner_institutional_enrollments',
  'enrollments',
  'lesson_progress'
)
ORDER BY table_name;
```
**Expected**: All 6 tables exist with column counts

---

## 🧪 Test Plan (15 Minutes Total)

### Test 1: New Employee Assignment (5 min)

#### Admin Side:
1. **Login** as institutional admin
2. **Navigate** to `/institutional/assign-course`
3. **Select** any free course from the list
4. **Enter** new employee details:
   - Email: `test.learner.$(date +%s)@example.com` (use unique email)
   - Name: `Test Learner`
   - Optional: Department, Job Title
5. **Click** "Assign Course"
6. **Verify** success message appears
7. **Navigate** to `/institutional/assignments`
8. **Verify** assignment appears in table with:
   - ✅ Status: "Pending Invitation" (yellow badge)
   - ✅ "Copy Link" button visible
   - ✅ Short code displayed
9. **Copy** the invitation link

#### Database Check (Optional):
```sql
-- Check pending assignment was created
SELECT 
  employee_email,
  status,
  invitation_id IS NOT NULL as has_invitation
FROM pending_course_assignments
ORDER BY created_at DESC
LIMIT 1;
```
**Expected**: status = 'pending', has_invitation = true

#### Employee Side:
10. **Open** invitation link in **incognito/private window**
11. **Verify** invitation page shows:
    - ✅ Institution name
    - ✅ Employee email (pre-filled)
    - ✅ "Create Account" and "Sign In" tabs
12. **Click** "Create Account" tab
13. **Fill in**:
    - Full Name: `Test Learner`
    - Password: `TestPassword123!`
    - Confirm Password: `TestPassword123!`
14. **Click** "Create Account & Join"
15. **Verify** redirects to `/learner/courses` (NOT /learner/seminars)
16. **Verify** success message appears: "Your assigned courses are ready"
17. **Verify** course card appears with:
    - ✅ Course title and thumbnail
    - ✅ Green badge showing institution name
    - ✅ "Continue Learning" button
    - ✅ Progress shows "0 of X lessons • 0%"

#### Database Check (Optional):
```sql
-- Check trigger fired and enrollment was created
SELECT 
  pca.employee_email,
  pca.status as assignment_status,
  pca.assigned_at,
  lie.id as enrollment_id,
  lie.status as enrollment_status,
  lie.enrolled_via
FROM pending_course_assignments pca
LEFT JOIN learner_institutional_enrollments lie ON pca.assigned_enrollment_id = lie.id
ORDER BY pca.created_at DESC
LIMIT 1;
```
**Expected**: assignment_status = 'assigned', enrollment_id exists, enrolled_via = 'direct_assignment'

---

### Test 2: Access Course Content (3 min)

1. **As learner**, click "Continue Learning" on course card
2. **Verify** redirects to `/learner/courses/{courseId}/lesson/{lessonId}`
3. **Verify** page loads with:
   - ✅ Course title in header
   - ✅ Lesson title
   - ✅ Video player OR content area
   - ✅ Lesson sidebar with all lessons listed
   - ✅ "Mark as Complete" button
4. **Check browser console** (F12 > Console)
5. **Verify** log shows: `✅ User has access to course`
6. **Verify** log shows: `✅ Accessing course via institutional enrollment` (if institutional)

#### Database Check (Optional):
```sql
-- Check last_accessed_at was updated
SELECT 
  lie.course_id,
  lie.last_accessed_at,
  lie.status,
  NOW() - lie.last_accessed_at as time_since_access
FROM learner_institutional_enrollments lie
JOIN institution_learners il ON lie.learner_id = il.id
JOIN auth.users u ON il.user_id = u.id
WHERE u.email = 'your.test.email@example.com'
ORDER BY lie.last_accessed_at DESC
LIMIT 1;
```
**Expected**: last_accessed_at is very recent (< 1 minute), status changed to 'in_progress'

---

### Test 3: Progress Tracking (5 min)

1. **As learner**, on lesson page, click "Mark as Complete"
2. **Verify** button changes or shows success
3. **Verify** browser console shows:
   - ✅ `📊 Progress calculation: 1/X = Y%`
   - ✅ `✅ Institutional enrollment progress updated`
4. **Navigate** back to `/learner/courses`
5. **Verify** course card shows:
   - ✅ Progress updated: "1 of X lessons • Y%"
   - ✅ Progress bar fills accordingly
   - ✅ "Next up" shows second lesson
6. **As admin**, go to `/institutional/assignments`
7. **Verify** assignment row shows:
   - ✅ Status badge: "In Progress (Y%)"
   - ✅ Progress bar matches learner's progress
   - ✅ Last accessed time is recent

#### Database Check (Optional):
```sql
-- Check progress was recorded in both tables
SELECT 
  'lesson_progress' as table_name,
  COUNT(*) as completed_lessons
FROM lesson_progress lp
JOIN auth.users u ON lp.user_id = u.id
WHERE u.email = 'your.test.email@example.com'
AND lp.completed = true
UNION ALL
SELECT 
  'institutional_enrollment' as table_name,
  lie.progress_percentage as completed_lessons
FROM learner_institutional_enrollments lie
JOIN institution_learners il ON lie.learner_id = il.id
JOIN auth.users u ON il.user_id = u.id
WHERE u.email = 'your.test.email@example.com';
```
**Expected**: lesson_progress shows 1+ record, institutional_enrollment shows matching percentage

---

### Test 4: Complete Multiple Lessons (2 min)

1. **As learner**, complete 2-3 more lessons
2. **Verify** progress updates after each completion
3. **Verify** console logs show updates
4. **Check** `/institutional/assignments` periodically
5. **Verify** admin sees progress increasing

---

### Test 5: Existing Employee Assignment (Optional, 3 min)

1. **As admin**, assign another course to THE SAME employee email
2. **As learner**, refresh `/learner/courses`
3. **Verify** second course appears immediately (no invitation needed)
4. **Verify** both courses have independent progress tracking

---

## 🐛 Troubleshooting Guide

### Issue: "Assignment showing 0 data"
**Checks**:
- [ ] institutionId is correct in admin session
- [ ] RLS is disabled on all tables
- [ ] Browser console shows no errors
- [ ] SQL query returns data

**Fix**: Run `DIAGNOSE_ASSIGNMENT_WORKFLOW.sql` to check database state

---

### Issue: "Learner doesn't see assigned course"
**Checks**:
- [ ] Trigger fired (pending_course_assignments.status = 'assigned')
- [ ] Enrollment created (learner_institutional_enrollments has record)
- [ ] Browser console shows: "✅ User has access to course"

**Console Logs to Check**:
```
✅ Loading profile for user: {user_id}
🔍 Fetching assignments for institution: {institution_id}
✅ User has access to course
```

**Fix**: 
1. Check trigger status (see Pre-Test Verification)
2. Check learner_institutional_enrollments table
3. Verify Courses.jsx is querying both enrollment tables

---

### Issue: "Can't access course content (403 or no access)"
**Checks**:
- [ ] loadAllData() checks both enrollment tables
- [ ] Console shows: "✅ Accessing course via institutional enrollment"
- [ ] RLS disabled on learner_institutional_enrollments

**Fix**: Check CourseLesson.jsx console logs

---

### Issue: "Progress not updating for admin"
**Checks**:
- [ ] updateEnrollmentProgress() updates both tables
- [ ] Console shows: "✅ Institutional enrollment progress updated"
- [ ] Assignments.jsx queries learner_institutional_enrollments

**Console Logs to Check**:
```
📊 Progress calculation: X/Y = Z%
✅ Regular enrollment progress updated
✅ Institutional enrollment progress updated
```

**Fix**: Check CourseLesson.jsx updateEnrollmentProgress() function

---

### Issue: "Trigger not firing"
**Checks**:
- [ ] Trigger exists and enabled (see Pre-Test Verification #1)
- [ ] institution_learner record was created
- [ ] pending_course_assignments has matching record

**Fix**: Run `TEST_TRIGGER_MANUALLY.sql` to test trigger

---

## 📊 Success Metrics

After testing, all these should be ✅:

### Database State:
- [ ] pending_course_assignments: status = 'assigned'
- [ ] learner_invitations: status = 'accepted'
- [ ] institution_learners: user linked to institution
- [ ] learner_institutional_enrollments: enrollment created
- [ ] lesson_progress: lessons marked complete

### Frontend State:
- [ ] Admin sees assignment in dashboard
- [ ] Admin sees progress updates in real-time
- [ ] Learner sees course with company badge
- [ ] Learner can access all lessons
- [ ] Progress tracking works for learner
- [ ] Both sides show matching progress

### User Experience:
- [ ] Invitation link works
- [ ] Redirect goes to /learner/courses
- [ ] Course appears automatically
- [ ] Lessons load without errors
- [ ] Progress updates smoothly
- [ ] No console errors

---

## 🎉 Test Complete!

If all checks pass:
- ✅ Assignment system works end-to-end
- ✅ Trigger fires correctly
- ✅ Progress tracking is synchronized
- ✅ Admin and learner views are accurate
- ✅ Ready for production use!

If any checks fail:
1. Review the specific troubleshooting section
2. Check browser console for errors
3. Run diagnostic SQL queries
4. Review `FIXES_APPLIED.md` for recent changes
5. Check `ASSIGNMENT_WORKFLOW_COMPLETE.md` for workflow details

---

## 📝 Post-Test Actions

### If Everything Works:
1. Document any edge cases discovered
2. Create test accounts for demo purposes
3. Consider re-enabling RLS with proper policies
4. Plan for email notification integration

### If Issues Found:
1. Document the exact steps to reproduce
2. Check browser console for error messages
3. Run diagnostic queries to check database state
4. Review recent code changes
5. Contact support with detailed logs

---

## 🔄 Regression Testing Checklist

When making future changes, re-test:
- [ ] Assignment creation (admin side)
- [ ] Invitation acceptance (employee side)
- [ ] Course access (lesson loading)
- [ ] Progress tracking (both sides)
- [ ] Multiple assignments to same employee
- [ ] Assignment to existing employee

---

**Good luck with testing! 🚀**

For detailed workflow documentation, see:
- `README_ASSIGNMENT_SYSTEM.md` - Quick start
- `ASSIGNMENT_WORKFLOW_COMPLETE.md` - Detailed workflow
- `WORKFLOW_VISUAL_GUIDE.md` - Visual diagrams

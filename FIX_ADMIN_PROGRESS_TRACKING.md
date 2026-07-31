# Fix: Admin Can't See Progress & Multiple Courses

## Issues Fixed

### Issue 1: Admin can't see learner progress
**Problem**: When learner completes lessons, progress doesn't show in `/institutional/assignments`

**Root Cause**: 
- Query was trying to use foreign key relationships
- Wasn't properly matching pending assignments with active enrollments

**Fix Applied**: Updated `Assignments.jsx` to:
1. Query enrollments without JOIN (work around missing foreign keys)
2. Fetch course and learner details separately
3. Match pending assignments with enrollments using `assigned_enrollment_id`
4. Show progress from enrollment record

### Issue 2: Only showing one course per learner
**Problem**: Admin assigned 2 courses to same email, but dashboard only shows 1

**Root Cause**:
- Pending assignments were being deduplicated incorrectly
- Each assignment should be shown separately

**Fix Applied**: 
- Query now shows ALL pending assignments
- Each assignment maps to its own enrollment
- Multiple courses to same learner = multiple rows in dashboard

## Files Modified

1. ✅ `src/pages/institutional/Assignments.jsx`
   - Fixed active enrollments query (no JOIN)
   - Improved assignment matching logic
   - Added progress display from enrollments

## How to Test

### Test Progress Tracking

1. **Learner**: Complete a lesson in assigned course
2. **Admin**: Go to `/institutional/assignments`
3. **Expected**: Progress bar shows percentage (e.g., "In Progress (20%)")
4. **Expected**: Last accessed time updates

### Test Multiple Courses

1. **Admin**: Assign 2 different courses to same email
2. **Admin**: Go to `/institutional/assignments`
3. **Expected**: See 2 separate rows for same employee
4. **Expected**: Each row shows different course title
5. **Expected**: Each row tracks progress independently

## Verification Queries

Run `DEBUG_ASSIGNMENTS.sql` in Supabase SQL Editor to check:
- All pending assignments (should see multiple per email)
- All active enrollments (should see multiple per learner)
- Progress tracking (should see non-zero progress after lesson completion)

## Expected Behavior

### Assignments Dashboard Should Show:

#### Pending Tab
- Assignments waiting for employee to accept invitation
- Status: "Pending Invitation" (yellow badge)
- Progress: 0%
- Shows invitation link and code

#### Active Tab
- Assignments where employee has accepted and is learning
- Status: "In Progress (X%)" or "Completed" (green badge)
- Progress: Actual percentage from enrollment
- Last accessed time shows when learner last viewed course

#### All Tab
- Both pending and active assignments
- One row per assignment (not per employee)
- Same employee can appear multiple times if assigned multiple courses

## Known Limitations

### Email Display
- Active enrollments show truncated user ID instead of email
- This is because we can't query `auth.users` from frontend
- Email is preserved in pending assignment records
- Once enrollment becomes active, email comes from pending record

**Future Fix**: Create a database view or function that joins learner → user → email

## Console Logs to Check

When viewing `/institutional/assignments`:

```
✅ Loaded institution from institution_admins: {name} {id}
🔍 Fetching assignments for institution: {id}
📋 Pending assignments query result: {...}
👥 Active enrollments query result: {...}
📊 Final stats: {total: X, pending: Y, active: Z}
```

If you see errors:
- Check institution_id is correct
- Verify RLS is disabled
- Run `DEBUG_ASSIGNMENTS.sql` to check database state

## Next Steps

1. **Refresh browser** (Ctrl+Shift+R)
2. **Test as admin** - View `/institutional/assignments`
3. **Expected results**:
   - ✅ See all assigned courses (multiple per learner if applicable)
   - ✅ See progress bars with actual percentages
   - ✅ See status badges (Pending/In Progress/Completed)
   - ✅ Each course assignment shows separately

4. **Test as learner** - Complete more lessons
5. **Check admin dashboard** - Progress should update

## Troubleshooting

### Issue: Still showing only one course
**Check**: Run query in `DEBUG_ASSIGNMENTS.sql` section 1
**Expected**: Multiple rows with same email but different course_id

### Issue: Progress still shows 0%
**Check**: 
1. Learner actually completed lessons (check lesson_progress table)
2. updateEnrollmentProgress() updated learner_institutional_enrollments
3. Run query in `DEBUG_ASSIGNMENTS.sql` section 4

**Console check**: Look for these logs when learner completes lesson:
```
📊 Progress calculation: X/Y = Z%
✅ Institutional enrollment progress updated
```

### Issue: "Error loading assignments"
**Check**: Browser console for specific error
**Common causes**:
- RLS still enabled
- institutionId is null
- Database queries timing out

---

**Status**: ✅ Fixes Applied  
**Test Now**: Refresh browser and verify both issues are fixed

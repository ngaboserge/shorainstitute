# Fix: Employee Name Display in Assignments

## Issue
Some rows in `/institutional/assignments` show:
- "Employee User 59dedf07..." instead of actual email
- "Employee" instead of actual name

## Root Cause
Active enrollments don't store employee email/name directly. The data flow is:

```
pending_course_assignments (has email/name)
    ↓
learner_invitations (has email/name)
    ↓
institution_learners (has invitation_id, links to invitation)
    ↓
learner_institutional_enrollments (has learner_id, NO email/name)
```

When we query enrollments, we need to trace back through this chain to get the email.

## Solution Applied

Updated `src/pages/institutional/Assignments.jsx` to:

1. Query `institution_learners` with `invitation_id`
2. Use `invitation_id` to fetch original invitation
3. Get email and name from invitation record
4. Display in assignments table

### Before (Broken)
```javascript
// Only had user_id, couldn't get email
employee_email: `User ${userId?.substring(0, 8)}...`
employee_name: `Employee`
```

### After (Fixed)
```javascript
// Gets invitation, extracts email and name
const invitation = invitationMap[learner.invitation_id]
employee_email: invitation?.email || fallback
employee_name: invitation?.employee_name || invitation?.email
```

## Data Flow

```
1. Query: learner_institutional_enrollments
   ↓ gets: learner_id, course_id, progress

2. Query: institution_learners WHERE id IN (learner_ids)
   ↓ gets: user_id, invitation_id

3. Query: learner_invitations WHERE id IN (invitation_ids)
   ↓ gets: email, employee_name

4. Combine: enrollment + course + invitation data
   ↓ displays: proper email and name
```

## Expected Display

### Before Fix:
| Employee | Course | Status | Progress |
|----------|--------|--------|----------|
| iradukundadavidlearner@gmail.com | Course A | Enrolled | 100% |
| Employee User 59dedf07... | Course B | Not Started | 0% | ❌

### After Fix:
| Employee | Course | Status | Progress |
|----------|--------|--------|----------|
| iradukundadavidlearner@gmail.com | Course A | Enrolled | 100% |
| iradukundadavidlearner@gmail.com | Course B | Not Started | 0% | ✅

## How to Test

1. **Refresh browser** (Ctrl+Shift+R)
2. **Go to** `/institutional/assignments` as admin
3. **Check** that ALL rows show proper email addresses
4. **Check** that employee names appear (if provided during assignment)

## Verification Query

Run in Supabase SQL Editor to verify data chain is intact:

```sql
SELECT 
  lie.id as enrollment_id,
  il.user_id,
  il.invitation_id,
  li.email,
  li.employee_name,
  c.title as course_title,
  lie.progress_percentage
FROM learner_institutional_enrollments lie
JOIN institution_learners il ON lie.learner_id = il.id
LEFT JOIN learner_invitations li ON il.invitation_id = li.id
JOIN courses c ON lie.course_id = c.id
ORDER BY li.email, c.title;
```

**Expected**: All rows have email and employee_name (or NULL if not provided)

## Edge Cases Handled

1. **No invitation_id**: Falls back to truncated user ID
2. **Invitation exists but no employee_name**: Shows email
3. **Multiple courses per learner**: Each shows same email/name
4. **Direct enrollment (no invitation)**: Shows placeholder

## Files Modified

- ✅ `src/pages/institutional/Assignments.jsx`

## Status

✅ **Fixed** - All employees should now show proper email and name

---

**Test Now**: Refresh and verify all rows show real emails

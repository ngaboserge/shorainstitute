# Running the Email Invitation System Migration

## Quick Setup

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://ydldtedpcnpoeznhgsot.supabase.co
2. Navigate to **SQL Editor** (left sidebar)
3. Click **+ New Query**
4. Copy the entire content of `migrations/20260728000002_email_based_course_assignment.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for success message
8. Done! ✅

### Option 2: Command Line (Advanced)

If you have `psql` installed:

```bash
psql -h ydldtedpcnpoeznhgsot.supabase.co \
  -U postgres \
  -d postgres \
  -f migrations/20260728000002_email_based_course_assignment.sql
```

## Verification

After running the migration, verify it worked:

### Check Tables Created

```sql
-- Run in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'pending_course_assignments';
```

Should return: `pending_course_assignments`

### Check Triggers Created

```sql
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name IN (
  'trigger_auto_assign_pending_courses',
  'trigger_ensure_invitation'
);
```

Should return both trigger names.

### Check Functions Created

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'check_employee_exists',
    'get_institution_assignment_stats',
    'auto_assign_pending_courses',
    'ensure_invitation_for_pending_assignment'
  );
```

Should return all 4 function names.

### Check View Created

```sql
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name = 'institution_all_course_assignments';
```

Should return: `institution_all_course_assignments`

## Testing the System

### Test 1: Check Employee Function

```sql
-- Replace with your institution ID
SELECT * FROM check_employee_exists(
  'your-institution-id',
  'employee@company.com'
);
```

### Test 2: Create Pending Assignment

```sql
-- Replace with your actual IDs
INSERT INTO pending_course_assignments (
  institution_id,
  course_id,
  employee_email,
  employee_name,
  assigned_by,
  start_date
) VALUES (
  'your-institution-id',
  'some-course-id',
  'newemployee@company.com',
  'John Doe',
  'admin-user-id',
  CURRENT_DATE
);

-- Check if invitation was created automatically
SELECT * FROM learner_invitations 
WHERE email = 'newemployee@company.com';
```

### Test 3: Query All Assignments

```sql
SELECT 
  course_title,
  employee_email,
  assignment_status,
  assignment_type
FROM institution_all_course_assignments
WHERE institution_id = 'your-institution-id'
ORDER BY assigned_at DESC
LIMIT 10;
```

## Rollback (If Needed)

If something goes wrong, you can rollback:

```sql
-- Drop in reverse order
DROP VIEW IF EXISTS institution_all_course_assignments CASCADE;
DROP FUNCTION IF EXISTS get_institution_assignment_stats CASCADE;
DROP FUNCTION IF EXISTS auto_assign_pending_courses CASCADE;
DROP FUNCTION IF EXISTS ensure_invitation_for_pending_assignment CASCADE;
DROP FUNCTION IF EXISTS check_employee_exists CASCADE;
DROP TABLE IF EXISTS pending_course_assignments CASCADE;
```

## What to Do After Migration

1. **Test the UI**: 
   - Go to Institutional Portal
   - Click "Assign Course"
   - Choose "By Email" mode
   - Enter a test email
   - Verify it works

2. **Check Existing System**:
   - Verify existing assignments still work
   - Check that direct assignment still functions
   - Test enrollment code system

3. **Monitor Logs**:
   - Check for any errors in Supabase logs
   - Verify triggers are firing correctly
   - Monitor invitation creation

## Troubleshooting

### Error: "relation already exists"

This means the migration was already run. You can either:
- Skip it (already done)
- Run rollback first, then re-run

### Error: "function does not exist"

Some dependencies might be missing. Check:
- `uuid-ossp` extension installed
- `auth.users` table exists
- All referenced tables exist

### Error: Permission denied

Make sure you're running as:
- Database owner
- superuser
- Or have sufficient privileges

## Next Steps

Once migration is successful:

1. ✅ Test email-based assignment
2. ✅ Verify invitations work
3. ✅ Test auto-assignment trigger
4. ✅ Create test employee account
5. ✅ Assign test course
6. ✅ Accept invitation
7. ✅ Verify course appears

## Support

If you encounter issues:
1. Check Supabase logs
2. Review error messages
3. Verify all prerequisites
4. Contact development team

---

**Migration File**: `migrations/20260728000002_email_based_course_assignment.sql`  
**Documentation**: `EMAIL_INVITATION_SYSTEM.md`  
**Status**: Ready to deploy! 🚀

# B2B Institutional System - Testing Guide

**Date:** 2026-07-27  
**Status:** Ready to Test Invitation Flow

---

## 🎯 What We Just Built

1. ✅ Complete database migration (ready to execute)
2. ✅ Invitation system UI (single, bulk, CSV import)
3. ✅ **NEW: Invitation acceptance page** (`/invitation/accept`)
4. ✅ **NEW: Invitation helper functions** (validation, signup, login)

---

## 📋 STEP 1: Execute Database Migration

### Before You Start
- Open Supabase Dashboard
- Go to your project: https://supabase.com/dashboard/project/{your-project-id}
- Click "SQL Editor" in left sidebar

### Execute Migration
1. Click "New Query"
2. Open file: `migrations/20260127000000_b2b_institutional_system.sql`
3. Copy ALL contents (entire file)
4. Paste into SQL Editor
5. Click **"Run"** button or press `Ctrl+Enter`
6. Wait for success message: "Success. No rows returned"

### Verify Migration Success
Run this query to verify tables were created:

```sql
-- Check all new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'learner_invitations',
    'institution_course_assignments',
    'institution_course_assignment_individuals',
    'learner_institutional_enrollments',
    'institution_admins',
    'institution_seat_history',
    'institution_notifications'
  )
ORDER BY table_name;
```

Should return 7 rows.

### Check Shora Institute Setup
```sql
-- Verify Shora Institute has subscription data
SELECT 
  id,
  name,
  total_seats,
  used_seats,
  subscription_status,
  subscription_plan,
  trial_ends_at
FROM institutions
WHERE id = '00000000-0000-0000-0000-000000000001';
```

Expected output:
- name: "Shora Institute"
- total_seats: 100
- used_seats: 0
- subscription_status: "active"
- subscription_plan: "trial"
- trial_ends_at: ~14 days from now

### Check Admin User
```sql
-- Verify admin user assigned
SELECT * FROM institution_admins
WHERE institution_id = '00000000-0000-0000-0000-000000000001';
```

Should see 1 record with role = 'super_admin'.

---

## 📋 STEP 2: Test Invitation Flow (Complete End-to-End)

### Scenario A: Single Email Invitation → New User Signup

#### Part 1: Send Invitation

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Login as institutional admin:**
   - Navigate to: http://localhost:3000/auth/institutional/login
   - Email: `shorainstitute@gmail.com`
   - Password: (your password)

3. **Go to Learners page:**
   - Click "Learners" in sidebar
   - Should see empty table or existing learners

4. **Send invitation:**
   - Click "Invite Learners" button (top right)
   - Choose "Single Invite" tab
   - Fill form:
     - Email: `john.doe@testcompany.com` (use a real email you control for testing)
     - Full Name: `John Doe`
     - Employee ID: `EMP-001` (optional)
     - Department: Select one if available
     - Job Title: `Software Engineer` (optional)
   - Click "Send Invitation"
   - Should see success message

5. **Verify in database:**
   ```sql
   SELECT * FROM learner_invitations
   WHERE email = 'john.doe@testcompany.com';
   ```
   
   Note the `invitation_token` value.

6. **Check seat count:**
   ```sql
   SELECT used_seats FROM institutions
   WHERE id = '00000000-0000-0000-0000-000000000001';
   ```
   
   Should still be 0 (seat not used until accepted).

#### Part 2: Accept Invitation (New User)

1. **Build invitation URL:**
   ```
   http://localhost:3000/invitation/accept?token={PASTE_TOKEN_HERE}
   ```
   
   Replace `{PASTE_TOKEN_HERE}` with the actual token from database.

2. **Open invitation URL in browser:**
   - Should see beautiful acceptance page
   - Shows institution name: "Shora Institute"
   - Shows email: `john.doe@testcompany.com`
   - Shows name: "John Doe"
   - Two tabs: "Create Account" and "Sign In"

3. **Create account:**
   - Make sure "Create Account" tab is selected (default)
   - Full Name should be pre-filled: `John Doe`
   - Email is shown (disabled)
   - Enter password: `TestPassword123!`
   - Confirm password: `TestPassword123!`
   - Click "Create Account & Join"
   - Should see loading spinner
   - Should redirect to `/learner/seminars`

4. **Verify in database:**
   ```sql
   -- Check invitation accepted
   SELECT status, accepted_at, accepted_by_user_id
   FROM learner_invitations
   WHERE email = 'john.doe@testcompany.com';
   ```
   
   Status should be 'accepted', accepted_at should have timestamp.

   ```sql
   -- Check institution_learner created
   SELECT * FROM institution_learners
   WHERE user_id = (
     SELECT accepted_by_user_id FROM learner_invitations 
     WHERE email = 'john.doe@testcompany.com'
   );
   ```
   
   Should see 1 record with status = 'active'.

   ```sql
   -- Check seat count increased
   SELECT used_seats FROM institutions
   WHERE id = '00000000-0000-0000-0000-000000000001';
   ```
   
   Should be 1 now!

5. **Verify user is logged in:**
   - Should be on learner dashboard
   - Should see seminars page
   - Check top right corner for user name

---

### Scenario B: Bulk Email Invitation

1. **Login as admin** (if not already)

2. **Click "Invite Learners"**

3. **Switch to "Bulk Invite" tab**

4. **Paste multiple emails** (one per line):
   ```
   jane.smith@testcompany.com
   bob.johnson@testcompany.com
   alice.williams@testcompany.com
   ```

5. **Click "Send Invitations"**
   - Should see: "Successfully sent 3 invitations"

6. **Verify in database:**
   ```sql
   SELECT email, status, invited_at
   FROM learner_invitations
   WHERE institution_id = '00000000-0000-0000-0000-000000000001'
   ORDER BY invited_at DESC
   LIMIT 5;
   ```
   
   Should see 3 new records with status = 'pending'.

---

### Scenario C: CSV Bulk Import

1. **Login as admin**

2. **Click "Bulk Import CSV" button**

3. **Download template:**
   - Click "Download CSV Template"
   - Opens `employee_import_template.csv`

4. **Fill CSV file:**
   Create a CSV with this content:
   ```csv
   Name,Email,Employee ID,Department,Job Title
   Michael Brown,michael.brown@testcompany.com,EMP-100,Engineering,Senior Engineer
   Sarah Davis,sarah.davis@testcompany.com,EMP-101,Finance,Financial Analyst
   Tom Wilson,tom.wilson@testcompany.com,EMP-102,HR,HR Manager
   ```
   
   Save as `employees.csv`

5. **Upload CSV:**
   - Click upload area or drag file
   - Select your `employees.csv`
   - Click "Upload & Validate"

6. **Review preview:**
   - Should show "3 valid rows"
   - Green checkmarks next to valid emails
   - Preview table shows all 3 employees

7. **Import:**
   - Click "Import 3 Employees"
   - Should see success message
   - Should see "Import Successful!" screen

8. **Verify in database:**
   ```sql
   SELECT email, employee_name, employee_id, job_title, status
   FROM learner_invitations
   WHERE employee_id IN ('EMP-100', 'EMP-101', 'EMP-102');
   ```
   
   Should see 3 records.

---

### Scenario D: Existing User Login → Accept Invitation

This tests when someone already has an account and needs to link it to institution.

1. **Create test user first:**
   - Go to: http://localhost:3000/auth/learner/signup
   - Email: `existing.user@testcompany.com`
   - Password: `ExistingPass123!`
   - Full Name: `Existing User`
   - Sign up and then logout

2. **Send invitation to same email:**
   - Login as admin
   - Click "Invite Learners"
   - Email: `existing.user@testcompany.com`
   - Name: `Existing User`
   - Send invitation

3. **Get invitation token from database**

4. **Open invitation URL:**
   ```
   http://localhost:3000/invitation/accept?token={TOKEN}
   ```

5. **Switch to "Sign In" tab**

6. **Login with existing account:**
   - Email: `existing.user@testcompany.com`
   - Password: `ExistingPass123!`
   - Click "Sign In & Join"

7. **Should redirect to learner dashboard**

8. **Verify linked to institution:**
   ```sql
   SELECT * FROM institution_learners
   WHERE user_id = (
     SELECT id FROM profiles WHERE email = 'existing.user@testcompany.com'
   );
   ```
   
   Should see record linking user to institution.

---

### Scenario E: Error Cases

#### Test 1: Expired Token
```sql
-- Manually expire an invitation
UPDATE learner_invitations
SET expires_at = NOW() - INTERVAL '1 day'
WHERE email = 'test.expired@testcompany.com';
```

Open invitation URL → Should show "Invitation expired" error.

#### Test 2: Already Accepted Token
Use a token that was already accepted → Should show "Invitation already used" error.

#### Test 3: Invalid Token
```
http://localhost:3000/invitation/accept?token=00000000-0000-0000-0000-000000000000
```
Should show "Invalid invitation token" error.

#### Test 4: No Seats Available
```sql
-- Temporarily set seats to limit
UPDATE institutions
SET total_seats = 0
WHERE id = '00000000-0000-0000-0000-000000000001';
```

Try to invite → Should show "No available seats" error.

Reset:
```sql
UPDATE institutions
SET total_seats = 100
WHERE id = '00000000-0000-0000-0000-000000000001';
```

#### Test 5: Duplicate Email
- Send invitation to `duplicate@testcompany.com`
- Try to send again to same email
- Should show "This email has already been invited" error

---

## 📊 Database Queries for Monitoring

### Check All Invitations
```sql
SELECT 
  email,
  employee_name,
  status,
  invited_at,
  expires_at,
  accepted_at
FROM learner_invitations
WHERE institution_id = '00000000-0000-0000-0000-000000000001'
ORDER BY invited_at DESC;
```

### Check Seat Usage
```sql
SELECT 
  name,
  total_seats,
  used_seats,
  (total_seats - used_seats) AS available_seats,
  ROUND((used_seats::DECIMAL / total_seats * 100), 2) AS utilization_percentage
FROM institutions
WHERE id = '00000000-0000-0000-0000-000000000001';
```

### Check Active Learners
```sql
SELECT 
  il.*,
  p.full_name,
  p.email
FROM institution_learners il
JOIN profiles p ON il.user_id = p.id
WHERE il.institution_id = '00000000-0000-0000-0000-000000000001'
  AND il.status = 'active'
ORDER BY il.enrolled_at DESC;
```

### Check Invitation Stats
```sql
SELECT 
  status,
  COUNT(*) as count
FROM learner_invitations
WHERE institution_id = '00000000-0000-0000-0000-000000000001'
GROUP BY status;
```

---

## 🐛 Troubleshooting

### Issue: Migration fails
**Solution:** Check error message. Common issues:
- Function `uuid_generate_v4()` not available → Enable uuid extension: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
- Tables already exist → Drop tables and re-run
- Foreign key violations → Check that `institutions` table exists

### Issue: Invitation modal doesn't open
**Solution:** Check browser console for errors. Verify imports in `Learners.jsx`.

### Issue: "No available seats" error
**Solution:** Check seat count:
```sql
SELECT total_seats, used_seats FROM institutions WHERE id = '00000000-0000-0000-0000-000000000001';
```
If needed, increase seats:
```sql
UPDATE institutions SET total_seats = 500 WHERE id = '00000000-0000-0000-0000-000000000001';
```

### Issue: Invitation acceptance fails
**Solution:** Check browser console and network tab for errors. Common issues:
- Token validation fails → Check token exists in database
- Seat limit reached → Check used_seats vs total_seats
- Duplicate user → Check if user already linked to institution

### Issue: Seat count not updating
**Solution:** The trigger should auto-update. Check:
```sql
-- Verify trigger exists
SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'institution_learners';
```

Manually recalculate if needed:
```sql
UPDATE institutions
SET used_seats = (
  SELECT COUNT(*) FROM institution_learners 
  WHERE institution_id = institutions.id AND status = 'active'
)
WHERE id = '00000000-0000-0000-0000-000000000001';
```

### Issue: Page styling looks broken
**Solution:** Make sure `InvitationAccept.css` is imported in component. Check for CSS conflicts.

---

## ✅ Success Checklist

After completing all tests, you should have:

- [x] Database migration executed successfully
- [x] All 7 new tables created
- [x] Shora Institute configured with 100 seats
- [x] Admin user assigned as super_admin
- [x] Single invitation sent and accepted
- [x] Bulk email invitations sent
- [x] CSV bulk import completed
- [x] Existing user linked to institution
- [x] Error cases handled gracefully
- [x] Seat counting working automatically
- [x] Users can access learner dashboard after acceptance

---

## 🚀 What's Next?

Once invitation system is fully tested and working:

### Phase 3: Course Assignment System
1. Complete AssignProgrammeModal
2. Create auto-enrollment logic
3. Test course assignments
4. View assigned courses in learner dashboard

### Phase 4: Progress Tracking
1. Complete LearnerDetailsModal
2. Add real-time progress updates
3. Update institutional dashboard with real data
4. Generate reports

### Phase 5: Production Readiness
1. Set up email service (SendGrid/AWS SES)
2. Configure email templates
3. Refine RLS policies
4. Add rate limiting
5. Deploy to production

---

**Need Help?**
- Check browser console for JavaScript errors
- Check network tab for API errors
- Check Supabase logs for database errors
- Verify environment variables are set correctly

**Ready to test!** 🎉

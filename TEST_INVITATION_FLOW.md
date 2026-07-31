# Testing Invitation Flow

## ✅ What's Now Working

The complete invitation system is now functional:

1. **Invite Modal** - Admin can invite learners ✅
2. **Database Storage** - Invitations saved with tokens ✅  
3. **Acceptance Page** - `/invitation/accept?token=xxx` ✅
4. **Account Creation** - New users can signup ✅
5. **Account Linking** - Existing users can login ✅
6. **Auto-enrollment** - Pending courses assigned automatically ✅

## 🧪 How to Test

### Step 1: Invite a Learner

1. Go to Learners page: http://localhost:3000/institutional/learners
2. Click "Invite Learners" button
3. Fill in the form:
   - Email: test@example.com
   - Name: Test User
   - (Optional) Employee ID, Department, Job Title
4. Click "Send Invitation"
5. **Check browser console** - you'll see the invitation link printed

### Step 2: Get the Invitation Token

The console will show something like:
```
Invitation link: http://localhost:3000/invitation/accept?token=abc123-def456-...
```

Copy the entire URL or just the token part.

### Step 3: Accept the Invitation

**Option A: New User (Signup)**
1. Open the invitation link in a new browser window (or incognito)
2. You'll see the invitation acceptance page
3. Make sure "Create Account" tab is selected
4. Fill in:
   - Full Name (pre-filled)
   - Email (pre-filled, cannot change)
   - Password (min 8 characters)
   - Confirm Password
5. Click "Create Account & Join"
6. You'll be redirected to `/learner/courses` with a welcome message
7. The learner now appears in the Learners table as "Active"

**Option B: Existing User (Login)**
1. Open the invitation link
2. Click "Sign In" tab
3. Enter your existing email and password
4. Click "Sign In & Join"
5. Your existing account is linked to the institution

### Step 4: Verify in Admin Portal

1. Go back to Learners page
2. Refresh the page
3. The learner should now appear in the "Active" section (not "Pending")
4. You should see their name, email, and employee ID

### Step 5: Test Auto-Enrollment (If you had pending assignments)

If you assigned courses to the email BEFORE they accepted:
1. The learner will see those courses in `/learner/courses`
2. The pending assignments are converted to actual enrollments
3. This happens automatically via the database trigger

## 🔍 Database Verification

You can verify the data in Supabase:

```sql
-- Check invitation
SELECT * FROM learner_invitations 
WHERE email = 'test@example.com';

-- Check learner was created
SELECT * FROM institution_learners
WHERE user_email = 'test@example.com';

-- Check their enrollments
SELECT * FROM learner_institutional_enrollments lie
JOIN institution_learners il ON lie.learner_id = il.id
WHERE il.user_email = 'test@example.com';
```

## 📋 What Happens Behind the Scenes

1. **Invitation Created**
   - Entry in `learner_invitations` table
   - Status: 'pending'
   - Unique token generated
   - Expires in 7 days

2. **User Accepts**
   - Creates auth.users account (if signup)
   - Creates `institution_learners` entry
   - Links to invitation via `invitation_id`
   - Populates `user_name` and `user_email`

3. **Auto-Assignment Trigger**
   - Finds pending course assignments for that email
   - Creates `learner_institutional_enrollments`
   - Updates assignment status to 'assigned'

4. **Updates Learners Page**
   - Learner moves from "Pending" to "Active"
   - Shows real name from account
   - Shows enrolled courses count

## 🎯 Common Issues

### Issue: "Invalid invitation token"
- Token might be wrong
- Check the console log for the correct URL
- Make sure you copied the full token

### Issue: "Invitation has expired"
- Invitations expire after 7 days
- Admin needs to resend the invitation

### Issue: "You are already a member of this institution"
- User is already registered
- Check the Learners page to see them listed

### Issue: "Failed to create account"
- Email might already be registered in auth.users
- Try using the "Sign In" option instead

## 🚀 Production Considerations

For production, you'll want to:

1. **Email Integration**
   - Set up SendGrid, AWS SES, or Supabase Edge Functions
   - Send invitation link via email instead of console.log
   - Include institution name, branding, expiry date

2. **Invitation Management**
   - Add "Resend invitation" button
   - Show invitation status in UI
   - Auto-expire old invitations
   - Send reminder emails

3. **Better UX**
   - Custom invitation email templates
   - Progress indicators
   - Welcome emails after acceptance
   - Institution branding on acceptance page

## ✅ Testing Checklist

- [ ] Can invite single learner
- [ ] Can invite multiple learners (bulk)
- [ ] Invitation token is generated
- [ ] Can access invitation page with token
- [ ] Can create new account from invitation
- [ ] Can link existing account to institution
- [ ] Learner appears in Learners table after accepting
- [ ] Pending courses are assigned automatically
- [ ] Cannot reuse invitation token
- [ ] Expired invitations show error

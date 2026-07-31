# 📚 How Learners Enroll Using Invitation Link

## 🎯 The Complete Flow

### Step 1: Admin Assigns Course
1. Admin goes to `/institutional/assignments`
2. Clicks "Assign Course"
3. Enters learner's email: `employee@company.com`
4. System creates invitation

### Step 2: Admin Shares Link
**From Assignments page, admin copies:**

**Option A: Full Link** (Recommended)
```
http://localhost:3000/invitation/accept?token=fec3e856-3daf-46ff-ab27-53a378206f0b
```

**Option B: Short Code** 
```
Code: 206F0B
```

**How to share:**
- 📧 Email: Paste full link
- 💬 WhatsApp/SMS: Send link or code
- 💼 Slack: Paste link directly
- 📱 In-person: Show QR code (future feature)

### Step 3: Learner Receives Link

**Email example:**
```
Subject: You're invited to BNR Learning Portal

Hi,

You've been assigned to take "Financial Literacy" course.

Click here to accept your invitation:
http://localhost:3000/invitation/accept?token=fec3e856...

Or use code: 206F0B at shora-institute.com/redeem

This invitation expires in 30 days.

Best regards,
BNR Training Team
```

### Step 4: Learner Clicks Link

**What they see:**
```
┌─────────────────────────────────────┐
│  🏢 You're Invited!                 │
│                                     │
│  BNR                                │
│  You've been invited to join BNR    │
│  as a learner.                      │
│                                     │
│  📧 employee@company.com            │
│                                     │
│  [Create Account]  [Sign In]        │
└─────────────────────────────────────┘
```

### Step 5A: New Learner Creates Account

**If they DON'T have an account:**

1. Click "Create Account" tab
2. Fill in form:
   - ✅ Full Name: `John Doe`
   - ✅ Email: `employee@company.com` (pre-filled, locked)
   - 🔒 Password: `********`
   - 🔒 Confirm: `********`
3. Click "Create Account & Join"
4. System:
   - Creates auth user
   - Adds to `institution_learners` table
   - **Auto-assigns pending courses** (via database trigger)
   - Marks invitation as 'accepted'
5. Redirects to `/learner/courses`
6. **Course is already there!** Can start immediately

### Step 5B: Existing Learner Signs In

**If they ALREADY have an account:**

1. Click "Sign In" tab
2. Fill in form:
   - 📧 Email: `employee@company.com`
   - 🔒 Password: `********`
3. Click "Sign In & Join"
4. System:
   - Verifies credentials
   - Links account to institution
   - **Auto-assigns pending courses**
   - Marks invitation as 'accepted'
5. Redirects to `/learner/courses`
6. **New course appears!**

---

## 🔄 Behind the Scenes (Database Triggers)

When learner accepts invitation:

```sql
-- 1. Create institution_learners record
INSERT INTO institution_learners (
  institution_id,
  user_id,
  invitation_id,
  status
) VALUES (
  'BNR-institution-id',
  'learner-user-id',
  'fec3e856-3daf-46ff-ab27-53a378206f0b',
  'active'
);

-- 2. Trigger fires: auto_assign_pending_courses()
-- Finds all pending assignments for this email
-- Creates enrollments automatically

-- 3. Learner now has access to courses
SELECT * FROM learner_institutional_enrollments
WHERE learner_id = 'new-learner-id';
-- Result: Course assigned and ready!
```

---

## 📱 Testing the Flow

### Test It Yourself:

**Step 1: Get your invitation link**
```sql
-- Run in Supabase
SELECT 
  'http://localhost:3000/invitation/accept?token=' || id as link,
  email,
  status
FROM learner_invitations
ORDER BY invited_at DESC
LIMIT 1;
```

**Step 2: Open in incognito/private browser**
- Why? So you're not logged in as admin
- Copy the link
- Open new incognito window
- Paste link

**Step 3: Create test account**
- Use the email from the invitation
- Fill in name and password
- Submit

**Step 4: Verify enrollment**
```sql
-- Check if learner was created
SELECT * FROM institution_learners 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@email.com');

-- Check if course was assigned
SELECT 
  lie.*,
  c.title as course_name
FROM learner_institutional_enrollments lie
JOIN courses c ON lie.course_id = c.id
WHERE lie.learner_id = (
  SELECT id FROM institution_learners 
  WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@email.com')
);
```

**Step 5: Login as learner**
- Go to `/learner/courses`
- See your assigned course!

---

## ❓ FAQ

### Q: What if the link expires?
**A:** Invitations expire after 30 days. Admin needs to create new assignment.

### Q: Can learner use code instead of link?
**A:** Currently link only. Code redemption needs to be added to `/learner/redeem-code` page.

### Q: What if learner already has account at different institution?
**A:** They can belong to multiple institutions. System links them to new institution while keeping existing access.

### Q: How does learner know which courses they got?
**A:** After accepting invitation:
1. Email notification (future feature)
2. Check `/learner/courses` - new courses appear
3. Dashboard shows "New Course Assigned" banner (future feature)

### Q: Can learner reject invitation?
**A:** Not currently. If they don't click link, invitation expires after 30 days and assignment stays pending.

---

## 🚀 What Happens After Enrollment

**Learner dashboard shows:**
- ✅ New course in "My Courses"
- 📊 Progress: 0% (not started)
- 🎯 Start button available
- 📅 Due date (if set by admin)
- ⚠️ Mandatory flag (if set by admin)

**Learner can:**
- Click course → View lessons
- Start learning immediately
- Track progress
- Complete assessments
- Earn certificates

**Admin can see:**
- Go to `/institutional/assignments`
- Status changes from "Pending Invitation" to "Active"
- Progress tracking updates in real-time
- Completion status

---

## 📊 Example: Real World Scenario

**Company:** BNR Bank
**Employee:** Sarah (new hire)
**Course:** Financial Compliance Training

1. **HR Manager (Admin):**
   - Goes to BNR institutional portal
   - Assigns "Financial Compliance" to sarah@bnr.com
   - Copies invitation link
   - Sends email to Sarah

2. **Sarah (Employee):**
   - Receives email with link
   - Clicks link on phone
   - Creates account (takes 1 minute)
   - Sees "Financial Compliance" course assigned
   - Starts learning on commute

3. **System:**
   - Auto-enrolled Sarah
   - Tracks her progress
   - Sends completion certificate when done
   - Notifies HR Manager

4. **HR Manager sees:**
   - Sarah accepted invitation (timestamp)
   - Currently 35% complete
   - Expected completion: 3 days

**Result:** 🎉 Smooth onboarding, no manual work, all tracked!

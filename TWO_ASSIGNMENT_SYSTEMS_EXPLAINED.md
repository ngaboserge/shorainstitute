# Two Course Assignment Systems - Explained

## Overview

The platform has **TWO DIFFERENT** systems for assigning courses to employees. They work differently and serve different use cases:

---

## System 1: Email-Based Direct Assignment (Invitation System)

### How It Works
1. Admin goes to `/institutional/assign-course`
2. Admin enters employee email, name, and selects course
3. System creates a `pending_course_assignment` record
4. System creates an `invitation` with unique UUID
5. Admin copies invitation link and sends to employee
6. Employee clicks link → Creates account or logs in
7. System auto-assigns course via database trigger
8. Employee sees course in their dashboard

### Key Files
- Migration: `migrations/20260728000002_email_based_course_assignment.sql`
- Admin Page: `src/pages/institutional/AssignCourse.jsx`
- Dashboard: `src/pages/institutional/Assignments.jsx`
- Invitation Accept: `src/pages/public/InvitationAccept.jsx`

### Database Tables
- `pending_course_assignments` - Assignment records
- `learner_invitations` - Invitation tokens (UUID format)
- `institution_learners` - Employee records
- `learner_institutional_enrollments` - Active enrollments

### Link Format
```
https://yoursite.com/invitation/accept?token=<UUID>

Example:
https://yoursite.com/invitation/accept?token=123e4567-e89b-12d3-a456-426614174000
```

### Use Cases
- ✅ Assign specific courses to specific employees
- ✅ Employee doesn't need to do anything except click link
- ✅ Works for both existing and new employees
- ✅ Admin has full control over who gets what
- ✅ Good for: Onboarding, mandatory training, targeted upskilling

### What Admin Sees
In the Assignments dashboard:
- Employee name and email
- Course assigned
- Status: "Pending Invitation" or "Enrolled"
- Progress tracking (once enrolled)
- **"Copy Link"** button to share invitation link

---

## System 2: Enrollment Code System (Self-Service Redemption)

### How It Works
1. Admin goes to institutional portal (purchase feature)
2. Admin BUYS X seats for a specific course (bulk purchase)
3. System generates enrollment codes: `INST-XXXX-XXXX-XXXX`
4. Admin distributes codes to employees (email, Slack, etc.)
5. Employee goes to `/learner/redeem-code`
6. Employee enters code and employment verification info
7. Admin reviews and approves the request
8. System creates enrollment
9. Employee sees course in their dashboard

### Key Files
- Migration: `migrations/20260728000000_enrollment_codes_system.sql`
- Redeem Page: `src/pages/learner/RedeemCode.jsx`
- Admin Approval: (needs to be built - not yet implemented)

### Database Tables
- `institution_course_purchases` - Bulk course purchases
- `institution_enrollment_codes` - Generated codes (INST-XXXX-XXXX-XXXX)
- `code_redemption_requests` - Employee requests to use codes
- `institution_learners` - Employee records (created on approval)
- `learner_institutional_enrollments` - Active enrollments (created on approval)

### Code Format
```
INST-XXXX-XXXX-XXXX

Example:
INST-A7K9-M2P4-R8T3
```

### Use Cases
- ✅ Bulk purchases (buy 50 seats at once)
- ✅ Self-service: employees redeem themselves
- ✅ Employee verification required (admin approval)
- ✅ Track code usage and redemption rates
- ✅ Good for: Open enrollment periods, budget-based allocation, departmental allowances

### What Admin Sees
In a separate dashboard (to be built):
- Purchases made (how many codes bought)
- Codes generated
- Redemption requests pending approval
- Codes redeemed vs remaining
- Employee verification details

---

## Key Differences

| Feature | Email-Based Assignment | Enrollment Codes |
|---------|----------------------|------------------|
| **Initiation** | Admin assigns to specific person | Employee self-redeems |
| **Employee Effort** | Just click link | Enter code + fill form + wait for approval |
| **Admin Approval** | Not needed (auto-assigned) | Required (manual approval) |
| **Purchase Model** | Individual assignment | Bulk purchase (buy X seats) |
| **Code Format** | UUID invitation token | INST-XXXX-XXXX-XXXX |
| **Page** | `/institutional/assign-course` | `/learner/redeem-code` |
| **Use Case** | Targeted assignments | Self-service, budget allocation |
| **Tracking** | Assignment dashboard | Redemption dashboard (separate) |

---

## Common Confusion

### ❌ WRONG: "Short codes" in Assignments Dashboard

**Previous implementation** showed "short codes" in the Assignments dashboard like:
```
Code: 59DEDF07
```

This was **CONFUSING** because:
1. These weren't enrollment codes (not in INST-XXXX-XXXX-XXXX format)
2. They were just truncated invitation UUIDs
3. You couldn't use them in the RedeemCode page
4. Mixed two different systems together

### ✅ CORRECT: Clear Separation

**Current implementation**:
- **Assignments Dashboard** → Shows **"Copy Link"** button for invitation links only
- **Enrollment Codes** → Completely separate feature with separate dashboard
- No mixing of invitation tokens and enrollment codes

---

## User Workflows

### Workflow A: Admin Assigns Course Directly

```
Admin Dashboard
    ↓
"Assign Course" button
    ↓
Enter employee email + name
Select course
    ↓
System creates invitation
    ↓
Admin copies invitation link
Admin emails/slacks link to employee
    ↓
Employee clicks link
Employee logs in or signs up
    ↓
System auto-assigns course
    ↓
Employee sees course in dashboard
Employee starts learning
```

### Workflow B: Employee Redeems Enrollment Code

```
Admin Dashboard
    ↓
"Buy Courses" or "Purchase Seats"
    ↓
Select course, enter quantity
Pay for bulk purchase
    ↓
System generates enrollment codes
(e.g., 50 codes: INST-XXXX-XXXX-XXXX)
    ↓
Admin distributes codes to employees
(email blast, department heads, etc.)
    ↓
Employee receives code via email
Employee goes to /learner/redeem-code
Employee enters code
    ↓
System validates code
Employee fills verification form:
  - Employee ID
  - Department
  - Job Title
    ↓
Admin reviews redemption request
Admin approves or rejects
    ↓
If approved:
  → System creates enrollment
  → Employee gets notification
  → Course appears in dashboard
```

---

## Implementation Status

### ✅ Completed: Email-Based Assignment System
- [x] Database schema
- [x] Admin assignment page
- [x] Assignments dashboard
- [x] Invitation acceptance page
- [x] Auto-assignment trigger
- [x] Progress tracking
- [x] Employee name display fix

### ⚠️ Partially Completed: Enrollment Code System
- [x] Database schema
- [x] Code generation function
- [x] Learner redemption page (`/learner/redeem-code`)
- [x] Redemption request submission
- [x] Auto-approval trigger (creates enrollment on approval)
- [ ] **MISSING**: Admin purchase page (buy codes in bulk)
- [ ] **MISSING**: Admin redemption approval dashboard
- [ ] **MISSING**: Code generation and distribution UI
- [ ] **MISSING**: Purchase history and analytics

---

## What Needs to Be Built

To complete the Enrollment Code System:

1. **Admin Purchase Page** (`/institutional/purchase-courses`)
   - Select course
   - Enter quantity (number of seats)
   - Payment integration
   - Generate codes after payment

2. **Code Management Page** (`/institutional/codes`)
   - View all codes generated
   - See redemption status
   - Download codes as CSV
   - Regenerate or revoke codes

3. **Redemption Approval Dashboard** (`/institutional/redemptions`)
   - List all pending redemption requests
   - Show employee verification details
   - Approve or reject with notes
   - Bulk approval actions

4. **Purchase Analytics**
   - Total spent
   - Codes generated vs redeemed
   - Redemption rate over time
   - Most popular courses

---

## Recommendations

### For Current User (Based on Context)

Your current workflow uses **Email-Based Direct Assignment**:
- Admin assigns courses to employees by email
- System sends invitation links
- Employees click link and get auto-enrolled
- Progress tracked in Assignments dashboard

**You should NOT see enrollment codes in the Assignments dashboard** because:
1. You're using the invitation system (not the code system)
2. Codes are for bulk purchases (different workflow)
3. The invitation link is what you copy and send to employees

### When to Use Which System

**Use Email-Based Assignment when:**
- You know exactly who needs which course
- You want immediate assignment (no approval delay)
- You want to assign courses as needed (not bulk purchase)
- You want to track specific employee progress

**Use Enrollment Code System when:**
- You want to buy seats in bulk (e.g., 100 seats for a course)
- You want employees to self-enroll (with verification)
- You want to set a budget (buy X codes, distribute as needed)
- You want employees to choose when to redeem

---

## Summary

- **Two separate systems, different purposes**
- **Invitation links** = Direct assignment (admin-initiated)
- **Enrollment codes** = Self-service redemption (employee-initiated)
- **Don't mix them** - keep dashboards and workflows separate
- **Current status**: Invitation system fully working, code system needs admin pages


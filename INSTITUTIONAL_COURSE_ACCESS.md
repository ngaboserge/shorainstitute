# Institutional Course Access - Complete Guide

## Two Methods for Course Access

### Method 1: Direct Assignment (Admin-Driven)
**Use Case:** Institution admin directly assigns courses to specific employees

**Flow:**
1. Admin logs into institutional portal
2. Goes to Programmes → "Assign Course"
3. Selects a course
4. Selects target employees (all, department, cohort, or individuals)
5. Sets start date, due date, mandatory flag
6. Clicks "Assign"
7. System automatically enrolls employees
8. Employees receive email notification
9. Course appears in employee's dashboard

**Status:** ✅ FULLY BUILT (needs B2B migration to work)

---

### Method 2: Enrollment Codes (Employee-Driven with Approval)
**Use Case:** Institution buys bulk licenses, employees redeem codes, admin approves

**Flow:**

#### Step 1: Institution Purchases Courses
1. Admin logs into institutional portal
2. Goes to Billing → "Purchase Courses"
3. Selects course and quantity (e.g., 50 seats)
4. Completes payment
5. System creates purchase record

#### Step 2: Generate Enrollment Codes
1. Admin goes to Billing → "My Purchases"
2. Clicks "Generate Codes" for a purchase
3. Chooses quantity (e.g., generate 10 codes from 50-seat purchase)
4. System generates unique codes: `INST-A7K9-M2P4-R8T3`
5. Admin can:
   - Download codes as CSV
   - Copy codes to clipboard
   - Email codes to specific employees

#### Step 3: Employee Redeems Code
1. Employee receives code from HR/Admin
2. Employee logs into learner portal
3. Goes to Courses → "Redeem Code"
4. Enters code: `INST-A7K9-M2P4-R8T3`
5. System validates code:
   - Code exists ✅
   - Code not expired ✅
   - Code not already used ✅
6. Employee fills verification form:
   - Employee ID
   - Department
   - Job Title
7. Submits redemption request

**Status: PENDING APPROVAL** 🟡

#### Step 4: Admin Approves/Rejects
1. Admin sees notification: "New code redemption request"
2. Goes to Learners → "Pending Approvals" tab
3. Sees request with employee info:
   - Name: John Doe
   - Email: john@company.com
   - Employee ID: EMP-12345
   - Department: Finance
   - Code: INST-A7K9-M2P4-R8T3
   - Course: Financial Foundations
4. Admin verifies: "Is this our employee?"
5. Options:
   - **Approve** → Employee gets enrolled, code marked as used
   - **Reject** → Code becomes available again, employee notified

#### Step 5: Auto-Enrollment on Approval
When admin approves:
1. System creates course enrollment
2. Employee added to course
3. Email notification sent to employee
4. Code marked as redeemed
5. Purchase statistics updated

**Status:** 🟡 NEEDS TO BE BUILT

---

## Database Schema

### Tables Created

#### 1. `institution_course_purchases`
Tracks bulk course purchases by institutions.

```sql
- id (UUID)
- institution_id (FK)
- course_id (FK)
- quantity (number of seats purchased)
- price_per_seat
- total_amount
- codes_generated (how many codes created)
- codes_redeemed (how many used)
- codes_approved (how many approved by admin)
- status (active, expired, depleted)
- purchased_at
- expires_at
```

**Example:**
```
RDB purchases 50 seats of "Financial Foundations" for 750,000 RWF
quantity: 50
codes_generated: 0 (admin hasn't generated yet)
codes_redeemed: 0
```

#### 2. `institution_enrollment_codes`
Individual codes generated from purchases.

```sql
- id (UUID)
- purchase_id (FK)
- code (INST-XXXX-XXXX-XXXX)
- code_type (single_use, multi_use)
- status (active, redeemed, expired, revoked)
- approval_status (pending, approved, rejected)
- redeemed_by (user who used the code)
- redeemed_at
- approved_by (admin who approved)
- approved_at
- expires_at
```

**Example:**
```
code: INST-A7K9-M2P4-R8T3
status: active
approval_status: pending (waiting for admin)
redeemed_by: john@company.com
redeemed_at: 2026-01-28 10:30:00
```

#### 3. `code_redemption_requests`
Pending approval requests from employees.

```sql
- id (UUID)
- code_id (FK)
- user_id (employee who redeemed)
- user_email
- user_name
- employee_id (self-reported)
- department (self-reported)
- job_title (self-reported)
- status (pending, approved, rejected)
- reviewed_by (admin who reviewed)
- reviewed_at
- rejection_reason
- requested_at
```

**Example:**
```
user_name: John Doe
user_email: john@company.com
employee_id: EMP-12345
department: Finance
status: pending (waiting for admin approval)
```

---

## UI Components to Build

### 1. Purchase Courses Page
**Path:** `/institutional/billing/purchase`

**Features:**
- Browse available courses
- Select quantity
- See total cost
- Complete purchase
- Payment integration

### 2. Manage Codes Page
**Path:** `/institutional/billing/codes`

**Features:**
- View all purchases
- Generate codes from purchase
- Download codes as CSV
- View redemption statistics
- Revoke unused codes

### 3. Pending Approvals Page
**Path:** `/institutional/learners?tab=approvals`

**Features:**
- List all pending redemption requests
- View employee verification info
- Bulk approve/reject
- Search and filter
- Approval history

### 4. Redeem Code Page (Learner)
**Path:** `/learner/courses/redeem`

**Features:**
- Code input field
- Validation feedback
- Employee verification form
- Success confirmation
- Status tracking ("Pending approval from your institution")

---

## Implementation Checklist

### Phase 1: Database Setup ✅
- [x] Create migration file
- [ ] Run migration in Supabase
- [ ] Verify tables created

### Phase 2: Purchase Flow
- [ ] Build Purchase Courses page
- [ ] Payment integration
- [ ] Purchase confirmation
- [ ] Receipt generation

### Phase 3: Code Management
- [ ] Build Manage Codes page
- [ ] Code generation logic
- [ ] CSV export functionality
- [ ] Code revocation

### Phase 4: Redemption Flow
- [ ] Build Redeem Code page (learner side)
- [ ] Code validation logic
- [ ] Verification form
- [ ] Request submission

### Phase 5: Approval System
- [ ] Build Pending Approvals page
- [ ] Approval/rejection logic
- [ ] Auto-enrollment on approval
- [ ] Email notifications
- [ ] Bulk actions

### Phase 6: Notifications
- [ ] Code redemption email to admin
- [ ] Approval confirmation email to employee
- [ ] Rejection notification email
- [ ] Code expiry reminders

---

## Example User Stories

### Story 1: RDB Purchases Course
1. RDB admin logs in
2. Navigates to Billing → Purchase Courses
3. Selects "Financial Foundations"
4. Enters quantity: 50 seats
5. Pays 750,000 RWF
6. Receives confirmation
7. Purchase appears in "My Purchases"

### Story 2: HR Generates Codes
1. RDB admin goes to Billing → Manage Codes
2. Finds "Financial Foundations" purchase (50 seats)
3. Clicks "Generate Codes"
4. Generates 20 codes
5. Downloads CSV with codes
6. Sends codes to department heads

### Story 3: Employee Redeems Code
1. John Doe receives code from HR: `INST-A7K9-M2P4-R8T3`
2. Logs into learner portal
3. Goes to Courses → Redeem Code
4. Enters code
5. Fills form:
   - Employee ID: EMP-12345
   - Department: Finance
   - Job Title: Analyst
6. Submits request
7. Sees: "Your request is pending approval from RDB"

### Story 4: Admin Approves
1. RDB admin sees notification: "1 new redemption request"
2. Goes to Learners → Pending Approvals
3. Reviews John Doe's request
4. Verifies: Employee ID EMP-12345 exists in RDB
5. Clicks "Approve"
6. John automatically enrolled in course
7. John receives email: "Your code has been approved!"

### Story 5: Admin Rejects
1. Admin sees redemption request from unknown email
2. Email: fake.user@gmail.com
3. Employee ID: doesn't match any RDB employee
4. Admin clicks "Reject"
5. Selects reason: "Not an RDB employee"
6. Code becomes available again
7. User receives email: "Your redemption request was rejected"

---

## Benefits of This System

### For Institutions:
✅ **Control:** Admin approves who gets access
✅ **Flexibility:** Can distribute codes gradually
✅ **Cost Management:** Buy in bulk, distribute on demand
✅ **Verification:** Ensure only real employees get access
✅ **Tracking:** See who redeemed what and when

### For Employees:
✅ **Self-Service:** Can redeem codes anytime
✅ **Transparency:** Know approval status
✅ **Convenience:** Just enter a code

### For Platform:
✅ **Revenue:** Bulk purchases upfront
✅ **Fraud Prevention:** Admin approval required
✅ **Scalability:** Automated enrollment process

---

## Security Considerations

1. **Code Uniqueness:** Each code is cryptographically unique
2. **Single Use:** Codes can only be redeemed once (by default)
3. **Expiration:** Codes can have expiry dates
4. **Approval Required:** Prevents unauthorized access
5. **Audit Trail:** All actions logged with timestamps
6. **Revocation:** Admins can revoke unused codes

---

## Next Steps

1. **Run enrollment codes migration**
2. **Build Purchase Courses UI**
3. **Build Manage Codes UI**
4. **Build Redeem Code UI (learner)**
5. **Build Pending Approvals UI (admin)**
6. **Test complete flow end-to-end**

---

**Ready to implement! 🚀**

## 🎓 Paid Courses System - Complete Implementation Guide

### Overview
This system allows trainers to create paid courses and manually approve learner enrollments after payment verification. Perfect for testing before automating with Stripe.

---

## 📋 Features

### For Trainers:
1. **Create Paid Courses**
   - Set course price (e.g., $99.99)
   - Mark course as paid or free
   - All existing functionality remains

2. **Payment Approval Dashboard**
   - View pending payment requests
   - See learner details, course, amount
   - View payment proof/reference
   - Approve or reject with notes
   - Track approval history

3. **Revenue Tracking**
   - See total revenue from approved payments
   - Filter by course, date range
   - Export reports

### For Learners:
1. **Browse Courses**
   - See price tags on paid courses
   - Free courses show "Free" badge
   - Clear pricing information

2. **Enrollment Flow**
   - **Free courses**: Instant enrollment (as before)
   - **Paid courses**: Payment workflow
     1. Click "Enroll Now ($99)"
     2. Fill payment form
     3. Upload proof of payment
     4. Submit for approval
     5. Wait for trainer approval
     6. Get notified when approved
     7. Access course content

3. **Payment Status Tracking**
   - See "Pending Approval" status
   - View submission details
   - Get notifications on approval/rejection

---

## 🗄️ Database Schema

### New Tables

#### `course_payments`
```sql
- id: UUID (primary key)
- course_id: UUID (foreign key to courses)
- user_id: UUID (foreign key to auth.users)
- amount: DECIMAL(10,2)
- currency: VARCHAR(3) - 'USD', 'RWF', etc.
- payment_method: VARCHAR(50) - 'manual', 'stripe', 'bank'
- payment_reference: VARCHAR(255) - Transaction ID
- payment_proof_url: TEXT - Screenshot URL
- status: VARCHAR(20) - 'pending', 'approved', 'rejected'
- notes: TEXT - Learner notes
- admin_notes: TEXT - Trainer notes
- approved_by: UUID - Trainer who approved
- approved_at: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Modified Tables

#### `courses` - Added columns:
```sql
- is_paid: BOOLEAN - true for paid courses
- price: DECIMAL(10,2) - course price
- currency: VARCHAR(3) - 'USD', 'RWF'
```

#### `enrollments` - Added columns:
```sql
- payment_id: UUID - links to course_payments
- payment_status: VARCHAR(20) - 'free', 'pending', 'paid'
- payment_required: BOOLEAN - true for paid enrollments
```

---

## 🔄 Workflow Diagrams

### Learner Enrollment Flow

```
┌─────────────────┐
│ Browse Courses  │
└────────┬────────┘
         │
    ┌────▼────┐
    │  FREE?  │
    └────┬────┘
         │
    Yes──┼──No
         │    │
         │    └─────────────┐
         │                  │
    ┌────▼──────┐   ┌───────▼────────┐
    │  Instant  │   │  Payment Form  │
    │ Enrollment│   │  - Amount      │
    └────┬──────┘   │  - Reference   │
         │          │  - Proof       │
         │          └───────┬────────┘
         │                  │
         │          ┌───────▼────────┐
         │          │ Submit Payment │
         │          │ Status: Pending│
         │          └───────┬────────┘
         │                  │
         │          ┌───────▼────────┐
         │          │Wait for Trainer│
         │          │    Approval    │
         │          └───────┬────────┘
         │                  │
         │          ┌───────▼────────┐
         │          │   Approved?    │
         │          └───────┬────────┘
         │                  │
         │             Yes──┼──No
         │                  │    │
    ┌────▼──────────────────▼─┐  │
    │  Access Course Content  │  │
    └─────────────────────────┘  │
                              ┌──▼──────┐
                              │ Rejected│
                              │ Try Again│
                              └─────────┘
```

### Trainer Approval Flow

```
┌──────────────────────┐
│ Trainer Dashboard    │
│ "5 Pending Payments" │
└──────────┬───────────┘
           │
    ┌──────▼──────┐
    │View Pending │
    │  Payments   │
    └──────┬──────┘
           │
    ┌──────▼──────────────┐
    │ Review Details:     │
    │ - Learner name      │
    │ - Course            │
    │ - Amount            │
    │ - Payment proof     │
    │ - Reference number  │
    └──────┬──────────────┘
           │
    ┌──────▼──────┐
    │  Decision?  │
    └──────┬──────┘
           │
   Approve─┼─Reject
           │    │
    ┌──────▼─┐  ┌──▼──────┐
    │Add Note│  │Add Note │
    │Approve │  │ Reason  │
    └────┬───┘  └────┬────┘
         │           │
    ┌────▼───────────▼────┐
    │  Auto-Enrollment    │
    │ OR Notify Learner   │
    └─────────────────────┘
```

---

## 💻 Implementation Steps

### Step 1: Database Setup (5 minutes)

1. **Run SQL Script**
   ```bash
   # In Supabase SQL Editor
   Run: SETUP_PAID_COURSES.sql
   ```

2. **Verify Tables Created**
   ```sql
   SELECT * FROM course_payments LIMIT 1;
   SELECT is_paid, price FROM courses LIMIT 5;
   ```

### Step 2: Update Course Creation (Trainer Side)

**File:** `src/pages/trainer/ManageCourses.jsx`

Add to course form:
```jsx
{/* Pricing Section */}
<div className="form-section">
  <h3>Pricing</h3>
  
  <div className="form-group">
    <label className="checkbox-label">
      <input
        type="checkbox"
        checked={formData.is_paid}
        onChange={(e) => setFormData({
          ...formData,
          is_paid: e.target.checked
        })}
      />
      <span>This is a paid course</span>
    </label>
  </div>

  {formData.is_paid && (
    <>
      <div className="form-row">
        <div className="form-group">
          <label>Price *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="99.99"
            value={formData.price}
            onChange={(e) => setFormData({
              ...formData,
              price: e.target.value
            })}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Currency</label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData({
              ...formData,
              currency: e.target.value
            })}
          >
            <option value="USD">USD ($)</option>
            <option value="RWF">RWF (FRw)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>
      </div>
    </>
  )}
</div>
```

### Step 3: Update Course Display (Learner Side)

**File:** `src/pages/learner/Courses.jsx`

Show price on course cards:
```jsx
<div className="course-card">
  <img src={course.thumbnail} alt={course.title} />
  
  {/* Price Badge */}
  {course.is_paid ? (
    <div className="course-price-badge">
      ${course.price}
    </div>
  ) : (
    <div className="course-free-badge">
      Free
    </div>
  )}
  
  <h3>{course.title}</h3>
  <p>{course.description}</p>
  
  <button 
    onClick={() => handleEnroll(course)}
    className="btn btn-primary"
  >
    {course.is_paid ? `Enroll Now ($${course.price})` : 'Enroll Free'}
  </button>
</div>
```

### Step 4: Create Payment Modal (Learner Side)

**New File:** `src/components/PaymentModal.jsx`

```jsx
import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Upload, X } from 'lucide-react'

const PaymentModal = ({ course, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    payment_method: 'bank_transfer',
    payment_reference: '',
    notes: '',
    payment_proof_url: ''
  })
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Create payment record
      const { data, error } = await supabase
        .from('course_payments')
        .insert({
          course_id: course.id,
          user_id: user.id,
          amount: course.price,
          currency: course.currency,
          payment_method: formData.payment_method,
          payment_reference: formData.payment_reference,
          payment_proof_url: formData.payment_proof_url,
          notes: formData.notes,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      alert('✅ Payment submitted for approval!')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error submitting payment:', error)
      alert('Failed to submit payment. Please try again.')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Complete Payment</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>

        <div className="modal-body">
          <div className="payment-summary">
            <h3>{course.title}</h3>
            <div className="amount">
              {course.currency} {course.price}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Payment Method</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({
                  ...formData,
                  payment_method: e.target.value
                })}
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="cash">Cash Payment</option>
              </select>
            </div>

            <div className="form-group">
              <label>Transaction Reference *</label>
              <input
                type="text"
                placeholder="Enter transaction ID or reference number"
                value={formData.payment_reference}
                onChange={(e) => setFormData({
                  ...formData,
                  payment_reference: e.target.value
                })}
                required
              />
            </div>

            <div className="form-group">
              <label>Payment Proof URL</label>
              <input
                type="url"
                placeholder="https://example.com/proof.jpg"
                value={formData.payment_proof_url}
                onChange={(e) => setFormData({
                  ...formData,
                  payment_proof_url: e.target.value
                })}
              />
              <small>Upload screenshot to cloud storage and paste URL</small>
            </div>

            <div className="form-group">
              <label>Notes (Optional)</label>
              <textarea
                rows={3}
                placeholder="Any additional information..."
                value={formData.notes}
                onChange={(e) => setFormData({
                  ...formData,
                  notes: e.target.value
                })}
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Submit Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
```

### Step 5: Create Payment Approval Page (Trainer Side)

**New File:** `src/pages/trainer/PaymentApprovals.jsx`

This will be a comprehensive page where trainers review and approve payments.

---

## 🎨 UI Components Needed

### 1. Price Badges
```css
.course-price-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #10b981;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
}

.course-free-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #0B4F9F;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
}
```

### 2. Payment Status Badges
```css
.payment-status-pending {
  background: #fbbf24;
  color: #92400e;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.payment-status-approved {
  background: #d1fae5;
  color: #065f46;
}

.payment-status-rejected {
  background: #fee2e2;
  color: #991b1b;
}
```

---

## 🔔 Notifications

### Email Templates (Future Enhancement)

**To Learner - Payment Submitted:**
```
Subject: Payment Submitted for [Course Name]

Hi [Learner Name],

Your payment of $[Amount] for "[Course Name]" has been submitted successfully.

Status: Pending Approval
Reference: [Transaction Ref]

You'll receive another email once the trainer reviews your payment.

Thank you!
```

**To Learner - Payment Approved:**
```
Subject: Payment Approved! Access Your Course

Hi [Learner Name],

Great news! Your payment has been approved.

Course: [Course Name]
Amount: $[Amount]

You can now access the course content.
[Access Course Button]
```

**To Trainer - New Payment:**
```
Subject: New Payment Request

Hi [Trainer Name],

You have a new payment request:

Learner: [Name]
Course: [Course Name]
Amount: $[Amount]
Reference: [Transaction Ref]

[Review Payment Button]
```

---

## 📊 Testing Checklist

### Trainer Side:
- [ ] Can mark course as paid
- [ ] Can set price and currency
- [ ] Can view pending payments
- [ ] Can see payment details (learner, amount, proof)
- [ ] Can approve payment
- [ ] Can reject payment with reason
- [ ] Learner gets auto-enrolled on approval
- [ ] Can track revenue

### Learner Side:
- [ ] Can see price on course cards
- [ ] Can distinguish free vs paid courses
- [ ] Payment form opens for paid courses
- [ ] Can submit payment with reference
- [ ] Can upload proof URL
- [ ] Can see "Pending Approval" status
- [ ] Can access course after approval
- [ ] Cannot access course if rejected

---

## 🚀 Future Enhancements (Stripe Integration)

When ready for Stripe:
1. Replace manual payment form with Stripe checkout
2. Auto-approve on successful Stripe payment
3. Keep manual approval as fallback option
4. Add refund functionality
5. Generate invoices automatically

---

## 💡 Recommendations

### For Testing Phase:
1. ✅ **Manual Approval** (current approach)
   - Trainer verifies each payment
   - Prevents fraudulent enrollments
   - Builds trust with early users
   - Easy to troubleshoot

2. **Set Clear Payment Instructions**
   - Provide bank details
   - Specify reference format
   - Request proof of payment
   - Set approval timeframe (e.g., 24 hours)

3. **Communication**
   - Email learners when payment is pending
   - Notify when approved/rejected
   - Provide support contact

### Transition to Automation:
1. Test with 10-20 manual payments first
2. Integrate Stripe payment gateway
3. Keep manual approval as backup option
4. Add fraud detection rules
5. Enable instant access for Stripe payments

---

## 📝 Next Steps

1. ✅ Run `SETUP_PAID_COURSES.sql`
2. ✅ Test database setup
3. ⏳ I'll build the UI components
4. ⏳ Create trainer approval dashboard
5. ⏳ Test complete flow end-to-end

Ready to proceed with implementation? I'll start building the components!

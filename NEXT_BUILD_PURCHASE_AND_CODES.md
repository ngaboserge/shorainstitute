# Next Build: Purchase Courses & Manage Codes Pages

## 🎯 Overview

Two pages need to be built to complete the enrollment code system:
1. **Purchase Courses** - Institution buys course seats
2. **Manage Codes** - Generate and distribute codes from purchases

**Estimated Time:** 8-12 hours total

---

## 📄 Page 1: Purchase Courses

### Route & Location
**Path:** `/institutional/programmes/purchase` or `/institutional/billing/purchase`
**File:** `src/pages/institutional/PurchaseCourses.jsx`
**CSS:** `src/pages/institutional/PurchaseCourses.css`

### Purpose
Allow institutional admins to browse courses and purchase seats in bulk.

### UI Design

#### Section 1: Course Catalogue
```
┌─────────────────────────────────────────────────────┐
│  Purchase Courses                                    │
│  Browse and purchase course seats for your employees │
├─────────────────────────────────────────────────────┤
│                                                       │
│  [Search courses...] [Filter: All ▼] [Sort: A-Z ▼] │
│                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │ [Image]     │  │ [Image]     │  │ [Image]     ││
│  │ Course 1    │  │ Course 2    │  │ Course 3    ││
│  │ Category    │  │ Category    │  │ Category    ││
│  │ 15,000 RWF  │  │ 20,000 RWF  │  │ 12,000 RWF  ││
│  │ [Purchase]  │  │ [Purchase]  │  │ [Purchase]  ││
│  └─────────────┘  └─────────────┘  └─────────────┘│
│                                                       │
└─────────────────────────────────────────────────────┘
```

#### Section 2: Purchase Modal (After clicking "Purchase")
```
┌──────────────────────────────────────────┐
│  Purchase Course Seats                   │
├──────────────────────────────────────────┤
│                                          │
│  Course: Financial Foundations           │
│  Price per seat: 15,000 RWF              │
│                                          │
│  Number of seats: [  10  ] ▲▼           │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ Subtotal:    150,000 RWF           │ │
│  │ Platform fee: 15,000 RWF (10%)     │ │
│  │ Total:       165,000 RWF           │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ○ Pay with Mobile Money                 │
│  ○ Pay with Card                         │
│  ○ Pay Later (Invoice)                   │
│                                          │
│  [Cancel]  [Proceed to Payment]          │
└──────────────────────────────────────────┘
```

### Key Features

1. **Course Catalogue**
   - Display all active courses
   - Show thumbnail, title, category, price
   - Search by course name
   - Filter by category
   - Sort by: name, price, popularity

2. **Purchase Modal**
   - Select number of seats (1-1000)
   - Show price breakdown
   - Calculate total automatically
   - Payment method selection

3. **Payment Integration**
   - Mobile Money (MTN, Airtel)
   - Card payment
   - Invoice option (pay later)

4. **Purchase Confirmation**
   - Show purchase summary
   - Receipt download
   - Redirect to "Manage Codes"

### Data Flow

```javascript
// On "Purchase" button click
const handlePurchase = async (course) => {
  const seats = numberOfSeats
  const total = course.price_per_seat * seats
  
  // Create purchase record
  const { data: purchase } = await supabase
    .from('institution_course_purchases')
    .insert({
      institution_id: institution.id,
      course_id: course.id,
      quantity: seats,
      price_per_seat: course.price_per_seat,
      total_amount: total,
      status: 'pending',
      expires_at: calculateExpiry(365) // 1 year
    })
    .select()
    .single()

  // Process payment
  const payment = await processPayment(total, paymentMethod)
  
  if (payment.success) {
    // Update purchase status
    await supabase
      .from('institution_course_purchases')
      .update({ status: 'active' })
      .eq('id', purchase.id)
    
    // Show success
    navigate('/institutional/billing/codes')
  }
}
```

### API Endpoints Needed

```javascript
// Get all courses
GET /api/courses
Response: { courses: [...] }

// Create purchase
POST /api/purchases
Body: { institution_id, course_id, quantity, payment_method }
Response: { purchase_id, payment_url }

// Process payment
POST /api/payments/xentripay
Body: { purchase_id, amount, payment_method }
Response: { success, transaction_id }
```

---

## 📄 Page 2: Manage Codes

### Route & Location
**Path:** `/institutional/billing/codes` or `/institutional/programmes/codes`
**File:** `src/pages/institutional/ManageCodes.jsx`
**CSS:** `src/pages/institutional/ManageCodes.css`

### Purpose
Generate enrollment codes from purchases, distribute them, and track usage.

### UI Design

#### Section 1: Purchases Overview
```
┌───────────────────────────────────────────────────────────┐
│  Enrollment Codes                                          │
│  Generate and manage codes from your course purchases      │
├───────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │ Total Seats │  │ Codes Gen.  │  │ Codes Used  │      │
│  │    150      │  │     75      │  │     45      │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│                                                             │
│  [Search purchases...] [Filter: Active ▼]                 │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Financial Foundations                                │ │
│  │ Purchased: Jan 28, 2026                              │ │
│  │ Seats: 50 | Generated: 30 | Redeemed: 15            │ │
│  │                                                       │ │
│  │ [Generate Codes] [View Codes] [Download CSV]        │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Business Finance Basics                              │ │
│  │ Purchased: Jan 25, 2026                              │ │
│  │ Seats: 100 | Generated: 45 | Redeemed: 30           │ │
│  │                                                       │ │
│  │ [Generate Codes] [View Codes] [Download CSV]        │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                             │
└───────────────────────────────────────────────────────────┘
```

#### Section 2: Generate Codes Modal
```
┌────────────────────────────────────────┐
│  Generate Enrollment Codes             │
├────────────────────────────────────────┤
│                                        │
│  Course: Financial Foundations         │
│  Available seats: 20 (of 50)           │
│                                        │
│  Number of codes: [  10  ] ▲▼         │
│                                        │
│  Code Type:                            │
│  ● Single-use (one person per code)    │
│  ○ Multi-use (unlimited uses)          │
│                                        │
│  Expiry Date (optional):               │
│  [2026-12-31] 📅                       │
│                                        │
│  [Cancel]  [Generate Codes]            │
└────────────────────────────────────────┘
```

#### Section 3: View Codes Modal
```
┌──────────────────────────────────────────────────────┐
│  Enrollment Codes - Financial Foundations             │
├──────────────────────────────────────────────────────┤
│                                                        │
│  [Search codes...] [Select All]                       │
│                                                        │
│  Actions: [Copy Selected] [Email] [Revoke] [Export]  │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │ ☑ INST-A7K9-M2P4-R8T3  │ Active  │ Not Used   │  │
│  │ ☑ INST-B2X5-Q8W1-K4M7  │ Active  │ Not Used   │  │
│  │ □ INST-C3Y6-N9P2-L5R8  │ Used    │ John Doe   │  │
│  │ □ INST-D4Z7-M1Q3-P6S9  │ Used    │ Jane Smith │  │
│  │ ☑ INST-E5A8-L2R4-N7T1  │ Active  │ Not Used   │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
│  [Close]                                              │
└──────────────────────────────────────────────────────┘
```

### Key Features

1. **Purchases List**
   - Show all course purchases
   - Display seat statistics
   - Filter by status (active, expired, depleted)
   - Sort by date, course name

2. **Code Generation**
   - Specify how many codes to generate
   - Choose single-use or multi-use
   - Set optional expiry date
   - Validate against available seats

3. **Code Management**
   - View all codes for a purchase
   - Copy individual or bulk codes
   - Download codes as CSV
   - Send codes via email
   - Revoke unused codes

4. **Statistics**
   - Total seats purchased
   - Codes generated
   - Codes redeemed
   - Codes pending approval
   - Usage rate %

### Data Flow

```javascript
// Generate codes
const handleGenerateCodes = async (purchaseId, quantity) => {
  const codes = []
  
  for (let i = 0; i < quantity; i++) {
    // Call the database function
    const { data } = await supabase
      .rpc('generate_enrollment_code')
    
    const code = data
    
    // Insert code record
    const { data: codeRecord } = await supabase
      .from('institution_enrollment_codes')
      .insert({
        purchase_id: purchaseId,
        course_id: purchase.course_id,
        institution_id: purchase.institution_id,
        code: code,
        code_type: 'single_use',
        status: 'active',
        expires_at: expiryDate
      })
      .select()
      .single()
    
    codes.push(codeRecord)
  }
  
  // Update purchase statistics
  await supabase
    .from('institution_course_purchases')
    .update({
      codes_generated: purchase.codes_generated + quantity
    })
    .eq('id', purchaseId)
  
  return codes
}

// Download CSV
const handleDownloadCSV = (codes) => {
  const csv = [
    ['Code', 'Course', 'Status', 'Expires', 'Generated On'],
    ...codes.map(c => [
      c.code,
      c.courses.title,
      c.status,
      c.expires_at || 'No expiry',
      new Date(c.created_at).toLocaleDateString()
    ])
  ]
  
  const csvContent = csv.map(row => row.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `enrollment-codes-${Date.now()}.csv`
  link.click()
}

// Email codes
const handleEmailCodes = async (codes, recipients) => {
  // Call email API or Edge Function
  await fetch('/api/email/send-codes', {
    method: 'POST',
    body: JSON.stringify({
      codes: codes.map(c => c.code),
      recipients: recipients,
      course_title: codes[0].courses.title,
      institution_name: institution.name
    })
  })
}

// Revoke code
const handleRevokeCode = async (codeId) => {
  await supabase
    .from('institution_enrollment_codes')
    .update({ 
      status: 'revoked',
      revoked_at: new Date().toISOString()
    })
    .eq('id', codeId)
}
```

### API Endpoints Needed

```javascript
// Get purchases with codes
GET /api/institutional/purchases
Response: { purchases: [...] }

// Generate codes
POST /api/institutional/codes/generate
Body: { purchase_id, quantity, code_type, expires_at }
Response: { codes: [...] }

// Get codes for purchase
GET /api/institutional/purchases/:id/codes
Response: { codes: [...] }

// Revoke code
DELETE /api/institutional/codes/:id
Response: { success: true }

// Email codes
POST /api/institutional/codes/email
Body: { codes, recipients }
Response: { success: true }
```

---

## 🔗 Integration Points

### Link from Billing Page
Add button to existing Billing page:

```jsx
// In src/pages/institutional/Billing.jsx
<div className="quick-actions">
  <button onClick={() => navigate('/institutional/billing/purchase')}>
    <ShoppingCart size={20} />
    Purchase Courses
  </button>
  <button onClick={() => navigate('/institutional/billing/codes')}>
    <Ticket size={20} />
    Manage Codes
  </button>
</div>
```

### Link from Programmes Page
Add action buttons:

```jsx
// In src/pages/institutional/Programmes.jsx
<div className="programme-actions">
  <button onClick={() => navigate('/institutional/programmes/purchase')}>
    <Plus size={18} />
    Purchase More Seats
  </button>
  <button onClick={() => navigate('/institutional/programmes/codes')}>
    <Ticket size={18} />
    Generate Codes
  </button>
</div>
```

---

## 📋 Development Checklist

### Purchase Courses Page
- [ ] Create `PurchaseCourses.jsx` component
- [ ] Create `PurchaseCourses.css` styles
- [ ] Fetch and display course catalogue
- [ ] Build purchase modal
- [ ] Implement payment integration
- [ ] Handle success/error states
- [ ] Add route to `App.jsx`
- [ ] Add navigation links
- [ ] Test end-to-end

### Manage Codes Page
- [ ] Create `ManageCodes.jsx` component
- [ ] Create `ManageCodes.css` styles
- [ ] Fetch and display purchases
- [ ] Build generate codes modal
- [ ] Build view codes modal
- [ ] Implement CSV export
- [ ] Implement email functionality
- [ ] Implement code revocation
- [ ] Add route to `App.jsx`
- [ ] Add navigation links
- [ ] Test end-to-end

---

## 🎨 Design Guidelines

### Colors
- Primary: `#0B4F9F` (Shora blue)
- Success: `#10B981` (green)
- Warning: `#FDB714` (gold)
- Error: `#EF4444` (red)
- Gray: `#666`, `#999`, `#e0e0e0`

### Typography
- Headings: 24-28px, font-weight: 700
- Body: 14-16px, line-height: 1.6
- Small: 12-13px

### Components
- Cards: `border-radius: 12px`, `box-shadow: 0 2px 8px rgba(0,0,0,0.08)`
- Buttons: `border-radius: 8px`, `padding: 12px 24px`
- Inputs: `border: 1px solid #e0e0e0`, `padding: 10px 16px`

---

## 🧪 Testing Scenarios

### Purchase Flow
1. Admin browses courses
2. Clicks "Purchase" on a course
3. Enters quantity: 50 seats
4. Selects payment method
5. Completes payment
6. Sees success confirmation
7. Purchase appears in "Manage Codes"

### Code Generation
1. Admin opens "Manage Codes"
2. Selects a purchase
3. Clicks "Generate Codes"
4. Enters quantity: 10 codes
5. Codes generated successfully
6. Codes visible in "View Codes"

### Code Distribution
1. Admin clicks "View Codes"
2. Selects multiple codes
3. Clicks "Copy Selected"
4. Codes copied to clipboard
5. OR clicks "Download CSV"
6. CSV file downloads

### Code Revocation
1. Admin finds an unused code
2. Clicks "Revoke"
3. Confirms revocation
4. Code status changes to "Revoked"
5. Code cannot be redeemed

---

## 💾 Sample Code Structure

### PurchaseCourses.jsx Template

```jsx
import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { ShoppingCart, Search, Filter } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import './PurchaseCourses.css'

const PurchaseCourses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [quantity, setQuantity] = useState(10)
  
  useEffect(() => {
    fetchCourses()
  }, [])
  
  const fetchCourses = async () => {
    // Implementation
  }
  
  const handlePurchase = async () => {
    // Implementation
  }
  
  return (
    <div className="dashboard-layout">
      <Sidebar type="institutional" />
      <div className="main-content">
        <Header 
          title="Purchase Courses"
          subtitle="Browse and purchase course seats for your employees"
        />
        
        <div className="content-wrapper">
          {/* Course catalogue */}
          {/* Purchase modal */}
        </div>
      </div>
    </div>
  )
}

export default PurchaseCourses
```

### ManageCodes.jsx Template

```jsx
import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Ticket, Download, Mail } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import './ManageCodes.css'

const ManageCodes = () => {
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchPurchases()
  }, [])
  
  const fetchPurchases = async () => {
    // Implementation
  }
  
  const handleGenerateCodes = async (purchaseId, quantity) => {
    // Implementation
  }
  
  const handleDownloadCSV = (codes) => {
    // Implementation
  }
  
  return (
    <div className="dashboard-layout">
      <Sidebar type="institutional" />
      <div className="main-content">
        <Header 
          title="Manage Enrollment Codes"
          subtitle="Generate and distribute codes from your course purchases"
        />
        
        <div className="content-wrapper">
          {/* Statistics */}
          {/* Purchases list */}
          {/* Modals */}
        </div>
      </div>
    </div>
  )
}

export default ManageCodes
```

---

## ⏱️ Estimated Timeline

### Day 1 (4-6 hours): Purchase Courses Page
- ✅ Setup component and routes (30 min)
- ✅ Build course catalogue UI (2 hours)
- ✅ Build purchase modal (1.5 hours)
- ✅ Integrate payment (1-2 hours)
- ✅ Testing (1 hour)

### Day 2 (4-6 hours): Manage Codes Page
- ✅ Setup component and routes (30 min)
- ✅ Build purchases list UI (1.5 hours)
- ✅ Build generate modal (1 hour)
- ✅ Build view codes modal (1 hour)
- ✅ CSV export & email (1.5 hours)
- ✅ Testing (1 hour)

**Total:** 8-12 hours

---

## 🚀 Ready to Build!

Once these two pages are complete, the enrollment code system will be fully functional! 🎉

**Next Steps:**
1. Run database migrations
2. Build Purchase Courses page
3. Build Manage Codes page
4. Test complete flow
5. Deploy!

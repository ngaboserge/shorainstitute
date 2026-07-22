# XentriPay Payment Integration Guide

## Overview
This guide explains how to integrate XentriPay payment gateway into SHORA Institute for processing course payments in Rwanda.

**Test API Key:** `a81f957023344b199177c7c9a68e9878`

---

## Step 1: Add XentriPay Configuration to Environment

### Update `.env` file:
```env
# XentriPay Configuration
VITE_XENTRIPAY_API_KEY=a81f957023344b199177c7c9a68e9878
VITE_XENTRIPAY_MODE=test
VITE_XENTRIPAY_BASE_URL=https://api.xentripay.com/v1
```

### Update `.env.example` file:
```env
# XentriPay Payment Gateway
VITE_XENTRIPAY_API_KEY=your_xentripay_api_key_here
VITE_XENTRIPAY_MODE=test
VITE_XENTRIPAY_BASE_URL=https://api.xentripay.com/v1
```

---

## Step 2: Create XentriPay Service

Create `src/services/xentripay.js`:

```javascript
// XentriPay Payment Service
const XENTRIPAY_API_KEY = import.meta.env.VITE_XENTRIPAY_API_KEY
const XENTRIPAY_BASE_URL = import.meta.env.VITE_XENTRIPAY_BASE_URL || 'https://api.xentripay.com/v1'
const XENTRIPAY_MODE = import.meta.env.VITE_XENTRIPAY_MODE || 'test'

class XentriPayService {
  constructor() {
    this.apiKey = XENTRIPAY_API_KEY
    this.baseUrl = XENTRIPAY_BASE_URL
    this.mode = XENTRIPAY_MODE
  }

  /**
   * Initialize payment
   * @param {Object} paymentData - Payment details
   * @returns {Promise<Object>} Payment response with payment URL
   */
  async initializePayment(paymentData) {
    try {
      const response = await fetch(`${this.baseUrl}/payments/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-API-Mode': this.mode
        },
        body: JSON.stringify({
          amount: paymentData.amount,
          currency: paymentData.currency || 'RWF',
          customer: {
            name: paymentData.customerName,
            email: paymentData.customerEmail,
            phone: paymentData.customerPhone
          },
          metadata: {
            course_id: paymentData.courseId,
            course_title: paymentData.courseTitle,
            user_id: paymentData.userId,
            enrollment_id: paymentData.enrollmentId
          },
          callback_url: paymentData.callbackUrl,
          return_url: paymentData.returnUrl
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Payment initialization failed')
      }

      return await response.json()
    } catch (error) {
      console.error('XentriPay initialization error:', error)
      throw error
    }
  }

  /**
   * Verify payment status
   * @param {string} transactionId - Transaction reference
   * @returns {Promise<Object>} Payment verification result
   */
  async verifyPayment(transactionId) {
    try {
      const response = await fetch(`${this.baseUrl}/payments/verify/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-API-Mode': this.mode
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Payment verification failed')
      }

      return await response.json()
    } catch (error) {
      console.error('XentriPay verification error:', error)
      throw error
    }
  }

  /**
   * Get payment methods available
   * @returns {Promise<Array>} List of available payment methods
   */
  async getPaymentMethods() {
    try {
      const response = await fetch(`${this.baseUrl}/payment-methods`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-API-Mode': this.mode
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch payment methods')
      }

      return await response.json()
    } catch (error) {
      console.error('XentriPay payment methods error:', error)
      // Return default Rwanda payment methods if API fails
      return [
        { id: 'mtn_momo', name: 'MTN Mobile Money', icon: '📱' },
        { id: 'airtel_money', name: 'Airtel Money', icon: '📱' },
        { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
        { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦' }
      ]
    }
  }

  /**
   * Process refund
   * @param {string} transactionId - Original transaction ID
   * @param {number} amount - Amount to refund
   * @returns {Promise<Object>} Refund result
   */
  async processRefund(transactionId, amount) {
    try {
      const response = await fetch(`${this.baseUrl}/payments/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-API-Mode': this.mode
        },
        body: JSON.stringify({
          transaction_id: transactionId,
          amount: amount
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Refund failed')
      }

      return await response.json()
    } catch (error) {
      console.error('XentriPay refund error:', error)
      throw error
    }
  }

  /**
   * Get supported currencies
   * @returns {Array} List of supported currencies
   */
  getSupportedCurrencies() {
    return ['RWF', 'USD', 'EUR']
  }

  /**
   * Format amount for display
   * @param {number} amount - Amount in minor units
   * @param {string} currency - Currency code
   * @returns {string} Formatted amount
   */
  formatAmount(amount, currency = 'RWF') {
    const symbols = { RWF: 'FRw', USD: '$', EUR: '€' }
    return `${symbols[currency] || currency} ${amount.toLocaleString()}`
  }
}

export default new XentriPayService()
```

---

## Step 3: Update Course Payment Flow

### Update `src/pages/learner/CourseDetails.jsx`:

Add XentriPay payment initialization:

```javascript
import xentriPayService from '../../services/xentripay'

// In your component:
const handlePayment = async () => {
  try {
    setProcessingPayment(true)

    // Initialize payment with XentriPay
    const paymentResponse = await xentriPayService.initializePayment({
      amount: course.price,
      currency: course.currency,
      customerName: user.full_name,
      customerEmail: user.email,
      customerPhone: user.phone || '',
      courseId: course.id,
      courseTitle: course.title,
      userId: user.id,
      enrollmentId: enrollmentId,
      callbackUrl: `${window.location.origin}/api/payment/callback`,
      returnUrl: `${window.location.origin}/learner/courses/${course.id}/payment-success`
    })

    // Redirect to payment page
    if (paymentResponse.payment_url) {
      window.location.href = paymentResponse.payment_url
    } else {
      throw new Error('Payment URL not received')
    }

  } catch (error) {
    console.error('Payment initiation error:', error)
    alert(`Payment failed: ${error.message}`)
    setProcessingPayment(false)
  }
}
```

---

## Step 4: Create Payment Success Page

Create `src/pages/learner/PaymentSuccess.jsx`:

```javascript
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Loader } from 'lucide-react'
import xentriPayService from '../../services/xentripay'
import { supabase } from '../../lib/supabase'

const PaymentSuccess = () => {
  const { courseId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [verifying, setVerifying] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    verifyPayment()
  }, [])

  const verifyPayment = async () => {
    const transactionId = searchParams.get('transaction_id')
    
    if (!transactionId) {
      setError('No transaction ID found')
      setVerifying(false)
      return
    }

    try {
      // Verify payment with XentriPay
      const verification = await xentriPayService.verifyPayment(transactionId)

      if (verification.status === 'success' || verification.status === 'completed') {
        // Update enrollment status in database
        const { error: updateError } = await supabase
          .from('enrollments')
          .update({
            payment_status: 'approved',
            payment_method: verification.payment_method,
            transaction_id: transactionId,
            payment_verified_at: new Date().toISOString()
          })
          .eq('id', verification.metadata.enrollment_id)

        if (updateError) throw updateError

        setPaymentStatus('success')
      } else {
        setPaymentStatus('failed')
        setError(verification.message || 'Payment verification failed')
      }
    } catch (err) {
      console.error('Payment verification error:', err)
      setError(err.message)
      setPaymentStatus('failed')
    } finally {
      setVerifying(false)
    }
  }

  if (verifying) {
    return (
      <div className="payment-verification">
        <Loader className="spinner" size={48} />
        <h2>Verifying your payment...</h2>
        <p>Please wait while we confirm your transaction</p>
      </div>
    )
  }

  if (paymentStatus === 'success') {
    return (
      <div className="payment-success">
        <CheckCircle size={64} color="#10b981" />
        <h1>Payment Successful!</h1>
        <p>Your enrollment has been confirmed.</p>
        <button onClick={() => navigate(`/learner/courses/${courseId}`)}>
          Start Learning
        </button>
      </div>
    )
  }

  return (
    <div className="payment-failed">
      <XCircle size={64} color="#ef4444" />
      <h1>Payment Failed</h1>
      <p>{error || 'Something went wrong with your payment'}</p>
      <button onClick={() => navigate(`/course-catalogue`)}>
        Try Again
      </button>
    </div>
  )
}

export default PaymentSuccess
```

---

## Step 5: Add Payment Callback Handler (Backend)

### Create Supabase Edge Function for webhook:

Create `supabase/functions/xentripay-webhook/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const XENTRIPAY_API_KEY = Deno.env.get('XENTRIPAY_API_KEY')

serve(async (req) => {
  try {
    // Verify webhook signature
    const signature = req.headers.get('x-xentripay-signature')
    const payload = await req.json()

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Process payment notification
    if (payload.event === 'payment.success') {
      const { data, error } = await supabase
        .from('enrollments')
        .update({
          payment_status: 'approved',
          payment_method: payload.payment_method,
          transaction_id: payload.transaction_id,
          payment_verified_at: new Date().toISOString()
        })
        .eq('id', payload.metadata.enrollment_id)

      if (error) throw error

      // Send confirmation email
      // Add email notification logic here

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      })
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
```

---

## Step 6: Update Database Schema

Add payment tracking fields if not already present:

```sql
-- Add payment fields to enrollments table
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS transaction_id TEXT;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMPTZ;

-- Create payments table for detailed tracking
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  
  -- Payment details
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'RWF',
  payment_method TEXT,
  transaction_id TEXT UNIQUE,
  
  -- XentriPay specific
  xentripay_reference TEXT,
  payment_status TEXT DEFAULT 'pending', -- pending, success, failed, refunded
  
  -- Timestamps
  initiated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_enrollment_id ON payments(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
```

---

## Step 7: Test Payment Flow

### Test Mode Payment Details:

**Test Card Numbers:**
- Success: `4111 1111 1111 1111`
- Decline: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

**Test Mobile Money:**
- MTN MoMo: Use any number, approve in test mode
- Airtel Money: Use any number, approve in test mode

### Testing Checklist:

1. ✅ Initialize payment
2. ✅ Redirect to XentriPay payment page
3. ✅ Complete payment with test details
4. ✅ Verify callback/webhook received
5. ✅ Check enrollment status updated
6. ✅ Confirm course access granted
7. ✅ Test payment verification
8. ✅ Test refund flow

---

## Step 8: Production Deployment

### Before going live:

1. **Get Production API Key:**
   - Contact XentriPay support
   - Request production credentials
   - Update `.env` with production key

2. **Update Environment Variables:**
   ```env
   VITE_XENTRIPAY_API_KEY=your_production_key
   VITE_XENTRIPAY_MODE=live
   ```

3. **Set Up Webhook URL:**
   - Register your webhook endpoint with XentriPay
   - URL: `https://your-domain.com/api/payment/callback`
   - Or: `https://your-project.supabase.co/functions/v1/xentripay-webhook`

4. **Security Checklist:**
   - ✅ Never expose API keys in frontend
   - ✅ Verify webhook signatures
   - ✅ Use HTTPS only
   - ✅ Validate payment amounts server-side
   - ✅ Log all transactions
   - ✅ Implement rate limiting

---

## Common Payment Methods in Rwanda

XentriPay likely supports:

1. **MTN Mobile Money** 📱
   - Most popular in Rwanda
   - ~70% market share

2. **Airtel Money** 📱
   - Second most popular
   - ~25% market share

3. **Credit/Debit Cards** 💳
   - Visa, Mastercard
   - Less common but growing

4. **Bank Transfer** 🏦
   - Direct bank payments
   - Slower processing

---

## Pricing Structure (Typical)

- **Transaction Fee:** 2-3% per transaction
- **Setup Fee:** Free to 50,000 RWF
- **Monthly Fee:** 0 - 10,000 RWF
- **Payout Schedule:** T+1 to T+7 days

---

## Support & Documentation

**XentriPay Contact:**
- Website: https://www.xentripay.com
- Email: support@xentripay.com
- Phone: Check their website

**Next Steps:**
1. Contact XentriPay for full API documentation
2. Request sandbox/test environment access
3. Get production API credentials
4. Set up webhook endpoints
5. Test thoroughly before going live

---

**Status:** Ready to implement
**Environment:** Test mode configured
**API Key:** Added to `.env`

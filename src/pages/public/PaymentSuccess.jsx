import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Loader, AlertCircle, Home, BookOpen } from 'lucide-react'
import { checkPaymentStatus } from '../../services/paymentService'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import './PaymentSuccess.css'

const PaymentSuccess = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const referenceId = searchParams.get('ref')
  
  const [status, setStatus] = useState('verifying') // verifying | success | approved | failed | error
  const [paymentData, setPaymentData] = useState(null)
  const [courseData, setCourseData] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    if (!referenceId) {
      setStatus('error')
      setErrorMessage('Invalid payment reference')
      return
    }

    verifyPayment()
  }, [referenceId])

  const verifyPayment = async () => {
    try {
      // Check payment status with XentriPay
      const statusResult = await checkPaymentStatus(referenceId)
      
      if (statusResult.status === 'success') {
        // Load payment details from database
        const { data: payment, error: paymentError } = await supabase
          .from('course_payments')
          .select('*')
          .eq('reference_id', referenceId)
          .single()

        if (paymentError) throw paymentError

        // Load course details
        const { data: course, error: courseError } = await supabase
          .from('courses')
          .select('id, title, thumbnail_url, instructor_name')
          .eq('id', payment.course_id)
          .single()

        if (courseError) throw courseError

        // Load enrollment status
        const { data: enrollment, error: enrollmentError } = await supabase
          .from('enrollments')
          .select('payment_status')
          .eq('user_id', payment.user_id)
          .eq('course_id', payment.course_id)
          .single()

        setPaymentData(payment)
        setCourseData(course)
        setStatus('success')
        
        // Check if enrollment is approved or still pending
        if (enrollment && enrollment.payment_status === 'approved') {
          setStatus('approved')
        } else {
          setStatus('success') // Payment confirmed, awaiting approval
        }
      } else if (statusResult.status === 'failed') {
        setStatus('failed')
        setErrorMessage('Payment was not completed or was cancelled')
      } else {
        // Still pending - keep checking
        setTimeout(verifyPayment, 3000)
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
      setStatus('error')
      setErrorMessage(error.message || 'Failed to verify payment status')
    }
  }

  const formatPrice = (amount, currency) => {
    const symbols = { RWF: 'FRw', USD: '$', EUR: '€' }
    return `${symbols[currency] || currency} ${parseFloat(amount).toLocaleString()}`
  }

  if (status === 'verifying') {
    return (
      <div className="payment-success-container">
        <div className="payment-success-card">
          <div className="payment-success-icon verifying">
            <Loader size={64} className="spinning" />
          </div>
          <h1>Verifying Your Payment</h1>
          <p>Please wait while we confirm your payment with XentriPay...</p>
          <div className="reference-display">
            <span className="reference-label">Reference:</span>
            <code>{referenceId}</code>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'success' && paymentData && courseData) {
    return (
      <div className="payment-success-container">
        <div className="payment-success-card success">
          <div className="payment-success-icon success" style={{background: '#dbeafe', color: '#1e40af'}}>
            <AlertCircle size={80} />
          </div>
          <h1>Payment Confirmed!</h1>
          <p className="success-message" style={{color: '#1e40af'}}>
            Your payment has been confirmed by XentriPay. The trainer will review and approve your enrollment shortly.
          </p>

          {/* Course Info */}
          <div className="enrolled-course-info">
            {courseData.thumbnail_url && (
              <img 
                src={courseData.thumbnail_url} 
                alt={courseData.title}
                className="course-thumbnail"
              />
            )}
            <div className="course-details">
              <h2>{courseData.title}</h2>
              <p className="instructor">by {courseData.instructor_name}</p>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="payment-summary-box">
            <h3>Payment Summary</h3>
            <div className="summary-row">
              <span>Amount Paid:</span>
              <strong>{formatPrice(paymentData.amount, paymentData.currency)}</strong>
            </div>
            <div className="summary-row">
              <span>Payment Method:</span>
              <span>{paymentData.payment_method?.replace('_', ' ')}</span>
            </div>
            <div className="summary-row">
              <span>Transaction ID:</span>
              <code className="transaction-id">{paymentData.provider_ref_id || referenceId}</code>
            </div>
            <div className="summary-row">
              <span>Status:</span>
              <span style={{color: '#1e40af', fontWeight: 600}}>Awaiting Trainer Approval</span>
            </div>
            <div className="summary-row">
              <span>Date:</span>
              <span>{new Date(paymentData.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              className="btn btn-primary btn-large"
              onClick={() => navigate('/learner/dashboard')}
            >
              <Home size={20} />
              Go to Dashboard
            </button>
          </div>

          <div className="receipt-notice" style={{background: '#dbeafe', color: '#1e40af'}}>
            <AlertCircle size={16} />
            <span>You will receive course access once the trainer approves your enrollment. This usually takes a few hours.</span>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'approved' && paymentData && courseData) {
    return (
      <div className="payment-success-container">
        <div className="payment-success-card success">
          <div className="payment-success-icon success">
            <CheckCircle size={80} />
          </div>
          <h1>Enrolled Successfully!</h1>
          <p className="success-message">
            Your payment has been approved and you are now enrolled in the course.
          </p>

          {/* Course Info */}
          <div className="enrolled-course-info">
            {courseData.thumbnail_url && (
              <img 
                src={courseData.thumbnail_url} 
                alt={courseData.title}
                className="course-thumbnail"
              />
            )}
            <div className="course-details">
              <h2>{courseData.title}</h2>
              <p className="instructor">by {courseData.instructor_name}</p>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="payment-summary-box">
            <h3>Payment Summary</h3>
            <div className="summary-row">
              <span>Amount Paid:</span>
              <strong>{formatPrice(paymentData.amount, paymentData.currency)}</strong>
            </div>
            <div className="summary-row">
              <span>Payment Method:</span>
              <span>{paymentData.payment_method?.replace('_', ' ')}</span>
            </div>
            <div className="summary-row">
              <span>Transaction ID:</span>
              <code className="transaction-id">{paymentData.provider_ref_id || referenceId}</code>
            </div>
            <div className="summary-row">
              <span>Date:</span>
              <span>{new Date(paymentData.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              className="btn btn-primary btn-large"
              onClick={() => navigate(`/learner/courses`)}
            >
              <BookOpen size={20} />
              Go to My Courses
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/learner/dashboard')}
            >
              <Home size={20} />
              Dashboard
            </button>
          </div>

          <div className="receipt-notice">
            <AlertCircle size={16} />
            <span>A payment receipt has been recorded in your account.</span>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="payment-success-container">
        <div className="payment-success-card failed">
          <div className="payment-success-icon failed">
            <XCircle size={80} />
          </div>
          <h1>Payment Failed</h1>
          <p className="error-message">
            {errorMessage || 'Your payment was not completed. Please try again.'}
          </p>

          <div className="reference-display">
            <span className="reference-label">Reference:</span>
            <code>{referenceId}</code>
          </div>

          <div className="action-buttons">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/learner/browse')}
            >
              Try Again
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/learner/dashboard')}
            >
              <Home size={20} />
              Go to Dashboard
            </button>
          </div>

          <div className="help-text">
            <p>If you continue to experience issues, please contact support with the reference number above.</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  return (
    <div className="payment-success-container">
      <div className="payment-success-card error">
        <div className="payment-success-icon error">
          <AlertCircle size={80} />
        </div>
        <h1>Unable to Verify Payment</h1>
        <p className="error-message">
          {errorMessage || 'We could not verify your payment at this time.'}
        </p>

        {referenceId && (
          <div className="reference-display">
            <span className="reference-label">Reference:</span>
            <code>{referenceId}</code>
          </div>
        )}

        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Retry Verification
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/learner/dashboard')}
          >
            <Home size={20} />
            Go to Dashboard
          </button>
        </div>

        <div className="help-text">
          <p>If your payment was successful but verification failed, your enrollment will be processed automatically. Check your courses in a few minutes or contact support.</p>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess

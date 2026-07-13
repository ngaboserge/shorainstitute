import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { X, Upload, DollarSign, CreditCard, AlertCircle } from 'lucide-react'
import './PaymentModal.css'

const PaymentModal = ({ course, user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    payment_method: 'bank_transfer',
    payment_reference: '',
    notes: '',
    payment_proof_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      // Create payment record
      const { data, error: paymentError } = await supabase
        .from('course_payments')
        .insert({
          course_id: course.id,
          user_id: user.id,
          amount: course.price,
          currency: course.currency || 'USD',
          payment_method: formData.payment_method,
          payment_reference: formData.payment_reference,
          payment_proof_url: formData.payment_proof_url,
          notes: formData.notes,
          status: 'pending'
        })
        .select()
        .single()

      if (paymentError) throw paymentError

      // Create pending enrollment
      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: course.id,
          payment_id: data.id,
          payment_status: 'pending',
          payment_required: true
        })

      if (enrollmentError) throw enrollmentError

      alert('✅ Payment submitted successfully! You will be notified once the trainer approves your payment.')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error submitting payment:', error)
      setError('Failed to submit payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price, currency) => {
    const symbol = currency === 'USD' ? '$' : currency === 'RWF' ? 'FRw' : '€'
    return `${symbol}${parseFloat(price).toFixed(2)}`
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Complete Payment</h2>
            <p style={{fontSize: '14px', color: '#666', marginTop: '4px'}}>
              Submit your payment details for verification
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {/* Payment Summary */}
          <div className="payment-summary">
            <div className="summary-header">
              <DollarSign size={24} />
              <span>Payment Summary</span>
            </div>
            <div className="summary-content">
              <div className="summary-row">
                <span>Course:</span>
                <strong>{course.title}</strong>
              </div>
              <div className="summary-row">
                <span>Instructor:</span>
                <span>{course.instructor_name}</span>
              </div>
              <div className="summary-row total">
                <span>Total Amount:</span>
                <strong className="amount">{formatPrice(course.price, course.currency)}</strong>
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="payment-instructions">
            <h4>📋 Payment Instructions</h4>
            <ol>
              <li>Make payment using your preferred method below</li>
              <li>Keep your transaction reference/ID</li>
              <li>Upload proof of payment (optional but recommended)</li>
              <li>Submit this form for trainer approval</li>
              <li>You'll be notified once approved (usually within 24 hours)</li>
            </ol>
          </div>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="payment-form">
            <div className="form-group">
              <label>Payment Method *</label>
              <select
                className="form-select"
                value={formData.payment_method}
                onChange={(e) => setFormData({
                  ...formData,
                  payment_method: e.target.value
                })}
                required
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_money">Mobile Money (MTN/Airtel)</option>
                <option value="cash">Cash Payment</option>
                <option value="other">Other</option>
              </select>
            </div>

            {formData.payment_method === 'bank_transfer' && (
              <div className="bank-details">
                <h4>Bank Account Details</h4>
                <p><strong>Bank:</strong> Bank of Kigali</p>
                <p><strong>Account Name:</strong> Shora Institute</p>
                <p><strong>Account Number:</strong> 123456789</p>
                <p><strong>Branch:</strong> Kigali Main</p>
              </div>
            )}

            {formData.payment_method === 'mobile_money' && (
              <div className="bank-details">
                <h4>Mobile Money Details</h4>
                <p><strong>MTN MoMo:</strong> *182*8*1*XXXXXX#</p>
                <p><strong>Airtel Money:</strong> *500*XXXXXX#</p>
                <p><strong>Name:</strong> Shora Institute</p>
              </div>
            )}

            <div className="form-group">
              <label>Transaction Reference / ID *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., TXN123456789 or screenshot reference"
                value={formData.payment_reference}
                onChange={(e) => setFormData({
                  ...formData,
                  payment_reference: e.target.value
                })}
                required
              />
              <small className="help-text">
                Enter the transaction ID from your payment confirmation
              </small>
            </div>

            <div className="form-group">
              <label>Payment Proof URL (Optional)</label>
              <div className="input-with-icon">
                <Upload size={20} />
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://example.com/payment-proof.jpg"
                  value={formData.payment_proof_url}
                  onChange={(e) => setFormData({
                    ...formData,
                    payment_proof_url: e.target.value
                  })}
                  style={{paddingLeft: '44px'}}
                />
              </div>
              <small className="help-text">
                Upload screenshot to Google Drive/Dropbox and paste public link here
              </small>
            </div>

            <div className="form-group">
              <label>Additional Notes (Optional)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Any additional information about your payment..."
                value={formData.notes}
                onChange={(e) => setFormData({
                  ...formData,
                  notes: e.target.value
                })}
              />
            </div>

            <div className="form-notice">
              <AlertCircle size={18} />
              <div>
                <strong>Important:</strong> Your enrollment will be pending until the trainer verifies your payment. 
                You'll receive an email notification once approved.
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <CreditCard size={18} className="spinning" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    Submit Payment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal

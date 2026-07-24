import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  DollarSign, Search, Filter, Check, X, Eye, ExternalLink, 
  Clock, CheckCircle, XCircle, AlertCircle, User, BookOpen 
} from 'lucide-react'
import './PaymentApprovals.css'

const PaymentApprovals = () => {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('confirmed')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    if (user) {
      loadPayments()
    }
  }, [user, filterStatus])

  const loadPayments = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('course_payments')
        .select(`
          *,
          courses (
            id,
            title,
            instructor_id
          )
        `)
        .order('created_at', { ascending: false })

      // Filter by status
      // 'confirmed' = XentriPay confirmed payment, awaiting trainer approval
      // 'pending' = Payment initiated but not yet confirmed by gateway
      if (filterStatus !== 'all') {
        if (filterStatus === 'pending') {
          // Show both 'pending' (gateway pending) and 'confirmed' (awaiting approval)
          query = query.in('status', ['pending', 'confirmed'])
        } else {
          query = query.eq('status', filterStatus)
        }
      }

      const { data, error } = await query

      if (error) throw error

      // Filter to show only payments for this trainer's courses
      let filtered = data?.filter(p => p.courses?.instructor_id === user.id) || []
      
      // Fetch learner emails using custom function
      if (filtered.length > 0) {
        const enrichedPayments = await Promise.all(
          filtered.map(async (payment) => {
            const { data: emailData, error } = await supabase
              .rpc('get_user_email', { user_id: payment.user_id })
            
            const learnerEmail = emailData || `User ${payment.user_id.slice(0, 13)}...`
            
            return {
              ...payment,
              learner_email: learnerEmail,
              learner_name: learnerEmail
            }
          })
        )
        
        filtered = enrichedPayments
      }
      
      setPayments(filtered)
    } catch (error) {
      console.error('Error loading payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (payment) => {
    if (!confirm(`Approve payment of ${formatPrice(payment.amount, payment.currency)} from ${getUserEmail(payment)}?\n\nThis will enroll the learner in the course.`)) {
      return
    }

    setActionLoading(true)
    try {
      // Use the new approve_course_payment RPC function
      const { data, error } = await supabase.rpc('approve_course_payment', {
        p_payment_id: payment.id,
        p_approved_by: user.id,
        p_admin_notes: adminNotes || null
      })

      if (error) throw error
      
      if (!data?.success) {
        throw new Error(data?.error || 'Failed to approve payment')
      }

      alert('✅ Payment approved! Learner has been enrolled in the course.')
      setAdminNotes('')
      setShowDetailsModal(false)
      loadPayments()
    } catch (error) {
      console.error('Error approving payment:', error)
      alert(`Failed to approve payment: ${error.message}`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (payment) => {
    const reason = adminNotes || prompt('Please provide a reason for rejection:')
    if (!reason) {
      alert('Please provide a reason for rejection')
      return
    }

    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('course_payments')
        .update({
          status: 'rejected',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          admin_notes: reason
        })
        .eq('id', payment.id)

      if (error) throw error

      alert('Payment rejected. Learner will be notified.')
      setAdminNotes('')
      setShowDetailsModal(false)
      loadPayments()
    } catch (error) {
      console.error('Error rejecting payment:', error)
      alert('Failed to reject payment. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const getUserEmail = (payment) => {
    return payment.learner_email || payment.user_id || 'Unknown'
  }

  const formatPrice = (amount, currency) => {
    const symbol = currency === 'USD' ? '$' : currency === 'RWF' ? 'FRw' : '€'
    return `${symbol}${parseFloat(amount).toFixed(2)}`
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: Clock, color: '#f59e0b', bg: '#fef3c7', text: '#92400e', label: 'Initiated' },
      confirmed: { icon: AlertCircle, color: '#3b82f6', bg: '#dbeafe', text: '#1e40af', label: 'Awaiting Approval' },
      approved: { icon: CheckCircle, color: '#10b981', bg: '#d1fae5', text: '#065f46', label: 'Approved' },
      rejected: { icon: XCircle, color: '#ef4444', bg: '#fee2e2', text: '#991b1b', label: 'Rejected' }
    }
    
    const badge = badges[status] || badges.pending
    const Icon = badge.icon

    return (
      <span 
        className="status-badge"
        style={{ 
          background: badge.bg, 
          color: badge.text,
          border: `1px solid ${badge.color}20`
        }}
      >
        <Icon size={14} />
        {badge.label}
      </span>
    )
  }

  const filteredPayments = payments.filter(payment =>
    getUserEmail(payment).toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.courses?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.payment_reference?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    pending: payments.filter(p => p.status === 'pending' || p.status === 'confirmed').length,
    confirmed: payments.filter(p => p.status === 'confirmed').length,
    approved: payments.filter(p => p.status === 'approved').length,
    rejected: payments.filter(p => p.status === 'rejected').length,
    total_revenue: payments
      .filter(p => p.status === 'approved')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0)
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="trainer" />
        <div className="main-content">
          <Header title="Payment Approvals" subtitle="Loading..." />
          <div className="content-wrapper">
            <div className="card">Loading payments...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">
      <Sidebar type="trainer" />
      <div className="main-content">
        <Header 
          title="Payment Approvals" 
          subtitle="Review and approve learner payment submissions"
        />
        
        <div className="content-wrapper">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card pending" style={{background: '#dbeafe', borderColor: '#3b82f6'}}>
              <div className="stat-icon" style={{color: '#1e40af'}}>
                <AlertCircle size={24} />
              </div>
              <div className="stat-details">
                <div className="stat-value">{stats.confirmed}</div>
                <div className="stat-label">Awaiting Approval</div>
              </div>
            </div>

            <div className="stat-card pending">
              <div className="stat-icon">
                <Clock size={24} />
              </div>
              <div className="stat-details">
                <div className="stat-value">{stats.pending - stats.confirmed}</div>
                <div className="stat-label">Payment Initiated</div>
              </div>
            </div>

            <div className="stat-card approved">
              <div className="stat-icon">
                <CheckCircle size={24} />
              </div>
              <div className="stat-details">
                <div className="stat-value">{stats.approved}</div>
                <div className="stat-label">Approved</div>
              </div>
            </div>

            <div className="stat-card revenue">
              <div className="stat-icon">
                <DollarSign size={24} />
              </div>
              <div className="stat-details">
                <div className="stat-value">${stats.total_revenue.toFixed(2)}</div>
                <div className="stat-label">Total Revenue</div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="filters-bar">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search by learner, course, or reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-buttons">
              <button
                className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                All
              </button>
              <button
                className={`filter-btn ${filterStatus === 'confirmed' ? 'active' : ''}`}
                onClick={() => setFilterStatus('confirmed')}
                style={{background: filterStatus === 'confirmed' ? '#3b82f6' : undefined}}
              >
                Awaiting Approval ({stats.confirmed})
              </button>
              <button
                className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
                onClick={() => setFilterStatus('pending')}
              >
                All Pending ({stats.pending})
              </button>
              <button
                className={`filter-btn ${filterStatus === 'approved' ? 'active' : ''}`}
                onClick={() => setFilterStatus('approved')}
              >
                Approved
              </button>
              <button
                className={`filter-btn ${filterStatus === 'rejected' ? 'active' : ''}`}
                onClick={() => setFilterStatus('rejected')}
              >
                Rejected
              </button>
            </div>
          </div>

          {/* Payments List */}
          <div className="card">
            <h3>Payment Submissions</h3>
            
            {filteredPayments.length === 0 ? (
              <div className="empty-state">
                <AlertCircle size={48} />
                <h4>No payments found</h4>
                <p>
                  {filterStatus === 'confirmed'
                    ? 'No payments awaiting your approval'
                    : filterStatus === 'pending' 
                    ? 'No pending payments to review'
                    : `No ${filterStatus} payments found`
                  }
                </p>
              </div>
            ) : (
              <div className="payments-table">
                <table>
                  <thead>
                    <tr>
                      <th>Learner</th>
                      <th>Course</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Reference</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td>
                          <div className="learner-cell">
                            <User size={16} />
                            {getUserEmail(payment)}
                          </div>
                        </td>
                        <td>
                          <div className="course-cell">
                            <BookOpen size={16} />
                            {payment.courses?.title}
                          </div>
                        </td>
                        <td>
                          <strong>{formatPrice(payment.amount, payment.currency)}</strong>
                        </td>
                        <td>
                          <span className="method-badge">
                            {payment.payment_method?.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <code className="reference-code" title={`XentriPay: ${payment.provider_ref_id || 'N/A'}`}>
                            {payment.reference_id || payment.payment_reference}
                          </code>
                        </td>
                        <td>{getStatusBadge(payment.status)}</td>
                        <td>
                          {new Date(payment.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon"
                              onClick={() => {
                                setSelectedPayment(payment)
                                setShowDetailsModal(true)
                              }}
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            {(payment.status === 'pending' || payment.status === 'confirmed') && (
                              <>
                                <button
                                  className="btn-icon success"
                                  onClick={() => handleApprove(payment)}
                                  title="Approve"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  className="btn-icon danger"
                                  onClick={() => {
                                    setSelectedPayment(payment)
                                    setShowDetailsModal(true)
                                  }}
                                  title="Reject"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Payment Details</h2>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="payment-details-grid">
                <div className="detail-section">
                  <h4>Learner Information</h4>
                  <div className="detail-row">
                    <span>Email:</span>
                    <strong>{getUserEmail(selectedPayment)}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Submitted:</span>
                    <span>{new Date(selectedPayment.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Course Information</h4>
                  <div className="detail-row">
                    <span>Course:</span>
                    <strong>{selectedPayment.courses?.title}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Amount:</span>
                    <strong style={{fontSize: '20px', color: '#10b981'}}>
                      {formatPrice(selectedPayment.amount, selectedPayment.currency)}
                    </strong>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Payment Information</h4>
                  <div className="detail-row">
                    <span>Payment Gateway:</span>
                    <strong style={{color: '#6366f1', textTransform: 'uppercase'}}>
                      {selectedPayment.payment_provider || 'XentriPay'}
                    </strong>
                  </div>
                  <div className="detail-row">
                    <span>Method:</span>
                    <strong>{selectedPayment.payment_method?.replace('_', ' ')}</strong>
                  </div>
                  <div className="detail-row">
                    <span>SHORA Reference:</span>
                    <code style={{background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', fontSize: '12px'}}>
                      {selectedPayment.reference_id || selectedPayment.payment_reference}
                    </code>
                  </div>
                  {selectedPayment.provider_ref_id && (
                    <div className="detail-row">
                      <span>XentriPay Transaction ID:</span>
                      <code style={{background: '#eff6ff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: '#6366f1'}}>
                        {selectedPayment.provider_ref_id}
                      </code>
                    </div>
                  )}
                  {selectedPayment.payer_phone && (
                    <div className="detail-row">
                      <span>Payer Phone:</span>
                      <span>{selectedPayment.payer_phone}</span>
                    </div>
                  )}
                  {selectedPayment.payment_proof_url && (
                    <div className="detail-row">
                      <span>Proof:</span>
                      <a 
                        href={selectedPayment.payment_proof_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="proof-link"
                      >
                        View Payment Proof <ExternalLink size={14} />
                      </a>
                    </div>
                  )}
                </div>

                {selectedPayment.notes && (
                  <div className="detail-section full-width">
                    <h4>Learner Notes</h4>
                    <p className="notes-content">{selectedPayment.notes}</p>
                  </div>
                )}

                {!['pending', 'confirmed'].includes(selectedPayment.status) && selectedPayment.admin_notes && (
                  <div className="detail-section full-width">
                    <h4>Admin Notes</h4>
                    <p className="notes-content">{selectedPayment.admin_notes}</p>
                  </div>
                )}

                {(selectedPayment.status === 'pending' || selectedPayment.status === 'confirmed') && (
                  <div className="detail-section full-width">
                    <h4>Admin Notes (Optional)</h4>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="Add notes about this payment approval/rejection..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowDetailsModal(false)}
                disabled={actionLoading}
              >
                Close
              </button>
              {(selectedPayment.status === 'pending' || selectedPayment.status === 'confirmed') && (
                <>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => handleReject(selectedPayment)}
                    disabled={actionLoading}
                  >
                    <X size={18} />
                    Reject Payment
                  </button>
                  <button 
                    className="btn btn-success" 
                    onClick={() => handleApprove(selectedPayment)}
                    disabled={actionLoading}
                  >
                    <Check size={18} />
                    Approve & Enroll
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentApprovals

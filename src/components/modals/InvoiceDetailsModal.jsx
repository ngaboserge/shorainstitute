import React, { useState } from 'react'
import { X, FileText, Download, Printer, Calendar, DollarSign, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import './Modal.css'

const InvoiceDetailsModal = ({ isOpen, onClose, invoice }) => {
  if (!isOpen || !invoice) return null

  // Calculate subtotal and tax
  const subtotal = invoice.amount || 0
  const tax = subtotal * 0.18 // 18% VAT
  const total = subtotal + tax

  // Mock payment history
  const paymentHistory = [
    { date: 'May 15, 2026', amount: total, method: 'Bank Transfer', status: 'Completed', reference: 'PAY-2026-001' },
    { date: 'Apr 15, 2026', amount: 2500000, method: 'Bank Transfer', status: 'Completed', reference: 'PAY-2026-002' },
    { date: 'Mar 15, 2026', amount: 2400000, method: 'Bank Transfer', status: 'Completed', reference: 'PAY-2026-003' },
  ]

  // Mock learner breakdown
  const learnerBreakdown = [
    { department: 'Credit & Risk', count: 334, rate: 15000 },
    { department: 'Finance', count: 309, rate: 15000 },
    { department: 'Operations', count: 312, rate: 15000 },
    { department: 'HR & Admin', count: 187, rate: 15000 },
    { department: 'IT', count: 106, rate: 15000 },
  ]

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-xlarge" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={28} color="white" />
            </div>
            <div>
              <h2 style={{ marginBottom: '4px' }}>Invoice Details</h2>
              <div style={{ display: 'flex', gap: '12px', fontSize: '14px', color: '#666' }}>
                <span>Invoice #{invoice.invoiceNumber}</span>
                <span>•</span>
                <span>{invoice.billingPeriod}</span>
                <span>•</span>
                <span className={`badge ${invoice.status === 'Paid' ? 'success' : invoice.status === 'Pending' ? 'warning' : 'neutral'}`}>
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            {/* Invoice Summary Card */}
            <div className="details-card" style={{ background: '#f0f7ff', border: '2px solid #0B4F9F' }}>
              <h3 className="details-card-title" style={{ color: '#0B4F9F' }}>Invoice Summary</h3>
              <div style={{ marginTop: '20px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '12px 0',
                  borderBottom: '1px solid #d0e7ff'
                }}>
                  <span style={{ fontSize: '15px', color: '#444' }}>Subtotal</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#0B4F9F' }}>
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '12px 0',
                  borderBottom: '1px solid #d0e7ff'
                }}>
                  <span style={{ fontSize: '15px', color: '#444' }}>Tax (18% VAT)</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#0B4F9F' }}>
                    {formatCurrency(tax)}
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '16px 0 0',
                  marginTop: '8px'
                }}>
                  <span style={{ fontSize: '18px', fontWeight: '700', color: '#0B4F9F' }}>Total Amount</span>
                  <span style={{ fontSize: '24px', fontWeight: '700', color: '#0B4F9F' }}>
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Info Card */}
            <div className="details-card">
              <h3 className="details-card-title">Payment Information</h3>
              <div style={{ marginTop: '16px' }}>
                <div className="detail-item">
                  <Calendar size={18} color="#0B4F9F" />
                  <div>
                    <div className="detail-label">Issue Date</div>
                    <div className="detail-value">{invoice.issueDate}</div>
                  </div>
                </div>
                <div className="detail-item">
                  <Calendar size={18} color="#0B4F9F" />
                  <div>
                    <div className="detail-label">Due Date</div>
                    <div className="detail-value">{invoice.dueDate}</div>
                  </div>
                </div>
                <div className="detail-item">
                  {invoice.status === 'Paid' ? (
                    <CheckCircle size={18} color="#4caf50" />
                  ) : (
                    <Clock size={18} color="#ff9800" />
                  )}
                  <div>
                    <div className="detail-label">Payment Status</div>
                    <div className="detail-value">
                      <span className={`badge ${invoice.status === 'Paid' ? 'success' : 'warning'}`}>
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                </div>
                {invoice.status === 'Paid' && (
                  <div className="detail-item">
                    <Calendar size={18} color="#4caf50" />
                    <div>
                      <div className="detail-label">Paid On</div>
                      <div className="detail-value">{invoice.paidDate || invoice.issueDate}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Learner Breakdown */}
          <div className="details-card" style={{ marginBottom: '24px' }}>
            <h3 className="details-card-title">Learner Breakdown by Department</h3>
            <div className="table-container" style={{ marginTop: '16px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Active Learners</th>
                    <th>Rate per Learner</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {learnerBreakdown.map((item, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: '500' }}>{item.department}</td>
                      <td>{item.count}</td>
                      <td>{formatCurrency(item.rate)}</td>
                      <td style={{ fontWeight: '600', color: '#0B4F9F' }}>
                        {formatCurrency(item.count * item.rate)}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: '#f8f9fa', fontWeight: '600' }}>
                    <td>Total</td>
                    <td>{learnerBreakdown.reduce((sum, item) => sum + item.count, 0)}</td>
                    <td>—</td>
                    <td style={{ color: '#0B4F9F' }}>
                      {formatCurrency(learnerBreakdown.reduce((sum, item) => sum + (item.count * item.rate), 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="info-box" style={{ marginTop: '16px' }}>
              <strong>Billing Model:</strong> Usage-based pricing at RWF 15,000 per active learner per month. 
              Active learners are counted as those who accessed the platform at least once during the billing period.
            </div>
          </div>

          {/* Payment History */}
          <div className="details-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="details-card-title" style={{ margin: 0 }}>Payment History</h3>
              <span style={{ fontSize: '13px', color: '#666' }}>Last 3 payments</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
              {paymentHistory.map((payment, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '16px 20px',
                    background: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{payment.date}</div>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      {payment.method} • Ref: {payment.reference}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#0B4F9F' }}>
                        {formatCurrency(payment.amount)}
                      </div>
                      <span className="badge success" style={{ fontSize: '11px' }}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Institution & Billing Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
            <div className="details-card">
              <h3 className="details-card-title">Bill To</h3>
              <div style={{ marginTop: '12px', lineHeight: '1.8', color: '#444' }}>
                <div style={{ fontWeight: '600', marginBottom: '8px' }}>{invoice.institutionName || 'Your Institution'}</div>
                <div>{invoice.address || 'KG 123 St, Kigali'}</div>
                <div>{invoice.city || 'Kigali, Rwanda'}</div>
                <div>TIN: {invoice.tin || '123456789'}</div>
                <div style={{ marginTop: '8px' }}>
                  <strong>Contact:</strong> {invoice.contactEmail || 'billing@institution.rw'}
                </div>
              </div>
            </div>

            <div className="details-card">
              <h3 className="details-card-title">From</h3>
              <div style={{ marginTop: '12px', lineHeight: '1.8', color: '#444' }}>
                <div style={{ fontWeight: '600', marginBottom: '8px' }}>Shora Institute</div>
                <div>KN 5 Ave, Kigali</div>
                <div>Kigali, Rwanda</div>
                <div>TIN: 987654321</div>
                <div style={{ marginTop: '8px' }}>
                  <strong>Email:</strong> billing@shorainstitute.rw
                </div>
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          {invoice.status !== 'Paid' && (
            <div style={{ 
              marginTop: '24px', 
              padding: '20px', 
              background: '#fff8e1', 
              border: '2px solid #ffd54f',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                <AlertCircle size={24} color="#f57c00" />
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#e65100' }}>Payment Instructions</h4>
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>
                    Please make payment via bank transfer to:
                  </p>
                  <div style={{ 
                    background: 'white', 
                    padding: '16px', 
                    borderRadius: '6px',
                    fontSize: '14px',
                    lineHeight: '1.8'
                  }}>
                    <div><strong>Bank:</strong> Bank of Kigali</div>
                    <div><strong>Account Name:</strong> Shora Institute Ltd</div>
                    <div><strong>Account Number:</strong> 00012345678901</div>
                    <div><strong>Swift Code:</strong> BKIGRWRW</div>
                    <div style={{ marginTop: '8px', color: '#f57c00' }}>
                      <strong>Reference:</strong> {invoice.invoiceNumber}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-outline">
              <Printer size={16} />
              Print Invoice
            </button>
            <button className="btn btn-primary">
              <Download size={16} />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceDetailsModal

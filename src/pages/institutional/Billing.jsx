import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Download, Plus } from 'lucide-react'
import InvoiceDetailsModal from '../../components/modals/InvoiceDetailsModal'
import { supabase } from '../../lib/supabase'
import { useShoraInstitute } from '../../hooks/useInstitutionalAuth'
import './Billing.css'

const Billing = () => {
  const { institutionId } = useShoraInstitute()
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [subscriptionStats, setSubscriptionStats] = useState({
    seatsUsed: 0,
    totalSeats: 0,
    subscriptionValue: 0,
    outstanding: 0
  })

  useEffect(() => {
    fetchBillingData()
  }, [])

  const fetchBillingData = async () => {
    try {
      setLoading(true)

      // Fetch learner count for seats used
      const { count: learnersCount, error: learnersError } = await supabase
        .from('institution_learners')
        .select('*', { count: 'exact', head: true })
        .eq('institution_id', institutionId)
        .eq('status', 'active')

      if (learnersError) throw learnersError

      // Fetch institution subscription info
      const { data: institutionData, error: institutionError } = await supabase
        .from('institutions')
        .select('*')
        .eq('id', institutionId)
        .single()

      if (institutionError) throw institutionError

      setSubscriptionStats({
        seatsUsed: learnersCount || 0,
        totalSeats: 0, // TODO: Get from subscription plan - showing 0 instead of fake 1600
        subscriptionValue: 0, // TODO: Get from subscription plan - showing 0 instead of fake 7.2M
        outstanding: 0
      })

      await fetchInvoices()

    } catch (error) {
      console.error('Error fetching billing data:', error)
      setSubscriptionStats({
        seatsUsed: 0,
        totalSeats: 0,
        subscriptionValue: 0,
        outstanding: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchInvoices = async () => {
    try {
      setLoading(true)

      // Fetch invoices from database
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('institution_invoices')
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false })
        .limit(12)

      if (invoicesError) throw invoicesError

      // Transform data for display
      const transformedInvoices = invoicesData.map(inv => ({
        invoiceNumber: inv.invoice_number,
        billingPeriod: `${new Date(inv.billing_start).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })} - ${new Date(inv.billing_end).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}`,
        issueDate: new Date(inv.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }),
        dueDate: new Date(inv.due_date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }),
        amount: inv.subtotal,
        status: inv.status === 'paid' ? 'Paid' : 'Pending',
        paidDate: inv.paid_at ? new Date(inv.paid_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }) : null,
        institutionName: 'Your Institution',
        address: 'KG 123 St, Kigali',
        city: 'Kigali, Rwanda',
        tin: '123456789',
        contactEmail: 'billing@institution.rw'
      }))

      setInvoices(transformedInvoices)

    } catch (error) {
      console.error('Error fetching invoices:', error)
      setInvoices([])
    }
  }

  const handleInvoiceClick = (invoice) => {
    setSelectedInvoice(invoice)
    setShowInvoiceModal(true)
  }

  return (
    <div className="dashboard-layout">
      <Sidebar type="institutional" />
      <div className="main-content">
        <Header 
          title="Billing & Subscriptions"
          subtitle="Manage your institution's subscription, seats, invoices, and payment details."
          actions={
            <>
              <button className="btn btn-secondary">
                <Download size={18} />
                Download Invoices
              </button>
              <button className="btn btn-secondary">
                <Plus size={18} />
                Add Seats
              </button>
              <button className="btn btn-warning">
                Upgrade Plan
              </button>
            </>
          }
        />
        
        <div className="content-wrapper">
          {/* Stats Grid */}
          <div className="billing-stats-grid">
            <div className="billing-stat-card">
              <div className="stat-icon-wrapper blue">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className="stat-details">
                <div className="stat-label">Seats Used</div>
                <div className="stat-value">{loading ? '...' : subscriptionStats.seatsUsed.toLocaleString()}</div>
                <div className="stat-subtext">of {loading ? '...' : subscriptionStats.totalSeats.toLocaleString()}</div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{
                    width: `${subscriptionStats.totalSeats > 0 ? (subscriptionStats.seatsUsed / subscriptionStats.totalSeats * 100) : 0}%`, 
                    backgroundColor: '#0B4F9F'
                  }}></div>
                </div>
                <div className="stat-meta">
                  <span className="active-learners">👥 Active learners</span>
                  <span className="percentage">
                    {subscriptionStats.totalSeats > 0 ? Math.round(subscriptionStats.seatsUsed / subscriptionStats.totalSeats * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>

            <div className="billing-stat-card">
              <div className="stat-icon-wrapper orange">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className="stat-details">
                <div className="stat-label">Available Seats</div>
                <div className="stat-value">{loading ? '...' : (subscriptionStats.totalSeats - subscriptionStats.seatsUsed).toLocaleString()}</div>
                <div className="stat-subtext">of {loading ? '...' : subscriptionStats.totalSeats.toLocaleString()}</div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{
                    width: `${subscriptionStats.totalSeats > 0 ? ((subscriptionStats.totalSeats - subscriptionStats.seatsUsed) / subscriptionStats.totalSeats * 100) : 0}%`, 
                    backgroundColor: '#FFA726'
                  }}></div>
                </div>
                <div className="stat-meta">
                  <span className="seats-remaining">📊 Seats remaining</span>
                  <span className="percentage">
                    {subscriptionStats.totalSeats > 0 ? Math.round((subscriptionStats.totalSeats - subscriptionStats.seatsUsed) / subscriptionStats.totalSeats * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>

            <div className="billing-stat-card">
              <div className="stat-icon-wrapper green">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
              </div>
              <div className="stat-details">
                <div className="stat-label">Current Subscription Value</div>
                <div className="stat-value">{loading ? '...' : `${subscriptionStats.subscriptionValue.toLocaleString()} RWF`}</div>
                <div className="stat-subtext">Annual Plan</div>
                <div className="stat-meta single">
                  <span className="paid-full">✓ Paid in full</span>
                </div>
              </div>
            </div>

            <div className="billing-stat-card">
              <div className="stat-icon-wrapper yellow">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <div className="stat-details">
                <div className="stat-label">Outstanding Invoice</div>
                <div className="stat-value">{loading ? '...' : `${subscriptionStats.outstanding.toLocaleString()} RWF`}</div>
                <div className="stat-subtext">No outstanding balance</div>
                <div className="stat-meta single">
                  <span className="all-paid">✓ All invoices paid</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Plan and Benefits Grid */}
          <div className="billing-content-grid">
            {subscriptionStats.totalSeats === 0 && subscriptionStats.subscriptionValue === 0 ? (
              <div className="card" style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                <h3 style={{ marginBottom: '8px', color: '#1a1a1a' }}>No Subscription Plan Configured</h3>
                <p style={{ color: '#666', marginBottom: '24px' }}>
                  Set up your institution's subscription plan to manage seats, billing, and access.
                </p>
                <button className="btn btn-primary">Configure Subscription Plan</button>
              </div>
            ) : (
              <>
            <div className="card plan-overview-card">
              <h3 className="section-title">Current Plan Overview</h3>
              
              <div className="plan-header">
                <div className="plan-badge">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                  <div className="plan-info">
                    <div className="plan-name">Institution Premium</div>
                    <div className="plan-type">
                      <span className="badge-annual">Annual Plan</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="plan-section">
                <div className="section-label">SEAT ALLOCATION</div>
                <div className="allocation-item">
                  <span className="allocation-label">Licensed Seats</span>
                  <span className="allocation-value">{loading ? '...' : subscriptionStats.totalSeats.toLocaleString()}</span>
                </div>
                <div className="allocation-item">
                  <span className="allocation-label">Active Learners</span>
                  <span className="allocation-value">{loading ? '...' : subscriptionStats.seatsUsed.toLocaleString()}</span>
                </div>
                <div className="allocation-item">
                  <span className="allocation-label">Available Seats</span>
                  <span className="allocation-value">{loading ? '...' : (subscriptionStats.totalSeats - subscriptionStats.seatsUsed).toLocaleString()}</span>
                </div>
              </div>

              <div className="plan-section">
                <div className="section-label">FINANCIAL SUMMARY</div>
                <div className="allocation-item">
                  <span className="allocation-label">Plan Amount</span>
                  <span className="allocation-value">{loading ? '...' : `${subscriptionStats.subscriptionValue.toLocaleString()} RWF`}</span>
                </div>
                <div className="allocation-item">
                  <span className="allocation-label">Billing Cycle</span>
                  <span className="allocation-value">Annual</span>
                </div>
                <div className="allocation-item">
                  <span className="allocation-label">Next Renewal</span>
                  <span className="allocation-value">Not set</span>
                </div>
                <div className="allocation-item">
                  <span className="allocation-label">Payment Status</span>
                  <span className="allocation-value">Not configured</span>
                </div>
              </div>

              <div className="renewal-info" style={{ opacity: 0.5 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4l3 3" stroke="white" strokeWidth="2" fill="none"/>
                </svg>
                <span>No renewal date set</span>
              </div>
            </div>

            <div className="card plan-benefits-card">
              <h3 className="section-title">Plan Benefits</h3>
              
              <div className="benefits-list">
                <div className="benefit-item">
                  <div className="benefit-icon blue">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div className="benefit-content">
                    <div className="benefit-title">Advanced Analytics & Reporting</div>
                    <div className="benefit-desc">Deep-dive analytics, custom reports, and outcomes.</div>
                  </div>
                </div>

                <div className="benefit-item">
                  <div className="benefit-icon blue">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div className="benefit-content">
                    <div className="benefit-title">Custom Live Seminars</div>
                    <div className="benefit-desc">Host bespoke masterclasses for your cohorts.</div>
                  </div>
                </div>

                <div className="benefit-item">
                  <div className="benefit-icon blue">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div className="benefit-content">
                    <div className="benefit-title">Cohort Management</div>
                    <div className="benefit-desc">Organize learners into cohorts and track collective progress.</div>
                  </div>
                </div>

                <div className="benefit-item">
                  <div className="benefit-icon blue">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div className="benefit-content">
                    <div className="benefit-title">Priority Support</div>
                    <div className="benefit-desc">Priority support from your account manager.</div>
                  </div>
                </div>

                <div className="benefit-item">
                  <div className="benefit-icon blue">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div className="benefit-content">
                    <div className="benefit-title">Dedicated Account Support</div>
                    <div className="benefit-desc">Priority support from your custom account manager.</div>
                  </div>
                </div>
              </div>

              <button className="btn-add-ons">
                Manage Add-ons →
              </button>
            </div>
              </>
            )}
          </div>

          {/* Invoices Table */}
          <div className="card invoices-card">
            <div className="card-header-section">
              <h3 className="section-title">Invoices</h3>
              <button className="btn-view-all">View all invoices →</button>
            </div>

            <table className="invoices-table">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Billing Period</th>
                  <th>Amount (RWF)</th>
                  <th>Status</th>
                  <th>Payment Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                      Loading invoices...
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice, index) => (
                  <tr 
                    key={index}
                    onClick={() => handleInvoiceClick(invoice)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="invoice-number">{invoice.invoiceNumber}</td>
                    <td>{invoice.billingPeriod}</td>
                    <td className="invoice-amount">RWF {invoice.amount.toLocaleString()}</td>
                    <td>
                      <span className="status-badge paid">{invoice.status}</span>
                    </td>
                    <td>{invoice.paidDate}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button className="btn-download">
                        <Download size={16} />
                        Download
                      </button>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>

          {/* Bottom Grid */}
          <div className="billing-bottom-grid">
            <div className="card payment-method-card">
              <h3 className="section-title">Payment Method</h3>
              
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>💳</div>
                <p style={{ color: '#666', marginBottom: '20px' }}>No payment method configured</p>
                <button className="btn btn-primary btn-sm">Add Payment Method</button>
              </div>
            </div>

            <div className="card billing-contact-card">
              <h3 className="section-title">Billing Contact</h3>
              
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
                <p style={{ color: '#666', marginBottom: '20px' }}>No billing contact configured</p>
                <button className="btn btn-primary btn-sm">Add Billing Contact</button>
              </div>
            </div>

            <div className="card tax-info-card">
              <h3 className="section-title">Tax Information</h3>
              
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                <p style={{ color: '#666', marginBottom: '20px' }}>No tax information configured</p>
                <button className="btn btn-primary btn-sm">Add Tax Information</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Details Modal */}
      <InvoiceDetailsModal 
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        invoice={selectedInvoice}
      />
    </div>
  )
}

export default Billing

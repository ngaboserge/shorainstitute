import React from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Download, Plus } from 'lucide-react'
import './Billing.css'

const Billing = () => {
  const invoices = [
    {
      number: 'INV-2025-00045',
      period: 'Jan 1, 2025 - May 31, 2027',
      amount: '7,200,000',
      status: 'Paid',
      paymentDate: 'Jan 1, 2025'
    },
    {
      number: 'INV-2025-00032',
      period: 'Jan 1, 2024 - May 31, 2026',
      amount: '6,600,000',
      status: 'Paid',
      paymentDate: 'Jun 1, 2025'
    },
    {
      number: 'INV-2024-00021',
      period: 'Jan 1, 2024 - May 31, 2025',
      amount: '6,000,000',
      status: 'Paid',
      paymentDate: 'Jun 1, 2024'
    },
    {
      number: 'INV-2023-00013',
      period: 'Jan 1, 2023 - May 31, 2024',
      amount: '5,400,000',
      status: 'Paid',
      paymentDate: 'Jun 1, 2023'
    }
  ]

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
                <div className="stat-value">1,248</div>
                <div className="stat-subtext">of 1,600</div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{width: '78%', backgroundColor: '#0B4F9F'}}></div>
                </div>
                <div className="stat-meta">
                  <span className="active-learners">👥 Active learners</span>
                  <span className="percentage">78%</span>
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
                <div className="stat-value">352</div>
                <div className="stat-subtext">of 4,600</div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{width: '22%', backgroundColor: '#FFA726'}}></div>
                </div>
                <div className="stat-meta">
                  <span className="seats-remaining">📊 Seats remaining</span>
                  <span className="percentage">22%</span>
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
                <div className="stat-value">7,200,000 RWF</div>
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
                <div className="stat-value">0 RWF</div>
                <div className="stat-subtext">No outstanding balance</div>
                <div className="stat-meta single">
                  <span className="all-paid">✓ All invoices paid</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Plan and Benefits Grid */}
          <div className="billing-content-grid">
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
                  <span className="allocation-value">1,600</span>
                </div>
                <div className="allocation-item">
                  <span className="allocation-label">Active Learners</span>
                  <span className="allocation-value">1,248</span>
                </div>
                <div className="allocation-item">
                  <span className="allocation-label">Available Seats</span>
                  <span className="allocation-value">352</span>
                </div>
              </div>

              <div className="plan-section">
                <div className="section-label">FINANCIAL SUMMARY</div>
                <div className="allocation-item">
                  <span className="allocation-label">Plan Amount</span>
                  <span className="allocation-value">7,200,000 RWF</span>
                </div>
                <div className="allocation-item">
                  <span className="allocation-label">Billing Cycle</span>
                  <span className="allocation-value">Annual</span>
                </div>
                <div className="allocation-item">
                  <span className="allocation-label">Next Renewal</span>
                  <span className="allocation-value">May 31, 2027</span>
                </div>
                <div className="allocation-item">
                  <span className="allocation-label">Payment Status</span>
                  <span className="allocation-value status-paid">Paid in Full</span>
                </div>
              </div>

              <div className="renewal-info">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4l3 3" stroke="white" strokeWidth="2" fill="none"/>
                </svg>
                <span>142 days remaining</span>
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
                {invoices.map((invoice, index) => (
                  <tr key={index}>
                    <td className="invoice-number">{invoice.number}</td>
                    <td>{invoice.period}</td>
                    <td className="invoice-amount">{invoice.amount}</td>
                    <td>
                      <span className="status-badge paid">{invoice.status}</span>
                    </td>
                    <td>{invoice.paymentDate}</td>
                    <td>
                      <button className="btn-download">
                        <Download size={16} />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Grid */}
          <div className="billing-bottom-grid">
            <div className="card payment-method-card">
              <h3 className="section-title">Payment Method</h3>
              
              <div className="payment-card-display">
                <div className="visa-card">
                  <div className="card-type">VISA</div>
                  <div className="card-number">•••• •••• •••• 4242</div>
                  <div className="card-expiry">Expires 05/28</div>
                </div>
              </div>

              <div className="payment-info-row">
                <span>Primary</span>
              </div>

              <button className="btn-edit-full">Edit</button>
            </div>

            <div className="card billing-contact-card">
              <h3 className="section-title">Billing Contact</h3>
              
              <div className="contact-info">
                <div className="contact-row">
                  <span className="contact-label">Name</span>
                  <span className="contact-value">Jean Claude Niyonzima</span>
                </div>
                <div className="contact-row">
                  <span className="contact-label">Title</span>
                  <span className="contact-value">Finance Manager</span>
                </div>
                <div className="contact-row">
                  <span className="contact-label">Email</span>
                  <span className="contact-value">jean.claude@rdb.rw</span>
                </div>
                <div className="contact-row">
                  <span className="contact-label">Phone</span>
                  <span className="contact-value">+250 788 543 0101</span>
                </div>
              </div>

              <button className="btn-edit-full">Edit</button>
            </div>

            <div className="card tax-info-card">
              <h3 className="section-title">Tax Information</h3>
              
              <div className="tax-info">
                <div className="tax-row">
                  <span className="tax-label">TIN</span>
                  <span className="tax-value">100511011</span>
                </div>
                <div className="tax-row">
                  <span className="tax-label">VAT Number</span>
                  <span className="tax-value">107616101</span>
                </div>
                <div className="tax-row">
                  <span className="tax-label">Tax Exempt</span>
                  <span className="tax-value">No</span>
                </div>
              </div>

              <button className="btn-edit-full">Edit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Billing

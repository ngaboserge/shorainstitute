import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { 
  ArrowLeft, ArrowRight, Calendar, Mail, FileText, 
  CheckCircle, Clock, Users, Download, Settings
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useShoraInstitute } from '../../hooks/useInstitutionalAuth'
import './ScheduleReports.css'

const ScheduleReports = () => {
  const navigate = useNavigate()
  const { institutionId } = useShoraInstitute()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [admins, setAdmins] = useState([])
  
  const [formData, setFormData] = useState({
    // Step 1: Schedule
    frequency: 'monthly',
    reportPeriod: 'previous_month',
    deliveryDay: '3rd_business_day',
    timezone: 'Africa/Kigali',
    
    // Step 2: Recipients
    recipients: [],
    
    // Step 3: Report Contents
    reportContents: {
      executive_summary: true,
      learner_activation: true,
      programme_progress: true,
      at_risk_learners: true,
      assessment_performance: true,
      seminar_attendance: true,
      certificates_issued: true,
      department_comparison: true,
      billing_invoices: false
    },
    
    // Delivery Options
    deliveryFormats: {
      pdf: true,
      csv: false,
      dashboard_notification: true
    },
    
    sendConfirmation: true
  })

  useEffect(() => {
    fetchAdmins()
  }, [institutionId])

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('institution_admins')
        .select(`
          id,
          user_id,
          role,
          auth:user_id (
            email,
            raw_user_meta_data
          )
        `)
        .eq('institution_id', institutionId)
        .eq('status', 'active')

      if (error) throw error

      const adminsList = (data || []).map(admin => ({
        id: admin.id,
        user_id: admin.user_id,
        name: admin.auth?.raw_user_meta_data?.full_name || admin.auth?.email || 'Unknown',
        email: admin.auth?.email || '',
        role: admin.role
      }))

      setAdmins(adminsList)
    } catch (err) {
      console.error('Error fetching admins:', err)
    }
  }

  const handleCheckboxChange = (section, field) => {
    if (section === 'recipients') {
      const newRecipients = formData.recipients.includes(field)
        ? formData.recipients.filter(r => r !== field)
        : [...formData.recipients, field]
      setFormData({ ...formData, recipients: newRecipients })
    } else {
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [field]: !formData[section][field]
        }
      })
    }
  }

  const handleSelectAllRecipients = () => {
    if (formData.recipients.length === admins.length) {
      setFormData({ ...formData, recipients: [] })
    } else {
      setFormData({ ...formData, recipients: admins.map(a => a.id) })
    }
  }

  const handleSaveSchedule = async () => {
    try {
      setLoading(true)

      const scheduleData = {
        institution_id: institutionId,
        frequency: formData.frequency,
        report_period: formData.reportPeriod,
        delivery_day: formData.deliveryDay,
        timezone: formData.timezone,
        recipients: formData.recipients,
        report_contents: Object.keys(formData.reportContents).filter(k => formData.reportContents[k]),
        delivery_formats: Object.keys(formData.deliveryFormats).filter(k => formData.deliveryFormats[k]),
        send_confirmation: formData.sendConfirmation,
        status: 'active',
        next_scheduled_at: calculateNextScheduledDate()
      }

      const { error } = await supabase
        .from('institution_report_schedules')
        .insert(scheduleData)

      if (error) throw error

      alert('Report schedule created successfully!')
      navigate('/institutional/reports')

    } catch (err) {
      console.error('Error saving schedule:', err)
      alert(`Failed to save schedule: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const calculateNextScheduledDate = () => {
    const now = new Date()
    let nextDate = new Date()
    
    if (formData.frequency === 'monthly') {
      nextDate.setMonth(now.getMonth() + 1, 3) // 3rd of next month
    } else if (formData.frequency === 'quarterly') {
      nextDate.setMonth(now.getMonth() + 3, 3)
    }
    
    return nextDate.toISOString()
  }

  const reportContentOptions = [
    { key: 'executive_summary', label: 'Executive Summary', desc: 'High-level overview of key metrics' },
    { key: 'learner_activation', label: 'Learner Activation', desc: 'New learners and activation rates' },
    { key: 'programme_progress', label: 'Programme Progress', desc: 'Completion rates by programme' },
    { key: 'at_risk_learners', label: 'At-Risk Learners', desc: 'Learners falling behind or inactive' },
    { key: 'assessment_performance', label: 'Assessment Performance', desc: 'Quiz scores and pass rates' },
    { key: 'seminar_attendance', label: 'Seminar Attendance', desc: 'Live session participation' },
    { key: 'certificates_issued', label: 'Certificates Issued', desc: 'Course completions and certificates' },
    { key: 'department_comparison', label: 'Department Comparison', desc: 'Performance across departments' },
    { key: 'billing_invoices', label: 'Billing & Invoices', desc: 'Payment status and seat usage' }
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar type="institutional" />
      <div className="main-content">
        <Header 
          title="Schedule Automated Reports"
          subtitle="Configure regular progress reports to be delivered to your team."
          actions={
            <button className="btn btn-secondary" onClick={() => navigate('/institutional/reports')}>
              <ArrowLeft size={18} />
              Back to Reports
            </button>
          }
        />

        <div className="content-wrapper">
          <div className="schedule-reports-layout">
            {/* Main Content */}
            <div className="schedule-reports-main">
              {/* Progress Steps */}
              <div className="card wizard-steps">
                {[
                  { num: 1, label: 'Schedule', icon: Calendar },
                  { num: 2, label: 'Recipients', icon: Users },
                  { num: 3, label: 'Contents', icon: FileText },
                  { num: 4, label: 'Review', icon: CheckCircle }
                ].map((step, index) => {
                  const Icon = step.icon
                  const isActive = currentStep === step.num
                  const isCompleted = currentStep > step.num
                  
                  return (
                    <React.Fragment key={step.num}>
                      <div className={`wizard-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                        <div className="wizard-step-number">
                          {isCompleted ? <CheckCircle size={20} /> : step.num}
                        </div>
                        <div className="wizard-step-label">{step.label}</div>
                      </div>
                      {index < 3 && <ArrowRight size={20} className="wizard-step-arrow" />}
                    </React.Fragment>
                  )
                })}
              </div>

              {/* Step 1: Schedule Configuration */}
              {currentStep === 1 && (
                <div className="card">
                  <h3 className="step-title">Schedule Configuration</h3>
                  <p className="step-subtitle">Set when and how often reports should be generated and delivered.</p>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">
                        <Calendar size={16} />
                        Frequency
                      </label>
                      <select
                        value={formData.frequency}
                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                        className="form-select"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annual">Annual</option>
                      </select>
                      <span className="form-help">How often reports are generated</span>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <Clock size={16} />
                        Report Period
                      </label>
                      <select
                        value={formData.reportPeriod}
                        onChange={(e) => setFormData({ ...formData, reportPeriod: e.target.value })}
                        className="form-select"
                      >
                        <option value="previous_month">Previous Calendar Month</option>
                        <option value="last_30_days">Last 30 Days</option>
                        <option value="previous_quarter">Previous Quarter</option>
                        <option value="custom">Custom Date Range</option>
                      </select>
                      <span className="form-help">Time period covered by the report</span>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <Calendar size={16} />
                        Delivery Day
                      </label>
                      <select
                        value={formData.deliveryDay}
                        onChange={(e) => setFormData({ ...formData, deliveryDay: e.target.value })}
                        className="form-select"
                      >
                        <option value="1st">1st of the Month</option>
                        <option value="3rd_business_day">3rd Business Day</option>
                        <option value="5th">5th of the Month</option>
                        <option value="15th">15th of the Month</option>
                        <option value="last_day">Last Day of Month</option>
                      </select>
                      <span className="form-help">When to deliver the report</span>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <Settings size={16} />
                        Timezone
                      </label>
                      <select
                        value={formData.timezone}
                        onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                        className="form-select"
                      >
                        <option value="Africa/Kigali">Africa/Kigali (CAT)</option>
                        <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">America/New York (EST)</option>
                        <option value="Europe/London">Europe/London (GMT)</option>
                      </select>
                      <span className="form-help">Timezone for scheduling</span>
                    </div>
                  </div>

                  <div className="step-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={() => setCurrentStep(2)}
                    >
                      Next: Select Recipients
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Select Recipients */}
              {currentStep === 2 && (
                <div className="card">
                  <div className="step-header">
                    <div>
                      <h3 className="step-title">Select Recipients</h3>
                      <p className="step-subtitle">Choose which admins should receive the automated reports.</p>
                    </div>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={handleSelectAllRecipients}
                    >
                      {formData.recipients.length === admins.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="recipients-list">
                    {admins.length === 0 ? (
                      <div className="empty-state">
                        <Users size={48} />
                        <p>No administrators found</p>
                      </div>
                    ) : (
                      admins.map(admin => (
                        <label key={admin.id} className="recipient-item">
                          <input
                            type="checkbox"
                            checked={formData.recipients.includes(admin.id)}
                            onChange={() => handleCheckboxChange('recipients', admin.id)}
                          />
                          <div className="recipient-info">
                            <div className="recipient-name">{admin.name}</div>
                            <div className="recipient-email">{admin.email}</div>
                          </div>
                          <span className={`role-badge ${admin.role}`}>
                            {admin.role.replace('_', ' ')}
                          </span>
                        </label>
                      ))
                    )}
                  </div>

                  {formData.recipients.length > 0 && (
                    <div className="selection-summary">
                      <CheckCircle size={16} />
                      {formData.recipients.length} recipient{formData.recipients.length > 1 ? 's' : ''} selected
                    </div>
                  )}

                  <div className="step-actions">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setCurrentStep(1)}
                    >
                      <ArrowLeft size={18} />
                      Back
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setCurrentStep(3)}
                      disabled={formData.recipients.length === 0}
                    >
                      Next: Report Contents
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Report Contents */}
              {currentStep === 3 && (
                <div className="card">
                  <h3 className="step-title">Report Contents</h3>
                  <p className="step-subtitle">Select which sections to include in the automated report.</p>

                  <div className="report-contents-grid">
                    {reportContentOptions.map(option => (
                      <label key={option.key} className="content-option">
                        <input
                          type="checkbox"
                          checked={formData.reportContents[option.key]}
                          onChange={() => handleCheckboxChange('reportContents', option.key)}
                        />
                        <div className="content-option-info">
                          <div className="content-option-label">{option.label}</div>
                          <div className="content-option-desc">{option.desc}</div>
                        </div>
                        {formData.reportContents[option.key] && (
                          <CheckCircle size={20} className="content-check" />
                        )}
                      </label>
                    ))}
                  </div>

                  <div className="form-section">
                    <h4 className="form-section-title">Delivery Formats</h4>
                    <div className="delivery-formats">
                      <label className="format-option">
                        <input
                          type="checkbox"
                          checked={formData.deliveryFormats.pdf}
                          onChange={() => handleCheckboxChange('deliveryFormats', 'pdf')}
                        />
                        <Download size={16} />
                        PDF Document
                      </label>
                      <label className="format-option">
                        <input
                          type="checkbox"
                          checked={formData.deliveryFormats.csv}
                          onChange={() => handleCheckboxChange('deliveryFormats', 'csv')}
                        />
                        <FileText size={16} />
                        CSV Data Export
                      </label>
                      <label className="format-option">
                        <input
                          type="checkbox"
                          checked={formData.deliveryFormats.dashboard_notification}
                          onChange={() => handleCheckboxChange('deliveryFormats', 'dashboard_notification')}
                        />
                        <Mail size={16} />
                        Dashboard Notification
                      </label>
                    </div>
                  </div>

                  <div className="step-actions">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setCurrentStep(2)}
                    >
                      <ArrowLeft size={18} />
                      Back
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setCurrentStep(4)}
                    >
                      Review Schedule
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Review & Confirm */}
              {currentStep === 4 && (
                <div className="card">
                  <h3 className="step-title">Review & Confirm</h3>
                  <p className="step-subtitle">Review your report schedule before activating it.</p>

                  <div className="review-sections">
                    <div className="review-section">
                      <h4>Schedule</h4>
                      <div className="review-item">
                        <span className="review-label">Frequency:</span>
                        <span className="review-value">{formData.frequency.charAt(0).toUpperCase() + formData.frequency.slice(1)}</span>
                      </div>
                      <div className="review-item">
                        <span className="review-label">Report Period:</span>
                        <span className="review-value">{formData.reportPeriod.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="review-item">
                        <span className="review-label">Delivery Day:</span>
                        <span className="review-value">{formData.deliveryDay.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="review-item">
                        <span className="review-label">Timezone:</span>
                        <span className="review-value">{formData.timezone}</span>
                      </div>
                    </div>

                    <div className="review-section">
                      <h4>Recipients ({formData.recipients.length})</h4>
                      {admins.filter(a => formData.recipients.includes(a.id)).map(admin => (
                        <div key={admin.id} className="review-recipient">
                          <Mail size={14} />
                          {admin.name} ({admin.email})
                        </div>
                      ))}
                    </div>

                    <div className="review-section">
                      <h4>Report Contents ({Object.values(formData.reportContents).filter(Boolean).length} sections)</h4>
                      <div className="review-tags">
                        {reportContentOptions
                          .filter(opt => formData.reportContents[opt.key])
                          .map(opt => (
                            <span key={opt.key} className="review-tag">{opt.label}</span>
                          ))}
                      </div>
                    </div>

                    <div className="review-section">
                      <h4>Delivery Formats</h4>
                      <div className="review-tags">
                        {Object.keys(formData.deliveryFormats)
                          .filter(k => formData.deliveryFormats[k])
                          .map(format => (
                            <span key={format} className="review-tag">
                              {format.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>

                  <label className="confirmation-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.sendConfirmation}
                      onChange={(e) => setFormData({ ...formData, sendConfirmation: e.target.checked })}
                    />
                    <span>Send a setup confirmation email to all recipients</span>
                  </label>

                  <div className="step-actions">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setCurrentStep(3)}
                    >
                      <ArrowLeft size={18} />
                      Back
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={handleSaveSchedule}
                      disabled={loading}
                    >
                      <CheckCircle size={18} />
                      {loading ? 'Activating...' : 'Activate Schedule'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Summary Panel */}
            <div className="schedule-reports-summary">
              <div className="card summary-card">
                <h4 className="summary-title">Schedule Summary</h4>
                
                <div className="summary-section">
                  <div className="summary-icon">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <div className="summary-label">Frequency</div>
                    <div className="summary-value">{formData.frequency}</div>
                  </div>
                </div>

                <div className="summary-section">
                  <div className="summary-icon">
                    <Users size={20} />
                  </div>
                  <div>
                    <div className="summary-label">Recipients</div>
                    <div className="summary-value">{formData.recipients.length} selected</div>
                  </div>
                </div>

                <div className="summary-section">
                  <div className="summary-icon">
                    <FileText size={20} />
                  </div>
                  <div>
                    <div className="summary-label">Report Sections</div>
                    <div className="summary-value">
                      {Object.values(formData.reportContents).filter(Boolean).length} sections
                    </div>
                  </div>
                </div>

                <div className="summary-section">
                  <div className="summary-icon">
                    <Download size={20} />
                  </div>
                  <div>
                    <div className="summary-label">Formats</div>
                    <div className="summary-value">
                      {Object.values(formData.deliveryFormats).filter(Boolean).length} formats
                    </div>
                  </div>
                </div>

                <div className="summary-info">
                  <div className="info-icon">💡</div>
                  <div className="info-text">
                    Reports will be automatically generated and delivered based on your schedule.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScheduleReports

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { 
  ArrowLeft, ArrowRight, Building2, Users, FileText, 
  CheckCircle, ChevronRight, Save, UserCheck
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useShoraInstitute } from '../../hooks/useInstitutionalAuth'
import './Departments.css'

const CreateDepartment = () => {
  const navigate = useNavigate()
  const { institutionId } = useShoraInstitute()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [admins, setAdmins] = useState([])

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'academic',
    description: '',
    department_lead_id: '',
    status: 'active'
  })

  useEffect(() => {
    if (institutionId) {
      fetchAdmins()
    }
  }, [institutionId])

  const fetchAdmins = async () => {
    try {
      // Fetch admins with their email and full_name from institution_admins table
      const { data, error } = await supabase
        .from('institution_admins')
        .select('id, user_id, email, full_name')
        .eq('institution_id', institutionId)
        .eq('status', 'active')

      if (error) throw error

      if (data && data.length > 0) {
        // For admins with email, use it directly
        // For admins without email (old data), try to get from users table
        const adminsWithNames = await Promise.all(
          data.map(async (admin) => {
            if (admin.email && admin.full_name) {
              // Admin has email and name in institution_admins
              return {
                id: admin.id,
                name: admin.full_name,
                email: admin.email
              }
            } else if (admin.user_id) {
              // Try to get from users table
              const { data: userData } = await supabase
                .from('users')
                .select('email, full_name')
                .eq('id', admin.user_id)
                .maybeSingle()
              
              return {
                id: admin.id,
                name: userData?.full_name || userData?.email?.split('@')[0] || 'Admin',
                email: userData?.email || 'No email'
              }
            } else {
              return {
                id: admin.id,
                name: admin.email?.split('@')[0] || 'Admin',
                email: admin.email || 'No email'
              }
            }
          })
        )
        setAdmins(adminsWithNames)
      }
    } catch (err) {
      console.error('Error fetching admins:', err)
    }
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (isActive = true) => {
    try {
      setLoading(true)

      const { error } = await supabase
        .from('institution_departments')
        .insert({
          institution_id: institutionId,
          name: formData.name,
          code: formData.code,
          type: formData.type,
          description: formData.description,
          department_lead_id: formData.department_lead_id || null,
          status: isActive ? 'active' : 'inactive'
        })

      if (error) throw error

      alert(`Department ${isActive ? 'created and activated' : 'saved as inactive'} successfully!`)
      navigate('/institutional/departments')

    } catch (err) {
      console.error('Error creating department:', err)
      alert(`Failed to create department: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { number: 1, title: 'Basic Details', icon: FileText },
    { number: 2, title: 'Leadership', icon: UserCheck },
    { number: 3, title: 'Review & Confirm', icon: CheckCircle }
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar type="institutional" />
      <div className="main-content">
        <Header 
          title="Create Department"
          subtitle="Set up a new academic or administrative unit."
          actions={
            <button className="btn btn-secondary" onClick={() => navigate('/institutional/departments')}>
              <ArrowLeft size={18} />
              Back to Departments
            </button>
          }
        />

        <div className="content-wrapper">
          <div className="cohort-wizard">
            <div className="cohort-main">
              {/* Progress Steps */}
              <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                  {steps.map((step, index) => {
                    const Icon = step.icon
                    const isActive = currentStep === step.number
                    const isCompleted = currentStep > step.number
                    
                    return (
                      <React.Fragment key={step.number}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px',
                          opacity: isActive || isCompleted ? 1 : 0.5
                        }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: isCompleted ? '#4CAF50' : isActive ? '#2196F3' : '#E0E0E0',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '600'
                          }}>
                            {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', color: '#666' }}>Step {step.number}</div>
                            <div style={{ fontSize: '14px', fontWeight: 600 }}>{step.title}</div>
                          </div>
                        </div>
                        {index < steps.length - 1 && (
                          <ChevronRight size={20} style={{ color: '#BDBDBD', flexShrink: 0 }} />
                        )}
                      </React.Fragment>
                    )
                  })}
                </div>
              </div>

              {/* Step 1: Basic Details */}
              {currentStep === 1 && (
                <div className="card">
                  <h3 style={{ marginBottom: '24px' }}>Basic Details</h3>

                  <div className="form-group">
                    <label>Department name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Finance & Risk Management"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Department code</label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="e.g., FIN"
                        maxLength={10}
                      />
                      <small className="form-help-text">Short code for identification</small>
                    </div>

                    <div className="form-group">
                      <label>Type *</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        required
                      >
                        <option value="academic">Academic</option>
                        <option value="administrative">Administrative</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of this department's purpose and responsibilities"
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Leadership */}
              {currentStep === 2 && (
                <div className="card">
                  <h3 style={{ marginBottom: '24px' }}>Department Leadership</h3>

                  <div className="form-group">
                    <label>Department lead</label>
                    <select
                      value={formData.department_lead_id}
                      onChange={(e) => setFormData({ ...formData, department_lead_id: e.target.value })}
                    >
                      <option value="">Select a department lead (optional)</option>
                      {admins.map(admin => (
                        <option key={admin.id} value={admin.id}>
                          {admin.name} ({admin.email})
                        </option>
                      ))}
                    </select>
                    <small className="form-help-text">
                      The department lead will have oversight of this department's learners and programmes
                    </small>
                  </div>

                  <div className="card" style={{ background: '#F5F5F5', marginTop: '20px' }}>
                    <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                      👤 A department lead can coordinate learning activities, monitor progress, and manage department-specific reporting.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Confirm */}
              {currentStep === 3 && (
                <div className="card">
                  <h3 style={{ marginBottom: '24px' }}>Review & Confirm</h3>

                  <div style={{ background: '#F5F5F5', padding: '20px', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #E0E0E0' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Department Name</div>
                      <div style={{ fontSize: '16px', fontWeight: 600 }}>{formData.name || '—'}</div>
                    </div>

                    <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #E0E0E0' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Code</div>
                      <div style={{ fontSize: '16px', fontWeight: 600 }}>{formData.code || '—'}</div>
                    </div>

                    <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #E0E0E0' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Type</div>
                      <div style={{ fontSize: '16px', fontWeight: 600 }}>
                        {formData.type === 'academic' ? 'Academic' : 'Administrative'}
                      </div>
                    </div>

                    {formData.description && (
                      <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #E0E0E0' }}>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Description</div>
                        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>{formData.description}</div>
                      </div>
                    )}

                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Department Lead</div>
                      <div style={{ fontSize: '16px', fontWeight: 600 }}>
                        {admins.find(a => a.id === formData.department_lead_id)?.name || 'Not assigned'}
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ background: '#E8F5E9', marginTop: '20px', border: '1px solid #4CAF50' }}>
                    <p style={{ fontSize: '13px', color: '#2E7D32', margin: 0 }}>
                      ✅ Everything looks good! Click "Create & Activate" to add this department to your institution.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                {currentStep > 1 && (
                  <button className="btn btn-secondary" onClick={handleBack}>
                    <ArrowLeft size={18} />
                    Back
                  </button>
                )}
                
                {currentStep < 3 && (
                  <button 
                    className="btn btn-primary" 
                    onClick={handleNext}
                    disabled={currentStep === 1 && !formData.name}
                  >
                    Next
                    <ArrowRight size={18} />
                  </button>
                )}

                {currentStep === 3 && (
                  <>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => handleSubmit(false)}
                      disabled={loading || !formData.name}
                    >
                      <Save size={18} />
                      {loading ? 'Saving...' : 'Save as Inactive'}
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => handleSubmit(true)}
                      disabled={loading || !formData.name}
                    >
                      <CheckCircle size={18} />
                      {loading ? 'Creating...' : 'Create & Activate'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Summary Panel */}
            <div className="cohort-summary">
              <div className="card">
                <h4 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: 600 }}>Summary</h4>

                <div className="summary-section">
                  <div className="summary-label">
                    <Building2 size={14} />
                    Department name
                  </div>
                  <div className="summary-value">{formData.name || '—'}</div>
                  {formData.code && <div className="summary-subvalue">{formData.code}</div>}
                </div>

                <div className="summary-section">
                  <div className="summary-label">
                    <FileText size={14} />
                    Type
                  </div>
                  <div className="summary-value">
                    {formData.type === 'academic' ? 'Academic' : 'Administrative'}
                  </div>
                </div>

                {formData.description && (
                  <div className="summary-section">
                    <div className="summary-label">
                      <FileText size={14} />
                      Description
                    </div>
                    <div className="summary-subvalue" style={{ fontSize: '12px', lineHeight: '1.5' }}>
                      {formData.description.length > 100 
                        ? formData.description.substring(0, 100) + '...' 
                        : formData.description}
                    </div>
                  </div>
                )}

                <div className="summary-section">
                  <div className="summary-label">
                    <UserCheck size={14} />
                    Department lead
                  </div>
                  <div className="summary-value">
                    {admins.find(a => a.id === formData.department_lead_id)?.name || '—'}
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

export default CreateDepartment

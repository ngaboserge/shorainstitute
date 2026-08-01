import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { 
  ArrowLeft, ArrowRight, Users, Calendar, BookOpen, 
  CheckCircle, FileText, Settings, Save, ChevronRight, Building2
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useShoraInstitute } from '../../hooks/useInstitutionalAuth'
import './Cohorts.css'

const CreateCohort = () => {
  const navigate = useNavigate()
  const { institutionId } = useShoraInstitute()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState([])
  const [admins, setAdmins] = useState([])
  const [availableLearners, setAvailableLearners] = useState([])
  const [selectedLearners, setSelectedLearners] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    programme_id: '',
    department_id: '',
    cohort_manager_id: '',
    delivery_format: 'hybrid',
    capacity: '',
    start_date: '',
    end_date: '',
    timezone: 'Africa/Kigali',
    completion_rules: {
      require_all_modules: true,
      min_assessment_score: 70,
      min_attendance: 80
    },
    status: 'draft'
  })

  useEffect(() => {
    if (institutionId) {
      fetchDepartments()
      fetchAdmins()
      fetchAvailableLearners()
    }
  }, [institutionId])

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('institution_departments')
        .select('id, name, code')
        .eq('institution_id', institutionId)
        .eq('status', 'active')
        .order('name')

      if (error) throw error
      setDepartments(data || [])
    } catch (err) {
      console.error('Error fetching departments:', err)
    }
  }

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('institution_admins')
        .select('id, user_id')
        .eq('institution_id', institutionId)
        .eq('status', 'active')

      if (error) throw error

      // Get user names
      if (data && data.length > 0) {
        const adminsWithNames = await Promise.all(
          data.map(async (admin) => {
            const { data: userData } = await supabase.auth.admin.getUserById(admin.user_id)
            return {
              id: admin.id,
              name: userData?.user?.raw_user_meta_data?.full_name || 'Unknown Admin',
              email: userData?.user?.email || ''
            }
          })
        )
        setAdmins(adminsWithNames)
      }
    } catch (err) {
      console.error('Error fetching admins:', err)
    }
  }

  const fetchAvailableLearners = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_institution_learners_full', {
          inst_id: institutionId
        })

      if (error) throw error
      setAvailableLearners(data || [])
    } catch (err) {
      console.error('Error fetching learners:', err)
    }
  }

  const handleLearnerToggle = (learner) => {
    const isSelected = selectedLearners.find(l => l.id === learner.id)
    if (isSelected) {
      setSelectedLearners(selectedLearners.filter(l => l.id !== learner.id))
    } else {
      setSelectedLearners([...selectedLearners, learner])
    }
  }

  const handleSelectAll = () => {
    const filteredLearners = availableLearners.filter(l =>
      l.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setSelectedLearners([...selectedLearners, ...filteredLearners.filter(
      l => !selectedLearners.find(sl => sl.id === l.id)
    )])
  }

  const handleDeselectAll = () => {
    setSelectedLearners([])
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (isDraft = true) => {
    try {
      setLoading(true)

      // Create cohort
      const { data: cohort, error: cohortError } = await supabase
        .from('institution_cohorts')
        .insert({
          institution_id: institutionId,
          name: formData.name,
          code: formData.code,
          programme_id: formData.programme_id || null,
          department_id: formData.department_id || null,
          cohort_manager_id: formData.cohort_manager_id || null,
          delivery_format: formData.delivery_format,
          capacity: parseInt(formData.capacity) || null,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          timezone: formData.timezone,
          completion_rules: formData.completion_rules,
          status: isDraft ? 'draft' : 'active',
          enrolled_count: selectedLearners.length
        })
        .select()
        .single()

      if (cohortError) throw cohortError

      // Add learners to cohort
      if (selectedLearners.length > 0 && cohort) {
        const members = selectedLearners.map(learner => ({
          cohort_id: cohort.id,
          learner_id: learner.id,
          joined_at: new Date().toISOString()
        }))

        const { error: membersError } = await supabase
          .from('institution_cohort_members')
          .insert(members)

        if (membersError) throw membersError
      }

      alert(`Cohort ${isDraft ? 'saved as draft' : 'created and activated'} successfully!`)
      navigate('/institutional/cohorts')

    } catch (err) {
      console.error('Error creating cohort:', err)
      alert(`Failed to create cohort: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { number: 1, title: 'Cohort Details', icon: FileText },
    { number: 2, title: 'Select Learners', icon: Users },
    { number: 3, title: 'Schedule', icon: Calendar },
    { number: 4, title: 'Completion Rules', icon: CheckCircle }
  ]

  const filteredAvailableLearners = availableLearners.filter(l =>
    !selectedLearners.find(sl => sl.id === l.id) &&
    (l.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     l.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="dashboard-layout">
      <Sidebar type="institutional" />
      <div className="main-content">
        <Header 
          title="Create Cohort"
          subtitle="Organize learners into a scheduled programme group."
          actions={
            <button className="btn btn-secondary" onClick={() => navigate('/institutional/cohorts')}>
              <ArrowLeft size={18} />
              Back to Cohorts
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

              {/* Step 1: Cohort Details */}
              {currentStep === 1 && (
                <div className="card">
                  <h3 style={{ marginBottom: '24px' }}>Cohort Details</h3>

                  <div className="form-group">
                    <label>Cohort name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Q1 2026 Finance Cohort"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Cohort code</label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="e.g., FIN-Q1-2026"
                        maxLength={20}
                      />
                    </div>

                    <div className="form-group">
                      <label>Department</label>
                      <select
                        value={formData.department_id}
                        onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                      >
                        <option value="">Select department</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Cohort manager</label>
                      <select
                        value={formData.cohort_manager_id}
                        onChange={(e) => setFormData({ ...formData, cohort_manager_id: e.target.value })}
                      >
                        <option value="">Select manager</option>
                        {admins.map(admin => (
                          <option key={admin.id} value={admin.id}>{admin.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Delivery format *</label>
                      <select
                        value={formData.delivery_format}
                        onChange={(e) => setFormData({ ...formData, delivery_format: e.target.value })}
                        required
                      >
                        <option value="hybrid">Hybrid</option>
                        <option value="online">Online</option>
                        <option value="in-person">In-person</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Maximum capacity</label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      placeholder="e.g., 50"
                      min="1"
                    />
                    <small className="form-help-text">Leave empty for unlimited capacity</small>
                  </div>
                </div>
              )}

              {/* Step 2: Select Learners */}
              {currentStep === 2 && (
                <div className="card">
                  <h3 style={{ marginBottom: '24px' }}>Select Learners</h3>

                  <div className="learner-selector">
                    {/* Available Learners */}
                    <div className="learner-pool">
                      <div className="pool-header">
                        <div className="pool-title">Available Learners</div>
                        <div className="pool-count">{filteredAvailableLearners.length}</div>
                      </div>
                      <div style={{ padding: '12px' }}>
                        <input
                          type="text"
                          placeholder="Search learners..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          style={{ width: '100%', marginBottom: '12px' }}
                        />
                      </div>
                      <div className="pool-list">
                        {filteredAvailableLearners.map(learner => (
                          <div key={learner.id} className="learner-item" onClick={() => handleLearnerToggle(learner)}>
                            <input
                              type="checkbox"
                              checked={false}
                              onChange={() => {}}
                            />
                            <div className="learner-info">
                              <div className="learner-name">{learner.full_name}</div>
                              <div className="learner-email">{learner.email}</div>
                            </div>
                          </div>
                        ))}
                        {filteredAvailableLearners.length === 0 && (
                          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                            No learners found
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="selector-actions">
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={handleSelectAll}
                        disabled={filteredAvailableLearners.length === 0}
                      >
                        Add All →
                      </button>
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={handleDeselectAll}
                        disabled={selectedLearners.length === 0}
                      >
                        ← Remove All
                      </button>
                    </div>

                    {/* Selected Learners */}
                    <div className="learner-pool">
                      <div className="pool-header">
                        <div className="pool-title">Selected Learners</div>
                        <div className="pool-count">{selectedLearners.length}</div>
                      </div>
                      <div className="pool-list">
                        {selectedLearners.map(learner => (
                          <div key={learner.id} className="learner-item" onClick={() => handleLearnerToggle(learner)}>
                            <input
                              type="checkbox"
                              checked={true}
                              onChange={() => {}}
                            />
                            <div className="learner-info">
                              <div className="learner-name">{learner.full_name}</div>
                              <div className="learner-email">{learner.email}</div>
                            </div>
                          </div>
                        ))}
                        {selectedLearners.length === 0 && (
                          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                            No learners selected
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Schedule */}
              {currentStep === 3 && (
                <div className="card">
                  <h3 style={{ marginBottom: '24px' }}>Schedule</h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Start date</label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>End date</label>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        min={formData.start_date}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Timezone</label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    >
                      <option value="Africa/Kigali">Africa/Kigali (CAT)</option>
                      <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                      <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                      <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="America/New_York">America/New York (EST)</option>
                    </select>
                  </div>

                  <div className="card" style={{ background: '#F5F5F5', marginTop: '20px' }}>
                    <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                      📅 The schedule defines when learners can access programme content and when assessments are due.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4: Completion Rules */}
              {currentStep === 4 && (
                <div className="card">
                  <h3 style={{ marginBottom: '24px' }}>Completion Rules</h3>

                  <div className="completion-rules">
                    <div className="rule-card">
                      <div className="rule-icon success">
                        <BookOpen size={20} />
                      </div>
                      <div className="rule-content">
                        <div className="rule-title">Module Completion</div>
                        <div className="rule-description">
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                            <input
                              type="checkbox"
                              checked={formData.completion_rules.require_all_modules}
                              onChange={(e) => setFormData({
                                ...formData,
                                completion_rules: {
                                  ...formData.completion_rules,
                                  require_all_modules: e.target.checked
                                }
                              })}
                            />
                            <span style={{ fontSize: '13px' }}>Require all modules to be completed</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="rule-card">
                      <div className="rule-icon success">
                        <CheckCircle size={20} />
                      </div>
                      <div className="rule-content">
                        <div className="rule-title">Assessment Score</div>
                        <div className="rule-description">
                          <label style={{ fontSize: '13px', marginBottom: '8px', display: 'block' }}>
                            Minimum assessment score (%)
                          </label>
                          <input
                            type="number"
                            value={formData.completion_rules.min_assessment_score}
                            onChange={(e) => setFormData({
                              ...formData,
                              completion_rules: {
                                ...formData.completion_rules,
                                min_assessment_score: parseInt(e.target.value) || 0
                              }
                            })}
                            min="0"
                            max="100"
                            style={{ width: '100px' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rule-card">
                      <div className="rule-icon success">
                        <Users size={20} />
                      </div>
                      <div className="rule-content">
                        <div className="rule-title">Attendance</div>
                        <div className="rule-description">
                          <label style={{ fontSize: '13px', marginBottom: '8px', display: 'block' }}>
                            Minimum attendance (%)
                          </label>
                          <input
                            type="number"
                            value={formData.completion_rules.min_attendance}
                            onChange={(e) => setFormData({
                              ...formData,
                              completion_rules: {
                                ...formData.completion_rules,
                                min_attendance: parseInt(e.target.value) || 0
                              }
                            })}
                            min="0"
                            max="100"
                            style={{ width: '100px' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ background: '#F5F5F5', marginTop: '20px' }}>
                    <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                      ✅ These rules determine when a learner is considered to have completed the cohort programme.
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
                
                {currentStep < 4 && (
                  <button className="btn btn-primary" onClick={handleNext}>
                    Next
                    <ArrowRight size={18} />
                  </button>
                )}

                {currentStep === 4 && (
                  <>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => handleSubmit(true)}
                      disabled={loading || !formData.name}
                    >
                      <Save size={18} />
                      {loading ? 'Saving...' : 'Save as Draft'}
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => handleSubmit(false)}
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
                    <FileText size={14} />
                    Cohort name
                  </div>
                  <div className="summary-value">{formData.name || '—'}</div>
                  {formData.code && <div className="summary-subvalue">{formData.code}</div>}
                </div>

                <div className="summary-section">
                  <div className="summary-label">
                    <Building2 size={14} />
                    Department
                  </div>
                  <div className="summary-value">
                    {departments.find(d => d.id === formData.department_id)?.name || '—'}
                  </div>
                </div>

                <div className="summary-section">
                  <div className="summary-label">
                    <Users size={14} />
                    Learners
                  </div>
                  <div className="summary-value">
                    {selectedLearners.length}
                    {formData.capacity && ` / ${formData.capacity}`}
                  </div>
                </div>

                <div className="summary-section">
                  <div className="summary-label">
                    <BookOpen size={14} />
                    Delivery format
                  </div>
                  <div className="summary-value">
                    {formData.delivery_format.charAt(0).toUpperCase() + formData.delivery_format.slice(1)}
                  </div>
                </div>

                <div className="summary-section">
                  <div className="summary-label">
                    <Calendar size={14} />
                    Schedule
                  </div>
                  {formData.start_date && formData.end_date ? (
                    <>
                      <div className="summary-value">
                        {new Date(formData.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="summary-subvalue">
                        to {new Date(formData.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </>
                  ) : (
                    <div className="summary-value">—</div>
                  )}
                </div>

                <div className="summary-section">
                  <div className="summary-label">
                    <CheckCircle size={14} />
                    Completion rules
                  </div>
                  <div className="summary-subvalue" style={{ fontSize: '12px' }}>
                    {formData.completion_rules.require_all_modules && '✓ All modules\n'}
                    {formData.completion_rules.min_assessment_score > 0 && `✓ ${formData.completion_rules.min_assessment_score}% assessment\n`}
                    {formData.completion_rules.min_attendance > 0 && `✓ ${formData.completion_rules.min_attendance}% attendance`}
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

export default CreateCohort

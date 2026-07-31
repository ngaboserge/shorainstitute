import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { 
  BookOpen, 
  Users, 
  Mail, 
  X, 
  Loader, 
  AlertCircle, 
  CheckCircle,
  Calendar,
  ArrowLeft
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useShoraInstitute } from '../../hooks/useInstitutionalAuth'
import './AssignCourse.css'

const AssignCourse = () => {
  const navigate = useNavigate()
  const { institutionId, institutionName, loading: institutionLoading } = useShoraInstitute()
  
  // Debug
  useEffect(() => {
    console.log('🏢 Institution ID:', institutionId)
    console.log('🏢 Institution Name:', institutionName)
    console.log('🏢 Loading:', institutionLoading)
  }, [institutionId, institutionName, institutionLoading])
  
  const [step, setStep] = useState(1) // 1: Select Course, 2: Select Target, 3: Details, 4: Confirm
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [assignmentType, setAssignmentType] = useState('email') // 'email', 'all', 'department', 'individual'
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  
  // Data
  const [courses, setCourses] = useState([])
  const [learners, setLearners] = useState([])
  const [departments, setDepartments] = useState([])
  
  // Email-based assignment
  const [emailInput, setEmailInput] = useState('')
  const [emailList, setEmailList] = useState([])
  const [checkingEmails, setCheckingEmails] = useState(false)
  
  // Other assignment options
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedLearners, setSelectedLearners] = useState([])
  
  // Assignment details
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [isMandatory, setIsMandatory] = useState(false)
  const [sendNotification, setSendNotification] = useState(true)
  const [customMessage, setCustomMessage] = useState('')

  useEffect(() => {
    if (institutionId) {
      fetchData()
    }
  }, [institutionId])

  const fetchData = async () => {
    if (!institutionId) return // Guard against null institutionId
    
    try {
      setLoading(true)
      
      // Fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'published')
        .order('title')

      if (coursesError) throw coursesError
      setCourses(coursesData || [])

      // Fetch learners
      const { data: learnersData, error: learnersError } = await supabase
        .from('institution_learners')
        .select('*')
        .eq('institution_id', institutionId)
        .eq('status', 'active')

      if (learnersError && learnersError.code !== 'PGRST116') throw learnersError
      setLearners(learnersData || [])

      // Fetch departments
      const { data: deptsData, error: deptsError } = await supabase
        .from('institution_departments')
        .select('*')
        .eq('institution_id', institutionId)

      if (deptsError && deptsError.code !== 'PGRST116') throw deptsError
      setDepartments(deptsData || [])

    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email.toLowerCase())
  }

  const checkEmployeeEmail = async (email) => {
    try {
      const { data, error } = await supabase
        .rpc('check_employee_exists', {
          p_institution_id: institutionId,
          p_email: email
        })
      
      if (error) throw error
      
      const exists = data && data.length > 0 && data[0].employee_exists
      return {
        email,
        exists,
        learnerId: exists ? data[0].learner_id : null,
        userId: exists ? data[0].user_id : null,
        fullName: exists ? data[0].full_name : '',
        name: '',
        employeeId: '',
        department: '',
        jobTitle: ''
      }
    } catch (err) {
      console.error('Error checking email:', err)
      return {
        email,
        exists: false,
        learnerId: null,
        name: '',
        employeeId: '',
        department: '',
        jobTitle: ''
      }
    }
  }

  const handleAddEmail = async () => {
    const trimmedEmail = emailInput.trim().toLowerCase()
    
    if (!trimmedEmail) return
    
    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address')
      return
    }
    
    if (emailList.find(e => e.email === trimmedEmail)) {
      setError('This email is already in the list')
      return
    }
    
    setCheckingEmails(true)
    const checked = await checkEmployeeEmail(trimmedEmail)
    setCheckingEmails(false)
    
    setEmailList(prev => [...prev, checked])
    setEmailInput('')
    setError(null)
  }

  const handleRemoveEmail = (email) => {
    setEmailList(prev => prev.filter(e => e.email !== email))
  }

  const handleUpdateEmailData = (email, field, value) => {
    setEmailList(prev => prev.map(e => 
      e.email === email ? { ...e, [field]: value } : e
    ))
  }

  const getTargetCount = () => {
    switch (assignmentType) {
      case 'email':
        return emailList.length
      case 'all':
        return learners.length
      case 'department':
        return selectedDepartment ? learners.filter(l => l.department_id === selectedDepartment).length : 0
      case 'individual':
        return selectedLearners.length
      default:
        return 0
    }
  }

  const handleSubmit = async () => {
    if (!selectedCourse) {
      setError('Please select a course')
      return
    }

    if (getTargetCount() === 0) {
      setError('Please select at least one employee or enter email addresses')
      return
    }

    if (!startDate) {
      setError('Please set a start date')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const currentUser = (await supabase.auth.getUser()).data.user

      // EMAIL-BASED ASSIGNMENT
      if (assignmentType === 'email') {
        const existingEmployees = emailList.filter(e => e.exists)
        const newEmployees = emailList.filter(e => !e.exists)

        // Assign to existing employees
        if (existingEmployees.length > 0) {
          const enrollments = existingEmployees.map(emp => ({
            institution_id: institutionId,
            learner_id: emp.learnerId,
            course_id: selectedCourse.id,
            enrolled_via: 'email_assignment',
            status: 'not_started',
            progress_percentage: 0,
            enrolled_at: new Date().toISOString(),
            employee_id: emp.employeeId || null,
            department: emp.department || null,
            job_title: emp.jobTitle || null,
            employee_verified: true,
            verified_at: new Date().toISOString(),
            verified_by: currentUser.id
          }))

          const { error: enrollError } = await supabase
            .from('learner_institutional_enrollments')
            .insert(enrollments)

          if (enrollError) throw enrollError
        }

        // Create pending assignments for new employees
        if (newEmployees.length > 0) {
          const pendingAssignments = newEmployees.map(emp => ({
            institution_id: institutionId,
            course_id: selectedCourse.id,
            employee_email: emp.email,
            employee_name: emp.name || null,
            employee_id: emp.employeeId || null,
            department_id: departments.find(d => d.name === emp.department)?.id || null,
            job_title: emp.jobTitle || null,
            start_date: startDate,
            due_date: dueDate || null,
            is_mandatory: isMandatory,
            custom_message: customMessage || null,
            assigned_by: currentUser.id,
            status: 'pending'
          }))

          const { error: pendingError } = await supabase
            .from('pending_course_assignments')
            .insert(pendingAssignments)

          if (pendingError) throw pendingError
        }

        setSuccess(`✅ Successfully assigned course to ${existingEmployees.length} existing employee(s)!${newEmployees.length > 0 ? `\n\n📧 Sent ${newEmployees.length} invitation(s) to new employees.\n\nIMPORTANT: Share the invitation links from the Assignments page.` : ''}`)
      }
      // OTHER ASSIGNMENT TYPES (TODO: implement)
      else {
        setError('This assignment type is not yet implemented. Please use "By Email" for now.')
        setSubmitting(false)
        return
      }

      // Show success and redirect to assignments page
      setTimeout(() => {
        navigate('/institutional/assignments')
      }, 3000)

    } catch (err) {
      console.error('Error assigning course:', err)
      setError(err.message || 'Failed to assign course')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || institutionLoading) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="institutional" />
        <div className="main-content">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Loader size={48} className="spinner" />
          </div>
        </div>
      </div>
    )
  }

  if (!institutionId) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="institutional" />
        <div className="main-content">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
            <AlertCircle size={48} color="#d32f2f" />
            <h3>No Institution Found</h3>
            <p>You are not associated with any institution.</p>
            <button className="btn btn-secondary" onClick={() => navigate('/institutional/overview')}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">
      <Sidebar type="institutional" />
      <div className="main-content">
        <Header 
          title="Assign Course to Employees"
          subtitle="Select a course and assign it to your employees by email"
          actions={
            <button className="btn btn-secondary" onClick={() => navigate('/institutional/programmes')}>
              <ArrowLeft size={18} />
              Back to Programmes
            </button>
          }
        />

        <div className="content-wrapper assign-course-container">
          {/* Progress Steps */}
          <div className="steps-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Select Course</div>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Add Employees</div>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Set Details</div>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 4 ? 'active' : ''}`}>
              <div className="step-number">4</div>
              <div className="step-label">Confirm</div>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <CheckCircle size={18} />
              <span style={{ whiteSpace: 'pre-line' }}>{success}</span>
            </div>
          )}

          {/* Step Content */}
          <div className="card">
            {/* STEP 1: SELECT COURSE */}
            {step === 1 && (
              <div className="step-content">
                <h3>Select a Course</h3>
                <p className="step-description">Choose which course you want to assign to employees</p>

                {courses.length === 0 ? (
                  <div className="empty-state">
                    <BookOpen size={48} />
                    <p>No published courses available</p>
                    <small>Trainers need to publish courses first</small>
                  </div>
                ) : (
                  <div className="courses-grid">
                    {courses.map(course => (
                      <div
                        key={course.id}
                        className={`course-card ${selectedCourse?.id === course.id ? 'selected' : ''}`}
                        onClick={() => setSelectedCourse(course)}
                      >
                        <div className="course-header">
                          <h4>{course.title}</h4>
                          {course.price > 0 ? (
                            <span className="course-price">{course.price.toLocaleString()} RWF</span>
                          ) : (
                            <span className="course-price free">FREE</span>
                          )}
                        </div>
                        {course.description && (
                          <p className="course-description">{course.description.substring(0, 100)}...</p>
                        )}
                        <div className="course-meta">
                          <span>{course.category || 'General'}</span>
                          {course.instructor_name && <span>•</span>}
                          <span>{course.instructor_name || 'Unknown Instructor'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="step-actions">
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setStep(2)}
                    disabled={!selectedCourse}
                  >
                    Next: Add Employees
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: ADD EMPLOYEES */}
            {step === 2 && (
              <div className="step-content">
                <h3>Add Employees by Email</h3>
                <p className="step-description">
                  Enter employee email addresses. The system will check if they have accounts and send invitations to new employees.
                </p>

                <div className="email-input-section">
                  <div className="input-group">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEmail())}
                      placeholder="employee@company.com"
                      disabled={checkingEmails}
                    />
                    <button 
                      onClick={handleAddEmail}
                      disabled={checkingEmails || !emailInput.trim()}
                      className="btn btn-secondary"
                    >
                      {checkingEmails ? <Loader size={16} className="spinner" /> : 'Add'}
                    </button>
                  </div>
                  <small className="help-text">Press Enter or click Add. We'll check if they have accounts.</small>
                </div>

                {emailList.length > 0 && (
                  <div className="email-list">
                    <div className="email-list-header">
                      <strong>{emailList.length} employee{emailList.length !== 1 ? 's' : ''}</strong>
                      <small>
                        {emailList.filter(e => e.exists).length} existing, 
                        {emailList.filter(e => !e.exists).length} new (will receive invitation)
                      </small>
                    </div>

                    {emailList.map((emp) => (
                      <div key={emp.email} className="email-item">
                        <div className="email-header">
                          <div className="email-info">
                            <Mail size={16} />
                            <strong>{emp.email}</strong>
                            {emp.exists ? (
                              <span className="badge badge-success">✓ Has Account</span>
                            ) : (
                              <span className="badge badge-warning">ⓘ Will Send Invitation</span>
                            )}
                          </div>
                          <button onClick={() => handleRemoveEmail(emp.email)} className="btn-icon">
                            <X size={16} />
                          </button>
                        </div>

                        {!emp.exists && (
                          <div className="employee-details">
                            <input
                              type="text"
                              placeholder="Full Name (optional)"
                              value={emp.name}
                              onChange={(e) => handleUpdateEmailData(emp.email, 'name', e.target.value)}
                            />
                            <input
                              type="text"
                              placeholder="Employee ID (optional)"
                              value={emp.employeeId}
                              onChange={(e) => handleUpdateEmailData(emp.email, 'employeeId', e.target.value)}
                            />
                            <input
                              type="text"
                              placeholder="Department (optional)"
                              value={emp.department}
                              onChange={(e) => handleUpdateEmailData(emp.email, 'department', e.target.value)}
                            />
                            <input
                              type="text"
                              placeholder="Job Title (optional)"
                              value={emp.jobTitle}
                              onChange={(e) => handleUpdateEmailData(emp.email, 'jobTitle', e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="step-actions">
                  <button className="btn btn-secondary" onClick={() => setStep(1)}>
                    Back
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setStep(3)}
                    disabled={emailList.length === 0}
                  >
                    Next: Set Details
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SET DETAILS */}
            {step === 3 && (
              <div className="step-content">
                <h3>Assignment Details</h3>
                <p className="step-description">Set start date, due date, and other options</p>

                <div className="form-section">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Date *</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Due Date (Optional)</label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        min={startDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={isMandatory}
                        onChange={(e) => setIsMandatory(e.target.checked)}
                      />
                      <span>Mark as Mandatory</span>
                    </label>
                    <small className="help-text">Employees will see this as required training</small>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={sendNotification}
                        onChange={(e) => setSendNotification(e.target.checked)}
                      />
                      <span>Send Email Notification</span>
                    </label>
                    <small className="help-text">Employees will receive an email about this assignment</small>
                  </div>

                  <div className="form-group">
                    <label>Custom Message (Optional)</label>
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows={3}
                      placeholder="Add a message for your employees about this course..."
                    />
                  </div>
                </div>

                <div className="step-actions">
                  <button className="btn btn-secondary" onClick={() => setStep(2)}>
                    Back
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setStep(4)}
                    disabled={!startDate}
                  >
                    Next: Review & Confirm
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: CONFIRM */}
            {step === 4 && (
              <div className="step-content">
                <h3>Review & Confirm</h3>
                <p className="step-description">Please review the assignment details before confirming</p>

                <div className="summary-section">
                  <div className="summary-card">
                    <h4>📚 Course</h4>
                    <p><strong>{selectedCourse?.title}</strong></p>
                    <p>{selectedCourse?.price > 0 ? `${selectedCourse.price.toLocaleString()} RWF per employee` : 'FREE'}</p>
                  </div>

                  <div className="summary-card">
                    <h4>👥 Employees</h4>
                    <p><strong>{emailList.length} total</strong></p>
                    <p>{emailList.filter(e => e.exists).length} existing • {emailList.filter(e => !e.exists).length} new</p>
                  </div>

                  <div className="summary-card">
                    <h4>📅 Schedule</h4>
                    <p>Start: <strong>{startDate}</strong></p>
                    {dueDate && <p>Due: <strong>{dueDate}</strong></p>}
                    <p>{isMandatory ? '⚠️ Mandatory' : '✓ Optional'}</p>
                  </div>

                  {selectedCourse?.price > 0 && (
                    <div className="summary-card warning">
                      <h4>💰 Total Cost</h4>
                      <p className="total-cost">{(selectedCourse.price * emailList.length).toLocaleString()} RWF</p>
                      <small>⚠️ Testing Mode: Payment disabled</small>
                    </div>
                  )}
                </div>

                <div className="step-actions">
                  <button className="btn btn-secondary" onClick={() => setStep(3)}>
                    Back
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader size={18} className="spinner" />
                        Assigning...
                      </>
                    ) : (
                      `Confirm & Assign to ${emailList.length} Employee${emailList.length !== 1 ? 's' : ''}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignCourse

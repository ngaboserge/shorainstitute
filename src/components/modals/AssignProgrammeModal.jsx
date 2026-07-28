import React, { useState, useEffect } from 'react'
import { X, BookOpen, Users, Calendar, Search, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import './Modal.css'

const AssignProgrammeModal = ({ isOpen, onClose, onAssign, selectedLearners = [], institutionId }) => {
  const [assignmentType, setAssignmentType] = useState('all') // 'all', 'department', 'cohort', 'individual'
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [cohort, setCohort] = useState('')
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [department, setDepartment] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [learnerSelection, setLearnerSelection] = useState(selectedLearners.map(l => l.id))
  const [isMandatory, setIsMandatory] = useState(true)
  const [sendNotification, setSendNotification] = useState(true)
  const [customMessage, setCustomMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Data from database
  const [courses, setCourses] = useState([])
  const [learners, setLearners] = useState([])
  const [departments, setDepartments] = useState([])
  const [cohorts, setCohorts] = useState([])

  useEffect(() => {
    if (isOpen && institutionId) {
      fetchData()
    }
  }, [isOpen, institutionId])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch published courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          profiles:trainer_id (
            full_name
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (coursesError) throw coursesError
      setCourses(coursesData || [])

      // Fetch institution learners
      const { data: learnersData, error: learnersError } = await supabase
        .from('institution_learners')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email,
            avatar_url
          ),
          institution_departments:department_id (
            name
          )
        `)
        .eq('institution_id', institutionId)
        .eq('status', 'active')
        .order('enrolled_at', { ascending: false })

      if (learnersError) throw learnersError
      
      const transformedLearners = (learnersData || []).map(learner => ({
        id: learner.id,
        userId: learner.user_id,
        name: learner.profiles?.full_name || 'Unknown',
        email: learner.profiles?.email || '',
        avatar: learner.profiles?.avatar_url || `https://i.pravatar.cc/150?u=${learner.user_id}`,
        department: learner.institution_departments?.name || 'Unassigned',
        departmentId: learner.department_id,
        employeeId: learner.employee_id
      }))
      setLearners(transformedLearners)

      // Fetch departments
      const { data: deptsData, error: deptsError } = await supabase
        .from('institution_departments')
        .select('*')
        .eq('institution_id', institutionId)
        .order('name')

      if (deptsError && deptsError.code !== 'PGRST116') throw deptsError
      setDepartments(deptsData || [])

      // Fetch cohorts
      const { data: cohortsData, error: cohortsError } = await supabase
        .from('institution_cohorts')
        .select('*')
        .eq('institution_id', institutionId)
        .order('name')

      if (cohortsError && cohortsError.code !== 'PGRST116') throw cohortsError
      setCohorts(cohortsData || [])

    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Filter learners based on selected department and assignment type
  const getTargetLearners = () => {
    switch (assignmentType) {
      case 'all':
        return learners
      case 'department':
        return department ? learners.filter(l => l.departmentId === department) : []
      case 'cohort':
        // For now, return all learners. In real implementation, filter by cohort
        return learners
      case 'individual':
        return learners.filter(l => learnerSelection.includes(l.id))
      default:
        return []
    }
  }

  const targetLearners = getTargetLearners()
  const targetCount = targetLearners.length

  const handleLearnerToggle = (learnerId) => {
    setLearnerSelection(prev => 
      prev.includes(learnerId) 
        ? prev.filter(id => id !== learnerId)
        : [...prev, learnerId]
    )
  }

  const handleSelectAll = () => {
    const visibleLearnerIds = learners.map(l => l.id)
    if (learnerSelection.length === visibleLearnerIds.length) {
      setLearnerSelection([])
    } else {
      setLearnerSelection(visibleLearnerIds)
    }
  }

  const calculateTotalCost = () => {
    if (!selectedCourse || targetCount === 0) return 0
    return targetCount * (selectedCourse.price || 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    
    if (!selectedCourse) {
      setError('Please select a course')
      return
    }

    if (targetCount === 0) {
      setError('Please select at least one learner')
      return
    }

    if (!startDate) {
      setError('Please set a start date')
      return
    }

    setSubmitting(true)

    try {
      // 1. Create course assignment record
      const { data: assignment, error: assignmentError } = await supabase
        .from('institution_course_assignments')
        .insert({
          institution_id: institutionId,
          course_id: selectedCourse.id,
          assigned_to: assignmentType,
          department_id: assignmentType === 'department' ? department : null,
          cohort_id: assignmentType === 'cohort' ? cohort : null,
          start_date: startDate,
          due_date: dueDate || null,
          is_mandatory: isMandatory,
          send_reminders: true,
          send_notification: sendNotification,
          custom_message: customMessage.trim() || null,
          total_assigned: targetCount,
          assigned_by: (await supabase.auth.getUser()).data.user.id
        })
        .select()
        .single()

      if (assignmentError) throw assignmentError

      // 2. Create enrollments for each learner
      const enrollments = targetLearners.map(learner => ({
        institution_id: institutionId,
        learner_id: learner.id,
        course_id: selectedCourse.id,
        assignment_id: assignment.id,
        enrolled_via: 'institution_assignment',
        status: 'not_started',
        progress_percentage: 0,
        due_date: dueDate || null,
        enrolled_at: new Date().toISOString()
      }))

      const { error: enrollmentsError } = await supabase
        .from('learner_institutional_enrollments')
        .insert(enrollments)

      if (enrollmentsError) throw enrollmentsError

      // 3. Create notifications (if enabled)
      if (sendNotification) {
        const notifications = targetLearners.map(learner => ({
          institution_id: institutionId,
          recipient_user_id: learner.userId,
          type: 'course_assigned',
          title: `New ${isMandatory ? 'Mandatory' : ''} Course Assigned`,
          message: customMessage || `You have been assigned the course: ${selectedCourse.title}`,
          link: `/learner/courses/${selectedCourse.id}`,
          status: 'pending',
          send_email: true,
          context: {
            course_id: selectedCourse.id,
            course_title: selectedCourse.title,
            assignment_id: assignment.id,
            due_date: dueDate,
            is_mandatory: isMandatory
          }
        }))

        await supabase
          .from('institution_notifications')
          .insert(notifications)
      }

      // Success!
      if (onAssign) {
        await onAssign({
          assignmentId: assignment.id,
          courseId: selectedCourse.id,
          learnerCount: targetCount
        })
      }

      onClose()

    } catch (err) {
      console.error('Error assigning course:', err)
      setError(err.message || 'Failed to assign course. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-xlarge" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Assign Course to Employees</h2>
            <p className="modal-subtitle">Select a course and assign it to your employees</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="modal-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Loader size={48} className="spinner" style={{ margin: '0 auto 16px' }} />
            <p>Loading courses and employees...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {/* Error Alert */}
              {error && (
                <div className="alert alert-error" style={{ marginBottom: '24px' }}>
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {/* Step 1: Select Course */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={20} />
                  Step 1: Select Course
                </h3>

                <div className="search-box" style={{ marginBottom: '16px' }}>
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                  {filteredCourses.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#666', gridColumn: '1 / -1' }}>
                      <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                      <p>No courses available</p>
                    </div>
                  ) : (
                    filteredCourses.map((course) => (
                      <div
                        key={course.id}
                        onClick={() => setSelectedCourse(course)}
                        style={{
                          padding: '16px',
                          border: `2px solid ${selectedCourse?.id === course.id ? '#0B4F9F' : '#e0e0e0'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          background: selectedCourse?.id === course.id ? '#f0f7ff' : 'white'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '12px' }}>
                          <input
                            type="radio"
                            name="course"
                            checked={selectedCourse?.id === course.id}
                            onChange={() => setSelectedCourse(course)}
                            style={{ marginTop: '2px' }}
                          />
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600 }}>
                              {course.title}
                            </h4>
                            {course.description && (
                              <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
                                {course.description.substring(0, 100)}
                                {course.description.length > 100 ? '...' : ''}
                              </p>
                            )}
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              By: {course.profiles?.full_name || 'Unknown Trainer'}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                          <span style={{ color: '#666' }}>{course.category || 'General'}</span>
                          <span style={{ fontWeight: 600, color: '#0B4F9F' }}>
                            {course.price ? `${course.price.toLocaleString()} RWF` : 'Free'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {selectedCourse && (
                  <div className="info-box" style={{ marginTop: '16px' }}>
                    <CheckCircle size={18} style={{ color: '#10B981' }} />
                    <div>
                      <strong>Selected: {selectedCourse.title}</strong>
                      <p style={{ margin: '4px 0 0', fontSize: '13px' }}>
                        Cost per employee: {selectedCourse.price ? `${selectedCourse.price.toLocaleString()} RWF` : 'Free'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Select Target Employees */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={20} />
                  Step 2: Select Target Employees
                </h3>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Assign To</label>
                  <select
                    value={assignmentType}
                    onChange={(e) => setAssignmentType(e.target.value)}
                    className="form-input"
                  >
                    <option value="all">All Employees ({learners.length})</option>
                    <option value="department">Specific Department</option>
                    <option value="cohort">Specific Cohort</option>
                    <option value="individual">Select Individuals</option>
                  </select>
                </div>

                {assignmentType === 'department' && (
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Select Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="form-input"
                      required
                    >
                      <option value="">Choose department...</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name} ({learners.filter(l => l.departmentId === dept.id).length} employees)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {assignmentType === 'cohort' && (
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Select Cohort</label>
                    <select
                      value={cohort}
                      onChange={(e) => setCohort(e.target.value)}
                      className="form-input"
                      required
                    >
                      <option value="">Choose cohort...</option>
                      {cohorts.length === 0 ? (
                        <option disabled>No cohorts created yet</option>
                      ) : (
                        cohorts.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                )}

                {assignmentType === 'individual' && (
                  <div style={{ 
                    maxHeight: '300px', 
                    overflowY: 'auto', 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '8px',
                    background: 'white'
                  }}>
                    <div style={{ 
                      padding: '12px 16px', 
                      borderBottom: '1px solid #e0e0e0',
                      background: '#f8f9fa',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1
                    }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={learnerSelection.length === learners.length && learners.length > 0}
                          onChange={handleSelectAll}
                        />
                        <strong>Select All ({learners.length})</strong>
                      </label>
                    </div>

                    {learners.map((learner) => (
                      <div
                        key={learner.id}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #f0f0f0',
                          transition: 'background 0.2s',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleLearnerToggle(learner.id)}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={learnerSelection.includes(learner.id)}
                            onChange={() => handleLearnerToggle(learner.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <img 
                            src={learner.avatar} 
                            alt={learner.name}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: '500', fontSize: '14px' }}>{learner.name}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {learner.employeeId || learner.email} • {learner.department}
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: '12px', padding: '12px', background: '#f0f7ff', borderRadius: '6px' }}>
                  <strong style={{ color: '#0B4F9F' }}>
                    {targetCount} employee{targetCount !== 1 ? 's' : ''} will be assigned this course
                  </strong>
                </div>
              </div>

              {/* Step 3: Assignment Details */}
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={20} />
                  Step 3: Assignment Details
                </h3>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Date *</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="form-input"
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Due Date (Optional)</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="form-input"
                      min={startDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isMandatory}
                      onChange={(e) => setIsMandatory(e.target.checked)}
                    />
                    <span className="form-label" style={{ margin: 0 }}>Mark as Mandatory</span>
                  </label>
                  <small className="form-hint">Mandatory courses must be completed by employees</small>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={sendNotification}
                      onChange={(e) => setSendNotification(e.target.checked)}
                    />
                    <span className="form-label" style={{ margin: 0 }}>Send Email Notification</span>
                  </label>
                  <small className="form-hint">Employees will receive an email about this assignment</small>
                </div>

                <div className="form-group">
                  <label className="form-label">Custom Message (Optional)</label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="form-textarea"
                    rows={3}
                    placeholder="Add a message for your employees about this course assignment..."
                  />
                </div>
              </div>

              {/* Cost Summary */}
              {selectedCourse && selectedCourse.price > 0 && targetCount > 0 && (
                <div style={{ 
                  padding: '16px', 
                  background: '#FFF7ED', 
                  border: '2px solid #FB923C',
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 600 }}>
                    💰 Cost Summary
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                    <span>Course price per employee:</span>
                    <strong>{selectedCourse.price.toLocaleString()} RWF</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                    <span>Number of employees:</span>
                    <strong>× {targetCount}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700, paddingTop: '8px', borderTop: '1px solid #FB923C' }}>
                    <span>Total Cost:</span>
                    <span style={{ color: '#EA580C' }}>{calculateTotalCost().toLocaleString()} RWF</span>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submitting || !selectedCourse || targetCount === 0 || !startDate}
              >
                {submitting ? (
                  <>
                    <Loader size={18} className="spinner" />
                    Assigning...
                  </>
                ) : (
                  `Assign to ${targetCount} Employee${targetCount !== 1 ? 's' : ''}`
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default AssignProgrammeModal

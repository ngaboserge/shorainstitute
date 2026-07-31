import React, { useState, useEffect } from 'react'
import { X, BookOpen, Users, Calendar, TrendingUp, Download, Award, Clock, ShoppingCart, DollarSign } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { supabase } from '../../lib/supabase'
import './Modal.css'

const ProgrammeDetailsModal = ({ isOpen, onClose, programme }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [courseDetails, setCourseDetails] = useState(null)
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [enrolledLearners, setEnrolledLearners] = useState([])

  useEffect(() => {
    if (isOpen && programme) {
      fetchCourseDetails()
    }
  }, [isOpen, programme])

  const fetchCourseDetails = async () => {
    try {
      setLoading(true)

      // Fetch full course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', programme.id)
        .single()

      if (courseError) throw courseError

      setCourseDetails(courseData)

      // Fetch lessons for this course
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', programme.id)
        .order('order_index', { ascending: true })

      if (lessonsError) {
        console.log('No lessons found:', lessonsError)
        setLessons([])
      } else {
        setLessons(lessonsData || [])
      }

      // Fetch enrolled learners
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('course_id', programme.id)

      if (enrollmentsError) {
        console.log('No enrollments found:', enrollmentsError)
        setEnrolledLearners([])
      } else {
        setEnrolledLearners(enrollmentsData || [])
      }

    } catch (error) {
      console.error('Error fetching course details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchaseCourse = () => {
    // This will be implemented later - for now just show an alert
    alert(`Purchase flow for ${courseDetails?.title}\n\nPrice: ${courseDetails?.currency} ${courseDetails?.price}\n\nThis will open the purchase modal where you can:\n- Select number of seats\n- Complete payment\n- Generate enrollment codes\n\nComing soon!`)
  }

  if (!isOpen || !programme) return null

  // Calculate real stats from enrolled learners
  const totalEnrolled = enrolledLearners.length
  const avgProgress = totalEnrolled > 0
    ? Math.round(enrolledLearners.reduce((sum, e) => sum + (e.progress || 0), 0) / totalEnrolled)
    : 0
  const completedCount = enrolledLearners.filter(e => e.progress === 100).length
  const inProgressCount = enrolledLearners.filter(e => e.progress > 0 && e.progress < 100).length
  const notStartedCount = enrolledLearners.filter(e => e.progress === 0).length
  const completionRate = totalEnrolled > 0 
    ? Math.round((completedCount / totalEnrolled) * 100)
    : 0

  // Real completion distribution
  const completionData = totalEnrolled > 0 ? [
    { name: 'Completed', value: Math.round((completedCount / totalEnrolled) * 100), color: '#4caf50' },
    { name: 'In Progress', value: Math.round((inProgressCount / totalEnrolled) * 100), color: '#2196f3' },
    { name: 'Not Started', value: Math.round((notStartedCount / totalEnrolled) * 100), color: '#ff9800' }
  ] : [
    { name: 'Completed', value: 0, color: '#4caf50' },
    { name: 'In Progress', value: 0, color: '#2196f3' },
    { name: 'Not Started', value: 100, color: '#ff9800' }
  ]

  // Mock data for progress by department (can be enhanced later)
  const departmentProgress = [
    { name: 'Credit & Risk', enrolled: Math.floor(totalEnrolled * 0.3), avgProgress: avgProgress + 5 },
    { name: 'Finance', enrolled: Math.floor(totalEnrolled * 0.26), avgProgress: avgProgress - 2 },
    { name: 'Operations', enrolled: Math.floor(totalEnrolled * 0.22), avgProgress: avgProgress + 3 },
    { name: 'HR & Admin', enrolled: Math.floor(totalEnrolled * 0.14), avgProgress: avgProgress - 5 },
    { name: 'IT', enrolled: Math.floor(totalEnrolled * 0.08), avgProgress: avgProgress + 10 }
  ]

  // Check if course is paid
  const isPaidCourse = courseDetails?.is_paid || parseFloat(courseDetails?.price || 0) > 0

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
              background: 'linear-gradient(135deg, #0B4F9F 0%, #1976D2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen size={28} color="white" />
            </div>
            <div>
              <h2 style={{ marginBottom: '4px' }}>{programme.name}</h2>
              <div style={{ display: 'flex', gap: '12px', fontSize: '14px', color: '#666', flexWrap: 'wrap' }}>
                <span>{programme.code}</span>
                <span>•</span>
                <span>{programme.invitedSpeaker}</span>
                <span>•</span>
                <span>{enrolledLearners.length} learners enrolled</span>
                {isPaidCourse && (
                  <>
                    <span>•</span>
                    <span style={{ color: '#0B4F9F', fontWeight: 600 }}>
                      {courseDetails?.currency} {parseFloat(courseDetails?.price).toLocaleString()}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          <button 
            className={`modal-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <TrendingUp size={16} />
            Overview
          </button>
          <button 
            className={`modal-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <BookOpen size={16} />
            Course Details
          </button>
          <button 
            className={`modal-tab ${activeTab === 'learners' ? 'active' : ''}`}
            onClick={() => setActiveTab('learners')}
          >
            <Users size={16} />
            Enrolled Learners ({enrolledLearners.length})
          </button>
          <button 
            className={`modal-tab ${activeTab === 'lessons' ? 'active' : ''}`}
            onClick={() => setActiveTab('lessons')}
          >
            <BookOpen size={16} />
            Lessons ({lessons.length})
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <div className="spinner" style={{ width: '48px', height: '48px', margin: '0 auto 16px', border: '4px solid #f3f3f3', borderTop: '4px solid #0B4F9F', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <p style={{ color: '#666' }}>Loading course details...</p>
            </div>
          ) : (
            <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div className="details-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Total Enrolled</div>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: '#0B4F9F' }}>{enrolledLearners.length}</div>
                    </div>
                    <Users size={24} color="#0B4F9F" />
                  </div>
                </div>

                <div className="details-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Avg Progress</div>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: '#4caf50' }}>{avgProgress}%</div>
                    </div>
                    <TrendingUp size={24} color="#4caf50" />
                  </div>
                </div>

                <div className="details-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Completion Rate</div>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: '#ff9800' }}>{completionRate}%</div>
                    </div>
                    <Award size={24} color="#ff9800" />
                  </div>
                </div>

                <div className="details-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Total Lessons</div>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: '#2196f3' }}>{lessons.length}</div>
                    </div>
                    <BookOpen size={24} color="#2196f3" />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Department Progress Chart */}
                <div className="details-card">
                  <h3 className="details-card-title">Progress by Department</h3>
                  <div style={{ height: '300px', marginTop: '20px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={departmentProgress}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="avgProgress" fill="#0B4F9F" name="Avg Progress %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Completion Distribution */}
                <div className="details-card">
                  <h3 className="details-card-title">Completion Status</h3>
                  <div style={{ height: '300px', marginTop: '20px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={completionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {completionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Course Info Card */}
              {courseDetails && (
                <div className="details-card" style={{ marginTop: '20px' }}>
                  <h3 className="details-card-title">Course Information</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '16px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Level</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', textTransform: 'capitalize' }}>{courseDetails.level}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Language</div>
                      <div style={{ fontSize: '16px', fontWeight: '600' }}>{courseDetails.language}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Duration</div>
                      <div style={{ fontSize: '16px', fontWeight: '600' }}>
                        {Math.round(courseDetails.total_duration_seconds / 60)} minutes
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Course Details Tab */}
          {activeTab === 'details' && courseDetails && (
            <div>
              <div className="details-card">
                {courseDetails.thumbnail_url && (
                  <img 
                    src={courseDetails.thumbnail_url}
                    alt={courseDetails.title}
                    style={{
                      width: '100%',
                      height: '300px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      marginBottom: '24px'
                    }}
                  />
                )}

                <h3 style={{ marginBottom: '12px' }}>Description</h3>
                <p style={{ color: '#666', lineHeight: '1.8', marginBottom: '24px' }}>
                  {courseDetails.description || 'No description available'}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e0e0e0' }}>
                  <div>
                    <h4 style={{ marginBottom: '12px' }}>Course Details</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#666' }}>Instructor:</span>
                        <span style={{ fontWeight: '600' }}>{courseDetails.instructor_name}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#666' }}>Category:</span>
                        <span style={{ fontWeight: '600' }}>{courseDetails.category}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#666' }}>Level:</span>
                        <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{courseDetails.level}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#666' }}>Language:</span>
                        <span style={{ fontWeight: '600' }}>{courseDetails.language}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ marginBottom: '12px' }}>Stats & Pricing</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#666' }}>Total Lessons:</span>
                        <span style={{ fontWeight: '600' }}>{courseDetails.total_lessons}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#666' }}>Duration:</span>
                        <span style={{ fontWeight: '600' }}>
                          {Math.floor(courseDetails.total_duration_seconds / 3600)}h {Math.floor((courseDetails.total_duration_seconds % 3600) / 60)}m
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#666' }}>Enrollments:</span>
                        <span style={{ fontWeight: '600' }}>{courseDetails.enrollment_count}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#666' }}>Price:</span>
                        <span style={{ fontWeight: '700', color: '#0B4F9F', fontSize: '18px' }}>
                          {isPaidCourse ? `${courseDetails.currency} ${parseFloat(courseDetails.price).toLocaleString()}` : 'FREE'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Learners Tab */}
          {activeTab === 'learners' && (
            <div>
              <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0 }}>Enrolled Learners</h3>
                  <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>
                    {enrolledLearners.length} learners enrolled in this course
                  </p>
                </div>
                <button className="btn btn-outline btn-sm">
                  <Download size={16} />
                  Export All
                </button>
              </div>

              {enrolledLearners.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center' }}>
                  <Users size={48} style={{ color: '#ccc', margin: '0 auto 16px' }} />
                  <h3 style={{ marginBottom: '8px', color: '#666' }}>No Learners Enrolled</h3>
                  <p style={{ color: '#999' }}>Assign this course to employees or generate enrollment codes to get started.</p>
                </div>
              ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Learner</th>
                      <th>Email</th>
                      <th>Progress</th>
                      <th>Enrolled Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolledLearners.slice(0, 10).map((enrollment) => (
                      <tr key={enrollment.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img 
                              src={enrollment.profiles?.avatar_url || `https://i.pravatar.cc/150?u=${enrollment.user_id}`}
                              alt={enrollment.profiles?.full_name}
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                objectFit: 'cover'
                              }}
                            />
                            <span style={{ fontWeight: '500' }}>{enrollment.profiles?.full_name || 'Learner'}</span>
                          </div>
                        </td>
                        <td>{enrollment.profiles?.email}</td>
                        <td>
                          <div className="progress-cell">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{width: `${enrollment.progress || 0}%`}}
                              ></div>
                            </div>
                            <span className="progress-text">{enrollment.progress || 0}%</span>
                          </div>
                        </td>
                        <td>{new Date(enrollment.enrolled_at).toLocaleDateString()}</td>
                        <td>
                          <button className="btn btn-outline btn-sm">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}
            </div>
          )}

          {/* Lessons Tab */}
          {activeTab === 'lessons' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Course Lessons</h3>
                <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>
                  {lessons.length} lessons in this course
                </p>
              </div>

              {lessons.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center' }}>
                  <BookOpen size={48} style={{ color: '#ccc', margin: '0 auto 16px' }} />
                  <h3 style={{ marginBottom: '8px', color: '#666' }}>No Lessons Available</h3>
                  <p style={{ color: '#999' }}>The trainer hasn't added lessons to this course yet.</p>
                </div>
              ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {lessons.map((lesson, index) => {
                  // Calculate how many learners completed this lesson
                  const completedCount = 0 // This would need lesson_progress table
                  const progressPercent = enrolledLearners.length > 0 
                    ? Math.round((completedCount / enrolledLearners.length) * 100)
                    : 0

                  return (
                    <div key={lesson.id} className="details-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ 
                              background: '#e8f4fd', 
                              color: '#0B4F9F', 
                              padding: '2px 8px', 
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              Lesson {index + 1}
                            </span>
                            <h4 style={{ margin: 0 }}>{lesson.title}</h4>
                          </div>
                          <div style={{ fontSize: '13px', color: '#666' }}>
                            {lesson.description || 'No description available'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                            Duration: {lesson.duration_seconds ? `${Math.round(lesson.duration_seconds / 60)} minutes` : 'N/A'}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '20px', fontWeight: '700', color: '#0B4F9F' }}>
                            {progressPercent}%
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            completed
                          </div>
                        </div>
                      </div>

                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{width: `${progressPercent}%`}}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
              )}
            </div>
          )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            {isPaidCourse && courseDetails && (
              <button className="btn btn-primary" onClick={handlePurchaseCourse} style={{ background: '#10B981' }}>
                <ShoppingCart size={16} />
                Purchase Course - {courseDetails.currency} {parseFloat(courseDetails.price).toLocaleString()}
              </button>
            )}
            <button className="btn btn-outline">
              <Users size={16} />
              Assign to Learners
            </button>
            <button className="btn btn-outline">
              <Download size={16} />
              Export Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProgrammeDetailsModal

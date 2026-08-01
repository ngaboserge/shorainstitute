import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { BookOpen, Users, TrendingUp, Download, Award, Clock, ShoppingCart, ArrowLeft } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { supabase } from '../../lib/supabase'
import { useInstitutionalAuth } from '../../hooks/useInstitutionalAuth'
import './ProgrammeDetails.css'

const ProgrammeDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { institution } = useInstitutionalAuth()
  const institutionId = institution?.id
  const [activeTab, setActiveTab] = useState('overview')
  const [courseDetails, setCourseDetails] = useState(null)
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [enrolledLearners, setEnrolledLearners] = useState([])

  useEffect(() => {
    if (id && institutionId) {
      fetchCourseDetails()
    }
  }, [id, institutionId])

  const fetchCourseDetails = async () => {
    try {
      setLoading(true)

      // Fetch full course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single()

      if (courseError) throw courseError

      setCourseDetails(courseData)

      // Fetch lessons for this course
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', id)
        .order('order_number', { ascending: true })

      if (lessonsError) {
        
        setLessons([])
      } else {
        setLessons(lessonsData || [])
      }

      // Fetch enrolled learners (ONLY from this institution)
      const { data: enrollments, error: enrollError } = await supabase
        .from('learner_institutional_enrollments')
        .select('*')
        .eq('course_id', id)
        .eq('institution_id', institutionId)

      

      if (enrollError) {
        
        setEnrolledLearners([])
      } else if (enrollments && enrollments.length > 0) {
        // Use the same function as Learners page to get full learner data
        const { data: allLearnersData, error: learnersError } = await supabase
          .rpc('get_institution_learners_full', { p_institution_id: institutionId })

        

        if (learnersError) {
          console.error('Error fetching learners:', learnersError)
          // Fallback to just enrollment data
          setEnrolledLearners(enrollments.map(e => ({
            ...e,
            learner_name: 'Unknown',
            learner_email: 'No email'
          })))
        } else {
          // Map enrollments to learners with full data
          const enrichedEnrollments = enrollments.map(enrollment => {
            // Find the learner by matching learner_id to the institution_learners.id
            const learner = allLearnersData?.find(l => l.id === enrollment.learner_id)
            
            return {
              ...enrollment,
              learner_name: learner?.user_name || 'Unknown',
              learner_email: learner?.user_email || 'No email'
            }
          })
          
          
          
          
          setEnrolledLearners(enrichedEnrollments)
        }
      } else {
        
        setEnrolledLearners([])
      }

    } catch (error) {
      console.error('Error fetching course details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchaseCourse = () => {
    navigate(`/institutional/billing/purchase`)
  }

  // Calculate real stats from enrolled learners
  const totalEnrolled = enrolledLearners.length
  const avgProgress = totalEnrolled > 0
    ? Math.round(enrolledLearners.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / totalEnrolled)
    : 0
  const completedCount = enrolledLearners.filter(e => e.progress_percentage === 100).length
  const inProgressCount = enrolledLearners.filter(e => e.progress_percentage > 0 && e.progress_percentage < 100).length
  const notStartedCount = enrolledLearners.filter(e => !e.progress_percentage || e.progress_percentage === 0).length
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

  // Mock data for progress by department
  const departmentProgress = [
    { name: 'Credit & Risk', enrolled: Math.floor(totalEnrolled * 0.3), avgProgress: avgProgress + 5 },
    { name: 'Finance', enrolled: Math.floor(totalEnrolled * 0.26), avgProgress: avgProgress - 2 },
    { name: 'Operations', enrolled: Math.floor(totalEnrolled * 0.22), avgProgress: avgProgress + 3 },
    { name: 'HR & Admin', enrolled: Math.floor(totalEnrolled * 0.14), avgProgress: avgProgress - 5 },
    { name: 'IT', enrolled: Math.floor(totalEnrolled * 0.08), avgProgress: avgProgress + 10 }
  ]

  // Check if course is paid
  const isPaidCourse = courseDetails?.is_paid || parseFloat(courseDetails?.price || 0) > 0

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="institutional" />
        <div className="main-content">
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div className="spinner" style={{ width: '48px', height: '48px', margin: '0 auto 16px', border: '4px solid #f3f3f3', borderTop: '4px solid #0B4F9F', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ color: '#666' }}>Loading course details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!courseDetails) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="institutional" />
        <div className="main-content">
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <h3>Course not found</h3>
            <button className="btn btn-primary" onClick={() => navigate('/institutional/programmes')}>
              Back to Programmes
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
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                className="btn btn-icon" 
                onClick={() => navigate('/institutional/programmes')}
                style={{ background: '#f5f5f5', borderRadius: '8px', padding: '8px' }}
              >
                <ArrowLeft size={20} />
              </button>
              <span>{courseDetails.title}</span>
            </div>
          }
          subtitle={
            <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#666', flexWrap: 'wrap', marginTop: '8px' }}>
              <span>{courseDetails.category}</span>
              <span>•</span>
              <span>{courseDetails.instructor_name}</span>
              <span>•</span>
              <span>{enrolledLearners.length} learners enrolled</span>
              {isPaidCourse && (
                <>
                  <span>•</span>
                  <span style={{ color: '#0B4F9F', fontWeight: 600 }}>
                    {courseDetails.currency} {parseFloat(courseDetails.price).toLocaleString()}
                  </span>
                </>
              )}
            </div>
          }
          actions={
            isPaidCourse && (
              <button className="btn btn-primary" onClick={handlePurchaseCourse} style={{ background: '#10B981' }}>
                <ShoppingCart size={18} />
                Purchase Course - {courseDetails.currency} {parseFloat(courseDetails.price).toLocaleString()}
              </button>
            )
          }
        />
        
        <div className="content-wrapper">
          {/* Tabs */}
          <div className="programme-tabs">
            <button 
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <TrendingUp size={16} />
              Overview
            </button>
            <button 
              className={`tab ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              <BookOpen size={16} />
              Course Details
            </button>
            <button 
              className={`tab ${activeTab === 'learners' ? 'active' : ''}`}
              onClick={() => setActiveTab('learners')}
            >
              <Users size={16} />
              Enrolled Learners ({enrolledLearners.length})
            </button>
            <button 
              className={`tab ${activeTab === 'lessons' ? 'active' : ''}`}
              onClick={() => setActiveTab('lessons')}
            >
              <BookOpen size={16} />
              Lessons ({lessons.length})
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon blue">
                    <Users size={24} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">Total Enrolled</div>
                    <div className="stat-value">{enrolledLearners.length}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon green">
                    <TrendingUp size={24} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">Avg Progress</div>
                    <div className="stat-value">{avgProgress}%</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon orange">
                    <Award size={24} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">Completion Rate</div>
                    <div className="stat-value">{completionRate}%</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon yellow">
                    <BookOpen size={24} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">Total Lessons</div>
                    <div className="stat-value">{lessons.length}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
                {/* Department Progress Chart */}
                <div className="card">
                  <h3 className="card-title">Progress by Department</h3>
                  <div style={{ height: '350px', marginTop: '20px' }}>
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
                <div className="card">
                  <h3 className="card-title">Completion Status</h3>
                  <div style={{ height: '350px', marginTop: '20px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={completionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={130}
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
              <div className="card" style={{ marginTop: '24px' }}>
                <h3 className="card-title">Course Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginTop: '20px' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Level</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', textTransform: 'capitalize' }}>{courseDetails.level}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Language</div>
                    <div style={{ fontSize: '18px', fontWeight: '600' }}>{courseDetails.language}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Duration</div>
                    <div style={{ fontSize: '18px', fontWeight: '600' }}>
                      {Math.floor(courseDetails.total_duration_seconds / 3600)}h {Math.floor((courseDetails.total_duration_seconds % 3600) / 60)}m
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Total Enrollments</div>
                    <div style={{ fontSize: '18px', fontWeight: '600' }}>{courseDetails.enrollment_count}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Course Details Tab */}
          {activeTab === 'details' && (
            <div className="card">
              {courseDetails.thumbnail_url && (
                <img 
                  src={courseDetails.thumbnail_url}
                  alt={courseDetails.title}
                  style={{
                    width: '100%',
                    height: '400px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    marginBottom: '32px'
                  }}
                />
              )}

              <h3 style={{ marginBottom: '16px', fontSize: '24px' }}>Description</h3>
              <p style={{ color: '#666', lineHeight: '1.8', fontSize: '16px', marginBottom: '32px' }}>
                {courseDetails.description || 'No description available'}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginTop: '32px', paddingTop: '32px', borderTop: '2px solid #e0e0e0' }}>
                <div>
                  <h4 style={{ marginBottom: '20px', fontSize: '20px' }}>Course Details</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <span style={{ color: '#666', fontSize: '15px' }}>Instructor:</span>
                      <span style={{ fontWeight: '600', fontSize: '15px' }}>{courseDetails.instructor_name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <span style={{ color: '#666', fontSize: '15px' }}>Category:</span>
                      <span style={{ fontWeight: '600', fontSize: '15px' }}>{courseDetails.category}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <span style={{ color: '#666', fontSize: '15px' }}>Level:</span>
                      <span style={{ fontWeight: '600', fontSize: '15px', textTransform: 'capitalize' }}>{courseDetails.level}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                      <span style={{ color: '#666', fontSize: '15px' }}>Language:</span>
                      <span style={{ fontWeight: '600', fontSize: '15px' }}>{courseDetails.language}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{ marginBottom: '20px', fontSize: '20px' }}>Stats & Pricing</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <span style={{ color: '#666', fontSize: '15px' }}>Total Lessons:</span>
                      <span style={{ fontWeight: '600', fontSize: '15px' }}>{courseDetails.total_lessons}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <span style={{ color: '#666', fontSize: '15px' }}>Duration:</span>
                      <span style={{ fontWeight: '600', fontSize: '15px' }}>
                        {Math.floor(courseDetails.total_duration_seconds / 3600)}h {Math.floor((courseDetails.total_duration_seconds % 3600) / 60)}m
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <span style={{ color: '#666', fontSize: '15px' }}>Enrollments:</span>
                      <span style={{ fontWeight: '600', fontSize: '15px' }}>{courseDetails.enrollment_count}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                      <span style={{ color: '#666', fontSize: '15px' }}>Price:</span>
                      <span style={{ fontWeight: '700', color: '#0B4F9F', fontSize: '24px' }}>
                        {isPaidCourse ? `${courseDetails.currency} ${parseFloat(courseDetails.price).toLocaleString()}` : 'FREE'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Learners Tab */}
          {activeTab === 'learners' && (
            <div className="card">
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px' }}>Enrolled Learners</h3>
                  <p style={{ margin: '8px 0 0', color: '#666', fontSize: '14px' }}>
                    {enrolledLearners.length} learners enrolled in this course
                  </p>
                </div>
                <button className="btn btn-outline">
                  <Download size={18} />
                  Export All
                </button>
              </div>

              {enrolledLearners.length === 0 ? (
                <div style={{ padding: '80px', textAlign: 'center' }}>
                  <Users size={64} style={{ color: '#ccc', margin: '0 auto 24px' }} />
                  <h3 style={{ marginBottom: '12px', color: '#666', fontSize: '20px' }}>No Learners Enrolled</h3>
                  <p style={{ color: '#999', fontSize: '16px' }}>Assign this course to employees or generate enrollment codes to get started.</p>
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
                      {enrolledLearners.map((enrollment) => (
                        <tr key={enrollment.id}>
                          <td>
                            <span style={{ fontWeight: '500' }}>{enrollment.learner_name}</span>
                          </td>
                          <td>{enrollment.learner_email}</td>
                          <td>
                            <div className="progress-cell-inline">
                              <div className="progress-bar-small">
                                <div 
                                  className="progress-fill" 
                                  style={{width: `${enrollment.progress_percentage || 0}%`}}
                                ></div>
                              </div>
                              <span className="progress-text-small">{enrollment.progress_percentage || 0}%</span>
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
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '20px' }}>Course Lessons</h3>
                <p style={{ margin: '8px 0 0', color: '#666', fontSize: '14px' }}>
                  {lessons.length} lessons in this course
                </p>
              </div>

              {lessons.length === 0 ? (
                <div className="card" style={{ padding: '80px', textAlign: 'center' }}>
                  <BookOpen size={64} style={{ color: '#ccc', margin: '0 auto 24px' }} />
                  <h3 style={{ marginBottom: '12px', color: '#666', fontSize: '20px' }}>No Lessons Available</h3>
                  <p style={{ color: '#999', fontSize: '16px' }}>The trainer hasn't added lessons to this course yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {lessons.map((lesson, index) => (
                    <div key={lesson.id} className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <span style={{ 
                              background: '#e8f4fd', 
                              color: '#0B4F9F', 
                              padding: '4px 12px', 
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '600'
                            }}>
                              Lesson {index + 1}
                            </span>
                            <h4 style={{ margin: 0, fontSize: '18px' }}>{lesson.title}</h4>
                          </div>
                          <p style={{ fontSize: '14px', color: '#666', margin: '8px 0' }}>
                            {lesson.description || 'No description available'}
                          </p>
                          <div style={{ fontSize: '13px', color: '#999', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={14} />
                            Duration: {lesson.duration_seconds ? `${Math.round(lesson.duration_seconds / 60)} minutes` : 'N/A'}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', minWidth: '80px' }}>
                          <div style={{ fontSize: '24px', fontWeight: '700', color: '#0B4F9F' }}>
                            0%
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            completed
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProgrammeDetails

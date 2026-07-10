import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Calendar, BookOpen, Users, Star, ChevronRight, MessageSquare, Upload, Shield, TrendingUp, CheckCircle, FileText, HelpCircle } from 'lucide-react'
import './Dashboard.css'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [stats, setStats] = useState({
    coursesCount: 0,
    totalLearners: 0,
    averageRating: 0,
    publishedCourses: 0
  })
  const [recentCourses, setRecentCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadDashboardData()
    }
  }, [user?.id])

  const loadDashboardData = async () => {
    try {
      // Load courses with stats
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('instructor_id', user.id)
        .order('created_at', { ascending: false })

      if (coursesError) throw coursesError

      // Calculate stats
      const publishedCourses = courses?.filter(c => c.status === 'published') || []
      const totalLearners = courses?.reduce((sum, c) => sum + (c.enrollment_count || 0), 0) || 0
      const avgRating = courses?.length > 0
        ? (courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length).toFixed(1)
        : 0

      setStats({
        coursesCount: courses?.length || 0,
        totalLearners,
        averageRating: avgRating,
        publishedCourses: publishedCourses.length
      })

      setRecentCourses(courses?.slice(0, 3) || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }
  const nextSeminar = {
    title: 'Capital Markets Outlook & Investment Strategies',
    date: 'Wed, May 14, 2025',
    time: '6:05 PM - 7:30 PM (EAT)',
    platform: 'Live on Zoom',
    registered: 128,
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400'
  }

  const proposalApprovals = [
    { title: 'Behavioral Finance for Better Decisions', subtitle: 'Course Proposal', status: 'Approval', date: 'Submitted Apr 20, 2025' },
    { title: 'ESG Investing: Principles & Practice', subtitle: 'Course Proposal', status: 'Under Review', date: 'Submitted Apr 22, 2025' },
    { title: 'MBA for Entrepreneurs', subtitle: 'Seminar Proposal', status: 'Draft', date: 'Submitted Apr 25, 2025' },
  ]

  const getActivityIcon = (icon) => {
    switch(icon) {
      case 'check': return <CheckCircle size={18} color="#4caf50" />
      case 'file': return <FileText size={18} color="#0B4F9F" />
      case 'message': return <MessageSquare size={18} color="#FDB714" />
      case 'help': return <HelpCircle size={18} color="#ff9800" />
      default: return <CheckCircle size={18} />
    }
  }

  const recentActivity = [
    { icon: 'check', text: 'Your seminar "Capital Markets Outlook & Investment Strategies" was approved', time: 'Today, 10:16 AM' },
    { icon: 'file', text: 'You updated materials for "Tax Planning for Investors & SMEs"', time: 'Yesterday, 4:32 PM' },
    { icon: 'message', text: 'New feedback received for "Financial Modeling for Professionals"', time: 'May 10, 2025' },
    { icon: 'help', text: 'New learner question in "Entrepreneurial Finance: Funding & Valuation"', time: 'May 9, 2025' },
  ]

  const recentQuestions = [
    { question: 'How do REITs generate income for retail investors?', author: 'James K.', date: 'May 12, 2025', course: 'Capital Markets' },
    { question: 'What are the key tax considerations for cross-border investments?', author: 'Anita S.', date: 'May 10, 2025', course: 'Tax & Compliance' },
    { question: 'How can SMEs improve cash flow forecasting accuracy?', author: 'Phyllis M.', date: 'May 10, 2025', course: 'SME Finance' },
  ]

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="trainer" />
        <div className="main-content">
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">
      <Sidebar type="trainer" />
      <div className="main-content">
        <Header 
          title={`Welcome back, ${profile?.full_name || 'Trainer'}.`}
          subtitle="Trainer Portal Dashboard"
          actions={
            <div className="trainer-badge">
              <Shield size={18} style={{color: '#FDB714'}} />
              <span>TRAINER</span>
              <span className="member-since">Member since {new Date(profile?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
          }
        />
        
        <div className="content-wrapper">
          {/* Stats Grid */}
          <div className="stats-grid-4">
            <div className="stat-card-simple">
              <div className="stat-icon-wrapper blue">
                <Calendar size={24} />
              </div>
              <div>
                <div className="stat-label">Total Courses</div>
                <div className="stat-value-large">{stats.coursesCount}</div>
                <a href="/trainer/courses" className="stat-link">Manage courses →</a>
              </div>
            </div>

            <div className="stat-card-simple">
              <div className="stat-icon-wrapper yellow">
                <BookOpen size={24} />
              </div>
              <div>
                <div className="stat-label">Published Courses</div>
                <div className="stat-value-large">{stats.publishedCourses}</div>
                <a href="/trainer/courses" className="stat-link">View published →</a>
              </div>
            </div>

            <div className="stat-card-simple">
              <div className="stat-icon-wrapper green">
                <Users size={24} />
              </div>
              <div>
                <div className="stat-label">Total Learners</div>
                <div className="stat-value-large">{stats.totalLearners.toLocaleString()}</div>
                <div className="stat-trend">{stats.totalLearners === 0 ? 'Create your first course' : 'Across all courses'}</div>
              </div>
            </div>

            <div className="stat-card-simple">
              <div className="stat-icon-wrapper orange">
                <Star size={24} />
              </div>
              <div>
                <div className="stat-label">Average Rating</div>
                <div className="stat-value-large">{stats.averageRating}/5</div>
                <a href="/trainer/analytics" className="stat-link">View feedback →</a>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="trainer-dashboard-grid">
            {/* Left Column */}
            <div className="trainer-main-column">
              {/* Your Courses */}
              <div className="card">
                <div className="card-header-flex">
                  <h3 className="card-title">Your Recent Courses</h3>
                  <a href="/trainer/courses" className="link-text">View all →</a>
                </div>
                
                {recentCourses.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <BookOpen size={48} color="#ccc" style={{ margin: '0 auto 16px' }} />
                    <h4 style={{ color: '#666', marginBottom: '8px' }}>No courses yet</h4>
                    <p style={{ color: '#999', marginBottom: '24px' }}>Create your first course to start teaching</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => navigate('/trainer/create-course')}
                    >
                      Create Your First Course
                    </button>
                  </div>
                ) : (
                  <div className="courses-list-simple">
                    {recentCourses.map((course) => (
                      <div key={course.id} className="course-item-simple">
                        <div className="course-thumbnail-small">
                          {course.thumbnail_url ? (
                            <img src={course.thumbnail_url} alt={course.title} />
                          ) : (
                            <div style={{ 
                              width: '100%', 
                              height: '100%', 
                              background: '#f0f0f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <BookOpen size={24} color="#999" />
                            </div>
                          )}
                        </div>
                        <div className="course-info-simple">
                          <h4>{course.title}</h4>
                          <div className="course-meta-simple">
                            <span className={`badge ${course.status === 'published' ? 'success' : course.status === 'draft' ? 'neutral' : 'warning'}`}>
                              {course.status}
                            </span>
                            <span>{course.total_lessons || 0} lessons</span>
                            <span>{course.enrollment_count || 0} students</span>
                          </div>
                        </div>
                        <button 
                          className="btn btn-sm btn-outline"
                          onClick={() => navigate(`/trainer/courses/${course.id}/manage-lessons`)}
                        >
                          Manage
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="trainer-sidebar-column">
              {/* Quick Actions */}
              <div className="card">
                <h3 className="card-title">Quick Actions</h3>
                <div className="quick-actions-grid">
                  <button 
                    className="quick-action-card"
                    onClick={() => navigate('/trainer/create-course')}
                  >
                    <div className="action-icon blue">
                      <BookOpen size={20} />
                    </div>
                    <div className="action-text">Create New Course</div>
                  </button>
                  <button 
                    className="quick-action-card"
                    onClick={() => navigate('/trainer/courses')}
                  >
                    <div className="action-icon yellow">
                      <FileText size={20} />
                    </div>
                    <div className="action-text">Manage Courses</div>
                  </button>
                  <button 
                    className="quick-action-card"
                    onClick={() => navigate('/trainer/analytics')}
                  >
                    <div className="action-icon green">
                      <TrendingUp size={20} />
                    </div>
                    <div className="action-text">View Analytics</div>
                  </button>
                  <button 
                    className="quick-action-card"
                    onClick={() => navigate('/trainer/profile')}
                  >
                    <div className="action-icon orange">
                      <Users size={20} />
                    </div>
                    <div className="action-text">Edit Profile</div>
                  </button>
                </div>
              </div>

              {/* Getting Started Guide */}
              <div className="card">
                <h3 className="card-title">Getting Started</h3>
                <div className="activity-list-compact">
                  <div className="activity-item-compact">
                    <div className="activity-icon-small">
                      <CheckCircle size={18} color={stats.coursesCount > 0 ? '#4caf50' : '#ccc'} />
                    </div>
                    <div className="activity-details-compact">
                      <div className="activity-text-small">Create your first course</div>
                      <div className="activity-time-small">
                        {stats.coursesCount > 0 ? 'Completed ✓' : 'Click "Create New Course" above'}
                      </div>
                    </div>
                  </div>
                  <div className="activity-item-compact">
                    <div className="activity-icon-small">
                      <CheckCircle size={18} color={stats.publishedCourses > 0 ? '#4caf50' : '#ccc'} />
                    </div>
                    <div className="activity-details-compact">
                      <div className="activity-text-small">Add lessons and videos</div>
                      <div className="activity-time-small">
                        {stats.publishedCourses > 0 ? 'Completed ✓' : 'Add content to your course'}
                      </div>
                    </div>
                  </div>
                  <div className="activity-item-compact">
                    <div className="activity-icon-small">
                      <CheckCircle size={18} color={stats.publishedCourses > 0 ? '#4caf50' : '#ccc'} />
                    </div>
                    <div className="activity-details-compact">
                      <div className="activity-text-small">Publish your course</div>
                      <div className="activity-time-small">
                        {stats.publishedCourses > 0 ? 'Completed ✓' : 'Make it available to students'}
                      </div>
                    </div>
                  </div>
                  <div className="activity-item-compact">
                    <div className="activity-icon-small">
                      <CheckCircle size={18} color={stats.totalLearners > 0 ? '#4caf50' : '#ccc'} />
                    </div>
                    <div className="activity-details-compact">
                      <div className="activity-text-small">Get your first student</div>
                      <div className="activity-time-small">
                        {stats.totalLearners > 0 ? `${stats.totalLearners} students enrolled ✓` : 'Share your course'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trainer Resources */}
              <div className="card reminder-card">
                <div className="reminder-icon">
                  <Shield size={24} />
                </div>
                <h4 className="reminder-title">Trainer Resources</h4>
                <p className="reminder-text">Need help creating your course? Check out our trainer guide and video tutorials.</p>
                <a href="/trainer/resources" className="link-text">View Resources →</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

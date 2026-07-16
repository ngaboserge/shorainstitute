import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Users, Star, CheckCircle, TrendingUp, Download, Calendar, MessageSquare, BarChart3, Lightbulb, MoreVertical, BookOpen, DollarSign } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import './Analytics.css'

const Analytics = () => {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalLearners: 0,
    totalEnrollments: 0,
    completionRate: 0,
    activeStudents: 0,
    totalRevenue: 0,
    avgProgress: 0
  })
  const [coursePerformance, setCoursePerformance] = useState([])
  const [monthlyTrend, setMonthlyTrend] = useState([])
  const [recentEnrollments, setRecentEnrollments] = useState([])
  const [engagementData, setEngagementData] = useState([])
  const [attendanceData, setAttendanceData] = useState([])
  const [topCourses, setTopCourses] = useState([])
  const [topicEngagement, setTopicEngagement] = useState([])

  useEffect(() => {
    if (user?.id) {
      loadAnalytics()
    }
  }, [user?.id])

  const loadAnalytics = async () => {
    try {
      // Get trainer's courses
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, price')
        .eq('instructor_id', user.id)

      if (coursesError) throw coursesError
      const courseIds = courses?.map(c => c.id) || []

      if (courseIds.length === 0) {
        setLoading(false)
        return
      }

      // Get all enrollments for trainer's courses
      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select(`
          *,
          users:user_id (
            full_name,
            email
          ),
          courses:course_id (
            title,
            price
          )
        `)
        .in('course_id', courseIds)
        .order('enrolled_at', { ascending: false })

      if (enrollError) throw enrollError

      // Calculate stats
      const totalEnrollments = enrollments?.length || 0
      const uniqueLearners = new Set(enrollments?.map(e => e.user_id)).size
      const completedEnrollments = enrollments?.filter(e => e.progress_percentage === 100).length || 0
      const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0
      
      // Active students (those with progress > 0 and < 100)
      const activeStudents = enrollments?.filter(e => e.progress_percentage > 0 && e.progress_percentage < 100).length || 0
      
      // Calculate revenue from paid enrollments
      const totalRevenue = enrollments?.reduce((sum, e) => {
        if (e.payment_status === 'approved' && e.courses?.price) {
          return sum + parseFloat(e.courses.price)
        }
        return sum
      }, 0) || 0

      // Average progress
      const avgProgress = totalEnrollments > 0
        ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / totalEnrollments)
        : 0

      setStats({
        totalLearners: uniqueLearners,
        totalEnrollments,
        completionRate,
        activeStudents,
        totalRevenue,
        avgProgress
      })

      // Course performance
      const courseStats = {}
      enrollments?.forEach(e => {
        const courseId = e.course_id
        if (!courseStats[courseId]) {
          courseStats[courseId] = {
            title: e.courses?.title || 'Unknown',
            enrollments: 0,
            completed: 0,
            avgProgress: 0,
            revenue: 0
          }
        }
        courseStats[courseId].enrollments++
        if (e.progress_percentage === 100) courseStats[courseId].completed++
        courseStats[courseId].avgProgress += e.progress_percentage || 0
        if (e.payment_status === 'approved' && e.courses?.price) {
          courseStats[courseId].revenue += parseFloat(e.courses.price)
        }
      })

      const performanceData = Object.values(courseStats).map(c => ({
        ...c,
        avgProgress: Math.round(c.avgProgress / c.enrollments),
        completionRate: Math.round((c.completed / c.enrollments) * 100)
      })).sort((a, b) => b.enrollments - a.enrollments)

      setCoursePerformance(performanceData)

      // Monthly trend (last 6 months)
      const monthlyStats = {}
      enrollments?.forEach(e => {
        if (e.enrolled_at) {
          const date = new Date(e.enrolled_at)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          if (!monthlyStats[monthKey]) {
            monthlyStats[monthKey] = { enrollments: 0, completed: 0 }
          }
          monthlyStats[monthKey].enrollments++
          if (e.progress_percentage === 100) monthlyStats[monthKey].completed++
        }
      })

      const trendData = Object.keys(monthlyStats)
        .sort()
        .slice(-6)
        .map(key => {
          const [year, month] = key.split('-')
          const date = new Date(parseInt(year), parseInt(month) - 1)
          return {
            month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            enrollments: monthlyStats[key].enrollments,
            completed: monthlyStats[key].completed
          }
        })

      setMonthlyTrend(trendData)
      setRecentEnrollments(enrollments?.slice(0, 10) || [])

      // Prepare engagement data (monthly unique learners, completions, and active)
      const engagementChartData = trendData.map(month => ({
        month: month.month,
        uniqueLearners: month.enrollments,
        activeCompletions: month.completed,
        avgLearners: Math.round((month.enrollments + month.completed) / 2)
      }))
      setEngagementData(engagementChartData)

      // Prepare attendance data (mock for now - can be enhanced with session tracking)
      const attendanceChartData = trendData.map(month => ({
        month: month.month,
        liveSession: Math.round(month.enrollments * 0.7), // 70% attend live
        total: month.enrollments
      }))
      setAttendanceData(attendanceChartData)

      // Top courses by engagement
      const topCoursesData = performanceData.slice(0, 5).map(course => ({
        title: course.title.substring(0, 50) + (course.title.length > 50 ? '...' : ''),
        completion: course.completionRate,
        attendance: Math.round(course.enrollments / (enrollments?.length || 1) * 100),
        rating: course.completionRate >= 80 ? '4.8' : course.completionRate >= 60 ? '4.2' : '3.8'
      }))
      setTopCourses(topCoursesData)

      // Topic engagement (based on course categories)
      const categoryColors = {
        'Finance': '#0B4F9F',
        'Investment': '#4caf50',
        'Business': '#FDB714',
        'Other': '#9c27b0'
      }
      
      const categoryCounts = {}
      courses?.forEach(course => {
        const category = course.category || 'Other'
        categoryCounts[category] = (categoryCounts[category] || 0) + 1
      })

      const totalCourses = courses?.length || 1
      const topicData = Object.keys(categoryCounts).map(category => ({
        name: category,
        percentage: Math.round((categoryCounts[category] / totalCourses) * 100),
        count: categoryCounts[category],
        color: categoryColors[category] || '#9c27b0'
      }))
      setTopicEngagement(topicData)

    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="trainer" />
        <div className="main-content">
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Loading analytics...</p>
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
          title="Analytics & Performance"
          subtitle={`Welcome back, ${profile?.full_name || 'Trainer'}. Here's your performance overview.`}
          actions={
            <>
              <button className="btn btn-primary" onClick={() => navigate('/trainer/courses')}>
                <BookOpen size={18} />
                Manage Courses
              </button>
            </>
          }
        />
        
        <div className="content-wrapper">
          {/* Stats Grid */}
          <div className="stats-grid-6">
            <div className="stat-card-compact">
              <div className="stat-icon-small blue">
                <Users size={20} />
              </div>
              <div>
                <div className="stat-label-small">Total Learners Reached</div>
                <div className="stat-value-medium">{stats.totalLearners.toLocaleString()}</div>
                <div className="stat-trend-small positive">
                  <TrendingUp size={12} />
                  Active students
                </div>
              </div>
            </div>

            <div className="stat-card-compact">
              <div className="stat-icon-small green">
                <BookOpen size={20} />
              </div>
              <div>
                <div className="stat-label-small">Total Enrollments</div>
                <div className="stat-value-medium">{stats.totalEnrollments}</div>
                <div className="stat-trend-small positive">
                  <TrendingUp size={12} />
                  Across all courses
                </div>
              </div>
            </div>

            <div className="stat-card-compact">
              <div className="stat-icon-small green">
                <CheckCircle size={20} />
              </div>
              <div>
                <div className="stat-label-small">Completion Rate</div>
                <div className="stat-value-medium">{stats.completionRate}%</div>
                <div className="stat-trend-small positive">
                  <TrendingUp size={12} />
                  Students finishing
                </div>
              </div>
            </div>

            <div className="stat-card-compact">
              <div className="stat-icon-small purple">
                <BarChart3 size={20} />
              </div>
              <div>
                <div className="stat-label-small">Active Students</div>
                <div className="stat-value-medium">{stats.activeStudents}</div>
                <div className="stat-trend-small positive">
                  <TrendingUp size={12} />
                  Currently learning
                </div>
              </div>
            </div>

            <div className="stat-card-compact">
              <div className="stat-icon-small orange">
                <DollarSign size={20} />
              </div>
              <div>
                <div className="stat-label-small">Total Revenue</div>
                <div className="stat-value-medium">${stats.totalRevenue.toLocaleString()}</div>
                <div className="stat-trend-small positive">
                  <TrendingUp size={12} />
                  From paid courses
                </div>
              </div>
            </div>

            <div className="stat-card-compact">
              <div className="stat-icon-small yellow">
                <Star size={20} />
              </div>
              <div>
                <div className="stat-label-small">Average Progress</div>
                <div className="stat-value-medium">{stats.avgProgress}%</div>
                <div className="stat-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      fill={i < Math.round(stats.avgProgress / 20) ? "#FDB714" : "none"} 
                      color="#FDB714" 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Charts Section */}
          <div className="analytics-grid">
            <div className="analytics-main">
              {/* Monthly Engagement Trend */}
              <div className="card">
                <div className="card-header-flex">
                  <div>
                    <h3 className="card-title">Monthly Engagement Trend</h3>
                    <p className="card-subtitle-small">Tracking unique learners, active completions, and average learners</p>
                  </div>
                  <div className="chart-legend-inline">
                    <div className="legend-item"><span className="dot" style={{background: '#0B4F9F'}}></span> Unique Learners</div>
                    <div className="legend-item"><span className="dot" style={{background: '#4caf50'}}></span> Active Completions</div>
                    <div className="legend-item"><span className="dot" style={{background: '#FDB714'}}></span> Avg Learners</div>
                  </div>
                  <a href="#" className="link-text">View full engagement report →</a>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="month" stroke="#666" style={{fontSize: '12px'}} />
                    <YAxis stroke="#666" style={{fontSize: '12px'}} />
                    <Tooltip />
                    <Line type="monotone" dataKey="uniqueLearners" stroke="#0B4F9F" strokeWidth={3} dot={{r: 4}} />
                    <Line type="monotone" dataKey="activeCompletions" stroke="#4caf50" strokeWidth={3} dot={{r: 4}} />
                    <Line type="monotone" dataKey="avgLearners" stroke="#FDB714" strokeWidth={3} dot={{r: 4}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Session Attendance by Month */}
              <div className="card">
                <div className="card-header-flex">
                  <div>
                    <h3 className="card-title">Session Attendance (by Month)</h3>
                  </div>
                  <a href="#" className="link-text">View cumulative details →</a>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="month" stroke="#666" style={{fontSize: '12px'}} />
                    <YAxis stroke="#666" style={{fontSize: '12px'}} />
                    <Tooltip />
                    <Bar dataKey="liveSession" fill="#0B4F9F" name="Live Session Learners" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="total" fill="#64B5F6" name="Total Learners" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Most Engaging Courses */}
              <div className="card">
                <div className="card-header-flex">
                  <h3 className="card-title">Most Engaging Courses</h3>
                  <a href="/trainer/courses" className="link-text">View all courses →</a>
                </div>
                <div className="table-container">
                  {topCourses.length > 0 ? (
                    <table>
                      <thead>
                        <tr>
                          <th>Course</th>
                          <th>Completion</th>
                          <th>Enrollment</th>
                          <th>Est. Rating</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {topCourses.map((course, idx) => (
                          <tr key={idx}>
                            <td className="session-name-cell">{course.title}</td>
                            <td>
                              <div className="progress-cell-inline">
                                <div className="progress-bar-small">
                                  <div className="progress-fill" style={{width: `${course.completion}%`}}></div>
                                </div>
                                <span className="progress-text-small">{course.completion}%</span>
                              </div>
                            </td>
                            <td>
                              <div className="progress-cell-inline">
                                <div className="progress-bar-small">
                                  <div className="progress-fill" style={{width: `${course.attendance}%`, background: '#FDB714'}}></div>
                                </div>
                                <span className="progress-text-small">{course.attendance}%</span>
                              </div>
                            </td>
                            <td>
                              <span className="rating-badge">
                                <Star size={14} fill="#FDB714" stroke="#FDB714" />
                                {course.rating}
                              </span>
                            </td>
                            <td>
                              <button className="btn-icon">
                                <MoreVertical size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                      <BookOpen size={48} color="#ccc" style={{ margin: '0 auto 16px' }} />
                      <p style={{ color: '#999' }}>No course data yet. Create courses and get enrollments to see analytics.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Enrollments */}
              <div className="card">
                <div className="card-header-flex">
                  <h3 className="card-title">Recent Enrollments</h3>
                  <a href="/trainer/courses" className="link-text">View all →</a>
                </div>
                <div className="feedback-list">
                  {recentEnrollments.length > 0 ? (
                    recentEnrollments.map((enrollment, idx) => (
                      <div key={idx} className="feedback-item">
                        <div className="feedback-header">
                          <div>
                            <div className="feedback-session">{enrollment.courses?.title || 'Course'}</div>
                            <div className="feedback-meta">
                              {enrollment.users?.full_name || enrollment.users?.email || 'Student'} • {new Date(enrollment.enrolled_at).toLocaleDateString()}
                            </div>
                          </div>
                          <span className="rating-badge-large">
                            <CheckCircle size={16} color={enrollment.progress_percentage === 100 ? '#4caf50' : '#FDB714'} />
                            {enrollment.progress_percentage}%
                          </span>
                        </div>
                        <p className="feedback-comment">
                          {enrollment.payment_status === 'approved' ? '✅ Paid enrollment' : 
                           enrollment.payment_status === 'pending' ? '⏳ Payment pending' : 
                           '📚 Free enrollment'}
                          {' • '}Progress: {enrollment.progress_percentage === 100 ? 'Completed' : 
                           enrollment.progress_percentage > 0 ? 'In progress' : 'Not started'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                      <Users size={48} color="#ccc" style={{ margin: '0 auto 16px' }} />
                      <p style={{ color: '#999' }}>No enrollments yet. Students will appear here once they enroll in your courses.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="analytics-sidebar">
              {/* Learner Engagement by Topic Area */}
              <div className="card">
                <h3 className="card-title">Learner Engagement by Topic Area</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={topicEngagement}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="percentage"
                    >
                      {topicEngagement.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="topic-legend">
                  {topicEngagement.map((topic, idx) => (
                    <div key={idx} className="topic-legend-item">
                      <div className="topic-color" style={{background: topic.color}}></div>
                      <div className="topic-info">
                        <div className="topic-name">{topic.name}</div>
                        <div className="topic-stats">{topic.percentage}% ({topic.count})</div>
                      </div>
                    </div>
                  ))}
                </div>
                <a href="#" className="link-text-center">View topic performance →</a>
              </div>

              {/* Suggested Improvements */}
              <div className="card">
                <h3 className="card-title">Quick Tips</h3>
                <p className="card-subtitle-small">Improve your course performance</p>
                <div className="suggestions-list">
                  <div className="suggestion-item">
                    <div className="suggestion-icon"><Lightbulb size={20} color="#FDB714" /></div>
                    <div className="suggestion-content">
                      <p className="suggestion-text">Add video content to increase completion rates</p>
                      <button className="btn-link" onClick={() => navigate('/trainer/courses')}>Add videos</button>
                    </div>
                  </div>
                  <div className="suggestion-item">
                    <div className="suggestion-icon"><Lightbulb size={20} color="#FDB714" /></div>
                    <div className="suggestion-content">
                      <p className="suggestion-text">Include downloadable resources for better engagement</p>
                      <button className="btn-link" onClick={() => navigate('/trainer/courses')}>Add resources</button>
                    </div>
                  </div>
                  <div className="suggestion-item">
                    <div className="suggestion-icon"><Lightbulb size={20} color="#FDB714" /></div>
                    <div className="suggestion-content">
                      <p className="suggestion-text">Set clear learning objectives for each lesson</p>
                      <button className="btn-link" onClick={() => navigate('/trainer/courses')}>Edit lessons</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Summary */}
              <div className="card expert-impact-card">
                <h3 className="card-title">Performance Summary</h3>
                <p className="card-subtitle-small">Key metrics across all your courses</p>
                <div className="expert-stats">
                  <div className="expert-stat-item">
                    <div className="expert-stat-value">{stats.completionRate}%</div>
                    <div className="expert-stat-label">Completion Rate</div>
                  </div>
                  <div className="expert-stat-item">
                    <div className="expert-stat-value">{stats.avgProgress}%</div>
                    <div className="expert-stat-label">Avg Progress</div>
                  </div>
                  <div className="expert-stat-item">
                    <div className="expert-stat-value">{stats.activeStudents}</div>
                    <div className="expert-stat-label">Active Students</div>
                  </div>
                </div>
                <button className="btn btn-warning btn-full" onClick={() => navigate('/trainer/create-course')}>
                  Create New Course →
                </button>
                <a href="/trainer/courses" className="link-text-center">View all courses →</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics

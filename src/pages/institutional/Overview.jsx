import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Users, GraduationCap, BookOpen, Calendar, TrendingUp, Download } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '../../lib/supabase'
import { useShoraInstitute } from '../../hooks/useInstitutionalAuth'
import './Overview.css'

const Overview = () => {
  const { institutionId } = useShoraInstitute()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalLearners: 0,
    avgProgress: 0,
    activeProgrammes: 0,
    upcomingSessions: 0
  })
  const [userName, setUserName] = useState('Admin')

  useEffect(() => {
    fetchOverviewData()
    fetchUserName()
  }, [])

  const fetchUserName = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()
        
        if (profileData?.full_name) {
          setUserName(profileData.full_name.split(' ')[0])
        }
      }
    } catch (error) {
      console.error('Error fetching user name:', error)
    }
  }

  const fetchOverviewData = async () => {
    try {
      setLoading(true)

      // Fetch institution learners (only for this institution if institutionId exists)
      const { data: learnersData, error: learnersError } = await supabase
        .from('institution_learners')
        .select('id, user_id, department, status')
        .eq('institution_id', institutionId || '00000000-0000-0000-0000-000000000001')
        .eq('status', 'active')

      if (learnersError && learnersError.code !== 'PGRST116') {
        console.error('Error fetching learners:', learnersError)
      }

      const learnersCount = learnersData?.length || 0

      // Fetch active courses (created by trainers)
      const { count: coursesCount, error: coursesError } = await supabase
        .from('courses')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published')

      if (coursesError) throw coursesError

      // Fetch upcoming seminars
      const now = new Date().toISOString()
      const { data: seminarsData, error: seminarsError} = await supabase
        .from('seminars')
        .select('*')
        .eq('status', 'published')
        .gte('date', now)
        .order('date', { ascending: true })
        .limit(3)

      if (seminarsError && seminarsError.code !== 'PGRST116') {
        console.error('Error fetching seminars:', seminarsError)
      }

      // Transform seminars for display
      const transformedSeminars = (seminarsData || []).map(seminar => {
        const seminarDate = new Date(seminar.date)
        const monthShort = seminarDate.toLocaleString('en-US', { month: 'short' }).toUpperCase()
        const day = seminarDate.getDate()
        
        return {
          date: `${monthShort}\n${day}`,
          title: seminar.title,
          speaker: seminar.speaker_name || 'TBA',
          time: `${seminarDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • ${seminar.start_time || 'TBA'}`,
          registered: seminar.registration_count || 0,
          action: 'View'
        }
      })
      setUpcomingSessions(transformedSeminars)

      // Fetch institutional enrollments for progress calculation
      const { data: enrollmentsData, error: enrollError } = await supabase
        .from('learner_institutional_enrollments')
        .select('course_id, progress_percentage, status, learner_id')
        .eq('institution_id', institutionId || '00000000-0000-0000-0000-000000000001')

      if (enrollError && enrollError.code !== 'PGRST116') {
        console.log('Note: institutional enrollments table query failed')
      }

      const enrollments = enrollmentsData || []
      const avgProgress = enrollments.length > 0
        ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / enrollments.length)
        : 0

      setStats({
        totalLearners: learnersCount,
        avgProgress: avgProgress,
        activeProgrammes: coursesCount || 0,
        upcomingSessions: seminarsData?.length || 0
      })

      // Calculate progress by department
      if (learnersData && learnersData.length > 0) {
        const deptMap = {}
        
        learnersData.forEach(learner => {
          const dept = learner.department || 'Unassigned'
          if (!deptMap[dept]) {
            deptMap[dept] = { learners: [], totalProgress: 0 }
          }
          deptMap[dept].learners.push(learner.user_id)
        })

        // Get progress for each department's learners
        const deptProgress = await Promise.all(
          Object.entries(deptMap).map(async ([deptName, deptData]) => {
            const { data: deptEnrollments } = await supabase
              .from('learner_institutional_enrollments')
              .select('progress_percentage')
              .in('learner_id', deptData.learners)
            
            const progresses = deptEnrollments || []
            const completed = progresses.filter(e => e.progress_percentage >= 100).length
            const inProgress = progresses.filter(e => e.progress_percentage > 0 && e.progress_percentage < 100).length
            const notStarted = deptData.learners.length - completed - inProgress

            return {
              name: deptName,
              completed: Math.round((completed / deptData.learners.length) * 100) || 0,
              inProgress: Math.round((inProgress / deptData.learners.length) * 100) || 0,
              notStarted: Math.round((notStarted / deptData.learners.length) * 100) || 0
            }
          })
        )

        setProgressData(deptProgress.slice(0, 5))
      }

      // Calculate engagement data (top courses by enrollment)
      if (enrollments.length > 0) {
        const courseEnrollments = {}
        enrollments.forEach(e => {
          courseEnrollments[e.course_id] = (courseEnrollments[e.course_id] || 0) + 1
        })

        // Get top 4 courses
        const topCourseIds = Object.entries(courseEnrollments)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 4)
          .map(([courseId]) => courseId)

        if (topCourseIds.length > 0) {
          const { data: topCoursesData } = await supabase
            .from('courses')
            .select('id, title')
            .in('id', topCourseIds)

          const colors = ['#0B4F9F', '#1976D2', '#42A5F5', '#64B5F6']
          const engagement = topCoursesData?.map((course, idx) => {
            const count = courseEnrollments[course.id]
            const percentage = Math.round((count / enrollments.length) * 100)
            return {
              name: course.title,
              value: count,
              percentage: percentage,
              color: colors[idx] || '#90CAF9'
            }
          }) || []

          setEngagementData(engagement)

          // Set top programmes with completion rates
          const topProgs = await Promise.all(
            topCoursesData?.slice(0, 5).map(async (course, idx) => {
              const courseEnrollmentsData = enrollments.filter(e => e.course_id === course.id)
              const completed = courseEnrollmentsData.filter(e => e.progress_percentage >= 100).length
              const completion = courseEnrollmentsData.length > 0 
                ? Math.round((completed / courseEnrollmentsData.length) * 100)
                : 0

              return {
                name: course.title,
                learners: `${courseEnrollmentsData.length} learners`,
                completion
              }
            }) || []
          )

          setTopProgrammes(topProgs)
        }
      }

      // Fetch recent activity
      const { data: recentEnrollments } = await supabase
        .from('learner_institutional_enrollments')
        .select(`
          *,
          courses:course_id(title),
          institution_learners:learner_id(user_id)
        `)
        .eq('institution_id', institutionId || '00000000-0000-0000-0000-000000000001')
        .order('enrolled_at', { ascending: false })
        .limit(4)

      const activities = (recentEnrollments || []).map(enrollment => {
        const timeAgo = Math.floor((Date.now() - new Date(enrollment.enrolled_at).getTime()) / (1000 * 60))
        let timeText = `${timeAgo} minutes ago`
        if (timeAgo > 60) {
          const hoursAgo = Math.floor(timeAgo / 60)
          timeText = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`
        }

        return {
          icon: enrollment.progress_percentage >= 100 ? '🎓' : enrollment.progress_percentage > 0 ? '📚' : '👤',
          text: enrollment.progress_percentage >= 100 ? 'Course completed' : enrollment.progress_percentage > 0 ? 'Programme enrolled' : 'New learner registered',
          course: enrollment.courses?.title || 'Unknown Course',
          time: timeText
        }
      })

      setRecentActivity(activities)

    } catch (error) {
      console.error('Error fetching overview data:', error)
      setStats({
        totalLearners: 0,
        avgProgress: 0,
        activeProgrammes: 0,
        upcomingSessions: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const [progressData, setProgressData] = useState([])
  const [engagementData, setEngagementData] = useState([])
  const [upcomingSessions, setUpcomingSessions] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [topProgrammes, setTopProgrammes] = useState([])

  return (
    <div className="dashboard-layout">
      <Sidebar type="institutional" />
      <div className="main-content">
        <Header 
          title={`Welcome back, ${userName}!`}
          subtitle="Here's what's happening in your institution."
          actions={
            <>
              <select className="date-range-select">
                <option>May 1 - May 31, 2026</option>
                <option>June 1 - June 30, 2026</option>
              </select>
              <button className="btn btn-primary">
                <Download size={18} />
                Download Report
              </button>
            </>
          }
        />
        
        <div className="content-wrapper">
          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">
                <Users size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Total Learners</div>
                <div className="stat-value">{loading ? '...' : stats.totalLearners.toLocaleString()}</div>
                <div className="stat-change positive">
                  <TrendingUp size={14} />
                  <span>12% vs last month</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon yellow">
                <GraduationCap size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Average Progress</div>
                <div className="stat-value">{loading ? '...' : `${stats.avgProgress}%`}</div>
                <div className="stat-change positive">
                  <TrendingUp size={14} />
                  <span>5% vs last month</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">
                <BookOpen size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Active Programmes</div>
                <div className="stat-value">{loading ? '...' : stats.activeProgrammes}</div>
                <div className="stat-change neutral">
                  <span>No change</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">
                <Calendar size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Upcoming Live Sessions</div>
                <div className="stat-value">{loading ? '...' : stats.upcomingSessions}</div>
                <div className="stat-change positive">
                  <TrendingUp size={14} />
                  <span>2 vs last month</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          {stats.totalLearners === 0 ? (
            <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <h3 style={{ marginBottom: '8px', color: '#1a1a1a' }}>No Data Available Yet</h3>
              <p style={{ color: '#666', marginBottom: '24px' }}>
                Start adding learners and assigning programmes to see detailed analytics and insights.
              </p>
              <button className="btn btn-primary" onClick={() => window.location.href = '/institutional/learners'}>
                Add Learners
              </button>
            </div>
          ) : (
            <>
          <div className="charts-grid">
            <div className="card chart-card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Learner Progress Overview</h3>
                  <p className="card-subtitle">By Department</p>
                </div>
                <a href="#" className="link-text">View full report →</a>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completed" stackId="a" fill="#4caf50" name="Completed" />
                    <Bar dataKey="inProgress" stackId="a" fill="#fdb714" name="In Progress" />
                    <Bar dataKey="notStarted" stackId="a" fill="#e0e0e0" name="Not Started" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-dot" style={{background: '#4caf50'}}></span>
                  <span>Completed</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{background: '#fdb714'}}></span>
                  <span>In Progress</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{background: '#e0e0e0'}}></span>
                  <span>Not Started</span>
                </div>
              </div>
            </div>

            <div className="card chart-card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Programme Engagement</h3>
                </div>
                <a href="#" className="link-text">View all →</a>
              </div>
              <div className="engagement-list">
                {engagementData.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                    No engagement data available yet
                  </div>
                ) : (
                  engagementData.map((item, index) => (
                    <div key={index} className="engagement-item">
                      <div className="engagement-bar">
                        <div className="engagement-fill" style={{width: `${item.percentage}%`, background: item.color}}></div>
                      </div>
                      <div className="engagement-info">
                        <span className="engagement-name">{item.name}</span>
                        <span className="engagement-value">{item.value} learners ({item.percentage}%)</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Top Programmes */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Top Programmes</h3>
              <a href="#" className="link-text">View all →</a>
            </div>
            <div className="top-programmes-grid">
              {topProgrammes.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                  No programme data available yet
                </div>
              ) : (
                topProgrammes.map((prog, index) => (
                  <div key={index} className="programme-item">
                    <div className="programme-number">{index + 1}</div>
                    <div className="programme-details">
                      <div className="programme-name">{prog.name}</div>
                      <div className="programme-learners">{prog.learners}</div>
                    </div>
                    <div className="programme-completion">{prog.completion}%</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="bottom-grid">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Upcoming Live Sessions for Your Institution</h3>
                <a href="#" className="link-text">View calendar →</a>
              </div>
              <div className="sessions-list">
                {upcomingSessions.map((session, index) => (
                  <div key={index} className="session-item">
                    <div className="session-date">
                      {session.date.split('\n').map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </div>
                    <div className="session-details">
                      <h4 className="session-title">{session.title}</h4>
                      <p className="session-speaker">Speaker: {session.speaker}</p>
                      <p className="session-time">📅 {session.time}</p>
                      <p className="session-registered">👥 {session.registered} Registered</p>
                    </div>
                    <button className="btn btn-primary btn-sm">{session.action}</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="sidebar-widgets">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Recent Activity</h3>
                  <a href="#" className="link-text">View all →</a>
                </div>
                <div className="activity-list">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-icon">{activity.icon}</div>
                      <div className="activity-details">
                        <div className="activity-text">{activity.text}</div>
                        <div className="activity-course">{activity.course}</div>
                        <div className="activity-time">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="card-title">Quick Actions</h3>
                <div className="quick-actions">
                  <button className="action-btn">
                    <Users size={20} />
                    <span>Add Learners</span>
                  </button>
                  <button className="action-btn">
                    <BookOpen size={20} />
                    <span>Assign Programme</span>
                  </button>
                  <button className="action-btn">
                    <Calendar size={20} />
                    <span>Schedule a Live Session</span>
                  </button>
                  <button className="action-btn">
                    <Download size={20} />
                    <span>Download Analytics</span>
                  </button>
                </div>
              </div>

              <div className="card help-card">
                <div className="help-icon">💡</div>
                <h4>Need help?</h4>
                <p>Contact your account manager</p>
                <button className="btn btn-secondary btn-sm">Get Support</button>
              </div>
            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Overview

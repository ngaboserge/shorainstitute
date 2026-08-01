import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Video, Users, TrendingUp, Award, Calendar, Plus, Download } from 'lucide-react'
import SeminarDetailsModal from '../../components/modals/SeminarDetailsModal'
import { supabase } from '../../lib/supabase'
import './LiveSeminars.css'

const LiveSeminars = () => {
  const [selectedMonth, setSelectedMonth] = useState('May 2026')
  const [showSeminarModal, setShowSeminarModal] = useState(false)
  const [selectedSeminar, setSelectedSeminar] = useState(null)
  const [seminars, setSeminars] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSeminars: 0,
    totalRegistered: 0,
    avgAttendance: 0,
    upcomingCount: 0
  })

  useEffect(() => {
    fetchSeminars()
  }, [])

  const fetchSeminars = async () => {
    try {
      setLoading(true)

      // Fetch published seminars
      const { data: seminarsData, error: seminarsError } = await supabase
        .from('seminars')
        .select('*')
        .eq('status', 'published')
        .order('date', { ascending: true })
        .limit(20)

      if (seminarsError) throw seminarsError

      // Fetch registration counts for all seminars
      const { data: registrationsData, error: regError } = await supabase
        .from('seminar_registrations')
        .select('seminar_id, status')
      
      if (regError) {
        
      }

      // Count registrations by seminar
      const registrationCounts = {}
      let totalRegistered = 0
      let totalAttended = 0
      let totalCompleted = 0

      registrationsData?.forEach(reg => {
        registrationCounts[reg.seminar_id] = (registrationCounts[reg.seminar_id] || 0) + 1
        totalRegistered++
        if (reg.status === 'attended') totalAttended++
        if (reg.status === 'completed') totalCompleted++
      })

      // Transform data for display
      const transformedSeminars = seminarsData.map(seminar => {
        const registeredCount = registrationCounts[seminar.id] || 0
        const seminarDate = new Date(seminar.date)
        const isPast = seminarDate < new Date()
        
        return {
          id: seminar.id,
          month: seminarDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
          day: seminarDate.getDate().toString().padStart(2, '0'),
          date: seminar.date,
          title: seminar.title,
          type: 'LIVE SEMINAR',
          speakers: [seminar.speaker || 'TBA'],
          platform: 'Zoom',
          time: `${seminarDate.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })} (EAT)`,
          registered: registeredCount,
          status: isPast ? 'Completed' : 'Available',
          isPast
        }
      })

      setSeminars(transformedSeminars)

      // Calculate stats
      const upcomingSeminars = transformedSeminars.filter(s => !s.isPast)
      const avgAttendance = totalRegistered > 0 
        ? Math.round(((totalAttended + totalCompleted) / totalRegistered) * 100)
        : 0

      setStats({
        totalSeminars: transformedSeminars.length,
        totalRegistered,
        avgAttendance,
        upcomingCount: upcomingSeminars.length
      })

    } catch (error) {
      console.error('Error fetching seminars:', error)
      // Show empty state instead of mock data
      setSeminars([])
      setStats({
        totalSeminars: 0,
        totalRegistered: 0,
        avgAttendance: 0,
        upcomingCount: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const featuredSessions = seminars.slice(0, 3) // Show first 3 seminars

  // Sidebar sections - show empty states when no data
  const registeredSessions = []
  const customSessions = []
  const attendanceHistory = []
  const recommendedExperts = []

  const handleSeminarClick = (session) => {
    // Convert session data to modal format
    const seminarData = {
      id: session.title.replace(/\s+/g, '-').toLowerCase(),
      title: session.title,
      date: `${session.month} ${session.day}, 2026`,
      time: session.time,
      speaker: session.speakers ? session.speakers[0] : 'TBA',
      registered: session.registered,
      description: `This ${session.type.toLowerCase()} will provide valuable insights into ${session.title.toLowerCase()}.`
    }
    setSelectedSeminar(seminarData)
    setShowSeminarModal(true)
  }

  const handleBulkRegister = async (registrationData) => {
    
    // TODO: Implement actual registration logic with database
    return Promise.resolve()
  }

  return (
    <div className="dashboard-layout">
      <Sidebar type="institutional" />
      <div className="main-content">
        <Header 
          title="Live Seminars"
          subtitle="Manage live sessions, registrations, bespoke requests, and attendance."
          actions={
            <>
              <button className="btn btn-secondary">
                <Download size={18} />
                Request a Live Session
              </button>
              <button className="btn btn-secondary">
                <Download size={18} />
                Download Attendance
              </button>
              <button className="btn btn-warning">
                <Plus size={18} />
                Add to Calendar
              </button>
            </>
          }
        />
        
        <div className="content-wrapper">
          {/* Stats Grid */}
          <div className="seminars-stats-grid">
            <div className="seminars-stat-card">
              <div className="seminars-stat-icon blue">
                <Calendar size={24} />
              </div>
              <div className="seminars-stat-content">
                <div className="seminars-stat-value">{loading ? '...' : stats.upcomingCount}</div>
                <div className="seminars-stat-label">Upcoming Sessions</div>
              </div>
            </div>

            <div className="seminars-stat-card">
              <div className="seminars-stat-icon yellow">
                <Users size={24} />
              </div>
              <div className="seminars-stat-content">
                <div className="seminars-stat-value">{loading ? '...' : stats.totalRegistered.toLocaleString()}</div>
                <div className="seminars-stat-label">Registered Learners</div>
              </div>
            </div>

            <div className="seminars-stat-card">
              <div className="seminars-stat-icon green">
                <TrendingUp size={24} />
              </div>
              <div className="seminars-stat-content">
                <div className="seminars-stat-value">{loading ? '...' : `${stats.avgAttendance}%`}</div>
                <div className="seminars-stat-label">Average Attendance</div>
              </div>
            </div>

            <div className="seminars-stat-card">
              <div className="seminars-stat-icon orange">
                <Award size={24} />
              </div>
              <div className="seminars-stat-content">
                <div className="seminars-stat-value">{loading ? '...' : stats.totalRegistered}</div>
                <div className="seminars-stat-label">Total Registrations</div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="seminars-content-grid">
            {/* Left Side - Calendar and Featured */}
            <div className="seminars-main-section">
              {/* Calendar */}
              <div className="card calendar-card">
                <div className="calendar-header">
                  <button className="calendar-nav-btn">‹</button>
                  <h3 className="calendar-title">{selectedMonth}</h3>
                  <button className="calendar-nav-btn">›</button>
                  <button className="calendar-today-btn">Today</button>
                </div>
                
                <div className="calendar-weekdays">
                  <div className="weekday">Sun</div>
                  <div className="weekday">Mon</div>
                  <div className="weekday">Tue</div>
                  <div className="weekday">Wed</div>
                  <div className="weekday">Thu</div>
                  <div className="weekday">Fri</div>
                  <div className="weekday">Sat</div>
                </div>

                <div className="calendar-grid">
                  {[...Array(31)].map((_, i) => (
                    <div key={i} className={`calendar-day ${i === 20 ? 'today' : ''}`}>
                      <span className="day-number">{i + 1}</span>
                    </div>
                  ))}
                </div>

                <div className="calendar-legend">
                  <div className="legend-item-cal">
                    <span className="legend-dot-cal live"></span>
                    <span>Live Seminar</span>
                  </div>
                  <div className="legend-item-cal">
                    <span className="legend-dot-cal custom"></span>
                    <span>Custom Session</span>
                  </div>
                </div>
              </div>

              {/* Featured Upcoming Sessions */}
              <div className="card">
                <div className="section-header-seminars">
                  <h3 className="section-title-seminars">Featured Upcoming Sessions</h3>
                  <a href="#" className="view-all-link-seminars">View all</a>
                </div>

                <div className="featured-sessions-list">
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>Loading sessions...</div>
                  ) : featuredSessions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>No upcoming sessions</div>
                  ) : (
                    featuredSessions.map((session, index) => (
                    <div key={index} className="featured-session-item">
                      <div className="session-date-badge">
                        <div className="session-month">{session.month}</div>
                        <div className="session-day">{session.day}</div>
                      </div>
                      <div className="session-details">
                        <div className="session-type-badge">{session.type}</div>
                        <h4 className="session-title">{session.title}</h4>
                        <div className="session-meta">
                          <span>🎥 {session.platform}</span>
                          <span>🕐 {session.time}</span>
                          <span>👥 {session.registered} Registered</span>
                        </div>
                      </div>
                      <div className="session-actions">
                        <button 
                          className="btn-session-primary"
                          onClick={() => handleSeminarClick(session)}
                        >
                          View Details
                        </button>
                        <button className="btn-session-secondary">Send Reminder</button>
                      </div>
                    </div>
                  )))}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="seminars-sidebar">
              {/* Quick Actions */}
              <div className="card quick-actions-seminars">
                <h3 className="sidebar-title-seminars">Quick Actions</h3>
                <div className="quick-actions-list">
                  <button className="quick-action-btn">
                    <Calendar size={18} />
                    <span>Request Custom Session</span>
                  </button>
                  <button className="quick-action-btn">
                    <Users size={18} />
                    <span>Send Reminder</span>
                  </button>
                  <button className="quick-action-btn">
                    <Download size={18} />
                    <span>Download Attendance</span>
                  </button>
                  <button className="quick-action-btn">
                    <Video size={18} />
                    <span>View Session Reports</span>
                  </button>
                </div>
              </div>

              {/* Registered Sessions */}
              <div className="card">
                <div className="section-header-seminars">
                  <h3 className="sidebar-title-seminars">Registered Sessions</h3>
                </div>
                {registeredSessions.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <p style={{ color: '#666', fontSize: '14px' }}>
                      Your registered sessions will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="registered-sessions-list">
                    {registeredSessions.map((session, index) => (
                      <div key={index} className="registered-session-item">
                        <div className="registered-session-icon">📅</div>
                        <div className="registered-session-info">
                          <div className="registered-session-title">{session.title}</div>
                          <div className="registered-session-date">{session.date}</div>
                          <span className={`session-status-badge ${session.status === 'Registered' ? 'registered' : 'discussion'}`}>
                            {session.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Requested Sessions */}
              <div className="card">
                <div className="section-header-seminars">
                  <h3 className="sidebar-title-seminars">Requested Custom Sessions</h3>
                </div>
                {customSessions.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <p style={{ color: '#666', fontSize: '14px' }}>
                      Your custom session requests will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="custom-sessions-list">
                    {customSessions.map((session, index) => (
                      <div key={index} className="custom-session-item">
                        <div className="custom-session-icon">🎯</div>
                        <div className="custom-session-info">
                          <div className="custom-session-title">{session.title}</div>
                          <div className="custom-session-requestor">{session.requestor}</div>
                          <div className="custom-session-date">{session.date}</div>
                          <span className={`session-status-badge ${
                            session.status === 'Recorded' ? 'recorded' : 
                            session.status === 'In Discussion' ? 'discussion' : 
                            'pending'
                          }`}>
                            {session.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="seminars-bottom-grid">
            <div className="card">
              <h3 className="section-title-seminars">Attendance History</h3>
              {attendanceHistory.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <p style={{ color: '#666' }}>Your attendance history will appear here.</p>
                </div>
              ) : (
                <div className="attendance-list">
                  {attendanceHistory.map((item, index) => (
                    <div key={index} className="attendance-item">
                      <div className="attendance-icon">✓</div>
                      <div className="attendance-info">
                        <div className="attendance-title">{item.title}</div>
                        <div className="attendance-date">{item.date} • {item.attendees}</div>
                      </div>
                      <div className="attendance-completion">{item.completion}%</div>
                      <button className="btn-view-certificate">View Certificate</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="section-title-seminars">Recommended Expert Sessions</h3>
              {recommendedExperts.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <p style={{ color: '#666' }}>Recommended sessions will appear here.</p>
                </div>
              ) : (
                <div className="recommended-experts-list">
                  {recommendedExperts.map((expert, index) => (
                    <div key={index} className="expert-session-item">
                      <div className="expert-badge">{expert.tag}</div>
                      <div className="expert-session-title">{expert.name}</div>
                      <div className="expert-session-expert">{expert.expert}</div>
                      <div className="expert-session-meta">
                        <span>📅 {expert.date}</span>
                        <span>🎥 {expert.platform}</span>
                        <span>👥 {expert.attendees}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Seminar Details Modal */}
      <SeminarDetailsModal 
        isOpen={showSeminarModal}
        onClose={() => setShowSeminarModal(false)}
        seminar={selectedSeminar}
        onBulkRegister={handleBulkRegister}
      />
    </div>
  )
}

export default LiveSeminars

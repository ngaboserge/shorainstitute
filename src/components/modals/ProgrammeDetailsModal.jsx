import React, { useState } from 'react'
import { X, BookOpen, Users, Calendar, TrendingUp, Download, Award, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import './Modal.css'

const ProgrammeDetailsModal = ({ isOpen, onClose, programme }) => {
  const [activeTab, setActiveTab] = useState('overview')

  if (!isOpen || !programme) return null

  // Mock data for progress by department
  const departmentProgress = [
    { name: 'Credit & Risk', enrolled: 89, avgProgress: 75 },
    { name: 'Finance', enrolled: 78, avgProgress: 68 },
    { name: 'Operations', enrolled: 65, avgProgress: 72 },
    { name: 'HR & Admin', enrolled: 42, avgProgress: 65 },
    { name: 'IT', enrolled: 25, avgProgress: 80 }
  ]

  // Mock completion distribution
  const completionData = [
    { name: 'Completed', value: 73, color: '#4caf50' },
    { name: 'In Progress', value: 22, color: '#2196f3' },
    { name: 'Not Started', value: 5, color: '#ff9800' }
  ]

  // Mock enrolled learners
  const enrolledLearners = [
    { id: 'RDB-1001', name: 'Juanee Mukamana', avatar: 'https://i.pravatar.cc/150?img=1', department: 'Credit & Risk', progress: 85, lastActive: '2 hours ago' },
    { id: 'RDB-1002', name: 'Maria Ndayishimiye', avatar: 'https://i.pravatar.cc/150?img=5', department: 'Finance', progress: 72, lastActive: '1 day ago' },
    { id: 'RDB-1003', name: 'Emmanuel Kaziwe', avatar: 'https://i.pravatar.cc/150?img=12', department: 'Operations', progress: 68, lastActive: '3 hours ago' },
    { id: 'RDB-1004', name: 'Aline Cyuenza', avatar: 'https://i.pravatar.cc/150?img=9', department: 'HR & Admin', progress: 55, lastActive: '5 hours ago' },
    { id: 'RDB-1005', name: 'Dieudonné Bahigize', avatar: 'https://i.pravatar.cc/150?img=13', department: 'IT', progress: 90, lastActive: '30 min ago' },
  ]

  // Mock upcoming sessions
  const upcomingSessions = [
    { date: 'May 08, 2026', time: '9:00 AM (EAT)', topic: 'Credit Risk Fundamentals', speaker: 'Dr. Anan Hakizimana', registered: 245 },
    { date: 'May 15, 2026', time: '2:00 PM (EAT)', topic: 'Advanced Risk Analysis', speaker: 'Peace Uwase', registered: 198 },
    { date: 'May 22, 2026', time: '3:00 PM (EAT)', topic: 'Portfolio Management', speaker: 'David Nkundanze', registered: 210 }
  ]

  // Mock courses in programme
  const courses = [
    { name: 'Introduction to Credit Risk', progress: 95, completed: 284, total: 299 },
    { name: 'Credit Assessment Methods', progress: 88, completed: 263, total: 299 },
    { name: 'Risk Mitigation Strategies', progress: 75, completed: 224, total: 299 },
    { name: 'Financial Statement Analysis', progress: 68, completed: 203, total: 299 },
    { name: 'Loan Portfolio Management', progress: 62, completed: 185, total: 299 },
    { name: 'Regulatory Compliance', progress: 55, completed: 164, total: 299 },
    { name: 'Advanced Credit Models', progress: 48, completed: 143, total: 299 },
    { name: 'Case Studies & Capstone', progress: 35, completed: 104, total: 299 }
  ]

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
              <div style={{ display: 'flex', gap: '12px', fontSize: '14px', color: '#666' }}>
                <span>{programme.code}</span>
                <span>•</span>
                <span>{programme.dept}</span>
                <span>•</span>
                <span>{programme.enrolled} learners enrolled</span>
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
            className={`modal-tab ${activeTab === 'learners' ? 'active' : ''}`}
            onClick={() => setActiveTab('learners')}
          >
            <Users size={16} />
            Enrolled Learners ({programme.enrolled})
          </button>
          <button 
            className={`modal-tab ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            <BookOpen size={16} />
            Courses (8)
          </button>
          <button 
            className={`modal-tab ${activeTab === 'sessions' ? 'active' : ''}`}
            onClick={() => setActiveTab('sessions')}
          >
            <Calendar size={16} />
            Live Sessions (3)
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div className="details-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Total Enrolled</div>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: '#0B4F9F' }}>{programme.enrolled}</div>
                    </div>
                    <Users size={24} color="#0B4F9F" />
                  </div>
                </div>

                <div className="details-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Avg Progress</div>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: '#4caf50' }}>{programme.progress}</div>
                    </div>
                    <TrendingUp size={24} color="#4caf50" />
                  </div>
                </div>

                <div className="details-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Completion Rate</div>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: '#ff9800' }}>{programme.completionRate}</div>
                    </div>
                    <Award size={24} color="#ff9800" />
                  </div>
                </div>

                <div className="details-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Active Learners</div>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: '#2196f3' }}>264</div>
                    </div>
                    <Clock size={24} color="#2196f3" />
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

              {/* Next Live Session */}
              <div className="details-card" style={{ marginTop: '20px', background: '#f0f7ff', border: '2px solid #0B4F9F' }}>
                <h3 className="details-card-title" style={{ color: '#0B4F9F' }}>Next Live Session</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                      {programme.upcomingSession}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      Speaker: {programme.invitedSpeaker}
                    </div>
                  </div>
                  <button className="btn btn-primary">
                    <Calendar size={16} />
                    View Details
                  </button>
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
                    {enrolledLearners.length} learners shown (showing first 5)
                  </p>
                </div>
                <button className="btn btn-outline btn-sm">
                  <Download size={16} />
                  Export All
                </button>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Learner</th>
                      <th>Employee ID</th>
                      <th>Department</th>
                      <th>Progress</th>
                      <th>Last Active</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolledLearners.map((learner) => (
                      <tr key={learner.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img 
                              src={learner.avatar} 
                              alt={learner.name}
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                objectFit: 'cover'
                              }}
                            />
                            <span style={{ fontWeight: '500' }}>{learner.name}</span>
                          </div>
                        </td>
                        <td>{learner.id}</td>
                        <td>{learner.department}</td>
                        <td>
                          <div className="progress-cell">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{width: `${learner.progress}%`}}
                              ></div>
                            </div>
                            <span className="progress-text">{learner.progress}%</span>
                          </div>
                        </td>
                        <td>{learner.lastActive}</td>
                        <td>
                          <button className="btn btn-outline btn-sm">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Programme Courses</h3>
                <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>
                  8 courses in this programme
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {courses.map((course, index) => (
                  <div key={index} className="details-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ 
                            background: '#e8f4fd', 
                            color: '#0B4F9F', 
                            padding: '2px 8px', 
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            Course {index + 1}
                          </span>
                          <h4 style={{ margin: 0 }}>{course.name}</h4>
                        </div>
                        <div style={{ fontSize: '13px', color: '#666' }}>
                          {course.completed} of {course.total} learners completed
                        </div>
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#0B4F9F' }}>
                        {course.progress}%
                      </div>
                    </div>

                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{width: `${course.progress}%`}}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Upcoming Live Sessions</h3>
                <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>
                  {upcomingSessions.length} sessions scheduled
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {upcomingSessions.map((session, index) => (
                  <div key={index} className="details-card">
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '12px',
                        background: '#0B4F9F',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        flexShrink: 0
                      }}>
                        <div style={{ fontSize: '24px', fontWeight: '700' }}>
                          {session.date.split(' ')[1].replace(',', '')}
                        </div>
                        <div style={{ fontSize: '12px' }}>
                          {session.date.split(' ')[0]}
                        </div>
                      </div>

                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 8px 0' }}>{session.topic}</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', color: '#666' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={16} />
                            <span>{session.time}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={16} />
                            <span>Speaker: {session.speaker}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Award size={16} />
                            <span>{session.registered} learners registered</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button className="btn btn-primary">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-outline">
              <Download size={16} />
              Export Report
            </button>
            <button className="btn btn-outline">
              <Users size={16} />
              Manage Learners
            </button>
            <button className="btn btn-primary">
              <Calendar size={16} />
              Schedule Session
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProgrammeDetailsModal

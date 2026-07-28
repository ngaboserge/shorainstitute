import React, { useState } from 'react'
import { X, User, BookOpen, Award, Activity, Mail, Phone, MapPin, Briefcase, Calendar, TrendingUp, Download } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import './Modal.css'

const LearnerDetailsModal = ({ isOpen, onClose, learner }) => {
  const [activeTab, setActiveTab] = useState('overview')

  if (!isOpen || !learner) return null

  // Mock progress data
  const progressData = [
    { month: 'Jan', progress: 10 },
    { month: 'Feb', progress: 25 },
    { month: 'Mar', progress: 40 },
    { month: 'Apr', progress: 55 },
    { month: 'May', progress: learner.progress },
  ]

  const assignedProgrammes = [
    {
      name: learner.programme,
      progress: learner.progress,
      status: 'In Progress',
      startDate: 'Jan 15, 2026',
      dueDate: 'Jun 30, 2026',
      coursesCompleted: 5,
      coursesTotal: 8
    }
  ]

  const certificates = learner.certificates > 0 ? [
    {
      name: 'Financial Foundations Certificate',
      issueDate: 'Apr 20, 2026',
      id: 'CERT-2026-001'
    }
  ] : []

  const activityLog = [
    { action: 'Completed lesson', course: 'Understanding Credit Risk', time: '2 hours ago' },
    { action: 'Started course', course: 'Financial Statement Analysis', time: '1 day ago' },
    { action: 'Earned certificate', course: 'Financial Foundations', time: '3 days ago' },
    { action: 'Completed assessment', course: 'Investment Basics', time: '5 days ago' },
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-xlarge" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            <img 
              src={learner.avatar} 
              alt={learner.name}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <div>
              <h2 style={{ marginBottom: '4px' }}>{learner.name}</h2>
              <div style={{ display: 'flex', gap: '12px', fontSize: '14px', color: '#666' }}>
                <span>{learner.id}</span>
                <span>•</span>
                <span>{learner.department}</span>
                <span>•</span>
                <span className={`badge ${
                  learner.status === 'Active' ? 'success' : 
                  learner.status === 'At Risk' ? 'warning' : 
                  'neutral'
                }`}>
                  {learner.status}
                </span>
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
            <User size={16} />
            Overview
          </button>
          <button 
            className={`modal-tab ${activeTab === 'programmes' ? 'active' : ''}`}
            onClick={() => setActiveTab('programmes')}
          >
            <BookOpen size={16} />
            Programmes
          </button>
          <button 
            className={`modal-tab ${activeTab === 'certificates' ? 'active' : ''}`}
            onClick={() => setActiveTab('certificates')}
          >
            <Award size={16} />
            Certificates ({learner.certificates})
          </button>
          <button 
            className={`modal-tab ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <Activity size={16} />
            Activity
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="learner-details-grid">
              {/* Left Column - Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="details-card">
                  <h3 className="details-card-title">Personal Information</h3>
                  <div className="details-list">
                    <div className="detail-item">
                      <Mail size={18} color="#666" />
                      <div>
                        <div className="detail-label">Email</div>
                        <div className="detail-value">
                          {learner.name.toLowerCase().replace(' ', '.')}@institution.com
                        </div>
                      </div>
                    </div>
                    <div className="detail-item">
                      <Phone size={18} color="#666" />
                      <div>
                        <div className="detail-label">Phone</div>
                        <div className="detail-value">+250 788 123 456</div>
                      </div>
                    </div>
                    <div className="detail-item">
                      <MapPin size={18} color="#666" />
                      <div>
                        <div className="detail-label">Location</div>
                        <div className="detail-value">Kigali, Rwanda</div>
                      </div>
                    </div>
                    <div className="detail-item">
                      <Briefcase size={18} color="#666" />
                      <div>
                        <div className="detail-label">Department</div>
                        <div className="detail-value">{learner.department}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="details-card">
                  <h3 className="details-card-title">Learning Stats</h3>
                  <div className="stats-grid-small">
                    <div className="stat-item-small">
                      <div className="stat-label-small">Overall Progress</div>
                      <div className="stat-value-large">{learner.progress}%</div>
                    </div>
                    <div className="stat-item-small">
                      <div className="stat-label-small">Certificates Earned</div>
                      <div className="stat-value-large">{learner.certificates}</div>
                    </div>
                    <div className="stat-item-small">
                      <div className="stat-label-small">Last Active</div>
                      <div className="stat-value-small">{learner.lastActive}</div>
                    </div>
                    <div className="stat-item-small">
                      <div className="stat-label-small">Enrolled Since</div>
                      <div className="stat-value-small">Jan 15, 2026</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Progress Chart */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="details-card">
                  <h3 className="details-card-title">Learning Progress</h3>
                  <div style={{ height: '300px', marginTop: '20px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={progressData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="progress" 
                          stroke="#0B4F9F" 
                          strokeWidth={3}
                          dot={{ fill: '#0B4F9F', r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="details-card">
                  <h3 className="details-card-title">Current Programme</h3>
                  <div style={{ padding: '16px', background: '#f5f7fa', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '8px' }}>{learner.programme}</div>
                    <div className="progress-cell">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{width: `${learner.progress}%`}}
                        ></div>
                      </div>
                      <span className="progress-text">{learner.progress}%</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#666', marginTop: '12px' }}>
                      5 of 8 courses completed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Programmes Tab */}
          {activeTab === 'programmes' && (
            <div>
              <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0 }}>Assigned Programmes</h3>
                  <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>
                    {assignedProgrammes.length} programme(s) assigned
                  </p>
                </div>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => alert('Assign new programme')}
                >
                  <BookOpen size={16} />
                  Assign Programme
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {assignedProgrammes.map((prog, index) => (
                  <div key={index} className="details-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                      <div>
                        <h4 style={{ margin: '0 0 8px 0' }}>{prog.name}</h4>
                        <span className="badge success">{prog.status}</span>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '13px', color: '#666' }}>
                        <div>{prog.startDate} - {prog.dueDate}</div>
                      </div>
                    </div>

                    <div className="progress-cell">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{width: `${prog.progress}%`}}
                        ></div>
                      </div>
                      <span className="progress-text">{prog.progress}%</span>
                    </div>

                    <div style={{ marginTop: '16px', display: 'flex', gap: '24px', fontSize: '14px' }}>
                      <div>
                        <span style={{ color: '#666' }}>Courses:</span>
                        <strong> {prog.coursesCompleted}/{prog.coursesTotal}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#666' }}>Progress:</span>
                        <strong style={{ color: '#4caf50' }}> {prog.progress}%</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificates Tab */}
          {activeTab === 'certificates' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Earned Certificates</h3>
                <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>
                  {certificates.length} certificate(s) earned
                </p>
              </div>

              {certificates.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <Award size={64} color="#ccc" />
                  <h3 style={{ color: '#666', marginTop: '16px' }}>No certificates yet</h3>
                  <p style={{ color: '#999' }}>Certificates will appear here once earned</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                  {certificates.map((cert, index) => (
                    <div key={index} className="details-card" style={{ border: '2px solid #fdb714' }}>
                      <Award size={32} color="#fdb714" style={{ marginBottom: '12px' }} />
                      <h4 style={{ margin: '0 0 8px 0' }}>{cert.name}</h4>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                        Issued: {cert.issueDate}
                      </div>
                      <div style={{ fontSize: '12px', color: '#999', marginBottom: '16px' }}>
                        ID: {cert.id}
                      </div>
                      <button className="btn btn-outline btn-sm btn-full">
                        <Download size={16} />
                        Download Certificate
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Recent Activity</h3>
                <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>
                  Latest learning activities
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                {activityLog.map((activity, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      padding: '16px 20px', 
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px'
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#e8f4fd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Activity size={20} color="#0B4F9F" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>{activity.action}</div>
                      <div style={{ fontSize: '14px', color: '#666' }}>{activity.course}</div>
                    </div>
                    <div style={{ fontSize: '13px', color: '#999', flexShrink: 0 }}>
                      {activity.time}
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
              <Mail size={16} />
              Send Message
            </button>
            <button className="btn btn-outline">
              <Download size={16} />
              Export Report
            </button>
            <button className="btn btn-primary">
              <BookOpen size={16} />
              Assign Programme
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LearnerDetailsModal

import React, { useState } from 'react'
import { X, Calendar, Users, Clock, Video, MapPin, Download, CheckCircle, User } from 'lucide-react'
import './Modal.css'

const SeminarDetailsModal = ({ isOpen, onClose, seminar, onBulkRegister }) => {
  const [activeTab, setActiveTab] = useState('details')
  const [selectedLearners, setSelectedLearners] = useState([])

  if (!isOpen || !seminar) return null

  // Mock registered learners from institution
  const registeredLearners = [
    { id: 'RDB-1001', name: 'Juanee Mukamana', avatar: 'https://i.pravatar.cc/150?img=1', department: 'Credit & Risk', registeredAt: '2 days ago' },
    { id: 'RDB-1002', name: 'Maria Ndayishimiye', avatar: 'https://i.pravatar.cc/150?img=5', department: 'Finance', registeredAt: '3 days ago' },
    { id: 'RDB-1003', name: 'Emmanuel Kaziwe', avatar: 'https://i.pravatar.cc/150?img=12', department: 'Operations', registeredAt: '1 week ago' },
  ]

  // Mock available learners (not registered)
  const availableLearners = [
    { id: 'RDB-1004', name: 'Aline Cyuenza', avatar: 'https://i.pravatar.cc/150?img=9', department: 'HR & Admin' },
    { id: 'RDB-1005', name: 'Dieudonné Bahigize', avatar: 'https://i.pravatar.cc/150?img=13', department: 'IT' },
    { id: 'RDB-1006', name: 'Gloria Nzirakamanzi', avatar: 'https://i.pravatar.cc/150?img=10', department: 'Finance' },
    { id: 'RDB-1007', name: 'Patrick Twizeyange', avatar: 'https://i.pravatar.cc/150?img=14', department: 'Credit & Risk' },
    { id: 'RDB-1008', name: 'Jocine Mukachimana', avatar: 'https://i.pravatar.cc/150?img=8', department: 'Operations' },
  ]

  const handleLearnerToggle = (learnerId) => {
    setSelectedLearners(prev => 
      prev.includes(learnerId) 
        ? prev.filter(id => id !== learnerId)
        : [...prev, learnerId]
    )
  }

  const handleSelectAll = () => {
    if (selectedLearners.length === availableLearners.length) {
      setSelectedLearners([])
    } else {
      setSelectedLearners(availableLearners.map(l => l.id))
    }
  }

  const handleBulkRegister = async () => {
    if (selectedLearners.length === 0) {
      alert('Please select at least one learner')
      return
    }

    try {
      await onBulkRegister({
        seminarId: seminar.id,
        learnerIds: selectedLearners
      })

      alert(`✅ ${selectedLearners.length} learner(s) registered successfully!`)
      setSelectedLearners([])
      setActiveTab('registered')
    } catch (error) {
      console.error('Error registering learners:', error)
      alert('Failed to register learners. Please try again.')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-xlarge" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ flex: 1 }}>
            <h2 style={{ marginBottom: '8px' }}>{seminar.title}</h2>
            <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#666' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} />
                <span>{seminar.date}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} />
                <span>{seminar.time}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={16} />
                <span>{seminar.registered || 0} registered</span>
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
            className={`modal-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <Calendar size={16} />
            Seminar Details
          </button>
          <button 
            className={`modal-tab ${activeTab === 'registered' ? 'active' : ''}`}
            onClick={() => setActiveTab('registered')}
          >
            <CheckCircle size={16} />
            Registered ({registeredLearners.length})
          </button>
          <button 
            className={`modal-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            <Users size={16} />
            Bulk Register
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Main Content */}
                <div>
                  {/* Session Info Card */}
                  <div className="details-card" style={{ marginBottom: '20px', background: '#f0f7ff' }}>
                    <h3 className="details-card-title">Session Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                      <div className="detail-item">
                        <Calendar size={18} color="#0B4F9F" />
                        <div>
                          <div className="detail-label">Date</div>
                          <div className="detail-value">{seminar.date}</div>
                        </div>
                      </div>
                      <div className="detail-item">
                        <Clock size={18} color="#0B4F9F" />
                        <div>
                          <div className="detail-label">Time</div>
                          <div className="detail-value">{seminar.time}</div>
                        </div>
                      </div>
                      <div className="detail-item">
                        <Video size={18} color="#0B4F9F" />
                        <div>
                          <div className="detail-label">Format</div>
                          <div className="detail-value">Virtual (Zoom)</div>
                        </div>
                      </div>
                      <div className="detail-item">
                        <Users size={18} color="#0B4F9F" />
                        <div>
                          <div className="detail-label">Capacity</div>
                          <div className="detail-value">Unlimited</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="details-card" style={{ marginBottom: '20px' }}>
                    <h3 className="details-card-title">About This Seminar</h3>
                    <p style={{ marginTop: '12px', lineHeight: '1.8', color: '#444' }}>
                      {seminar.description || 'This seminar will cover key concepts and practical applications in the field. Participants will gain valuable insights from industry experts and have the opportunity to engage in interactive discussions.'}
                    </p>

                    <div style={{ marginTop: '20px' }}>
                      <h4 style={{ marginBottom: '12px', fontSize: '15px' }}>What You'll Learn:</h4>
                      <ul style={{ marginLeft: '20px', lineHeight: '2', color: '#555' }}>
                        <li>Core principles and fundamental concepts</li>
                        <li>Best practices and industry standards</li>
                        <li>Practical applications and real-world examples</li>
                        <li>Q&A session with the expert</li>
                      </ul>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="details-card">
                    <h3 className="details-card-title">Requirements</h3>
                    <ul style={{ marginTop: '12px', marginLeft: '20px', lineHeight: '2', color: '#555' }}>
                      <li>Stable internet connection</li>
                      <li>Zoom application installed</li>
                      <li>Basic understanding of the topic (recommended)</li>
                      <li>Camera and microphone for interactive participation</li>
                    </ul>
                  </div>
                </div>

                {/* Sidebar */}
                <div>
                  {/* Speaker Card */}
                  <div className="details-card" style={{ marginBottom: '20px' }}>
                    <h3 className="details-card-title">Speaker</h3>
                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                      <img 
                        src={seminar.speakerImage || 'https://i.pravatar.cc/150?img=33'}
                        alt={seminar.speaker}
                        style={{
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          marginBottom: '12px'
                        }}
                      />
                      <h4 style={{ margin: '0 0 4px 0' }}>{seminar.speaker}</h4>
                      <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
                        {seminar.speakerTitle || 'Industry Expert'}
                      </p>
                      <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#555' }}>
                        {seminar.speakerBio || 'Experienced professional with extensive knowledge in the field and a passion for education.'}
                      </p>
                    </div>
                  </div>

                  {/* Registration Stats */}
                  <div className="details-card">
                    <h3 className="details-card-title">Registration Stats</h3>
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '13px', color: '#666' }}>Your Institution</span>
                          <span style={{ fontSize: '15px', fontWeight: '600', color: '#0B4F9F' }}>
                            {registeredLearners.length}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '13px', color: '#666' }}>Total Registered</span>
                          <span style={{ fontSize: '15px', fontWeight: '600', color: '#4caf50' }}>
                            {seminar.registered || 0}
                          </span>
                        </div>
                      </div>

                      <button 
                        className="btn btn-primary btn-full"
                        onClick={() => setActiveTab('register')}
                      >
                        <Users size={16} />
                        Register More Learners
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Registered Learners Tab */}
          {activeTab === 'registered' && (
            <div>
              <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0 }}>Registered Learners from Your Institution</h3>
                  <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>
                    {registeredLearners.length} learner(s) registered
                  </p>
                </div>
                <button className="btn btn-outline btn-sm">
                  <Download size={16} />
                  Export List
                </button>
              </div>

              {registeredLearners.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <Users size={64} color="#ccc" />
                  <h3 style={{ color: '#666', marginTop: '16px' }}>No registrations yet</h3>
                  <p style={{ color: '#999', marginBottom: '24px' }}>Register learners from your institution</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveTab('register')}
                  >
                    <Users size={16} />
                    Register Learners
                  </button>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Learner</th>
                        <th>Employee ID</th>
                        <th>Department</th>
                        <th>Registered</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registeredLearners.map((learner) => (
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
                          <td>{learner.registeredAt}</td>
                          <td>
                            <button className="btn btn-outline btn-sm" style={{ color: '#f44336' }}>
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Bulk Register Tab */}
          {activeTab === 'register' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Register Learners</h3>
                <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>
                  Select learners from your institution to register for this seminar
                </p>
              </div>

              <div className="info-box" style={{ marginBottom: '20px' }}>
                <strong>Seminar: {seminar.title}</strong>
                <p style={{ margin: '4px 0 0', fontSize: '13px' }}>
                  {seminar.date} at {seminar.time}
                </p>
              </div>

              <div style={{ 
                maxHeight: '400px', 
                overflowY: 'auto', 
                border: '1px solid #e0e0e0', 
                borderRadius: '8px',
                background: 'white',
                marginBottom: '20px'
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
                      checked={selectedLearners.length === availableLearners.length && availableLearners.length > 0}
                      onChange={handleSelectAll}
                    />
                    <strong>Select All ({availableLearners.length} available)</strong>
                  </label>
                </div>

                {availableLearners.map((learner) => (
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
                        checked={selectedLearners.includes(learner.id)}
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
                          {learner.id} • {learner.department}
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {selectedLearners.length} learner(s) selected
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={handleBulkRegister}
                  disabled={selectedLearners.length === 0}
                >
                  <CheckCircle size={16} />
                  Register {selectedLearners.length} Learner(s)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            {activeTab === 'details' && (
              <button 
                className="btn btn-primary"
                onClick={() => setActiveTab('register')}
              >
                <Users size={16} />
                Register Learners
              </button>
            )}
            {activeTab === 'registered' && (
              <button className="btn btn-outline">
                <Download size={16} />
                Export Attendee List
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SeminarDetailsModal

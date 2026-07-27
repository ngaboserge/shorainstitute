import React, { useState } from 'react'
import { X, BookOpen, Users, Calendar, Search } from 'lucide-react'
import './Modal.css'

const AssignProgrammeModal = ({ isOpen, onClose, onAssign, selectedLearners = [], institutionId }) => {
  const [assignmentType, setAssignmentType] = useState(selectedLearners.length > 0 ? 'selected' : 'new')
  const [selectedProgramme, setSelectedProgramme] = useState('')
  const [cohort, setCohort] = useState('')
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [department, setDepartment] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [learnerSelection, setLearnerSelection] = useState(selectedLearners.map(l => l.id))
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  // Mock programmes available for institutions
  const availableProgrammes = [
    {
      id: 'prog-1',
      name: 'Financial Foundation',
      description: 'Core financial literacy and planning skills',
      courses: 8,
      duration: '6 months',
      category: 'Finance'
    },
    {
      id: 'prog-2',
      name: 'Financial Planning Basics',
      description: 'Fundamentals of financial planning and budgeting',
      courses: 6,
      duration: '4 months',
      category: 'Finance'
    },
    {
      id: 'prog-3',
      name: 'Investment Foundations',
      description: 'Introduction to investment principles',
      courses: 7,
      duration: '5 months',
      category: 'Investment'
    },
    {
      id: 'prog-4',
      name: 'Capital Markets Essentials',
      description: 'Understanding capital markets and trading',
      courses: 9,
      duration: '7 months',
      category: 'Markets'
    },
    {
      id: 'prog-5',
      name: 'Risk Management Basics',
      description: 'Credit risk assessment and management',
      courses: 5,
      duration: '3 months',
      category: 'Risk'
    }
  ]

  // Mock learners (in real implementation, fetch from database)
  const allLearners = [
    { id: 'RDB-1001', name: 'Juanee Mukamana', department: 'Credit & Risk', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: 'RDB-1002', name: 'Maria Ndayishimiye', department: 'Finance', avatar: 'https://i.pravatar.cc/150?img=5' },
    { id: 'RDB-1003', name: 'Emmanuel Kaziwe', department: 'Operations', avatar: 'https://i.pravatar.cc/150?img=12' },
    { id: 'RDB-1004', name: 'Aline Cyuenza', department: 'HR & Admin', avatar: 'https://i.pravatar.cc/150?img=9' },
    { id: 'RDB-1005', name: 'Dieudonné Bahigize', department: 'IT', avatar: 'https://i.pravatar.cc/150?img=13' },
    { id: 'RDB-1006', name: 'Gloria Nzirakamanzi', department: 'Finance', avatar: 'https://i.pravatar.cc/150?img=10' },
    { id: 'RDB-1007', name: 'Patrick Twizeyange', department: 'Credit & Risk', avatar: 'https://i.pravatar.cc/150?img=14' },
    { id: 'RDB-1008', name: 'Jocine Mukachimana', department: 'Operations', avatar: 'https://i.pravatar.cc/150?img=8' },
  ]

  const filteredLearners = allLearners.filter(learner => 
    learner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    learner.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredProgrammes = availableProgrammes.filter(prog =>
    prog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prog.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleLearnerToggle = (learnerId) => {
    setLearnerSelection(prev => 
      prev.includes(learnerId) 
        ? prev.filter(id => id !== learnerId)
        : [...prev, learnerId]
    )
  }

  const handleSelectAll = () => {
    if (learnerSelection.length === filteredLearners.length) {
      setLearnerSelection([])
    } else {
      setLearnerSelection(filteredLearners.map(l => l.id))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedProgramme) {
      alert('Please select a programme')
      return
    }

    if (learnerSelection.length === 0) {
      alert('Please select at least one learner')
      return
    }

    setSubmitting(true)

    try {
      await onAssign({
        programmeId: selectedProgramme,
        learnerIds: learnerSelection,
        cohort,
        startDate,
        dueDate,
        department: department || null
      })

      alert(`✅ Programme assigned to ${learnerSelection.length} learner(s) successfully!`)
      onClose()
    } catch (error) {
      console.error('Error assigning programme:', error)
      alert('Failed to assign programme. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedProgrammeData = availableProgrammes.find(p => p.id === selectedProgramme)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-xlarge" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Assign Programme</h2>
            <p className="modal-subtitle">Assign a learning programme to learners</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {/* Step 1: Select Programme */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} />
                Step 1: Select Programme
              </h3>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <div className="search-box" style={{ marginBottom: '16px' }}>
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Search programmes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {filteredProgrammes.map((prog) => (
                  <div
                    key={prog.id}
                    onClick={() => setSelectedProgramme(prog.id)}
                    style={{
                      padding: '16px',
                      border: `2px solid ${selectedProgramme === prog.id ? '#0B4F9F' : '#e0e0e0'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: selectedProgramme === prog.id ? '#f0f7ff' : 'white'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '12px' }}>
                      <input
                        type="radio"
                        name="programme"
                        checked={selectedProgramme === prog.id}
                        onChange={() => setSelectedProgramme(prog.id)}
                        style={{ marginTop: '2px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>{prog.name}</h4>
                        <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
                          {prog.description}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#666' }}>
                      <span>📚 {prog.courses} courses</span>
                      <span>⏱️ {prog.duration}</span>
                    </div>
                  </div>
                ))}
              </div>

              {selectedProgrammeData && (
                <div className="info-box" style={{ marginTop: '16px' }}>
                  <strong>Selected Programme: {selectedProgrammeData.name}</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '13px' }}>
                    {selectedProgrammeData.courses} courses • {selectedProgrammeData.duration} estimated completion
                  </p>
                </div>
              )}
            </div>

            {/* Step 2: Select Learners */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} />
                Step 2: Select Learners
              </h3>

              {selectedLearners.length > 0 && (
                <div className="info-box" style={{ marginBottom: '16px' }}>
                  {selectedLearners.length} learner(s) pre-selected
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Filter by Department (Optional)</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="">All Departments</option>
                  <option value="Finance">Finance</option>
                  <option value="HR & Admin">HR & Admin</option>
                  <option value="Operations">Operations</option>
                  <option value="IT">IT</option>
                  <option value="Credit & Risk">Credit & Risk</option>
                </select>
              </div>

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
                      checked={learnerSelection.length === filteredLearners.length && filteredLearners.length > 0}
                      onChange={handleSelectAll}
                    />
                    <strong>Select All ({filteredLearners.length})</strong>
                  </label>
                </div>

                {filteredLearners.map((learner) => (
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
                          {learner.id} • {learner.department}
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
                {learnerSelection.length} learner(s) selected
              </div>
            </div>

            {/* Step 3: Assignment Details */}
            <div>
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={20} />
                Step 3: Assignment Details
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Due Date (Optional)</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={startDate}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Cohort (Optional)</label>
                <select
                  value={cohort}
                  onChange={(e) => setCohort(e.target.value)}
                >
                  <option value="">No cohort</option>
                  <option value="Q1-2026">Q1 2026 Cohort</option>
                  <option value="Q2-2026">Q2 2026 Cohort</option>
                  <option value="Finance-2026">Finance Team 2026</option>
                  <option value="Leadership-2026">Leadership Program 2026</option>
                </select>
                <small className="form-hint">Group learners together for tracking</small>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitting || !selectedProgramme || learnerSelection.length === 0}
            >
              {submitting ? 'Assigning...' : `Assign to ${learnerSelection.length} Learner(s)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AssignProgrammeModal

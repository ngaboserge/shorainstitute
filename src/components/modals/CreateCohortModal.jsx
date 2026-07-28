import React, { useState } from 'react'
import { X, Users, BookOpen, Calendar, Building } from 'lucide-react'
import './Modal.css'

const CreateCohortModal = ({ isOpen, onClose, onCreate, institutionId }) => {
  const [cohortName, setCohortName] = useState('')
  const [cohortCode, setCohortCode] = useState('')
  const [selectedProgramme, setSelectedProgramme] = useState('')
  const [department, setDepartment] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [description, setDescription] = useState('')
  const [maxLearners, setMaxLearners] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  // Mock programmes
  const availableProgrammes = [
    { id: 'prog-1', name: 'Financial Foundation', duration: '6 months' },
    { id: 'prog-2', name: 'Financial Planning Basics', duration: '4 months' },
    { id: 'prog-3', name: 'Investment Foundations', duration: '5 months' },
    { id: 'prog-4', name: 'Capital Markets Essentials', duration: '7 months' },
    { id: 'prog-5', name: 'Risk Management Basics', duration: '3 months' }
  ]

  const generateCohortCode = () => {
    const name = cohortName.trim()
    if (!name) return

    // Generate code from first letters of words + year
    const words = name.split(' ').filter(w => w.length > 0)
    const year = new Date().getFullYear()
    const code = words.map(w => w[0].toUpperCase()).join('') + '-' + year
    setCohortCode(code)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!cohortName.trim()) {
      alert('Please enter a cohort name')
      return
    }

    if (!selectedProgramme) {
      alert('Please select a programme')
      return
    }

    if (!startDate) {
      alert('Please select a start date')
      return
    }

    setSubmitting(true)

    try {
      await onCreate({
        name: cohortName,
        code: cohortCode || `COHORT-${Date.now()}`,
        programmeId: selectedProgramme,
        department: department || null,
        startDate,
        endDate: endDate || null,
        description: description || null,
        maxLearners: maxLearners ? parseInt(maxLearners) : null,
        institutionId
      })

      // Reset form
      setCohortName('')
      setCohortCode('')
      setSelectedProgramme('')
      setDepartment('')
      setStartDate('')
      setEndDate('')
      setDescription('')
      setMaxLearners('')

      alert('✅ Cohort created successfully!')
      onClose()
    } catch (error) {
      console.error('Error creating cohort:', error)
      alert('Failed to create cohort. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Create New Cohort</h2>
            <p className="modal-subtitle">Organize learners into cohorts for structured learning</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="info-box" style={{ marginBottom: '24px' }}>
              <strong>What is a cohort?</strong>
              <p style={{ margin: '4px 0 0', fontSize: '13px' }}>
                A cohort is a group of learners who progress through a programme together. This helps with 
                tracking, reporting, and creating a collaborative learning experience.
              </p>
            </div>

            {/* Basic Information */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} />
                Cohort Information
              </h3>

              <div className="form-group">
                <label>Cohort Name *</label>
                <input
                  type="text"
                  value={cohortName}
                  onChange={(e) => setCohortName(e.target.value)}
                  onBlur={generateCohortCode}
                  placeholder="e.g., Q2 2026 Finance Training"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cohort Code</label>
                  <input
                    type="text"
                    value={cohortCode}
                    onChange={(e) => setCohortCode(e.target.value)}
                    placeholder="Auto-generated or enter custom"
                  />
                  <small className="form-hint">Unique identifier for this cohort</small>
                </div>

                <div className="form-group">
                  <label>Max Learners (Optional)</label>
                  <input
                    type="number"
                    value={maxLearners}
                    onChange={(e) => setMaxLearners(e.target.value)}
                    placeholder="No limit"
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this cohort..."
                  rows={3}
                />
              </div>
            </div>

            {/* Programme Selection */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} />
                Learning Programme
              </h3>

              <div className="form-group">
                <label>Select Programme *</label>
                <select
                  value={selectedProgramme}
                  onChange={(e) => setSelectedProgramme(e.target.value)}
                  required
                >
                  <option value="">Choose a programme...</option>
                  {availableProgrammes.map(prog => (
                    <option key={prog.id} value={prog.id}>
                      {prog.name} ({prog.duration})
                    </option>
                  ))}
                </select>
              </div>

              {selectedProgramme && (
                <div className="info-box">
                  <strong>
                    {availableProgrammes.find(p => p.id === selectedProgramme)?.name}
                  </strong>
                  <p style={{ margin: '4px 0 0', fontSize: '13px' }}>
                    Duration: {availableProgrammes.find(p => p.id === selectedProgramme)?.duration}
                  </p>
                </div>
              )}
            </div>

            {/* Department & Schedule */}
            <div>
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={20} />
                Schedule & Organization
              </h3>

              <div className="form-group">
                <label>Department (Optional)</label>
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
                <small className="form-hint">Restrict cohort to specific department</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date (Optional)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                  />
                </div>
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
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Cohort'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateCohortModal

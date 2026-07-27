import React, { useState } from 'react'
import { X, FileText, Download, Calendar, Filter, Users, BookOpen, TrendingUp, Award, CheckSquare } from 'lucide-react'
import './Modal.css'

const ReportBuilderModal = ({ isOpen, onClose, onGenerate }) => {
  const [reportType, setReportType] = useState('learner-progress')
  const [dateRange, setDateRange] = useState('current-month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedDepartments, setSelectedDepartments] = useState([])
  const [selectedProgrammes, setSelectedProgrammes] = useState([])
  const [selectedMetrics, setSelectedMetrics] = useState(['progress', 'completion'])
  const [exportFormat, setExportFormat] = useState('pdf')
  const [generating, setGenerating] = useState(false)

  if (!isOpen) return null

  const departments = ['All Departments', 'Credit & Risk', 'Finance', 'Operations', 'HR & Admin', 'IT']
  const programmes = ['All Programmes', 'Financial Foundation', 'Financial Planning Basics', 'Investment Foundations', 'Capital Markets Essentials', 'Risk Management Basics']
  
  const metrics = [
    { id: 'progress', label: 'Overall Progress', icon: <TrendingUp size={16} /> },
    { id: 'completion', label: 'Completion Rates', icon: <Award size={16} /> },
    { id: 'active-learners', label: 'Active Learners', icon: <Users size={16} /> },
    { id: 'time-spent', label: 'Time Spent', icon: <Calendar size={16} /> },
    { id: 'assessments', label: 'Assessment Scores', icon: <FileText size={16} /> },
    { id: 'certificates', label: 'Certificates Earned', icon: <Award size={16} /> },
  ]

  const reportTypes = [
    { id: 'learner-progress', name: 'Learner Progress Report', description: 'Track individual and group progress' },
    { id: 'programme-analytics', name: 'Programme Analytics', description: 'Programme performance and engagement' },
    { id: 'department-comparison', name: 'Department Comparison', description: 'Compare performance across departments' },
    { id: 'completion-summary', name: 'Completion Summary', description: 'Certificates and course completions' },
    { id: 'attendance-report', name: 'Attendance Report', description: 'Live session attendance tracking' },
    { id: 'custom', name: 'Custom Report', description: 'Build a custom report with selected metrics' },
  ]

  const handleMetricToggle = (metricId) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    )
  }

  const handleDepartmentToggle = (dept) => {
    if (dept === 'All Departments') {
      setSelectedDepartments(prev => prev.length === 0 ? departments : [])
    } else {
      setSelectedDepartments(prev => 
        prev.includes(dept) 
          ? prev.filter(d => d !== dept)
          : [...prev, dept]
      )
    }
  }

  const handleProgrammeToggle = (prog) => {
    if (prog === 'All Programmes') {
      setSelectedProgrammes(prev => prev.length === 0 ? programmes : [])
    } else {
      setSelectedProgrammes(prev => 
        prev.includes(prog) 
          ? prev.filter(p => p !== prog)
          : [...prev, prog]
      )
    }
  }

  const handleGenerate = async () => {
    if (selectedMetrics.length === 0) {
      alert('Please select at least one metric')
      return
    }

    setGenerating(true)

    try {
      const reportConfig = {
        reportType,
        dateRange,
        startDate: dateRange === 'custom' ? startDate : null,
        endDate: dateRange === 'custom' ? endDate : null,
        departments: selectedDepartments.length > 0 ? selectedDepartments : departments,
        programmes: selectedProgrammes.length > 0 ? selectedProgrammes : programmes,
        metrics: selectedMetrics,
        exportFormat
      }

      await onGenerate(reportConfig)
      
      alert(`✅ ${exportFormat.toUpperCase()} report generated successfully!`)
      onClose()
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

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
              background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={28} color="white" />
            </div>
            <div>
              <h2 style={{ marginBottom: '4px' }}>Build Custom Report</h2>
              <p className="modal-subtitle">Configure and generate custom analytics reports</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {/* Step 1: Report Type */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} />
              Step 1: Select Report Type
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {reportTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  style={{
                    padding: '16px',
                    border: `2px solid ${reportType === type.id ? '#9c27b0' : '#e0e0e0'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: reportType === type.id ? '#f3e5f5' : 'white'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                    <input
                      type="radio"
                      name="reportType"
                      checked={reportType === type.id}
                      onChange={() => setReportType(type.id)}
                      style={{ marginTop: '2px' }}
                    />
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>{type.name}</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
                        {type.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Date Range */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} />
              Step 2: Select Date Range
            </h3>

            <div className="form-row">
              <div className="form-group">
                <label>Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="current-month">Current Month</option>
                  <option value="last-month">Last Month</option>
                  <option value="last-3-months">Last 3 Months</option>
                  <option value="last-6-months">Last 6 Months</option>
                  <option value="year-to-date">Year to Date</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {dateRange === 'custom' && (
                <>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Step 3: Filters */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={20} />
              Step 3: Apply Filters
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Department Filter */}
              <div>
                <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600' }}>
                  Filter by Department
                </label>
                <div style={{ 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '8px', 
                  maxHeight: '200px', 
                  overflowY: 'auto',
                  background: 'white'
                }}>
                  {departments.map((dept) => (
                    <div
                      key={dept}
                      style={{
                        padding: '10px 16px',
                        borderBottom: '1px solid #f0f0f0',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onClick={() => handleDepartmentToggle(dept)}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={dept === 'All Departments' ? selectedDepartments.length === 0 : selectedDepartments.includes(dept)}
                          onChange={() => handleDepartmentToggle(dept)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span style={{ fontSize: '14px' }}>{dept}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Programme Filter */}
              <div>
                <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600' }}>
                  Filter by Programme
                </label>
                <div style={{ 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '8px', 
                  maxHeight: '200px', 
                  overflowY: 'auto',
                  background: 'white'
                }}>
                  {programmes.map((prog) => (
                    <div
                      key={prog}
                      style={{
                        padding: '10px 16px',
                        borderBottom: '1px solid #f0f0f0',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onClick={() => handleProgrammeToggle(prog)}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={prog === 'All Programmes' ? selectedProgrammes.length === 0 : selectedProgrammes.includes(prog)}
                          onChange={() => handleProgrammeToggle(prog)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span style={{ fontSize: '14px' }}>{prog}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Select Metrics */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckSquare size={20} />
              Step 4: Select Metrics to Include
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {metrics.map((metric) => (
                <div
                  key={metric.id}
                  onClick={() => handleMetricToggle(metric.id)}
                  style={{
                    padding: '12px 16px',
                    border: `2px solid ${selectedMetrics.includes(metric.id) ? '#9c27b0' : '#e0e0e0'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: selectedMetrics.includes(metric.id) ? '#f3e5f5' : 'white'
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedMetrics.includes(metric.id)}
                      onChange={() => handleMetricToggle(metric.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    {metric.icon}
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>{metric.label}</span>
                  </label>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
              {selectedMetrics.length} metric(s) selected
            </div>
          </div>

          {/* Step 5: Export Format */}
          <div>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={20} />
              Step 5: Choose Export Format
            </h3>

            <div style={{ display: 'flex', gap: '12px' }}>
              {['pdf', 'excel', 'csv'].map((format) => (
                <div
                  key={format}
                  onClick={() => setExportFormat(format)}
                  style={{
                    flex: 1,
                    padding: '16px',
                    border: `2px solid ${exportFormat === format ? '#9c27b0' : '#e0e0e0'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    background: exportFormat === format ? '#f3e5f5' : 'white'
                  }}
                >
                  <label style={{ cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="exportFormat"
                      checked={exportFormat === format}
                      onChange={() => setExportFormat(format)}
                      style={{ marginRight: '8px' }}
                    />
                    <span style={{ fontSize: '15px', fontWeight: '600', textTransform: 'uppercase' }}>
                      {format}
                    </span>
                  </label>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    {format === 'pdf' && 'Formatted document with charts'}
                    {format === 'excel' && 'Spreadsheet with detailed data'}
                    {format === 'csv' && 'Raw data for analysis'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="info-box" style={{ marginTop: '24px' }}>
            <strong>Report Summary:</strong>
            <p style={{ margin: '8px 0 0', fontSize: '13px' }}>
              Generating <strong>{reportTypes.find(t => t.id === reportType)?.name}</strong> for{' '}
              <strong>{dateRange === 'custom' ? `${startDate} to ${endDate}` : dateRange.replace('-', ' ')}</strong> with{' '}
              <strong>{selectedMetrics.length} metric(s)</strong> in <strong>{exportFormat.toUpperCase()}</strong> format.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={generating || selectedMetrics.length === 0}
          >
            <Download size={16} />
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReportBuilderModal

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { 
  ArrowLeft, Upload, Download, FileText, CheckCircle, 
  AlertCircle, Users, ArrowRight, X
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useShoraInstitute } from '../../hooks/useInstitutionalAuth'
import './ImportLearners.css'

const ImportLearners = () => {
  const navigate = useNavigate()
  const { institutionId } = useShoraInstitute()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [csvFile, setCsvFile] = useState(null)
  const [csvData, setCsvData] = useState([])
  const [columnMapping, setColumnMapping] = useState({
    full_name: '',
    email: '',
    department: '',
    employee_id: ''
  })
  const [validationErrors, setValidationErrors] = useState([])
  const [importResults, setImportResults] = useState({
    successful: 0,
    failed: 0,
    errors: []
  })

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'text/csv') {
      setCsvFile(file)
      parseCSV(file)
    } else {
      alert('Please select a valid CSV file')
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'text/csv') {
      setCsvFile(file)
      parseCSV(file)
    } else {
      alert('Please drop a valid CSV file')
    }
  }

  const parseCSV = (file) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target.result
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        alert('CSV file must contain headers and at least one data row')
        return
      }

      const headers = lines[0].split(',').map(h => h.trim())
      const data = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim())
        const row = {}
        headers.forEach((header, i) => {
          row[header] = values[i] || ''
        })
        row._rowNumber = index + 2 // +2 because row 1 is headers
        return row
      })

      setCsvData(data)
      
      // Auto-detect column mappings
      const autoMapping = { ...columnMapping }
      headers.forEach(header => {
        const lowerHeader = header.toLowerCase()
        if (lowerHeader.includes('name') || lowerHeader.includes('full_name')) {
          autoMapping.full_name = header
        } else if (lowerHeader.includes('email')) {
          autoMapping.email = header
        } else if (lowerHeader.includes('department') || lowerHeader.includes('dept')) {
          autoMapping.department = header
        } else if (lowerHeader.includes('employee') || lowerHeader.includes('id')) {
          autoMapping.employee_id = header
        }
      })
      setColumnMapping(autoMapping)
      setCurrentStep(2)
    }
    reader.readAsText(file)
  }

  const downloadTemplate = () => {
    const template = 'Full Name,Email,Department,Employee ID\nJohn Doe,john@example.com,Finance,EMP001\nJane Smith,jane@example.com,IT,EMP002'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'learners_import_template.csv'
    a.click()
  }

  const validateData = () => {
    const errors = []
    const emailSet = new Set()

    csvData.forEach((row, index) => {
      const email = row[columnMapping.email]
      const name = row[columnMapping.full_name]

      // Validate email
      if (!email || !email.includes('@')) {
        errors.push({
          row: row._rowNumber,
          field: 'Email',
          message: 'Invalid or missing email address'
        })
      }

      // Check for duplicate emails
      if (email && emailSet.has(email.toLowerCase())) {
        errors.push({
          row: row._rowNumber,
          field: 'Email',
          message: 'Duplicate email in CSV'
        })
      }
      emailSet.add(email?.toLowerCase())

      // Validate name
      if (!name || name.length < 2) {
        errors.push({
          row: row._rowNumber,
          field: 'Name',
          message: 'Invalid or missing name'
        })
      }
    })

    setValidationErrors(errors)
    if (errors.length === 0) {
      setCurrentStep(3)
    }
  }

  const handleImport = async () => {
    try {
      setLoading(true)
      const results = { successful: 0, failed: 0, errors: [] }

      for (const row of csvData) {
        try {
          const email = row[columnMapping.email]
          const fullName = row[columnMapping.full_name]
          const department = row[columnMapping.department]
          const employeeId = row[columnMapping.employee_id]

          // Check if learner already exists
          const { data: existing } = await supabase
            .from('institution_learners')
            .select('id')
            .eq('email', email)
            .eq('institution_id', institutionId)
            .single()

          if (existing) {
            results.errors.push({
              row: row._rowNumber,
              email: email,
              message: 'Learner already exists'
            })
            results.failed++
            continue
          }

          // Insert learner
          const { error } = await supabase
            .from('institution_learners')
            .insert({
              institution_id: institutionId,
              email: email,
              full_name: fullName,
              department: department,
              employee_id: employeeId,
              status: 'active'
            })

          if (error) throw error
          results.successful++

        } catch (err) {
          results.errors.push({
            row: row._rowNumber,
            email: row[columnMapping.email],
            message: err.message
          })
          results.failed++
        }
      }

      setImportResults(results)
      setCurrentStep(4)

    } catch (err) {
      console.error('Error importing learners:', err)
      alert(`Import failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getCSVHeaders = () => {
    if (csvData.length === 0) return []
    return Object.keys(csvData[0]).filter(k => k !== '_rowNumber')
  }

  return (
    <div className="dashboard-layout">
      <Sidebar type="institutional" />
      <div className="main-content">
        <Header 
          title="Import Learners"
          subtitle="Bulk import learners from a CSV file."
          actions={
            <button className="btn btn-secondary" onClick={() => navigate('/institutional/learners')}>
              <ArrowLeft size={18} />
              Back to Learners
            </button>
          }
        />

        <div className="content-wrapper">
          {/* Progress Steps */}
          <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              {[
                { num: 1, label: 'Upload CSV', icon: Upload },
                { num: 2, label: 'Map Columns', icon: FileText },
                { num: 3, label: 'Preview & Validate', icon: CheckCircle },
                { num: 4, label: 'Import Complete', icon: Users }
              ].map((step, index) => {
                const Icon = step.icon
                const isActive = currentStep === step.num
                const isCompleted = currentStep > step.num
                
                return (
                  <React.Fragment key={step.num}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      opacity: isActive || isCompleted ? 1 : 0.5
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: isCompleted ? '#4CAF50' : isActive ? '#2196F3' : '#E0E0E0',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600'
                      }}>
                        {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Step {step.num}</div>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{step.label}</div>
                      </div>
                    </div>
                    {index < 3 && (
                      <ArrowRight size={20} style={{ color: '#BDBDBD', flexShrink: 0 }} />
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </div>

          {/* Step 1: Upload CSV */}
          {currentStep === 1 && (
            <div className="card">
              <h3 style={{ marginBottom: '24px' }}>Upload CSV File</h3>

              <div 
                className="csv-upload-area"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('csv-file-input').click()}
              >
                <Upload size={48} color="#2196F3" />
                <h4>Drag and drop your CSV file here</h4>
                <p>or click to browse</p>
                <input
                  id="csv-file-input"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="btn btn-secondary" onClick={downloadTemplate}>
                  <Download size={18} />
                  Download CSV Template
                </button>
                {csvFile && (
                  <div style={{ color: '#4CAF50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={20} />
                    File selected: {csvFile.name}
                  </div>
                )}
              </div>

              <div className="card" style={{ marginTop: '24px', background: '#F5F5F5' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>📋 CSV Requirements</h4>
                <ul style={{ fontSize: '13px', color: '#666', lineHeight: '1.8', paddingLeft: '20px' }}>
                  <li>File must be in CSV format (.csv)</li>
                  <li>First row should contain column headers</li>
                  <li>Required fields: Full Name, Email</li>
                  <li>Optional fields: Department, Employee ID</li>
                  <li>Email addresses must be unique</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 2: Map Columns */}
          {currentStep === 2 && (
            <div className="card">
              <h3 style={{ marginBottom: '24px' }}>Map CSV Columns</h3>
              <p style={{ color: '#666', marginBottom: '24px' }}>
                Match your CSV columns to our learner fields. {csvData.length} rows detected.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <select
                    value={columnMapping.full_name}
                    onChange={(e) => setColumnMapping({ ...columnMapping, full_name: e.target.value })}
                    required
                  >
                    <option value="">Select column</option>
                    {getCSVHeaders().map(header => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <select
                    value={columnMapping.email}
                    onChange={(e) => setColumnMapping({ ...columnMapping, email: e.target.value })}
                    required
                  >
                    <option value="">Select column</option>
                    {getCSVHeaders().map(header => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <select
                    value={columnMapping.department}
                    onChange={(e) => setColumnMapping({ ...columnMapping, department: e.target.value })}
                  >
                    <option value="">Select column (optional)</option>
                    {getCSVHeaders().map(header => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Employee ID</label>
                  <select
                    value={columnMapping.employee_id}
                    onChange={(e) => setColumnMapping({ ...columnMapping, employee_id: e.target.value })}
                  >
                    <option value="">Select column (optional)</option>
                    {getCSVHeaders().map(header => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                <button className="btn btn-secondary" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft size={18} />
                  Back
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={validateData}
                  disabled={!columnMapping.full_name || !columnMapping.email}
                >
                  Next: Preview
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Preview & Validate */}
          {currentStep === 3 && (
            <div className="card">
              <h3 style={{ marginBottom: '24px' }}>Preview & Validate</h3>

              {validationErrors.length > 0 ? (
                <div className="card" style={{ background: '#FFEBEE', border: '1px solid #D32F2F', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <AlertCircle size={24} color="#D32F2F" />
                    <h4 style={{ margin: 0, color: '#D32F2F' }}>
                      {validationErrors.length} Validation Error{validationErrors.length > 1 ? 's' : ''} Found
                    </h4>
                  </div>
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {validationErrors.map((error, index) => (
                      <div key={index} style={{ fontSize: '13px', color: '#666', padding: '4px 0' }}>
                        Row {error.row}: {error.field} - {error.message}
                      </div>
                    ))}
                  </div>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    style={{ marginTop: '16px' }}
                    onClick={() => setCurrentStep(1)}
                  >
                    Fix CSV and Re-upload
                  </button>
                </div>
              ) : (
                <>
                  <div className="card" style={{ background: '#E8F5E9', border: '1px solid #4CAF50', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <CheckCircle size={24} color="#4CAF50" />
                      <div>
                        <h4 style={{ margin: 0, color: '#2E7D32' }}>Validation Passed</h4>
                        <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '13px' }}>
                          {csvData.length} learner{csvData.length > 1 ? 's' : ''} ready to import
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Row</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Department</th>
                          <th>Employee ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvData.slice(0, 5).map((row, index) => (
                          <tr key={index}>
                            <td>{row._rowNumber}</td>
                            <td>{row[columnMapping.full_name]}</td>
                            <td>{row[columnMapping.email]}</td>
                            <td>{row[columnMapping.department] || '—'}</td>
                            <td>{row[columnMapping.employee_id] || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {csvData.length > 5 && (
                      <p style={{ textAlign: 'center', color: '#666', fontSize: '13px', marginTop: '12px' }}>
                        Showing first 5 of {csvData.length} rows
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary" onClick={() => setCurrentStep(2)}>
                      <ArrowLeft size={18} />
                      Back
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={handleImport}
                      disabled={loading}
                    >
                      <Upload size={18} />
                      {loading ? 'Importing...' : `Import ${csvData.length} Learners`}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 4: Import Complete */}
          {currentStep === 4 && (
            <div className="card">
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <CheckCircle size={64} color="#4CAF50" style={{ marginBottom: '24px' }} />
                <h2 style={{ marginBottom: '16px' }}>Import Complete!</h2>
                <div style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
                  <p><strong style={{ color: '#4CAF50', fontSize: '24px' }}>{importResults.successful}</strong> learners imported successfully</p>
                  {importResults.failed > 0 && (
                    <p><strong style={{ color: '#D32F2F', fontSize: '24px' }}>{importResults.failed}</strong> failed</p>
                  )}
                </div>

                {importResults.errors.length > 0 && (
                  <div className="card" style={{ background: '#FFF3E0', border: '1px solid #FF9800', marginBottom: '24px', textAlign: 'left' }}>
                    <h4 style={{ marginBottom: '12px' }}>Import Errors:</h4>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {importResults.errors.map((error, index) => (
                        <div key={index} style={{ fontSize: '13px', color: '#666', padding: '4px 0' }}>
                          Row {error.row} ({error.email}): {error.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setCsvFile(null)
                      setCsvData([])
                      setCurrentStep(1)
                      setValidationErrors([])
                      setImportResults({ successful: 0, failed: 0, errors: [] })
                    }}
                  >
                    Import More Learners
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/institutional/learners')}
                  >
                    View Learners
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImportLearners

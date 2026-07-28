import React, { useState } from 'react'
import { X, Upload, Download, AlertCircle, CheckCircle, FileText, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useShoraInstitute } from '../../hooks/useInstitutionalAuth'
import { useAuth } from '../../contexts/AuthContext'
import './Modal.css'

const BulkImportModal = ({ isOpen, onClose, onSuccess }) => {
  const { institutionId } = useShoraInstitute()
  const { user } = useAuth()
  
  const [step, setStep] = useState(1) // 1: Upload, 2: Preview, 3: Confirm
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [parsedData, setParsedData] = useState([])
  const [validRows, setValidRows] = useState([])
  const [invalidRows, setInvalidRows] = useState([])

  const downloadTemplate = () => {
    const csvContent = [
      ['Name', 'Email', 'Employee ID', 'Department', 'Job Title'],
      ['John Doe', 'john.doe@company.com', 'EMP-001', 'Finance', 'Financial Analyst'],
      ['Jane Smith', 'jane.smith@company.com', 'EMP-002', 'IT', 'Software Engineer'],
      ['Bob Johnson', 'bob.johnson@company.com', 'EMP-003', 'HR', 'HR Manager']
    ]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'employee_import_template.csv'
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please upload a CSV file')
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row')
    }

    // Parse header
    const header = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    
    // Validate required columns
    const requiredColumns = ['Name', 'Email']
    const missingColumns = requiredColumns.filter(col => !header.includes(col))
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`)
    }

    // Parse data rows
    const data = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      const row = {}
      header.forEach((col, index) => {
        row[col] = values[index] || ''
      })
      row._lineNumber = i + 1
      data.push(row)
    }

    return data
  }

  const validateRows = async (rows) => {
    const valid = []
    const invalid = []

    // Check for duplicate emails in file
    const emailCount = {}
    rows.forEach(row => {
      const email = row.Email?.toLowerCase().trim()
      emailCount[email] = (emailCount[email] || 0) + 1
    })

    // Check existing invitations
    const emails = rows.map(row => row.Email?.toLowerCase().trim()).filter(Boolean)
    const { data: existingInvitations } = await supabase
      .from('learner_invitations')
      .select('email, status')
      .eq('institution_id', institutionId)
      .in('email', emails)

    const existingEmails = existingInvitations ? existingInvitations.map(inv => inv.email) : []

    rows.forEach(row => {
      const errors = []
      const email = row.Email?.toLowerCase().trim()

      // Validate name
      if (!row.Name || row.Name.trim() === '') {
        errors.push('Name is required')
      }

      // Validate email
      if (!email) {
        errors.push('Email is required')
      } else if (!validateEmail(email)) {
        errors.push('Invalid email format')
      } else if (emailCount[email] > 1) {
        errors.push('Duplicate email in file')
      } else if (existingEmails.includes(email)) {
        errors.push('Already invited')
      }

      if (errors.length > 0) {
        invalid.push({ ...row, errors })
      } else {
        valid.push(row)
      }
    })

    return { valid, invalid }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const text = await file.text()
      const rows = parseCSV(text)

      if (rows.length > 500) {
        setError('Maximum 500 rows allowed per import')
        setLoading(false)
        return
      }

      setParsedData(rows)

      // Validate rows
      const { valid, invalid } = await validateRows(rows)
      setValidRows(valid)
      setInvalidRows(invalid)

      // Move to preview step
      setStep(2)

    } catch (err) {
      console.error('Error parsing CSV:', err)
      setError(err.message || 'Failed to parse CSV file')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (validRows.length === 0) {
      setError('No valid rows to import')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create invitations
      const invitations = validRows.map(row => ({
        institution_id: institutionId,
        email: row.Email.toLowerCase().trim(),
        employee_name: row.Name.trim(),
        employee_id: row['Employee ID']?.trim() || null,
        department_id: null, // TODO: Map department name to ID
        job_title: row['Job Title']?.trim() || null,
        invited_by: user.id,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }))

      const { data, error: insertError } = await supabase
        .from('learner_invitations')
        .insert(invitations)
        .select()

      if (insertError) throw insertError

      setSuccess(`Successfully imported ${data.length} employee${data.length > 1 ? 's' : ''}`)
      setStep(3)

      // Notify parent
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 2000)
      }

    } catch (err) {
      console.error('Error importing data:', err)
      setError(err.message || 'Failed to import employees')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep(1)
    setFile(null)
    setParsedData([])
    setValidRows([])
    setInvalidRows([])
    setError(null)
    setSuccess(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-content">
            <Upload size={24} />
            <div>
              <h2 className="modal-title">Bulk Import Employees</h2>
              <p className="modal-subtitle">
                {step === 1 && 'Upload CSV file with employee data'}
                {step === 2 && 'Review and validate data before importing'}
                {step === 3 && 'Import complete'}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="modal-close-button">
            <X size={20} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="modal-steps">
          <div className={`modal-step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <span>Upload</span>
          </div>
          <div className="step-line" />
          <div className={`modal-step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <span>Preview</span>
          </div>
          <div className="step-line" />
          <div className={`modal-step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span>Complete</span>
          </div>
        </div>

        {/* Content */}
        <div className="modal-body">
          {/* Alerts */}
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <CheckCircle size={18} />
              <span>{success}</span>
            </div>
          )}

          {/* Step 1: Upload */}
          {step === 1 && (
            <div>
              <div className="info-box" style={{ marginBottom: '24px' }}>
                <FileText size={20} />
                <div>
                  <p><strong>CSV Format Requirements:</strong></p>
                  <ul style={{ marginTop: '8px', marginLeft: '20px' }}>
                    <li>Required columns: <strong>Name, Email</strong></li>
                    <li>Optional columns: Employee ID, Department, Job Title</li>
                    <li>Maximum 500 rows per import</li>
                    <li>One employee per row</li>
                  </ul>
                </div>
              </div>

              <button 
                onClick={downloadTemplate}
                className="btn btn-secondary"
                style={{ marginBottom: '24px', width: '100%' }}
              >
                <Download size={18} />
                Download CSV Template
              </button>

              <div className="upload-area">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  id="csv-upload"
                  style={{ display: 'none' }}
                />
                <label htmlFor="csv-upload" className="upload-label">
                  <Upload size={48} style={{ marginBottom: '12px', color: '#999' }} />
                  <p style={{ fontSize: '16px', fontWeight: 500, marginBottom: '4px' }}>
                    {file ? file.name : 'Click to upload CSV file'}
                  </p>
                  <p style={{ fontSize: '14px', color: '#666' }}>
                    or drag and drop
                  </p>
                </label>
              </div>

              <div className="modal-actions">
                <button onClick={handleClose} className="btn btn-secondary">
                  Cancel
                </button>
                <button 
                  onClick={handleUpload}
                  className="btn btn-primary"
                  disabled={!file || loading}
                >
                  {loading ? 'Processing...' : 'Upload & Validate'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 2 && (
            <div>
              <div className="import-summary">
                <div className="summary-card success">
                  <CheckCircle size={24} />
                  <div>
                    <div className="summary-number">{validRows.length}</div>
                    <div className="summary-label">Valid Rows</div>
                  </div>
                </div>
                
                <div className="summary-card error">
                  <AlertCircle size={24} />
                  <div>
                    <div className="summary-number">{invalidRows.length}</div>
                    <div className="summary-label">Invalid Rows</div>
                  </div>
                </div>
                
                <div className="summary-card">
                  <FileText size={24} />
                  <div>
                    <div className="summary-number">{parsedData.length}</div>
                    <div className="summary-label">Total Rows</div>
                  </div>
                </div>
              </div>

              {invalidRows.length > 0 && (
                <div className="alert alert-warning" style={{ marginBottom: '16px' }}>
                  <AlertCircle size={18} />
                  <span>{invalidRows.length} row{invalidRows.length > 1 ? 's' : ''} will be skipped due to validation errors</span>
                </div>
              )}

              {/* Preview Table */}
              <div className="preview-table-container">
                <table className="preview-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Employee ID</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validRows.slice(0, 10).map((row, index) => (
                      <tr key={index} className="valid-row">
                        <td>{row._lineNumber}</td>
                        <td>{row.Name}</td>
                        <td>{row.Email}</td>
                        <td>{row['Employee ID'] || '-'}</td>
                        <td>
                          <span className="status-badge success">
                            <Check size={14} />
                            Valid
                          </span>
                        </td>
                      </tr>
                    ))}
                    {invalidRows.slice(0, 5).map((row, index) => (
                      <tr key={`invalid-${index}`} className="invalid-row">
                        <td>{row._lineNumber}</td>
                        <td>{row.Name || '-'}</td>
                        <td>{row.Email || '-'}</td>
                        <td>{row['Employee ID'] || '-'}</td>
                        <td>
                          <span className="status-badge error" title={row.errors.join(', ')}>
                            <AlertCircle size={14} />
                            {row.errors[0]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(validRows.length + invalidRows.length) > 15 && (
                  <p style={{ textAlign: 'center', padding: '12px', color: '#666', fontSize: '14px' }}>
                    Showing first 15 rows. Total: {parsedData.length} rows
                  </p>
                )}
              </div>

              <div className="modal-actions">
                <button onClick={() => setStep(1)} className="btn btn-secondary">
                  Back
                </button>
                <button 
                  onClick={handleImport}
                  className="btn btn-primary"
                  disabled={validRows.length === 0 || loading}
                >
                  {loading ? 'Importing...' : `Import ${validRows.length} Employee${validRows.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Complete */}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                background: '#10B981', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <CheckCircle size={48} color="white" />
              </div>
              
              <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>Import Successful!</h3>
              <p style={{ color: '#666', marginBottom: '32px' }}>
                {validRows.length} employee{validRows.length !== 1 ? 's have' : ' has'} been invited successfully.
                <br />
                They will receive invitation emails shortly.
              </p>

              <button onClick={handleClose} className="btn btn-primary">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BulkImportModal

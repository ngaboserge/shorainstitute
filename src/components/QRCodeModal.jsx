import React, { useState, useEffect, useRef } from 'react'
import { X, Download, Copy, CheckCircle } from 'lucide-react'
import QRCode from 'qrcode'
import './QRCodeModal.css'

const QRCodeModal = ({ seminar, onClose }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef(null)

  // Generate the direct registration URL using production site URL
  const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin
  const seminarUrl = `${siteUrl}/seminar/${seminar.id}/register`

  useEffect(() => {
    generateQRCode()
  }, [seminar.id])

  const generateQRCode = async () => {
    try {
      // Generate QR code on canvas
      const canvas = canvasRef.current
      await QRCode.toCanvas(canvas, seminarUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#0B4F9F',
          light: '#FFFFFF'
        }
      })

      // Also get data URL for download
      const dataUrl = await QRCode.toDataURL(seminarUrl, {
        width: 800,
        margin: 2,
        color: {
          dark: '#0B4F9F',
          light: '#FFFFFF'
        }
      })
      setQrCodeUrl(dataUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.download = `seminar-qr-${seminar.id}.png`
    link.href = qrCodeUrl
    link.click()
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(seminarUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content qr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Seminar QR Code</h2>
            <p className="modal-subtitle">{seminar.title}</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body qr-modal-body">
          {/* QR Code Display */}
          <div className="qr-code-container">
            <canvas ref={canvasRef} />
            <p className="qr-code-help">
              Scan this QR code to go directly to the seminar registration page
            </p>
          </div>

          {/* URL Display */}
          <div className="url-section">
            <label>Direct Registration URL</label>
            <div className="url-display">
              <input 
                type="text" 
                value={seminarUrl} 
                readOnly 
                className="url-input"
              />
              <button 
                className="btn btn-secondary btn-icon"
                onClick={handleCopyUrl}
                title="Copy URL"
              >
                {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
              </button>
            </div>
            {copied && (
              <p className="success-message">URL copied to clipboard!</p>
            )}
          </div>

          {/* Instructions */}
          <div className="instructions-section">
            <h3>How to Use</h3>
            <ol>
              <li>Download the QR code using the button below</li>
              <li>Print it on posters, flyers, or display it on screens</li>
              <li>When scanned, users go directly to the registration form</li>
              <li>If not logged in, they'll signup/login first</li>
              <li>Then immediately see the registration questionnaire</li>
              <li>After registration, they can discover other seminars</li>
            </ol>
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button className="btn btn-primary" onClick={handleDownload}>
              <Download size={18} />
              Download QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRCodeModal

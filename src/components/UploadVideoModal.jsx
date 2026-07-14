/**
 * Video Upload Modal Component
 * 
 * Allows trainers to:
 * 1. Upload videos directly to the platform (Supabase Storage)
 * 2. OR provide a YouTube video link
 * 
 * Features:
 * - Upload progress indicator
 * - File size validation
 * - YouTube URL validation
 * - Automatic metadata extraction
 */

import React, { useState } from 'react'
import { Upload, Youtube, X, Check, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import './UploadVideoModal.css'

const UploadVideoModal = ({ 
  lessonId, 
  courseId,
  instructorId,
  onUploadComplete, 
  onClose 
}) => {
  const [uploadMethod, setUploadMethod] = useState(null) // 'upload' or 'youtube'
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [youtubeUrl, setYoutubeUrl] = useState('')

  // OPTION 1: Direct File Upload
  const handleFileUpload = async (file) => {
    setError(null)
    
    // Validate file
    if (!file) return
    
    // Check file type
    if (!file.type.startsWith('video/')) {
      setError('Please upload a valid video file (MP4, MOV, AVI, etc.)')
      return
    }
    
    // Check file size (limit to 500MB)
    const maxSize = 500 * 1024 * 1024 // 500MB
    if (file.size > maxSize) {
      setError('File is too large. Maximum size is 500MB.')
      return
    }
    
    setUploading(true)
    setProgress(0)
    
    try {
      // 1. Create a unique file path
      const fileExt = file.name.split('.').pop()
      const fileName = `${lessonId}-${Date.now()}.${fileExt}`
      const filePath = `lessons/${courseId}/${fileName}`
      
      // 2. Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('course-videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100)
            setProgress(percent)
          }
        })
      
      if (uploadError) throw uploadError
      
      // 3. Get public URL
      const { data: urlData } = supabase.storage
        .from('course-videos')
        .getPublicUrl(filePath)
      
      // 4. Save video info to lesson
      const { error: updateError } = await supabase
        .from('lessons')
        .update({
          video_type: 'supabase',
          video_url: urlData.publicUrl,
          supabase_storage_path: filePath
        })
        .eq('id', lessonId)
      
      if (updateError) throw updateError
      
      // 5. Create upload record
      await supabase
        .from('video_uploads')
        .insert({
          lesson_id: lessonId,
          instructor_id: instructorId,
          filename: file.name,
          file_size_bytes: file.size,
          mime_type: file.type,
          storage_path: filePath,
          upload_status: 'ready'
        })
      
      setUploading(false)
      onUploadComplete?.()
      
    } catch (error) {
      console.error('Upload error:', error)
      setError(error.message || 'Upload failed. Please try again.')
      setUploading(false)
    }
  }

  // OPTION 2: YouTube URL
  const handleYouTubeSubmit = async () => {
    setError(null)
    
    if (!youtubeUrl.trim()) {
      setError('Please enter a YouTube URL')
      return
    }
    
    // Extract YouTube video ID
    const videoId = extractYouTubeId(youtubeUrl)
    
    if (!videoId) {
      setError('Invalid YouTube URL. Please use format: https://youtube.com/watch?v=...')
      return
    }
    
    setUploading(true)
    
    try {
      // Fetch video duration from YouTube (using a simple approach)
      // Note: For production, you'd want to use YouTube Data API v3
      // For now, we'll set a default duration and trainers can update it manually
      
      const durationSeconds = 600 // Default 10 minutes - trainers can edit this
      
      // Save to database
      const { error: updateError } = await supabase
        .from('lessons')
        .update({
          video_type: 'youtube',
          video_id: videoId,
          video_url: youtubeUrl,
          duration_seconds: durationSeconds
        })
        .eq('id', lessonId)
      
      if (updateError) throw updateError
      
      setUploading(false)
      alert('Video added! Note: Duration set to 10 minutes by default. You can update it in the lesson details.')
      onUploadComplete?.()
      
    } catch (error) {
      console.error('YouTube link save error:', error)
      setError('Failed to save YouTube link. Please try again.')
      setUploading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Video to Lesson</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {!uploadMethod && !uploading && (
            <div className="upload-method-selector">
              <button 
                className="method-card"
                onClick={() => setUploadMethod('upload')}
              >
                <div className="method-icon">
                  <Upload size={48} />
                </div>
                <h4>Upload Video File</h4>
                <p>Upload from your computer (MP4, MOV, AVI)</p>
                <span className="badge badge-blue">Direct Upload</span>
              </button>
              
              <button 
                className="method-card"
                onClick={() => setUploadMethod('youtube')}
              >
                <div className="method-icon youtube-icon">
                  <Youtube size={48} />
                </div>
                <h4>YouTube Video</h4>
                <p>Use existing YouTube video link</p>
                <span className="badge badge-success">FREE Hosting</span>
              </button>
            </div>
          )}
          
          {uploadMethod === 'upload' && !uploading && (
            <div className="file-upload-area">
              <div className="upload-dropzone">
                <Upload size={48} />
                <h4>Choose Video File</h4>
                <p>Drag and drop or click to browse</p>
                <p className="upload-limit">Maximum file size: 500MB</p>
                <input 
                  type="file" 
                  accept="video/*"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                  className="file-input"
                />
              </div>
              <button 
                className="btn btn-outline btn-full"
                onClick={() => setUploadMethod(null)}
              >
                ← Back to Options
              </button>
            </div>
          )}
          
          {uploadMethod === 'youtube' && !uploading && (
            <div className="youtube-input-container">
              <div className="youtube-preview">
                <Youtube size={64} />
                <h4>Paste YouTube Video URL</h4>
              </div>
              
              <input 
                type="text" 
                className="youtube-input"
                placeholder="https://youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
              
              <div className="help-text">
                <AlertCircle size={16} />
                <p>Tip: Set video to "Unlisted" in YouTube for privacy</p>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn btn-outline"
                  onClick={() => setUploadMethod(null)}
                >
                  ← Back
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleYouTubeSubmit}
                >
                  <Check size={18} />
                  Save Video Link
                </button>
              </div>
            </div>
          )}
          
          {uploading && uploadMethod === 'upload' && (
            <div className="upload-progress-container">
              <div className="upload-icon-animated">
                <Upload size={48} />
              </div>
              <h4>Uploading Video...</h4>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill" 
                  style={{width: `${progress}%`}}
                />
              </div>
              <p className="progress-text">{progress}% complete</p>
              <p className="progress-subtext">Please don't close this window</p>
            </div>
          )}
          
          {uploading && uploadMethod === 'youtube' && (
            <div className="upload-progress-container">
              <div className="upload-icon-animated">
                <Youtube size={48} />
              </div>
              <h4>Saving YouTube Link...</h4>
              <div className="spinner-loader"></div>
            </div>
          )}

          {error && (
            <div className="error-message">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Extract YouTube video ID from various URL formats
 */
function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  
  return null
}

export default UploadVideoModal

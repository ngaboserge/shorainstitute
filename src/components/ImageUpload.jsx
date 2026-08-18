import React, { useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { supabase } from '../lib/supabase'

const ImageUpload = ({ currentImage, onImageUploaded, bucket = 'avatars', folder = 'trainers' }) => {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentImage)

  const handleFileSelect = async (e) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB')
        return
      }

      setUploading(true)

      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      setPreview(publicUrl)
      onImageUploaded(publicUrl)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onImageUploaded(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {preview ? (
        <div style={{ position: 'relative', width: '120px', height: '120px' }}>
          <img
            src={preview}
            alt="Preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '50%',
              border: '3px solid #e5e7eb'
            }}
          />
          <button
            onClick={handleRemove}
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#ef4444',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Remove image"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: '2px dashed #d1d5db',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            background: '#f9fafb'
          }}
          onClick={() => document.getElementById('image-upload-input').click()}
        >
          {uploading ? (
            <div>Uploading...</div>
          ) : (
            <>
              <ImageIcon size={32} color="#9ca3af" />
              <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>Click to upload</span>
            </>
          )}
        </div>
      )}
      
      <input
        id="image-upload-input"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={uploading}
      />
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          className="btn btn-sm btn-secondary"
          onClick={() => document.getElementById('image-upload-input').click()}
          disabled={uploading}
        >
          <Upload size={14} />
          {uploading ? 'Uploading...' : preview ? 'Change Photo' : 'Upload Photo'}
        </button>
      </div>
      
      <p style={{ fontSize: '12px', color: '#6b7280' }}>
        JPG, PNG or GIF. Max 5MB.
      </p>
    </div>
  )
}

export default ImageUpload

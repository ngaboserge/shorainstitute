import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, Upload, X, Plus, ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import './CreateCourse.css'

const CreateCourse = () => {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  
  // Use authenticated user ID
  const instructorId = user?.id
  
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    language: 'English',
    price: 0,
    currency: 'RWF',
    thumbnail: null,
    learningObjectives: [''],
    requirements: [''],
    targetAudience: ''
  })

  const [errors, setErrors] = useState({})

  const categories = [
    'Finance & Investment',
    'Business & Entrepreneurship',
    'Technology & Programming',
    'Marketing & Sales',
    'Personal Development',
    'Design & Creative',
    'Health & Wellness',
    'Language Learning',
    'Academic',
    'Other'
  ]

  const levels = [
    { value: 'beginner', label: 'Beginner', description: 'No prior experience needed' },
    { value: 'intermediate', label: 'Intermediate', description: 'Some experience required' },
    { value: 'advanced', label: 'Advanced', description: 'Extensive experience needed' }
  ]

  const currencies = [
    { value: 'RWF', label: 'RWF (Rwandan Franc)', symbol: 'FRw' },
    { value: 'USD', label: 'USD (US Dollar)', symbol: '$' },
    { value: 'EUR', label: 'EUR (Euro)', symbol: '€' }
  ]

  // Handle input changes
  const handleChange = (field, value) => {
    setCourseData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  // Handle learning objectives
  const addLearningObjective = () => {
    setCourseData(prev => ({
      ...prev,
      learningObjectives: [...prev.learningObjectives, '']
    }))
  }

  const updateLearningObjective = (index, value) => {
    const updated = [...courseData.learningObjectives]
    updated[index] = value
    setCourseData(prev => ({ ...prev, learningObjectives: updated }))
  }

  const removeLearningObjective = (index) => {
    if (courseData.learningObjectives.length > 1) {
      const updated = courseData.learningObjectives.filter((_, i) => i !== index)
      setCourseData(prev => ({ ...prev, learningObjectives: updated }))
    }
  }

  // Handle requirements
  const addRequirement = () => {
    setCourseData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }))
  }

  const updateRequirement = (index, value) => {
    const updated = [...courseData.requirements]
    updated[index] = value
    setCourseData(prev => ({ ...prev, requirements: updated }))
  }

  const removeRequirement = (index) => {
    if (courseData.requirements.length > 1) {
      const updated = courseData.requirements.filter((_, i) => i !== index)
      setCourseData(prev => ({ ...prev, requirements: updated }))
    }
  }

  // Handle thumbnail upload
  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, thumbnail: 'Please upload an image file' }))
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, thumbnail: 'Image must be less than 5MB' }))
        return
      }

      setCourseData(prev => ({ ...prev, thumbnail: file }))
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Validate form
  const validate = () => {
    const newErrors = {}

    if (!courseData.title.trim()) {
      newErrors.title = 'Course title is required'
    } else if (courseData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters'
    }

    if (!courseData.description.trim()) {
      newErrors.description = 'Course description is required'
    } else if (courseData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters'
    }

    if (!courseData.category) {
      newErrors.category = 'Please select a category'
    }

    if (courseData.price < 0) {
      newErrors.price = 'Price cannot be negative'
    }

    const validObjectives = courseData.learningObjectives.filter(obj => obj.trim())
    if (validObjectives.length === 0) {
      newErrors.learningObjectives = 'Add at least one learning objective'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Upload thumbnail to Supabase Storage
  const uploadThumbnail = async (courseId) => {
    if (!courseData.thumbnail) return null

    try {
      const fileExt = courseData.thumbnail.name.split('.').pop()
      const fileName = `${courseId}.${fileExt}`
      const filePath = `thumbnails/${fileName}`

      const { data, error } = await supabase.storage
        .from('course-thumbnails')
        .upload(filePath, courseData.thumbnail, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) throw error

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('course-thumbnails')
        .getPublicUrl(filePath)

      return urlData.publicUrl
    } catch (error) {
      console.error('Error uploading thumbnail:', error)
      return null
    }
  }

  // Save course as draft
  const saveDraft = async () => {
    if (!validate()) return

    setLoading(true)
    try {
      // Insert course
      const { data: course, error } = await supabase
        .from('courses')
        .insert({
          title: courseData.title,
          description: courseData.description,
          instructor_id: instructorId,
          instructor_name: profile?.full_name || 'Instructor',
          category: courseData.category,
          level: courseData.level,
          language: courseData.language,
          price: courseData.price,
          currency: courseData.currency,
          status: 'draft'
        })
        .select()
        .single()

      if (error) throw error

      // Upload thumbnail if provided
      if (courseData.thumbnail) {
        const thumbnailUrl = await uploadThumbnail(course.id)
        if (thumbnailUrl) {
          await supabase
            .from('courses')
            .update({ thumbnail_url: thumbnailUrl })
            .eq('id', course.id)
        }
      }

      alert('Course saved as draft! Now add lessons.')
      navigate(`/trainer/courses/${course.id}/manage-lessons`)
    } catch (error) {
      console.error('Error saving course:', error)
      alert('Failed to save course. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-course-page">
      <div className="create-course-header">
        <button className="back-btn" onClick={() => navigate('/trainer/dashboard')}>
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
        <h1>Create New Course</h1>
        <p className="subtitle">Fill in the details to create your course. You'll add lessons in the next step.</p>
      </div>

      <div className="create-course-content">
        <div className="course-form">
          {/* Basic Information */}
          <section className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label className="required">Course Title</label>
              <input
                type="text"
                placeholder="e.g., Complete Guide to Financial Investment"
                value={courseData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={errors.title ? 'error' : ''}
                maxLength={100}
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
              <span className="char-count">{courseData.title.length}/100</span>
            </div>

            <div className="form-group">
              <label className="required">Course Description</label>
              <textarea
                placeholder="Describe what students will learn in this course..."
                value={courseData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className={errors.description ? 'error' : ''}
                rows={6}
                maxLength={2000}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
              <span className="char-count">{courseData.description.length}/2000</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="required">Category</label>
                <select
                  value={courseData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className={errors.category ? 'error' : ''}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <span className="error-message">{errors.category}</span>}
              </div>

              <div className="form-group">
                <label>Language</label>
                <select
                  value={courseData.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                >
                  <option value="English">English</option>
                  <option value="Kinyarwanda">Kinyarwanda</option>
                  <option value="French">French</option>
                  <option value="Swahili">Swahili</option>
                </select>
              </div>
            </div>
          </section>

          {/* Level */}
          <section className="form-section">
            <h2>Course Level</h2>
            <div className="level-selector">
              {levels.map(level => (
                <div
                  key={level.value}
                  className={`level-card ${courseData.level === level.value ? 'selected' : ''}`}
                  onClick={() => handleChange('level', level.value)}
                >
                  <h3>{level.label}</h3>
                  <p>{level.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Learning Objectives */}
          <section className="form-section">
            <h2>What Students Will Learn</h2>
            <p className="section-description">List the key learning outcomes for this course</p>
            
            {courseData.learningObjectives.map((objective, index) => (
              <div key={index} className="dynamic-input-group">
                <input
                  type="text"
                  placeholder={`Learning objective ${index + 1}`}
                  value={objective}
                  onChange={(e) => updateLearningObjective(index, e.target.value)}
                />
                {courseData.learningObjectives.length > 1 && (
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeLearningObjective(index)}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
            {errors.learningObjectives && <span className="error-message">{errors.learningObjectives}</span>}
            
            <button type="button" className="add-more-btn" onClick={addLearningObjective}>
              <Plus size={18} />
              <span>Add Learning Objective</span>
            </button>
          </section>

          {/* Requirements */}
          <section className="form-section">
            <h2>Requirements</h2>
            <p className="section-description">What prerequisites should students have?</p>
            
            {courseData.requirements.map((requirement, index) => (
              <div key={index} className="dynamic-input-group">
                <input
                  type="text"
                  placeholder={`Requirement ${index + 1} (optional)`}
                  value={requirement}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                />
                {courseData.requirements.length > 1 && (
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeRequirement(index)}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
            
            <button type="button" className="add-more-btn" onClick={addRequirement}>
              <Plus size={18} />
              <span>Add Requirement</span>
            </button>
          </section>

          {/* Pricing */}
          <section className="form-section">
            <h2>Pricing</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>Price</label>
                <div className="price-input-group">
                  <select
                    value={courseData.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
                    className="currency-select"
                  >
                    {currencies.map(curr => (
                      <option key={curr.value} value={curr.value}>
                        {curr.symbol}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="0"
                    value={courseData.price}
                    onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                    className={errors.price ? 'error' : ''}
                    min="0"
                    step="1000"
                  />
                </div>
                {errors.price && <span className="error-message">{errors.price}</span>}
                <p className="help-text">Set to 0 for a free course</p>
              </div>
            </div>
          </section>

          {/* Thumbnail */}
          <section className="form-section">
            <h2>Course Thumbnail</h2>
            <p className="section-description">Upload an image that represents your course (recommended: 1280x720px)</p>
            
            <div className="thumbnail-upload-area">
              {thumbnailPreview ? (
                <div className="thumbnail-preview">
                  <img src={thumbnailPreview} alt="Course thumbnail" />
                  <button
                    type="button"
                    className="remove-thumbnail-btn"
                    onClick={() => {
                      setThumbnailPreview(null)
                      setCourseData(prev => ({ ...prev, thumbnail: null }))
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <label className="upload-placeholder">
                  <Upload size={48} />
                  <p>Click to upload thumbnail</p>
                  <p className="upload-specs">JPG, PNG (max 5MB)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
            {errors.thumbnail && <span className="error-message">{errors.thumbnail}</span>}
          </section>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/trainer/dashboard')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={saveDraft}
              disabled={loading}
            >
              {loading ? (
                <>Saving...</>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save & Continue to Lessons</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview Sidebar */}
        <div className="course-preview">
          <h3>Course Preview</h3>
          <div className="preview-card">
            {thumbnailPreview ? (
              <img src={thumbnailPreview} alt="Preview" className="preview-thumbnail" />
            ) : (
              <div className="preview-thumbnail-placeholder">
                <Upload size={32} />
                <p>No thumbnail</p>
              </div>
            )}
            
            <div className="preview-content">
              <h4>{courseData.title || 'Course Title'}</h4>
              <p className="preview-description">
                {courseData.description || 'Course description will appear here...'}
              </p>
              
              <div className="preview-meta">
                {courseData.category && (
                  <span className="preview-tag">{courseData.category}</span>
                )}
                <span className="preview-tag">{courseData.level}</span>
                <span className="preview-tag">{courseData.language}</span>
              </div>
              
              <div className="preview-price">
                {courseData.price === 0 ? (
                  <span className="free-badge">FREE</span>
                ) : (
                  <span className="price-badge">
                    {currencies.find(c => c.value === courseData.currency)?.symbol}
                    {courseData.price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="preview-tips">
            <h4>💡 Tips for Success</h4>
            <ul>
              <li>Use a clear, descriptive title</li>
              <li>Write a compelling description</li>
              <li>Choose an eye-catching thumbnail</li>
              <li>List specific learning outcomes</li>
              <li>Price competitively</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateCourse

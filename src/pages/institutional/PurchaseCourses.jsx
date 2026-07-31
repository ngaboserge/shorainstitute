import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { ShoppingCart, Search, Filter, BookOpen, Users, DollarSign, X, CreditCard, Smartphone, Loader } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useInstitutionalAuth } from '../../hooks/useInstitutionalAuth'
import xentriPayService from '../../services/xentripay'
import './PurchaseCourses.css'

const PurchaseCourses = () => {
  const { institution } = useInstitutionalAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('title')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [purchaseForm, setPurchaseForm] = useState({
    quantity: 10,
    paymentMethod: 'mtn_momo',
    phoneNumber: '',
    email: '',
    institutionName: ''
  })
  const [processing, setProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [paymentReference, setPaymentReference] = useState(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)

      // Fetch all published paid courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'published')
        .eq('is_paid', true)
        .order('created_at', { ascending: false })

      if (coursesError) throw coursesError

      setCourses(coursesData || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchaseClick = (course) => {
    setSelectedCourse(course)
    setShowPurchaseModal(true)
    setPurchaseForm({ 
      quantity: 10, 
      paymentMethod: 'mtn_momo',
      phoneNumber: institution?.contact_phone || '',
      email: institution?.contact_email || '',
      institutionName: institution?.name || ''
    })
    setPaymentStatus(null)
    setPaymentReference(null)
  }

  const handlePurchase = async () => {
    if (!institution || !selectedCourse) return

    // Validate required fields
    if (!purchaseForm.phoneNumber) {
      alert('Please enter a phone number for payment')
      return
    }

    if (!purchaseForm.email) {
      alert('Please enter an email address')
      return
    }

    setProcessing(true)
    try {
      const pricePerSeat = parseFloat(selectedCourse.price)
      const subtotal = pricePerSeat * purchaseForm.quantity
      const platformFee = subtotal * 0.1 // 10% platform fee
      const total = subtotal + platformFee

      // Convert USD to RWF if needed (approximate rate: 1 USD = 1300 RWF)
      const amountInRWF = selectedCourse.currency === 'USD' 
        ? Math.round(total * 1300) 
        : Math.round(total)

      // Create pending purchase record
      const { data: purchase, error: purchaseError } = await supabase
        .from('institution_course_purchases')
        .insert({
          institution_id: institution.id,
          course_id: selectedCourse.id,
          quantity: purchaseForm.quantity,
          price_per_seat: pricePerSeat,
          total_amount: total,
          status: 'pending',
          payment_method: purchaseForm.paymentMethod,
          payer_email: purchaseForm.email,
          payer_phone: purchaseForm.phoneNumber,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
        })
        .select()
        .single()

      if (purchaseError) throw purchaseError

      // Initialize payment with XentriPay
      const paymentData = {
        amount: amountInRWF,
        currency: 'RWF',
        customerName: purchaseForm.institutionName || institution.name,
        customerEmail: purchaseForm.email,
        customerPhone: purchaseForm.phoneNumber,
        courseId: selectedCourse.id,
        courseTitle: `Bulk Purchase: ${selectedCourse.title} (${purchaseForm.quantity} seats)`,
        userId: institution.id,
        enrollmentId: purchase.id,
        callbackUrl: `${window.location.origin}/api/webhooks/xentripay`,
        returnUrl: `${window.location.origin}/institutional/billing/codes?payment=success&ref=${purchase.id}`
      }

      // Determine payment method for XentriPay
      let xentriPaymentMethod = 'momo'
      if (purchaseForm.paymentMethod === 'card') {
        xentriPaymentMethod = 'card'
      }

      const paymentResponse = await xentriPayService.initializePayment(paymentData)

      if (!paymentResponse) {
        throw new Error('Failed to initialize payment')
      }

      // Update purchase with payment reference
      await supabase
        .from('institution_course_purchases')
        .update({
          provider_ref_id: paymentResponse.reference || paymentResponse.refid,
          payment_provider: 'xentripay'
        })
        .eq('id', purchase.id)

      setPaymentReference(paymentResponse.reference || paymentResponse.refid)

      // Handle different payment methods
      if (xentriPaymentMethod === 'card' && paymentResponse.payment_url) {
        // Redirect to card payment page
        window.location.href = paymentResponse.payment_url
      } else if (xentriPaymentMethod === 'momo') {
        // Show mobile money prompt
        setPaymentStatus('awaiting_confirmation')
        alert(`Payment request sent to ${purchaseForm.phoneNumber}\n\nPlease check your phone and approve the mobile money payment.\n\nAmount: RWF ${amountInRWF.toLocaleString()}`)
        
        // Start polling for payment status
        pollPaymentStatus(paymentResponse.reference || paymentResponse.refid, purchase.id)
      }

    } catch (error) {
      console.error('Purchase error:', error)
      alert(`Failed to initiate payment: ${error.message}\n\nPlease check your details and try again.`)
      setProcessing(false)
    }
  }

  // Poll payment status for mobile money
  const pollPaymentStatus = async (reference, purchaseId) => {
    let attempts = 0
    const maxAttempts = 60 // Poll for 5 minutes (60 * 5 seconds)

    const checkStatus = async () => {
      try {
        attempts++

        // Check payment status from our database
        const { data: purchase, error } = await supabase
          .from('institution_course_purchases')
          .select('status, provider_ref_id')
          .eq('id', purchaseId)
          .single()

        if (error) throw error

        if (purchase.status === 'completed' || purchase.status === 'approved') {
          setPaymentStatus('success')
          setProcessing(false)
          alert('Payment successful! You can now generate enrollment codes.')
          setShowPurchaseModal(false)
          fetchCourses()
          return
        }

        if (purchase.status === 'failed' || purchase.status === 'rejected') {
          setPaymentStatus('failed')
          setProcessing(false)
          alert('Payment failed. Please try again.')
          return
        }

        // Continue polling if still pending
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000) // Check every 5 seconds
        } else {
          setPaymentStatus('timeout')
          setProcessing(false)
          alert('Payment is taking longer than expected. Please check the Manage Codes page in a few minutes.')
          setShowPurchaseModal(false)
        }

      } catch (error) {
        console.error('Status check error:', error)
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000)
        } else {
          setProcessing(false)
        }
      }
    }

    checkStatus()
  }

  // Filter and sort courses
  const filteredCourses = courses
    .filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === 'all' || course.category === filterCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      if (sortBy === 'price_low') return parseFloat(a.price) - parseFloat(b.price)
      if (sortBy === 'price_high') return parseFloat(b.price) - parseFloat(a.price)
      return 0
    })

  // Get unique categories
  const categories = ['all', ...new Set(courses.map(c => c.category).filter(Boolean))]

  // Calculate purchase details
  const calculateTotal = () => {
    if (!selectedCourse) return { subtotal: 0, platformFee: 0, total: 0 }
    const pricePerSeat = parseFloat(selectedCourse.price)
    const subtotal = pricePerSeat * purchaseForm.quantity
    const platformFee = subtotal * 0.1
    const total = subtotal + platformFee
    return { subtotal, platformFee, total }
  }

  const { subtotal, platformFee, total } = calculateTotal()

  return (
    <div className="dashboard-layout">
      <Sidebar type="institutional" />
      <div className="main-content">
        <Header 
          title="Purchase Courses"
          subtitle="Browse and purchase course seats in bulk for your employees"
        />
        
        <div className="content-wrapper">
          {/* Search and Filters */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="search-box" style={{ flex: 1, minWidth: '300px' }}>
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select 
                className="form-select"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{ minWidth: '200px' }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>

              <select 
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ minWidth: '180px' }}
              >
                <option value="title">Sort by: Title</option>
                <option value="price_low">Sort by: Price (Low to High)</option>
                <option value="price_high">Sort by: Price (High to Low)</option>
              </select>
            </div>
          </div>

          {/* Courses Grid */}
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <div className="spinner" style={{ width: '48px', height: '48px', margin: '0 auto 16px', border: '4px solid #f3f3f3', borderTop: '4px solid #0B4F9F', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <p style={{ color: '#666' }}>Loading courses...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
              <BookOpen size={64} style={{ color: '#ccc', margin: '0 auto 24px' }} />
              <h3 style={{ marginBottom: '12px', color: '#666' }}>No Courses Found</h3>
              <p style={{ color: '#999' }}>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="courses-grid">
              {filteredCourses.map((course) => (
                <div key={course.id} className="course-card">
                  {course.thumbnail_url && (
                    <img 
                      src={course.thumbnail_url} 
                      alt={course.title}
                      className="course-thumbnail"
                    />
                  )}
                  <div className="course-card-content">
                    {course.category && (
                      <span className="course-category">{course.category}</span>
                    )}
                    <h3 className="course-title">{course.title}</h3>
                    <p className="course-description">
                      {course.description?.substring(0, 120)}
                      {course.description?.length > 120 ? '...' : ''}
                    </p>

                    <div className="course-meta">
                      <div className="course-meta-item">
                        <BookOpen size={16} />
                        <span>{course.total_lessons} lessons</span>
                      </div>
                      <div className="course-meta-item">
                        <Users size={16} />
                        <span>{course.enrollment_count} enrolled</span>
                      </div>
                    </div>

                    <div className="course-instructor">
                      By {course.instructor_name || 'Instructor'}
                    </div>

                    <div className="course-footer">
                      <div className="course-price">
                        <span className="price-currency">{course.currency}</span>
                        <span className="price-amount">{parseFloat(course.price).toLocaleString()}</span>
                        <span className="price-per">per seat</span>
                      </div>
                      <button 
                        className="btn btn-primary"
                        onClick={() => handlePurchaseClick(course)}
                      >
                        <ShoppingCart size={18} />
                        Purchase
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedCourse && (
        <div className="modal-overlay" onClick={() => !processing && setShowPurchaseModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Purchase Course Seats</h2>
              <button className="modal-close" onClick={() => !processing && setShowPurchaseModal(false)} disabled={processing}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              {/* Course Info */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                {selectedCourse.thumbnail_url && (
                  <img 
                    src={selectedCourse.thumbnail_url}
                    alt={selectedCourse.title}
                    style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0' }}>{selectedCourse.title}</h4>
                  <p style={{ margin: '0', fontSize: '13px', color: '#666' }}>{selectedCourse.instructor_name}</p>
                  <p style={{ margin: '8px 0 0', fontSize: '14px', fontWeight: '600', color: '#0B4F9F' }}>
                    {selectedCourse.currency} {parseFloat(selectedCourse.price).toLocaleString()} per seat
                  </p>
                </div>
              </div>

              {/* Quantity Selection */}
              <div className="form-group">
                <label className="form-label">Number of Seats</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    className="btn btn-outline"
                    onClick={() => setPurchaseForm({ ...purchaseForm, quantity: Math.max(1, purchaseForm.quantity - 5) })}
                    disabled={processing}
                    style={{ padding: '8px 16px' }}
                  >
                    -5
                  </button>
                  <input
                    type="number"
                    className="form-input"
                    value={purchaseForm.quantity}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                    min="1"
                    disabled={processing}
                    style={{ textAlign: 'center', maxWidth: '120px' }}
                  />
                  <button
                    className="btn btn-outline"
                    onClick={() => setPurchaseForm({ ...purchaseForm, quantity: purchaseForm.quantity + 5 })}
                    disabled={processing}
                    style={{ padding: '8px 16px' }}
                  >
                    +5
                  </button>
                </div>
                <small className="form-hint">
                  Purchase seats in bulk for your employees
                </small>
              </div>

              {/* Price Breakdown */}
              <div style={{ background: '#f0f7ff', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 16px 0' }}>Price Breakdown</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666' }}>Subtotal ({purchaseForm.quantity} seats):</span>
                    <span style={{ fontWeight: '600' }}>{selectedCourse.currency} {subtotal.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666' }}>Platform fee (10%):</span>
                    <span style={{ fontWeight: '600' }}>{selectedCourse.currency} {platformFee.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '2px solid #0B4F9F' }}>
                    <span style={{ fontSize: '18px', fontWeight: '700' }}>Total:</span>
                    <span style={{ fontSize: '24px', fontWeight: '700', color: '#0B4F9F' }}>
                      {selectedCourse.currency} {total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="form-group">
                <label className="form-label">Institution Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={purchaseForm.institutionName}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, institutionName: e.target.value })}
                  disabled={processing}
                  placeholder="Enter institution name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  value={purchaseForm.email}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, email: e.target.value })}
                  disabled={processing}
                  placeholder="institution@example.com"
                  required
                />
                <small className="form-hint">
                  Payment receipt will be sent to this email
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  className="form-input"
                  value={purchaseForm.phoneNumber}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, phoneNumber: e.target.value })}
                  disabled={processing}
                  placeholder="078XXXXXXX or 073XXXXXXX"
                  required
                />
                <small className="form-hint">
                  {purchaseForm.paymentMethod === 'card' 
                    ? 'Contact phone number' 
                    : 'MTN or Airtel mobile money number (format: 078XXXXXXX)'}
                </small>
              </div>

              {/* Payment Method */}
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="mtn_momo"
                      checked={purchaseForm.paymentMethod === 'mtn_momo'}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, paymentMethod: e.target.value })}
                      disabled={processing}
                    />
                    <Smartphone size={20} />
                    <span>MTN Mobile Money</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="airtel_money"
                      checked={purchaseForm.paymentMethod === 'airtel_money'}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, paymentMethod: e.target.value })}
                      disabled={processing}
                    />
                    <Smartphone size={20} />
                    <span>Airtel Money</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={purchaseForm.paymentMethod === 'card'}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, paymentMethod: e.target.value })}
                      disabled={processing}
                    />
                    <CreditCard size={20} />
                    <span>Credit/Debit Card</span>
                  </label>
                </div>
              </div>

              {/* Payment Status Indicator */}
              {paymentStatus === 'awaiting_confirmation' && (
                <div style={{ background: '#FFF7ED', border: '1px solid #FB923C', borderRadius: '8px', padding: '16px', marginTop: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <Loader size={20} style={{ color: '#FB923C', animation: 'spin 1s linear infinite' }} />
                    <strong style={{ color: '#FB923C' }}>Awaiting Payment Confirmation</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                    Please check your phone and approve the mobile money payment request.
                  </p>
                </div>
              )}

              {/* Info Box */}
              <div style={{ background: '#FFF7ED', border: '1px solid #FB923C', borderRadius: '8px', padding: '16px', marginTop: '24px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                  <strong>After purchase:</strong> You can generate enrollment codes from the "Manage Codes" page and distribute them to your employees.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowPurchaseModal(false)}
                disabled={processing}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handlePurchase}
                disabled={processing || !purchaseForm.phoneNumber || !purchaseForm.email}
                style={{ minWidth: '180px' }}
              >
                {processing ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: '8px' }}></div>
                    {paymentStatus === 'awaiting_confirmation' ? 'Waiting...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    {purchaseForm.paymentMethod === 'card' ? 'Proceed to Payment' : 'Complete Purchase'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PurchaseCourses

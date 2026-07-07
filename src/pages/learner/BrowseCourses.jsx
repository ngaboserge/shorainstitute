import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Star, Clock, Users, BookOpen } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import './BrowseCourses.css'

const BrowseCourses = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Courses')

  const courses = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400',
      category: 'Financial Foundations',
      badge: 'Beginner',
      title: 'Financial Freedom: Begin with a Plan',
      instructor: 'Alex Ntale',
      instructorRole: 'SHORA Institute',
      rating: 4.8,
      reviews: 1245,
      duration: '2h 12m',
      lessons: 8,
      enrolled: 12453,
      price: 'Free',
      isFree: true
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
      category: 'Investing',
      badge: 'Intermediate',
      title: 'Investing Essentials: Grow Your Wealth',
      instructor: 'Linda Umutoni',
      instructorRole: 'SHORA Institute',
      rating: 4.7,
      reviews: 982,
      duration: '3h 15m',
      lessons: 12,
      enrolled: 8934,
      price: 'Enroll',
      isFree: false
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
      category: 'Personal Wealth',
      badge: 'Beginner',
      title: 'Budgeting & Saving That Actually Works',
      instructor: 'Emmanuel Habimana',
      instructorRole: 'SHORA Institute',
      rating: 4.6,
      reviews: 763,
      duration: '1h 30m',
      lessons: 6,
      enrolled: 15632,
      price: 'Enroll',
      isFree: false
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
      category: 'SME Finance',
      badge: 'Intermediate',
      title: 'Cash Flow Management for Small Businesses',
      instructor: 'Claudine Mukamana',
      instructorRole: 'Invited Expert',
      rating: 4.8,
      reviews: 654,
      duration: '2h 30m',
      lessons: 10,
      enrolled: 5421,
      price: 'Enroll',
      isFree: false
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400',
      category: 'Capital Markets',
      badge: 'Intermediate',
      title: 'Introduction to the Rwanda Stock Market',
      instructor: 'Isaac Twizere',
      instructorRole: 'Invited Expert',
      rating: 4.6,
      reviews: 438,
      duration: '2h 45m',
      lessons: 11,
      enrolled: 3254,
      price: 'Enroll',
      isFree: false
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400',
      category: 'Institutional',
      badge: 'Advanced',
      title: 'Treasury Management for Institutions',
      instructor: 'SHORA Faculty',
      instructorRole: 'SHORA Institute',
      rating: 4.9,
      reviews: 321,
      duration: '3h 30m',
      lessons: 14,
      enrolled: 1876,
      price: 'Enroll',
      isFree: false
    }
  ]

  const categories = [
    'All Courses',
    'Financial Foundations',
    'Investing',
    'Personal Wealth',
    'SME Finance',
    'Capital Markets',
    'Tax & Compliance'
  ]

  const filteredCourses = selectedCategory === 'All Courses' 
    ? courses 
    : courses.filter(c => c.category === selectedCategory)

  return (
    <div className="dashboard-layout">
      <Sidebar type="learner" />
      <div className="main-content">
        <Header 
          title="Browse Courses"
          subtitle="Discover courses to expand your financial knowledge."
        />
        
        <div className="content-wrapper">
          {/* Search and Filters */}
          <div className="browse-filters">
            <div className="search-bar">
              <Search size={20} />
              <input 
                type="text" 
                placeholder="Search courses by title, topic, or instructor..." 
                className="search-input"
              />
            </div>
            
            <div className="filter-row">
              <select className="filter-select">
                <option>Level: All Levels</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
              
              <select className="filter-select">
                <option>Duration: Any</option>
                <option>&lt; 2 hours</option>
                <option>2-4 hours</option>
                <option>&gt; 4 hours</option>
              </select>
              
              <select className="filter-select">
                <option>Price: All</option>
                <option>Free</option>
                <option>Paid</option>
              </select>
              
              <button className="btn btn-icon">
                <Filter size={18} />
                More Filters
              </button>
            </div>
          </div>

          {/* Category Pills */}
          <div className="category-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results Info */}
          <div className="results-info">
            <p>Showing {filteredCourses.length} courses</p>
            <select className="sort-select">
              <option>Sort by: Most Popular</option>
              <option>Highest Rated</option>
              <option>Newest</option>
              <option>Duration</option>
            </select>
          </div>

          {/* Courses Grid */}
          <div className="browse-grid">
            {filteredCourses.map((course) => (
              <div key={course.id} className="browse-course-card">
                <div className="course-image-wrapper">
                  <img src={course.image} alt={course.title} className="course-img" />
                  <div className="course-category-badge">{course.category}</div>
                  <div className="course-level-badge">{course.badge}</div>
                  {course.isFree && <div className="free-badge">FREE</div>}
                </div>
                
                <div className="course-card-content">
                  <h3 className="course-card-title">{course.title}</h3>
                  
                  <div className="course-instructor-row">
                    <img 
                      src={`https://i.pravatar.cc/40?img=${course.id}`} 
                      alt={course.instructor}
                      className="instructor-thumb"
                    />
                    <div>
                      <div className="instructor-name-small">{course.instructor}</div>
                      <div className="instructor-role-small">{course.instructorRole}</div>
                    </div>
                  </div>
                  
                  <div className="course-meta-row">
                    <div className="rating-display">
                      <Star size={14} fill="#FDB714" stroke="#FDB714" />
                      <span className="rating-number">{course.rating}</span>
                      <span className="rating-reviews">({course.reviews})</span>
                    </div>
                  </div>
                  
                  <div className="course-stats-row">
                    <div className="stat-item-small">
                      <Clock size={14} />
                      <span>{course.duration}</span>
                    </div>
                    <div className="stat-item-small">
                      <BookOpen size={14} />
                      <span>{course.lessons} lessons</span>
                    </div>
                    <div className="stat-item-small">
                      <Users size={14} />
                      <span>{course.enrolled.toLocaleString()} enrolled</span>
                    </div>
                  </div>
                </div>
                
                <div className="course-card-footer">
                  <Link 
                    to={`/learner/courses/${course.id}/lesson/1`}
                    className={`btn ${course.isFree ? 'btn-warning' : 'btn-primary'} btn-full`}
                  >
                    {course.price}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BrowseCourses

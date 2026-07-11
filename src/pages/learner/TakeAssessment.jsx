import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, CheckCircle, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import './TakeAssessment.css'

const TakeAssessment = () => {
  const { assessmentId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [assessment, setAssessment] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [attemptId, setAttemptId] = useState(null)
  const [timeLeft, setTimeLeft] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user && assessmentId) {
      loadAssessment()
    }
  }, [user, assessmentId])

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitAssessment() // Auto-submit when time runs out
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const loadAssessment = async () => {
    try {
      // Load assessment details
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single()

      if (assessmentError) throw assessmentError
      setAssessment(assessmentData)

      // Load questions with options
      const { data: questionsData, error: questionsError } = await supabase
        .from('assessment_questions')
        .select(`
          *,
          question_options (*)
        `)
        .eq('assessment_id', assessmentId)
        .order('order_number')

      if (questionsError) throw questionsError
      setQuestions(questionsData || [])

      // Create a new attempt
      const { data: attemptData, error: attemptError } = await supabase
        .from('assessment_attempts')
        .insert({
          assessment_id: assessmentId,
          user_id: user.id,
          course_id: assessmentData.course_id,
          status: 'in_progress',
          attempt_number: await getNextAttemptNumber(assessmentId, user.id)
        })
        .select()
        .single()

      if (attemptError) throw attemptError
      setAttemptId(attemptData.id)

      // Set timer if time limit exists
      if (assessmentData.time_limit_minutes) {
        setTimeLeft(assessmentData.time_limit_minutes * 60)
      }
    } catch (error) {
      console.error('Error loading assessment:', error)
      alert('Failed to load assessment')
    } finally {
      setLoading(false)
    }
  }

  const getNextAttemptNumber = async (assessmentId, userId) => {
    const { data, error } = await supabase
      .from('assessment_attempts')
      .select('attempt_number')
      .eq('assessment_id', assessmentId)
      .eq('user_id', userId)
      .order('attempt_number', { ascending: false })
      .limit(1)

    if (error || !data || data.length === 0) return 1
    return data[0].attempt_number + 1
  }

  const handleAnswerSelect = (questionId, optionId) => {
    setAnswers({
      ...answers,
      [questionId]: optionId
    })
  }

  const handleTextAnswer = (questionId, text) => {
    setAnswers({
      ...answers,
      [questionId]: text
    })
  }

  const handleSubmitAssessment = async () => {
    if (submitting) return
    
    if (Object.keys(answers).length < questions.length) {
      if (!confirm('You have unanswered questions. Submit anyway?')) {
        return
      }
    }

    setSubmitting(true)

    try {
      // Save all answers
      const answerPromises = questions.map(async (question) => {
        const answer = answers[question.id]
        if (!answer) return

        // Determine if answer is correct
        let isCorrect = false
        let points = 0

        if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
          const selectedOption = question.question_options.find(opt => opt.id === answer)
          isCorrect = selectedOption?.is_correct || false
          points = isCorrect ? question.points : 0

          return supabase
            .from('attempt_answers')
            .insert({
              attempt_id: attemptId,
              question_id: question.id,
              selected_option_id: answer,
              is_correct: isCorrect,
              points_awarded: points
            })
        } else if (question.question_type === 'short_answer') {
          // Short answer needs manual grading
          return supabase
            .from('attempt_answers')
            .insert({
              attempt_id: attemptId,
              question_id: question.id,
              text_answer: answer,
              is_correct: null,
              points_awarded: 0
            })
        }
      })

      await Promise.all(answerPromises)

      // Calculate time taken
      const timeTaken = assessment.time_limit_minutes 
        ? (assessment.time_limit_minutes * 60) - (timeLeft || 0)
        : null

      // Update attempt as submitted
      await supabase
        .from('assessment_attempts')
        .update({
          submitted_at: new Date().toISOString(),
          time_taken_seconds: timeTaken,
          status: 'completed'
        })
        .eq('id', attemptId)

      // Calculate score using database function
      const { data: scoreData, error: scoreError } = await supabase
        .rpc('calculate_assessment_score', { attempt_id_param: attemptId })

      if (scoreError) throw scoreError

      // Navigate to results page
      navigate(`/learner/assessments/${assessmentId}/results/${attemptId}`)
    } catch (error) {
      console.error('Error submitting assessment:', error)
      alert('Failed to submit assessment')
      setSubmitting(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="learner" />
        <div className="main-content">
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Loading assessment...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">
      <Sidebar type="learner" />
      <div className="main-content">
        <Header 
          title={assessment?.title || 'Assessment'}
          subtitle={`Question ${currentQuestion + 1} of ${questions.length}`}
        />
        
        <div className="content-wrapper">
          <div className="assessment-container">
            {/* Top Bar */}
            <div className="assessment-top-bar">
              <div className="assessment-info">
                <span className="question-counter">
                  {currentQuestion + 1} / {questions.length}
                </span>
                <span className="answered-counter">
                  {Object.keys(answers).length} answered
                </span>
              </div>
              {timeLeft !== null && (
                <div className={`time-remaining ${timeLeft < 300 ? 'urgent' : ''}`}>
                  <Clock size={18} />
                  <span>{formatTime(timeLeft)}</span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>

            {/* Question Card */}
            {currentQ && (
              <div className="question-card">
                <div className="question-header">
                  <h3>Question {currentQuestion + 1}</h3>
                  <span className="question-points">{currentQ.points} {currentQ.points === 1 ? 'point' : 'points'}</span>
                </div>

                <p className="question-text">{currentQ.question_text}</p>

                {/* Multiple Choice / True False */}
                {(currentQ.question_type === 'multiple_choice' || currentQ.question_type === 'true_false') && (
                  <div className="options-list">
                    {currentQ.question_options
                      ?.sort((a, b) => a.order_number - b.order_number)
                      .map((option) => (
                        <button
                          key={option.id}
                          className={`option-btn ${answers[currentQ.id] === option.id ? 'selected' : ''}`}
                          onClick={() => handleAnswerSelect(currentQ.id, option.id)}
                        >
                          <div className="option-radio">
                            {answers[currentQ.id] === option.id && <div className="option-radio-inner"></div>}
                          </div>
                          <span>{option.option_text}</span>
                        </button>
                      ))}
                  </div>
                )}

                {/* Short Answer */}
                {currentQ.question_type === 'short_answer' && (
                  <textarea
                    className="answer-textarea"
                    placeholder="Type your answer here..."
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleTextAnswer(currentQ.id, e.target.value)}
                    rows={6}
                  />
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="assessment-navigation">
              <button
                className="btn btn-outline"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft size={18} />
                Previous
              </button>

              {currentQuestion < questions.length - 1 ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                >
                  Next
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  className="btn btn-success"
                  onClick={handleSubmitAssessment}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Assessment'}
                  <CheckCircle size={18} />
                </button>
              )}
            </div>

            {/* Question Navigator */}
            <div className="question-navigator">
              <h4>Questions</h4>
              <div className="question-grid">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    className={`question-nav-btn ${idx === currentQuestion ? 'active' : ''} ${answers[q.id] ? 'answered' : ''}`}
                    onClick={() => setCurrentQuestion(idx)}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TakeAssessment

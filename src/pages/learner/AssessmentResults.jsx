import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Award, Clock, BarChart3, ArrowRight, Home } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import './AssessmentResults.css'

const AssessmentResults = () => {
  const { assessmentId, attemptId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [assessment, setAssessment] = useState(null)
  const [attempt, setAttempt] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && attemptId) {
      loadResults()
    }
  }, [user, attemptId])

  const loadResults = async () => {
    try {
      // Load attempt details
      const { data: attemptData, error: attemptError } = await supabase
        .from('assessment_attempts')
        .select(`
          *,
          assessments (*)
        `)
        .eq('id', attemptId)
        .single()

      if (attemptError) throw attemptError
      setAttempt(attemptData)
      setAssessment(attemptData.assessments)

      // Load questions with their answers
      const { data: questionsData, error: questionsError } = await supabase
        .from('assessment_questions')
        .select(`
          *,
          question_options (*)
        `)
        .eq('assessment_id', attemptData.assessment_id)
        .order('order_number')

      if (questionsError) throw questionsError
      setQuestions(questionsData || [])

      // Load user's answers
      const { data: answersData, error: answersError } = await supabase
        .from('attempt_answers')
        .select('*')
        .eq('attempt_id', attemptId)

      if (answersError) throw answersError
      setAnswers(answersData || [])
    } catch (error) {
      console.error('Error loading results:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getAnswerForQuestion = (questionId) => {
    return answers.find(a => a.question_id === questionId)
  }

  const getOptionText = (question, optionId) => {
    return question.question_options?.find(opt => opt.id === optionId)?.option_text
  }

  const getCorrectOption = (question) => {
    return question.question_options?.find(opt => opt.is_correct)
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="learner" />
        <div className="main-content">
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Loading results...</p>
          </div>
        </div>
      </div>
    )
  }

  const passed = attempt?.passed
  const scorePercentage = attempt?.score || 0
  const correctCount = answers.filter(a => a.is_correct).length
  const totalQuestions = questions.length

  return (
    <div className="dashboard-layout">
      <Sidebar type="learner" />
      <div className="main-content">
        <Header 
          title="Assessment Results"
          subtitle={assessment?.title || 'Results'}
        />
        
        <div className="content-wrapper">
          <div className="results-container">
            {/* Score Card */}
            <div className={`results-hero ${passed ? 'passed' : 'failed'}`}>
              <div className="results-icon">
                {passed ? (
                  <Award size={64} color="#4caf50" />
                ) : (
                  <XCircle size={64} color="#ef4444" />
                )}
              </div>
              
              <h1 className="results-title">
                {passed ? 'Congratulations!' : 'Keep Trying!'}
              </h1>
              
              <p className="results-message">
                {passed 
                  ? `You passed with a score of ${scorePercentage.toFixed(1)}%`
                  : `You scored ${scorePercentage.toFixed(1)}%. You need ${assessment?.passing_score}% to pass.`
                }
              </p>

              <div className="score-circle">
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="15"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    fill="none"
                    stroke={passed ? '#4caf50' : '#ef4444'}
                    strokeWidth="15"
                    strokeDasharray={`${(scorePercentage / 100) * 534.07} 534.07`}
                    strokeLinecap="round"
                    transform="rotate(-90 100 100)"
                  />
                  <text
                    x="100"
                    y="100"
                    textAnchor="middle"
                    dy="0.3em"
                    fontSize="48"
                    fontWeight="700"
                    fill="#1a1a1a"
                  >
                    {scorePercentage.toFixed(0)}%
                  </text>
                </svg>
              </div>

              <div className="results-stats">
                <div className="stat-item">
                  <CheckCircle size={20} color="#4caf50" />
                  <span>{correctCount} correct</span>
                </div>
                <div className="stat-item">
                  <XCircle size={20} color="#ef4444" />
                  <span>{totalQuestions - correctCount} incorrect</span>
                </div>
                <div className="stat-item">
                  <Clock size={20} color="#FDB714" />
                  <span>{formatTime(attempt?.time_taken_seconds)}</span>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="results-summary-grid">
              <div className="summary-card">
                <div className="summary-label">Score</div>
                <div className="summary-value">{scorePercentage.toFixed(1)}%</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Points</div>
                <div className="summary-value">{attempt?.points_earned}/{attempt?.total_points}</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Correct</div>
                <div className="summary-value">{correctCount}/{totalQuestions}</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Time</div>
                <div className="summary-value">{formatTime(attempt?.time_taken_seconds)}</div>
              </div>
            </div>

            {/* Question Review */}
            <div className="results-review">
              <h3>Question Review</h3>
              <div className="questions-review-list">
                {questions.map((question, idx) => {
                  const userAnswer = getAnswerForQuestion(question.id)
                  const correctOption = getCorrectOption(question)
                  const isCorrect = userAnswer?.is_correct

                  return (
                    <div key={question.id} className={`review-question ${isCorrect ? 'correct' : 'incorrect'}`}>
                      <div className="review-header">
                        <span className="review-number">Question {idx + 1}</span>
                        <span className={`review-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
                          {isCorrect ? (
                            <><CheckCircle size={16} /> Correct</>
                          ) : (
                            <><XCircle size={16} /> Incorrect</>
                          )}
                        </span>
                      </div>

                      <p className="review-question-text">{question.question_text}</p>

                      {(question.question_type === 'multiple_choice' || question.question_type === 'true_false') && (
                        <div className="review-answers">
                          <div className="answer-item">
                            <strong>Your answer:</strong>
                            <span className={isCorrect ? 'correct-text' : 'incorrect-text'}>
                              {getOptionText(question, userAnswer?.selected_option_id) || 'No answer'}
                            </span>
                          </div>
                          {!isCorrect && (
                            <div className="answer-item">
                              <strong>Correct answer:</strong>
                              <span className="correct-text">
                                {correctOption?.option_text}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {question.question_type === 'short_answer' && (
                        <div className="review-answers">
                          <div className="answer-item">
                            <strong>Your answer:</strong>
                            <p className="text-answer">{userAnswer?.text_answer || 'No answer'}</p>
                          </div>
                          <p className="grading-note">This question requires manual grading by your instructor.</p>
                        </div>
                      )}

                      {question.explanation && (
                        <div className="review-explanation">
                          <strong>Explanation:</strong>
                          <p>{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="results-actions">
              {!passed && assessment?.max_attempts && attempt?.attempt_number < assessment.max_attempts && (
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate(`/learner/assessments/${assessmentId}/take`)}
                >
                  Try Again
                  <ArrowRight size={18} />
                </button>
              )}
              <Link to="/learner/assessments" className="btn btn-outline">
                <Home size={18} />
                Back to Assessments
              </Link>
              <Link to="/learner/dashboard" className="btn btn-outline">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssessmentResults

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Trash2, Save, ArrowLeft, Check, X, GripVertical } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import './EditAssessment.css'

const EditAssessment = () => {
  const { courseId, assessmentId } = useParams()
  const navigate = useNavigate()
  
  const [assessment, setAssessment] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (assessmentId) {
      loadAssessment()
    }
  }, [assessmentId])

  const loadAssessment = async () => {
    try {
      // Load assessment
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
    } catch (error) {
      console.error('Error loading assessment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddQuestion = () => {
    const newQuestion = {
      id: `temp-${Date.now()}`,
      question_text: '',
      question_type: 'multiple_choice',
      points: 1,
      order_number: questions.length + 1,
      explanation: '',
      question_options: [
        { id: `opt-${Date.now()}-1`, option_text: '', is_correct: false, order_number: 1 },
        { id: `opt-${Date.now()}-2`, option_text: '', is_correct: false, order_number: 2 },
        { id: `opt-${Date.now()}-3`, option_text: '', is_correct: false, order_number: 3 },
        { id: `opt-${Date.now()}-4`, option_text: '', is_correct: false, order_number: 4 }
      ],
      isNew: true
    }
    setQuestions([...questions, newQuestion])
  }

  const handleDeleteQuestion = (questionId) => {
    setQuestions(questions.filter(q => q.id !== questionId))
  }

  const handleQuestionChange = (questionId, field, value) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ))
  }

  const handleOptionChange = (questionId, optionId, field, value) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          question_options: q.question_options.map(opt =>
            opt.id === optionId ? { ...opt, [field]: value } : opt
          )
        }
      }
      return q
    }))
  }

  const handleMarkCorrect = (questionId, optionId) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          question_options: q.question_options.map(opt => ({
            ...opt,
            is_correct: opt.id === optionId
          }))
        }
      }
      return q
    }))
  }

  const handleAddOption = (questionId) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOption = {
          id: `opt-${Date.now()}`,
          option_text: '',
          is_correct: false,
          order_number: q.question_options.length + 1,
          isNew: true
        }
        return {
          ...q,
          question_options: [...q.question_options, newOption]
        }
      }
      return q
    }))
  }

  const handleRemoveOption = (questionId, optionId) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          question_options: q.question_options.filter(opt => opt.id !== optionId)
        }
      }
      return q
    }))
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      // Save each question
      for (const question of questions) {
        if (question.isNew || question.id.toString().startsWith('temp-')) {
          // Insert new question
          const { data: newQuestion, error: questionError } = await supabase
            .from('assessment_questions')
            .insert({
              assessment_id: assessmentId,
              question_text: question.question_text,
              question_type: question.question_type,
              points: question.points,
              order_number: question.order_number,
              explanation: question.explanation
            })
            .select()
            .single()

          if (questionError) throw questionError

          // Insert options
          if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
            const optionsToInsert = question.question_options.map(opt => ({
              question_id: newQuestion.id,
              option_text: opt.option_text,
              is_correct: opt.is_correct,
              order_number: opt.order_number
            }))

            const { error: optionsError } = await supabase
              .from('question_options')
              .insert(optionsToInsert)

            if (optionsError) throw optionsError
          }
        } else {
          // Update existing question
          const { error: updateError } = await supabase
            .from('assessment_questions')
            .update({
              question_text: question.question_text,
              question_type: question.question_type,
              points: question.points,
              explanation: question.explanation
            })
            .eq('id', question.id)

          if (updateError) throw updateError

          // Handle options for existing questions
          for (const option of question.question_options) {
            if (option.isNew || option.id.toString().startsWith('opt-')) {
              // Insert new option
              await supabase
                .from('question_options')
                .insert({
                  question_id: question.id,
                  option_text: option.option_text,
                  is_correct: option.is_correct,
                  order_number: option.order_number
                })
            } else {
              // Update existing option
              await supabase
                .from('question_options')
                .update({
                  option_text: option.option_text,
                  is_correct: option.is_correct
                })
                .eq('id', option.id)
            }
          }
        }
      }

      alert('Assessment saved successfully!')
      navigate(`/trainer/courses/${courseId}/assessments`)
    } catch (error) {
      console.error('Error saving assessment:', error)
      alert('Failed to save assessment')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="trainer" />
        <div className="main-content">
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">
      <Sidebar type="trainer" />
      <div className="main-content">
        <Header 
          title={`Edit: ${assessment?.title || 'Assessment'}`}
          subtitle="Add and edit questions"
        />
        
        <div className="content-wrapper">
          <div className="edit-assessment-container">
            {/* Top Actions */}
            <div className="edit-actions-bar">
              <button 
                className="btn btn-outline"
                onClick={() => navigate(`/trainer/courses/${courseId}/assessments`)}
              >
                <ArrowLeft size={18} />
                Back
              </button>
              <div className="actions-right">
                <button className="btn btn-primary" onClick={handleAddQuestion}>
                  <Plus size={18} />
                  Add Question
                </button>
                <button 
                  className="btn btn-success"
                  onClick={handleSaveAll}
                  disabled={saving || questions.length === 0}
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save All Questions'}
                </button>
              </div>
            </div>

            {/* Questions List */}
            {questions.length === 0 ? (
              <div className="empty-state">
                <h3>No questions yet</h3>
                <p>Add your first question to get started</p>
                <button className="btn btn-primary" onClick={handleAddQuestion}>
                  <Plus size={18} />
                  Add Question
                </button>
              </div>
            ) : (
              <div className="questions-list">
                {questions.map((question, qIndex) => (
                  <div key={question.id} className="question-editor-card">
                    <div className="question-header">
                      <div className="question-drag">
                        <GripVertical size={20} />
                      </div>
                      <h4>Question {qIndex + 1}</h4>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="question-editor-body">
                      {/* Question Type */}
                      <div className="form-row">
                        <div className="form-group" style={{ flex: 2 }}>
                          <label>Question Type</label>
                          <select
                            value={question.question_type}
                            onChange={(e) => handleQuestionChange(question.id, 'question_type', e.target.value)}
                          >
                            <option value="multiple_choice">Multiple Choice</option>
                            <option value="true_false">True/False</option>
                            <option value="short_answer">Short Answer</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Points</label>
                          <input
                            type="number"
                            min="1"
                            value={question.points}
                            onChange={(e) => handleQuestionChange(question.id, 'points', parseInt(e.target.value))}
                          />
                        </div>
                      </div>

                      {/* Question Text */}
                      <div className="form-group">
                        <label>Question *</label>
                        <textarea
                          placeholder="Enter your question here..."
                          value={question.question_text}
                          onChange={(e) => handleQuestionChange(question.id, 'question_text', e.target.value)}
                          rows={3}
                        />
                      </div>

                      {/* Options (for multiple choice and true/false) */}
                      {(question.question_type === 'multiple_choice' || question.question_type === 'true_false') && (
                        <div className="options-editor">
                          <label>Answer Options</label>
                          {question.question_options?.map((option, oIndex) => (
                            <div key={option.id} className="option-editor-row">
                              <button
                                className={`correct-btn ${option.is_correct ? 'selected' : ''}`}
                                onClick={() => handleMarkCorrect(question.id, option.id)}
                                title="Mark as correct answer"
                              >
                                <Check size={16} />
                              </button>
                              <input
                                type="text"
                                placeholder={`Option ${oIndex + 1}`}
                                value={option.option_text}
                                onChange={(e) => handleOptionChange(question.id, option.id, 'option_text', e.target.value)}
                              />
                              {question.question_options.length > 2 && (
                                <button
                                  className="btn-icon delete"
                                  onClick={() => handleRemoveOption(question.id, option.id)}
                                >
                                  <X size={16} />
                                </button>
                              )}
                            </div>
                          ))}
                          {question.question_type === 'multiple_choice' && (
                            <button
                              className="btn btn-sm btn-outline"
                              onClick={() => handleAddOption(question.id)}
                            >
                              <Plus size={16} />
                              Add Option
                            </button>
                          )}
                        </div>
                      )}

                      {/* Explanation */}
                      <div className="form-group">
                        <label>Explanation (shown after answering)</label>
                        <textarea
                          placeholder="Explain the correct answer..."
                          value={question.explanation}
                          onChange={(e) => handleQuestionChange(question.id, 'explanation', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditAssessment

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ydldtedpcnpoeznhgsot.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkbGR0ZWRwY25wb2V6bmhnc290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2OTE2NDgsImV4cCI6MjA5OTI2NzY0OH0.r8_LSrbDUqi_11LXEpUBjb4bAdxB-EHhdphvxuzsQGk'
)

async function checkAnswers() {
  const seminarId = '9997ea9a-64f2-4fa9-9b28-251481f3651b' // Shora institute hybrid seminar
  
  console.log('🔍 Checking registration answers for seminar:', seminarId)
  console.log('')
  
  // Get seminar questions
  const { data: seminar, error: seminarError } = await supabase
    .from('seminars')
    .select('title, registration_questions')
    .eq('id', seminarId)
    .single()
  
  if (seminarError) {
    console.error('❌ Error fetching seminar:', seminarError)
    return
  }
  
  console.log('📋 Seminar:', seminar.title)
  console.log('📝 Questions defined:')
  if (seminar.registration_questions && seminar.registration_questions.length > 0) {
    seminar.registration_questions.forEach((q, i) => {
      console.log(`   ${i + 1}. [${q.id}] ${q.question} (${q.type})`)
    })
  } else {
    console.log('   ⚠️  No questions defined for this seminar')
  }
  
  console.log('')
  
  // Get registrations with answers
  const { data: registrations, error: regError } = await supabase
    .from('seminar_registrations')
    .select('id, user_name, user_email, registration_answers')
    .eq('seminar_id', seminarId)
    .eq('registration_status', 'registered')
  
  if (regError) {
    console.error('❌ Error fetching registrations:', regError)
    return
  }
  
  console.log(`👥 Registrations found: ${registrations.length}`)
  console.log('')
  
  registrations.forEach((reg, i) => {
    console.log(`${i + 1}. ${reg.user_name} (${reg.user_email})`)
    console.log(`   Registration ID: ${reg.id}`)
    console.log('   Answers stored:')
    
    if (reg.registration_answers) {
      const answerKeys = Object.keys(reg.registration_answers)
      if (answerKeys.length > 0) {
        answerKeys.forEach(key => {
          const value = reg.registration_answers[key]
          // Format arrays nicely
          const displayValue = Array.isArray(value) ? `[${value.join(', ')}]` : value
          console.log(`      ${key}: ${displayValue}`)
        })
      } else {
        console.log('      ⚠️  Empty object (no answers)')
      }
    } else {
      console.log('      ⚠️  NULL or undefined')
    }
    console.log('')
  })
  
  // Check for ID mismatch
  if (seminar.registration_questions && seminar.registration_questions.length > 0 && registrations.length > 0) {
    console.log('🔍 Checking for ID mismatches:')
    const questionIds = seminar.registration_questions.map(q => q.id)
    console.log('   Question IDs in seminar:', questionIds)
    
    registrations.forEach(reg => {
      if (reg.registration_answers) {
        const answerKeys = Object.keys(reg.registration_answers)
        console.log(`   Answer keys for ${reg.user_name}:`, answerKeys)
        
        const mismatch = questionIds.some(qId => !answerKeys.includes(qId))
        if (mismatch) {
          console.log(`   ⚠️  MISMATCH DETECTED for ${reg.user_name}!`)
        } else {
          console.log(`   ✅ IDs match for ${reg.user_name}`)
        }
      }
    })
  }
}

checkAnswers()

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ydldtedpcnpoeznhgsot.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkbGR0ZWRwY25wb2V6bmhnc290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2OTE2NDgsImV4cCI6MjA5OTI2NzY0OH0.r8_LSrbDUqi_11LXEpUBjb4bAdxB-EHhdphvxuzsQGk'
)

async function checkSeminars() {
  console.log('Fetching all seminars...\n')
  
  const { data: seminars, error } = await supabase
    .from('seminars')
    .select('id, title, instructor_id, instructor_name, date, status, created_at')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log(`Found ${seminars.length} seminar(s):\n`)
  
  seminars.forEach((s, i) => {
    console.log(`${i+1}. "${s.title}"`)
    console.log(`   ID: ${s.id}`)
    console.log(`   Instructor: ${s.instructor_name} (${s.instructor_id})`)
    console.log(`   Date: ${s.date}`)
    console.log(`   Status: ${s.status}`)
    console.log(`   Created: ${s.created_at}`)
    console.log('')
  })

  // Now check registrations for each seminar
  console.log('\n--- Checking registrations ---\n')
  
  for (const seminar of seminars) {
    const { data: regs, error: regError } = await supabase
      .from('seminar_registrations')
      .select('id, user_name, user_email, registration_status')
      .eq('seminar_id', seminar.id)
    
    if (regError) {
      console.error('Error checking registrations:', regError)
      continue
    }
    
    console.log(`Seminar: "${seminar.title}" (${seminar.id})`)
    console.log(`Registrations: ${regs.length}`)
    if (regs.length > 0) {
      regs.forEach(r => {
        console.log(`  - ${r.user_name} (${r.user_email}) - ${r.registration_status}`)
      })
    }
    console.log('')
  }
}

checkSeminars()

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gljasqdpdqapfjznhdbt.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Wcr-A2IzHRHjshIXHUCRNg_VmrBH99o'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSignup(roleToTest, email) {
  console.log(`Testing signup for role: ${roleToTest} with email ${email}...`)
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: 'Password123!',
    options: {
      data: {
        full_name: 'Test User',
        role: roleToTest
      }
    }
  })
  
  if (error) {
    console.error(`❌ Error for ${roleToTest}:`, error.message)
  } else {
    console.log(`✅ SUCCESS for ${roleToTest}! User ID:`, data.user?.id)
  }
}

async function runTests() {
  await testSignup('uni_student', `testunistudent_${Date.now()}@test.com`)
}

runTests()

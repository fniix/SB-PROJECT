import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gljasqdpdqapfjznhdbt.supabase.co'
const supabaseKey = 'sb_publishable_Wcr-A2IzHRHjshIXHUCRNg_VmrBH99o'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createAdminUser() {
  console.log('Creating admin account...')
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@sb.com',
    password: 'Password123!',
    options: {
      data: {
        full_name: 'Super Admin',
        role: 'admin'
      }
    }
  })
  
  if (error) {
    console.error('Error creating user:', error.message)
  } else {
    console.log('SUCCESS! User created with ID:', data.user?.id)
    console.log('Email: admin@sb.com')
    console.log('Password: Password123!')
  }
}

createAdminUser()

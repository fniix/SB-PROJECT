import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gljasqdpdqapfjznhdbt.supabase.co'
const supabaseKey = 'sb_publishable_Wcr-A2IzHRHjshIXHUCRNg_VmrBH99o'

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupAdmin() {
  console.log('Logging in to get session...')
  const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'admin@sb.com',
    password: 'Password123!'
  })
  
  if (loginError) {
    console.error('Login Error:', loginError.message)
    return
  }

  console.log('Logged in! Updating profile...')
  
  // Try to update first
  const { data: updateData, error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'admin', full_name: 'Super Admin' })
    .eq('id', authData.user.id)
    .select()

  if (updateError) {
    console.error('Update Error:', updateError.message)
  } else if (!updateData || updateData.length === 0) {
    console.log('Profile not found, inserting...')
    // Insert if update failed
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: 'Super Admin',
        role: 'admin'
      })
      
    if (insertError) {
      console.error('Insert Error:', insertError.message)
    } else {
      console.log('Profile inserted successfully with admin role!')
    }
  } else {
    console.log('Profile updated successfully with admin role!')
  }
}

setupAdmin()

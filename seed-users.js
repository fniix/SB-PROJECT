const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY // Needs to be added to .env.local

if (!supabaseUrl || !supabaseServiceRole) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function seedUsers() {
  const users = [
    { email: 'admin@sbproject.bh', password: 'Admin123!', name: 'Admin Director', role: 'admin' },
    { email: 'parent@sbproject.bh', password: 'Parent123!', name: 'Test Parent', role: 'parent' },
    { email: 'tutor@sbproject.bh', password: 'Tutor123!', name: 'Test Tutor', role: 'tutor' },
  ]

  for (const u of users) {
    console.log(`Creating ${u.email}...`)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.name, role: u.role }
    })

    if (error) {
      console.error(`Error creating ${u.email}:`, error.message)
    } else {
      console.log(`✅ Created ${u.email} successfully!`)
      
      // Update the profile role (since trigger might default to 'parent')
      await supabaseAdmin
        .from('profiles')
        .update({ role: u.role, full_name: u.name })
        .eq('id', data.user.id)
    }
  }
  
  console.log("All done!")
}

seedUsers()

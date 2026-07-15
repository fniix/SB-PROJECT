import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // First try user_metadata.role (set at registration)
  const metaRole = user.user_metadata?.role

  if (metaRole === 'admin')      redirect('/dashboard/admin')
  if (metaRole === 'specialist') redirect('/dashboard/specialist')
  if (metaRole === 'beneficiary') redirect('/dashboard/beneficiary')
  if (metaRole === 'parent')     redirect('/dashboard/parent')

  // Fallback: check profiles table
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const role = profile?.role

  if (role === 'admin')      redirect('/dashboard/admin')
  if (role === 'specialist') redirect('/dashboard/specialist')
  if (role === 'beneficiary') redirect('/dashboard/beneficiary')

  redirect('/dashboard/parent')
}


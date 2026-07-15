import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminDashboardClient from '@/components/AdminDashboardClient'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Fetch metrics and records in parallel for deep analytics
  const [
    { count: totalUsers },
    { count: totalParents },
    { count: totalTutors },
    { count: totalStudents },
    { count: totalBookings },
    { count: pendingVerifications },
    { count: completedSessions },
    { data: revenueData },
    { data: recentUsers },
    { data: recentBookings },
    { data: allBookings },
    { data: allUsers }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'parent'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'tutor'),
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('tutor_profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('bookings').select('total_price').eq('status', 'completed'),
    supabase.from('profiles').select('full_name, role, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('bookings').select('subject, status, date, total_price, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('bookings').select('subject, status, date, total_price, created_at').order('date', { ascending: true }),
    supabase.from('profiles').select('full_name, role, created_at')
  ])

  const totalRevenue = revenueData?.reduce((s, b) => s + (b.total_price || 0), 0) || 0

  return (
    <AdminDashboardClient
      initialMetrics={{
        totalUsers: totalUsers || 0,
        totalParents: totalParents || 0,
        totalTutors: totalTutors || 0,
        totalStudents: totalStudents || 0,
        totalBookings: totalBookings || 0,
        pendingVerifications: pendingVerifications || 0,
        completedSessions: completedSessions || 0,
        totalRevenue: totalRevenue || 0
      }}
      recentUsers={recentUsers || []}
      recentBookings={recentBookings || []}
      allBookings={allBookings || []}
      allUsers={allUsers || []}
    />
  )
}

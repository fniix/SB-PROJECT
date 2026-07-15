import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function SpecialistDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'specialist') {
    redirect('/dashboard/parent')
  }

  const { data: specProfile } = await supabase
    .from('specialist_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const firstName = profile?.full_name?.split(' ')[0] || 'Specialist'

  // Fetch some stats
  const { data: upcomingSessions } = await supabase
    .from('bookings')
    .select('*, beneficiary:beneficiary_id(full_name)')
    .eq('specialist_id', specProfile?.id)
    .in('status', ['accepted'])
    .order('date', { ascending: true })
    .limit(5)

  const { count: pendingRequests } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('specialist_id', specProfile?.id)
    .eq('status', 'pending')

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-6 lg:p-8 space-y-8 min-h-screen bg-[#F3F4F6]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-sm text-gray-500 font-medium mb-1">{greeting} 👋</p>
          <h1 className="text-3xl font-bold text-[#0B2341]">Dr. {firstName}&apos;s Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/specialist/availability"
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-[#0B2341] border border-gray-200 px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm whitespace-nowrap"
          >
            Update Availability
          </Link>
          <Link
            href="/dashboard/specialist/sessions"
            className="flex items-center gap-2 bg-[#0B2341] hover:bg-[#071829] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md whitespace-nowrap"
          >
            Manage Sessions
          </Link>
        </div>
      </div>

      {!specProfile?.verified && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-4">
          <div className="text-amber-500 text-2xl mt-0.5">⚠️</div>
          <div>
            <h3 className="font-bold text-amber-900">Profile Verification Pending</h3>
            <p className="text-sm text-amber-700 mt-1">
              Your profile and credentials are currently under review by our medical/admin team. You will not appear in search results until approved.
            </p>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Upcoming Sessions',
            value: upcomingSessions?.length || 0,
            icon: '📅',
            color: 'from-[#0B2341] to-[#1a3a5c]',
            text: 'text-white',
          },
          {
            label: 'Pending Requests',
            value: pendingRequests || 0,
            icon: '🔔',
            color: 'from-amber-500 to-amber-400',
            text: 'text-white',
          },
          {
            label: 'Active IEPs',
            value: 0,
            icon: '📋',
            color: 'from-teal-600 to-teal-500',
            text: 'text-white',
          },
          {
            label: 'Total Earnings',
            value: 'SAR 0',
            icon: '💰',
            color: 'from-purple-600 to-purple-500',
            text: 'text-white',
          },
        ].map((stat) => (
          <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 relative overflow-hidden shadow-md`}>
            <div className="absolute top-0 right-0 text-5xl opacity-10 translate-x-2 -translate-y-2">{stat.icon}</div>
            <p className={`text-sm font-medium opacity-80 ${stat.text} mb-1`}>{stat.label}</p>
            <p className={`text-3xl font-black ${stat.text}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#0B2341]">Upcoming Sessions</h2>
              <Link href="/dashboard/specialist/sessions" className="text-sm text-blue-600 font-semibold hover:underline">View Calendar</Link>
            </div>
            <div className="space-y-4">
              {upcomingSessions && upcomingSessions.length > 0 ? (
                upcomingSessions.map((session: any) => (
                  <div key={session.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs font-bold uppercase">{new Date(session.date).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-lg font-black leading-none">{new Date(session.date).getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#0B2341] truncate">{session.service_type || 'Therapy Session'}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                        <span>🕒 {session.time}</span>
                        <span>•</span>
                        <span>👤 {(session.beneficiary as any)?.full_name || 'Patient'}</span>
                      </p>
                    </div>
                    <Link href={`/dashboard/specialist/sessions/${session.id}`} className="px-4 py-2 bg-gray-50 text-gray-700 text-sm font-bold rounded-lg group-hover:bg-[#0B2341] group-hover:text-white transition-colors">
                      Details
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No upcoming sessions scheduled.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-[#0B2341] mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { href: '/dashboard/specialist/iep',        icon: '📋', label: 'Manage IEPs',      color: 'bg-teal-50 text-teal-700' },
                { href: '/dashboard/specialist/patients',   icon: '👥', label: 'My Beneficiaries', color: 'bg-blue-50 text-blue-700' },
                { href: '/dashboard/specialist/earnings',   icon: '💰', label: 'Earnings & Payout',color: 'bg-green-50 text-green-700' },
                { href: '/dashboard/specialist/settings',   icon: '⚙️', label: 'Profile Settings', color: 'bg-gray-50 text-gray-700' },
              ].map(a => (
                <Link key={a.href} href={a.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100">
                  <div className={`w-9 h-9 ${a.color} rounded-lg flex items-center justify-center text-base`}>{a.icon}</div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-[#0B2341]">{a.label}</span>
                  <span className="ml-auto text-gray-300 group-hover:text-blue-600 transition-colors">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

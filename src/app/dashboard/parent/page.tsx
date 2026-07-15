import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Beneficiary, Booking } from '@/types'

export default async function ParentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get parent profile
  let { data: parentProfile } = await supabase
    .from('parent_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  // Auto-create parent profile for old test accounts that don't have one
  if (!parentProfile) {
    const { data: newProfile, error } = await supabase
      .from('parent_profiles')
      .insert({ id: user.id, user_id: user.id })
      .select('id')
      .single()
    
    if (!error && newProfile) {
      parentProfile = newProfile
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const firstName = profile?.full_name?.split(' ')[0] || 'Parent'

  let beneficiaries: Beneficiary[] = []
  let upcomingBookings: (Booking & { beneficiary?: { full_name: string } })[] = []
  let pendingReports = 0

  if (parentProfile) {
    const { data: benData } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('parent_id', parentProfile.id)
    beneficiaries = benData || []

    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('*, beneficiary:beneficiary_id(full_name)')
      .eq('parent_id', parentProfile.id)
      .in('status', ['pending', 'accepted'])
      .order('date', { ascending: true })
      .limit(5)
    
    // cast result
    upcomingBookings = (bookingsData as any) || []

    const { count } = await supabase
      .from('progress_reports')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', parentProfile.id)
    pendingReports = count || 0
  }

  const totalSessions = upcomingBookings.length
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-6 lg:p-8 space-y-8 min-h-screen bg-[#F3F4F6]">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-sm text-gray-500 font-medium mb-1">{greeting} 👋</p>
          <h1 className="text-3xl font-bold text-[#0B2341]">{firstName}&apos;s Dashboard</h1>
        </div>
        <Link
          href="/dashboard/parent/beneficiaries/new"
          className="flex items-center gap-2 bg-[#0B2341] hover:bg-[#071829] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg whitespace-nowrap"
        >
          <span className="text-lg font-bold">+</span> Add a Hero
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'My Heroes',
            value: beneficiaries.length,
            icon: '🦸‍♂️',
            color: 'from-[#0B2341] to-[#1a3a5c]',
            text: 'text-white',
            sub: beneficiaries.length === 0 ? 'Add your first hero' : `${beneficiaries.length} profile${beneficiaries.length > 1 ? 's' : ''} active`,
          },
          {
            label: 'Upcoming Sessions',
            value: totalSessions,
            icon: '📅',
            color: 'from-amber-500 to-amber-400',
            text: 'text-white',
            sub: totalSessions === 0 ? 'No sessions booked' : 'Sessions confirmed',
          },
          {
            label: 'Reports',
            value: pendingReports,
            icon: '📊',
            color: 'from-teal-600 to-teal-500',
            text: 'text-white',
            sub: pendingReports === 0 ? 'No new reports' : 'Progress reports',
          },
          {
            label: 'Find Specialists',
            value: '→',
            icon: '🔍',
            color: 'from-purple-600 to-purple-500',
            text: 'text-white',
            sub: 'Browse verified providers',
            href: '/dashboard/parent/specialists',
          },
        ].map((stat) =>
          stat.href ? (
            <Link key={stat.label} href={stat.href} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 relative overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-0.5 group`}>
              <div className="absolute top-0 right-0 text-5xl opacity-10 translate-x-2 -translate-y-2 group-hover:opacity-20 transition-opacity">{stat.icon}</div>
              <p className={`text-sm font-medium opacity-80 ${stat.text} mb-1`}>{stat.label}</p>
              <p className={`text-3xl font-black ${stat.text}`}>{stat.value}</p>
              <p className={`text-xs mt-1 opacity-70 ${stat.text}`}>{stat.sub}</p>
            </Link>
          ) : (
            <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 relative overflow-hidden shadow-md`}>
              <div className="absolute top-0 right-0 text-5xl opacity-10 translate-x-2 -translate-y-2">{stat.icon}</div>
              <p className={`text-sm font-medium opacity-80 ${stat.text} mb-1`}>{stat.label}</p>
              <p className={`text-3xl font-black ${stat.text}`}>{stat.value}</p>
              <p className={`text-xs mt-1 opacity-70 ${stat.text}`}>{stat.sub}</p>
            </div>
          )
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Children Cards */}
        <div className="xl:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#0B2341]">My Heroes</h2>
            <span className="text-sm text-gray-400">{beneficiaries.length} registered</span>
          </div>
          {beneficiaries.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {beneficiaries.map((b) => (
                <Link href={`/dashboard/parent/student/${b.id}/learning-profile`} key={b.id} className="group">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#0B2341] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-100 text-[#0B2341] rounded-full flex items-center justify-center font-black text-xl shadow-inner">
                        {b.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-[#0B2341] text-base group-hover:text-blue-600 transition-colors truncate">{b.full_name}</h3>
                        <p className="text-xs text-gray-500 font-medium">{b.date_of_birth ? new Date().getFullYear() - new Date(b.date_of_birth).getFullYear() + ' years old' : 'Age unknown'}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Conditions</span>
                        <span className="text-[#0B2341] font-semibold truncate ml-2 max-w-[150px]">{(b.conditions && b.conditions.length > 0) ? b.conditions.join(', ') : 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Communication</span>
                        <span className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full text-[10px]">{b.communication_level || '—'}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-medium">View full profile & IEP</span>
                      <span className="text-[#0B2341] text-sm font-bold group-hover:translate-x-1 transition-transform inline-block">→</span>
                    </div>
                  </div>
                </Link>
              ))}
              {/* Add Child Card */}
              <Link href="/dashboard/parent/beneficiaries/new" className="group">
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-6 shadow-sm hover:border-[#0B2341] hover:bg-gray-50 transition-all flex flex-col items-center justify-center text-center min-h-[168px]">
                  <div className="w-12 h-12 bg-gray-100 group-hover:bg-[#0B2341] group-hover:text-white rounded-full flex items-center justify-center text-2xl mb-3 transition-colors text-gray-400">+</div>
                  <p className="text-sm font-semibold text-gray-500 group-hover:text-[#0B2341] transition-colors">Add Another</p>
                </div>
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center shadow-sm">
              <div className="text-5xl mb-4">🦸‍♀️</div>
              <h3 className="text-lg font-bold text-[#0B2341] mb-2">No heroes added yet</h3>
              <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">Add a profile for your hero first to get AI-powered recommendations and track their individualized plan.</p>
              <Link href="/dashboard/parent/beneficiaries/new" className="inline-flex items-center gap-2 bg-[#0B2341] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#071829] transition-all shadow-md">
                <span className="font-bold">+</span> Add Profile
              </Link>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Upcoming Sessions */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-[#0B2341]">Upcoming Sessions</h3>
              <Link href="/dashboard/parent/sessions" className="text-xs text-blue-600 font-semibold hover:underline">See all</Link>
            </div>
            <div className="divide-y divide-gray-100">
              {upcomingBookings.length > 0 ? upcomingBookings.map(b => (
                <div key={b.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm">📅</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#0B2341] truncate">{b.service_type || 'Therapy Session'}</p>
                    <p className="text-xs text-gray-500">{new Date(b.date).toLocaleDateString()} • {b.time} ({b.session_type.replace(/_/g, ' ')})</p>
                    {b.beneficiary && <p className="text-[10px] text-gray-400 mt-0.5">For: {b.beneficiary.full_name}</p>}
                  </div>
                </div>
              )) : (
                <div className="px-5 py-6 text-center">
                  <p className="text-sm text-gray-500 mb-2">No upcoming sessions</p>
                  <Link href="/dashboard/parent/specialists" className="text-xs text-blue-600 font-semibold inline-block hover:underline">Find specialists →</Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-[#0B2341] mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { href: '/dashboard/parent/specialists',   icon: '🩺', label: 'Find a Specialist',     color: 'bg-blue-50 text-blue-700' },
                { href: '/dashboard/parent/sessions',      icon: '📅', label: 'Manage Sessions',       color: 'bg-amber-50 text-amber-700' },
                { href: '/dashboard/parent/iep',           icon: '📝', label: 'IEP Plans',             color: 'bg-purple-50 text-purple-700' },
                { href: '/dashboard/parent/smart-match',   icon: '✨', label: 'AI Match',              color: 'bg-teal-50 text-teal-700' },
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

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function BeneficiaryDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'beneficiary') {
    redirect('/dashboard/parent')
  }

  const { data: benProfile } = await supabase
    .from('beneficiaries')
    .select('*')
    .eq('id', user.id)
    .single()

  const firstName = profile?.full_name?.split(' ')[0] || 'There'

  // Fetch some stats
  const { data: upcomingSessions } = await supabase
    .from('bookings')
    .select('*, specialist:specialist_id(full_name)')
    .eq('beneficiary_id', user.id)
    .in('status', ['accepted'])
    .order('date', { ascending: true })
    .limit(5)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-6 lg:p-8 space-y-8 min-h-screen bg-[#F3F4F6]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-sm text-gray-500 font-medium mb-1">{greeting} 👋</p>
          <h1 className="text-3xl font-bold text-[#0B2341]">Hi, {firstName}!</h1>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: 'Upcoming Sessions',
            value: upcomingSessions?.length || 0,
            icon: '📅',
            color: 'from-[#0B2341] to-[#1a3a5c]',
            text: 'text-white',
          },
          {
            label: 'Goals Met',
            value: 0,
            icon: '🎯',
            color: 'from-amber-500 to-amber-400',
            text: 'text-white',
          },
          {
            label: 'Progress Reports',
            value: 0,
            icon: '📊',
            color: 'from-teal-600 to-teal-500',
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
              <Link href="/dashboard/beneficiary/sessions" className="text-sm text-blue-600 font-semibold hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
              {upcomingSessions && upcomingSessions.length > 0 ? (
                upcomingSessions.map((session: any) => (
                  <div key={session.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs font-bold uppercase">{new Date(session.date).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-lg font-black leading-none">{new Date(session.date).getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#0B2341] truncate">{session.service_type || 'Therapy Session'}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                        <span>🕒 {session.time}</span>
                        <span>•</span>
                        <span>🩺 {session.specialist?.full_name || 'Specialist'}</span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🛋️</div>
                  <p className="text-gray-500">No upcoming sessions scheduled.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-[#0B2341] mb-4">Quick Links</h3>
            <div className="space-y-2">
              {[
                { href: '/dashboard/beneficiary/progress',  icon: '📈', label: 'My Progress', color: 'bg-teal-50 text-teal-700' },
                { href: '/dashboard/beneficiary/sessions',  icon: '📅', label: 'My Calendar', color: 'bg-blue-50 text-blue-700' },
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

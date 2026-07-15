import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function TutorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const { data: tutorProfile } = await supabase
    .from('tutor_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const firstName = profile?.full_name?.split(' ')[0] || 'Tutor'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  if (!tutorProfile) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 font-medium">Tutor profile not found. Please contact support.</div>
      </div>
    )
  }

  const bookings: any[] = []
  
  const pendingBookings   = bookings.filter(b => b.status === 'pending')
  const upcomingBookings  = bookings.filter(b => b.status === 'accepted')
  const completedBookings = bookings.filter(b => b.status === 'completed')
  const uniqueStudents    = 0
  const totalEarnings     = 0
  const isVerified        = tutorProfile.verification_status === 'verified'

  const { data: specialNeedsStudents } = await supabase
    .from('students')
    .select('id, full_name, grade, special_conditions, motivators, triggers, communication_level')
    .eq('has_special_needs', true)
    .not('special_conditions', 'eq', '{}')
    .limit(5)

  return (
    <div className="p-6 lg:p-8 space-y-7 min-h-screen" style={{ background: '#F8F9FB' }}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-sm text-gray-400 font-medium mb-0.5">{greeting}</p>
          <h1 className="text-2xl font-bold text-[#0B2341] tracking-tight">{firstName}&apos;s Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          {isVerified ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Pending Verification
            </span>
          )}
          <button className="text-sm font-semibold text-[#0B2341] bg-white border border-gray-200 px-4 py-2 rounded-xl hover:border-[#0B2341]/30 hover:shadow-sm transition-all">
            Edit Profile
          </button>
        </div>
      </div>

      {/* ── Stats Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Earnings',   value: `${totalEarnings.toFixed(0)} BHD`, accent: '#10B981', sub: 'From completed sessions' },
          { label: 'Total Students',   value: uniqueStudents,                     accent: '#0B2341', sub: 'Unique students taught' },
          { label: 'Pending Requests', value: pendingBookings.length,             accent: '#F59E0B', sub: pendingBookings.length > 0 ? 'Awaiting your response' : 'All caught up' },
          { label: 'Upcoming',         value: upcomingBookings.length,            accent: '#6366F1', sub: 'Sessions confirmed' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 relative overflow-hidden hover:shadow-sm transition-shadow">
            {/* Left accent bar */}
            <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full" style={{ background: s.accent }} />
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 pl-3">{s.label}</p>
            <p className="text-2xl font-bold text-[#0B2341] pl-3 mb-0.5">{s.value}</p>
            <p className="text-[11px] text-gray-400 pl-3">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── Left Column ──────────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-6">
          {/* Pending Booking Requests */}
          {pendingBookings.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <h3 className="font-semibold text-[#0B2341] text-sm">Booking Requests</h3>
                  <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingBookings.length}</span>
                </div>
                <button className="text-xs text-gray-400 font-medium hover:text-[#0B2341] transition-colors">View all</button>
              </div>
              <div className="divide-y divide-gray-50">
                {pendingBookings.slice(0, 3).map(b => (
                  <div key={b.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className="w-10 h-10 bg-[#0B2341]/5 rounded-xl flex items-center justify-center font-semibold text-[#0B2341] text-sm">
                      {b.students?.full_name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0B2341]">{b.subject}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{b.students?.full_name} · {new Date(b.date).toLocaleDateString()} at {b.time}</p>
                    </div>
                    <button className="text-xs font-semibold text-[#0B2341] bg-[#0B2341]/5 hover:bg-[#0B2341]/10 px-4 py-2 rounded-lg transition-colors">Review</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Sessions */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                </div>
                <h3 className="font-semibold text-[#0B2341] text-sm">Upcoming Sessions</h3>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {upcomingBookings.length > 0 ? upcomingBookings.slice(0, 5).map(b => (
                <div key={b.id} className="px-6 py-4 flex items-center gap-4 group hover:bg-gray-50/50 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.5)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0B2341]">{b.subject} <span className="text-gray-400 font-normal ml-1">with {b.students?.full_name}</span></p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(b.date).toLocaleDateString()} · {b.time} · {b.duration_minutes} min · <span className="capitalize text-indigo-500">{b.session_type}</span></p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold text-[#0B2341]">{b.total_price} BHD</span>
                    <button className="text-xs text-gray-400 border border-gray-200 bg-white hover:border-[#0B2341]/30 hover:text-[#0B2341] px-3 py-1.5 rounded-lg font-medium transition-all">Add Notes</button>
                  </div>
                </div>
              )) : (
                <div className="px-6 py-14 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>
                  </div>
                  <p className="text-sm font-semibold text-[#0B2341] mb-1">No upcoming sessions</p>
                  <p className="text-xs text-gray-400 max-w-[200px] text-center leading-relaxed">Sessions will appear here when students book with you.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity / Completed */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </div>
                <h3 className="font-semibold text-[#0B2341] text-sm">Recent Activity</h3>
              </div>
            </div>
            <div className="px-6 py-10 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <p className="text-sm font-semibold text-[#0B2341] mb-1">No recent activity</p>
              <p className="text-xs text-gray-400 max-w-[220px] text-center leading-relaxed">Your completed sessions and activity log will appear here.</p>
            </div>
          </div>
        </div>

        {/* ── Right Column ─────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Subtle accent line */}
            <div className="h-1 bg-gradient-to-r from-[#0B2341] via-[#1a3a5c] to-[#D4A017]" />
            <div className="px-6 pt-7 pb-6 text-center">
              {tutorProfile.avatar_url ? (
                <img src={tutorProfile.avatar_url} alt="Avatar" className="w-16 h-16 rounded-2xl mx-auto mb-4 border-2 border-gray-100 shadow-sm object-cover" />
              ) : (
                <div className="w-16 h-16 bg-[#0B2341] rounded-2xl flex items-center justify-center font-bold text-white text-xl mx-auto mb-4 shadow-sm">
                  {tutorProfile.full_name?.charAt(0) || 'T'}
                </div>
              )}
              <p className="font-bold text-[#0B2341] text-base">{tutorProfile.full_name}</p>
              <div className="flex justify-center items-center gap-1 text-amber-500 mt-1.5 text-sm font-semibold">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.065 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z"/></svg>
                <span>{tutorProfile.rating_average > 0 ? tutorProfile.rating_average.toFixed(1) : 'New'}</span>
              </div>
            </div>
            <div className="border-t border-gray-100 mx-4" />
            <div className="px-6 py-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400 font-medium">Hourly Rate</span>
                <span className="font-bold text-[#0B2341]">{tutorProfile.price_per_hour} <span className="text-xs text-gray-400 font-normal">BHD</span></span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400 font-medium">Sessions Done</span>
                <span className="font-bold text-[#0B2341]">{tutorProfile.total_sessions}</span>
              </div>
              {(tutorProfile.subjects || []).length > 0 && (
                <div className="pt-1">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">Subjects</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(tutorProfile.subjects || []).slice(0, 4).map((s: string) => (
                      <span key={s} className="bg-gray-50 text-gray-600 text-[10px] font-semibold px-2.5 py-1 rounded-md border border-gray-100">{s}</span>
                    ))}
                    {(tutorProfile.subjects || []).length > 4 && (
                      <span className="text-[10px] text-gray-400 font-medium self-center">+{tutorProfile.subjects.length - 4}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Special Needs Student Briefing */}
          {specialNeedsStudents && specialNeedsStudents.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 bg-[#0B2341] text-white">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  Special Needs Briefing
                </h3>
                <p className="text-[10px] text-white/60 mt-0.5">Confidential — Review before each session</p>
              </div>
              <div className="p-4 space-y-3">
                {specialNeedsStudents.map((s: any) => {
                  const conditions: string[] = s.special_conditions || []
                  return (
                    <div key={s.id} className="border border-gray-100 rounded-xl overflow-hidden">
                      <div className="flex items-center gap-2.5 p-3 bg-gray-50">
                        <div className="w-8 h-8 rounded-lg bg-[#0B2341] flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                          {s.full_name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#0B2341] truncate">{s.full_name}</p>
                          <p className="text-[10px] text-gray-400">{s.grade}</p>
                        </div>
                      </div>
                      <div className="p-3 space-y-2">
                        {conditions.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {conditions.map((c: string) => (
                              <span key={c} className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-md font-semibold">
                                {c.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        )}
                        {s.motivators && (
                          <div className="flex gap-2">
                            <span className="text-xs mt-0.5 text-emerald-500 shrink-0">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.065 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z"/></svg>
                            </span>
                            <div>
                              <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Motivators</p>
                              <p className="text-[10px] text-gray-600 leading-tight">{s.motivators}</p>
                            </div>
                          </div>
                        )}
                        {s.triggers && (
                          <div className="flex gap-2">
                            <span className="text-xs mt-0.5 text-red-400 shrink-0">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            </span>
                            <div>
                              <p className="text-[9px] font-semibold text-red-400 uppercase tracking-wider">Avoid</p>
                              <p className="text-[10px] text-gray-600 leading-tight">{s.triggers}</p>
                            </div>
                          </div>
                        )}
                        {s.communication_level && (
                          <div className="flex items-center gap-2">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            <span className="text-[10px] text-gray-500 font-medium">Communication: <strong className="text-[#0B2341]">{s.communication_level}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                <p className="text-[10px] text-gray-300 text-center pt-1">
                  This information is confidential — for the specialist only
                </p>
              </div>
            </div>
          )}

          {/* Quick Tools */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-[#0B2341] text-sm mb-4">Quick Tools</h3>
            <div className="space-y-1.5">
              {[
                { icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, label: 'Manage Requests', href: '/dashboard/tutor/pending' },
                { icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>, label: 'My Students', href: '/dashboard/tutor/students' },
                { icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>, label: 'Account Settings', href: '/dashboard/tutor/settings' },
              ].map(a => (
                <Link key={a.label} href={a.href} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group">
                  <div className="w-9 h-9 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-[#0B2341] group-hover:border-gray-200 transition-colors">
                    {a.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-600 group-hover:text-[#0B2341] transition-colors flex-1">{a.label}</span>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-[#0B2341] transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

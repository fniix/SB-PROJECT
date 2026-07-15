import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// Generate smart notifications from real data
async function buildNotifications(supabase: any, userId: string, role: string) {
  const items: { id: string; type: string; icon: string; title: string; body: string; href: string; time: string; color: string }[] = []

  if (role === 'parent') {
    const { data: pp } = await supabase.from('parent_profiles').select('id').eq('user_id', userId).single()
    if (!pp) return items

    const { data: students } = await supabase.from('students').select('id, full_name').eq('parent_id', pp.id)
    const sIds = (students || []).map((s: any) => s.id)

    const { data: bookings } = await supabase
      .from('bookings').select('*').eq('parent_id', pp.id)
      .order('created_at', { ascending: false }).limit(10)

    const { data: reports } = await supabase
      .from('progress_reports').select('*').eq('parent_id', pp.id)
      .order('created_at', { ascending: false }).limit(5)

    const { data: assignments } = sIds.length > 0
      ? await supabase.from('assignments').select('*, students(full_name)').in('student_id', sIds).eq('status', 'pending').limit(5)
      : { data: [] }

    ;(bookings || []).forEach((b: any) => {
      if (b.status === 'accepted') items.push({ id: `booking-${b.id}`, type: 'booking', icon: '✅', title: 'Booking Confirmed', body: `Your ${b.subject} session on ${new Date(b.date).toLocaleDateString()} was accepted by the tutor.`, href: '/dashboard/parent/bookings', time: b.updated_at || b.created_at, color: 'bg-green-50 border-green-100' })
      if (b.status === 'rejected') items.push({ id: `booking-rej-${b.id}`, type: 'booking', icon: '❌', title: 'Booking Declined', body: `Your ${b.subject} session request was declined. Try another tutor.`, href: '/dashboard/parent/tutors', time: b.updated_at || b.created_at, color: 'bg-red-50 border-red-100' })
      if (b.status === 'completed') items.push({ id: `booking-done-${b.id}`, type: 'session', icon: '🎓', title: 'Session Completed', body: `${b.subject} session on ${new Date(b.date).toLocaleDateString()} was marked as completed. Check the progress report.`, href: '/dashboard/parent/reports', time: b.updated_at || b.created_at, color: 'bg-blue-50 border-blue-100' })
    })

    ;(reports || []).forEach((r: any) => {
      items.push({ id: `report-${r.id}`, type: 'report', icon: '📊', title: 'New Progress Report', body: `Your child's tutor has submitted a progress report. View it now.`, href: '/dashboard/parent/reports', time: r.created_at, color: 'bg-purple-50 border-purple-100' })
    })

    ;(assignments || []).forEach((a: any) => {
      items.push({ id: `asgn-${a.id}`, type: 'assignment', icon: '📚', title: 'New Assignment', body: `${a.students?.full_name || 'Your child'} has a new assignment: "${a.title}". Due: ${a.due_date ? new Date(a.due_date).toLocaleDateString() : 'No deadline'}.`, href: '/dashboard/parent/assignments', time: a.created_at, color: 'bg-amber-50 border-amber-100' })
    })
  }

  if (role === 'tutor') {
    const { data: tp } = await supabase.from('tutor_profiles').select('id, verification_status').eq('user_id', userId).single()
    if (!tp) return items

    const { data: pendingBookings } = await supabase
      .from('bookings').select('*').eq('tutor_id', tp.id).eq('status', 'pending')
      .order('created_at', { ascending: false }).limit(5)

    ;(pendingBookings || []).forEach((b: any) => {
      items.push({ id: `pending-${b.id}`, type: 'booking', icon: '📩', title: 'New Booking Request', body: `You have a new ${b.subject} booking request for ${new Date(b.date).toLocaleDateString()} at ${b.time}. Accept or decline now.`, href: '/dashboard/tutor/bookings', time: b.created_at, color: 'bg-amber-50 border-amber-100' })
    })

    if (tp.verification_status === 'pending') {
      items.push({ id: 'verify', type: 'system', icon: '⏳', title: 'Verification Pending', body: 'Your account is under review by the admin team. You will be notified once verified.', href: '/dashboard/tutor/settings', time: new Date().toISOString(), color: 'bg-blue-50 border-blue-100' })
    }
    if (tp.verification_status === 'approved') {
      items.push({ id: 'approved', type: 'system', icon: '✅', title: 'Account Verified!', body: 'Congratulations! Your tutor account has been approved. You can now receive booking requests.', href: '/dashboard/tutor', time: new Date().toISOString(), color: 'bg-green-50 border-green-100' })
    }
  }

  // Sort by most recent
  return items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 20)
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 2) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hrs < 24) return `${hrs}h ago`
  return `${days}d ago`
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = user.user_metadata?.role || 'parent'
  const notifications = await buildNotifications(supabase, user.id, role)

  const typeFilters = ['all', 'booking', 'session', 'report', 'assignment', 'system']
  const counts: Record<string, number> = { all: notifications.length }
  notifications.forEach(n => { counts[n.type] = (counts[n.type] || 0) + 1 })

  return (
    <div className="min-h-screen bg-[#F0EDE8] p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0B2341]">Notifications</h1>
          <p className="text-gray-500 mt-1">{notifications.length} notifications</p>
        </div>
        <div className="w-10 h-10 bg-[#0B2341] rounded-xl flex items-center justify-center relative">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          {notifications.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#D4A017] rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-white">
              {Math.min(notifications.length, 9)}{notifications.length > 9 ? '+' : ''}
            </span>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">🔔</div>
          <h3 className="font-bold text-[#0B2341] text-xl mb-2">All caught up!</h3>
          <p className="text-gray-400 text-sm">No notifications at the moment. Check back later.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <Link key={n.id} href={n.href} className={`flex items-start gap-4 p-5 rounded-2xl border ${n.color} hover:shadow-md transition-all group`}>
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm shrink-0">
                {n.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#0B2341] text-sm">{n.title}</p>
                <p className="text-gray-600 text-sm mt-0.5 leading-relaxed">{n.body}</p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-xs text-gray-400">{timeAgo(n.time)}</span>
                <span className="text-gray-300 group-hover:text-[#D4A017] transition-colors">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

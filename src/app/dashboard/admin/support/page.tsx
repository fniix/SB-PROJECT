import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminSupportTicketsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('*, user:user_id(full_name, email)')
    .order('created_at', { ascending: false })

  const open = tickets?.filter(t => t.status === 'open').length || 0
  const inProgress = tickets?.filter(t => t.status === 'in_progress').length || 0
  const resolved = tickets?.filter(t => t.status === 'resolved').length || 0
  const safety = tickets?.filter(t => t.priority === 'safety').length || 0

  const statusColor: Record<string, string> = {
    open: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-amber-100 text-amber-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-600',
  }
  const priorityColor: Record<string, string> = {
    normal: 'bg-gray-100 text-gray-600',
    urgent: 'bg-orange-100 text-orange-700',
    safety: 'bg-red-100 text-red-700',
    payment: 'bg-purple-100 text-purple-700',
  }

  return (
    <div className="p-6 space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div>
        <h1 className="text-2xl font-black text-[#0B2341]">🎫 Support Tickets — Admin</h1>
        <p className="text-gray-400 text-sm mt-1">Manage all user support requests and resolve issues</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Open', value: open, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'In Progress', value: inProgress, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Resolved', value: resolved, color: 'text-green-600', bg: 'bg-green-50' },
          { label: '⚠️ Safety', value: safety, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-5 border border-gray-100`}>
            <p className="text-gray-500 text-sm font-medium">{s.label}</p>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Safety warning */}
      {safety > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-black text-red-700">{safety} Safety-Priority Ticket{safety > 1 ? 's' : ''} Require Immediate Attention</p>
            <p className="text-red-600 text-sm">Review and respond within 24 hours.</p>
          </div>
        </div>
      )}

      {/* Tickets Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-[#0B2341] text-lg">All Tickets ({tickets?.length || 0})</h2>
        </div>
        {!tickets || tickets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">✅</div>
            <p className="font-bold text-gray-400">No tickets</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map(t => (
              <div key={t.id} className={`p-5 rounded-xl border-l-4 ${t.priority === 'safety' ? 'border-red-400 bg-red-50' : t.priority === 'urgent' ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-[#F0EDE8]'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-black text-[#0B2341] text-sm">#{t.id.slice(0, 6).toUpperCase()}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[t.status] || 'bg-gray-100 text-gray-600'}`}>
                        {t.status?.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${priorityColor[t.priority] || 'bg-gray-100'}`}>
                        {t.priority?.toUpperCase()}
                      </span>
                      <span className="text-xs bg-white text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">{t.category}</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-2">{t.message}</p>
                    <p className="text-gray-400 text-xs">
                      From: <strong>{t.user?.full_name || 'Unknown'}</strong> ({t.user?.email})
                      {t.booking_id && ` • Booking: #${t.booking_id.slice(0, 8).toUpperCase()}`}
                    </p>
                  </div>
                  <div className="text-right shrink-0 space-y-2">
                    <p className="text-xs text-gray-400">{t.created_at ? new Date(t.created_at).toLocaleDateString('en-GB') : ''}</p>
                    <form action={`/api/admin/tickets/${t.id}/update`} method="POST">
                      <select name="status" defaultValue={t.status}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#D4A017]">
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

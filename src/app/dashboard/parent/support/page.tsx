'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Ticket = {
  id: string
  category: string
  message: string
  status: string
  priority: string
  created_at: string
  booking_id?: string
}

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ category: '', message: '', priority: 'normal', booking_id: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setTickets(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('support_tickets').insert({
      user_id: user.id,
      category: form.category,
      message: form.message,
      priority: form.priority,
      booking_id: form.booking_id || null,
      status: 'open',
    })
    setSubmitting(false)
    setSubmitted(true)
    setShowForm(false)
    // reload
    const { data } = await supabase.from('support_tickets').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setTickets(data || [])
  }

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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-[#0B2341]">🎫 Support Tickets</h1>
          <p className="text-gray-400 text-sm mt-1">Submit and track your support requests</p>
        </div>
        <div className="flex gap-3">
          <a href="https://wa.me/973XXXXXXXX" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-green-600 transition-all">
            💬 WhatsApp
          </a>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-[#0B2341] text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#071829] border-2 border-transparent hover:border-[#D4A017] transition-all">
            + New Ticket
          </button>
        </div>
      </div>

      {/* New Ticket Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border-2 border-[#D4A017]/30 shadow-md p-6">
          <h2 className="font-black text-[#0B2341] text-lg mb-5">Open a Support Ticket</h2>
          {submitted && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 text-sm">✅ Ticket submitted! Our team will respond soon.</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#0B2341] mb-1.5">Category *</label>
                <select required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-[#F0EDE8] px-4 py-3 text-sm focus:outline-none focus:border-[#D4A017]">
                  <option value="">Select category</option>
                  <option value="booking">Booking Issue</option>
                  <option value="payment">Payment Question</option>
                  <option value="tutor">Tutor Concern</option>
                  <option value="safety">Safety Concern</option>
                  <option value="technical">Technical Problem</option>
                  <option value="refund">Refund Request</option>
                  <option value="general">General Question</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0B2341] mb-1.5">Priority</label>
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-[#F0EDE8] px-4 py-3 text-sm focus:outline-none focus:border-[#D4A017]">
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="payment">Payment</option>
                  <option value="safety">Safety ⚠️</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#0B2341] mb-1.5">Booking ID (optional)</label>
              <input type="text" placeholder="Paste booking ID if related to a session" value={form.booking_id}
                onChange={e => setForm({ ...form, booking_id: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-[#F0EDE8] px-4 py-3 text-sm focus:outline-none focus:border-[#D4A017]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#0B2341] mb-1.5">Message *</label>
              <textarea required rows={4} placeholder="Describe your issue in detail..." value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-[#F0EDE8] px-4 py-3 text-sm focus:outline-none focus:border-[#D4A017] resize-none" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-bold hover:border-gray-400 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="flex-[2] bg-[#0B2341] text-white py-3 rounded-xl font-black hover:bg-[#071829] border-2 border-transparent hover:border-[#D4A017] transition-all disabled:opacity-60">
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tickets List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-black text-[#0B2341] text-lg mb-5">Your Tickets</h2>
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🎫</div>
            <p className="font-bold text-gray-400">No tickets yet</p>
            <p className="text-gray-300 text-sm mt-1">Need help? Open a new ticket above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map(t => (
              <div key={t.id} className="p-4 rounded-xl bg-[#F0EDE8] border border-gray-100 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[t.status] || 'bg-gray-100 text-gray-600'}`}>
                        {t.status?.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${priorityColor[t.priority] || 'bg-gray-100'}`}>
                        {t.priority?.toUpperCase()}
                      </span>
                      <span className="text-xs bg-white text-gray-600 px-2.5 py-1 rounded-full font-medium border border-gray-200">{t.category}</span>
                    </div>
                    <p className="text-[#0B2341] text-sm font-medium leading-relaxed">{t.message}</p>
                    {t.booking_id && <p className="text-gray-400 text-xs mt-1">Booking: #{t.booking_id.slice(0, 8).toUpperCase()}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400">{t.created_at ? new Date(t.created_at).toLocaleDateString('en-GB') : ''}</p>
                    <p className="text-xs text-gray-300">#{t.id.slice(0, 6).toUpperCase()}</p>
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

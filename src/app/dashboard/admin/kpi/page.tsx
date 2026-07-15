import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminKPICharts from '@/components/AdminKPICharts'

const mockRevenue = [
  { name: 'Jan', revenue: 1200 },
  { name: 'Feb', revenue: 1900 },
  { name: 'Mar', revenue: 1500 },
  { name: 'Apr', revenue: 2200 },
  { name: 'May', revenue: 2800 },
  { name: 'Jun', revenue: 3500 },
]

const mockBookings = [
  { name: 'Jan', completed: 120, cancelled: 10 },
  { name: 'Feb', completed: 180, cancelled: 15 },
  { name: 'Mar', completed: 150, cancelled: 12 },
  { name: 'Apr', completed: 210, cancelled: 8 },
  { name: 'May', completed: 250, cancelled: 20 },
  { name: 'Jun', completed: 310, cancelled: 15 },
]

export default async function AdminKPIPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // Fetch data
  const { data: users } = await supabase.from('profiles').select('role, created_at')
  const { data: bookings } = await supabase.from('bookings').select('status, price, created_at')
  const { data: tickets } = await supabase.from('support_tickets').select('status, priority')

  // Users breakdown
  const totalUsers = users?.length || 0
  const parents = users?.filter(u => u.role === 'parent').length || 0
  const tutors = users?.filter(u => u.role === 'tutor').length || 0

  // Bookings breakdown
  const totalBookings = bookings?.length || 0
  const completed = bookings?.filter(b => b.status === 'completed').length || 0
  const cancelled = bookings?.filter(b => b.status === 'cancelled').length || 0
  const completionRate = totalBookings > 0 ? Math.round((completed / totalBookings) * 100) : 0

  // Financials
  const grossVolume = bookings?.filter(b => b.status === 'completed').reduce((s, b) => s + (b.price || 0), 0) || 0
  const platformRevenue = grossVolume * 0.15

  // Support health
  const openTickets = tickets?.filter(t => t.status === 'open' || t.status === 'in_progress').length || 0
  const safetyIssues = tickets?.filter(t => t.priority === 'safety').length || 0

  return (
    <div className="p-6 space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div>
        <h1 className="text-2xl font-black text-[#0B2341]">📈 KPI Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Platform health, conversion, and operational metrics</p>
      </div>

      {/* Row 1: Key Platform Metrics */}
      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-8">Platform Health</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: totalUsers, icon: '👥', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Parents', value: parents, icon: '👨‍👩‍👧', color: 'text-[#0B2341]', bg: 'bg-[#F0EDE8]' },
          { label: 'Approved Tutors', value: tutors, icon: '👨‍🏫', color: 'text-[#D4A017]', bg: 'bg-white border border-gray-100' },
          { label: 'Safety Incidents', value: safetyIssues, icon: '⚠️', color: safetyIssues > 0 ? 'text-red-600' : 'text-green-600', bg: safetyIssues > 0 ? 'bg-red-50' : 'bg-green-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-5 shadow-sm`}>
            <div className="flex justify-between items-start mb-2">
              <p className="text-gray-500 text-sm font-medium">{s.label}</p>
              <span className="text-xl">{s.icon}</span>
            </div>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Row 2: Business & Operations */}
      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-8">Operations & Revenue</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Bookings Performance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-[#0B2341]">Booking Funnel</h3>
            <span className="text-2xl">📅</span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Total Bookings</span>
              <span className="font-bold text-[#0B2341]">{totalBookings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Completed</span>
              <span className="font-bold text-green-600">{completed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Cancelled / Refunded</span>
              <span className="font-bold text-red-500">{cancelled}</span>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between items-end">
                <div>
                  <span className="block text-sm text-gray-500">Completion Rate</span>
                  <span className={`text-2xl font-black ${completionRate > 80 ? 'text-green-600' : 'text-amber-500'}`}>{completionRate}%</span>
                </div>
                <div className="w-1/2 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${completionRate > 80 ? 'bg-green-500' : 'bg-amber-400'}`} style={{ width: `${completionRate}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Performance */}
        <div className="bg-[#0B2341] rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 text-8xl opacity-5 translate-x-4 -translate-y-4">💰</div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-white">Financials</h3>
              <span className="text-2xl">💳</span>
            </div>
            <div className="space-y-5">
              <div>
                <span className="block text-sm text-blue-300">Gross Volume (Completed)</span>
                <span className="text-2xl font-black text-white">BD {grossVolume.toFixed(3)}</span>
              </div>
              <div>
                <span className="block text-sm text-blue-300">Net Platform Revenue (15%)</span>
                <span className="text-3xl font-black text-[#D4A017]">BD {platformRevenue.toFixed(3)}</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between">
              <span className="text-xs text-blue-200">Pending payouts not included</span>
              <Link href="/dashboard/admin/ledger" className="text-xs font-bold text-[#D4A017] hover:underline">View Ledger →</Link>
            </div>
          </div>
        </div>

        {/* Support Performance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-[#0B2341]">Support Load</h3>
            <span className="text-2xl">🎧</span>
          </div>
          <div className="flex flex-col items-center justify-center py-4">
            <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center mb-3 ${openTickets > 10 ? 'border-amber-400 text-amber-600' : 'border-green-400 text-green-600'}`}>
              <span className="text-3xl font-black">{openTickets}</span>
            </div>
            <p className="font-bold text-[#0B2341]">Active Tickets</p>
            <p className="text-xs text-gray-400 text-center mt-1">
              {openTickets === 0 ? 'Inbox zero! Great job.' : 'Tickets awaiting response or resolution.'}
            </p>
          </div>
          <div className="mt-2 pt-4 border-t border-gray-100 text-center">
            <Link href="/dashboard/admin/support" className="text-sm font-bold text-[#D4A017] hover:underline">Manage Tickets →</Link>
          </div>
        </div>

      </div>

      {/* Row 3: Charts */}
      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-8">Analytics Trends</h2>
      <AdminKPICharts revenueData={mockRevenue} bookingsData={mockBookings} />
    </div>
  )
}


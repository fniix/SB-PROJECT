import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function TutorEarningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, student:student_id(full_name)')
    .eq('tutor_id', user.id)
    .order('scheduled_at', { ascending: false })
    .limit(50)

  const completedBookings = bookings?.filter(b => b.status === 'completed') || []
  const pendingBookings = bookings?.filter(b => b.status === 'confirmed') || []

  const PLATFORM_FEE_PCT = 0.15
  const totalGross = completedBookings.reduce((s, b) => s + (b.price || 0), 0)
  const totalPlatformFee = totalGross * PLATFORM_FEE_PCT
  const totalNet = totalGross - totalPlatformFee

  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)

  const thisMonthBookings = completedBookings.filter(b => b.scheduled_at && new Date(b.scheduled_at) >= thisMonth)
  const thisMonthGross = thisMonthBookings.reduce((s, b) => s + (b.price || 0), 0)
  const thisMonthNet = thisMonthGross * (1 - PLATFORM_FEE_PCT)

  const pendingPayout = pendingBookings.reduce((s, b) => s + (b.price || 0), 0) * (1 - PLATFORM_FEE_PCT)

  return (
    <div className="p-6 space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div>
        <h1 className="text-2xl font-black text-[#0B2341]">💰 Earnings</h1>
        <p className="text-gray-400 text-sm mt-1">Your earnings breakdown and payout history</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'This Month', value: `BD ${thisMonthNet.toFixed(3)}`, sub: `${thisMonthBookings.length} sessions`, color: 'from-[#0B2341] to-[#1a3a5c]', text: 'white' },
          { label: 'Total Earned', value: `BD ${totalNet.toFixed(3)}`, sub: `${completedBookings.length} sessions`, color: 'bg-white', text: '#0B2341' },
          { label: 'Pending Payout', value: `BD ${pendingPayout.toFixed(3)}`, sub: `${pendingBookings.length} upcoming sessions`, color: 'bg-white', text: '#0B2341' },
          { label: 'Platform Fee (15%)', value: `BD ${totalPlatformFee.toFixed(3)}`, sub: 'Total deducted', color: 'bg-white', text: '#0B2341' },
        ].map(card => (
          <div key={card.label} className={`rounded-2xl p-5 shadow-sm border border-gray-100 ${card.color.startsWith('from') ? `bg-gradient-to-br ${card.color}` : card.color}`}>
            <p className={`text-sm font-medium mb-1 ${card.text === 'white' ? 'text-blue-300' : 'text-gray-400'}`}>{card.label}</p>
            <p className={`text-2xl font-black ${card.text === 'white' ? 'text-[#D4A017]' : 'text-[#0B2341]'}`}>{card.value}</p>
            <p className={`text-xs mt-1 ${card.text === 'white' ? 'text-blue-300' : 'text-gray-400'}`}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Commission Explainer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <h3 className="font-bold text-amber-800 mb-2">💡 How Your Earnings Work</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="font-black text-[#0B2341]">Session Price</p>
            <p className="text-gray-400">Set by you (e.g. BD 10)</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="font-black text-[#0B2341]">Platform Fee (15%)</p>
            <p className="text-gray-400">Deducted (e.g. BD 1.500)</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="font-black text-green-600">Your Payout</p>
            <p className="text-gray-400">Remaining (e.g. BD 8.500)</p>
          </div>
        </div>
        <p className="text-amber-700 text-xs mt-3">Payouts are processed after session completion. You can see your net amount per session in the history below.</p>
      </div>

      {/* Session History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-black text-[#0B2341] text-lg mb-5">Session History</h2>
        {!bookings || bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">📊</div>
            <p className="font-bold text-gray-400">No sessions yet</p>
            <p className="text-gray-300 text-sm mt-1">Your earnings will appear here after completed sessions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-bold text-gray-400 uppercase pb-3">Date</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase pb-3">Student</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase pb-3">Subject</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase pb-3">Status</th>
                  <th className="text-right text-xs font-bold text-gray-400 uppercase pb-3">Gross</th>
                  <th className="text-right text-xs font-bold text-gray-400 uppercase pb-3">Fee (15%)</th>
                  <th className="text-right text-xs font-bold text-gray-400 uppercase pb-3">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map(b => {
                  const gross = b.price || 0
                  const fee = gross * PLATFORM_FEE_PCT
                  const net = gross - fee
                  return (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="py-3 text-gray-500">
                        {b.scheduled_at ? new Date(b.scheduled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                      </td>
                      <td className="py-3 font-medium text-[#0B2341]">{b.student?.full_name || '—'}</td>
                      <td className="py-3 text-gray-500">{b.subject || '—'}</td>
                      <td className="py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          b.status === 'completed' ? 'bg-green-100 text-green-700' :
                          b.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>{b.status}</span>
                      </td>
                      <td className="py-3 text-right text-gray-600">BD {gross.toFixed(3)}</td>
                      <td className="py-3 text-right text-red-400">-BD {fee.toFixed(3)}</td>
                      <td className="py-3 text-right font-black text-green-600">BD {net.toFixed(3)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

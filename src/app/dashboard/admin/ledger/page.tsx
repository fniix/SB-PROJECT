import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminPaymentsLedgerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: ledger } = await supabase
    .from('wallet_ledger')
    .select('*, user:user_id(full_name, role, email)')
    .order('created_at', { ascending: false })
    .limit(100)

  const { data: bookings } = await supabase
    .from('bookings')
    .select('price')
    .eq('status', 'completed')

  const totalCredits = ledger?.filter(l => l.transaction_type === 'credit').reduce((s, l) => s + (l.amount || 0), 0) || 0
  const totalDebits = ledger?.filter(l => l.transaction_type === 'debit').reduce((s, l) => s + (l.amount || 0), 0) || 0
  const platformGross = bookings?.reduce((s, b) => s + (b.price || 0), 0) || 0
  const platformRevenue = platformGross * 0.15 // 15% fee

  return (
    <div className="p-6 space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div>
        <h1 className="text-2xl font-black text-[#0B2341]">💳 Payments & Ledger</h1>
        <p className="text-gray-400 text-sm mt-1">Global view of all wallet transactions and platform revenue</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total User Top-Ups', value: `BD ${totalCredits.toFixed(3)}`, icon: '💰', bg: 'bg-white border border-gray-100', color: 'text-green-600' },
          { label: 'Total Session Spend', value: `BD ${totalDebits.toFixed(3)}`, icon: '📉', bg: 'bg-white border border-gray-100', color: 'text-gray-700' },
          { label: 'Gross Bookings Volume', value: `BD ${platformGross.toFixed(3)}`, icon: '📊', bg: 'bg-[#F0EDE8]', color: 'text-[#0B2341]' },
          { label: 'Platform Revenue (15%)', value: `BD ${platformRevenue.toFixed(3)}`, icon: '👑', bg: 'bg-[#0B2341] text-white', color: 'text-[#D4A017]' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-5 shadow-sm`}>
            <div className="flex justify-between items-start mb-2">
              <p className={`text-sm font-medium ${s.bg.includes('text-white') ? 'text-gray-300' : 'text-gray-500'}`}>{s.label}</p>
              <span className="text-xl">{s.icon}</span>
            </div>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Full Ledger Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-[#0B2341] text-lg">Global Ledger (Last 100)</h2>
          <button className="text-sm font-bold text-[#D4A017] border border-[#D4A017] px-4 py-1.5 rounded-lg hover:bg-[#D4A017]/10 transition-colors">
            Export CSV
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-bold text-gray-400 uppercase pb-3">Date</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase pb-3">User</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase pb-3">Type</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase pb-3">Description</th>
                <th className="text-right text-xs font-bold text-gray-400 uppercase pb-3">Amount</th>
                <th className="text-right text-xs font-bold text-gray-400 uppercase pb-3">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ledger?.map(l => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="py-3 text-gray-500 text-xs">
                    {l.created_at ? new Date(l.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td className="py-3">
                    <p className="font-bold text-[#0B2341]">{l.user?.full_name || 'Unknown'}</p>
                    <p className="text-[10px] text-gray-400 uppercase">{l.user?.role || 'user'}</p>
                  </td>
                  <td className="py-3">
                    {l.transaction_type === 'credit' ? (
                      <span className="text-[10px] font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full uppercase">Credit IN</span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-full uppercase">Debit OUT</span>
                    )}
                  </td>
                  <td className="py-3 text-gray-600 text-xs max-w-[200px] truncate" title={l.reason}>
                    {l.reason || 'Transaction'}
                  </td>
                  <td className="py-3 text-right">
                    <p className={`font-black ${l.transaction_type === 'credit' ? 'text-green-600' : 'text-gray-600'}`}>
                      {l.transaction_type === 'credit' ? '+' : '-'}BD {Number(l.amount || 0).toFixed(3)}
                    </p>
                  </td>
                  <td className="py-3 text-right text-gray-500 text-xs font-medium">
                    BD {Number(l.balance_after || 0).toFixed(3)}
                  </td>
                </tr>
              ))}
              {(!ledger || ledger.length === 0) && <tr><td colSpan={6} className="py-4 text-center text-gray-400">No transactions found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

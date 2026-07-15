import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function WalletPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: transactions } = await supabase
    .from('wallet_ledger')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const balance = transactions?.[0]?.balance_after ?? 0
  const totalSpent = transactions?.filter(t => t.transaction_type === 'debit').reduce((s, t) => s + (t.amount || 0), 0) ?? 0
  const totalTopUps = transactions?.filter(t => t.transaction_type === 'credit').reduce((s, t) => s + (t.amount || 0), 0) ?? 0

  return (
    <div className="p-6 space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#0B2341]">💳 My Wallet</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your SB Project credits and payment history</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-[#0B2341] to-[#1a3a5c] rounded-2xl p-6 text-white col-span-1 sm:col-span-1 shadow-lg">
          <p className="text-blue-300 text-sm font-medium mb-1">Current Balance</p>
          <p className="text-4xl font-black text-[#D4A017]">BD {Number(balance).toFixed(3)}</p>
          <p className="text-blue-300 text-xs mt-2">Available for sessions</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-sm font-medium mb-1">Total Spent</p>
          <p className="text-2xl font-black text-[#0B2341]">BD {Number(totalSpent).toFixed(3)}</p>
          <p className="text-gray-400 text-xs mt-2">All session payments</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-sm font-medium mb-1">Total Topped Up</p>
          <p className="text-2xl font-black text-[#0B2341]">BD {Number(totalTopUps).toFixed(3)}</p>
          <p className="text-gray-400 text-xs mt-2">Total credits added</p>
        </div>
      </div>

      {/* Top Up Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-black text-[#0B2341] text-lg mb-5">Top Up Wallet</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {['5.000', '10.000', '20.000', '50.000'].map(amount => (
            <button key={amount}
              className="bg-[#F0EDE8] border-2 border-transparent hover:border-[#D4A017] text-[#0B2341] font-black py-4 rounded-xl transition-all text-center">
              <span className="block text-xs text-gray-400 font-normal">BD</span>
              {amount}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-bold text-[#0B2341] mb-1.5">Custom Amount (BD)</label>
            <input
              type="number"
              step="0.001"
              min="1"
              placeholder="Enter amount..."
              className="w-full rounded-xl border border-gray-200 bg-[#F0EDE8] px-4 py-3 text-sm focus:outline-none focus:border-[#D4A017]"
            />
          </div>
          <div className="flex items-end">
            <button className="bg-[#D4A017] text-white px-6 py-3 rounded-xl font-black hover:bg-[#b8860b] transition-all shadow-md whitespace-nowrap">
              💳 Top Up Now
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          💡 Payments processed securely via Stripe. Credits never expire.{' '}
          <Link href="/legal/refund" className="text-[#D4A017] hover:underline">Refund Policy →</Link>
        </p>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-black text-[#0B2341] text-lg mb-5">Transaction History</h2>
        {!transactions || transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">💳</div>
            <p className="font-bold text-gray-400">No transactions yet</p>
            <p className="text-gray-300 text-sm mt-1">Top up your wallet to get started!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map(t => (
              <div key={t.id} className="flex items-center justify-between py-3 px-4 rounded-xl bg-[#F0EDE8] border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    t.transaction_type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {t.transaction_type === 'credit' ? '⬆️' : '⬇️'}
                  </div>
                  <div>
                    <p className="font-semibold text-[#0B2341] text-sm">{t.reason || (t.transaction_type === 'credit' ? 'Wallet Top-Up' : 'Session Payment')}</p>
                    <p className="text-gray-400 text-xs">{t.created_at ? new Date(t.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black text-sm ${t.transaction_type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                    {t.transaction_type === 'credit' ? '+' : '-'}BD {Number(t.amount || 0).toFixed(3)}
                  </p>
                  <p className="text-gray-400 text-xs">Balance: BD {Number(t.balance_after || 0).toFixed(3)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

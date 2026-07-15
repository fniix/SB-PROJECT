import type { Metadata } from 'next'
import PublicNav from '@/components/PublicNav'
import PublicFooter from '@/components/PublicFooter'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Refund & Cancellation Policy — SB Project', description: 'SB Project refund and cancellation policy — full details on credits, no-shows, and dispute resolution.' }

const rules = [
  { scenario: 'Cancel 24+ hours before session', result: '100% wallet credit', icon: '✅', color: 'bg-green-50 border-green-200' },
  { scenario: 'Cancel 3–24 hours before session', result: '50% wallet credit', icon: '⚠️', color: 'bg-amber-50 border-amber-200' },
  { scenario: 'Cancel within 3 hours of session', result: 'No refund', icon: '❌', color: 'bg-red-50 border-red-200' },
  { scenario: 'Tutor cancels (any time)', result: '100% wallet credit', icon: '✅', color: 'bg-green-50 border-green-200' },
  { scenario: 'Tutor no-show', result: '100% wallet credit immediately', icon: '🛡️', color: 'bg-blue-50 border-blue-200' },
  { scenario: 'Student no-show', result: 'No refund (treated as late cancellation)', icon: '❌', color: 'bg-red-50 border-red-200' },
  { scenario: 'Technical issue (platform-caused)', result: '100% wallet credit or reschedule', icon: '🔧', color: 'bg-purple-50 border-purple-200' },
  { scenario: 'Wallet top-up (unused)', result: 'Refundable within 14 days by request', icon: '💰', color: 'bg-teal-50 border-teal-200' },
]

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      <PublicNav />
      <div className="pt-24 bg-[#0B2341] pb-12">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-black text-white mb-2">Refund & Cancellation Policy</h1>
          <p className="text-gray-300 text-sm">Last updated: June 2026 | SB Project, Kingdom of Bahrain</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <p className="text-gray-600 mb-10 leading-relaxed">
          SB Project is committed to transparent, fair refund and cancellation rules. Every rule below is shown to users on the checkout page before they confirm payment. Refunds are issued as wallet credits, not cash, unless a wallet top-up refund is requested within 14 days.
        </p>

        <h2 className="text-2xl font-black text-[#0B2341] mb-6">Cancellation Rules at a Glance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {rules.map(r => (
            <div key={r.scenario} className={`${r.color} border rounded-2xl p-5`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{r.icon}</span>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{r.scenario}</p>
                  <p className="font-black text-[#0B2341] mt-1">{r.result}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {[
          { title: 'How Wallet Credits Work', content: 'Refunds are credited to your SB Project wallet. Credits can be used for any future session or package. They do not expire. The wallet balance is visible in your Parent Dashboard at all times.' },
          { title: 'Dispute Resolution', content: 'If you believe a refund was applied incorrectly, open a support ticket from your dashboard within 7 days of the session. Our team will review the session log, attendance record, and any relevant evidence before making a decision.' },
          { title: 'Special Needs Sessions', content: 'Special needs support sessions follow the same cancellation rules. However, our team may offer additional flexibility in exceptional circumstances — particularly for first sessions or cases where the learner had a difficult experience.' },
          { title: 'Subscription & Package Cancellation', content: 'Monthly plans can be cancelled before the next renewal date. Sessions already used within the current month are non-refundable. Unused session credits for the remaining month are returned to your wallet.' },
        ].map(s => (
          <div key={s.title} className="mb-8">
            <h2 className="text-xl font-black text-[#0B2341] mb-3">{s.title}</h2>
            <p className="text-gray-600 leading-relaxed">{s.content}</p>
          </div>
        ))}

        <div className="bg-[#F0EDE8] rounded-2xl p-6 border border-gray-100 mt-8">
          <p className="text-gray-600 text-sm"><strong className="text-[#0B2341]">Questions?</strong> Contact our support team via the <Link href="/contact" className="text-[#D4A017] font-bold hover:underline">Contact page</Link> or WhatsApp. We respond to refund questions within 4 business hours.</p>
        </div>

        <div className="mt-10 flex gap-4 flex-wrap">
          <Link href="/legal/privacy" className="text-[#D4A017] font-bold hover:underline">Privacy Policy →</Link>
          <Link href="/legal/terms" className="text-[#D4A017] font-bold hover:underline">Terms & Conditions →</Link>
          <Link href="/legal/safeguarding" className="text-[#D4A017] font-bold hover:underline">Safeguarding Policy →</Link>
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}

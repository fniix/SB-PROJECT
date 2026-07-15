'use client'
import { useState } from 'react'
import PublicNav from '@/components/PublicNav'
import PublicFooter from '@/components/PublicFooter'
import Link from 'next/link'

const plans = [
  {
    id: 'single',
    name: 'Pay Per Session',
    icon: '📅',
    price: 'BD 8',
    priceSub: '– BD 25 / session',
    desc: 'Perfect for trying a tutor or getting help with a specific topic.',
    features: ['No commitment', 'Any tutor', 'Any subject', 'Session report included', 'Rate after session'],
    cta: 'Book a Session',
    href: '/register',
    highlight: false,
  },
  {
    id: 'monthly',
    name: 'Monthly Plan',
    icon: '📆',
    price: 'BD 60',
    priceSub: '/ month (8 sessions)',
    desc: 'Best value for consistent weekly tutoring with the same tutor.',
    features: ['8 sessions per month', 'Same dedicated tutor', 'Priority booking', 'Monthly progress report', 'Cancel anytime'],
    cta: 'Choose Monthly Plan',
    href: '/register',
    highlight: true,
  },
  {
    id: 'exam',
    name: 'Exam Bootcamp',
    icon: '🎯',
    price: 'BD 35',
    priceSub: '(4 sessions)',
    desc: 'Intensive focused prep targeting weak areas before an upcoming exam.',
    features: ['4 targeted sessions', 'Weak topic diagnosis', 'Practice questions', 'Pre-exam strategy', 'Final session report'],
    cta: 'Book Bootcamp',
    href: '/register',
    highlight: false,
  },
  {
    id: 'group',
    name: 'Group Class',
    icon: '👥',
    price: 'BD 5',
    priceSub: '/ student per session',
    desc: 'Shared learning sessions with 3–6 students. Social and affordable.',
    features: ['3–6 students per class', 'Same subject/level', 'Lower cost per student', 'Interactive format', 'Weekly sessions'],
    cta: 'Join Group Class',
    href: '/register',
    highlight: false,
  },
  {
    id: 'special',
    name: 'Special Needs Plan',
    icon: '💛',
    price: 'BD 12',
    priceSub: '/ session (25–45 min)',
    desc: 'Carefully structured shorter sessions for learners with diverse needs.',
    features: ['Shorter session options', 'Trained SEN tutor', 'Gentle intake process', 'Detailed progress notes', 'Admin oversight'],
    cta: 'Request Consultation',
    href: '/contact',
    highlight: false,
  },
]

const walletInfo = [
  { icon: '💰', title: 'Wallet Top-Up', desc: 'Add credits to your wallet and use them for any session or package.' },
  { icon: '🧾', title: 'Invoice Every Payment', desc: 'A receipt is generated after every payment and top-up for your records.' },
  { icon: '🔄', title: 'Refund as Credits', desc: 'Tutor no-show or cancellation? Credits returned to your wallet immediately.' },
  { icon: '📊', title: 'Full Ledger History', desc: 'See every debit, credit, and refund in your parent dashboard.' },
]

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState('monthly')

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      <PublicNav />

      {/* Hero */}
      <section className="bg-[#0B2341] pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <span className="inline-block bg-[#D4A017]/20 text-[#D4A017] text-sm font-bold px-4 py-1.5 rounded-full mb-6 border border-[#D4A017]/30">Transparent Pricing</span>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
            Clear Pricing.<br />
            <span className="text-[#D4A017]">No Hidden Fees.</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Every price shown is the final price. Platform fee, session fee, and any applicable charges are always displayed before you pay.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-20 bg-[#F0EDE8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-[#0B2341] mb-4">Choose Your Plan</h2>
            <p className="text-gray-500">Flexible options to match every family's needs and budget.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {plans.map(plan => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`bg-white rounded-2xl p-6 shadow-sm border-2 cursor-pointer transition-all hover:shadow-md relative ${
                  plan.highlight ? 'border-[#D4A017] shadow-lg shadow-[#D4A017]/10' : selectedPlan === plan.id ? 'border-[#0B2341]' : 'border-gray-100'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D4A017] text-white text-xs font-black px-4 py-1 rounded-full whitespace-nowrap">MOST POPULAR</div>
                )}
                <div className="text-3xl mb-3">{plan.icon}</div>
                <h3 className="font-black text-[#0B2341] text-base mb-1">{plan.name}</h3>
                <div className="mb-3">
                  <span className="text-2xl font-black text-[#D4A017]">{plan.price}</span>
                  <span className="text-gray-400 text-xs ml-1">{plan.priceSub}</span>
                </div>
                <p className="text-gray-500 text-xs mb-4 leading-relaxed">{plan.desc}</p>
                <ul className="space-y-1.5 mb-5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                      <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={`block text-center py-2.5 rounded-xl font-bold text-sm transition-all ${plan.highlight ? 'bg-[#D4A017] text-white hover:bg-[#b8860b]' : 'bg-[#0B2341] text-white hover:bg-[#071829]'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wallet */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-[#0B2341] mb-4">💳 The SB Wallet</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Top up your wallet and use credits for any session. Refunds go back to your wallet instantly.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {walletInfo.map(w => (
              <div key={w.title} className="bg-[#F0EDE8] rounded-2xl p-5 border border-gray-100 text-center">
                <div className="text-3xl mb-3">{w.icon}</div>
                <h3 className="font-bold text-[#0B2341] mb-2 text-sm">{w.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Policy summary */}
      <section className="py-16 bg-[#F0EDE8]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-black text-[#0B2341] text-center mb-8">Cancellation & Refund Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: '✅', title: 'Free Cancellation', desc: 'Cancel 24+ hours before the session for a full wallet credit.' },
              { icon: '⚡', title: 'Late Cancellation', desc: 'Within 24 hours: 50% of session fee as wallet credit. Within 3 hours: no refund.' },
              { icon: '🛡️', title: 'Tutor No-Show', desc: 'If the tutor doesn\'t attend, 100% wallet credit issued immediately — no questions asked.' },
            ].map(p => (
              <div key={p.title} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
                <div className="text-3xl mb-3">{p.icon}</div>
                <h3 className="font-bold text-[#0B2341] mb-2 text-sm">{p.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/legal/refund" className="text-[#D4A017] font-bold text-sm hover:underline">Read Full Refund Policy →</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#0B2341]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Start Learning Today</h2>
          <p className="text-gray-300 mb-8">No subscription required. Book your first session in under 3 minutes.</p>
          <Link href="/register" className="inline-block bg-[#D4A017] text-white px-10 py-4 rounded-xl font-bold hover:bg-[#b8860b] transition-all shadow-lg text-lg">
            Create Free Account
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

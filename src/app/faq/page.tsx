'use client'
import { useState } from 'react'
import PublicNav from '@/components/PublicNav'
import PublicFooter from '@/components/PublicFooter'
import Link from 'next/link'

const faqCategories = [
  {
    cat: '💳 Payments & Pricing',
    items: [
      { q: 'What payment methods are accepted?', a: 'We accept credit/debit cards, BenefitPay, and SB Project wallet credits. The wallet can be topped up in advance and used for any session.' },
      { q: 'Are there any hidden fees?', a: 'No. The full price — including tutor fee and platform service fee — is always shown on the checkout screen before you confirm payment.' },
      { q: 'How does the wallet work?', a: 'You top up your wallet with a set amount. Every session or package is deducted from your balance. Refunds go back to your wallet instantly.' },
      { q: 'Can I get an invoice?', a: 'Yes. An invoice/receipt is automatically generated after every payment or wallet top-up. You can find all invoices in your Parent Dashboard.' },
    ],
  },
  {
    cat: '📅 Booking & Sessions',
    items: [
      { q: 'Can I cancel a booked session?', a: 'Yes. Free cancellation is available 24+ hours before the session. Within 24 hours, a 50% wallet credit applies. Within 3 hours, the session fee is non-refundable unless the tutor cancels.' },
      { q: 'What if the tutor doesn\'t show up?', a: 'The session is marked as a tutor no-show and a full wallet credit is issued immediately. The tutor also receives a reliability flag from our admin team.' },
      { q: 'Can I book recurring sessions?', a: 'Yes. The Monthly Plan gives you 8 sessions per month with the same tutor. You can also book sessions one at a time as needed.' },
      { q: 'Is there a trial session?', a: 'Many tutors offer a first trial session at a reduced rate. Look for the "Trial Available" badge on their profile page.' },
      { q: 'Can I reschedule?', a: 'Yes. You can request a reschedule through your booking dashboard. Availability depends on the tutor\'s open slots.' },
    ],
  },
  {
    cat: '🛡️ Tutors & Verification',
    items: [
      { q: 'How are tutors verified?', a: 'Every tutor submits identity documents, qualification proof, and a demo lesson. Our admin team reviews everything and conducts a brief interview before approval.' },
      { q: 'Can any tutor join the platform?', a: 'No. SB Project is a managed marketplace. Only tutors who pass our full verification process appear publicly. Unverified tutors cannot accept bookings.' },
      { q: 'What happens if I\'m not happy with a tutor?', a: 'You can rate the session and leave feedback. If there\'s a concern, contact support and we will help you find a better match or issue a credit.' },
      { q: 'Are tutors background-checked?', a: 'We verify identity and qualifications. For tutors working with minors or special needs learners, we apply additional review criteria.' },
    ],
  },
  {
    cat: '👨‍👩‍👧 Parents & Children',
    items: [
      { q: 'Can I add multiple children to one account?', a: 'Yes. You can add multiple child profiles under one parent account. Each child has their own grade, curriculum, subjects, and learning goals.' },
      { q: 'What does my child see?', a: 'Children see a student-friendly dashboard with their upcoming class, homework, badges, and rewards. Payment and account details are parent-only.' },
      { q: 'Do I receive a report after every session?', a: 'Yes. The tutor submits a detailed session report after every class: topics covered, weak areas, homework, next steps, and a performance score.' },
      { q: 'Can I see what the tutor wrote in the report?', a: 'Yes. The full session report is visible in your Parent Dashboard under Progress Reports.' },
    ],
  },
  {
    cat: '💛 Special Needs Support',
    items: [
      { q: 'Do you support students with ADHD or dyslexia?', a: 'Yes. We have tutors with verified training in ADHD support, dyslexia strategies, autism spectrum support, and other learning differences.' },
      { q: 'Is the tutor a therapist or specialist?', a: 'No. SB Project provides educational support and tutor matching. We are not a clinical service. For medical or therapeutic needs, please consult a licensed professional.' },
      { q: 'How do you match special needs learners to tutors?', a: 'Parents complete a careful intake form describing goals, communication preferences, and session tolerance. Our admin team manually assigns the right tutor.' },
      { q: 'Can sessions be shorter for my child?', a: 'Yes. For special needs learners, we offer 25, 30, and 45-minute session options depending on the child\'s attention and tolerance.' },
    ],
  },
  {
    cat: '👨‍🏫 For Tutors',
    items: [
      { q: 'How do I apply to become a tutor?', a: 'Visit the Become a Tutor page, fill the application, upload your documents and demo lesson, and wait for admin review (2–5 business days).' },
      { q: 'When do I get paid?', a: 'Tutor payouts are processed after session completion. You can see your earnings, pending payouts, and session history in your Tutor Dashboard.' },
      { q: 'What is the platform commission?', a: 'The platform fee is deducted before your payout. You will always see the net amount you receive per session clearly in your dashboard before accepting bookings.' },
      { q: 'Can I set my own price?', a: 'Yes. You set your hourly/session rate in your profile settings. The platform fee is added on top for the parent.' },
    ],
  },
]

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      <PublicNav />

      {/* Hero */}
      <section className="bg-[#0B2341] pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <span className="inline-block bg-[#D4A017]/20 text-[#D4A017] text-sm font-bold px-4 py-1.5 rounded-full mb-6 border border-[#D4A017]/30">Help Center</span>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
            Frequently Asked<br />
            <span className="text-[#D4A017]">Questions</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Everything you need to know about SB Project — payments, bookings, tutors, and support.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-[#F0EDE8]">
        <div className="max-w-4xl mx-auto px-6 space-y-10">
          {faqCategories.map(cat => (
            <div key={cat.cat}>
              <h2 className="text-xl font-black text-[#0B2341] mb-4">{cat.cat}</h2>
              <div className="space-y-3">
                {cat.items.map((item, i) => {
                  const key = `${cat.cat}-${i}`
                  const isOpen = openIdx === key
                  return (
                    <div key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <button
                        onClick={() => setOpenIdx(isOpen ? null : key)}
                        className="w-full text-left px-6 py-4 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-[#0B2341] text-sm leading-relaxed">{item.q}</span>
                        <span className={`shrink-0 text-[#D4A017] font-black text-lg transition-transform ${isOpen ? 'rotate-45' : ''}`}>+</span>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-5 text-gray-500 text-sm leading-relaxed border-t border-gray-100 pt-4">
                          {item.a}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Still need help */}
      <section className="py-20 bg-[#0B2341]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Still Have Questions?</h2>
          <p className="text-gray-300 mb-8">Our support team is ready to help via WhatsApp, email, or support ticket.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="bg-[#D4A017] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#b8860b] transition-all shadow-lg">
              Contact Support
            </Link>
            <a href="https://wa.me/973XXXXXXXX" className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:border-[#D4A017] hover:text-[#D4A017] transition-all">
              💬 WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

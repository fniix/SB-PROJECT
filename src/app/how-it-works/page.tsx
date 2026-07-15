import type { Metadata } from 'next'
import PublicNav from '@/components/PublicNav'
import PublicFooter from '@/components/PublicFooter'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How It Works — SB Project',
  description: 'See how SB Project works in 7 simple steps — from signing up to receiving your child\'s progress report after every session.',
}

const steps = [
  {
    num: '01',
    icon: '👤',
    title: 'Create Your Account',
    desc: 'Register as a parent and set up your profile. It takes less than 2 minutes.',
    detail: 'Choose your role, enter basic details, verify your email, and you\'re in.',
    color: 'from-blue-600 to-blue-500',
  },
  {
    num: '02',
    icon: '👧',
    title: 'Add Your Child\'s Profile',
    desc: 'Tell us about your child — grade, curriculum, subjects needed, and learning goals.',
    detail: 'For special needs support, you\'ll complete a sensitive intake form so we assign the right tutor.',
    color: 'from-[#0B2341] to-[#1a3a5c]',
  },
  {
    num: '03',
    icon: '🔍',
    title: 'Find the Right Tutor',
    desc: 'Search and filter from our verified tutor directory, or use AI Smart Match.',
    detail: 'Every tutor profile shows verification status, subjects, price, ratings, and availability.',
    color: 'from-purple-600 to-purple-500',
  },
  {
    num: '04',
    icon: '📅',
    title: 'Book a Session',
    desc: 'Choose your preferred date, time, and session type — online or in-person.',
    detail: 'No double bookings. The system prevents scheduling conflicts automatically.',
    color: 'from-[#D4A017] to-amber-400',
  },
  {
    num: '05',
    icon: '💳',
    title: 'Pay Securely',
    desc: 'Pay by card, wallet credits, or monthly package. Full price shown before you confirm.',
    detail: 'No hidden fees. A receipt is generated immediately. Your wallet is updated instantly.',
    color: 'from-teal-600 to-teal-500',
  },
  {
    num: '06',
    icon: '🎓',
    title: 'Attend the Session',
    desc: 'Your child joins the session via the platform. The tutor follows a structured lesson plan.',
    detail: 'Sessions include warm-up, explanation, practice, homework assignment, and exit check.',
    color: 'from-green-600 to-green-500',
  },
  {
    num: '07',
    icon: '📊',
    title: 'Receive the Report',
    desc: 'After every session, the tutor submits a detailed report. You rate the session.',
    detail: 'You see: topics covered, weak areas, homework assigned, next steps, and performance score.',
    color: 'from-rose-600 to-rose-500',
  },
]

const faqs = [
  { q: 'How long does tutor verification take?', a: 'Typically 2-5 business days. We review documents, watch the demo lesson, and conduct a brief interview before approving.' },
  { q: 'Can I cancel a session?', a: 'Yes. Free cancellation is available up to 24 hours before the session. After that, the cancellation policy applies. See our Refund Policy for details.' },
  { q: 'What if the tutor doesn\'t show up?', a: 'Admin marks it as a tutor no-show and a full wallet credit is issued immediately. We also flag the tutor for review.' },
  { q: 'Is there a trial session option?', a: 'Yes. Many tutors offer a first trial session at a reduced rate. Look for the "Trial Available" badge on their profile.' },
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      <PublicNav />

      {/* Hero */}
      <section className="bg-[#0B2341] pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <span className="inline-block bg-[#D4A017]/20 text-[#D4A017] text-sm font-bold px-4 py-1.5 rounded-full mb-6 border border-[#D4A017]/30">Simple Process</span>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
            From Signup to<br />
            <span className="text-[#D4A017]">Progress Report</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Seven clear steps. No confusion. No hidden surprises. Just consistent, measurable academic support.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 bg-[#F0EDE8]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="space-y-6">
            {steps.map((step, i) => (
              <div key={step.num} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex items-start gap-0">
                  {/* Number sidebar */}
                  <div className={`bg-gradient-to-b ${step.color} text-white p-6 flex flex-col items-center justify-center min-w-[80px]`}>
                    <span className="text-2xl font-black">{step.num}</span>
                    <span className="text-2xl mt-1">{step.icon}</span>
                  </div>
                  {/* Content */}
                  <div className="p-6 flex-1">
                    <h3 className="text-lg font-black text-[#0B2341] mb-2">{step.title}</h3>
                    <p className="text-gray-700 font-medium mb-2">{step.desc}</p>
                    <p className="text-gray-400 text-sm">{step.detail}</p>
                  </div>
                  {/* Arrow (not last) */}
                  {i < steps.length - 1 && (
                    <div className="hidden md:flex items-center pr-6 self-center text-gray-200 text-2xl">→</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video/Demo placeholder */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-[#0B2341] mb-4">See It In Action</h2>
          <p className="text-gray-500 mb-8">Watch a quick 2-minute walkthrough of the full booking and reporting process.</p>
          <div className="bg-[#0B2341] rounded-3xl aspect-video flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            <div className="text-center relative z-10">
              <div className="w-20 h-20 bg-[#D4A017] rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl cursor-pointer hover:scale-110 transition-transform">
                <span className="text-3xl ml-1">▶</span>
              </div>
              <p className="text-white font-bold">Platform Walkthrough</p>
              <p className="text-gray-400 text-sm">2 min demo video</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-[#F0EDE8]">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-black text-[#0B2341] text-center mb-12">Quick Questions</h2>
          <div className="space-y-4">
            {faqs.map(faq => (
              <div key={faq.q} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-[#0B2341] mb-2">❓ {faq.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/faq" className="text-[#D4A017] font-bold hover:underline">View All FAQs →</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#0B2341]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Ready to Get Started?</h2>
          <p className="text-gray-300 mb-8">Create your account in 2 minutes and book your first session today.</p>
          <Link href="/register" className="inline-block bg-[#D4A017] text-white px-10 py-4 rounded-xl font-bold hover:bg-[#b8860b] transition-all shadow-lg text-lg">
            Create Your Account
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

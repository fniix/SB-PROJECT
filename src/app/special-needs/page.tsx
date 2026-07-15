import type { Metadata } from 'next'
import PublicNav from '@/components/PublicNav'
import PublicFooter from '@/components/PublicFooter'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Special Needs Learning Support — SB Project',
  description: 'Personalized learning support for students with ADHD, dyslexia, autism, and other learning differences. Trained tutors, careful intake, parent communication.',
}

const supportTypes = [
  { icon: '🧠', name: 'ADHD Support', desc: 'Structured sessions with short tasks, movement breaks, and high engagement strategies.' },
  { icon: '📖', name: 'Dyslexia Support', desc: 'Multi-sensory learning methods, phonics support, and reading comprehension strategies.' },
  { icon: '💛', name: 'Autism Spectrum', desc: 'Predictable session structure, visual supports, and calm communication approach.' },
  { icon: '🌟', name: 'Learning Differences', desc: 'Personalized pacing and methods for students who learn differently from their peers.' },
  { icon: '💬', name: 'Communication Support', desc: 'Language and communication goals built into the learning session plan.' },
  { icon: '🎯', name: 'Confidence Building', desc: 'For students who have struggled academically and need a safe, low-pressure environment.' },
]

const process = [
  { step: '01', title: 'Parent Consultation Request', desc: 'You fill a short form describing your child\'s learning needs, goals, and any relevant background.' },
  { step: '02', title: 'Careful Intake Form', desc: 'Our team reviews the intake details: communication preferences, session length tolerance, sensory needs, and parent goals.' },
  { step: '03', title: 'Admin Reviews & Assigns', desc: 'We manually match your child with a tutor who has verified training or relevant experience in their specific support area.' },
  { step: '04', title: 'Shorter First Session', desc: 'The first session is shorter and introductory — to build comfort and trust before committing to a full plan.' },
  { step: '05', title: 'Careful Session Report', desc: 'The tutor tracks participation, engagement, completed tasks, and confidence — not just grades.' },
]

export default function SpecialNeedsPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      <PublicNav />

      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-900 to-[#0B2341] pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <span className="inline-block bg-teal-400/20 text-teal-300 text-sm font-bold px-4 py-1.5 rounded-full mb-6 border border-teal-400/30">Inclusive Learning</span>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
            Support Designed<br />
            <span className="text-teal-300">Around Every Learner</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Because Every Learner Matters. We provide personalized, careful educational support for students with diverse learning needs — through trained tutors and structured parent communication.
          </p>
          <Link href="/contact" className="inline-block bg-teal-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-teal-600 transition-all shadow-lg text-lg">
            Request a Consultation
          </Link>
        </div>
      </section>

      {/* Legal Notice */}
      <section className="py-8 bg-teal-50 border-b border-teal-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-teal-800 text-sm font-medium">
            🌱 <strong>Important:</strong> SB Project provides <strong>educational support and tutor matching</strong>, not medical diagnosis, clinical therapy, or specialist intervention. For medical or clinical needs, please consult a licensed professional.
          </p>
        </div>
      </section>

      {/* Support Types */}
      <section className="py-20 bg-[#F0EDE8]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-[#0B2341] mb-4">Areas We Support</h2>
            <p className="text-gray-500">Our trained tutors work with a range of learning differences and support needs.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportTypes.map(s => (
              <div key={s.name} className="bg-white rounded-2xl p-6 shadow-sm border border-teal-100 hover:shadow-md hover:border-teal-300 transition-all">
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="font-bold text-[#0B2341] text-lg mb-2">{s.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-[#0B2341] mb-4">Our Careful Process</h2>
            <p className="text-gray-500">We never rush special needs matching. Every step is reviewed by our team.</p>
          </div>
          <div className="space-y-4">
            {process.map(p => (
              <div key={p.step} className="flex gap-5 items-start bg-[#F0EDE8] rounded-2xl p-6 border border-gray-100">
                <div className="w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center font-black text-lg shrink-0">{p.step}</div>
                <div>
                  <h3 className="font-bold text-[#0B2341] mb-1">{p.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tutor standards */}
      <section className="py-20 bg-[#F0EDE8]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-black text-[#0B2341] mb-6">Our Tutor Standards for Special Needs</h2>
              <ul className="space-y-3">
                {[
                  'Only tutors with admin-verified SEN training or experience appear in this category',
                  'All communication stays inside our platform — no outside contact',
                  'Session length options: 25, 30, or 45 minutes based on attention tolerance',
                  'Visual structure provided at the start of every session',
                  'Predictable, consistent session format for routine-dependent learners',
                  'Admin reviews every session report and can escalate safety concerns',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-teal-500 mt-0.5">✓</span>
                    <span className="text-gray-600 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-teal-700 rounded-3xl p-8 text-white">
              <h3 className="font-bold text-xl mb-4 text-teal-100">What We Track</h3>
              <p className="text-teal-200 text-sm mb-6">For special needs learners, we measure what matters most — not just grades.</p>
              <div className="space-y-3">
                {['Participation level', 'Confidence during session', 'Task completion', 'Engagement & focus', 'Parent feedback', 'Session comfort level'].map(item => (
                  <div key={item} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2.5">
                    <span className="text-teal-300">📌</span>
                    <span className="text-sm text-white font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#0B2341]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Start With a Consultation</h2>
          <p className="text-gray-300 mb-8">Tell us about your child's needs. Our team will review carefully and suggest the right next step — no pressure, no rushing.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="bg-teal-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-teal-600 transition-all shadow-lg text-lg">
              Request Consultation
            </Link>
            <Link href="/faq" className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:border-teal-400 hover:text-teal-300 transition-all text-lg">
              Read FAQ
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

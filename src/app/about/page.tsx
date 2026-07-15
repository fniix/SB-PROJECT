import type { Metadata } from 'next'
import PublicNav from '@/components/PublicNav'
import PublicFooter from '@/components/PublicFooter'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About SB Project — Our Mission & Values',
  description: 'Learn about SB Project, Bahrain\'s trusted tutoring platform. Our mission: verified tutors, inclusive learning, and measurable progress for every student.',
}

const values = [
  { icon: '🛡️', title: 'Trust & Verification', desc: 'Every tutor passes a rigorous verification process including document review, demo lesson, and admin approval before teaching.' },
  { icon: '💛', title: 'Inclusion & Accessibility', desc: 'We believe every learner deserves support — from school students to those with special learning needs.' },
  { icon: '📊', title: 'Transparency', desc: 'Clear pricing, no hidden fees, full session reports, and honest progress tracking for parents and students.' },
  { icon: '🎯', title: 'Excellence', desc: 'We maintain quality standards for every tutor and every session. Low-rated tutors are reviewed and retrained.' },
  { icon: '🌱', title: 'Growth Mindset', desc: 'We reward effort, not just grades. Our platform celebrates improvement, consistency, and resilience.' },
  { icon: '🔒', title: 'Safety First', desc: 'Strict safeguarding policies protect every minor on the platform. All communication stays inside our system.' },
]

const team = [
  { name: 'Academic Operations', role: 'Tutor verification, quality control, subject mapping', emoji: '🎓' },
  { name: 'Product & Technology', role: 'Platform development, user experience, data security', emoji: '💻' },
  { name: 'Customer Support', role: 'Parent & student support, dispute resolution, ticketing', emoji: '💬' },
  { name: 'Special Needs Support', role: 'Sensitive intake, trained tutor matching, progress guidance', emoji: '💛' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      <PublicNav />

      {/* Hero */}
      <section className="bg-[#0B2341] pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <span className="inline-block bg-[#D4A017]/20 text-[#D4A017] text-sm font-bold px-4 py-1.5 rounded-full mb-6 border border-[#D4A017]/30">Our Story</span>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
            Education, Inclusion,<br />
            <span className="text-[#D4A017]">Opportunity</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            SB Project was created with a single belief: that every student in Bahrain — regardless of grade, background, or learning style — deserves access to quality, verified educational support.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-[#F0EDE8]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-black text-[#0B2341] mb-6">Why SB Project Exists</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Families in Bahrain were struggling to find reliable tutors. There was no standard process for verifying qualifications, no transparent pricing, and no way for parents to see what happened during a session.
                </p>
                <p>
                  Tutors were working without proper structure — chasing payments, managing bookings manually, and getting no professional support.
                </p>
                <p>
                  And students with special learning needs had almost no structured support available to them in a mainstream academic context.
                </p>
                <p className="font-bold text-[#0B2341]">
                  SB Project was built to change all of that. One verified session at a time.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: '500+', label: 'Verified Tutors' },
                { val: '2,000+', label: 'Families Supported' },
                { val: '50+', label: 'Subjects Covered' },
                { val: '4.9★', label: 'Average Rating' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                  <p className="text-3xl font-black text-[#D4A017] mb-1">{s.val}</p>
                  <p className="text-sm font-semibold text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Positioning */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-r from-[#0B2341] to-[#1a3a5c] rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4A017]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <h2 className="text-2xl md:text-3xl font-black text-white mb-4 relative z-10">Our Positioning Statement</h2>
            <p className="text-lg text-gray-200 leading-relaxed max-w-3xl mx-auto relative z-10">
              SB Project is the safest and most trusted Bahrain-based learning support platform for school and special-needs learners — connecting every learner with verified support, measurable progress, and a sense of confidence.
            </p>
            <div className="mt-8 text-[#D4A017] font-black text-xl italic relative z-10">
              "Because Every Learner Matters"
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[#F0EDE8]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-[#0B2341] mb-4">Our Core Values</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Every decision we make — from tutor approval to refund policy — is guided by these six principles.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map(v => (
              <div key={v.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{v.icon}</div>
                <h3 className="font-bold text-[#0B2341] text-lg mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Structure */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-[#0B2341] mb-4">How We Operate</h2>
            <p className="text-gray-500 max-w-xl mx-auto">SB Project is a managed marketplace — we actively control quality, safety, and service at every step.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map(t => (
              <div key={t.name} className="bg-[#F0EDE8] rounded-2xl p-6 text-center border border-gray-100">
                <div className="text-4xl mb-4">{t.emoji}</div>
                <h3 className="font-bold text-[#0B2341] mb-2">{t.name}</h3>
                <p className="text-gray-500 text-sm">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#0B2341]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Ready to Join SB Project?</h2>
          <p className="text-gray-300 mb-8">Whether you're a parent, student, or tutor — your place is here.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-[#D4A017] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#b8860b] transition-all shadow-lg text-lg">
              Get Started
            </Link>
            <Link href="/apply" className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:border-[#D4A017] hover:text-[#D4A017] transition-all text-lg">
              Apply as Tutor
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

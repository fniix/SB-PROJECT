import type { Metadata } from 'next'
import PublicNav from '@/components/PublicNav'
import PublicFooter from '@/components/PublicFooter'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'School Students — Tutoring for Grades 1–12 | SB Project',
  description: 'Verified tutors for all school grades in Bahrain. British, American, IB, and Bahraini curriculum support. Book a session today.',
}

const grades = [
  { label: 'Grade 1–3', sub: 'Foundation', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  { label: 'Grade 4–6', sub: 'Primary', color: 'bg-green-50 border-green-200 text-green-800' },
  { label: 'Grade 7–9', sub: 'Intermediate', color: 'bg-purple-50 border-purple-200 text-purple-800' },
  { label: 'Grade 10–12', sub: 'Secondary', color: 'bg-[#0B2341]/10 border-[#0B2341]/20 text-[#0B2341]' },
]

const subjects = [
  { icon: '🔢', name: 'Mathematics' },
  { icon: '🧪', name: 'Science' },
  { icon: '📖', name: 'English' },
  { icon: '📝', name: 'Arabic' },
  { icon: '⚗️', name: 'Chemistry' },
  { icon: '⚡', name: 'Physics' },
  { icon: '🧬', name: 'Biology' },
  { icon: '📊', name: 'Accounting' },
  { icon: '📐', name: 'Statistics' },
  { icon: '💻', name: 'IT / Computing' },
  { icon: '🌍', name: 'Geography' },
  { icon: '📚', name: 'History' },
]

const curricula = [
  { name: 'Bahrain National', flag: '🇧🇭' },
  { name: 'British / IGCSE', flag: '🇬🇧' },
  { name: 'American', flag: '🇺🇸' },
  { name: 'IB Programme', flag: '🌐' },
]

const packages = [
  { title: 'Single Session', price: 'From BD 8', icon: '📅', desc: 'Perfect for trying a tutor or a one-off topic session.', cta: 'Book Now' },
  { title: 'Monthly Plan', price: 'From BD 60', icon: '📆', best: true, desc: '8 sessions per month with the same tutor. Best value for consistent support.', cta: 'Choose Plan' },
  { title: 'Exam Bootcamp', price: 'From BD 35', icon: '🎯', desc: 'Intensive 4-session prep for upcoming exams with targeted weak-topic repair.', cta: 'Book Bootcamp' },
]

export default function SchoolStudentsPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      <PublicNav />

      {/* Hero */}
      <section className="bg-[#0B2341] pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-blue-500/20 text-blue-300 text-sm font-bold px-4 py-1.5 rounded-full mb-6 border border-blue-500/30">Grades 1–12</span>
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
                School Support for<br />
                <span className="text-[#D4A017]">Every Grade,</span><br />
                Every Subject
              </h1>
              <p className="text-lg text-gray-300 mb-8">
                Verified tutors aligned to your child's curriculum. Whether it's homework help, exam prep, or week-topic repair — we have the right support.
              </p>
              <div className="flex gap-4">
                <Link href="/register" className="bg-[#D4A017] text-white px-7 py-3.5 rounded-xl font-bold hover:bg-[#b8860b] transition-all shadow-lg">
                  Book a Session
                </Link>
                <Link href="/dashboard/parent/tutors" className="border-2 border-white/30 text-white px-7 py-3.5 rounded-xl font-bold hover:border-[#D4A017] hover:text-[#D4A017] transition-all">
                  Browse Tutors
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {grades.map(g => (
                <div key={g.label} className={`${g.color} border-2 rounded-2xl p-5 text-center`}>
                  <p className="font-black text-lg">{g.label}</p>
                  <p className="text-sm opacity-70">{g.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Curricula */}
      <section className="py-14 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Supported Curricula</p>
          <div className="flex flex-wrap justify-center gap-4">
            {curricula.map(c => (
              <div key={c.name} className="flex items-center gap-2 bg-[#F0EDE8] px-5 py-2.5 rounded-full border border-gray-200">
                <span className="text-xl">{c.flag}</span>
                <span className="font-semibold text-[#0B2341] text-sm">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="py-20 bg-[#F0EDE8]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-[#0B2341] mb-4">Subjects We Cover</h2>
            <p className="text-gray-500">Verified tutors available for all core and specialist school subjects.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {subjects.map(s => (
              <div key={s.name} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
                <div className="text-3xl mb-2">{s.icon}</div>
                <p className="font-semibold text-[#0B2341] text-xs">{s.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-[#0B2341] mb-4">What Parents Get</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '📊', title: 'Session Reports', desc: 'After every class, the tutor submits a detailed report: topics covered, weak areas, homework, and next steps.' },
              { icon: '🎯', title: 'Weak Topic Repair', desc: 'Tutors identify and target the exact areas where your child struggles, not just what they\'re comfortable with.' },
              { icon: '🛡️', title: 'Verified Tutors Only', desc: 'No unverified tutor appears publicly. Every tutor passes document check, demo lesson, and admin approval.' },
            ].map(b => (
              <div key={b.title} className="bg-[#F0EDE8] rounded-2xl p-7 border border-gray-100">
                <div className="text-4xl mb-4">{b.icon}</div>
                <h3 className="font-bold text-[#0B2341] text-lg mb-3">{b.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-20 bg-[#F0EDE8]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-[#0B2341] mb-4">Choose Your Plan</h2>
            <p className="text-gray-500">Flexible options to match every family's needs and budget.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map(p => (
              <div key={p.title} className={`bg-white rounded-2xl p-7 shadow-sm border-2 ${p.best ? 'border-[#D4A017] shadow-lg' : 'border-gray-100'} relative`}>
                {p.best && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D4A017] text-white text-xs font-black px-4 py-1 rounded-full">MOST POPULAR</div>}
                <div className="text-3xl mb-3">{p.icon}</div>
                <h3 className="font-black text-[#0B2341] text-lg mb-1">{p.title}</h3>
                <p className="text-2xl font-black text-[#D4A017] mb-3">{p.price}</p>
                <p className="text-gray-500 text-sm mb-5">{p.desc}</p>
                <Link href="/register" className={`block text-center py-3 rounded-xl font-bold transition-all ${p.best ? 'bg-[#D4A017] text-white hover:bg-[#b8860b]' : 'bg-[#0B2341] text-white hover:bg-[#071829]'}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#0B2341]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Start Your Child's Learning Journey</h2>
          <p className="text-gray-300 mb-8">Register in 2 minutes and book your first session today.</p>
          <Link href="/register" className="inline-block bg-[#D4A017] text-white px-10 py-4 rounded-xl font-bold hover:bg-[#b8860b] transition-all shadow-lg text-lg">
            Get Started Free
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

'use client'
import { useState } from 'react'
import PublicNav from '@/components/PublicNav'
import PublicFooter from '@/components/PublicFooter'
import Link from 'next/link'

const perks = [
  { icon: '💰', title: 'Clear, Reliable Earnings', desc: 'See your per-session earnings before accepting. No chasing payments — payouts processed after every completed session.' },
  { icon: '📅', title: 'You Control Your Schedule', desc: 'Set your own availability. Accept or decline bookings as you choose. Work on your terms.' },
  { icon: '🎓', title: 'Professional Profile', desc: 'Your verified badge, credentials, and reviews build credibility that helps you attract consistent bookings.' },
  { icon: '📊', title: 'Organized Dashboard', desc: 'All your bookings, students, reports, and earnings in one clean dashboard. No spreadsheets needed.' },
  { icon: '🌱', title: 'Training & Development', desc: 'Access onboarding guides, teaching frameworks, and SEN training resources to grow as a tutor.' },
  { icon: '🛡️', title: 'Platform Protection', desc: 'We handle payments, disputes, and scheduling. You focus on teaching.' },
]

const steps = [
  { num: '01', title: 'Fill the Application', desc: 'Submit your basic info, subjects, and teaching level. Takes about 10 minutes.' },
  { num: '02', title: 'Upload Documents', desc: 'ID proof, qualification certificates or transcripts. Secure upload — we review only.' },
  { num: '03', title: 'Record a Demo Lesson', desc: 'A 5–10 minute video of you teaching a topic of your choice. Judges communication and style.' },
  { num: '04', title: 'Admin Review', desc: 'Our academic team reviews your application within 2–5 business days.' },
  { num: '05', title: 'Set Up Your Profile', desc: 'Add your availability, set your rate, write your bio, and go live. Start accepting bookings.' },
]

const categories = [
  'Certified School Teacher (MoE / International School)',
  'University Lecturer or Academic',
  'Master\'s Degree Holder (subject area)',
  'A+ University Student (peer tutoring)',
  'Industry Professional / Skills Specialist',
  'Special Needs Support Educator',
  'Language Tutor (Arabic, English, other)',
  'Exam Revision Specialist',
]

export default function ApplyPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', category: '', subjects: '', experience: '', motivation: '' })
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      <PublicNav />

      {/* Hero */}
      <section className="bg-[#0B2341] pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-[#D4A017]/20 text-[#D4A017] text-sm font-bold px-4 py-1.5 rounded-full mb-6 border border-[#D4A017]/30">Join Our Team</span>
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
                Teach with<br />
                <span className="text-[#D4A017]">SB Project</span>
              </h1>
              <p className="text-lg text-gray-300 mb-8">
                Join a trusted platform that values teaching quality, pays reliably, and gives you tools to be a more effective tutor.
              </p>
              <div className="flex flex-wrap gap-4">
                {['Reliable payments', 'Organized bookings', 'Verified badge', 'Student files before class'].map(b => (
                  <span key={b} className="bg-white/10 text-white text-sm font-semibold px-4 py-2 rounded-full border border-white/20">✓ {b}</span>
                ))}
              </div>
            </div>
            <div className="bg-white/5 border border-white/20 rounded-2xl p-6">
              <p className="text-[#D4A017] font-bold mb-4">Who can apply?</p>
              <ul className="space-y-2">
                {categories.slice(0,6).map(c => (
                  <li key={c} className="flex items-start gap-2 text-gray-300 text-sm">
                    <span className="text-[#D4A017] mt-0.5 shrink-0">✓</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="py-20 bg-[#F0EDE8]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-[#0B2341] mb-4">Why Tutors Choose SB Project</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {perks.map(p => (
              <div key={p.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{p.icon}</div>
                <h3 className="font-bold text-[#0B2341] mb-2">{p.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-[#0B2341] mb-4">The Application Process</h2>
            <p className="text-gray-500">We review carefully to protect our learners. The process takes 2–5 business days.</p>
          </div>
          <div className="space-y-4">
            {steps.map(s => (
              <div key={s.num} className="flex items-start gap-5 bg-[#F0EDE8] rounded-2xl p-6 border border-gray-100">
                <div className="w-12 h-12 bg-[#D4A017] text-white rounded-full flex items-center justify-center font-black text-lg shrink-0">{s.num}</div>
                <div>
                  <h3 className="font-bold text-[#0B2341] mb-1">{s.title}</h3>
                  <p className="text-gray-500 text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-20 bg-[#F0EDE8]">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-[#0B2341] mb-4">Apply Now</h2>
            <p className="text-gray-500">Fill the form and our academic team will review your application.</p>
          </div>

          {submitted ? (
            <div className="bg-white rounded-3xl shadow-md p-12 text-center border border-gray-100">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-black text-[#0B2341] mb-2">Application Submitted!</h3>
              <p className="text-gray-500">Our academic team will review your application and contact you within 2–5 business days. Check your email for confirmation.</p>
              <Link href="/" className="inline-block mt-6 bg-[#0B2341] text-white px-8 py-3 rounded-xl font-bold">Back to Home</Link>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
              {/* Step indicator */}
              <div className="flex bg-gray-50 border-b border-gray-100">
                {[1, 2].map(n => (
                  <div key={n} className={`flex-1 py-4 text-center text-sm font-bold transition-colors ${step === n ? 'text-[#D4A017] border-b-2 border-[#D4A017]' : 'text-gray-400'}`}>
                    Step {n}: {n === 1 ? 'Personal Info' : 'Teaching Details'}
                  </div>
                ))}
              </div>

              <div className="p-8">
                {step === 1 ? (
                  <form onSubmit={handleNext} className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-[#0B2341] mb-1.5">Full Name *</label>
                      <input required type="text" placeholder="Your full name" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                        className="w-full rounded-xl border border-gray-200 bg-[#F0EDE8] px-4 py-3 text-sm focus:outline-none focus:border-[#D4A017]" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0B2341] mb-1.5">Email Address *</label>
                      <input required type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                        className="w-full rounded-xl border border-gray-200 bg-[#F0EDE8] px-4 py-3 text-sm focus:outline-none focus:border-[#D4A017]" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0B2341] mb-1.5">Phone Number *</label>
                      <input required type="tel" placeholder="+973 XXXX XXXX" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                        className="w-full rounded-xl border border-gray-200 bg-[#F0EDE8] px-4 py-3 text-sm focus:outline-none focus:border-[#D4A017]" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0B2341] mb-1.5">Tutor Category *</label>
                      <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                        className="w-full rounded-xl border border-gray-200 bg-[#F0EDE8] px-4 py-3 text-sm focus:outline-none focus:border-[#D4A017]">
                        <option value="">Select your category</option>
                        {categories.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <button type="submit" className="w-full bg-[#0B2341] text-white py-4 rounded-xl font-black hover:bg-[#071829] border-2 border-transparent hover:border-[#D4A017] transition-all">
                      Continue →
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-[#0B2341] mb-1.5">Subjects You Teach *</label>
                      <input required type="text" placeholder="e.g. Mathematics, Physics, English (Grades 7–12)" value={form.subjects} onChange={e => setForm({...form, subjects: e.target.value})}
                        className="w-full rounded-xl border border-gray-200 bg-[#F0EDE8] px-4 py-3 text-sm focus:outline-none focus:border-[#D4A017]" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0B2341] mb-1.5">Teaching Experience *</label>
                      <textarea required rows={3} placeholder="Briefly describe your teaching experience, qualifications, and any relevant certifications." value={form.experience} onChange={e => setForm({...form, experience: e.target.value})}
                        className="w-full rounded-xl border border-gray-200 bg-[#F0EDE8] px-4 py-3 text-sm focus:outline-none focus:border-[#D4A017] resize-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0B2341] mb-1.5">Why do you want to join SB Project? *</label>
                      <textarea required rows={3} placeholder="Tell us briefly why you'd be a great SB Project tutor." value={form.motivation} onChange={e => setForm({...form, motivation: e.target.value})}
                        className="w-full rounded-xl border border-gray-200 bg-[#F0EDE8] px-4 py-3 text-sm focus:outline-none focus:border-[#D4A017] resize-none" />
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                      <p className="text-amber-700 text-xs">📎 After submission, our team will email you with a secure link to upload your documents and demo lesson video.</p>
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setStep(1)} className="flex-1 border-2 border-gray-200 text-gray-600 py-3.5 rounded-xl font-bold hover:border-gray-400 transition-all">← Back</button>
                      <button type="submit" className="flex-2 flex-grow bg-[#D4A017] text-white py-3.5 rounded-xl font-black hover:bg-[#b8860b] transition-all shadow-md">Submit Application</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

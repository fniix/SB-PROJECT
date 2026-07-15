import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'SB Project — Premium Tutoring Platform in Bahrain',
  description: 'Connect with verified tutors, track your child\'s progress, and access educational games and videos. The premium learning ecosystem built for Bahrain.',
}

const features = [
  { icon: '🛡️', title: 'Verified Tutors', desc: 'Every tutor is manually vetted and approved by our admin team before they can accept bookings.' },
  { icon: '📊', title: 'Progress Tracking', desc: 'Detailed session reports, performance scores, and risk flags to keep your child on track.' },
  { icon: '🤖', title: 'AI Smart Match', desc: 'Our algorithm scores tutors against your child\'s learning profile to find the best fit.' },
  { icon: '🎮', title: 'Educational Games', desc: 'Curated curriculum-aligned games and YouTube video library for independent learning.' },
  { icon: '🏆', title: 'Rewards & Badges', desc: 'Keep children motivated with an XP points system and achievement badges.' },
  { icon: '♿', title: 'Special Needs Support', desc: 'Tutors trained for diverse learning requirements including ADHD, dyslexia, and more.' },
]

const howItWorks = [
  { step: '01', icon: '👤', title: 'Create Your Account', desc: 'Register as a parent, add your children\'s profiles, and set their learning goals.' },
  { step: '02', icon: '🔍', title: 'Find the Right Tutor', desc: 'Browse verified tutors or use AI Smart Match to find the perfect fit for your child.' },
  { step: '03', icon: '📅', title: 'Book a Session', desc: 'Choose your preferred time, subject, and session format — online or in-person.' },
  { step: '04', icon: '📈', title: 'Track Progress', desc: 'Receive detailed reports after every session and monitor improvement over time.' },
]

const stats = [
  { value: '500+', label: 'Verified Tutors' },
  { value: '2,000+', label: 'Happy Families' },
  { value: '15,000+', label: 'Sessions Completed' },
  { value: '4.9★', label: 'Average Rating' },
]

const tracks = [
  { emoji: '📘', title: 'School Students', subtitle: 'Grades 1–12', desc: 'Curriculum-aligned tutoring for British, American, IB, and Bahraini curricula. Boost grades and build confidence.', color: 'from-blue-600 to-blue-500' },
  { emoji: '💛', title: 'Special Needs', subtitle: 'Personalized Support', desc: 'Specialized tutors trained to work with students with ADHD, dyslexia, autism spectrum, and more.', color: 'from-[#D4A017] to-amber-400' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ═══ NAVBAR ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#0B2341] rounded-xl flex items-center justify-center text-[#D4A017] font-black text-lg">S</div>
            <span className="font-black text-[#0B2341] text-xl">SB <span className="text-[#D4A017]">Project</span></span>
          </div>
          <div className="hidden lg:flex items-center gap-6 text-sm font-semibold text-gray-500">
            <Link href="/about" className="hover:text-[#0B2341] transition-colors">About</Link>
            <Link href="/how-it-works" className="hover:text-[#0B2341] transition-colors">How It Works</Link>
            <Link href="/school-students" className="hover:text-[#0B2341] transition-colors">School</Link>
            <Link href="/special-needs" className="hover:text-[#0B2341] transition-colors">Special Needs</Link>
            <Link href="/pricing" className="hover:text-[#0B2341] transition-colors">Pricing</Link>
            <Link href="/faq" className="hover:text-[#0B2341] transition-colors">FAQ</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-[#0B2341] hover:text-[#D4A017] transition-colors px-4 py-2">Sign In</Link>
            <Link href="/register" className="bg-[#0B2341] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#071829] hover:border-[#D4A017] border-2 border-transparent transition-all shadow-md">
              Get Started
            </Link>
          </div>
        </div>
      </nav>


      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0B2341]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/assets/hero-banner.jpg"
            alt="Students learning"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B2341] via-[#0B2341]/95 to-[#0B2341]/60" />
        </div>

        {/* Decorative dots */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#D4A017]/20 border border-[#D4A017]/30 text-[#D4A017] text-xs font-bold px-4 py-2 rounded-full mb-8">
              🏆 Bahrain&apos;s #1 Premium Tutoring Platform
            </div>

            <h1 className="text-5xl lg:text-7xl font-black !text-white leading-[1.05] mb-6">
              Premium<br />
              Tutoring for<br />
              <span className="text-[#D4A017]">Every Child</span>
            </h1>

            <p className="text-gray-300 text-xl leading-relaxed mb-10 max-w-lg">
              Connect with verified, expert tutors. Track your child&apos;s progress with AI-powered insights. Build confidence through personalized learning.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/register" className="bg-[#D4A017] hover:bg-[#b8860b] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 flex items-center gap-2">
                Start Learning Free →
              </Link>
              <Link href="/register?role=tutor" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-2">
                Become a Tutor
              </Link>
            </div>

            {/* Mini Stats */}
            <div className="grid grid-cols-3 gap-6">
              {stats.slice(0, 3).map(s => (
                <div key={s.label}>
                  <p className="text-2xl font-black text-[#D4A017]">{s.value}</p>
                  <p className="text-gray-400 text-xs font-medium mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right side — floating cards */}
          <div className="hidden lg:flex flex-col gap-4">
            {/* Main preview card */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#D4A017] rounded-full flex items-center justify-center font-black text-2xl">A</div>
                <div>
                  <p className="font-bold">Ahmed Al-Rashidi</p>
                  <p className="text-xs text-[#D4A017]">✅ Verified Math Tutor</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-2xl font-black text-[#D4A017]">4.9★</p>
                  <p className="text-xs text-gray-300">128 sessions</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {['Mathematics', 'Physics', 'Statistics'].map(s => (
                  <span key={s} className="bg-white/10 text-white text-xs px-2 py-1 rounded-lg">{s}</span>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-gray-300 text-sm">$25/hr</span>
                <span className="bg-[#D4A017] text-white text-xs font-bold px-3 py-1 rounded-full">Available Today</span>
              </div>
            </div>

            {/* Progress card */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 text-white">
              <p className="text-sm font-bold mb-3">📈 Fatima&apos;s Math Progress</p>
              <div className="space-y-2">
                {[
                  { label: 'Algebra', value: 85 },
                  { label: 'Geometry', value: 72 },
                  { label: 'Statistics', value: 91 },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300">{item.label}</span>
                      <span className="text-[#D4A017] font-bold">{item.value}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full"><div className="h-full bg-[#D4A017] rounded-full" style={{ width: `${item.value}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Badge card */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 text-white flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#D4A017] to-amber-400 rounded-2xl flex items-center justify-center text-3xl shadow-lg">🏆</div>
              <div>
                <p className="font-bold">Achievement Unlocked!</p>
                <p className="text-sm text-[#D4A017]">Rising Star — 5 sessions completed</p>
                <p className="text-xs text-gray-400 mt-0.5">+250 XP Points earned</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L1440 80L1440 40C1200 80 960 0 720 40C480 80 240 0 0 40L0 80Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ═══ STATS STRIP ═══ */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-black text-[#0B2341] mb-1">{s.value}</p>
              <p className="text-gray-500 text-sm font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ LEARNING TRACKS ═══ */}
      <section id="tracks" className="py-24 px-6 bg-[#F0EDE8]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#D4A017] text-sm font-bold uppercase tracking-widest">For Every Student</span>
            <h2 className="text-4xl lg:text-5xl font-black text-[#0B2341] mt-3 mb-4">Tailored Learning Tracks</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Specialized support covering school levels and special educational needs.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {tracks.map(track => (
              <div key={track.title} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                <div className={`bg-gradient-to-br ${track.color} h-32 flex items-center justify-center text-6xl`}>
                  {track.emoji}
                </div>
                <div className="p-6">
                  <span className="text-xs font-bold text-[#D4A017] uppercase tracking-wider">{track.subtitle}</span>
                  <h3 className="text-xl font-black text-[#0B2341] mt-1 mb-3">{track.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-5">{track.desc}</p>
                  <Link href="/register" className="text-[#0B2341] font-bold text-sm group-hover:text-[#D4A017] transition-colors">Get Started →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#D4A017] text-sm font-bold uppercase tracking-widest">Platform Features</span>
            <h2 className="text-4xl lg:text-5xl font-black text-[#0B2341] mt-3 mb-4">Everything You Need</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">A complete educational ecosystem — not just a booking platform.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="p-6 rounded-2xl border border-gray-100 hover:border-[#D4A017]/30 hover:shadow-lg transition-all group">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-black text-[#0B2341] mb-2 group-hover:text-[#D4A017] transition-colors">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="py-24 px-6 bg-[#0B2341]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#D4A017] text-sm font-bold uppercase tracking-widest">Simple Process</span>
            <h2 className="text-4xl lg:text-5xl font-black !text-white mt-3 mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Get started in minutes. Book your first session today.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {howItWorks.map((step, i) => (
              <div key={step.step} className="relative text-center">
                {i < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full h-px bg-white/10" />
                )}
                <div className="w-16 h-16 bg-[#D4A017] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg relative z-10">
                  {step.icon}
                </div>
                <p className="text-[#D4A017] text-xs font-black uppercase tracking-widest mb-2">{step.step}</p>
                <h3 className="!text-white font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#D4A017] to-amber-400 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-6xl font-black !text-white mb-6">Ready to Transform Your Child&apos;s Learning?</h2>
          <p className="text-white/80 text-xl mb-10">Join thousands of Bahraini families who trust SB Project for their children&apos;s education.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-[#0B2341] text-white px-10 py-4 rounded-xl font-black text-lg hover:bg-[#071829] transition-all shadow-xl hover:-translate-y-0.5">
              Create Free Account →
            </Link>
            <Link href="/login" className="bg-white/20 backdrop-blur-sm text-white border border-white/30 px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/30 transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-[#0B2341] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#D4A017] rounded-xl flex items-center justify-center text-white font-black text-lg">S</div>
            <span className="font-black text-white text-xl">SB <span className="text-[#D4A017]">Project</span></span>
          </div>
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} SB Project. Premium Tutoring Platform — Bahrain.</p>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <Link href="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

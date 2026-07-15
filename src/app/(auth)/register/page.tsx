'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import CountryPhoneInput from '@/components/ui/CountryPhoneInput'

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = 'parent' | 'beneficiary' | 'specialist'

interface SpecialistData {
  phone: string
  bio: string
  specialties: string[]
  conditionsHandled: string[]
  ageGroups: string[]
  languages: string[]
  sessionTypes: string[]
  pricePerHour: string
  cvFile: File | null
  certFile: File | null
  availableDays: string[]
  availableTime: string
  bankName: string
  iban: string
  agreeTerms: boolean
}

const SPECIALTIES = ['Speech Therapist', 'Behavioral Analyst (ABA)', 'Special Ed Teacher', 'Occupational Therapist', 'Psychologist', 'Sign Language Interpreter']
const CONDITIONS = ['Autism Spectrum Disorder', 'ADHD', 'Down Syndrome', 'Learning Disabilities', 'Speech/Language Disorders', 'Intellectual Disability', 'Multiple Disabilities']
const AGE_GROUPS = ['Early Intervention (0-5)', 'School Age (6-12)', 'Teens (13-18)', 'Adults (19+)']
const LANGS = ['Arabic', 'English', 'Sign Language', 'Bilingual']
const SESSION_TYPES = ['Online', 'In-Person (Home)', 'In-Person (Center)']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const SPECIALIST_STEPS = [
  { label: 'Account', icon: '👤' },
  { label: 'Expertise', icon: '🧠' },
  { label: 'Documents', icon: '📎' },
  { label: 'Availability', icon: '📅' },
]

// ─── Small helpers ─────────────────────────────────────────────────────────
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${checked ? 'border-[#0B2341] bg-[#0B2341]/10 text-[#0B2341]' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
    >
      {label}
    </button>
  )
}

function FileInput({ label, hint, onChange, file }: { label: string; hint: string; onChange: (f: File) => void; file: File | null }) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div>
      <label className="block text-sm font-semibold text-[#0B2341] mb-1.5">{label}</label>
      <div
        onClick={() => ref.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-5 cursor-pointer transition-all flex items-center gap-4 ${file ? 'border-[#0B2341] bg-[#0B2341]/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 ${file ? 'bg-[#0B2341]/20' : 'bg-gray-100'}`}>
          {file ? '✅' : '📄'}
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-semibold truncate ${file ? 'text-[#0B2341]' : 'text-gray-400'}`}>
            {file ? file.name : 'Click to upload'}
          </p>
          <p className="text-xs text-gray-400">{hint}</p>
        </div>
        <input ref={ref} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => e.target.files?.[0] && onChange(e.target.files[0])} />
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  // Shared
  const [role, setRole] = useState<Role>('parent')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Specialist multi-step
  const [step, setStep] = useState(0)
  const [specialist, setSpecialist] = useState<SpecialistData>({
    phone: '', bio: '', specialties: [], conditionsHandled: [], ageGroups: [], languages: [],
    sessionTypes: [], pricePerHour: '',
    cvFile: null, certFile: null,
    availableDays: [], availableTime: 'evening', bankName: '', iban: '', agreeTerms: false,
  })

  const setSpecField = <K extends keyof SpecialistData>(key: K, val: SpecialistData[K]) =>
    setSpecialist(p => ({ ...p, [key]: val }))

  const toggleArr = (key: keyof SpecialistData, val: string) => {
    const arr = specialist[key] as string[]
    setSpecField(key, arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  // ── Standard signup (parent/beneficiary)
  const handleSimpleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)

    try {
      const { data, error: err } = await supabase.auth.signUp({
        email, password,
        options: { 
          data: { 
            full_name: fullName, 
            role, 
          } 
        },
      })
      
      if (err) { setError(err.message); setLoading(false); return }
      
      // Create profile records
      if (data?.user) {
        // 1) Create a profiles record for any role (may already exist via trigger)
        const { error: profileErr } = await supabase.from('profiles').insert({
          id: data.user.id,
          role,
          full_name: fullName,
          email,
        })
        // Ignore duplicate errors (trigger may have already created it)
        if (profileErr && !profileErr.message.includes('duplicate')) {
          console.warn('Profile insert (non-critical):', profileErr.message)
        }

        // 2) Create parent_profiles for BOTH parent and beneficiary (self-managed)
        //    This ensures the foreign key on beneficiaries.parent_id is satisfied.
        const { error: ppErr } = await supabase.from('parent_profiles').insert({
          id: data.user.id,
          user_id: data.user.id,
        })
        if (ppErr && !ppErr.message.includes('duplicate')) {
          console.error('Parent profile error:', ppErr.message)
          setError(`Account created but profile setup failed. Please try logging in or contact support.`)
          setLoading(false)
          return
        }

        // 3) For beneficiary role, also create the beneficiary record
        if (role === 'beneficiary') {
          const { error: benErr } = await supabase.from('beneficiaries').insert({
            parent_id: data.user.id,
            full_name: fullName,
          })
          if (benErr) {
            console.error('Beneficiary insert error:', benErr.message)
            setError(`Account created but beneficiary profile setup failed. Please try logging in or contact support.`)
            setLoading(false)
            return
          }
        }
      }

      if (data.user) router.push('/login')
    } catch (unexpectedErr: any) {
      console.error('Unexpected signup error:', unexpectedErr)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Specialist step-1 create auth account then continue
  const handleSpecStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    const { data, error: err } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, role: 'specialist', phone: specialist.phone } },
    })
    if (err) { setError(err.message); setLoading(false); return }
    if (data.user) { setStep(1) }
    setLoading(false)
  }

  // ── Final specialist submission
  const handleSpecSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!specialist.agreeTerms) { setError('Please agree to the platform terms to continue.'); return }
    setLoading(true); setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Session lost. Please restart.'); setLoading(false); return }

    // Upload CV
    let cvUrl = ''
    if (specialist.cvFile) {
      const { data: cvData } = await supabase.storage
        .from('specialist-documents')
        .upload(`${user.id}/cv_${Date.now()}.pdf`, specialist.cvFile)
      cvUrl = cvData?.path ?? ''
    }

    // Upload Certificate
    let certUrl = ''
    if (specialist.certFile) {
      const { data: certData } = await supabase.storage
        .from('specialist-documents')
        .upload(`${user.id}/cert_${Date.now()}.pdf`, specialist.certFile)
      certUrl = certData?.path ?? ''
    }

    // Insert specialist_applications row
    const { error: dbErr } = await supabase.from('specialist_applications').insert({
      user_id: user.id,
      full_name: fullName,
      email,
      phone: specialist.phone,
      bio: specialist.bio,
      specialties: specialist.specialties,
      conditions_handled: specialist.conditionsHandled,
      age_groups: specialist.ageGroups,
      languages: specialist.languages,
      session_types: specialist.sessionTypes,
      price_per_hour: parseFloat(specialist.pricePerHour) || 0,
      cv_url: cvUrl,
      certificate_urls: certUrl ? [certUrl] : [],
      available_days: specialist.availableDays,
      available_time: specialist.availableTime,
      bank_name: specialist.bankName,
      iban: specialist.iban,
      status: 'pending',
    })

    if (dbErr) { setError(dbErr.message); setLoading(false); return }
    router.push('/login?status=pending')
  }

  // ── Left panel dynamic content
  const leftContent = {
    parent: {
      image: '/assets/auth/parent_new.png',
      title: 'For Parents',
      desc: 'Connect with verified specialists, track your child\'s progress, and manage therapy sessions securely.',
    },
    beneficiary: {
      image: '/assets/auth/student_new.png',
      title: 'For Beneficiaries',
      desc: 'Register to find the right support, build skills, and achieve your goals with expert guidance.',
    },
    specialist: {
      image: '/assets/auth/tutor_new.png',
      title: 'Join as a Specialist',
      desc: `Offer your expertise to those who need it most. Manage your IEPs, track progress, and grow your practice.`,
    },
  }[role]

  const specStepTitles = ['Create Your Account', 'Expertise & Specialties', 'Documents & Qualifications', 'Availability & Payout']

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-10 py-12 relative overflow-hidden border-r border-white/10"
           style={{ background: 'linear-gradient(145deg, #061C30 0%, #0B2341 50%, #122E52 100%)' }}>
        <div className="flex items-center gap-3 relative z-10">
          <img src="/assets/logo/sb_logo_light.png" alt="SB Project Logo" className="h-12 w-auto" />
          <div>
            <p className="font-bold text-white text-lg">SB Project</p>
            <p className="text-[10px] text-gray-300 font-medium tracking-widest uppercase">Special Needs Support</p>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="relative w-full rounded-2xl overflow-hidden shadow-xl bg-white/5" style={{ aspectRatio: '4/3', maxHeight: '400px' }}>
            <img
              key={role}
              src={leftContent.image}
              alt={leftContent.title}
              className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300"
            />
          </div>
          <div>
            <h2 className="text-3xl font-black leading-tight mb-3 text-white">{leftContent.title}</h2>
            <p className="text-slate-300 leading-relaxed">{leftContent.desc}</p>
          </div>

          {/* Specialist step tracker */}
          {role === 'specialist' && (
            <div className="space-y-2.5 pt-1">
              {SPECIALIST_STEPS.map((s, i) => (
                <div key={i} className={`flex items-center gap-3 transition-all ${i === step ? 'opacity-100' : i < step ? 'opacity-60' : 'opacity-40'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                    ${i < step ? 'bg-[#D4A017] border-[#D4A017] text-[#0B2341]' : i === step ? 'border-white text-white bg-transparent' : 'border-slate-600 text-slate-500'}`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${i === step ? 'text-white' : 'text-slate-400'}`}>{s.icon} {s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            {['🔒 Secure & Private', '✅ Verified Experts', '📊 IEP Tracking', '💙 Community'].map(b => (
              <div key={b} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300">{b}</div>
            ))}
          </div>
        </div>

        <p className="text-slate-500 text-xs relative z-10">© 2026 SB Project. All rights reserved.</p>
      </div>

      {/* ── Right Panel */}
      <div className="flex-1 flex items-start justify-center px-6 py-12 lg:px-14 lg:py-16 bg-white overflow-y-auto min-h-screen">
        <div className="w-full max-w-xl">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <img src="/assets/logo/sb_logo_dark.png" alt="SB Project" className="h-9 w-auto" />
            <p className="font-bold text-[#0B2341] text-lg">SB Project</p>
          </div>

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-[#0B2341] mb-2">
              {role === 'specialist' ? specStepTitles[step] : 'Create your account'}
            </h1>
            <p className="text-gray-500">
              {role === 'specialist' ? `Step ${step + 1} of ${SPECIALIST_STEPS.length} — Fill in your professional details` : 'Join the SB Project community today'}
            </p>
            {/* Progress bar for specialist */}
            {role === 'specialist' && (
              <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                <div className="h-full bg-[#0B2341] rounded-full transition-all duration-500" style={{ width: `${((step + 1) / SPECIALIST_STEPS.length) * 100}%` }} />
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-5 border border-red-100 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          {/* ══ ROLE SELECTOR */}
          {(role !== 'specialist' || step === 0) && step === 0 && (
            <div className="grid grid-cols-3 gap-4 mb-10">
              {([
                { r: 'parent', emoji: '👨‍👩‍👧', label: "Parent", sub: 'Manage care' },
                { r: 'beneficiary', emoji: '🌟', label: "Beneficiary", sub: 'Adult/Self-manage' },
                { r: 'specialist', emoji: '🩺', label: "Specialist", sub: 'Provide care' },
              ] as { r: Role; emoji: string; label: string; sub: string }[]).map(({ r, emoji, label, sub }) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`p-5 rounded-2xl border-2 transition-all text-left ${role === r ? 'border-[#0B2341] bg-[#0B2341]/5 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'}`}
                >
                  <div className="text-2xl mb-2">{emoji}</div>
                  <p className={`text-sm font-bold leading-tight ${role === r ? 'text-[#0B2341]' : 'text-gray-600'}`}>{label}</p>
                  <p className="text-xs text-gray-400 mt-1 leading-tight">{sub}</p>
                </button>
              ))}
            </div>
          )}

          {/* ══ PARENT / BENEFICIARY — Simple Form */}
          {role !== 'specialist' && (
            <form onSubmit={handleSimpleSignUp} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#0B2341] mb-2">Full Name</label>
                <input type="text" required placeholder="Your full name"
                  className="input-field" value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0B2341] mb-2">Email Address</label>
                <input type="email" required placeholder="you@example.com"
                  className="input-field" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0B2341] mb-2">Password</label>
                <input type="password" required placeholder="Min. 8 characters" minLength={8}
                  className="input-field" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? <Spinner text="Creating account..." /> : `Create ${role === 'parent' ? 'Parent' : 'Beneficiary'} Account`}
              </button>
              <p className="text-center text-gray-500 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-[#0B2341] font-semibold hover:underline">Sign in</Link>
              </p>
            </form>
          )}

          {/* ══════════════════════════════════════════
              SPECIALIST — Multi-Step Form
          ══════════════════════════════════════════ */}

          {/* ── STEP 1: Account Info */}
          {role === 'specialist' && step === 0 && (
            <form onSubmit={handleSpecStep1} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#0B2341] mb-2">Full Name</label>
                <input type="text" required placeholder="As it appears on your ID/License"
                  className="input-field" value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0B2341] mb-2">Email</label>
                  <input type="email" required placeholder="you@example.com"
                    className="input-field" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0B2341] mb-2">Phone</label>
                  <CountryPhoneInput
                    required
                    value={specialist.phone}
                    onChange={val => setSpecField('phone', val)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0B2341] mb-2">Password</label>
                <input type="password" required placeholder="Min. 8 characters" minLength={8}
                  className="input-field" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? <Spinner text="Saving..." /> : 'Continue → Expertise Profile'}
              </button>
              <p className="text-center text-gray-500 text-sm pt-1">
                Already have an account?{' '}
                <Link href="/login" className="text-[#0B2341] font-semibold hover:underline">Sign in</Link>
              </p>
            </form>
          )}

          {/* ── STEP 2: Teaching Profile */}
          {role === 'specialist' && step === 1 && (
            <form onSubmit={e => { e.preventDefault(); if (specialist.specialties.length === 0) { setError('Select at least one specialty'); return } setError(null); setStep(2) }} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#0B2341] mb-2">Specialties <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map(s => <Toggle key={s} label={s} checked={specialist.specialties.includes(s)} onChange={() => toggleArr('specialties', s)} />)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0B2341] mb-2">Conditions Handled</label>
                <div className="flex flex-wrap gap-2">
                  {CONDITIONS.map(c => <Toggle key={c} label={c} checked={specialist.conditionsHandled.includes(c)} onChange={() => toggleArr('conditionsHandled', c)} />)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0B2341] mb-2">Age Groups</label>
                <div className="flex flex-wrap gap-2">
                  {AGE_GROUPS.map(a => <Toggle key={a} label={a} checked={specialist.ageGroups.includes(a)} onChange={() => toggleArr('ageGroups', a)} />)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-[#0B2341] mb-2">Languages</label>
                  <div className="flex flex-wrap gap-2">
                    {LANGS.map(l => <Toggle key={l} label={l} checked={specialist.languages.includes(l)} onChange={() => toggleArr('languages', l)} />)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0B2341] mb-2">Session Types</label>
                  <div className="flex flex-wrap gap-2">
                    {SESSION_TYPES.map(t => <Toggle key={t} label={t} checked={specialist.sessionTypes.includes(t)} onChange={() => toggleArr('sessionTypes', t)} />)}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0B2341] mb-1.5">Price Per Hour (SAR / Local Currency)</label>
                <input type="number" min="1" max="1000" placeholder="e.g. 150"
                  className="input-field" value={specialist.pricePerHour} onChange={e => setSpecField('pricePerHour', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0B2341] mb-1.5">Short Bio</label>
                <textarea rows={3} placeholder="Tell us about your clinical experience, approach, and philosophy..."
                  className="input-field resize-none" value={specialist.bio} onChange={e => setSpecField('bio', e.target.value)} />
              </div>
              
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(0)} className="btn-secondary flex-1">← Back</button>
                <button type="submit" className="btn-primary flex-1">Continue → Documents</button>
              </div>
            </form>
          )}

          {/* ── STEP 3: Documents */}
          {role === 'specialist' && step === 2 && (
            <form onSubmit={e => { e.preventDefault(); setStep(3) }} className="space-y-5">
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl">
                <p className="text-xs text-sky-700 leading-relaxed">
                  <strong>📋 Verification Policy:</strong> SB Project ensures safety. You must upload a valid license (e.g. SCFHS) and CV. Only approved specialists can accept bookings.
                </p>
              </div>

              <FileInput
                label="CV / Resume"
                hint="PDF or image — Max 5MB"
                file={specialist.cvFile}
                onChange={f => setSpecField('cvFile', f)}
              />
              <FileInput
                label="Professional License / Degree"
                hint="Your active license to practice"
                file={specialist.certFile}
                onChange={f => setSpecField('certFile', f)}
              />
              
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
                <button type="submit" className="btn-primary flex-1">Continue → Availability</button>
              </div>
            </form>
          )}

          {/* ── STEP 4: Availability & Payout */}
          {role === 'specialist' && step === 3 && (
            <form onSubmit={handleSpecSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#0B2341] mb-2">Available Days</label>
                <div className="flex gap-2 flex-wrap">
                  {DAYS.map(d => <Toggle key={d} label={d} checked={specialist.availableDays.includes(d)} onChange={() => toggleArr('availableDays', d)} />)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0B2341] mb-2">Preferred Time Slot</label>
                <div className="grid grid-cols-3 gap-2">
                  {[['morning', '☀️ Morning', '6am–12pm'], ['afternoon', '🌤️ Afternoon', '12pm–5pm'], ['evening', '🌙 Evening', '5pm–10pm']].map(([val, label, sub]) => (
                    <button key={val} type="button" onClick={() => setSpecField('availableTime', val)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${specialist.availableTime === val ? 'border-[#0B2341] bg-[#0B2341]/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                      <p className="text-lg">{label.split(' ')[0]}</p>
                      <p className="text-xs font-semibold text-[#0B2341] mt-0.5">{label.split(' ')[1]}</p>
                      <p className="text-[10px] text-gray-400">{sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-5">
                <p className="text-sm font-semibold text-[#0B2341] mb-3">💳 Payout Details</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-[#0B2341] mb-1.5">Bank Name</label>
                    <input type="text" placeholder="e.g. Al Rajhi Bank"
                      className="input-field" value={specialist.bankName} onChange={e => setSpecField('bankName', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0B2341] mb-1.5">IBAN</label>
                    <input type="text" placeholder="SA00 XXXX 0000 0000 0000 00"
                      className="input-field" value={specialist.iban} onChange={e => setSpecField('iban', e.target.value)} />
                    <p className="text-xs text-gray-400 mt-1">Used for secure payouts.</p>
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-gray-200 bg-white cursor-pointer hover:border-[#0B2341]/30 transition-all">
                <input type="checkbox" checked={specialist.agreeTerms} onChange={e => setSpecField('agreeTerms', e.target.checked)} className="w-4 h-4 accent-[#0B2341] mt-0.5" />
                <p className="text-xs text-gray-600 leading-relaxed">
                  I agree to the <span className="text-[#0B2341] font-semibold">Specialist Terms & Conditions</span>, safeguarding rules, and privacy policy. I understand that my profile will be vetted before approval.
                </p>
              </label>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">← Back</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? <Spinner text="Submitting..." /> : '🚀 Submit Application'}
                </button>
              </div>

            </form>
          )}

        </div>
      </div>

      {/* Global styles */}
      <style jsx global>{`
        .input-field {
          display: block;
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #E5E7EB;
          background: #FFFFFF;
          padding: 0.75rem 1rem;
          color: #111827;
          font-size: 0.875rem;
          transition: all 0.15s;
          outline: none;
        }
        .input-field:focus {
          border-color: #0B2341;
          box-shadow: 0 0 0 3px rgba(11,35,65,0.1);
        }
        .btn-primary {
          background: #0B2341;
          color: white;
          font-weight: 700;
          font-size: 0.875rem;
          padding: 0.875rem 1.5rem;
          border-radius: 0.75rem;
          border: 2px solid transparent;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        .btn-primary:hover:not(:disabled) {
          background: #071829;
          box-shadow: 0 4px 12px rgba(11,35,65,0.25);
        }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-secondary {
          background: white;
          color: #0B2341;
          font-weight: 600;
          font-size: 0.875rem;
          padding: 0.875rem 1.5rem;
          border-radius: 0.75rem;
          border: 2px solid #E5E7EB;
          transition: all 0.2s;
          cursor: pointer;
        }
        .btn-secondary:hover { border-color: #9CA3AF; }
      `}</style>
    </div>
  )
}

function Spinner({ text }: { text: string }) {
  return (
    <span className="flex items-center justify-center gap-2">
      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      {text}
    </span>
  )
}

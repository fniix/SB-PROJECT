'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ─── Constants ──────────────────────────────────────────────
const GRADES = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9',
  'Grade 10', 'Grade 11', 'Grade 12',
]

const SPECIAL_CONDITIONS = [
  { val: 'autism',       icon: '🧩', label: 'Autism Spectrum' },
  { val: 'adhd',         icon: '⚡', label: 'ADHD' },
  { val: 'dyslexia',     icon: '📖', label: 'Dyslexia' },
  { val: 'down_syndrome',icon: '💛', label: 'Down Syndrome' },
  { val: 'hearing',      icon: '👂', label: 'Hearing Impairment' },
  { val: 'visual',       icon: '👁️', label: 'Visual Impairment' },
  { val: 'speech',       icon: '🗣️', label: 'Speech Delay' },
  { val: 'other',        icon: '💙', label: 'Other' },
]

const CURRICULA = [
  { val: 'Bahrain Public', flag: '🇧🇭', desc: 'Ministry of Education' },
  { val: 'British / IGCSE', flag: '🇬🇧', desc: 'Cambridge IGCSE / A-Levels' },
  { val: 'American', flag: '🇺🇸', desc: 'SAT / AP' },
  { val: 'IB', flag: '🌍', desc: 'International Baccalaureate' },
  { val: 'Indian (CBSE)', flag: '🇮🇳', desc: 'CBSE Curriculum' },
  { val: 'Other', flag: '📚', desc: 'Other / Mixed' },
]

const SUBJECTS = [
  'Mathematics', 'English', 'Arabic', 'Physics', 'Chemistry',
  'Biology', 'Accounting', 'Statistics', 'Programming', 'Science',
  'History', 'Geography', 'Islamic Studies',
]

const GOALS = [
  { val: 'improve_grades',   icon: '📈', label: 'Improve Grades',      desc: 'Boost overall academic performance' },
  { val: 'exam_prep',        icon: '📝', label: 'Exam Preparation',    desc: 'Focus on specific exams (IGCSE, SAT, etc.)' },
  { val: 'catch_up',         icon: '🏃', label: 'Catch Up',            desc: 'Cover missed material and fill gaps' },
  { val: 'advanced',         icon: '🚀', label: 'Advanced Learning',   desc: 'Go beyond the syllabus' },
  { val: 'homework_support', icon: '✏️',  label: 'Homework Support',   desc: 'Regular homework help and guidance' },
  { val: 'special_needs',    icon: '💙', label: 'Special Needs Support', desc: 'Tailored support for individual needs' },
]

const SESSION_PREFS = [
  { val: 'online',    icon: '💻', label: 'Online', desc: 'Via video call' },
  { val: 'inperson',  icon: '🏠', label: 'In-Person', desc: 'At home or tutor location' },
  { val: 'both',      icon: '🔄', label: 'Flexible', desc: 'Either works' },
]

const STEPS = [
  { icon: '👦', label: 'Child Info' },
  { icon: '🎯', label: 'Goals & Subjects' },
  { icon: '📅', label: 'Preferences' },
]

// ─── Component ──────────────────────────────────────────────
function AddChildForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isOnboarding = searchParams.get('onboarding') === '1'
  const supabase = createClient()

  const [step, setStep]   = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Step 1 — Child info
  const [fullName,    setFullName]    = useState('')
  const [age,         setAge]         = useState('')
  const [grade,       setGrade]       = useState('')
  const [schoolName,  setSchoolName]  = useState('')
  const [curriculum,  setCurriculum]  = useState('')
  const [hasSpecialNeeds, setHasSpecialNeeds] = useState(false)
  const [specialConditions, setSpecialConditions] = useState<string[]>([])
  const [motivators, setMotivators]   = useState('')  // What child likes / rewards
  const [triggers, setTriggers]       = useState('')  // What upsets / to avoid
  const [communicationLevel, setCommunicationLevel] = useState('verbal')

  // Step 2 — Goals
  const [goals,    setGoals]    = useState<string[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [notes,    setNotes]    = useState('')

  // Step 3 — Preferences
  const [sessionPref,    setSessionPref]    = useState('both')
  const [budgetPerHour,  setBudgetPerHour]  = useState('')
  const [preferredDays,  setPreferredDays]  = useState<string[]>([])
  const [preferredTime,  setPreferredTime]  = useState('evening')
  const [genderPref,     setGenderPref]     = useState('no_preference')

  const toggleArr = (arr: string[], val: string, setArr: (v: string[]) => void) =>
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])

  // ── Validation per step
  const canProceed = () => {
    if (step === 0) return fullName.trim().length > 1 && grade && curriculum
    if (step === 1) return goals.length > 0 && subjects.length > 0
    return true
  }

  // ── Final submit
  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Session expired. Please log in again.'); setLoading(false); return }

    // Upsert parent_profiles row if missing
    const { data: parentProfile } = await supabase
      .from('parent_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    let parentId = parentProfile?.id
    if (!parentId) {
      const { data: newParent, error: ppErr } = await supabase
        .from('parent_profiles')
        .insert({ user_id: user.id })
        .select('id')
        .single()
      if (ppErr) { setError(ppErr.message); setLoading(false); return }
      parentId = newParent?.id
    }

    // Insert student record — using proper schema columns
    const { error: insertErr } = await supabase.from('students').insert({
      parent_id:            parentId,
      full_name:            fullName.trim(),
      age:                  age ? parseInt(age) : null,
      grade,
      school_name:          schoolName,
      curriculum,
      // Special needs — saved in dedicated columns (no JSON needed)
      has_special_needs:    hasSpecialNeeds,
      special_conditions:   hasSpecialNeeds ? specialConditions : [],
      motivators:           hasSpecialNeeds ? (motivators.trim() || null) : null,
      triggers:             hasSpecialNeeds ? (triggers.trim() || null) : null,
      communication_level:  hasSpecialNeeds ? communicationLevel : null,
      learning_goals:       goals,
      weak_subjects:        subjects,
      notes,
      session_preference:   sessionPref,
      budget_per_hour:      budgetPerHour ? parseFloat(budgetPerHour) : null,
      preferred_days:       preferredDays,
      preferred_time:       preferredTime,
      gender_preference:    genderPref,
    })

    if (insertErr) { setError(insertErr.message); setLoading(false); return }

    // Redirect: onboarding → smart match, regular → parent dashboard
    window.location.href = isOnboarding
      ? '/dashboard/parent/smart-match?new=1'
      : '/dashboard/parent?added=1'
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">

      {/* ── Top bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/assets/logo/sb_logo_dark.png" alt="SB Project" className="h-8 w-auto" />
          <span className="text-sm font-semibold text-[#0B2341]">
            {isOnboarding ? 'Welcome Setup — Add Your Child' : 'Add a Child'}
          </span>
        </div>
        {!isOnboarding && (
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-[#0B2341] font-medium transition-colors">
            ← Back
          </button>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* ── Onboarding welcome */}
        {isOnboarding && step === 0 && (
          <div className="mb-8 p-6 bg-gradient-to-br from-[#0B2341] to-[#1a3a5c] rounded-3xl text-white">
            <div className="text-3xl mb-3">🎉</div>
            <h2 className="text-xl font-bold mb-2">Account created! Let's set up your child's profile</h2>
            <p className="text-blue-200 text-sm leading-relaxed">
              Tell us about your child so we can match them with the best tutors in Bahrain. This takes less than 2 minutes.
            </p>
          </div>
        )}

        {/* ── Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-semibold
                ${i === step ? 'bg-[#0B2341] text-white shadow-md' :
                  i < step ? 'bg-[#D4A017]/20 text-[#0B2341]' :
                  'bg-gray-100 text-gray-400'}`}>
                <span>{i < step ? '✓' : s.icon}</span>
                <span className="hidden sm:block">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 w-6 rounded ${i < step ? 'bg-[#D4A017]' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* ── Progress bar */}
        <div className="h-1.5 bg-gray-200 rounded-full mb-8 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#D4A017] to-[#f0c040] rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>

        {/* ── Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm flex items-center gap-3">
            <span className="text-xl">⚠️</span> {error}
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP 1 — Child Info
        ══════════════════════════════════════════ */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0B2341] mb-1">Child Information</h1>
              <p className="text-gray-500 text-sm">Basic details about the student</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-[#0B2341] mb-2">Child's Full Name <span className="text-red-500">*</span></label>
                <input type="text" required placeholder="e.g. Ahmed Al-Hassan"
                  className="input-ob" value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0B2341] mb-2">Age</label>
                <input type="number" min="4" max="25" placeholder="e.g. 12"
                  className="input-ob" value={age} onChange={e => setAge(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0B2341] mb-2">School Name</label>
                <input type="text" placeholder="School name"
                  className="input-ob" value={schoolName} onChange={e => setSchoolName(e.target.value)} />
              </div>
            </div>

            {/* Grade */}
            <div>
              <label className="block text-sm font-semibold text-[#0B2341] mb-2">Grade / Year <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-4 gap-2">
                {GRADES.map(g => (
                  <button key={g} type="button" onClick={() => setGrade(g)}
                    className={`py-2.5 rounded-xl text-xs font-semibold border-2 transition-all
                      ${grade === g ? 'border-[#D4A017] bg-[#D4A017]/10 text-[#0B2341]' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
                    {g.replace('Grade ', 'G')}
                  </button>
                ))}
              </div>
            </div>

            {/* Curriculum */}
            <div>
              <label className="block text-sm font-semibold text-[#0B2341] mb-2">Curriculum <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-3">
                {CURRICULA.map(c => (
                  <button key={c.val} type="button" onClick={() => setCurriculum(c.val)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all
                      ${curriculum === c.val ? 'border-[#D4A017] bg-[#D4A017]/5 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{c.flag}</span>
                      <span className="text-sm font-bold text-[#0B2341]">{c.val}</span>
                    </div>
                    <p className="text-xs text-gray-400">{c.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Special needs — Expanded Structured Section */}
            <div className="border-2 border-blue-100 rounded-2xl overflow-hidden">
              {/* Toggle Header */}
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-blue-50 hover:bg-blue-100/60 transition-colors">
                <input
                  type="checkbox" checked={hasSpecialNeeds}
                  onChange={e => setHasSpecialNeeds(e.target.checked)}
                  className="w-5 h-5 accent-[#0B2341] rounded"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#0B2341]">💙 Special Learning Needs</p>
                  <p className="text-xs text-gray-500">You will be matched with a specialist tutor</p>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  hasSpecialNeeds ? 'bg-[#0B2341] text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {hasSpecialNeeds ? '✓' : '?'}
                </div>
              </label>

              {/* Expanded Details */}
              {hasSpecialNeeds && (
                <div className="p-4 space-y-5 bg-white">

                  {/* Condition Type */}
                  <div>
                    <p className="text-sm font-bold text-[#0B2341] mb-2">🏷️ Condition Type <span className="font-normal text-gray-400">(select all that apply)</span></p>
                    <div className="grid grid-cols-2 gap-2">
                      {SPECIAL_CONDITIONS.map(c => (
                        <button
                          key={c.val} type="button"
                          onClick={() => setSpecialConditions(prev =>
                            prev.includes(c.val) ? prev.filter(x => x !== c.val) : [...prev, c.val]
                          )}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all text-xs font-semibold ${
                            specialConditions.includes(c.val)
                              ? 'border-blue-400 bg-blue-50 text-blue-800'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-base">{c.icon}</span>
                          <div>
                            <p>{c.label}</p>
                          </div>
                          {specialConditions.includes(c.val) && (
                            <span className="ml-auto text-blue-500">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Communication Level */}
                  <div>
                    <p className="text-sm font-bold text-[#0B2341] mb-2">🗣️ Communication Level</p>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { val: 'verbal',     label: 'Fluent / Verbal' },
                        { val: 'limited',    label: 'Limited Speech' },
                        { val: 'non_verbal', label: 'Non-Verbal' },
                        { val: 'aac',        label: 'Uses AAC Device' },
                      ].map(opt => (
                        <button key={opt.val} type="button"
                          onClick={() => setCommunicationLevel(opt.val)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                            communicationLevel === opt.val
                              ? 'border-[#D4A017] bg-[#D4A017]/10 text-[#0B2341]'
                              : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Motivators */}
                  <div>
                    <label className="block text-sm font-bold text-[#0B2341] mb-1">
                      ⭐ Motivators & Rewards
                    </label>
                    <p className="text-xs text-gray-400 mb-2">What does the child like? What encourages them to learn?</p>
                    <textarea rows={2} className="input-ob resize-none text-sm"
                      placeholder="e.g. Loves dinosaurs, responds well to praise, likes colors..."
                      value={motivators} onChange={e => setMotivators(e.target.value)}
                    />
                  </div>

                  {/* Triggers */}
                  <div>
                    <label className="block text-sm font-bold text-red-600 mb-1">
                      ⚠️ Triggers / What to Avoid
                    </label>
                    <p className="text-xs text-gray-400 mb-2">What upsets the child or causes distress?</p>
                    <textarea rows={2} className="input-ob resize-none text-sm border-red-200 focus:border-red-400"
                      placeholder="e.g. Loud noises, sudden changes, crowded spaces..."
                      value={triggers} onChange={e => setTriggers(e.target.value)}
                    />
                  </div>

                  {/* Info note for tutor */}
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <span className="text-lg">💡</span>
                    <p className="text-xs text-amber-700">
                      The specialist tutor will be able to see this information before the session to prepare better.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP 2 — Goals & Subjects
        ══════════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0B2341] mb-1">Goals & Subjects</h1>
              <p className="text-gray-500 text-sm">What does {fullName || 'your child'} need help with?</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0B2341] mb-3">Main Learning Goal <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-1 gap-3">
                {GOALS.map(g => (
                  <button key={g.val} type="button" onClick={() => toggleArr(goals, g.val, setGoals)}
                    className={`p-4 rounded-2xl border-2 text-left flex items-center gap-4 transition-all
                      ${goals.includes(g.val) ? 'border-[#D4A017] bg-[#D4A017]/5 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0
                      ${goals.includes(g.val) ? 'bg-[#D4A017]/20' : 'bg-gray-100'}`}>
                      {g.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0B2341]">{g.label}</p>
                      <p className="text-xs text-gray-400">{g.desc}</p>
                    </div>
                    {goals.includes(g.val) && (
                      <div className="ml-auto w-5 h-5 bg-[#D4A017] rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0B2341] mb-3">Subjects Needing Help <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map(s => (
                  <button key={s} type="button" onClick={() => toggleArr(subjects, s, setSubjects)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all
                      ${subjects.includes(s) ? 'border-[#D4A017] bg-[#D4A017]/10 text-[#0B2341]' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0B2341] mb-2">Additional Notes <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea rows={3} placeholder="Any specific exams, topics, or details that will help us match the right tutor..."
                className="input-ob resize-none" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP 3 — Preferences
        ══════════════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0B2341] mb-1">Session Preferences</h1>
              <p className="text-gray-500 text-sm">Help us find the perfect match for {fullName || 'your child'}</p>
            </div>

            {/* Session type */}
            <div>
              <label className="block text-sm font-semibold text-[#0B2341] mb-3">Session Type</label>
              <div className="grid grid-cols-3 gap-3">
                {SESSION_PREFS.map(p => (
                  <button key={p.val} type="button" onClick={() => setSessionPref(p.val)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all
                      ${sessionPref === p.val ? 'border-[#D4A017] bg-[#D4A017]/5 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <div className="text-2xl mb-1">{p.icon}</div>
                    <p className="text-sm font-bold text-[#0B2341]">{p.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-semibold text-[#0B2341] mb-2">Budget per Hour (BHD) <span className="text-gray-400 font-normal">optional</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">BHD</span>
                <input type="number" min="1" max="100" placeholder="e.g. 10"
                  className="input-ob !pl-14" value={budgetPerHour} onChange={e => setBudgetPerHour(e.target.value)} />
              </div>
              <p className="text-xs text-gray-400 mt-1">Average tutors charge 6–15 BHD/hour. Premium tutors may charge more.</p>
            </div>

            {/* Preferred days */}
            <div>
              <label className="block text-sm font-semibold text-[#0B2341] mb-3">Preferred Days</label>
              <div className="flex gap-2 flex-wrap">
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                  <button key={d} type="button" onClick={() => toggleArr(preferredDays, d, setPreferredDays)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all
                      ${preferredDays.includes(d) ? 'border-[#D4A017] bg-[#D4A017]/10 text-[#0B2341]' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Time preference */}
            <div>
              <label className="block text-sm font-semibold text-[#0B2341] mb-3">Preferred Time</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { val: 'morning',   icon: '☀️',  label: 'Morning',   sub: '6am–12pm' },
                  { val: 'afternoon', icon: '🌤️', label: 'Afternoon', sub: '12pm–5pm' },
                  { val: 'evening',   icon: '🌙',  label: 'Evening',   sub: '5pm–10pm' },
                ].map(t => (
                  <button key={t.val} type="button" onClick={() => setPreferredTime(t.val)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all
                      ${preferredTime === t.val ? 'border-[#D4A017] bg-[#D4A017]/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <div className="text-2xl mb-1">{t.icon}</div>
                    <p className="text-sm font-bold text-[#0B2341]">{t.label}</p>
                    <p className="text-xs text-gray-400">{t.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Gender preference */}
            <div>
              <label className="block text-sm font-semibold text-[#0B2341] mb-3">Tutor Gender Preference</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { val: 'no_preference', label: 'No Preference', icon: '🤝' },
                  { val: 'male',          label: 'Male Tutor',    icon: '👨‍🏫' },
                  { val: 'female',        label: 'Female Tutor',  icon: '👩‍🏫' },
                ].map(g => (
                  <button key={g.val} type="button" onClick={() => setGenderPref(g.val)}
                    className={`p-3.5 rounded-2xl border-2 text-center transition-all
                      ${genderPref === g.val ? 'border-[#D4A017] bg-[#D4A017]/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <div className="text-xl mb-1">{g.icon}</div>
                    <p className="text-xs font-bold text-[#0B2341]">{g.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Summary card */}
            <div className="p-5 bg-[#0B2341]/5 border border-[#0B2341]/10 rounded-2xl">
              <p className="text-sm font-bold text-[#0B2341] mb-3">📋 Profile Summary</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div><span className="text-gray-400">Name:</span> {fullName}</div>
                <div><span className="text-gray-400">Grade:</span> {grade}</div>
                <div><span className="text-gray-400">Curriculum:</span> {curriculum}</div>
                <div><span className="text-gray-400">Subjects:</span> {subjects.slice(0, 3).join(', ')}{subjects.length > 3 ? '...' : ''}</div>
                <div><span className="text-gray-400">Goal:</span> {goals[0]?.replace(/_/g, ' ')}</div>
                <div><span className="text-gray-400">Session:</span> {sessionPref}</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          {step > 0 && (
            <button type="button" onClick={() => setStep(s => s - 1)}
              className="flex-1 py-4 rounded-2xl border-2 border-gray-200 font-semibold text-gray-600 hover:border-gray-300 transition-all text-sm">
              ← Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => { if (canProceed()) { setError(null); setStep(s => s + 1) } else setError('Please complete all required fields (*) before continuing.') }}
              className="flex-1 py-4 rounded-2xl bg-[#0B2341] text-white font-bold text-sm hover:bg-[#071829] border-2 border-transparent hover:border-[#D4A017] transition-all shadow-md disabled:opacity-50">
              Continue →
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="flex-1 py-4 rounded-2xl bg-[#0B2341] text-white font-bold text-sm hover:bg-[#071829] border-2 border-transparent hover:border-[#D4A017] transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Saving...
                </>
              ) : isOnboarding ? '🚀 Find My Tutor →' : '✅ Save Child Profile'}
            </button>
          )}
        </div>

        {/* Skip for onboarding */}
        {isOnboarding && (
          <p className="text-center text-xs text-gray-400 mt-4">
            <button onClick={() => window.location.href = '/dashboard/parent'} className="hover:text-gray-600 underline transition-colors">
              Skip for now — complete later
            </button>
          </p>
        )}
      </div>

      {/* Global styles */}
      <style jsx global>{`
        .input-ob {
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
        .input-ob:focus {
          border-color: #D4A017;
          box-shadow: 0 0 0 3px rgba(212,160,23,0.1);
        }
      `}</style>
    </div>
  )
}

export default function AddChildOnboarding() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
          <p className="text-sm text-gray-500 animate-pulse">Loading setup...</p>
        </div>
      }
    >
      <AddChildForm />
    </Suspense>
  )
}

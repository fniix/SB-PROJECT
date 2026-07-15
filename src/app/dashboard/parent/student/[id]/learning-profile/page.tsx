'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const SUBJECTS = ['Mathematics', 'English', 'Science', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Arabic', 'Islamic Studies', 'Computer Science', 'Economics', 'Business Studies', 'Art', 'Music', 'Physical Education']

const GOALS = ['Improve exam grades', 'Build confidence', 'Catch up with class', 'Prepare for university', 'Master core concepts', 'Develop study skills', 'Pass IGCSE', 'Pass A-Levels', 'SAT preparation', 'IB Diploma support']

export default function LearningProfilePage() {
  const params = useParams()
  const studentId = params.id as string

  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)

  const [learningStyle, setLearningStyle] = useState('mixed')
  const [weakSubjects, setWeakSubjects] = useState<string[]>([])
  const [strongSubjects, setStrongSubjects] = useState<string[]>([])
  const [specialNeeds, setSpecialNeeds] = useState('')
  const [preferredLength, setPreferredLength] = useState(60)
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [customGoal, setCustomGoal] = useState('')
  const [notes, setNotes] = useState('')
  const [riskLevel, setRiskLevel] = useState('low')

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: s } = await supabase.from('students').select('*').eq('id', studentId).single()
      setStudent(s)

      const { data: lp } = await supabase.from('student_learning_profiles').select('*').eq('student_id', studentId).maybeSingle()
      if (lp) {
        setProfileId(lp.id)
        setLearningStyle(lp.learning_style || 'mixed')
        setWeakSubjects(lp.weak_subjects || [])
        setStrongSubjects(lp.strong_subjects || [])
        setSpecialNeeds(lp.special_needs || '')
        setPreferredLength(lp.preferred_session_length || 60)
        setSelectedGoals(lp.goals || [])
        setNotes(lp.notes || '')
        setRiskLevel(lp.risk_level || 'low')
      }
      setLoading(false)
    }
    load()
  }, [studentId, router, supabase])

  const toggleSubject = (sub: string, type: 'weak' | 'strong') => {
    if (type === 'weak') {
      setWeakSubjects(prev => prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub])
      setStrongSubjects(prev => prev.filter(s => s !== sub))
    } else {
      setStrongSubjects(prev => prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub])
      setWeakSubjects(prev => prev.filter(s => s !== sub))
    }
  }

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev => prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal])
  }

  const addCustomGoal = () => {
    if (customGoal.trim() && !selectedGoals.includes(customGoal.trim())) {
      setSelectedGoals(prev => [...prev, customGoal.trim()])
      setCustomGoal('')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      student_id: studentId,
      learning_style: learningStyle,
      weak_subjects: weakSubjects,
      strong_subjects: strongSubjects,
      special_needs: specialNeeds,
      preferred_session_length: preferredLength,
      goals: selectedGoals,
      notes,
      risk_level: riskLevel,
      updated_at: new Date().toISOString(),
    }

    let error
    if (profileId) {
      const res = await supabase.from('student_learning_profiles').update(payload).eq('id', profileId)
      error = res.error
    } else {
      const res = await supabase.from('student_learning_profiles').insert(payload).select('id').single()
      error = res.error
      if (res.data) setProfileId(res.data.id)
    }

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      alert('Error saving: ' + error.message)
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-screen bg-[#F0EDE8]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#0B2341] border-t-[#D4A017] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#0B2341] font-semibold">Loading learning profile...</p>
      </div>
    </div>
  )

  const learningStyles = [
    { key: 'visual',      emoji: '👁️',  label: 'Visual',      desc: 'Learns best with charts, images, and diagrams' },
    { key: 'auditory',    emoji: '👂',  label: 'Auditory',    desc: 'Learns best by listening and discussing' },
    { key: 'reading',     emoji: '📖',  label: 'Reading',     desc: 'Learns best through reading and writing' },
    { key: 'kinesthetic', emoji: '🤲', label: 'Kinesthetic', desc: 'Learns best through hands-on activities' },
    { key: 'mixed',       emoji: '🔀',  label: 'Mixed',       desc: 'Responds well to a variety of approaches' },
  ]

  return (
    <div className="min-h-screen bg-[#F0EDE8] p-6 lg:p-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm">
        <Link href="/dashboard/parent" className="text-gray-400 hover:text-[#0B2341]">Dashboard</Link>
        <span className="text-gray-300">/</span>
        <Link href={`/dashboard/parent/student/${studentId}`} className="text-gray-400 hover:text-[#0B2341]">{student?.full_name}</Link>
        <span className="text-gray-300">/</span>
        <span className="font-semibold text-[#0B2341]">Learning Profile</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#0B2341] to-[#1a3a5c] rounded-2xl p-6 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#D4A017] rounded-xl flex items-center justify-center font-black text-white text-2xl">
            {student?.full_name?.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Learning Profile</h1>
            <p className="text-gray-300 text-sm">{student?.full_name} • {student?.grade}</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#D4A017] hover:bg-[#b8860b] text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md disabled:opacity-60 flex items-center gap-2"
        >
          {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : saved ? '✅ Saved!' : '💾 Save Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-6">

          {/* Learning Style */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-[#0B2341] text-lg mb-5 flex items-center gap-2">🧠 Learning Style</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {learningStyles.map(s => (
                <button
                  key={s.key}
                  onClick={() => setLearningStyle(s.key)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${learningStyle === s.key ? 'border-[#D4A017] bg-[#D4A017]/5' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div className="text-2xl mb-2">{s.emoji}</div>
                  <p className={`text-sm font-bold ${learningStyle === s.key ? 'text-[#0B2341]' : 'text-gray-600'}`}>{s.label}</p>
                  <p className="text-xs text-gray-400 mt-1">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Subjects */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-[#0B2341] text-lg mb-2">📚 Subject Strengths & Weaknesses</h2>
            <p className="text-xs text-gray-400 mb-5">Click once for Strong ✅, click again for Weak ❌, click again to deselect</p>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map(sub => {
                const isStrong = strongSubjects.includes(sub)
                const isWeak = weakSubjects.includes(sub)
                return (
                  <div key={sub} className="flex rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                    <span className="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600">{sub}</span>
                    <button onClick={() => toggleSubject(sub, 'strong')} className={`px-2 py-2 text-xs font-bold transition-all ${isStrong ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600'}`} title="Strong">✅</button>
                    <button onClick={() => toggleSubject(sub, 'weak')} className={`px-2 py-2 text-xs font-bold transition-all ${isWeak ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600'}`} title="Weak">❌</button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Goals */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-[#0B2341] text-lg mb-5 flex items-center gap-2">🎯 Learning Goals</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {GOALS.map(goal => (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${selectedGoals.includes(goal) ? 'bg-[#0B2341] text-white border-[#0B2341]' : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-[#D4A017] hover:text-[#0B2341]'}`}
                >
                  {selectedGoals.includes(goal) ? '✓ ' : ''}{goal}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <input
                type="text"
                placeholder="Add a custom goal..."
                value={customGoal}
                onChange={e => setCustomGoal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomGoal()}
                className="flex-1 rounded-xl border border-gray-200 bg-[#F0EDE8] px-4 py-2 text-sm focus:border-[#D4A017]"
              />
              <button onClick={addCustomGoal} className="bg-[#D4A017] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#b8860b] transition-colors">
                + Add
              </button>
            </div>
            {selectedGoals.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedGoals.map(g => (
                  <span key={g} className="bg-[#0B2341] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    {g}
                    <button onClick={() => toggleGoal(g)} className="text-white/60 hover:text-white text-xs">✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Session Notes */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-[#0B2341] text-lg mb-3">📝 Additional Notes for Tutors</h2>
            <textarea
              rows={4}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any special instructions, medical considerations, or important information tutors should know..."
              className="w-full rounded-xl border border-gray-200 bg-[#F0EDE8] px-4 py-3 text-sm focus:border-[#D4A017]"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Preferred Session Length */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-[#0B2341] mb-4 flex items-center gap-2">⏱️ Session Length</h2>
            <div className="grid grid-cols-2 gap-2">
              {[30, 45, 60, 90, 120].map(len => (
                <button
                  key={len}
                  onClick={() => setPreferredLength(len)}
                  className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${preferredLength === len ? 'border-[#D4A017] bg-[#D4A017]/5 text-[#0B2341]' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                >
                  {len < 60 ? `${len} min` : `${len/60}${len === 90 ? '.5' : ''} hr`}
                </button>
              ))}
            </div>
          </div>

          {/* Risk Level */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-[#0B2341] mb-4 flex items-center gap-2">🚩 Risk Assessment</h2>
            <div className="space-y-2">
              {[
                { key: 'low',    label: 'On Track',          icon: '✅', color: 'border-green-300 bg-green-50 text-green-700' },
                { key: 'medium', label: 'Needs Attention',   icon: '⚠️', color: 'border-amber-300 bg-amber-50 text-amber-700' },
                { key: 'high',   label: 'At Risk',           icon: '🚨', color: 'border-red-300 bg-red-50 text-red-700' },
              ].map(r => (
                <button
                  key={r.key}
                  onClick={() => setRiskLevel(r.key)}
                  className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${riskLevel === r.key ? r.color : 'border-gray-100 text-gray-500'}`}
                >
                  <span>{r.icon}</span>
                  <span className="text-sm font-bold">{r.label}</span>
                  {riskLevel === r.key && <span className="ml-auto text-xs font-bold">Selected</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Special Needs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-[#0B2341] mb-3 flex items-center gap-2">♿ Special Needs / Accommodations</h2>
            <textarea
              rows={3}
              value={specialNeeds}
              onChange={e => setSpecialNeeds(e.target.value)}
              placeholder="e.g. Dyslexia, ADHD, hearing impairment..."
              className="w-full rounded-xl border border-gray-200 bg-[#F0EDE8] px-4 py-3 text-sm focus:border-[#D4A017]"
            />
          </div>

          {/* Summary */}
          {(strongSubjects.length > 0 || weakSubjects.length > 0) && (
            <div className="bg-gradient-to-br from-[#0B2341] to-[#1a3a5c] rounded-2xl p-5 text-white">
              <h3 className="font-bold mb-3 text-sm uppercase tracking-wider">📊 Profile Summary</h3>
              {strongSubjects.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] text-green-400 font-bold uppercase mb-1">Strengths ({strongSubjects.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {strongSubjects.map(s => <span key={s} className="bg-green-500/20 text-green-300 text-[10px] px-2 py-0.5 rounded-md font-medium">{s}</span>)}
                  </div>
                </div>
              )}
              {weakSubjects.length > 0 && (
                <div>
                  <p className="text-[10px] text-red-400 font-bold uppercase mb-1">Needs Work ({weakSubjects.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {weakSubjects.map(s => <span key={s} className="bg-red-500/20 text-red-300 text-[10px] px-2 py-0.5 rounded-md font-medium">{s}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Save Footer */}
      <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
        <Link href={`/dashboard/parent/student/${studentId}`} className="text-gray-400 hover:text-[#0B2341] text-sm font-medium transition-colors">← Back to Profile</Link>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#0B2341] hover:bg-[#071829] hover:border-[#D4A017] border-2 border-transparent text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md disabled:opacity-60"
        >
          {saving ? 'Saving...' : saved ? '✅ Saved!' : 'Save Learning Profile'}
        </button>
      </div>
    </div>
  )
}

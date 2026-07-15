'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

// ---- Tabs ----
type Tab = 'profile' | 'learning' | 'sessions' | 'progress'

function TabButton({ label, icon, active, onClick }: { label: string; icon: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
        active
          ? 'border-[#D4A017] text-[#0B2341]'
          : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'
      }`}
    >
      <span>{icon}</span> {label}
    </button>
  )
}

// ---- Risk Flag ----
function RiskBadge({ level }: { level: string }) {
  const config: Record<string, { color: string; label: string; icon: string }> = {
    low:    { color: 'bg-green-100 text-green-700 border-green-200',  label: 'On Track',      icon: '✅' },
    medium: { color: 'bg-amber-100 text-amber-700 border-amber-200',  label: 'Needs Attention', icon: '⚠️' },
    high:   { color: 'bg-red-100 text-red-700 border-red-200',        label: 'At Risk',         icon: '🚨' },
  }
  const cfg = config[level] || config.low
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

// ---- Progress Bar ----
function ProgressBar({ value, label, color = 'bg-[#D4A017]' }: { value: number; label: string; color?: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1.5">
        <span>{label}</span>
        <span className="text-[#0B2341]">{value}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export default function StudentProfilePage() {
  const params = useParams()
  const studentId = params.id as string

  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [student, setStudent] = useState<any>(null)
  const [learningProfile, setLearningProfile] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [performance, setPerformance] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchAll() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [studentRes, lpRes, sessRes, perfRes, assignRes] = await Promise.all([
        supabase.from('students').select('*').eq('id', studentId).single(),
        supabase.from('student_learning_profiles').select('*').eq('student_id', studentId).maybeSingle(),
        supabase.from('bookings').select('*, session_notes(*)').eq('student_id', studentId).order('date', { ascending: false }),
        supabase.from('student_performance').select('*').eq('student_id', studentId).order('recorded_at', { ascending: false }),
        supabase.from('assignments').select('*').eq('student_id', studentId).order('created_at', { ascending: false }),
      ])

      if (studentRes.error) { setError('Student not found.'); setLoading(false); return }

      setStudent(studentRes.data)
      setLearningProfile(lpRes.data)
      setSessions(sessRes.data || [])
      setPerformance(perfRes.data || [])
      setAssignments(assignRes.data || [])
      setLoading(false)
    }
    fetchAll()
  }, [studentId, router, supabase])

  const handleDelete = async () => {
    if (!window.confirm('Delete this student profile? This cannot be undone.')) return
    setDeleteLoading(true)
    const { error } = await supabase.from('students').delete().eq('id', studentId)
    if (error) { alert(error.message); setDeleteLoading(false) }
    else { router.push('/dashboard/parent'); router.refresh() }
  }

  // Compute risk from sessions and performance
  const computedRisk = () => {
    if (learningProfile?.risk_level) return learningProfile.risk_level
    const recentScores = performance.slice(0, 5).map(p => p.score || 0)
    if (recentScores.length === 0) return 'low'
    const avg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length
    if (avg < 50) return 'high'
    if (avg < 70) return 'medium'
    return 'low'
  }

  const avgScore = performance.length > 0
    ? Math.round(performance.slice(0, 10).reduce((a, b) => a + (b.score || 0), 0) / Math.min(performance.length, 10))
    : null

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-screen bg-[#F0EDE8]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#0B2341] border-t-[#D4A017] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#0B2341] font-semibold">Loading student profile...</p>
      </div>
    </div>
  )

  if (error || !student) return (
    <div className="p-8">
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center">
        {error || 'Student not found.'}
        <Link href="/dashboard/parent" className="block mt-3 text-sm text-blue-600 hover:underline">← Back to Dashboard</Link>
      </div>
    </div>
  )

  const completedSessions = sessions.filter(s => s.status === 'completed')

  return (
    <div className="min-h-screen bg-[#F0EDE8] p-6 lg:p-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/dashboard/parent" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0B2341] font-medium transition-colors">
          ← Dashboard
        </Link>
        <span className="text-gray-300 mx-2">/</span>
        <span className="text-sm font-semibold text-[#0B2341]">{student.full_name}</span>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
        {/* Navy top bar */}
        <div className="bg-gradient-to-r from-[#0B2341] to-[#1a3a5c] px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-[#D4A017] rounded-2xl flex items-center justify-center font-black text-white text-4xl shadow-lg">
                {student.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">{student.full_name}</h1>
                <p className="text-[#D4A017] font-semibold mt-1">{student.grade} • {student.school_name || 'School not set'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-300 bg-white/10 px-2 py-0.5 rounded-full">{student.curriculum || 'Curriculum not set'}</span>
                  <RiskBadge level={computedRisk()} />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/dashboard/parent/tutors" className="bg-[#D4A017] hover:bg-[#b8860b] text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md">
                🔍 Find Tutors
              </Link>
              <Link href={`/dashboard/parent/student/${studentId}/edit`} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold border border-white/20 transition-all">
                ✏️ Edit
              </Link>
              <button onClick={handleDelete} disabled={deleteLoading} className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-xl text-sm font-bold border border-red-400/30 transition-all disabled:opacity-50">
                {deleteLoading ? '...' : '🗑️ Delete'}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 border-t border-gray-100">
          {[
            { label: 'Age', value: student.age ? `${student.age} years` : '—' },
            { label: 'Total Sessions', value: sessions.length },
            { label: 'Completed', value: completedSessions.length },
            { label: 'Avg Score', value: avgScore !== null ? `${avgScore}%` : '—' },
          ].map(s => (
            <div key={s.label} className="px-6 py-4 text-center">
              <p className="text-xl font-black text-[#0B2341]">{s.value}</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-t border-gray-100 overflow-x-auto px-4">
          <TabButton label="Profile"          icon="👤" active={activeTab === 'profile'}  onClick={() => setActiveTab('profile')}  />
          <TabButton label="Learning Profile" icon="🧠" active={activeTab === 'learning'} onClick={() => setActiveTab('learning')} />
          <TabButton label="Session History"  icon="📅" active={activeTab === 'sessions'} onClick={() => setActiveTab('sessions')} />
          <TabButton label="Progress"         icon="📈" active={activeTab === 'progress'} onClick={() => setActiveTab('progress')} />
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">

        {/* ═══ PROFILE TAB ═══ */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-[#0B2341] text-lg border-b border-gray-50 pb-3">Basic Information</h2>
              {[
                { label: 'Full Name',   value: student.full_name },
                { label: 'Age',         value: student.age ? `${student.age} years old` : 'Not specified' },
                { label: 'Grade',       value: student.grade },
                { label: 'School',      value: student.school_name || 'Not specified' },
                { label: 'Curriculum',  value: student.curriculum || 'Not specified' },
                { label: 'Added On',    value: new Date(student.created_at).toLocaleDateString() },
              ].map(f => (
                <div key={f.label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-400 font-medium">{f.label}</span>
                  <span className="text-sm font-semibold text-[#0B2341]">{f.value}</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-[#0B2341] text-lg border-b border-gray-50 pb-3 mb-5">Learning Goal</h2>
              {student.learning_goal ? (
                <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap bg-[#F0EDE8] p-4 rounded-xl">{student.learning_goal}</p>
              ) : (
                <div className="text-center py-8">
                  <p className="text-4xl mb-3">🎯</p>
                  <p className="text-gray-400 text-sm">No learning goals set yet.</p>
                  <Link href={`/dashboard/parent/student/${studentId}/edit`} className="text-[#D4A017] text-sm font-semibold hover:underline mt-2 inline-block">+ Add a goal</Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ LEARNING PROFILE TAB ═══ */}
        {activeTab === 'learning' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Risk Flag Card */}
            <div className={`rounded-2xl border p-6 shadow-sm ${computedRisk() === 'high' ? 'bg-red-50 border-red-200' : computedRisk() === 'medium' ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">🚩 Risk Assessment</h3>
              <RiskBadge level={computedRisk()} />
              <p className="text-xs text-gray-500 mt-3">
                {computedRisk() === 'high' && 'Student may need immediate intervention. Average score is below 50%.'}
                {computedRisk() === 'medium' && 'Student needs some attention. Consider increasing session frequency.'}
                {computedRisk() === 'low' && 'Student is performing well and on track with their goals.'}
              </p>
            </div>

            {/* Learning Style */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-[#0B2341] mb-4">🧠 Learning Style</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'visual',       emoji: '👁️',  label: 'Visual' },
                  { key: 'auditory',     emoji: '👂',  label: 'Auditory' },
                  { key: 'reading',      emoji: '📖',  label: 'Reading' },
                  { key: 'kinesthetic',  emoji: '🤲',  label: 'Kinesthetic' },
                ].map(s => (
                  <div key={s.key} className={`p-3 rounded-xl border text-center text-xs font-semibold ${learningProfile?.learning_style === s.key ? 'bg-[#0B2341] text-white border-[#0B2341]' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                    <div className="text-2xl mb-1">{s.emoji}</div>
                    {s.label}
                  </div>
                ))}
              </div>
              {!learningProfile && (
                <p className="text-xs text-gray-400 text-center mt-3">Learning profile not set. <Link href={`/dashboard/parent/student/${studentId}/learning-profile`} className="text-[#D4A017] font-semibold hover:underline">Complete it now →</Link></p>
              )}
            </div>

            {/* Subjects */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-[#0B2341] mb-4">📚 Subjects</h3>
              {learningProfile ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-2">Strong Subjects</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(learningProfile.strong_subjects || []).length > 0
                        ? learningProfile.strong_subjects.map((s: string) => <span key={s} className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-lg">{s}</span>)
                        : <span className="text-xs text-gray-400 italic">None specified</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-red-500 font-bold uppercase tracking-wider mb-2">Needs Work</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(learningProfile.weak_subjects || []).length > 0
                        ? learningProfile.weak_subjects.map((s: string) => <span key={s} className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-lg">{s}</span>)
                        : <span className="text-xs text-gray-400 italic">None specified</span>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm">No learning profile yet</p>
                  <Link href={`/dashboard/parent/student/${studentId}/learning-profile`} className="mt-2 inline-block bg-[#0B2341] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#071829] transition-colors">
                    Create Learning Profile
                  </Link>
                </div>
              )}
            </div>

            {/* Goals Progress */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-[#0B2341] text-lg">🎯 Goals Progress</h3>
                <Link href={`/dashboard/parent/student/${studentId}/learning-profile`} className="text-xs text-[#D4A017] font-semibold hover:underline">Edit Goals</Link>
              </div>
              {learningProfile?.goals && learningProfile.goals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {learningProfile.goals.map((goal: string, i: number) => (
                    <ProgressBar
                      key={i}
                      label={goal}
                      value={avgScore !== null ? Math.min(avgScore + (i * 5), 100) : 30}
                      color={i % 3 === 0 ? 'bg-[#D4A017]' : i % 3 === 1 ? 'bg-[#0B2341]' : 'bg-teal-500'}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-4xl mb-3">🎯</p>
                  <p className="text-gray-400 text-sm">No goals set yet.</p>
                  <Link href={`/dashboard/parent/student/${studentId}/learning-profile`} className="text-[#D4A017] text-sm font-semibold hover:underline mt-2 inline-block">+ Add Learning Goals</Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ SESSIONS TAB ═══ */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            {sessions.length > 0 ? sessions.map(session => (
              <div key={session.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#0B2341]/5 rounded-xl flex items-center justify-center text-xl font-bold text-[#0B2341]">
                    {session.subject?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-bold text-[#0B2341]">{session.subject}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(session.date).toLocaleDateString()} at {session.time} • {session.duration_minutes} min</p>
                    {session.session_notes?.length > 0 && (
                      <p className="text-xs text-[#D4A017] font-semibold mt-1">📝 {session.session_notes.length} note(s)</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${
                    session.status === 'completed' ? 'bg-green-100 text-green-700' :
                    session.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                    session.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>{session.status}</span>
                  <span className="text-sm font-bold text-green-600">${session.total_price}</span>
                </div>
              </div>
            )) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                <p className="text-5xl mb-4">📅</p>
                <h3 className="font-bold text-[#0B2341] text-lg mb-2">No sessions yet</h3>
                <p className="text-gray-400 text-sm mb-6">Book a tutoring session to start building a session history.</p>
                <Link href="/dashboard/parent/tutors" className="bg-[#0B2341] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#071829] hover:border-[#D4A017] border-2 border-transparent transition-all inline-block">
                  Find a Tutor
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ═══ PROGRESS TAB ═══ */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            {/* Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Average Score', value: avgScore !== null ? `${avgScore}%` : '—', icon: '📊', color: 'from-[#0B2341] to-[#1a3a5c]' },
                { label: 'Sessions Completed', value: completedSessions.length, icon: '✅', color: 'from-green-600 to-green-500' },
                { label: 'Performance Tests', value: performance.length, icon: '📝', color: 'from-purple-600 to-purple-500' },
              ].map(s => (
                <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white shadow-md`}>
                  <p className="text-white/70 text-xs font-medium mb-1">{s.label}</p>
                  <p className="text-3xl font-black">{s.value}</p>
                  <div className="text-3xl mt-2 opacity-30">{s.icon}</div>
                </div>
              ))}
            </div>

            {/* Performance Records */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50">
                <h3 className="font-bold text-[#0B2341]">📈 Performance Records</h3>
              </div>
              {performance.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {performance.map(p => (
                    <div key={p.id} className="px-6 py-4 flex items-center gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-[#0B2341]">{p.subject}</p>
                        <p className="text-xs text-gray-400">{new Date(p.recorded_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {p.engagement_level && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${p.engagement_level === 'high' ? 'bg-green-100 text-green-700' : p.engagement_level === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            {p.engagement_level} engagement
                          </span>
                        )}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm ${p.score >= 80 ? 'bg-green-100 text-green-700' : p.score >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {p.score}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <p className="text-4xl mb-3">📈</p>
                  <p className="text-gray-400 text-sm">No performance records yet. Tutors can add scores after each session.</p>
                </div>
              )}
            </div>

            {/* Assignments */}
            {assignments.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50">
                  <h3 className="font-bold text-[#0B2341]">📚 Assignments</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {assignments.map(a => (
                    <div key={a.id} className="px-6 py-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-sm text-[#0B2341]">{a.title}</p>
                        <p className="text-xs text-gray-400">Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'No deadline'}</p>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${a.status === 'reviewed' ? 'bg-green-100 text-green-700' : a.status === 'submitted' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

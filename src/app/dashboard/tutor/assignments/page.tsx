'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TutorAssignmentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tutorProfileId, setTutorProfileId] = useState<string | null>(null)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: tp } = await supabase.from('tutor_profiles').select('id').eq('user_id', user.id).single()
      if (!tp) { setLoading(false); return }
      setTutorProfileId(tp.id)

      // Unique students from accepted bookings
      const { data: bookings } = await supabase.from('bookings').select('student_id, students(id, full_name, grade)').eq('tutor_id', tp.id).neq('status', 'cancelled').neq('status', 'rejected')
      const uniqueMap = new Map<string, any>()
      bookings?.forEach(b => { if (b.students) uniqueMap.set(b.student_id, b.students) })
      setStudents(Array.from(uniqueMap.values()))

      const { data: asgns } = await supabase.from('assignments').select('*, students(full_name)').eq('tutor_id', tp.id).order('created_at', { ascending: false })
      setAssignments(asgns || [])
      setLoading(false)
    }
    load()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tutorProfileId || !selectedStudent) return
    setSaving(true)

    const { error } = await supabase.from('assignments').insert({
      tutor_id: tutorProfileId,
      student_id: selectedStudent,
      title,
      description,
      due_date: dueDate || null,
      status: 'pending',
    })

    if (!error) {
      setSuccess(true)
      setTitle(''); setDescription(''); setDueDate(''); setSelectedStudent('')
      setTimeout(() => { setSuccess(false); setShowForm(false) }, 2000)
      // Reload
      const { data } = await supabase.from('assignments').select('*, students(full_name)').eq('tutor_id', tutorProfileId!).order('created_at', { ascending: false })
      setAssignments(data || [])
    }
    setSaving(false)
  }

  const statusConfig: Record<string, { color: string; icon: string }> = {
    pending:   { color: 'bg-amber-100 text-amber-700',  icon: '⏳' },
    submitted: { color: 'bg-blue-100 text-blue-700',    icon: '📤' },
    reviewed:  { color: 'bg-green-100 text-green-700',  icon: '✅' },
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-screen bg-[#F0EDE8]">
      <div className="w-12 h-12 border-4 border-[#0B2341] border-t-[#D4A017] rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F0EDE8] p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0B2341]">Assignments</h1>
          <p className="text-gray-500 mt-1">Assign homework and tasks to your students</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#D4A017] hover:bg-[#b8860b] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
        >
          + New Assignment
        </button>
      </div>

      {/* New Assignment Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 mb-8">
          <h2 className="font-bold text-[#0B2341] text-lg mb-5 flex items-center gap-2">📝 New Assignment</h2>
          {success && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm mb-4 font-semibold border border-green-100">✅ Assignment sent successfully!</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#0B2341] mb-1.5">Student <span className="text-[#D4A017]">*</span></label>
                <select
                  required
                  value={selectedStudent}
                  onChange={e => setSelectedStudent(e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 bg-[#F0EDE8] px-4 py-3 text-sm focus:border-[#D4A017]"
                >
                  <option value="">Choose student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.grade})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0B2341] mb-1.5">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 bg-[#F0EDE8] px-4 py-3 text-sm focus:border-[#D4A017]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#0B2341] mb-1.5">Title <span className="text-[#D4A017]">*</span></label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Complete Chapter 5 exercises"
                className="block w-full rounded-xl border border-gray-200 bg-[#F0EDE8] px-4 py-3 text-sm focus:border-[#D4A017]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#0B2341] mb-1.5">Description / Instructions</label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Detailed instructions for the assignment..."
                className="block w-full rounded-xl border border-gray-200 bg-[#F0EDE8] px-4 py-3 text-sm focus:border-[#D4A017]"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-gray-500 font-semibold text-sm hover:text-gray-700 transition-colors">Cancel</button>
              <button
                type="submit"
                disabled={saving}
                className="bg-[#0B2341] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#071829] border-2 border-transparent hover:border-[#D4A017] transition-all disabled:opacity-60"
              >
                {saving ? 'Sending...' : 'Send Assignment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.length > 0 ? assignments.map(a => {
          const cfg = statusConfig[a.status] || statusConfig.pending
          const isOverdue = a.due_date && new Date(a.due_date) < new Date() && a.status === 'pending'
          return (
            <div key={a.id} className={`bg-white rounded-2xl border shadow-sm p-6 ${isOverdue ? 'border-red-200' : 'border-gray-100'}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${cfg.color}`}>{cfg.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-[#0B2341]">{a.title}</h3>
                      {isOverdue && <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">OVERDUE</span>}
                    </div>
                    <p className="text-xs text-gray-500">Student: <span className="font-semibold text-[#0B2341]">{a.students?.full_name}</span></p>
                    {a.description && <p className="text-sm text-gray-500 mt-2">{a.description}</p>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize ${cfg.color}`}>{a.status}</span>
                  {a.due_date && <p className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>Due: {new Date(a.due_date).toLocaleDateString()}</p>}
                </div>
              </div>
            </div>
          )
        }) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="font-bold text-[#0B2341] text-xl mb-2">No assignments yet</h3>
            <p className="text-gray-400 text-sm mb-6">Create your first assignment for a student</p>
            <button onClick={() => setShowForm(true)} className="bg-[#D4A017] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#b8860b] transition-all">
              + Create Assignment
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

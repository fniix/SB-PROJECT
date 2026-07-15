'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ParentAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [studentFilter, setStudentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: parentProfile } = await supabase.from('parent_profiles').select('id').eq('user_id', user.id).single()
      if (!parentProfile) { setLoading(false); return }

      const { data: studentsData } = await supabase.from('students').select('id, full_name').eq('parent_id', parentProfile.id)
      setStudents(studentsData || [])

      const studentIds = (studentsData || []).map(s => s.id)
      if (studentIds.length > 0) {
        const { data: asgns } = await supabase
          .from('assignments')
          .select('*, students(full_name)')
          .in('student_id', studentIds)
          .order('created_at', { ascending: false })
        setAssignments(asgns || [])
      }
      setLoading(false)
    }
    load()
  }, [router, supabase])

  const filtered = assignments.filter(a => {
    const matchStudent = !studentFilter || a.student_id === studentFilter
    const matchStatus = !statusFilter || a.status === statusFilter
    return matchStudent && matchStatus
  })

  const statusConfig: Record<string, { color: string; icon: string; label: string }> = {
    pending:   { color: 'bg-amber-100 text-amber-700 border-amber-200',  icon: '⏳', label: 'Pending' },
    submitted: { color: 'bg-blue-100 text-blue-700 border-blue-200',    icon: '📤', label: 'Submitted' },
    reviewed:  { color: 'bg-green-100 text-green-700 border-green-200', icon: '✅', label: 'Reviewed' },
  }

  const pending   = assignments.filter(a => a.status === 'pending').length
  const submitted = assignments.filter(a => a.status === 'submitted').length
  const reviewed  = assignments.filter(a => a.status === 'reviewed').length

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-screen bg-[#F0EDE8]">
      <div className="w-12 h-12 border-4 border-[#0B2341] border-t-[#D4A017] rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F0EDE8] p-6 lg:p-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0B2341] via-blue-900 to-blue-800 rounded-2xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="absolute right-0 -top-10 text-[10rem] opacity-20 leading-none select-none drop-shadow-lg">📚</div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black !text-white mb-2">Homework & Assignments</h1>
          <p className="!text-blue-200 text-lg">Track all assignments assigned by tutors</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Pending',   value: pending,   icon: '⏳', colorClass: 'text-amber-600 bg-amber-50 border-amber-100' },
          { label: 'Submitted', value: submitted, icon: '📤', colorClass: 'text-blue-600 bg-blue-50 border-blue-100' },
          { label: 'Reviewed',  value: reviewed,  icon: '✅', colorClass: 'text-green-600 bg-green-50 border-green-100' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{s.label}</p>
              <p className="text-3xl font-black text-[#0B2341]">{s.value}</p>
            </div>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border ${s.colorClass}`}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          value={studentFilter}
          onChange={e => setStudentFilter(e.target.value)}
          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-[#D4A017]"
        >
          <option value="">All Children</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-[#D4A017] min-w-40"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="submitted">Submitted</option>
          <option value="reviewed">Reviewed</option>
        </select>
      </div>

      {/* Assignments List */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map(a => {
            const cfg = statusConfig[a.status] || statusConfig.pending
            const isOverdue = a.due_date && new Date(a.due_date) < new Date() && a.status === 'pending'
            return (
              <div key={a.id} className={`bg-white rounded-2xl border shadow-sm p-6 ${isOverdue ? 'border-red-200' : 'border-gray-100'}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${cfg.color} border shrink-0`}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-[#0B2341]">{a.title}</h3>
                        {isOverdue && <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">OVERDUE</span>}
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        For: <span className="font-semibold text-[#0B2341]">{a.students?.full_name}</span>
                      </p>
                      {a.description && <p className="text-sm text-gray-600 leading-relaxed mb-3">{a.description}</p>}
                      {a.tutor_feedback && (
                        <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                          <p className="text-xs font-bold text-green-700 mb-1">📝 Tutor Feedback:</p>
                          <p className="text-sm text-green-800">{a.tutor_feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${cfg.color}`}>{cfg.label}</span>
                    {a.due_date && (
                      <p className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                        Due: {new Date(a.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="font-bold text-[#0B2341] text-xl mb-2">No assignments yet</h3>
          <p className="text-gray-400 text-sm">Assignments assigned by tutors after sessions will appear here.</p>
          <Link href="/dashboard/parent/tutors" className="mt-6 inline-block bg-[#0B2341] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#071829] border-2 border-transparent hover:border-[#D4A017] transition-all">
            Find a Tutor
          </Link>
        </div>
      )}
    </div>
  )
}

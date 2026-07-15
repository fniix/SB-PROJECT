'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function TutorStudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Progress Report State
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null)
  const [reportContent, setReportContent] = useState('')
  const [performanceTrend, setPerformanceTrend] = useState('Improving')
  const [submitting, setSubmitting] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchStudents() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // 1. Get Tutor Profile
      const { data: tpData, error: tpError } = await supabase
        .from('tutor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (tpError || !tpData) {
        setError('Could not load tutor profile.')
        setLoading(false)
        return
      }

      // 2. Fetch all completed/accepted bookings to get unique students
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          student_id,
          parent_id,
          students ( id, full_name, grade, school_name, curriculum )
        `)
        .eq('tutor_id', tpData.id)
        .in('status', ['accepted', 'completed'])

      if (bookingsError) {
        setError('Could not load students.')
      } else if (bookingsData) {
        // Deduplicate students
        const uniqueStudents = new Map()
        bookingsData.forEach(b => {
          if (b.students && !uniqueStudents.has(b.student_id)) {
            uniqueStudents.set(b.student_id, {
              ...b.students,
              parent_id: b.parent_id,
              tutor_id: tpData.id // save tutor_id for report submission
            })
          }
        })
        setStudents(Array.from(uniqueStudents.values()))
      }
      
      setLoading(false)
    }

    fetchStudents()
  }, [router, supabase])

  const handleSubmitReport = async (student: any) => {
    if (!reportContent) {
      alert('Please enter report content.')
      return
    }
    
    setSubmitting(true)
    const { error } = await supabase
      .from('progress_reports')
      .insert({
        tutor_id: student.tutor_id,
        student_id: student.id,
        parent_id: student.parent_id,
        content: reportContent,
        performance_trend: performanceTrend
      })

    if (error) {
      alert('Error saving report: ' + error.message)
    } else {
      alert('Progress report sent to parent successfully!')
      setActiveStudentId(null)
      setReportContent('')
    }
    setSubmitting(false)
  }

  if (loading) return <div className="min-h-screen bg-[#FDFBF7] p-12 flex justify-center text-[#0B2341] font-bold text-xl">Loading students...</div>

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 flex items-center gap-6">
          <Link href="/dashboard/tutor" className="text-[#0B2341] hover:text-[#D4A017] transition-colors flex items-center gap-2 font-bold bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 hover:shadow-md">
            &larr; Back to Dashboard
          </Link>
        </div>

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#0B2341]">My Students</h1>
          <p className="text-gray-600 mt-2 text-lg">Manage your students and submit progress reports.</p>
        </div>

        {error && <div className="text-red-600 text-sm mb-8 bg-red-50 p-4 rounded-lg border border-red-100 font-medium">{error}</div>}

        {students.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {students.map((student) => (
              <div key={student.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col relative overflow-hidden transition-shadow hover:shadow-md">
                <div className="absolute left-0 top-0 w-2 h-full bg-[#0B2341]"></div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pl-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#0B2341] text-[#D4A017] rounded-full flex items-center justify-center font-bold text-2xl shadow-inner">
                      {student.full_name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#0B2341]">{student.full_name}</h3>
                      <div className="text-sm text-gray-600 font-medium">Grade: {student.grade} • {student.curriculum || 'No curriculum specified'}</div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveStudentId(activeStudentId === student.id ? null : student.id)}
                    className="bg-[#D4A017] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#b8860b] transition-all shadow-sm"
                  >
                    {activeStudentId === student.id ? 'Cancel Report' : 'Add Progress Report'}
                  </button>
                </div>

                {/* Progress Report Form (Inline) */}
                {activeStudentId === student.id && (
                  <div className="mt-6 pt-6 border-t border-gray-100 pl-4 animate-in fade-in slide-in-from-top-4">
                    <h4 className="font-bold text-[#0B2341] mb-4">New Progress Report</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Performance Trend</label>
                        <select 
                          className="block w-full md:w-64 rounded-lg border border-gray-200 px-4 py-2 text-gray-900 focus:border-[#D4A017] focus:ring-[#D4A017] bg-[#FDFBF7]"
                          value={performanceTrend}
                          onChange={(e) => setPerformanceTrend(e.target.value)}
                        >
                          <option value="Excellent">Excellent</option>
                          <option value="Improving">Improving</option>
                          <option value="Steady">Steady</option>
                          <option value="Needs Work">Needs Work</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Report Content</label>
                        <textarea 
                          rows={4}
                          className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 focus:border-[#D4A017] focus:ring-[#D4A017] bg-[#FDFBF7]"
                          placeholder="Describe the student's progress, achievements, and areas of focus..."
                          value={reportContent}
                          onChange={(e) => setReportContent(e.target.value)}
                        />
                      </div>
                      <button 
                        onClick={() => handleSubmitReport(student)}
                        disabled={submitting}
                        className="bg-[#0B2341] text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-900 disabled:opacity-50 transition-all shadow-sm"
                      >
                        {submitting ? 'Submitting...' : 'Submit to Parent'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white border border-gray-100 rounded-2xl p-16 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-[#D4A017]"></div>
            <div className="w-20 h-20 bg-[#0B2341] text-[#D4A017] rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner">
              🎓
            </div>
            <h3 className="text-2xl font-bold text-[#0B2341] mb-3">No students yet</h3>
            <p className="text-gray-600 max-w-md mx-auto text-lg mb-8">Once you accept bookings and complete sessions, your students will appear here.</p>
          </div>
        )}
      </div>
    </div>
  )
}

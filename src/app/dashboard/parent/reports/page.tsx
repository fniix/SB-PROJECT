'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ParentReportsPage() {
  const [progressReports, setProgressReports] = useState<any[]>([])
  const [sessionNotes, setSessionNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'reports' | 'notes'>('reports')
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchReports() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // 1. Get Parent Profile
      const { data: ppData, error: ppError } = await supabase
        .from('parent_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (ppError || !ppData) {
        setError('Could not load parent profile.')
        setLoading(false)
        return
      }

      // 2. Fetch Progress Reports
      const { data: reportsData } = await supabase
        .from('progress_reports')
        .select(`
          *,
          students ( full_name )
        `)
        .eq('parent_id', ppData.id)
        .order('created_at', { ascending: false })

      if (reportsData) setProgressReports(reportsData)

      // 3. Get Student IDs for Session Notes
      const { data: studentsData } = await supabase
        .from('students')
        .select('id')
        .eq('parent_id', ppData.id)

      if (studentsData && studentsData.length > 0) {
        const studentIds = studentsData.map(s => s.id)
        const { data: notesData } = await supabase
          .from('session_notes')
          .select(`
            *,
            students ( full_name ),
            bookings ( subject, date )
          `)
          .in('student_id', studentIds)
          .order('created_at', { ascending: false })

        if (notesData) setSessionNotes(notesData)
      }
      
      setLoading(false)
    }

    fetchReports()
  }, [router, supabase])

  if (loading) return (
    <div className="min-h-screen bg-[#FDFBF7] p-12 flex flex-col items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#D4A017] border-t-transparent rounded-full animate-spin mb-4"></div>
      <div className="text-[#0B2341] font-bold">Loading records...</div>
    </div>
  )

  const getTrendBadge = (trend: string) => {
    let style = 'bg-gray-50 text-gray-700 border-gray-200'
    let icon = '•'
    
    if (trend === 'Excellent') { style = 'bg-green-50 text-green-700 border-green-200'; icon = '↑' }
    else if (trend === 'Improving') { style = 'bg-blue-50 text-blue-700 border-blue-200'; icon = '↗' }
    else if (trend === 'Steady') { style = 'bg-yellow-50 text-yellow-700 border-yellow-200'; icon = '→' }
    else if (trend === 'Needs Work') { style = 'bg-red-50 text-red-700 border-red-200'; icon = '↓' }
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${style}`}>
        <span>{icon}</span> {trend}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/dashboard/parent" className="text-gray-400 hover:text-[#D4A017] transition-colors text-sm font-bold flex items-center gap-1">
                &larr; Dashboard
              </Link>
            </div>
            <h1 className="text-3xl font-black text-[#0B2341] tracking-tight">Academic Progress</h1>
            <p className="text-gray-500 mt-1">Review session notes and progress reports from your child's tutors.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white px-5 py-3 rounded-xl border border-gray-100 shadow-sm text-center">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Reports</p>
              <p className="text-xl font-black text-[#D4A017]">{progressReports.length}</p>
            </div>
            <div className="bg-white px-5 py-3 rounded-xl border border-gray-100 shadow-sm text-center">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Notes</p>
              <p className="text-xl font-black text-[#0B2341]">{sessionNotes.length}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 font-medium mb-8 flex items-center gap-3">
            <span className="text-xl">⚠️</span> {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-200 mb-8 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-4 text-sm font-bold capitalize transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'reports' 
                ? 'border-[#D4A017] text-[#0B2341]' 
                : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300'
            }`}
          >
            General Progress Reports
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-4 text-sm font-bold capitalize transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'notes' 
                ? 'border-[#D4A017] text-[#0B2341]' 
                : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300'
            }`}
          >
            Daily Session Notes
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {/* ─── REPORTS TAB ─── */}
          {activeTab === 'reports' && (
            <div>
              {progressReports.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {progressReports.map((report) => (
                    <div key={report.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 relative overflow-hidden transition-all hover:shadow-md">
                      <div className="absolute left-0 top-0 w-1.5 h-full bg-[#0B2341]"></div>
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-[#0B2341]">{report.students?.full_name}</h3>
                          </div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Submitted on {new Date(report.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          {getTrendBadge(report.performance_trend)}
                        </div>
                      </div>
                      
                      <div className="bg-[#FDFBF7] p-6 rounded-xl border border-gray-100 text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                        {report.content}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  title="No progress reports" 
                  desc="Tutors haven't submitted any general progress reports for your children yet." 
                  icon="📊" 
                />
              )}
            </div>
          )}

          {/* ─── NOTES TAB ─── */}
          {activeTab === 'notes' && (
            <div>
              {sessionNotes.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {sessionNotes.map((note) => (
                    <div key={note.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 transition-all hover:shadow-md">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-100 gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-[#0B2341] flex items-center justify-center text-white font-bold shrink-0">
                            {note.students?.full_name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-[#0B2341]">{note.bookings?.subject}</h3>
                            <p className="text-sm font-semibold text-[#D4A017]">{note.students?.full_name}</p>
                          </div>
                        </div>
                        <div className="text-left md:text-right">
                          <span className="bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            {new Date(note.bookings?.date || note.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-bold text-[#0B2341] mb-2 uppercase text-xs tracking-wider flex items-center gap-2">
                            <span>📝</span> Session Summary
                          </h4>
                          <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl leading-relaxed">{note.summary}</p>
                        </div>
                        
                        {(note.strengths || note.weaknesses) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {note.strengths && (
                              <div>
                                <h4 className="font-bold text-green-700 mb-2 uppercase text-xs tracking-wider flex items-center gap-2">
                                  <span>🌟</span> Strengths
                                </h4>
                                <p className="text-sm text-green-900 bg-green-50/50 p-4 rounded-xl border border-green-100 leading-relaxed">{note.strengths}</p>
                              </div>
                            )}
                            {note.weaknesses && (
                              <div>
                                <h4 className="font-bold text-red-700 mb-2 uppercase text-xs tracking-wider flex items-center gap-2">
                                  <span>🎯</span> Areas to Focus
                                </h4>
                                <p className="text-sm text-red-900 bg-red-50/50 p-4 rounded-xl border border-red-100 leading-relaxed">{note.weaknesses}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {note.homework && (
                          <div>
                            <h4 className="font-bold text-[#D4A017] mb-2 uppercase text-xs tracking-wider flex items-center gap-2">
                              <span>📚</span> Homework / Next Steps
                            </h4>
                            <p className="text-sm text-gray-700 bg-[#D4A017]/5 p-4 rounded-xl border border-[#D4A017]/20 leading-relaxed">{note.homework}</p>
                          </div>
                        )}

                        {note.recommendations && (
                          <div>
                            <h4 className="font-bold text-blue-700 mb-2 uppercase text-xs tracking-wider flex items-center gap-2">
                              <span>💡</span> Tutor Recommendations
                            </h4>
                            <p className="text-sm text-gray-700 bg-blue-50/50 p-4 rounded-xl border border-blue-100 leading-relaxed">{note.recommendations}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  title="No session notes" 
                  desc="There are no daily session notes recorded for your children yet." 
                  icon="📝" 
                />
              )}
            </div>
          )}
        </div>

      </div>
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

function EmptyState({ title, desc, icon }: { title: string, desc: string, icon: string }) {
  return (
    <div className="bg-white border border-gray-100 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-2xl mb-4 border border-gray-100 shadow-sm">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-[#0B2341] mb-1">{title}</h3>
      <p className="text-gray-500 text-sm max-w-sm">{desc}</p>
    </div>
  )
}

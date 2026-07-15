'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface TutorProfile {
  id: string
  full_name: string
  avatar_url: string | null
  bio: string
  subjects: string[]
  levels: string[]
  price_per_hour: number
  rating_average: number
  total_sessions: number
  verification_status: string
}

export default function TutorsDiscoveryPage() {
  const [tutors, setTutors] = useState<TutorProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [sortBy, setSortBy] = useState('rating-desc')
  const supabase = createClient()

  useEffect(() => {
    async function fetchTutors() {
      // Fetch from tutor_profiles where public and approved/probation
      const { data, error } = await supabase
        .from('tutor_profiles')
        .select('*')
        .eq('is_public', true)
        .in('verification_status', ['verified', 'probation'])

      if (data) setTutors(data)
      setLoading(false)
    }
    fetchTutors()
  }, [supabase])

  const filteredTutors = tutors.filter(tutor => {
    const term = searchTerm.toLowerCase()
    const searchMatch = term === '' || 
      tutor.full_name?.toLowerCase().includes(term) || 
      (tutor.subjects || []).some(s => s.toLowerCase().includes(term))
    
    const subjectMatch = subjectFilter === '' || (tutor.subjects || []).includes(subjectFilter)
    
    return searchMatch && subjectMatch
  }).sort((a, b) => {
    if (sortBy === 'rating-desc') return (b.rating_average || 0) - (a.rating_average || 0)
    if (sortBy === 'price-asc') return (a.price_per_hour || 0) - (b.price_per_hour || 0)
    if (sortBy === 'price-desc') return (b.price_per_hour || 0) - (a.price_per_hour || 0)
    return 0
  })

  // Get unique subjects for the filter dropdown
  const allSubjects = Array.from(new Set(tutors.flatMap(t => t.subjects || []))).filter(Boolean).sort()

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* ── Header & Search ── */}
        <div className="mb-10 space-y-6">
          <Link href="/dashboard/parent" className="text-[#0B2341] hover:text-[#D4A017] transition-colors flex items-center gap-2 font-bold inline-flex bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-sm">
            &larr; Back to Dashboard
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-4xl font-bold text-[#0B2341] mb-2">Find a Tutor</h1>
              <p className="text-gray-500">Discover expert tutors to help your child excel.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Search by name or subject..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/10 w-full sm:w-64 text-sm transition-all outline-none"
                />
              </div>
              
              <select 
                value={subjectFilter}
                onChange={e => setSubjectFilter(e.target.value)}
                className="px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/10 bg-white text-sm transition-all outline-none"
              >
                <option value="">All Subjects</option>
                {allSubjects.map((s) => (
                  <option key={s as string} value={s as string}>{s as string}</option>
                ))}
              </select>
              
              <select 
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/10 bg-white text-sm transition-all outline-none"
              >
                <option value="rating-desc">Highest Rated</option>
                <option value="price-asc">Lowest Price</option>
                <option value="price-desc">Highest Price</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Tutor Grid ── */}
        {loading ? (
          <div className="text-center py-20">
             <div className="animate-spin w-8 h-8 border-4 border-[#0B2341] border-t-transparent rounded-full mx-auto mb-4"></div>
             <p className="text-[#0B2341] font-bold">Loading tutors...</p>
          </div>
        ) : filteredTutors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutors.map((tutor) => (
              <Link href={`/dashboard/parent/tutors/${tutor.id}`} key={tutor.id} className="block group">
                <div className="bg-white border border-gray-100 rounded-3xl p-6 h-full flex flex-col relative overflow-hidden hover:shadow-xl transition-all duration-300">
                  
                  {/* Premium top border hover effect */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4A017] to-[#f0c040] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                  
                  {/* Header */}
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-4">
                      {tutor.avatar_url ? (
                        <img src={tutor.avatar_url} alt={tutor.full_name} className="w-14 h-14 rounded-2xl object-cover border-2 border-gray-100" />
                      ) : (
                        <div className="w-14 h-14 bg-[#0B2341] text-[#D4A017] rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner">
                          {tutor.full_name?.charAt(0).toUpperCase() || 'T'}
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-[#0B2341] group-hover:text-[#D4A017] transition-colors">{tutor.full_name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5 text-sm">
                          <span className="text-[#D4A017]">★</span> 
                          <span className="font-bold text-[#0B2341]">{tutor.rating_average > 0 ? tutor.rating_average.toFixed(1) : 'New'}</span>
                          {tutor.total_sessions > 0 && <span className="text-gray-400 text-xs">({tutor.total_sessions} sessions)</span>}
                        </div>
                      </div>
                    </div>
                    {tutor.verification_status === 'verified' && (
                      <div className="bg-blue-50 text-blue-600 p-1.5 rounded-xl border border-blue-100" title="Verified Tutor">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Bio */}
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-5 flex-grow">
                    {tutor.bio || 'Professional tutor ready to help your child achieve their academic goals.'}
                  </p>

                  {/* Subjects Tags */}
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-1.5">
                      {tutor.subjects && tutor.subjects.length > 0 ? (
                        tutor.subjects.slice(0, 3).map((sub: string) => (
                          <span key={sub} className="bg-gray-50 text-gray-600 border border-gray-200 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg">
                            {sub}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">Subjects not listed</span>
                      )}
                      {tutor.subjects?.length > 3 && (
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-lg">+{tutor.subjects.length - 3}</span>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div>
                      <span className="text-xl font-black text-[#0B2341]">{tutor.price_per_hour}</span>
                      <span className="text-gray-400 text-xs font-semibold ml-1">BHD / hr</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#D4A017] group-hover:bg-[#0B2341] group-hover:text-white transition-all">
                      <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </div>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white border border-gray-100 rounded-3xl p-16 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              🔍
            </div>
            <h3 className="text-2xl font-bold text-[#0B2341] mb-2">No tutors found</h3>
            <p className="text-gray-500 max-w-md mx-auto text-sm">Try adjusting your search or filters to find the perfect match.</p>
          </div>
        )}
      </div>
    </div>
  )
}

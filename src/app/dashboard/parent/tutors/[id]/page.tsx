'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface TutorProfile {
  id: string
  full_name: string
  avatar_url: string | null
  bio: string
  subjects: string[]
  levels: string[]
  curriculum: string[]
  languages: string[]
  session_types: string[]
  price_per_hour: number
  special_needs_trained: boolean
  demo_video_url: string | null
  rating_average: number
  total_sessions: number
  total_reviews: number
  verification_status: string
}

export default function TutorProfilePage() {
  const params = useParams()
  const tutorId = params.id as string
  
  const [tutor, setTutor] = useState<TutorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchTutor() {
      if (!tutorId) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('tutor_profiles')
        .select('*')
        .eq('id', tutorId)
        .single()

      if (error || !data) {
        setError('Could not load tutor profile or it does not exist.')
      } else {
        setTutor(data as TutorProfile)
      }
      setLoading(false)
    }

    fetchTutor()
  }, [tutorId, router, supabase])

  if (loading) return (
    <div className="min-h-screen bg-[#FDFBF7] p-12 flex flex-col items-center justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-[#0B2341] border-t-transparent rounded-full mb-4"></div>
      <p className="text-[#0B2341] font-bold text-lg">Loading profile...</p>
    </div>
  )
  
  if (error || !tutor) return (
    <div className="min-h-screen bg-[#FDFBF7] p-12 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-gray-100 text-center shadow-lg">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-[#0B2341] mb-2">Profile Not Found</h3>
        <p className="text-gray-500 mb-6">{error || 'This tutor profile could not be loaded.'}</p>
        <Link href="/dashboard/parent/tutors" className="bg-[#0B2341] text-white px-6 py-3 rounded-xl font-bold transition-all hover:bg-[#071829] shadow-md inline-block">
          &larr; Return to Directory
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation */}
        <div className="mb-8 flex items-center gap-6">
          <Link href="/dashboard/parent/tutors" className="text-[#0B2341] hover:text-[#D4A017] transition-colors flex items-center gap-2 font-bold bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-sm">
            &larr; Back to Directory
          </Link>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 sm:p-12 relative overflow-hidden mb-8">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#0B2341] to-[#1a3a5c]"></div>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 w-full lg:w-auto">
              
              {/* Avatar */}
              <div className="relative shrink-0">
                {tutor.avatar_url ? (
                  <img src={tutor.avatar_url} alt={tutor.full_name} className="w-32 h-32 rounded-3xl object-cover shadow-md border-2 border-gray-100" />
                ) : (
                  <div className="w-32 h-32 bg-[#0B2341] text-[#D4A017] rounded-3xl flex items-center justify-center font-bold text-5xl shadow-inner border-2 border-[#D4A017]/20">
                    {tutor.full_name?.charAt(0).toUpperCase() || 'T'}
                  </div>
                )}
                {tutor.verification_status === 'verified' && (
                  <div className="absolute -bottom-3 -right-3 bg-blue-50 text-blue-600 p-2 rounded-xl border border-blue-100 shadow-sm" title="Verified Tutor">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  </div>
                )}
              </div>

              {/* Title & Stats */}
              <div className="text-center sm:text-left pt-2">
                <h1 className="text-3xl font-bold text-[#0B2341] mb-3">{tutor.full_name}</h1>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-[#D4A017] text-lg">★</span>
                    <span className="font-bold text-[#0B2341]">{tutor.rating_average > 0 ? tutor.rating_average.toFixed(1) : 'New'}</span>
                    <span className="text-gray-400">({tutor.total_reviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 font-medium">
                    <span className="text-lg">📚</span>
                    <span>{tutor.total_sessions} Sessions Delivered</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* CTA Box */}
            <div className="bg-[#0B2341]/5 rounded-3xl p-6 border border-[#0B2341]/10 flex flex-col items-center sm:items-end w-full lg:w-auto shrink-0">
              <div className="text-center sm:text-right mb-4">
                <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Hourly Rate</div>
                <div className="text-4xl font-black text-[#0B2341]">
                  {tutor.price_per_hour} <span className="text-base text-gray-500 font-bold">BHD</span>
                </div>
              </div>
              <Link 
                href={`/dashboard/parent/book/${tutor.id}`}
                className="w-full bg-[#0B2341] hover:bg-[#071829] text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-md hover:shadow-lg border-2 border-transparent hover:border-[#D4A017] text-center"
              >
                Book Session →
              </Link>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* About */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-[#0B2341] mb-4 flex items-center gap-2">
                <span>👋</span> About {tutor.full_name.split(' ')[0]}
              </h3>
              <div className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm bg-gray-50 p-5 rounded-2xl border border-gray-100">
                {tutor.bio || 'This tutor hasn\'t added a biography yet, but they are ready to help your child succeed!'}
              </div>
            </div>

            {/* Teaching Profile */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-[#0B2341] mb-6 flex items-center gap-2">
                <span>🎯</span> Teaching Profile
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Subjects</h4>
                  <div className="flex flex-wrap gap-2">
                    {tutor.subjects?.length ? tutor.subjects.map((sub: string) => (
                      <span key={sub} className="bg-blue-50 text-blue-700 font-bold px-3 py-1.5 rounded-xl text-sm">{sub}</span>
                    )) : <span className="text-gray-400 text-sm">Not specified</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Grade Levels</h4>
                    <div className="flex flex-wrap gap-2">
                      {tutor.levels?.length ? tutor.levels.map((lvl: string) => (
                        <span key={lvl} className="bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold">{lvl}</span>
                      )) : <span className="text-gray-400 text-sm">Not specified</span>}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Curriculum Focus</h4>
                    <div className="flex flex-wrap gap-2">
                      {tutor.curriculum?.length ? tutor.curriculum.map((curr: string) => (
                        <span key={curr} className="bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold">{curr}</span>
                      )) : <span className="text-gray-400 text-sm">Not specified</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Demo Video (If any) */}
            {tutor.demo_video_url && (
              <div className="bg-[#0B2341] rounded-3xl p-8 border border-[#0B2341] shadow-md text-white">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-[#D4A017]">🎥</span> Introduction Video
                </h3>
                <div className="aspect-video bg-black/50 rounded-2xl flex items-center justify-center border border-white/10 overflow-hidden">
                  {/* Using a regular link for safety, could be iframe if URL is known standard (e.g. YouTube) */}
                  <a href={tutor.demo_video_url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group">
                    <div className="w-16 h-16 bg-[#D4A017] rounded-full flex items-center justify-center text-white pl-1 shadow-lg group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                    <span className="mt-4 font-semibold text-sm">Watch Demo Video on External Source</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Facts */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">Logistics</h3>
              
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="text-lg mt-0.5">🌐</div>
                  <div>
                    <p className="font-bold text-[#0B2341]">Languages</p>
                    <p className="text-gray-500">{tutor.languages?.join(', ') || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="text-lg mt-0.5">💻</div>
                  <div>
                    <p className="font-bold text-[#0B2341]">Session Types</p>
                    <p className="text-gray-500 capitalize">{tutor.session_types?.join(', ') || 'Online & In-person'}</p>
                  </div>
                </div>

                {tutor.special_needs_trained && (
                  <div className="flex items-start gap-3 bg-blue-50 p-3 rounded-xl border border-blue-100 mt-2">
                    <div className="text-lg mt-0.5 text-blue-600">💙</div>
                    <div>
                      <p className="font-bold text-blue-900">Special Needs Trained</p>
                      <p className="text-blue-700 text-xs mt-0.5 leading-relaxed">This tutor has experience and training with special educational needs.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Satisfaction Guarantee */}
            <div className="bg-gradient-to-b from-gray-50 to-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl mx-auto shadow-sm border border-gray-100 mb-3">🛡️</div>
              <h3 className="font-bold text-[#0B2341] mb-2 text-sm">SB Project Guarantee</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                If you're not satisfied with the first session, we'll match you with a different tutor at no extra cost.
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}

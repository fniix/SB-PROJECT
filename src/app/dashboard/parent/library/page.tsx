'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function VideoLibraryPage() {
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('learning_videos').select('*').order('created_at', { ascending: false })
      setVideos(data || [])
      setLoading(false)
    }
    load()
  }, [router, supabase])

  const subjects = Array.from(new Set(videos.map(v => v.subject))).filter(Boolean)

  const filtered = videos.filter(v => {
    const matchSearch = !searchTerm || v.title.toLowerCase().includes(searchTerm.toLowerCase()) || v.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchSubject = !subjectFilter || v.subject === subjectFilter
    return matchSearch && matchSubject
  })

  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    return match ? match[1] : null
  }

  const getThumbnail = (url: string) => {
    const id = getYouTubeId(url)
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null
  }

  const subjectColors: Record<string, string> = {
    'Mathematics':    'bg-blue-100 text-blue-700',
    'English':        'bg-green-100 text-green-700',
    'Science':        'bg-teal-100 text-teal-700',
    'History':        'bg-orange-100 text-orange-700',
    'Physics':        'bg-purple-100 text-purple-700',
    'Chemistry':      'bg-pink-100 text-pink-700',
    'Biology':        'bg-emerald-100 text-emerald-700',
  }

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
        <div className="absolute right-0 -top-10 text-[10rem] opacity-20 leading-none select-none drop-shadow-lg">▶️</div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black !text-white mb-2">Video Library</h1>
          <p className="!text-blue-200 text-lg">Curated educational videos aligned to your child's curriculum</p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left: Video List */}
        <div className="flex-1">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-[#D4A017]"
            />
            <select
              value={subjectFilter}
              onChange={e => setSubjectFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-[#D4A017] min-w-40"
            >
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Video Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map(video => {
                const thumb = getThumbnail(video.youtube_url)
                const isSelected = selected?.id === video.id
                return (
                  <button
                    key={video.id}
                    onClick={() => setSelected(video)}
                    className={`text-left bg-white rounded-2xl border-2 shadow-sm hover:shadow-lg transition-all overflow-hidden group ${isSelected ? 'border-[#D4A017]' : 'border-gray-100 hover:border-[#D4A017]/30'}`}
                  >
                    {/* Thumbnail */}
                    <div className="relative h-40 bg-gray-100 overflow-hidden">
                      {thumb ? (
                        <img src={thumb} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#0B2341] to-blue-800 flex items-center justify-center text-5xl">▶️</div>
                      )}
                      {/* Play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center text-2xl shadow-lg">▶️</div>
                      </div>
                      {/* Duration badge */}
                      {video.duration_mins > 0 && (
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-0.5 rounded">
                          {video.duration_mins} min
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-[#0B2341] text-sm leading-tight">{video.title}</h3>
                      </div>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{video.description}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${subjectColors[video.subject] || 'bg-gray-100 text-gray-600'}`}>{video.subject}</span>
                        {video.grade_levels?.slice(0, 2).map((g: string) => (
                          <span key={g} className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{g}</span>
                        ))}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
              <div className="text-6xl mb-4">📹</div>
              <h3 className="font-bold text-[#0B2341] text-xl mb-2">No videos found</h3>
              <p className="text-gray-400 text-sm">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>

        {/* Right: Video Player */}
        {selected && (
          <div className="xl:w-96 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-8">
              {/* Player */}
              <div className="aspect-video bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(selected.youtube_url)}?autoplay=1`}
                  title={selected.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-[#0B2341] text-base mb-2">{selected.title}</h3>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">{selected.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${subjectColors[selected.subject] || 'bg-gray-100 text-gray-600'}`}>{selected.subject}</span>
                  <a
                    href={selected.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-red-500 font-bold hover:underline flex items-center gap-1"
                  >
                    Open on YouTube →
                  </a>
                </div>
              </div>
              <div className="px-5 pb-5">
                <button onClick={() => setSelected(null)} className="w-full text-center text-xs text-gray-400 hover:text-gray-600 font-medium">✕ Close player</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EducationalGamesPage() {
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [diffFilter, setDiffFilter] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('educational_games').select('*').order('created_at', { ascending: false })
      setGames(data || [])
      setLoading(false)
    }
    load()
  }, [router, supabase])

  const subjects = Array.from(new Set(games.map(g => g.subject))).filter(Boolean)

  const filtered = games.filter(g => {
    const matchSearch = !searchTerm || g.title.toLowerCase().includes(searchTerm.toLowerCase()) || g.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchSubject = !subjectFilter || g.subject === subjectFilter
    const matchDiff = !diffFilter || g.difficulty === diffFilter
    return matchSearch && matchSubject && matchDiff
  })

  const diffColor = (d: string) => {
    if (d === 'easy') return 'bg-green-100 text-green-700'
    if (d === 'hard') return 'bg-red-100 text-red-700'
    return 'bg-amber-100 text-amber-700'
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
        <div className="absolute right-0 -top-10 text-[10rem] opacity-20 leading-none select-none drop-shadow-lg">🎮</div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black !text-white mb-2">Educational Games</h1>
          <p className="!text-blue-200 text-lg">Fun, curriculum-aligned learning games for your child</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="text"
          placeholder="Search games..."
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
        <select
          value={diffFilter}
          onChange={e => setDiffFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-[#D4A017] min-w-36"
        >
          <option value="">All Levels</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Games', value: games.length, icon: '🎮' },
          { label: 'Subjects Covered', value: subjects.length, icon: '📚' },
          { label: 'Free to Play', value: games.length, icon: '🆓' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
            <div className="text-3xl mb-2">{s.icon}</div>
            <p className="text-2xl font-black text-[#0B2341]">{s.value}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Games Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(game => (
            <div key={game.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden group flex flex-col">
              {/* Emoji Banner */}
              <div className="bg-gradient-to-br from-[#0B2341] to-blue-800 h-28 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform duration-300">
                {game.thumbnail_emoji || '🎮'}
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-[#0B2341] text-base leading-tight flex-1">{game.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 capitalize shrink-0 ${diffColor(game.difficulty)}`}>{game.difficulty}</span>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed mb-4 flex-1">{game.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{game.subject}</span>
                  </div>
                  {game.grade_levels?.length > 0 && (
                    <p className="text-[10px] text-gray-400">Grades: {game.grade_levels.slice(0, 3).join(', ')}{game.grade_levels.length > 3 ? '...' : ''}</p>
                  )}
                </div>

                <a
                  href={game.game_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#0B2341] hover:bg-[#071829] text-white py-2.5 rounded-xl text-sm font-bold text-center transition-all hover:border-[#D4A017] border-2 border-transparent"
                >
                  🚀 Play Now
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="font-bold text-[#0B2341] text-xl mb-2">No games found</h3>
          <p className="text-gray-400 text-sm">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  )
}

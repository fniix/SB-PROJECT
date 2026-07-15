import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// ─── Reward System Logic ────────────────────────────────────────────────────

type Badge = { id: string; emoji: string; name: string; desc: string; earned: boolean; color: string }

function computeBadges(sessionsCount: number, hasProfile: boolean): Badge[] {
  return [
    {
      id: 'first_session',
      emoji: '🚀',
      name: 'First Session',
      desc: 'Completed your very first tutoring session',
      earned: sessionsCount >= 1,
      color: 'from-blue-500 to-blue-400',
    },
    {
      id: 'three_sessions',
      emoji: '🔥',
      name: 'On Fire',
      desc: 'Completed 3 tutoring sessions',
      earned: sessionsCount >= 3,
      color: 'from-orange-500 to-orange-400',
    },
    {
      id: 'five_sessions',
      emoji: '⭐',
      name: 'Rising Star',
      desc: 'Completed 5 tutoring sessions',
      earned: sessionsCount >= 5,
      color: 'from-yellow-500 to-yellow-400',
    },
    {
      id: 'ten_sessions',
      emoji: '🏆',
      name: 'Champion',
      desc: 'Completed 10 tutoring sessions',
      earned: sessionsCount >= 10,
      color: 'from-[#D4A017] to-amber-400',
    },
    {
      id: 'learning_profile',
      emoji: '🧠',
      name: 'Self-Aware',
      desc: 'Completed a learning profile',
      earned: hasProfile,
      color: 'from-purple-500 to-purple-400',
    },
    {
      id: 'has_goal',
      emoji: '🎯',
      name: 'Goal Setter',
      desc: 'Set learning goals',
      earned: hasProfile, // mock tied to profile
      color: 'from-teal-500 to-teal-400',
    },
    {
      id: 'dedicated',
      emoji: '💎',
      name: 'Dedicated',
      desc: 'Completed 20 tutoring sessions',
      earned: sessionsCount >= 20,
      color: 'from-indigo-600 to-indigo-500',
    },
    {
      id: 'perfect_month',
      emoji: '📅',
      name: 'Perfect Month',
      desc: 'Had sessions for 4 weeks in a row',
      earned: sessionsCount >= 4,
      color: 'from-green-600 to-green-500',
    },
  ]
}

function computePoints(sessionsCount: number, hasProfile: boolean): number {
  let pts = sessionsCount * 50
  if (hasProfile) pts += 150
  return pts > 0 ? pts : 50 // Everyone starts with 50 points for signing up
}

function getLevel(points: number): { level: number; name: string; nextAt: number; color: string } {
  if (points >= 1000) return { level: 5, name: 'Elite Scholar', nextAt: 1000, color: 'from-[#D4A017] to-amber-400' }
  if (points >= 500)  return { level: 4, name: 'Advanced',      nextAt: 1000, color: 'from-indigo-600 to-indigo-400' }
  if (points >= 250)  return { level: 3, name: 'Proficient',    nextAt: 500,  color: 'from-teal-600 to-teal-400' }
  if (points >= 100)  return { level: 2, name: 'Learner',        nextAt: 250,  color: 'from-blue-600 to-blue-400' }
  return { level: 1, name: 'Beginner', nextAt: 100, color: 'from-gray-500 to-gray-400' }
}

// ─── PAGE ──────────────────────────────────────────────────────────────────

export default async function RewardsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: parentProfile } = await supabase.from('parent_profiles').select('id').eq('user_id', user.id).single()
  if (!parentProfile) redirect('/dashboard/parent')

  const { data: students } = await supabase.from('students').select('*').eq('parent_id', parentProfile.id)

  const studentData = (students || []).map((student, index) => {
    // Mock data for prototype aesthetics to show progression
    const mockSessionsCount = index === 0 ? 4 : 0 // First child has some progress
    const mockHasProfile = index === 0

    const badges = computeBadges(mockSessionsCount, mockHasProfile)
    const points = computePoints(mockSessionsCount, mockHasProfile)
    const levelInfo = getLevel(points)
    const earnedCount = badges.filter(b => b.earned).length
    return { student, badges, points, levelInfo, earnedCount }
  })

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/parent" className="text-[#0B2341] hover:text-[#D4A017] transition-colors flex items-center gap-2 font-bold bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-sm">
            &larr; Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-br from-[#D4A017] via-[#f0c040] to-amber-500 rounded-3xl p-10 relative overflow-hidden shadow-xl border border-amber-200">
          <div className="absolute right-0 top-0 text-[12rem] opacity-20 leading-none select-none transform translate-x-4 -translate-y-8">🏆</div>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)', backgroundSize: '20px 20px' }} />
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 tracking-tight">Rewards & Badges</h1>
            <p className="text-amber-100 text-lg font-medium max-w-xl">Celebrate your child's learning achievements. Gamified progression keeps them motivated and excited to learn.</p>
          </div>
        </div>

        {(students || []).length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-inner">🏆</div>
            <h3 className="font-bold text-[#0B2341] text-2xl mb-3">No children yet</h3>
            <p className="text-gray-500 text-base mb-8 max-w-sm mx-auto">Add a child to start earning badges, leveling up, and tracking their academic journey.</p>
            <Link href="/dashboard/parent/add-child" className="inline-block bg-[#0B2341] text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-[#071829] shadow-md transition-all">
              + Add Child Now
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {studentData.map(({ student, badges, points, levelInfo, earnedCount }) => {
              const progressPct = Math.min(100, Math.round((points / levelInfo.nextAt) * 100))
              return (
                <div key={student.id} className="space-y-6">
                  
                  {/* Student Level Card */}
                  <div className={`bg-gradient-to-r ${levelInfo.color} rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-lg`}>
                    <div className="absolute right-0 top-0 text-[10rem] opacity-10 leading-none transform translate-y-4">⭐</div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                      <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center font-black text-4xl border-2 border-white/30 shadow-inner backdrop-blur-sm shrink-0">
                          {student.full_name.charAt(0)}
                        </div>
                        <div>
                          <h2 className="text-3xl font-black mb-1">{student.full_name}</h2>
                          <p className="text-white/80 font-bold tracking-wider uppercase text-sm mb-3">Grade {student.grade}</p>
                          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 shadow-sm">
                            <span className="text-white text-xs font-black uppercase tracking-wider">
                              Level {levelInfo.level} <span className="mx-1">•</span> {levelInfo.name}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-black/10 p-6 rounded-3xl border border-white/10 backdrop-blur-sm w-full md:w-auto text-center md:text-right shrink-0">
                        <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">Total Points</p>
                        <p className="text-5xl font-black">{points}</p>
                      </div>
                    </div>

                    {/* XP Bar */}
                    <div className="mt-8 bg-black/10 p-5 rounded-3xl border border-white/10 backdrop-blur-sm">
                      <div className="flex justify-between text-xs font-bold text-white/90 mb-2 uppercase tracking-wider">
                        <span>{points} pts</span>
                        <span>{levelInfo.nextAt} pts to next level</span>
                      </div>
                      <div className="h-4 bg-black/30 rounded-full overflow-hidden shadow-inner p-0.5">
                        <div className="h-full bg-white rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.8)] relative" style={{ width: `${progressPct}%` }}>
                           <div className="absolute top-0 right-0 bottom-0 left-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 mix-blend-overlay"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Badges Grid */}
                  <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="font-black text-[#0B2341] text-2xl flex items-center gap-3">
                        <span>🏅</span> Achievement Badges
                      </h3>
                      <span className="bg-[#D4A017]/10 text-[#D4A017] font-black px-4 py-1.5 rounded-xl border border-[#D4A017]/20 text-sm">
                        {earnedCount} / {badges.length} Unlocked
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                      {badges.map(badge => (
                        <div
                          key={badge.id}
                          className={`bg-white rounded-2xl border-2 p-6 text-center transition-all duration-300 relative overflow-hidden group
                            ${badge.earned ? 'border-gray-100 shadow-sm hover:shadow-lg hover:border-[#D4A017]/30 hover:-translate-y-1' : 'border-dashed border-gray-200 bg-gray-50'}`}
                        >
                          {badge.earned && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4A017] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                          
                          <div className={`w-20 h-20 mx-auto mb-4 rounded-3xl flex items-center justify-center text-4xl shadow-inner transition-transform group-hover:scale-110
                            ${badge.earned ? `bg-gradient-to-br ${badge.color} text-white` : 'bg-gray-100 grayscale opacity-50'}`}>
                            {badge.emoji}
                          </div>
                          <p className={`font-black text-base mb-1 ${badge.earned ? 'text-[#0B2341]' : 'text-gray-400'}`}>{badge.name}</p>
                          <p className={`text-xs leading-relaxed font-medium ${badge.earned ? 'text-gray-500' : 'text-gray-400'}`}>{badge.desc}</p>
                          
                          {badge.earned && (
                            <div className="mt-4 inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border border-green-100">
                              <span>✅</span> Unlocked
                            </div>
                          )}
                          {!badge.earned && (
                            <div className="mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                              Locked 🔒
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* How to earn more points */}
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                    <h3 className="font-black text-[#0B2341] text-xl mb-6 flex items-center gap-3">
                      <span>💡</span> How to Earn More Points
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {[
                        { icon: '📅', label: 'Complete a Session', pts: '+50 pts', desc: 'Attend tutoring sessions' },
                        { icon: '🧠', label: 'Update Profile', pts: '+150 pts', desc: 'Fill learning goals' },
                        { icon: '📝', label: 'Do Homework', pts: '+30 pts', desc: 'Finish assignments' },
                      ].map(item => (
                        <div key={item.label} className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 rounded-2xl bg-[#FDFBF7] border border-gray-100 hover:border-[#D4A017]/30 transition-colors text-center sm:text-left">
                          <span className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl shrink-0">{item.icon}</span>
                          <div>
                            <p className="font-black text-[#0B2341] text-sm mb-1">{item.label}</p>
                            <p className="text-xs text-gray-500 font-medium mb-2">{item.desc}</p>
                            <span className="inline-block bg-[#D4A017]/10 text-[#D4A017] px-2 py-1 rounded-lg text-xs font-black">{item.pts}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

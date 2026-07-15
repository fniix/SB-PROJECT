'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

// --- Playful Components ---

const FloatingClouds = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <motion.div animate={{ x: ['-10%', '110%'] }} transition={{ repeat: Infinity, duration: 40, ease: 'linear' }} className="absolute top-10 left-0 text-white/50 text-8xl">Γÿü∩╕Å</motion.div>
      <motion.div animate={{ x: ['-10%', '110%'] }} transition={{ repeat: Infinity, duration: 30, ease: 'linear', delay: 10 }} className="absolute top-40 -left-20 text-white/40 text-7xl">Γÿü∩╕Å</motion.div>
      <motion.div animate={{ x: ['-10%', '110%'] }} transition={{ repeat: Infinity, duration: 45, ease: 'linear', delay: 5 }} className="absolute top-24 left-0 text-white/60 text-9xl">Γÿü∩╕Å</motion.div>
    </div>
  )
}

const Mascot = () => (
  <motion.div 
    animate={{ y: [0, -20, 0], rotate: [-5, 5, -5] }} 
    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }} 
    className="absolute -top-16 right-4 sm:right-12 text-[120px] drop-shadow-xl z-20"
  >
    ≡ƒªè
  </motion.div>
)

export default function StudentPlayfulDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
      setLoading(false)
    }
    load()
  }, [router, supabase])

  if (loading) return (
    <div className="min-h-screen bg-sky-300 p-12 flex flex-col items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="text-6xl mb-6">ΓÅ│</motion.div>
      <div className="text-white font-black text-2xl drop-shadow-md">Loading your world...</div>
    </div>
  )

  const firstName = profile?.full_name?.split(' ')[0] || 'Hero'

  // Mock data
  const totalXP = 240
  const level = Math.floor(totalXP / 100) + 1
  const xpInCurrentLevel = totalXP % 100
  
  const quests = [
    { id: 1, title: 'Read a new story', xp: 50, icon: '≡ƒôû', done: true, color: 'bg-orange-100', shadow: 'shadow-[0_6px_0_#fed7aa]' },
    { id: 2, title: 'Math Ninja Quiz', xp: 30, icon: '≡ƒÑ╖', done: false, color: 'bg-blue-100', shadow: 'shadow-[0_6px_0_#bfdbfe]' },
    { id: 3, title: 'Science Lab: Plants', xp: 40, icon: '≡ƒî▒', done: false, color: 'bg-green-100', shadow: 'shadow-[0_6px_0_#bbf7d0]' },
  ]

  const badges = [
    { name: 'First Step', icon: '≡ƒÉú', earned: true },
    { name: 'Math Star', icon: 'Γ¡É', earned: true },
    { name: 'Book Worm', icon: '≡ƒÉ¢', earned: false },
    { name: 'Fire Streak', icon: '≡ƒöÑ', earned: false },
  ]

  const buttons = [
    { label: 'My Games', href: '/dashboard/student/games', icon: '≡ƒÄ«', color: 'bg-pink-400', shadow: 'shadow-[0_8px_0_#db2777]' },
    { label: 'Videos', href: '/dashboard/student/library', icon: '≡ƒô║', color: 'bg-yellow-400', shadow: 'shadow-[0_8px_0_#ca8a04]' },
    { label: 'Rewards', href: '/dashboard/student/rewards', icon: '≡ƒÄü', color: 'bg-purple-400', shadow: 'shadow-[0_8px_0_#9333ea]' },
    { label: 'Homework', href: '/dashboard/student/assignments', icon: '≡ƒÄÆ', color: 'bg-cyan-400', shadow: 'shadow-[0_8px_0_#0891b2]' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-100 p-4 sm:p-8 relative overflow-hidden font-sans">
      <FloatingClouds />

      <div className="max-w-6xl mx-auto relative z-10 space-y-12 pb-20">
        
        {/* --- HERO PROFILE & XP --- */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="relative bg-white rounded-[3rem] p-8 border-4 border-white/40 shadow-[0_12px_0_rgba(0,0,0,0.1)] mt-16"
        >
          <Mascot />
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar & Level */}
            <div className="relative shrink-0">
              <div className="w-32 h-32 bg-yellow-200 rounded-full border-8 border-white shadow-[0_8px_0_rgba(0,0,0,0.1)] flex items-center justify-center text-6xl">
                ≡ƒæª
              </div>
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }} 
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -bottom-4 -right-4 bg-red-500 text-white font-black text-2xl w-14 h-14 rounded-full flex items-center justify-center border-4 border-white shadow-md"
              >
                {level}
              </motion.div>
            </div>

            {/* Name & Progress */}
            <div className="flex-1 w-full text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-black text-sky-900 mb-2 drop-shadow-sm">Hi, {firstName}! ≡ƒæï</h1>
              <p className="text-xl font-bold text-sky-600 mb-4">Ready for an adventure?</p>
              
              <div className="bg-gray-100 rounded-full p-2 border-4 border-gray-200 shadow-inner relative overflow-hidden h-12">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${xpInCurrentLevel}%` }}
                  transition={{ duration: 1.5, type: 'spring' }}
                  className="h-full bg-gradient-to-r from-green-400 to-green-300 rounded-full shadow-[inset_0_-4px_0_rgba(0,0,0,0.1)] relative"
                >
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                </motion.div>
                <div className="absolute inset-0 flex items-center justify-center font-black text-sky-900 drop-shadow-[0_1px_0_white] text-sm">
                  {xpInCurrentLevel} / 100 XP to Level {level + 1}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- ADVENTURE MAP (Quests) --- */}
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="bg-emerald-400 rounded-[3rem] p-6 sm:p-10 border-4 border-emerald-300 shadow-[0_12px_0_#059669] relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/green-dust-and-scratches.png')]"></div>
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <h2 className="text-3xl sm:text-4xl font-black text-white drop-shadow-[0_4px_0_#047857]">≡ƒù║∩╕Å Quest Map</h2>
                <div className="bg-white/20 px-4 py-2 rounded-2xl text-white font-black shadow-inner">
                  {quests.filter(q => q.done).length} / {quests.length}
                </div>
              </div>

              {/* Zig Zag Path */}
              <div className="relative z-10 py-4 space-y-6">
                {/* Winding dashed line behind quests */}
                <div className="absolute top-10 bottom-10 left-1/2 w-4 border-l-8 border-dashed border-white/30 -translate-x-1/2 z-0 hidden sm:block"></div>

                {quests.map((q, index) => (
                  <motion.div 
                    key={q.id}
                    whileHover={{ scale: 1.05, rotate: index % 2 === 0 ? 2 : -2 }}
                    className={`flex ${index % 2 === 0 ? 'sm:justify-start' : 'sm:justify-end'} relative z-10`}
                  >
                    <div className={`w-full sm:w-[85%] bg-white rounded-3xl p-4 sm:p-6 border-4 border-white/50 flex items-center gap-4 cursor-pointer transition-all ${q.shadow} hover:translate-y-1 hover:shadow-[0_2px_0_#00000033] ${q.done ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl border-4 border-white shadow-md ${q.color}`}>
                        {q.done ? 'Γ£à' : q.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-xl sm:text-2xl font-black mb-1 ${q.done ? 'text-gray-400 line-through' : 'text-slate-800'}`}>{q.title}</h3>
                        <p className="text-emerald-500 font-bold bg-emerald-50 inline-block px-3 py-1 rounded-xl text-sm">+{q.xp} XP</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* --- SIDEBAR --- */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Quick Actions */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="grid grid-cols-2 gap-4 sm:gap-6"
            >
              {buttons.map((btn, i) => (
                <Link key={btn.label} href={btn.href}>
                  <motion.button 
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95, y: 0, boxShadow: '0 0 0 rgba(0,0,0,0)' }}
                    className={`w-full ${btn.color} ${btn.shadow} rounded-[2rem] p-6 flex flex-col items-center justify-center gap-3 border-4 border-white/20 transition-all`}
                  >
                    <span className="text-5xl drop-shadow-md">{btn.icon}</span>
                    <span className="font-black text-white text-lg drop-shadow-[0_2px_0_rgba(0,0,0,0.2)]">{btn.label}</span>
                  </motion.button>
                </Link>
              ))}
            </motion.div>

            {/* Treasure Chest (Badges) */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="bg-purple-500 rounded-[3rem] p-8 border-4 border-purple-400 shadow-[0_12px_0_#7e22ce] relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
              
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 drop-shadow-[0_4px_0_#6b21a8] relative z-10 flex items-center gap-3">
                <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>≡ƒææ</motion.span> 
                My Treasures
              </h2>
              
              <div className="grid grid-cols-2 gap-4 relative z-10">
                {badges.map((b, i) => (
                  <motion.div 
                    key={b.name}
                    whileHover={b.earned ? { scale: 1.1, rotate: 5 } : {}}
                    className={`bg-white rounded-3xl p-4 flex flex-col items-center justify-center gap-2 border-4 ${b.earned ? 'border-yellow-400 shadow-[0_6px_0_#facc15]' : 'border-gray-200 shadow-sm opacity-50 grayscale'}`}
                  >
                    <span className="text-4xl drop-shadow-sm">{b.icon}</span>
                    <span className="text-xs font-black text-slate-700 text-center uppercase">{b.name}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  )
}

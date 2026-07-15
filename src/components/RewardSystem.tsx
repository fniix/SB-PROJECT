'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Reward {
  type: 'star' | 'badge_excellent' | 'badge_creative' | 'badge_brave' | 'badge_focus'
  label: string
  emoji: string
  color: string
  bg: string
}

const REWARDS: Reward[] = [
  { type: 'star',            label: 'Gold Star',    emoji: '⭐', color: '#D97706', bg: '#FEF3C7' },
  { type: 'badge_excellent', label: 'Excellent!',   emoji: '🏆', color: '#7C3AED', bg: '#EDE9FE' },
  { type: 'badge_creative',  label: 'Creative!',    emoji: '🎨', color: '#0891B2', bg: '#CFFAFE' },
  { type: 'badge_brave',     label: 'Brave!',       emoji: '🦁', color: '#DC2626', bg: '#FEE2E2' },
  { type: 'badge_focus',     label: 'Focused!',     emoji: '🎯', color: '#16A34A', bg: '#DCFCE7' },
]

interface RewardSystemProps {
  bookingId: string
  studentName?: string
  role: 'tutor' | 'parent' | 'student'
}

interface ReceivedReward {
  id: string
  reward_type: string
  message?: string
  created_at: string
}

export default function RewardSystem({ bookingId, studentName = 'Student', role }: RewardSystemProps) {
  const supabase = createClient()
  const [rewards, setRewards] = useState<ReceivedReward[]>([])
  const [sending, setSending] = useState<string | null>(null)
  const [justSent, setJustSent] = useState<string | null>(null)
  const [celebrate, setCelebrate] = useState<string | null>(null)
  const [sessionStars, setSessionStars] = useState(0)

  // Load existing rewards for this session
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('session_rewards')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false })
      if (data) {
        setRewards(data)
        setSessionStars(data.filter(r => r.reward_type === 'star').length)
      }
    }
    load()

    // Real-time subscription — student sees reward instantly
    const channel = supabase
      .channel(`rewards-${bookingId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'session_rewards',
        filter: `booking_id=eq.${bookingId}`,
      }, (payload) => {
        const newReward = payload.new as ReceivedReward
        setRewards(prev => [newReward, ...prev])
        if (newReward.reward_type === 'star') {
          setSessionStars(s => s + 1)
        }
        // Celebration animation for student
        if (role === 'student') {
          setCelebrate(newReward.reward_type)
          setTimeout(() => setCelebrate(null), 3500)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [bookingId, role, supabase])

  const sendReward = async (reward: Reward) => {
    setSending(reward.type)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('session_rewards').insert({
        booking_id:  bookingId,
        given_by:    user?.id,
        reward_type: reward.type,
        message:     `${reward.emoji} Well done! ${reward.label}`,
      })
      setJustSent(reward.type)
      setTimeout(() => setJustSent(null), 2000)
    } finally {
      setSending(null)
    }
  }

  // ── Student view: show received rewards with celebration
  if (role === 'student') {
    const latestReward = rewards[0]
    const rewardInfo = latestReward
      ? REWARDS.find(r => r.type === latestReward.reward_type)
      : null

    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 text-white"
          style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}>
          <h3 className="font-bold text-sm flex items-center gap-2">
            <span>🌟</span> My Rewards
          </h3>
          <p className="text-[10px] text-white/80">Stars you collected this session</p>
        </div>

        <div className="p-4 space-y-3">
          {/* Stars count */}
          <div className="flex items-center justify-center gap-1 py-2">
            {Array.from({ length: Math.max(5, sessionStars) }).map((_, i) => (
              <span key={i} className={`text-2xl transition-all duration-300 ${
                i < sessionStars ? 'scale-110' : 'opacity-20'
              }`} style={{ filter: i < sessionStars ? 'drop-shadow(0 0 4px #F59E0B)' : 'none' }}>
                ⭐
              </span>
            ))}
          </div>
          <p className="text-center text-sm font-bold text-gray-700">
            {sessionStars === 0 ? "Don't give up — rewards are coming!" :
             sessionStars === 1 ? 'One star 🌟 Well done!' :
             sessionStars <= 3 ? `${sessionStars} stars! Great! 🎉` :
             `${sessionStars} stars!! You are a star today! 🏆`}
          </p>

          {/* Celebration overlay */}
          {celebrate && rewardInfo && (
            <div className="relative p-4 rounded-2xl text-center border-2 animate-bounce"
              style={{ backgroundColor: rewardInfo.bg, borderColor: rewardInfo.color }}>
              <div className="text-5xl mb-1">{rewardInfo.emoji}</div>
              <p className="font-black text-lg" style={{ color: rewardInfo.color }}>
                {rewardInfo.label}
              </p>
              <p className="text-xs text-gray-500">From your tutor — well done!</p>
            </div>
          )}

          {/* Recent rewards */}
          {rewards.length > 0 && (
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {rewards.slice(0, 5).map(r => {
                const info = REWARDS.find(x => x.type === r.reward_type)
                return (
                  <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg"
                    style={{ backgroundColor: info?.bg || '#f9f9f9' }}>
                    <span className="text-xl">{info?.emoji}</span>
                    <span className="text-xs font-bold" style={{ color: info?.color }}>
                      {info?.label}
                    </span>
                    <span className="text-[10px] text-gray-400 ml-auto">
                      {new Date(r.created_at).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Tutor view: send rewards buttons
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 text-white"
        style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)' }}>
        <h3 className="font-bold text-sm flex items-center gap-2">
          <span>🎁</span> Student Rewards
        </h3>
        <p className="text-xs text-white/80 mb-4">
          Send a reward to {studentName} — it will appear instantly on their screen
        </p>
      </div>

      <div className="p-4 space-y-3">
        {/* Stars sent this session */}
        {sessionStars > 0 && (
          <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-xl border border-amber-200">
            <span className="text-amber-500">⭐</span>
            <span className="text-xs font-bold text-amber-700">
              {sessionStars} stars sent so far
            </span>
          </div>
        )}

        {/* Reward buttons */}
        <div className="grid grid-cols-1 gap-2">
          {REWARDS.map(reward => {
            const isThisSending = sending === reward.type
            const isThisSent = justSent === reward.type
            return (
              <button
                key={reward.type}
                onClick={() => sendReward(reward)}
                disabled={!!sending}
                className="flex items-center gap-3 p-3 rounded-xl border-2 font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                style={{
                  borderColor: isThisSent ? reward.color : '#E5E7EB',
                  backgroundColor: isThisSent ? reward.bg : '#FAFAFA',
                  color: isThisSent ? reward.color : '#374151',
                }}
              >
                <span className={`text-2xl ${isThisSending ? 'animate-spin' : ''}`}>
                  {isThisSending ? '⏳' : reward.emoji}
                </span>
                <span className="flex-1 text-right">
                  {isThisSent ? `✅ Sent "${reward.label}"!` : `Send: ${reward.label}`}
                </span>
              </button>
            )
          })}
        </div>

        <p className="text-[10px] text-gray-400 text-center">
          💡 Rewards appear instantly on the student's screen
        </p>
      </div>
    </div>
  )
}

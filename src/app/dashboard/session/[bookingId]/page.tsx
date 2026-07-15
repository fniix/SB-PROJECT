'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import VisualTimer from '@/components/VisualTimer'
import RewardSystem from '@/components/RewardSystem'

interface BookingData {
  id: string
  subject: string
  date: string
  time: string
  status: string
  session_type: string
  meet_link: string | null
  total_price: number
  tutor_name?: string
  student_name?: string
  notes?: string
}

export default function LiveSessionPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.bookingId as string
  const supabase = createClient()

  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [sessionActive, setSessionActive] = useState(false)
  const [attendance, setAttendance] = useState({ tutor: false, student: false })
  const [reportIssue, setReportIssue] = useState(false)
  const [issueText, setIssueText] = useState('')
  const [issueSent, setIssueSent] = useState(false)
  const [userRole, setUserRole] = useState<'tutor' | 'parent' | 'student'>('parent')

  // Load booking data
  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single()

      if (err || !data) {
        setError('Session not found. Please check your booking.')
        setLoading(false)
        return
      }

      setBooking({
        id: data.id,
        subject: data.subject || 'Session',
        date: data.date || '',
        time: data.time || '',
        status: data.status || 'scheduled',
        session_type: data.session_type || 'online',
        meet_link: data.meet_link || null,
        total_price: data.total_price || 0,
        tutor_name: data.tutor_name || 'Tutor',
        student_name: data.student_name || 'Student',
        notes: data.notes || '',
      })
      setLoading(false)
    }
    load()

    // Detect user role
    const detectRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles').select('role').eq('id', user.id).single()
        const role = profile?.role
        if (role === 'tutor' || role === 'specialist') setUserRole('tutor')
        else if (role === 'beneficiary') setUserRole('student')
        else setUserRole('parent')
      }
    }
    detectRole()
  }, [bookingId, supabase])

  // Timer
  useEffect(() => {
    if (!sessionActive) return
    const interval = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(interval)
  }, [sessionActive])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const handleJoinClass = () => {
    setSessionActive(true)
    setAttendance(prev => ({ ...prev, student: true }))
    if (booking?.meet_link) {
      window.open(booking.meet_link, '_blank')
    }
  }

  const handleMarkComplete = async () => {
    await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .eq('id', bookingId)

    router.push(`/dashboard/session/${bookingId}/report`)
  }

  const handleReportIssue = async () => {
    if (!issueText.trim()) return
    await supabase.from('support_tickets').insert({
      booking_id: bookingId,
      category: 'technical',
      priority: 'urgent',
      message: issueText,
      status: 'open',
    })
    setIssueSent(true)
    setIssueText('')
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--theme-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500 font-medium">Loading session...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center mt-20">
        <div className="text-6xl mb-4">😔</div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--theme-text-primary)' }}>Session Not Found</h2>
        <p className="text-gray-500 mb-6">{error || 'This session does not exist or you do not have access.'}</p>
        <Link href="/dashboard/parent/bookings" className="btn-primary px-6 py-3 rounded-xl inline-block">
          ← Back to Bookings
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 min-h-screen" style={{ background: 'var(--theme-bg)' }}>
      {/* ── Session Header ── */}
      <div className="bg-gradient-to-br from-[#062A4F] via-[#0d3a6a] to-[#1a5090] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <p className="text-sm text-blue-200 font-semibold mb-1">Live Session</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{booking.subject}</h1>
            </div>
            {sessionActive && (
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="font-mono text-xl font-bold">{formatTime(elapsed)}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="bg-white/10 rounded-lg px-3 py-1.5">
              👨‍🏫 <span className="font-semibold">{booking.tutor_name}</span>
            </div>
            <div className="bg-white/10 rounded-lg px-3 py-1.5">
              📅 {booking.date} at {booking.time}
            </div>
            <div className="bg-white/10 rounded-lg px-3 py-1.5">
              🎯 {booking.session_type}
            </div>
            <div className={`rounded-lg px-3 py-1.5 font-bold ${
              booking.status === 'completed' ? 'bg-green-500/20 text-green-300' :
              sessionActive ? 'bg-green-500/20 text-green-300' :
              'bg-yellow-500/20 text-yellow-300'
            }`}>
              {sessionActive ? '🟢 In Progress' : booking.status === 'completed' ? '✅ Completed' : '⏳ Scheduled'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Main Area ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Join / Video Area */}
          <div className="stat-card text-center py-12">
            {!sessionActive ? (
              <div className="space-y-4">
                <div className="text-7xl mb-4">🎬</div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--theme-text-primary)' }}>Ready to Start?</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  Click the button below to join your live class. {booking.meet_link
                    ? 'A Google Meet link will open in a new tab.'
                    : 'Your tutor will share the meeting link.'}
                </p>
                <button
                  onClick={handleJoinClass}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-3 mt-4"
                >
                  <span className="text-2xl">🚀</span>
                  Join Class Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-7xl mb-4">📹</div>
                <h3 className="text-xl font-bold text-green-600">Class In Progress</h3>
                <p className="text-gray-500 text-sm">
                  {booking.meet_link
                    ? 'Your Google Meet session is active in another tab.'
                    : 'Your session is active. Focus on your learning!'}
                </p>
                {booking.meet_link && (
                  <a
                    href={booking.meet_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 font-semibold px-4 py-2 rounded-lg hover:bg-blue-100 transition-all"
                  >
                    🔗 Rejoin Meeting
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Class Notes / Agenda */}
          {booking.notes && (
            <div className="stat-card">
              <h3 className="font-bold text-lg mb-3" style={{ color: 'var(--theme-text-primary)' }}>📋 Session Notes</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{booking.notes}</p>
            </div>
          )}

          {/* Complete Session Button */}
          {sessionActive && (
            <div className="stat-card border-2 border-green-200 bg-green-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-green-800">Done with today&apos;s session?</h3>
                  <p className="text-sm text-green-600 mt-1">Mark as complete to submit your session report.</p>
                </div>
                <button
                  onClick={handleMarkComplete}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all"
                >
                  ✅ Complete Session
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Side Panel ── */}
        <div className="space-y-6">

          {/* ── Visual Timer ── */}
          {sessionActive && (
            <VisualTimer
              defaultMinutes={45}
              onComplete={() => {
                // Optionally auto-prompt to complete session
              }}
            />
          )}

          {/* ── Reward System ── */}
          {sessionActive && (
            <RewardSystem
              bookingId={bookingId}
              studentName={booking.student_name}
              role={userRole}
            />
          )}

          {/* Attendance */}
          <div className="stat-card">
            <h3 className="font-bold mb-4" style={{ color: 'var(--theme-text-primary)' }}>👥 Attendance</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <span className="text-sm font-medium">👨‍🏫 Tutor</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  attendance.tutor ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {attendance.tutor ? '✅ Joined' : '⏳ Waiting'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <span className="text-sm font-medium">🎓 Student</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  attendance.student ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {attendance.student ? '✅ Joined' : '⏳ Waiting'}
                </span>
              </div>
            </div>
          </div>

          {/* Session Details */}
          <div className="stat-card">
            <h3 className="font-bold mb-4" style={{ color: 'var(--theme-text-primary)' }}>📌 Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subject</span>
                <span className="font-semibold">{booking.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-semibold">{booking.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span className="font-semibold">{booking.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="font-semibold capitalize">{booking.session_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Price</span>
                <span className="font-bold" style={{ color: 'var(--theme-accent)' }}>BD {booking.total_price}</span>
              </div>
            </div>
          </div>

          {/* Report Issue */}
          <div className="stat-card">
            <h3 className="font-bold mb-3" style={{ color: 'var(--theme-text-primary)' }}>⚠️ Report Issue</h3>
            {issueSent ? (
              <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                <p className="text-sm text-green-700 font-medium">✅ Issue reported! Our support team will contact you.</p>
              </div>
            ) : reportIssue ? (
              <div className="space-y-3">
                <textarea
                  rows={3}
                  placeholder="Describe the issue (e.g., video not working, audio problems...)"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  value={issueText}
                  onChange={e => setIssueText(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setReportIssue(false)}
                    className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReportIssue}
                    className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600"
                  >
                    Submit
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setReportIssue(true)}
                className="w-full py-3 border-2 border-dashed border-red-200 text-red-500 font-semibold rounded-xl hover:bg-red-50 transition-all text-sm"
              >
                🚨 Report a Problem
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function RateSessionPage() {
  const params = useParams()
  const bookingId = params.bookingId as string

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('bookings')
        .select('*, students(full_name, id), tutor_profiles(id, profiles(full_name))')
        .eq('id', bookingId)
        .single()

      setBooking(data)
      setLoading(false)
    }
    load()
  }, [bookingId, router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) return alert('Please select a star rating.')
    setSaving(true)

    // 1. Save rating as a progress report
    await supabase.from('progress_reports').insert({
      tutor_id: booking.tutor_id,
      student_id: booking.student_id,
      parent_id: booking.parent_id,
      booking_id: bookingId,
      rating: rating,
      parent_comment: comment,
      summary: `Session rated ${rating}/5 stars by parent.`,
    })

    // 2. Update tutor average_rating
    const { data: allRatings } = await supabase
      .from('progress_reports')
      .select('rating')
      .eq('tutor_id', booking.tutor_id)
      .not('rating', 'is', null)

    if (allRatings && allRatings.length > 0) {
      const avg = allRatings.reduce((s: number, r: any) => s + (r.rating || 0), 0) / allRatings.length
      await supabase.from('tutor_profiles').update({ average_rating: Math.round(avg * 10) / 10 }).eq('id', booking.tutor_id)
    }

    setDone(true)
    setSaving(false)
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-screen bg-[#F0EDE8]">
      <div className="w-12 h-12 border-4 border-[#0B2341] border-t-[#D4A017] rounded-full animate-spin" />
    </div>
  )

  if (done) return (
    <div className="min-h-screen bg-[#F0EDE8] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-12 max-w-md w-full text-center">
        <div className="text-7xl mb-4">⭐</div>
        <h2 className="text-2xl font-black text-[#0B2341] mb-2">Thank You!</h2>
        <p className="text-gray-500 mb-6">Your rating has been submitted and the tutor has been notified.</p>
        <Link href="/dashboard/parent/bookings" className="bg-[#0B2341] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#071829] border-2 border-transparent hover:border-[#D4A017] transition-all inline-block">
          Back to Bookings
        </Link>
      </div>
    </div>
  )

  if (!booking) return (
    <div className="p-8"><div className="bg-red-50 text-red-600 p-4 rounded-xl">Session not found. <Link href="/dashboard/parent/bookings" className="underline">Go back</Link></div></div>
  )

  const tutorName = booking.tutor_profiles?.profiles?.full_name || 'Tutor'
  const studentName = booking.students?.full_name || 'Student'

  return (
    <div className="min-h-screen bg-[#F0EDE8] p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard/parent/bookings" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#0B2341] mb-6 transition-colors">← Back to Bookings</Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B2341] to-[#1a3a5c] rounded-2xl p-6 mb-6 text-white">
          <h1 className="text-2xl font-black mb-1">Rate Your Session</h1>
          <p className="text-gray-300">{booking.subject} with {tutorName} • {new Date(booking.date).toLocaleDateString()}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Rating */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-[#0B2341] mb-4">⭐ Overall Session Rating</h2>
            <div className="flex gap-3 mb-3">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(star)}
                  className="text-5xl transition-all hover:scale-110"
                >
                  <span className={(hovered || rating) >= star ? 'text-[#D4A017]' : 'text-gray-200'}>★</span>
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-400 font-medium">
              {rating === 0 && 'Select a rating...'}
              {rating === 1 && '😞 Poor — Not what we expected'}
              {rating === 2 && '😐 Fair — Some improvements needed'}
              {rating === 3 && '🙂 Good — Satisfactory session'}
              {rating === 4 && '😊 Great — Really enjoyed the session'}
              {rating === 5 && '🌟 Excellent — Outstanding tutor!'}
            </p>
          </div>

          {/* Comment */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-[#0B2341] mb-3">💬 Comments (optional)</h2>
            <textarea
              rows={3}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Share your feedback about this session..."
              className="w-full rounded-xl border border-gray-200 bg-[#F0EDE8] px-4 py-3 text-sm focus:border-[#D4A017]"
            />
          </div>

          <button
            type="submit"
            disabled={saving || rating === 0}
            className="w-full bg-[#D4A017] hover:bg-[#b8860b] text-white py-4 rounded-xl font-black text-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Submitting...' : '⭐ Submit Rating'}
          </button>
        </form>
      </div>
    </div>
  )
}

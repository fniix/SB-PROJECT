'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SessionNotesPage() {
  const params = useParams()
  const bookingId = params.bookingId as string
  
  const [booking, setBooking] = useState<any>(null)
  const [noteId, setNoteId] = useState<string | null>(null)
  
  const [summary, setSummary] = useState('')
  const [strengths, setStrengths] = useState('')
  const [weaknesses, setWeaknesses] = useState('')
  const [homework, setHomework] = useState('')
  const [recommendations, setRecommendations] = useState('')

  const [score, setScore] = useState<number | ''>('')
  const [engagement, setEngagement] = useState('medium')
  const [perfId, setPerfId] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      if (!bookingId) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // 1. Fetch Booking Details
      const { data: bData, error: bError } = await supabase
        .from('bookings')
        .select(`
          *,
          students ( full_name )
        `)
        .eq('id', bookingId)
        .single()

      if (bError || !bData) {
        setError('Booking not found.')
        setLoading(false)
        return
      }
      setBooking(bData)

      // 2. Fetch Existing Note (if any)
      const { data: noteData } = await supabase
        .from('session_notes')
        .select('*')
        .eq('booking_id', bookingId)
        .maybeSingle()

      if (noteData) {
        setNoteId(noteData.id)
        setSummary(noteData.summary || '')
        setStrengths(noteData.strengths || '')
        setWeaknesses(noteData.weaknesses || '')
        setHomework(noteData.homework || '')
        setRecommendations(noteData.recommendations || '')
      }

      // 3. Fetch Existing Performance
      const { data: perfData } = await supabase
        .from('student_performance')
        .select('*')
        .eq('booking_id', bookingId)
        .maybeSingle()

      if (perfData) {
        setPerfId(perfData.id)
        setScore(perfData.score)
        setEngagement(perfData.engagement_level || 'medium')
      }
      
      setLoading(false)
    }

    fetchData()
  }, [bookingId, router, supabase])

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(false)

    const noteData = {
      booking_id: bookingId,
      tutor_id: booking.tutor_id,
      student_id: booking.student_id,
      summary,
      strengths,
      weaknesses,
      homework,
      recommendations
    }

    let resultError
    
    if (noteId) {
      // Update
      const { error } = await supabase
        .from('session_notes')
        .update(noteData)
        .eq('id', noteId)
      resultError = error
    } else {
      // Insert
      const { error, data } = await supabase
        .from('session_notes')
        .insert(noteData)
        .select('id')
        .single()
      
      if (data) setNoteId(data.id)
      resultError = error
    }

    // Save Performance Data
    if (score !== '') {
      const perfData = {
        student_id: booking.student_id,
        booking_id: bookingId,
        subject: booking.subject,
        score: Number(score),
        engagement_level: engagement,
        recorded_at: new Date().toISOString()
      }

      if (perfId) {
        await supabase.from('student_performance').update(perfData).eq('id', perfId)
      } else {
        const { data: nPerf } = await supabase.from('student_performance').insert(perfData).select('id').single()
        if (nPerf) setPerfId(nPerf.id)
      }
    }

    if (resultError) {
      setError(resultError.message)
    } else {
      setSuccess(true)
      // Automatically hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    }
    
    setSubmitting(false)
  }

  if (loading) return <div className="min-h-screen bg-[#FDFBF7] p-12 flex justify-center text-[#0B2341] font-bold text-xl">Loading session details...</div>
  
  if (error || !booking) return (
    <div className="min-h-screen bg-[#FDFBF7] p-12">
      <div className="max-w-4xl mx-auto bg-red-50 text-red-600 p-6 rounded-lg border border-red-100 font-medium text-center">
        {error || 'Booking not found.'}
        <div className="mt-4">
          <Link href="/dashboard/tutor/bookings" className="text-blue-600 hover:underline">Return to Bookings</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-6">
          <Link href="/dashboard/tutor/bookings" className="text-[#0B2341] hover:text-[#D4A017] transition-colors flex items-center gap-2 font-bold bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 hover:shadow-md">
            &larr; Back to Bookings
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-[#0B2341] p-8 text-white relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#D4A017]"></div>
            <h1 className="text-3xl font-bold mb-2">Session Notes</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-4 text-gray-300">
              <p><span className="text-[#D4A017] font-bold">Student:</span> {booking.students?.full_name}</p>
              <p><span className="text-[#D4A017] font-bold">Subject:</span> {booking.subject}</p>
              <p><span className="text-[#D4A017] font-bold">Date:</span> {new Date(booking.date).toLocaleDateString()} at {booking.time}</p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8 sm:p-10">
            {success && <div className="text-green-700 text-sm mb-8 bg-green-50 p-4 rounded-lg border border-green-200 font-bold flex items-center gap-2">✓ Notes saved successfully!</div>}
            {error && <div className="text-red-600 text-sm mb-8 bg-red-50 p-4 rounded-lg border border-red-100 font-medium">{error}</div>}
            
            <form onSubmit={handleSaveNotes} className="space-y-6">
              
              <div>
                <label className="block text-sm font-bold text-[#0B2341] mb-2">Session Summary <span className="text-[#D4A017]">*</span></label>
                <textarea
                  required
                  rows={3}
                  className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 focus:border-[#D4A017] focus:ring-[#D4A017] shadow-sm bg-[#FDFBF7]"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="What was covered in this session?"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#0B2341] mb-2">Performance Score (0-100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 focus:border-[#D4A017] focus:ring-[#D4A017] shadow-sm bg-[#FDFBF7]"
                    value={score}
                    onChange={(e) => setScore(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 85"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#0B2341] mb-2">Engagement Level</label>
                  <select
                    className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 focus:border-[#D4A017] focus:ring-[#D4A017] shadow-sm bg-[#FDFBF7]"
                    value={engagement}
                    onChange={(e) => setEngagement(e.target.value)}
                  >
                    <option value="high">High 🔥</option>
                    <option value="medium">Medium 📖</option>
                    <option value="low">Low 😴</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#0B2341] mb-2">Strengths</label>
                  <textarea
                    rows={3}
                    className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 focus:border-[#D4A017] focus:ring-[#D4A017] shadow-sm bg-[#FDFBF7]"
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    placeholder="What did the student do well?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#0B2341] mb-2">Areas for Improvement</label>
                  <textarea
                    rows={3}
                    className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 focus:border-[#D4A017] focus:ring-[#D4A017] shadow-sm bg-[#FDFBF7]"
                    value={weaknesses}
                    onChange={(e) => setWeaknesses(e.target.value)}
                    placeholder="Where did the student struggle?"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#0B2341] mb-2">Homework Assigned</label>
                <textarea
                  rows={2}
                  className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 focus:border-[#D4A017] focus:ring-[#D4A017] shadow-sm bg-[#FDFBF7]"
                  value={homework}
                  onChange={(e) => setHomework(e.target.value)}
                  placeholder="List any homework or tasks..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#0B2341] mb-2">Parent Recommendations</label>
                <textarea
                  rows={2}
                  className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 focus:border-[#D4A017] focus:ring-[#D4A017] shadow-sm bg-[#FDFBF7]"
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  placeholder="Any advice for the parents?"
                />
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#0B2341] px-10 py-3 text-white font-bold rounded-lg hover:bg-blue-900 disabled:opacity-50 transition-all shadow-md hover:shadow-lg border-2 border-transparent hover:border-[#D4A017]"
                >
                  {submitting ? 'Saving...' : (noteId ? 'Update Notes' : 'Save Notes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

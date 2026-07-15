'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function BookSessionPage() {
  const params  = useParams()
  const tutorId = params.tutorId as string

  const [tutor,      setTutor]      = useState<any>(null)
  const [students,   setStudents]   = useState<any[]>([])
  const [parentId,   setParentId]   = useState<string>('')
  const [userId,     setUserId]     = useState<string>('')
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [agreed,     setAgreed]     = useState(false)   // ← Cancellation policy
  const [step,       setStep]       = useState(0)       // 0=form, 2=success

  // Form state
  const [studentId,    setStudentId]    = useState('')
  const [subject,      setSubject]      = useState('')
  const [date,         setDate]         = useState('')
  const [time,         setTime]         = useState('')
  const [duration,     setDuration]     = useState('60')
  const [sessionType,  setSessionType]  = useState('')
  const [notes,        setNotes]        = useState('')

  const router   = useRouter()
  const supabase = createClient()

  // ─── Load tutor + parent's students ──────────────────────────────
  useEffect(() => {
    async function fetchData() {
      if (!tutorId) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      // Parent profile + children
      const { data: parentProfile } = await supabase
        .from('parent_profiles').select('id').eq('user_id', user.id).maybeSingle()

      if (parentProfile) {
        setParentId(parentProfile.id)
        const { data: studentsData } = await supabase
          .from('students').select('id, full_name, grade').eq('parent_id', parentProfile.id)
        if (studentsData) setStudents(studentsData)
      }

      // Tutor details
      const { data: tutorData, error: tutorError } = await supabase
        .from('tutor_profiles').select('*').eq('id', tutorId).single()

      if (tutorError) setError('Could not load tutor details.')
      else setTutor(tutorData)

      setLoading(false)
    }
    fetchData()
  }, [tutorId, router, supabase])

  const calculateTotal = () => {
    if (!tutor?.price_per_hour) return 0
    return (tutor.price_per_hour / 60) * parseInt(duration)
  }

  // ─── Real booking handler ─────────────────────────────────────────
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentId || !subject || !date || !time || !sessionType) {
      setError('Please fill in all required fields.'); return
    }
    if (!agreed) {
      setError('You must agree to the cancellation policy before booking.'); return
    }

    setSubmitting(true); setError(null)

    const total = calculateTotal()

    // 1️⃣  Insert booking into Supabase (status = 'pending')
    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .insert({
        parent_id:         parentId  || null,
        student_id:        studentId || null,
        tutor_id:          tutorId,
        subject,
        date,
        time,
        duration_minutes:  parseInt(duration),
        session_type:      sessionType,
        notes:             notes || null,
        price:             total,
        status:            'pending',
        paid:              false,
      })
      .select('id')
      .single()

    if (bookingErr) {
      setError('Failed to save booking: ' + bookingErr.message)
      setSubmitting(false); return
    }

    // 2️⃣  Create Stripe Checkout session
    const res = await fetch('/api/checkout_sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: booking.id,
        tutorName: tutor.full_name,
        subject,
        price: total,
        duration: parseInt(duration),
      }),
    })

    const { url, error: stripeErr } = await res.json()

    if (stripeErr || !url) {
      setError('Payment setup failed. Your booking was saved but payment could not be initiated.')
      setSubmitting(false); return
    }

    // 3️⃣  Redirect to Stripe (or show success)
    if (url) {
      window.location.href = url
    } else {
      setStep(2)
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center items-center">
      <div className="animate-spin w-10 h-10 border-4 border-[#0B2341] border-t-transparent rounded-full mb-4"></div>
      <p className="text-[#0B2341] font-bold">Loading booking page...</p>
    </div>
  )
  
  if (error || !tutor) return (
    <div className="min-h-screen bg-[#FDFBF7] p-12 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-gray-100 text-center shadow-lg">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-[#0B2341] mb-2">Tutor Not Found</h3>
        <p className="text-gray-500 mb-6">{error || 'This tutor could not be found.'}</p>
        <Link href="/dashboard/parent/tutors" className="bg-[#0B2341] text-white px-6 py-3 rounded-xl font-bold">
          &larr; Return to Tutors
        </Link>
      </div>
    </div>
  )

  // SUCCESS STEP
  if (step === 2) return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600"></div>
        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl shadow-inner border border-green-100">
          ✅
        </div>
        <h2 className="text-3xl font-bold text-[#0B2341] mb-2">Booking Requested!</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Your request for a session with <span className="font-bold text-[#0B2341]">{tutor.full_name}</span> has been sent. The tutor will confirm the timing shortly.
        </p>
        <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-left space-y-2 border border-gray-100">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Date:</span> <span className="font-bold text-[#0B2341]">{new Date(date).toLocaleDateString()}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Time:</span> <span className="font-bold text-[#0B2341]">{time}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Subject:</span> <span className="font-bold text-[#0B2341]">{subject}</span></div>
          <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2"><span className="text-gray-500 font-bold">Est. Total:</span> <span className="font-bold text-[#D4A017]">{calculateTotal().toFixed(2)} BHD</span></div>
        </div>
        <Link href="/dashboard/parent" className="block w-full bg-[#0B2341] text-white py-4 rounded-2xl font-bold transition-all hover:bg-[#071829] shadow-md border-2 border-transparent hover:border-[#D4A017]">
          Back to Dashboard
        </Link>
      </div>
    </div>
  )

  // BOOKING FORM STEP
  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation */}
        <div className="mb-8 flex items-center gap-4">
          <button onClick={() => router.back()} className="text-[#0B2341] hover:text-[#D4A017] transition-colors flex items-center gap-2 font-bold bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-sm">
            &larr; Back
          </button>
          <h1 className="text-3xl font-bold text-[#0B2341]">Book a Session</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Form Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-[#0B2341] to-[#1a3a5c] p-8 text-white relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <h2 className="text-2xl font-bold mb-1">Session Details</h2>
                <p className="text-blue-200 text-sm">Fill in the details to request a session.</p>
              </div>

              <div className="p-8">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm flex items-center gap-3">
                    <span>⚠️</span> {error}
                  </div>
                )}
                
                <form id="booking-form" onSubmit={handleBooking} className="space-y-6">
                  
                  {/* Student Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0B2341] mb-2">Select Student <span className="text-red-500">*</span></label>
                    {students.length > 0 ? (
                      <select required value={studentId} onChange={(e) => setStudentId(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/10 outline-none transition-all">
                        <option value="">-- Choose a child --</option>
                        {students.map(s => (
                          <option key={s.id} value={s.id}>{s.full_name} ({s.grade})</option>
                        ))}
                      </select>
                    ) : (
                      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-center justify-between">
                        <p className="text-amber-800 text-sm font-medium">You need to add a child first.</p>
                        <Link href="/dashboard/parent/add-child" className="text-[#D4A017] font-bold text-sm bg-white px-3 py-1.5 rounded-lg shadow-sm border border-amber-200 hover:bg-amber-50 transition-colors">Add Child</Link>
                      </div>
                    )}
                  </div>

                  {/* Subject Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0B2341] mb-2">Subject <span className="text-red-500">*</span></label>
                    {tutor.subjects && tutor.subjects.length > 0 ? (
                      <select required value={subject} onChange={(e) => setSubject(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/10 outline-none transition-all">
                        <option value="">-- Select Subject --</option>
                        {tutor.subjects.map((sub: string) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    ) : (
                      <input type="text" required placeholder="e.g. Mathematics" value={subject} onChange={(e) => setSubject(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/10 outline-none transition-all" />
                    )}
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#0B2341] mb-2">Date <span className="text-red-500">*</span></label>
                      <input type="date" required min={new Date().toISOString().split('T')[0]} value={date} onChange={(e) => setDate(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/10 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0B2341] mb-2">Time <span className="text-red-500">*</span></label>
                      <input type="time" required value={time} onChange={(e) => setTime(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/10 outline-none transition-all" />
                    </div>
                  </div>

                  {/* Duration & Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#0B2341] mb-2">Duration <span className="text-red-500">*</span></label>
                      <select required value={duration} onChange={(e) => setDuration(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/10 outline-none transition-all">
                        <option value="60">1 Hour</option>
                        <option value="90">1.5 Hours</option>
                        <option value="120">2 Hours</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0B2341] mb-2">Format <span className="text-red-500">*</span></label>
                      <select required value={sessionType} onChange={(e) => setSessionType(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/10 outline-none transition-all">
                        <option value="">-- Choose Type --</option>
                        {tutor.session_types && tutor.session_types.length > 0 ? (
                          tutor.session_types.map((method: string) => (
                            <option key={method} value={method}>{method.charAt(0).toUpperCase() + method.slice(1)}</option>
                          ))
                        ) : (
                          <>
                            <option value="online">Online</option>
                            <option value="in_person">In Person</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0B2341] mb-2">Message to Tutor <span className="text-gray-400 font-normal">(optional)</span></label>
                    <textarea rows={3} placeholder="Briefly describe what you'd like to focus on..." value={notes} onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/10 outline-none transition-all resize-none" />
                  </div>

                  {/* ── Cancellation Policy ── */}
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <h4 className="font-bold text-amber-800 text-sm mb-2">⚠️ Cancellation Policy</h4>
                    <p className="text-xs text-amber-700 leading-relaxed mb-3">
                      Cancellations made <strong>less than 24 hours</strong> before the session will not be refunded.
                      Cancellations made <strong>more than 24 hours</strong> in advance will receive a full refund to your wallet.
                      No-shows are non-refundable.
                    </p>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={e => setAgreed(e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-[#D4A017] cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-amber-800">
                        I have read and agree to the cancellation policy above.
                      </span>
                    </label>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar / Receipt */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6 border-b border-gray-100 pb-3">Booking Summary</h3>
              
              <div className="flex items-center gap-4 mb-6">
                {tutor.avatar_url ? (
                  <img src={tutor.avatar_url} alt={tutor.full_name} className="w-16 h-16 rounded-2xl object-cover border border-gray-100" />
                ) : (
                  <div className="w-16 h-16 bg-[#0B2341] text-[#D4A017] rounded-2xl flex items-center justify-center font-bold text-2xl shadow-inner border border-[#D4A017]/20">
                    {tutor.full_name?.charAt(0).toUpperCase() || 'T'}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-[#0B2341] leading-tight mb-1">{tutor.full_name}</h4>
                  <div className="text-sm text-gray-500 font-medium">{tutor.price_per_hour} BHD / hr</div>
                </div>
              </div>

              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-semibold text-[#0B2341]">{date ? new Date(date).toLocaleDateString() : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time</span>
                  <span className="font-semibold text-[#0B2341]">{time || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-semibold text-[#0B2341]">{parseInt(duration)/60} hr(s)</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 mb-8">
                <div className="flex justify-between items-end mb-1">
                  <span className="font-bold text-[#0B2341]">Total Estimate</span>
                  <span className="text-3xl font-black text-[#D4A017]">{calculateTotal().toFixed(2)}</span>
                </div>
                <div className="text-right text-xs text-gray-400 font-semibold">BHD (Bahraini Dinar)</div>
              </div>

              <button
                form="booking-form"
                type="submit"
                disabled={submitting || students.length === 0}
                className="w-full bg-[#0B2341] text-white py-4 rounded-2xl font-bold transition-all shadow-md hover:shadow-xl hover:bg-[#071829] border-2 border-transparent hover:border-[#D4A017] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Processing...
                  </>
                ) : 'Request Session →'}
              </button>
              
              <p className="text-center text-xs text-gray-400 mt-4 leading-relaxed">
                You won't be charged yet. The tutor will review and accept your request first.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

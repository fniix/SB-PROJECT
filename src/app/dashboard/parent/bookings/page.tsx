'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ParentBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchBookings() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // 1. Get Parent Profile
      const { data: ppData, error: ppError } = await supabase
        .from('parent_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (ppError || !ppData) {
        setError('Could not load parent profile.')
        setLoading(false)
        return
      }

      // 2. Fetch Bookings with Student data
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          students ( full_name )
        `)
        .eq('parent_id', ppData.id)
        .order('date', { ascending: false })

      if (bookingsError) {
        setError('Could not load bookings.')
        setLoading(false)
        return
      }

      // 3. Fetch Tutor Names from the tutor_directory view
      if (bookingsData && bookingsData.length > 0) {
        const tutorIds = [...new Set(bookingsData.map(b => b.tutor_id))]
        const { data: tutorsData } = await supabase
          .from('tutor_directory')
          .select('tutor_profile_id, full_name')
          .in('tutor_profile_id', tutorIds)

        const tutorMap = new Map()
        if (tutorsData) {
          tutorsData.forEach(t => tutorMap.set(t.tutor_profile_id, t.full_name))
        }

        const enrichedBookings = bookingsData.map(b => ({
          ...b,
          tutor_name: tutorMap.get(b.tutor_id) || 'Unknown Tutor'
        }))
        
        setBookings(enrichedBookings)
      } else {
        setBookings([])
      }
      
      setLoading(false)
    }

    fetchBookings()
  }, [router, supabase])

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this session?')) return
    
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)

    if (error) {
      alert('Error cancelling booking: ' + error.message)
    } else {
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': return <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full border border-yellow-200">Pending</span>
      case 'accepted': return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">Upcoming</span>
      case 'completed': return <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full border border-green-200">Completed</span>
      case 'cancelled': 
      case 'rejected': return <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full border border-red-200">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      default: return <span className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded-full border border-gray-200">{status}</span>
    }
  }

  if (loading) return <div className="min-h-screen bg-[#FDFBF7] p-12 flex justify-center text-[#0B2341] font-bold text-xl">Loading bookings...</div>

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 flex items-center gap-6">
          <Link href="/dashboard/parent" className="text-[#0B2341] hover:text-[#D4A017] transition-colors flex items-center gap-2 font-bold bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 hover:shadow-md">
            &larr; Back to Dashboard
          </Link>
        </div>

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#0B2341]">My Bookings</h1>
          <p className="text-gray-600 mt-2 text-lg">Manage your child's tutoring sessions.</p>
        </div>

        {error && <div className="text-red-600 text-sm mb-8 bg-red-50 p-4 rounded-lg border border-red-100 font-medium">{error}</div>}

        {bookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute left-0 top-0 w-2 h-full bg-[#0B2341]"></div>
                
                <div className="pl-4 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-[#0B2341]">{booking.subject}</h3>
                    {getStatusBadge(booking.status)}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-gray-600 mt-4">
                    <p><span className="font-bold text-[#0B2341]">Tutor:</span> {booking.tutor_name}</p>
                    <p><span className="font-bold text-[#0B2341]">Student:</span> {booking.students?.full_name}</p>
                    <p><span className="font-bold text-[#0B2341]">Date:</span> {new Date(booking.date).toLocaleDateString()} at {booking.time}</p>
                    <p><span className="font-bold text-[#0B2341]">Duration:</span> {booking.duration_minutes} mins</p>
                    <p><span className="font-bold text-[#0B2341]">Type:</span> <span className="capitalize">{booking.session_type}</span></p>
                    <p><span className="font-bold text-[#0B2341]">Price:</span> <span className="text-[#D4A017] font-bold">${booking.total_price}</span></p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full md:w-auto mt-4 md:mt-0">
                  {booking.status === 'completed' && (
                    <>
                      <Link href={`/dashboard/parent/bookings/rate/${booking.id}`} className="bg-[#D4A017] hover:bg-[#b8860b] text-white px-6 py-2 rounded-lg font-bold transition-all text-center border-2 border-transparent shadow-sm flex items-center gap-1.5 justify-center">
                        ⭐ Rate Session
                      </Link>
                      <Link href={`/dashboard/parent/reports`} className="bg-white text-[#0B2341] border-2 border-gray-200 hover:border-[#0B2341] px-6 py-2 rounded-lg font-bold transition-all text-center shadow-sm">
                        View Report
                      </Link>
                    </>
                  )}
                  {(booking.status === 'pending' || booking.status === 'accepted') && (
                    <button 
                      onClick={() => handleCancelBooking(booking.id)}
                      className="bg-white text-red-600 border-2 border-red-200 hover:bg-red-50 hover:border-red-300 px-6 py-2 rounded-lg font-bold transition-all text-center shadow-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white border border-gray-100 rounded-2xl p-16 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-[#D4A017]"></div>
            <div className="w-20 h-20 bg-[#0B2341] text-[#D4A017] rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner">
              📅
            </div>
            <h3 className="text-2xl font-bold text-[#0B2341] mb-3">No bookings yet</h3>
            <p className="text-gray-600 max-w-md mx-auto text-lg mb-8">You haven't scheduled any tutoring sessions.</p>
            <Link
              href="/dashboard/parent/tutors"
              className="text-[#D4A017] hover:text-[#b8860b] font-bold text-lg inline-flex items-center gap-2 transition-colors border-b-2 border-transparent hover:border-[#D4A017]"
            >
              <span>Find a Tutor &rarr;</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

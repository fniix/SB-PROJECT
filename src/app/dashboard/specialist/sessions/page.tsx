'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SpecialistSessionsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'upcoming' | 'history'>('pending')
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchBookings() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // 1. Get Specialist Profile
      const { data: tpData, error: tpError } = await supabase
        .from('specialist_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (tpError || !tpData) {
        setError('Could not load Specialist Profile.')
        setLoading(false)
        return
      }

      // 2. Fetch Bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          students ( full_name )
        `)
        .eq('specialist_id', tpData.id)
        .order('date', { ascending: false })

      if (bookingsError) {
        setError('Could not load bookings.')
      } else {
        setBookings(bookingsData || [])
      }
      
      setLoading(false)
    }

    fetchBookings()
  }, [router, supabase])

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    if (!window.confirm(`Are you sure you want to mark this booking as ${newStatus}?`)) return
    
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId)

    if (error) {
      alert('Error updating booking: ' + error.message)
    } else {
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b))
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FDFBF7] p-12 flex flex-col items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#D4A017] border-t-transparent rounded-full animate-spin mb-4"></div>
      <div className="text-[#0B2341] font-bold">Loading records...</div>
    </div>
  )

  const pendingBookings = bookings.filter(b => b.status === 'pending')
  const upcomingBookings = bookings.filter(b => b.status === 'accepted')
  const historyBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled' || b.status === 'rejected')

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/dashboard/specialist" className="text-gray-400 hover:text-[#D4A017] transition-colors text-sm font-bold flex items-center gap-1">
                &larr; Dashboard
              </Link>
            </div>
            <h1 className="text-3xl font-black text-[#0B2341] tracking-tight">Booking Requests</h1>
            <p className="text-gray-500 mt-1">Manage and organize your upcoming tutoring sessions.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white px-5 py-3 rounded-xl border border-gray-100 shadow-sm text-center">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Pending</p>
              <p className="text-xl font-black text-[#D4A017]">{pendingBookings.length}</p>
            </div>
            <div className="bg-white px-5 py-3 rounded-xl border border-gray-100 shadow-sm text-center">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Upcoming</p>
              <p className="text-xl font-black text-[#0B2341]">{upcomingBookings.length}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 font-medium mb-8 flex items-center gap-3">
            <span className="text-xl">⚠️</span> {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-200 mb-8 overflow-x-auto hide-scrollbar">
          {(['pending', 'upcoming', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold capitalize transition-all whitespace-nowrap border-b-2 ${
                activeTab === tab 
                  ? 'border-[#D4A017] text-[#0B2341]' 
                  : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300'
              }`}
            >
              {tab === 'history' ? 'Session History' : `${tab} Requests`}
            </button>
          ))}
        </div>

        {/* ─── PENDING TAB ─── */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            {pendingBookings.length > 0 ? (
              pendingBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Action Required</span>
                      <span className="text-gray-400 text-sm font-medium">#{booking.id.split('-')[0].toUpperCase()}</span>
                    </div>
                    <h3 className="text-xl font-bold text-[#0B2341] mb-4">{booking.subject}</h3>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Student</p>
                        <p className="text-sm font-bold text-[#0B2341]">{booking.students?.full_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Schedule</p>
                        <p className="text-sm font-bold text-[#0B2341]">{new Date(booking.date).toLocaleDateString()} · {booking.time}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Duration & Type</p>
                        <p className="text-sm font-bold text-[#0B2341] capitalize">{booking.duration_minutes}m · {booking.session_type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Total Payout</p>
                        <p className="text-sm font-black text-green-600">{booking.total_price} BHD</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col gap-3 w-full md:w-48 shrink-0">
                    <button 
                      onClick={() => handleUpdateStatus(booking.id, 'accepted')}
                      className="flex-1 bg-[#0B2341] text-white px-4 py-3 rounded-xl font-bold hover:bg-[#071829] transition-all text-sm text-center shadow-sm"
                    >
                      Accept Request
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(booking.id, 'rejected')}
                      className="flex-1 bg-white text-gray-500 border-2 border-gray-200 hover:border-red-300 hover:text-red-600 hover:bg-red-50 px-4 py-3 rounded-xl font-bold transition-all text-sm text-center"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No pending requests" desc="When students book a session with you, it will appear here for your approval." icon="📬" />
            )}
          </div>
        )}

        {/* ─── UPCOMING TAB ─── */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-md">
                  <div className="w-1.5 bg-[#D4A017] shrink-0" />
                  <div className="p-6 flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Confirmed</span>
                        <span className="text-gray-400 text-sm font-medium">#{booking.id.split('-')[0].toUpperCase()}</span>
                      </div>
                      <h3 className="text-xl font-bold text-[#0B2341] mb-4">{booking.subject}</h3>
                      
                      <div className="flex flex-wrap gap-x-8 gap-y-4">
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Student</p>
                          <p className="text-sm font-bold text-[#0B2341]">{booking.students?.full_name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Date & Time</p>
                          <p className="text-sm font-bold text-[#0B2341]">{new Date(booking.date).toLocaleDateString()} at {booking.time}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Format</p>
                          <p className="text-sm font-bold text-[#0B2341] capitalize">{booking.session_type}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full md:w-56 shrink-0 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                      <button 
                        onClick={() => handleUpdateStatus(booking.id, 'completed')}
                        className="w-full bg-[#D4A017] text-white px-4 py-3 rounded-xl font-bold hover:bg-[#b8860b] transition-all text-sm text-center shadow-sm"
                      >
                        ✓ Mark as Completed
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                        className="w-full bg-white text-gray-500 border-2 border-gray-200 hover:border-red-300 hover:text-red-600 hover:bg-red-50 px-4 py-3 rounded-xl font-bold transition-all text-sm text-center"
                      >
                        Cancel Session
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No upcoming sessions" desc="You don't have any accepted sessions scheduled at the moment." icon="📅" />
            )}
          </div>
        )}

        {/* ─── HISTORY TAB ─── */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {historyBookings.length > 0 ? (
              historyBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      booking.status === 'completed' ? 'bg-green-50 text-green-600' :
                      booking.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {booking.status === 'completed' ? '✓' : booking.status === 'cancelled' ? '✕' : '-'}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0B2341] text-base">{booking.subject}</h3>
                      <p className="text-sm text-gray-500">{booking.students?.full_name} · {new Date(booking.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 w-full md:w-auto mt-2 md:mt-0 justify-between md:justify-end pl-14 md:pl-0">
                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                      booking.status === 'completed' ? 'bg-green-50 text-green-700' :
                      booking.status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {booking.status}
                    </span>
                    
                    {booking.status === 'completed' ? (
                      <Link href={`/dashboard/specialist/notes/${booking.id}`} className="text-sm font-bold text-[#D4A017] hover:text-[#b8860b] hover:underline">
                        Review Notes &rarr;
                      </Link>
                    ) : (
                      <span className="w-24"></span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No session history" desc="Your completed, cancelled, and rejected sessions will be logged here." icon="🗂️" />
            )}
          </div>
        )}

      </div>
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

function EmptyState({ title, desc, icon }: { title: string, desc: string, icon: string }) {
  return (
    <div className="bg-white border border-gray-100 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-2xl mb-4 border border-gray-100">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-[#0B2341] mb-1">{title}</h3>
      <p className="text-gray-500 text-sm max-w-sm">{desc}</p>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function CalendarPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [role, setRole] = useState('parent')

  const supabase = createClient()
  const router = useRouter()

  const year  = currentDate.getFullYear()
  const month = currentDate.getMonth()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const userRole = user.user_metadata?.role || 'parent'
      setRole(userRole)

      if (userRole === 'parent') {
        const { data: pp } = await supabase.from('parent_profiles').select('id').eq('user_id', user.id).single()
        if (!pp) { setLoading(false); return }
        const { data } = await supabase.from('bookings').select('*, students(full_name)').eq('parent_id', pp.id).neq('status', 'cancelled').neq('status', 'rejected')
        setBookings(data || [])
      } else if (userRole === 'tutor') {
        const { data: tp } = await supabase.from('tutor_profiles').select('id').eq('user_id', user.id).single()
        if (!tp) { setLoading(false); return }
        const { data } = await supabase.from('bookings').select('*, students(full_name)').eq('tutor_id', tp.id).neq('status', 'cancelled').neq('status', 'rejected')
        setBookings(data || [])
      }
      setLoading(false)
    }
    load()
  }, [router, supabase])

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const daysInMonth  = getDaysInMonth(year, month)
  const firstDay     = getFirstDayOfMonth(year, month)

  const bookingsByDate: Record<string, any[]> = {}
  bookings.forEach(b => {
    if (!b.date) return
    const key = b.date.slice(0, 10) // YYYY-MM-DD
    if (!bookingsByDate[key]) bookingsByDate[key] = []
    bookingsByDate[key].push(b)
  })

  const todayStr = new Date().toISOString().slice(0, 10)

  const statusColor = (s: string) => {
    if (s === 'accepted')  return 'bg-blue-500'
    if (s === 'completed') return 'bg-green-500'
    if (s === 'pending')   return 'bg-amber-400'
    return 'bg-gray-400'
  }

  const selectedBookings = selectedDate ? (bookingsByDate[selectedDate] || []) : []

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-screen bg-[#F0EDE8]">
      <div className="w-12 h-12 border-4 border-[#0B2341] border-t-[#D4A017] rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F0EDE8] p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0B2341]">Session Calendar</h1>
          <p className="text-gray-500 mt-1">{bookings.length} total sessions scheduled</p>
        </div>
        <Link href={role === 'tutor' ? '/dashboard/tutor/bookings' : '/dashboard/parent/bookings'} className="bg-[#0B2341] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#071829] border-2 border-transparent hover:border-[#D4A017] transition-all">
          Manage Bookings
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Month navigation */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-[#0B2341]">
            <button onClick={prevMonth} className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors flex items-center justify-center" style={{ color: 'white' }}>‹</button>
            <h2 className="font-black text-xl" style={{ color: 'white' }}>{MONTHS[month]} {year}</h2>
            <button onClick={nextMonth} className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors flex items-center justify-center" style={{ color: 'white' }}>›</button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-bold text-gray-400 py-3">{d}</div>
            ))}
          </div>

          {/* Date grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells for first day offset */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 border-b border-r border-gray-50" />
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const dayBookings = bookingsByDate[dateStr] || []
              const isToday = dateStr === todayStr
              const isSelected = dateStr === selectedDate
              const hasBookings = dayBookings.length > 0

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={`h-20 border-b border-r border-gray-50 p-2 text-left transition-all relative ${isSelected ? 'bg-[#D4A017]/10 border-[#D4A017]' : hasBookings ? 'hover:bg-gray-50' : 'hover:bg-gray-50/50'}`}
                >
                  <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${isToday ? 'bg-[#0B2341] text-white' : isSelected ? 'text-[#D4A017]' : 'text-gray-600'}`}>
                    {day}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayBookings.slice(0, 2).map((b, bi) => (
                      <div key={bi} className={`w-full h-1.5 rounded-full ${statusColor(b.status)}`} />
                    ))}
                    {dayBookings.length > 2 && (
                      <p className="text-[9px] text-gray-400 font-bold">+{dayBookings.length - 2} more</p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="px-6 py-3 flex gap-6 border-t border-gray-100 bg-gray-50/50">
            {[
              { color: 'bg-amber-400', label: 'Pending' },
              { color: 'bg-blue-500', label: 'Accepted' },
              { color: 'bg-green-500', label: 'Completed' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full ${l.color}`} />
                <span className="text-xs text-gray-500 font-medium">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-5">
          {/* Selected Day Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-[#0B2341]/5">
              <h3 className="font-bold text-[#0B2341]">
                {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Select a date'}
              </h3>
            </div>
            <div className="divide-y divide-gray-50">
              {selectedDate ? (
                selectedBookings.length > 0 ? selectedBookings.map(b => (
                  <div key={b.id} className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${statusColor(b.status)}`} />
                      <span className="font-bold text-sm text-[#0B2341]">{b.subject}</span>
                      <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${b.status === 'accepted' ? 'bg-blue-100 text-blue-700' : b.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{b.status}</span>
                    </div>
                    {b.students?.full_name && <p className="text-xs text-gray-400 ml-4">Student: {b.students.full_name}</p>}
                    <p className="text-xs text-gray-400 ml-4 mt-0.5">🕐 {b.time} • {b.duration_minutes} min • <span className="capitalize">{b.session_type}</span></p>
                    <p className="text-xs font-bold text-green-600 ml-4 mt-0.5">${b.total_price}</p>
                  </div>
                )) : (
                  <div className="px-5 py-8 text-center">
                    <p className="text-4xl mb-2">📅</p>
                    <p className="text-sm text-gray-400">No sessions on this day</p>
                  </div>
                )
              ) : (
                <div className="px-5 py-8 text-center">
                  <p className="text-4xl mb-2">👆</p>
                  <p className="text-sm text-gray-400">Click a date to see sessions</p>
                </div>
              )}
            </div>
          </div>

          {/* Monthly Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-[#0B2341] mb-4">📊 This Month</h3>
            {(() => {
              const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
              const thisMonth = bookings.filter(b => b.date?.startsWith(monthStr))
              const confirmed  = thisMonth.filter(b => b.status === 'accepted').length
              const completed  = thisMonth.filter(b => b.status === 'completed').length
              const pending    = thisMonth.filter(b => b.status === 'pending').length
              return (
                <div className="space-y-3">
                  {[
                    { label: 'Total Sessions', value: thisMonth.length, color: 'text-[#0B2341]' },
                    { label: 'Confirmed', value: confirmed, color: 'text-blue-600' },
                    { label: 'Completed', value: completed, color: 'text-green-600' },
                    { label: 'Pending', value: pending, color: 'text-amber-600' },
                  ].map(s => (
                    <div key={s.label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                      <span className="text-sm text-gray-500">{s.label}</span>
                      <span className={`font-black text-lg ${s.color}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}

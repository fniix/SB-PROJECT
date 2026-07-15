import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export default async function BookingConfirmationPage({ params }: { params: { bookingId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      *,
      tutor:tutor_id(id, full_name),
      student:student_id(full_name, grade)
    `)
    .eq('id', params.bookingId)
    .eq('parent_id', user.id)
    .single()

  if (!booking) notFound()

  const sessionDate = booking.scheduled_at
    ? new Date(booking.scheduled_at).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'TBD'
  const sessionTime = booking.scheduled_at
    ? new Date(booking.scheduled_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : 'TBD'

  return (
    <div className="min-h-screen bg-[#F0EDE8] flex items-center justify-center p-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-lg w-full">
        {/* Success Header */}
        <div className="bg-[#0B2341] rounded-3xl p-8 text-center mb-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          <div className="relative z-10">
            <div className="w-20 h-20 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-white mb-2">Booking Confirmed! 🎉</h1>
            <p className="text-gray-300 text-sm">Your session has been booked and confirmed. The tutor has been notified.</p>
          </div>
        </div>

        {/* Session Details */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-6">
          <h2 className="font-black text-[#0B2341] text-lg mb-5 pb-3 border-b border-gray-100">Session Details</h2>
          <div className="space-y-4">
            {[
              { label: 'Booking ID', value: `#${booking.id.slice(0, 8).toUpperCase()}`, icon: '🔖' },
              { label: 'Tutor', value: booking.tutor?.full_name || 'Assigned Tutor', icon: '👨‍🏫' },
              { label: 'Student', value: booking.student?.full_name || 'Student', icon: '👧' },
              { label: 'Subject', value: booking.subject || 'General', icon: '📚' },
              { label: 'Session Type', value: booking.session_type || 'Online', icon: '💻' },
              { label: 'Date', value: sessionDate, icon: '📅' },
              { label: 'Time', value: sessionTime, icon: '🕐' },
              { label: 'Duration', value: booking.duration ? `${booking.duration} minutes` : '60 minutes', icon: '⏱️' },
              { label: 'Amount Paid', value: booking.price ? `BD ${booking.price}` : 'Paid', icon: '💳' },
              { label: 'Status', value: '✅ Confirmed', icon: '📋' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span className="text-gray-500 text-sm">{item.label}</span>
                </div>
                <span className="font-semibold text-[#0B2341] text-sm">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Join Link */}
        {booking.join_link && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mb-6 text-center">
            <p className="text-green-700 font-bold mb-3">🎥 Your Session Join Link is Ready!</p>
            <a
              href={booking.join_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-md"
            >
              Join Session
            </a>
            <p className="text-green-600 text-xs mt-3">The link will be active at session time. Add it to your calendar.</p>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-bold text-[#0B2341] mb-4">What Happens Next?</h3>
          <div className="space-y-3">
            {[
              { icon: '📧', text: 'You will receive an email confirmation with session details.' },
              { icon: '⏰', text: 'A reminder will be sent 1 hour before the session.' },
              { icon: '📊', text: 'After the session, the tutor will submit a progress report.' },
              { icon: '⭐', text: 'You can rate the session and tutor from your dashboard.' },
            ].map(step => (
              <div key={step.text} className="flex items-start gap-3">
                <span className="text-lg">{step.icon}</span>
                <p className="text-gray-500 text-sm leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/dashboard/parent/bookings" className="flex-1 bg-[#0B2341] text-white text-center py-3.5 rounded-xl font-bold hover:bg-[#071829] border-2 border-transparent hover:border-[#D4A017] transition-all">
            View My Bookings
          </Link>
          <Link href="/dashboard/parent" className="flex-1 border-2 border-[#0B2341] text-[#0B2341] text-center py-3.5 rounded-xl font-bold hover:bg-[#0B2341] hover:text-white transition-all">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

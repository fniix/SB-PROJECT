'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function TutorPendingPage() {
  const [app, setApp] = useState<{ status: string; created_at: string; full_name: string } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('tutor_applications')
        .select('status, created_at, full_name')
        .eq('user_id', user.id)
        .maybeSingle()
      setApp(data)
    }
    load()
  }, [])

  const STATUS_INFO: Record<string, { label: string; color: string; bg: string; icon: string; desc: string }> = {
    pending:      { label: 'Pending Review',   color: 'text-amber-700',  bg: 'bg-amber-50  border-amber-200',  icon: '⏳', desc: 'Your application is in the queue. Our academic team will start reviewing it shortly.' },
    under_review: { label: 'Under Review',     color: 'text-blue-700',   bg: 'bg-blue-50   border-blue-200',   icon: '🔍', desc: 'Our team is actively reviewing your documents and demo. You will hear back within 48 hours.' },
    approved:     { label: 'Approved!',        color: 'text-green-700',  bg: 'bg-green-50  border-green-200',  icon: '✅', desc: 'Congratulations! Your profile is live. Set up your availability and start accepting bookings.' },
    rejected:     { label: 'Not Approved',     color: 'text-red-700',    bg: 'bg-red-50    border-red-200',    icon: '❌', desc: 'Unfortunately your application did not meet our current requirements. Contact support for details.' },
  }

  const info = STATUS_INFO[app?.status ?? 'pending']

  const steps = [
    { label: 'Application Submitted',   done: true },
    { label: 'Documents Reviewed',      done: app?.status !== 'pending' },
    { label: 'Interview / Demo Check',  done: app?.status === 'approved' },
    { label: 'Profile Live',            done: app?.status === 'approved' },
  ]

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 justify-center">
          <img src="/assets/logo/sb_logo_dark.png" alt="SB Project" className="h-10 w-auto" />
          <p className="font-bold text-[#0B2341] text-lg">SB Project</p>
        </div>

        {/* Status Card */}
        <div className={`p-6 rounded-3xl border-2 mb-6 ${info?.bg}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm">
              {info?.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Application Status</p>
              <h1 className={`text-xl font-bold ${info?.color}`}>{info?.label}</h1>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{info?.desc}</p>
          {app?.created_at && (
            <p className="text-xs text-gray-400 mt-3">
              Submitted: {new Date(app.created_at).toLocaleDateString('en-BH', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6">
          <p className="text-sm font-bold text-[#0B2341] mb-5">Application Progress</p>
          <div className="space-y-4">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 flex-shrink-0 transition-all
                  ${s.done ? 'bg-[#D4A017] border-[#D4A017] text-white' : 'border-gray-200 text-gray-300 bg-gray-50'}`}>
                  {s.done ? '✓' : i + 1}
                </div>
                <div className="flex-1 h-px bg-gray-100 absolute" />
                <p className={`text-sm font-medium ${s.done ? 'text-[#0B2341]' : 'text-gray-400'}`}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What to expect */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6">
          <p className="text-sm font-bold text-[#0B2341] mb-4">📋 What happens next?</p>
          <div className="space-y-3">
            {[
              { icon: '📧', text: 'You will receive an email notification when your status changes.' },
              { icon: '⏱️', text: 'Review typically takes 2–3 business days.' },
              { icon: '💬', text: 'An admin may contact you via email for clarification or an interview.' },
              { icon: '🔒', text: 'Your profile will only go live after full approval.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-base flex-shrink-0">{item.icon}</span>
                <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA based on status */}
        {app?.status === 'approved' ? (
          <Link href="/dashboard/tutor" className="block w-full bg-[#0B2341] text-white font-bold py-4 rounded-2xl text-center hover:bg-[#071829] border-2 border-transparent hover:border-[#D4A017] transition-all shadow-md">
            Go to My Dashboard →
          </Link>
        ) : (
          <div className="space-y-3">
            <a
              href="https://wa.me/97300000000?text=Hi, I submitted a tutor application and want to follow up."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all shadow-md"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.114.549 4.098 1.508 5.826L0 24l6.335-1.652A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.896 0-3.668-.524-5.184-1.435l-.372-.22-3.762.982.998-3.65-.242-.376A9.964 9.964 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              Follow up via WhatsApp
            </a>
            <button
              onClick={async () => {
                await createClient().auth.signOut()
                window.location.href = '/login'
              }}
              className="w-full py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-gray-300 transition-all"
            >
              Sign Out
            </button>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          Need help? <Link href="/contact" className="text-[#D4A017] font-medium hover:underline">Contact SB Project Support</Link>
        </p>
      </div>
    </div>
  )
}

'use client'
import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B2341] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A017]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 bg-[#D4A017] rounded-xl flex items-center justify-center font-black text-white text-xl shadow-lg">S</div>
          <div>
            <p className="font-bold text-white text-xl">SB Project</p>
            <p className="text-[11px] text-[#D4A017] font-medium tracking-widest uppercase">Premium Tutoring</p>
          </div>
        </Link>
        <div className="relative z-10 space-y-6">
          <div className="text-6xl">🔑</div>
          <h2 className="text-4xl font-black text-white leading-tight">Forgot your password?</h2>
          <p className="text-gray-300 text-lg leading-relaxed">No worries. We'll send a secure reset link to your email address in seconds.</p>
        </div>
        <div className="relative z-10">
          <p className="text-gray-400 text-sm">Remembered it?{' '}
            <Link href="/login" className="text-[#D4A017] font-bold hover:underline">Sign In →</Link>
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center bg-[#F0EDE8] p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-[#0B2341] rounded-xl flex items-center justify-center text-[#D4A017] font-black">S</div>
            <span className="font-black text-[#0B2341] text-xl">SB <span className="text-[#D4A017]">Project</span></span>
          </Link>

          {sent ? (
            <div className="bg-white rounded-3xl shadow-md p-10 border border-gray-100 text-center">
              <div className="text-6xl mb-4">📧</div>
              <h2 className="text-2xl font-black text-[#0B2341] mb-2">Check Your Email</h2>
              <p className="text-gray-500 mb-6">We sent a password reset link to <strong>{email}</strong>. Click the link in the email to set a new password.</p>
              <p className="text-sm text-gray-400">Didn't receive it? Check your spam folder.</p>
              <Link href="/login" className="inline-block mt-6 bg-[#0B2341] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#071829] transition-all">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-md p-10 border border-gray-100">
              <h1 className="text-3xl font-black text-[#0B2341] mb-2">Reset Password</h1>
              <p className="text-gray-400 text-sm mb-8">Enter your email address and we'll send you a reset link.</p>

              {error && (
                <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-[#0B2341] mb-1.5">Email Address</label>
                  <input
                    required type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-[#F0EDE8] px-4 py-3.5 text-sm text-gray-800 focus:outline-none focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/20 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0B2341] text-white py-4 rounded-xl font-black text-base hover:bg-[#071829] border-2 border-transparent hover:border-[#D4A017] transition-all shadow-md disabled:opacity-60"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="text-center mt-6">
                <Link href="/login" className="text-sm text-gray-400 hover:text-[#0B2341] font-semibold transition-colors">
                  ← Back to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

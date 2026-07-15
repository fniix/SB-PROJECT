'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const ROLE_PATHS: Record<string, string> = {
  parent:      '/dashboard/parent',
  beneficiary: '/dashboard/beneficiary',
  specialist:  '/dashboard/specialist',
  admin:       '/dashboard/admin',
}

// ─── Stats data ───────────────────────────────────────────────────
const stats = [
  { value: '500+', label: 'Specialists' },
  { value: '12K+', label: 'Sessions Done' },
  { value: '4.9★', label: 'Avg Rating' },
]

// ─── Features ─────────────────────────────────────────────────────
const features = [
  { icon: '🎯', title: 'Personalized IEPs',  desc: 'Individualized Education Plans tailored to each beneficiary.' },
  { icon: '🏆', title: 'Verified Experts',   desc: 'Highly vetted and qualified professionals.' },
  { icon: '📊', title: 'Progress Tracking',  desc: 'Real-time reports and milestone updates.' },
]

function LoginForm() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)

  const router       = useRouter()
  const searchParams = useSearchParams()
  const supabase     = createClient()
  const notice       = searchParams?.get('notice')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) { setError(signInError.message); setLoading(false); return }

    if (data.user) {
      // Use window.location.replace for a full page navigation to avoid
      // Next.js client-side router "Failed to fetch" errors when crossing auth boundaries.
      const role = data.user.user_metadata?.role || 'parent'
      const destination = ROLE_PATHS[role] || '/dashboard/parent'
      window.location.replace(destination)
    }
  }


  return (
    <div className="min-h-screen flex bg-white font-sans">

      {/* ══════════════════════════════════════════
          LEFT PANEL — Brand / Visual
      ══════════════════════════════════════════ */}
      <div className="hidden lg:flex w-[52%] shrink-0 relative flex-col justify-between p-14 overflow-hidden"
           style={{ background: 'linear-gradient(145deg, #061C30 0%, #0B2341 50%, #122E52 100%)' }}>

        {/* Decorative blobs */}
        <div className="pointer-events-none absolute top-0 right-0 w-[520px] h-[520px] rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(212,160,23,0.15) 0%, transparent 70%)', transform: 'translate(40%, -40%)' }} />
        <div className="pointer-events-none absolute bottom-0 left-0 w-[360px] h-[360px] rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)', transform: 'translate(-30%, 35%)' }} />
        {/* Gold accent line */}
        <div className="pointer-events-none absolute top-0 left-0 w-1 h-full"
             style={{ background: 'linear-gradient(to bottom, transparent, #D4A017, transparent)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-4">
          <img src="/assets/logo/sb_logo_light.png" alt="SB Project" className="h-12 w-auto drop-shadow-lg" />
          <div>
            <p className="font-extrabold text-xl text-white leading-tight tracking-tight">SB Project</p>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#0B2341] bg-white px-2 py-0.5 rounded-full inline-block mt-1">Special Needs Support</p>
          </div>
        </div>

        {/* Headline + Features */}
        <div className="relative z-10 max-w-md space-y-10 mt-10">
          <div>
            <h1 className="text-5xl font-black leading-[1.1] text-white mb-5">
              <span className="text-white">Empowering</span><br />
              <span style={{ color: '#ffffff' }}>Capabilities</span>{' '}
              <span className="text-[#0B2341] bg-[#D4A017] px-2">Every Day.</span>
            </h1>
            <p className="text-base text-slate-300 leading-relaxed max-w-sm">
              Log in to access your dashboard, track progress, manage therapy sessions, and connect with specialized care providers.
            </p>
          </div>

          {/* Feature cards */}
          <div className="space-y-4">
            {features.map(f => (
              <div key={f.title} className="flex gap-4 items-start p-4 rounded-2xl"
                   style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                     style={{ background: 'rgba(212,160,23,0.15)' }}>
                  {f.icon}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{f.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            {stats.map(s => (
              <div key={s.label} className="text-center p-3 rounded-2xl"
                   style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-2xl font-black text-[#D4A017]">{s.value}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-slate-500 font-medium">
          © {new Date().getFullYear()} SB Project. Special Needs Support.
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT PANEL — Form
      ══════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col relative bg-white">

        {/* Mobile logo bar */}
        <div className="lg:hidden flex items-center gap-3 p-5 border-b border-gray-100">
          <img src="/assets/logo/sb_logo_dark.png" alt="SB Project" className="h-9 w-auto" />
          <div>
            <p className="font-extrabold text-[#0B2341] text-base leading-tight">SB Project</p>
            <p className="text-[9px] font-bold text-gray-500 tracking-[0.2em] uppercase">Special Needs Support</p>
          </div>
        </div>

        {/* Back link */}
        <div className="absolute top-6 right-7 hidden sm:block">
          <Link href="/" className="text-xs font-semibold text-gray-400 hover:text-[#0B2341] transition-colors flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
            Back to Website
          </Link>
        </div>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-12">
          <div className="w-full max-w-[400px]">

            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-3xl font-black text-[#0B2341] leading-tight">Sign in to<br />your account</h2>
              <p className="text-gray-400 text-sm mt-2">Enter your credentials below to continue</p>
            </div>

            {/* Notice */}
            {notice && (
              <div className="mb-5 flex gap-3 items-center p-4 rounded-2xl text-sm font-medium text-teal-800 bg-teal-50 border border-teal-100">
                <span>✅</span> {notice}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-5 flex gap-3 items-start p-4 rounded-2xl text-sm bg-red-50 border border-red-100 text-red-700">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Google */}
              <button type="button"
                onClick={() => setError('Social login requires production domain. Use email.')}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-gray-700 transition-all hover:shadow-md active:scale-95"
                style={{ background: 'white', border: '1.5px solid #e5e7eb' }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              {/* Apple */}
              <button type="button"
                onClick={() => setError('Social login requires production domain. Use email.')}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-gray-700 transition-all hover:shadow-md active:scale-95"
                style={{ background: 'white', border: '1.5px solid #e5e7eb' }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-1.2.52-2.34 1.23-3.18.724-.87 1.88-1.46 2.955-1.48.025.14.03.28.03.44zm-3.32 6.01c-.05 2.19 1.83 3.12 1.9 3.16-.01.03-.3 1.02-1.04 2.1-.66.97-1.35 1.93-2.43 1.96-1.06.02-1.4-.63-2.62-.63-1.23 0-1.6.61-2.6.65-1.04.04-1.84-1.04-2.5-2.01-1.34-1.93-2.37-5.46-1.68-7.85.34-1.18 1.14-2.18 2.2-2.73 1.02-.53 2.15-.55 3.14-.55 1.1 0 2.13.75 2.83.75.72 0 1.92-.88 3.25-.75 1.37.13 2.62.7 3.37 1.8-3.03 1.8-2.58 5.75-.43 6.64v.02z" />
                </svg>
                Apple
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-xs text-gray-400 font-semibold tracking-wide uppercase">or continue with email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-[#0B2341] mb-1.5 tracking-wide uppercase">Email Address</label>
                <input
                  type="email" required placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:bg-white focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/10"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-[#0B2341] tracking-wide uppercase">Password</label>
                  <Link href="/forgot-password" className="text-xs font-bold text-[#D4A017] hover:text-[#b8860b] transition-colors">Forgot?</Link>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} required placeholder="••••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-4 pr-12 py-3.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:bg-white focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/10"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0B2341] transition-colors">
                    {showPass ? (
                      <svg className="w-4.5 h-4.5 w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit" disabled={loading}
                className="w-full mt-2 py-4 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg"
                style={{ background: loading ? '#1e3a5f' : 'linear-gradient(135deg, #0B2341 0%, #1a3a5c 100%)', boxShadow: loading ? 'none' : '0 8px 24px rgba(11,35,65,0.3)' }}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in...
                  </>
                ) : 'Sign In →'}
              </button>
            </form>

            {/* Sign up link */}
            <div className="mt-7 text-center">
              <p className="text-sm text-gray-400">
                Don't have an account?{' '}
                <Link href="/register" className="font-bold text-[#D4A017] hover:text-[#b8860b] transition-colors">
                  Create account
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>

    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-8 h-8 animate-spin text-[#D4A017]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p className="text-sm text-gray-400 font-medium animate-pulse">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

'use client'
import Link from 'next/link'
import { useState } from 'react'

const navLinks = [
  { href: '/about', label: 'About' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/school-students', label: 'School Students' },
  { href: '/special-needs', label: 'Special Needs' },
  { href: '/pricing', label: 'Pricing' },
]

export default function PublicNav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/assets/logo/sb_logo_dark.png" alt="SB Project Logo" className="h-10 w-auto" />
          <span className="font-bold text-xl text-[#0B2341] tracking-tight">SB Project</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-semibold text-gray-500">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} className="hover:text-[#0B2341] transition-colors">{l.label}</Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Link href="/faq" className="text-sm font-semibold text-gray-500 hover:text-[#0B2341] transition-colors px-3 py-2">FAQ</Link>
          <Link href="/contact" className="text-sm font-semibold text-gray-500 hover:text-[#0B2341] transition-colors px-3 py-2">Contact</Link>
          <Link href="/login" className="text-sm font-semibold text-[#0B2341] hover:text-[#D4A017] transition-colors px-4 py-2">Sign In</Link>
          <Link href="/register" className="bg-[#0B2341] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#071829] border-2 border-transparent hover:border-[#D4A017] transition-all shadow-md">
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="lg:hidden p-2 rounded-lg text-[#0B2341]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-gray-100 py-4 px-6 space-y-2">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-2 text-sm font-semibold text-gray-600 hover:text-[#0B2341]">{l.label}</Link>
          ))}
          <Link href="/faq" onClick={() => setOpen(false)} className="block py-2 text-sm font-semibold text-gray-600 hover:text-[#0B2341]">FAQ</Link>
          <Link href="/contact" onClick={() => setOpen(false)} className="block py-2 text-sm font-semibold text-gray-600 hover:text-[#0B2341]">Contact</Link>
          <div className="pt-3 flex gap-3">
            <Link href="/login" className="flex-1 text-center py-2.5 border-2 border-[#0B2341] text-[#0B2341] rounded-xl text-sm font-bold">Sign In</Link>
            <Link href="/register" className="flex-1 text-center py-2.5 bg-[#0B2341] text-white rounded-xl text-sm font-bold">Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  )
}

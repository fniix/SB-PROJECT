'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ChatbotWidget from '@/components/chatbot/ChatbotWidget'
import ThemeToggle from '@/components/ThemeToggle'
import { useTheme } from '@/components/ThemeProvider'
import StudentPlayfulDashboard from '@/components/StudentPlayfulDashboard'

// ============ Icons ============
const IconDashboard  = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
const IconChildren   = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const IconSpecialist = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.7 4 3 6 3s6-1.3 6-3v-5"/></svg>
const IconSessions   = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const IconReports    = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
const IconNotes      = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IconSettings   = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
const IconAnalytics  = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
const IconLogout     = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const IconMenu       = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
const IconClose      = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconBell       = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
const IconAI         = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M8 11V9M16 11V9"/><path d="M7 21v-1M17 21v-1"/></svg>
const IconCal        = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
const IconGames      = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h4M8 10v4"/><circle cx="15" cy="11" r="1"/><circle cx="18" cy="14" r="1"/></svg>
const IconLibrary    = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
const IconReward     = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
const IconAssign     = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg>

// ============ Nav Links by Role ============
const parentLinks = [
  { href: '/dashboard/parent',              label: 'Dashboard',    icon: IconDashboard },
  { href: '/dashboard/parent/beneficiaries',label: 'My Heroes',    icon: IconChildren  },
  { href: '/dashboard/parent/specialists',  label: 'Specialists',  icon: IconSpecialist},
  { href: '/dashboard/parent/smart-match',  label: 'AI Match',     icon: IconAI        },
  { href: '/dashboard/parent/sessions',     label: 'Sessions',     icon: IconSessions  },
  { href: '/dashboard/parent/iep',          label: 'IEP Plans',    icon: IconReports   },
  { href: '/dashboard/parent/games',        label: 'Games',        icon: IconGames     },
  { href: '/dashboard/parent/library',      label: 'Library',      icon: IconLibrary   },
  { href: '/dashboard/parent/rewards',      label: 'Rewards',      icon: IconReward    },
  { href: '/dashboard/parent/reports',      label: 'Reports',      icon: IconAnalytics },
  { href: '/dashboard/parent/assignments',  label: 'Assignments',  icon: IconAssign    },
  { href: '/dashboard/parent/wallet',       label: 'Wallet',       icon: IconSessions  },
  { href: '/dashboard/notifications',       label: 'Notifications',icon: IconBell      },
]

const specialistLinks = [
  { href: '/dashboard/specialist',          label: 'Dashboard',    icon: IconDashboard },
  { href: '/dashboard/specialist/sessions', label: 'Sessions',     icon: IconSessions  },
  { href: '/dashboard/calendar',            label: 'Calendar',     icon: IconCal       },
  { href: '/dashboard/specialist/patients', label: 'Beneficiaries',icon: IconChildren  },
  { href: '/dashboard/specialist/iep',      label: 'IEP Mgmt',     icon: IconReports   },
  { href: '/dashboard/specialist/earnings', label: 'Earnings',     icon: IconSessions  },
  { href: '/dashboard/specialist/settings', label: 'Profile',      icon: IconSettings  },
  { href: '/dashboard/notifications',       label: 'Notifications',icon: IconBell      },
]

const adminLinks = [
  { href: '/dashboard/admin',               label: 'Overview',     icon: IconDashboard },
  { href: '/dashboard/admin/users',         label: 'Users',        icon: IconChildren  },
  { href: '/dashboard/admin/verifications', label: 'Verifications',icon: IconSpecialist},
  { href: '/dashboard/admin/analytics',     label: 'Analytics',    icon: IconAnalytics },
]

const beneficiaryLinks = [
  { href: '/dashboard/beneficiary',          label: 'Dashboard',    icon: IconDashboard },
  { href: '/dashboard/beneficiary/sessions', label: 'My Sessions',  icon: IconSessions  },
  { href: '/dashboard/beneficiary/progress', label: 'My Progress',  icon: IconReports   },
  { href: '/dashboard/notifications',        label: 'Notifications',icon: IconBell      },
]

// ============ Sidebar Component ============
function Sidebar({ role, userName, userInitial, onClose }: { role: string; userName: string; userInitial: string; onClose?: () => void }) {
  const pathname = usePathname()
  const supabase = createClient()
  const links = role === 'specialist' ? specialistLinks : role === 'admin' ? adminLinks : role === 'beneficiary' ? beneficiaryLinks : parentLinks

  const roleLabel = role === 'specialist' ? 'Specialist' : role === 'admin' ? 'Admin' : role === 'beneficiary' ? 'Beneficiary' : 'Parent'
  const roleBg = role === 'specialist' ? 'bg-[#1a3a5c]' : role === 'admin' ? 'bg-purple-500' : role === 'beneficiary' ? 'bg-[#2a9d8f]' : 'bg-[#0B2341]'

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img src="/assets/logo/sb_logo_dark.png" alt="SB Project Logo" className="h-10 w-auto" />
          <div>
            <p className="font-bold text-[#0B2341] text-lg leading-none">SB Project</p>
            <p className="text-[10px] text-gray-500 font-medium tracking-widest uppercase mt-0.5">
              Special Needs Support
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-[#0B2341] md:hidden">
            <IconClose />
          </button>
        )}
      </div>

      {/* User Profile */}
      <div className="px-4 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
          <div className={`w-10 h-10 ${roleBg} rounded-full flex items-center justify-center font-bold text-white text-base shadow-sm shrink-0`}>
            {userInitial}
          </div>
          <div className="min-w-0">
            <p className="text-[#0B2341] font-semibold text-sm truncate">{userName}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${roleBg}`}>
              {roleLabel}
            </span>
          </div>
        </div>
        {role === 'parent' && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <ThemeToggle />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-3">Menu</p>
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== `/dashboard/${role}` && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-[#0B2341]/5 text-[#0B2341] shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <span className={isActive ? 'text-[#0B2341]' : 'text-gray-400'}><Icon /></span>
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 py-5 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all text-left"
        >
          <IconLogout />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}

// ============ Main Layout ============
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  const [role, setRole] = useState('parent')
  const [userName, setUserName] = useState('User')
  const [userInitial, setUserInitial] = useState('U')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const supabase = createClient()
  const pathname = usePathname()

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const userRole = user.user_metadata?.role || 'parent'
      setRole(userRole)

      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
      setUserName(name)
      setUserInitial(name.charAt(0).toUpperCase())
      setIsLoaded(true)
    }
    loadUser()
  }, [supabase])

  return (
    <div className="flex h-screen bg-[#F3F4F6] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-64 shrink-0 hidden md:block shadow-sm z-10">
        <Sidebar role={role} userName={userName} userInitial={userInitial} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 h-full shadow-2xl z-10">
            <Sidebar role={role} userName={userName} userInitial={userInitial} onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shrink-0 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-500 hover:text-[#0B2341] transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <IconMenu />
            </button>
            <div className="hidden md:block">
              <p className="text-sm text-gray-500 font-medium">
                Welcome back, <span className="text-[#0B2341] font-semibold">{userName}</span> 👋
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard/notifications" className="relative p-2 text-gray-400 hover:text-[#0B2341] hover:bg-gray-50 rounded-lg transition-all">
              <IconBell />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </Link>
            <div className="w-9 h-9 bg-[#0B2341] rounded-full flex items-center justify-center font-bold text-white text-sm shadow-sm">
              {userInitial}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {theme === 'student' && (pathname === '/dashboard/parent' || pathname === '/dashboard/beneficiary') ? (
            <StudentPlayfulDashboard />
          ) : (
            children
          )}
        </main>
      </div>

      {/* Global Chatbot Widget */}
      <ChatbotWidget />
    </div>
  )
}

'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────
export type ThemeMode = 'parent' | 'student'

interface ThemeContextType {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'parent',
  setTheme: () => {},
  toggleTheme: () => {},
})

export const useTheme = () => useContext(ThemeContext)

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('parent')
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  // Load saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('sb-theme') as ThemeMode | null
    if (saved === 'parent' || saved === 'student') {
      setThemeState(saved)
    }
    setMounted(true)
  }, [])

  // Apply theme to <html> element
  useEffect(() => {
    if (!mounted) return
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('sb-theme', theme)
  }, [theme, mounted])

  // Set theme and sync to Supabase profile
  const setTheme = useCallback(async (newTheme: ThemeMode) => {
    setThemeState(newTheme)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.auth.updateUser({
          data: { theme_preference: newTheme }
        })
      }
    } catch {
      // Silently fail — localStorage is the primary store
    }
  }, [supabase])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'parent' ? 'student' : 'parent')
  }, [theme, setTheme])

  // Load theme from user profile on auth
  useEffect(() => {
    async function syncFromProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.theme_preference) {
        const pref = user.user_metadata.theme_preference as ThemeMode
        if (pref === 'parent' || pref === 'student') {
          setThemeState(pref)
        }
      }
    }
    syncFromProfile()
  }, [supabase])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

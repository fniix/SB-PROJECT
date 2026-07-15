'use client'

import { useTheme } from './ThemeProvider'
import { motion } from 'framer-motion'

interface ThemeToggleProps {
  compact?: boolean
  className?: string
}

export default function ThemeToggle({ compact = false, className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isStudent = theme === 'student'

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
          isStudent
            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/25'
            : 'bg-[#0B2341]/10 text-[#0B2341] hover:bg-[#0B2341]/15'
        } ${className}`}
        title={isStudent ? 'Switch to Parent Mode' : 'Switch to Student Mode'}
      >
        <span className="text-sm">{isStudent ? '🚀' : '👨‍👩‍👧'}</span>
        <span className="hidden sm:inline">{isStudent ? 'Hero Mode' : 'Parent Mode'}</span>
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className={`group relative flex items-center gap-3 w-full rounded-2xl p-3 transition-all duration-300 ${
        isStudent
          ? 'bg-gradient-to-r from-purple-600/10 to-indigo-600/10 border-2 border-purple-500/30 hover:border-purple-500/50'
          : 'bg-[#D4A017]/5 border-2 border-[#D4A017]/20 hover:border-[#D4A017]/40'
      } ${className}`}
    >
      {/* Toggle Track */}
      <div className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
        isStudent ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-[#0B2341]'
      }`}>
        <motion.div
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center text-xs"
          animate={{ left: isStudent ? '26px' : '2px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {isStudent ? '🚀' : '🏠'}
        </motion.div>
      </div>

      {/* Label */}
      <div className="text-left">
        <p className={`text-xs font-bold transition-colors duration-300 ${
          isStudent ? 'text-purple-700' : 'text-[#0B2341]'
        }`}>
          {isStudent ? 'Student Hero Mode' : 'Parent Mode'}
        </p>
        <p className="text-[10px] text-gray-400">
          {isStudent ? 'Playful, gamified, fun' : 'Professional, calm, clear'}
        </p>
      </div>
    </button>
  )
}

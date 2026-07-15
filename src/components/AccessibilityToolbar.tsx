'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export default function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false)

  // Settings
  const [fontSize, setFontSize] = useState(100)
  const [highContrast, setHighContrast] = useState(false)
  const [dyslexicFont, setDyslexicFont] = useState(false)
  const [focusMode, setFocusMode] = useState(false)       // ADHD — removes distractions
  const [reduceMotion, setReduceMotion] = useState(false) // Autism — no animations
  const [ttsEnabled, setTtsEnabled] = useState(false)     // Text-to-Speech
  const [isSpeaking, setIsSpeaking] = useState(false)

  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis
    }
  }, [])

  // Apply Settings via CSS classes & variables
  useEffect(() => {
    const root = document.documentElement
    root.style.fontSize = `${fontSize}%`

    const body = document.body
    body.classList.toggle('high-contrast', highContrast)
    body.classList.toggle('dyslexic-font', dyslexicFont)
    body.classList.toggle('focus-mode', focusMode)
    body.classList.toggle('reduce-motion', reduceMotion)
  }, [fontSize, highContrast, dyslexicFont, focusMode, reduceMotion])

  // TTS: click-to-read
  const handleSpeak = useCallback((text: string) => {
    if (!synthRef.current || !ttsEnabled) return
    synthRef.current.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = document.documentElement.lang === 'ar' ? 'ar-SA' : 'en-US'
    utterance.rate = 0.9
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    synthRef.current.speak(utterance)
  }, [ttsEnabled])

  // When TTS enabled, clicking any readable element reads it aloud
  useEffect(() => {
    if (!ttsEnabled) {
      synthRef.current?.cancel()
      setIsSpeaking(false)
      return
    }

    const handler = (e: MouseEvent) => {
      const el = e.target as HTMLElement
      const text = el.innerText?.trim()
      if (text && text.length > 1 && text.length < 800) {
        handleSpeak(text)
      }
    }

    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [ttsEnabled, handleSpeak])

  const resetAll = () => {
    setFontSize(100)
    setHighContrast(false)
    setDyslexicFont(false)
    setFocusMode(false)
    setReduceMotion(false)
    setTtsEnabled(false)
    synthRef.current?.cancel()
  }

  const Toggle = ({
    label, sub, icon, value, onChange, color = '#0B2341',
  }: {
    label: string; sub?: string; icon: string; value: boolean
    onChange: (v: boolean) => void; color?: string
  }) => (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span className="text-xl">{icon}</span>
        <div>
          <p className="text-sm font-bold text-gray-800">{label}</p>
          {sub && <p className="text-[11px] text-gray-400 leading-tight">{sub}</p>}
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className="relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 flex-shrink-0"
        style={{ backgroundColor: value ? color : '#D1D5DB' }}
        aria-pressed={value}
        aria-label={`Toggle ${label}`}
      >
        <div
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200"
          style={{ left: value ? '28px' : '4px' }}
        />
      </button>
    </div>
  )

  return (
    <>
      {/* Floating Accessibility Button */}
      <button
        data-a11y-toolbar
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-[9999] w-14 h-14 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 border-2 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
        style={{
          background: 'linear-gradient(135deg, #0B2341 0%, #1a3a5c 100%)',
          borderColor: (highContrast || dyslexicFont || focusMode || reduceMotion || ttsEnabled)
            ? '#D4A017'
            : 'rgba(255,255,255,0.3)',
        }}
        aria-label="Open Accessibility Options"
        aria-expanded={isOpen}
      >
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.5 0-5 .8-5 .8l1 4.2h8l1-4.2S14.5 8 12 8z"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 13l-1.5 5M15 13l1.5 5M12 13v5"/>
        </svg>
        {/* Active indicator — always visible even in high-contrast */}
        {(highContrast || dyslexicFont || focusMode || reduceMotion || ttsEnabled) && (
          <span
            data-a11y-toolbar
            className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 flex items-center justify-center text-[10px] font-black rounded-full border-2 border-white"
            style={{ backgroundColor: '#D4A017', color: '#000' }}
          >
            {[highContrast, dyslexicFont, focusMode, reduceMotion, ttsEnabled].filter(Boolean).length}
          </span>
        )}
      </button>

      {/* Toolbar Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 left-6 z-50 w-80 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          style={{ background: '#ffffff' }}
          role="dialog"
          aria-label="Accessibility Settings"
        >
          {/* Header */}
          <div className="px-5 py-4 flex justify-between items-center"
            style={{ background: 'linear-gradient(135deg, #0B2341 0%, #1a3a5c 100%)' }}>
            <div className="flex items-center gap-2.5">
              <span className="text-xl">♿</span>
              <div>
                <h3 className="text-white font-bold text-sm">Accessibility</h3>
                <p className="text-blue-200 text-[10px]">Settings</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div className="p-4 space-y-4">

            {/* Font Size */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">🔤</span>
                <p className="text-sm font-bold text-gray-800">Text Size</p>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-2">
                <button
                  onClick={() => setFontSize(s => Math.max(80, s - 10))}
                  className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-50 shadow-sm text-sm"
                  aria-label="Decrease font size"
                >A−</button>
                <div className="flex-1 text-center">
                  <span className="text-sm font-bold text-[#0B2341]">{fontSize}%</span>
                  <div className="h-1 bg-gray-200 rounded-full mt-1">
                    <div
                      className="h-full bg-[#D4A017] rounded-full transition-all"
                      style={{ width: `${((fontSize - 80) / 70) * 100}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => setFontSize(s => Math.min(150, s + 10))}
                  className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-50 shadow-sm text-sm"
                  aria-label="Increase font size"
                >A+</button>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Toggles */}
            <div className="space-y-3.5">
              <Toggle
                icon="🎨" label="High Contrast" sub="For visually impaired"
                value={highContrast} onChange={setHighContrast}
              />
              <Toggle
                icon="📖" label="Dyslexia Font" sub="Easier reading"
                value={dyslexicFont} onChange={setDyslexicFont}
              />
              <Toggle
                icon="🧘" label="Focus Mode (ADHD)" sub="Hide distractions"
                value={focusMode} onChange={setFocusMode} color="#7C3AED"
              />
              <Toggle
                icon="🌿" label="Reduce Motion" sub="Stop animations (Autism)"
                value={reduceMotion} onChange={setReduceMotion} color="#059669"
              />
            </div>

            <div className="border-t border-gray-100" />

            {/* TTS */}
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{isSpeaking ? '🔊' : '🔈'}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Read Text Aloud</p>
                    <p className="text-[11px] text-gray-500">Text-to-Speech</p>
                  </div>
                </div>
                <button
                  onClick={() => setTtsEnabled(v => !v)}
                  className="relative w-12 h-6 rounded-full transition-colors duration-200"
                  style={{ backgroundColor: ttsEnabled ? '#1D4ED8' : '#D1D5DB' }}
                  aria-pressed={ttsEnabled}
                >
                  <div
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200"
                    style={{ left: ttsEnabled ? '28px' : '4px' }}
                  />
                </button>
              </div>
              {ttsEnabled && (
                <p className="text-[11px] text-blue-600 mt-2 font-medium">
                  ✅ Click on any text to hear it
                </p>
              )}
            </div>

            {/* Reset */}
            <button
              onClick={resetAll}
              className="w-full py-2.5 text-sm font-bold text-red-500 hover:text-white hover:bg-red-500 border border-red-200 rounded-xl transition-all"
            >
              ↺ Reset Settings
            </button>
          </div>
        </div>
      )}

      {/* Global Accessibility CSS */}
      <style>{`
        /* ── High Contrast ── */
        /*
          IMPORTANT: Do NOT apply filter to body — it creates a new stacking context
          which breaks position:fixed elements (they stop sticking to viewport).
          Instead, apply color overrides directly and use filter only on content wrappers.
        */
        body.high-contrast main,
        body.high-contrast article,
        body.high-contrast section,
        body.high-contrast header:not([data-a11y-toolbar]),
        body.high-contrast footer:not([data-a11y-toolbar]),
        body.high-contrast nav:not([data-a11y-toolbar]) {
          filter: contrast(150%);
        }
        body.high-contrast,
        body.high-contrast *:not([data-a11y-toolbar]):not([data-a11y-toolbar] *) {
          background-color: #000 !important;
          color: #FFFF00 !important;
          border-color: #FFF !important;
        }
        body.high-contrast img { filter: grayscale(1) contrast(2); }

        /* EXCEPTION: Accessibility toolbar + chatbot always stay visible & fixed */
        [data-a11y-toolbar]:not(svg):not(circle):not(path),
        [data-a11y-toolbar] *:not(svg):not(circle):not(path) {
          background-color: unset !important;
          color: unset !important;
          border-color: unset !important;
          filter: none !important;
        }
        [data-a11y-toolbar] svg,
        [data-a11y-toolbar] path {
          stroke: #ffffff !important;
          color: #ffffff !important;
        }
        [data-a11y-toolbar] circle {
          fill: #ffffff !important;
        }
        /* Keep the badge gold */
        span[data-a11y-toolbar] {
          background-color: #D4A017 !important;
          color: #000 !important;
          border-color: #fff !important;
        }

        /* Dyslexia Font — OpenDyslexic fallback to Comic Sans */
        @font-face {
          font-family: 'OpenDyslexic';
          src: url('https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/OpenDyslexic-Regular.otf') format('opentype');
        }
        body.dyslexic-font, body.dyslexic-font * {
          font-family: 'OpenDyslexic', 'Comic Sans MS', cursive !important;
          letter-spacing: 0.05em !important;
          line-height: 1.8 !important;
          word-spacing: 0.1em !important;
        }

        /* Focus Mode (ADHD) */
        body.focus-mode header,
        body.focus-mode nav,
        body.focus-mode footer,
        body.focus-mode aside,
        body.focus-mode [data-focus-hide] {
          opacity: 0.1 !important;
          pointer-events: none !important;
          transition: opacity 0.3s !important;
        }
        body.focus-mode main,
        body.focus-mode [data-focus-show] {
          outline: 3px solid #7C3AED;
          outline-offset: 4px;
          border-radius: 8px;
        }

        /* Reduce Motion (Autism) */
        body.reduce-motion *,
        body.reduce-motion *::before,
        body.reduce-motion *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `}</style>
    </>
  )
}

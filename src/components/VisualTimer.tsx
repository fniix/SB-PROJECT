'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface VisualTimerProps {
  defaultMinutes?: number
  onComplete?: () => void
}

export default function VisualTimer({ defaultMinutes = 45, onComplete }: VisualTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(defaultMinutes * 60)
  const [remaining, setRemaining] = useState(defaultMinutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isSetup, setIsSetup] = useState(true)
  const [customMinutes, setCustomMinutes] = useState(defaultMinutes)
  const [isComplete, setIsComplete] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<AudioContext | null>(null)

  // Play a gentle chime when done
  const playChime = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const freqs = [523, 659, 784, 1047] // C5 E5 G5 C6
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = freq
        osc.type = 'sine'
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.3)
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.3 + 0.05)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.3 + 0.6)
        osc.start(ctx.currentTime + i * 0.3)
        osc.stop(ctx.currentTime + i * 0.3 + 0.6)
      })
    } catch { /* audio not supported */ }
  }, [])

  useEffect(() => {
    if (!isRunning) return
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(intervalRef.current!)
          setIsRunning(false)
          setIsComplete(true)
          playChime()
          onComplete?.()
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current!)
  }, [isRunning, playChime, onComplete])

  const handleStart = () => {
    const secs = customMinutes * 60
    setTotalSeconds(secs)
    setRemaining(secs)
    setIsComplete(false)
    setIsSetup(false)
    setIsRunning(true)
  }

  const handleReset = () => {
    clearInterval(intervalRef.current!)
    setIsRunning(false)
    setIsComplete(false)
    setIsSetup(true)
    setRemaining(customMinutes * 60)
    setTotalSeconds(customMinutes * 60)
  }

  const togglePause = () => setIsRunning(r => !r)

  // Derived values
  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0
  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  const pct = Math.round(progress * 100)

  // Color: green → yellow → red as time runs out
  const hue = Math.round(progress * 120) // 120=green → 0=red
  const timerColor = `hsl(${hue}, 75%, 45%)`
  const bgColor = `hsl(${hue}, 70%, 95%)`

  // SVG circle
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)

  const PRESETS = [15, 20, 30, 45, 60]

  if (isSetup) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <span>⏱️</span> Visual Timer
          </h3>
          <p className="text-[10px] text-white/70 mt-0.5">Helpful for Autism and ADHD students</p>
        </div>
        <div className="p-4 space-y-3">
          {/* Presets */}
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">Select Session Duration</p>
            <div className="flex gap-2 flex-wrap">
              {PRESETS.map(m => (
                <button key={m} onClick={() => setCustomMinutes(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                    customMinutes === m
                      ? 'border-violet-500 bg-violet-50 text-violet-700'
                      : 'border-gray-200 text-gray-500 hover:border-violet-300'
                  }`}
                >
                  {m} min
                </button>
              ))}
            </div>
          </div>
          {/* Custom input */}
          <div className="flex items-center gap-2">
            <input
              type="number" min="1" max="120"
              value={customMinutes}
              onChange={e => setCustomMinutes(Math.min(120, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-20 border-2 border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold text-center focus:border-violet-400 outline-none"
            />
            <span className="text-sm text-gray-500">Custom minutes</span>
          </div>
          <button onClick={handleStart}
            className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)' }}
          >
            🚀 Start Timer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 text-white flex items-center justify-between"
        style={{ background: `linear-gradient(135deg, ${timerColor} 0%, hsl(${hue},60%,35%) 100%)` }}>
        <div>
          <h3 className="font-bold text-sm flex items-center gap-2">
            <span>{isComplete ? '🎉' : isRunning ? '⏱️' : '⏸️'}</span>
            {isComplete ? 'Session Complete!' : isRunning ? 'Session Running' : 'Paused'}
          </h3>
          <p className="text-[10px] text-white/70">{customMinutes} min · {pct}% remaining</p>
        </div>
        <button onClick={handleReset}
          className="text-[10px] bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg transition-all"
        >
          Reset ↺
        </button>
      </div>

      <div className="p-4">
        {isComplete ? (
          /* Completion screen */
          <div className="text-center py-4 space-y-3">
            <div className="text-6xl animate-bounce">🎉</div>
            <p className="font-bold text-lg text-gray-800">Well done! Session complete</p>
            <p className="text-sm text-gray-500">Give the student a reward now 🌟</p>
            <button onClick={handleReset}
              className="px-6 py-2.5 rounded-xl font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)' }}
            >
              New Session
            </button>
          </div>
        ) : (
          <>
            {/* Circular timer */}
            <div className="flex justify-center my-2">
              <div className="relative w-[180px] h-[180px]">
                <svg width="180" height="180" className="-rotate-90" viewBox="0 0 180 180">
                  {/* Background ring */}
                  <circle cx="90" cy="90" r={radius}
                    fill="none" stroke="#f0f0f0" strokeWidth="12"
                  />
                  {/* Progress ring */}
                  <circle cx="90" cy="90" r={radius}
                    fill="none"
                    stroke={timerColor}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    style={{ transition: 'stroke-dashoffset 1s linear, stroke 1s ease' }}
                  />
                </svg>
                {/* Center display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black font-mono" style={{ color: timerColor }}>
                    {timeStr}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">remaining</span>
                  <div className="mt-1 w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${pct}%`, backgroundColor: timerColor }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Warning strip when < 5 min */}
            {remaining <= 300 && remaining > 0 && (
              <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-xl mb-3 animate-pulse">
                <span>⚠️</span>
                <p className="text-xs text-orange-700 font-bold">Less than 5 minutes — prepare student to finish</p>
              </div>
            )}

            {/* Control buttons */}
            <div className="flex gap-2">
              <button onClick={togglePause}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: timerColor }}
              >
                {isRunning ? '⏸ Pause' : '▶ Resume'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

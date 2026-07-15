'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SessionReportPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.bookingId as string
  const supabase = createClient()

  const [topicsCovered, setTopicsCovered] = useState('')
  const [performance, setPerformance] = useState(3)
  const [weaknesses, setWeaknesses] = useState('')
  const [homework, setHomework] = useState('')
  const [confidenceScore, setConfidenceScore] = useState(3)
  const [nextSteps, setNextSteps] = useState('')
  const [parentSummary, setParentSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topicsCovered.trim()) {
      setError('Please enter the topics covered in this session.')
      return
    }
    if (!parentSummary.trim()) {
      setError('Please write a brief summary for the parent.')
      return
    }

    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Please log in again.'); setLoading(false); return }

    // Insert the session report
    const { error: insertErr } = await supabase.from('progress_reports').insert({
      booking_id: bookingId,
      tutor_id: user.id,
      topics_covered: topicsCovered,
      performance_score: performance,
      weaknesses_identified: weaknesses,
      homework_assigned: homework,
      confidence_score: confidenceScore,
      next_steps: nextSteps,
      parent_summary: parentSummary,
      status: 'submitted',
    })

    if (insertErr) {
      setError(insertErr.message)
      setLoading(false)
      return
    }

    // Update booking status to report_submitted
    await supabase
      .from('bookings')
      .update({ status: 'completed', report_submitted: true })
      .eq('id', bookingId)

    router.push('/dashboard/tutor?notice=report_submitted')
  }

  const ScoreSelector = ({
    value,
    onChange,
    label,
    labels,
  }: {
    value: number
    onChange: (v: number) => void
    label: string
    labels: string[]
  }) => (
    <div>
      <label className="block text-sm font-bold mb-2" style={{ color: 'var(--theme-text-primary)' }}>
        {label}
      </label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${
              value === n
                ? 'border-[var(--theme-accent)] bg-[var(--theme-accent-bg)] text-[var(--theme-text-primary)]'
                : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
            }`}
          >
            <div className="text-lg mb-0.5">{n <= 1 ? '😟' : n <= 2 ? '😕' : n <= 3 ? '😐' : n <= 4 ? '🙂' : '🌟'}</div>
            <div className="text-[10px]">{labels[n - 1]}</div>
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto min-h-screen" style={{ background: 'var(--theme-bg)' }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'var(--theme-accent-bg)' }}>
            📝
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--theme-text-primary)' }}>Session Report</h1>
            <p className="text-sm text-gray-500">Complete this report so the parent can see the progress.</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
          <p className="text-xs text-amber-700 font-medium">
            <strong>⚠️ Required:</strong> You must complete this report before your session is marked as finished
            and your earnings for this session are released.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex gap-3">
          <span>❌</span>
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Topics Covered */}
        <div className="stat-card">
          <label className="block text-sm font-bold mb-2" style={{ color: 'var(--theme-text-primary)' }}>
            📚 Topics Covered <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            required
            placeholder="List the topics and concepts covered during this session..."
            className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none"
            value={topicsCovered}
            onChange={e => setTopicsCovered(e.target.value)}
          />
        </div>

        {/* Performance & Confidence Scores */}
        <div className="stat-card space-y-6">
          <ScoreSelector
            value={performance}
            onChange={setPerformance}
            label="📊 Student Performance"
            labels={['Weak', 'Below Avg', 'Average', 'Good', 'Excellent']}
          />
          <ScoreSelector
            value={confidenceScore}
            onChange={setConfidenceScore}
            label="💪 Student Confidence"
            labels={['Very Low', 'Low', 'Moderate', 'High', 'Very High']}
          />
        </div>

        {/* Weaknesses */}
        <div className="stat-card">
          <label className="block text-sm font-bold mb-2" style={{ color: 'var(--theme-text-primary)' }}>
            🔍 Weaknesses Identified
          </label>
          <textarea
            rows={2}
            placeholder="Any areas where the student struggled or needs improvement..."
            className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none"
            value={weaknesses}
            onChange={e => setWeaknesses(e.target.value)}
          />
        </div>

        {/* Homework Assigned */}
        <div className="stat-card">
          <label className="block text-sm font-bold mb-2" style={{ color: 'var(--theme-text-primary)' }}>
            📝 Homework Assigned
          </label>
          <textarea
            rows={2}
            placeholder="Any homework or practice tasks for the student..."
            className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none"
            value={homework}
            onChange={e => setHomework(e.target.value)}
          />
        </div>

        {/* Next Steps */}
        <div className="stat-card">
          <label className="block text-sm font-bold mb-2" style={{ color: 'var(--theme-text-primary)' }}>
            🎯 Next Steps / Recommendations
          </label>
          <textarea
            rows={2}
            placeholder="What should the student focus on before the next session..."
            className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none"
            value={nextSteps}
            onChange={e => setNextSteps(e.target.value)}
          />
        </div>

        {/* Parent Summary — THE MOST IMPORTANT FIELD */}
        <div className="stat-card border-2" style={{ borderColor: 'var(--theme-accent)' }}>
          <label className="block text-sm font-bold mb-2" style={{ color: 'var(--theme-text-primary)' }}>
            👨‍👩‍👧 Parent Summary <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Write a brief, clear summary that the parent will read. Keep it simple and positive while being honest about areas of improvement.
          </p>
          <textarea
            rows={4}
            required
            placeholder="Dear parent, today we covered [topic]. [Student name] showed great understanding of [area]. We should continue to work on [weakness]. Homework: [task]. Next session: [plan]."
            className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none"
            value={parentSummary}
            onChange={e => setParentSummary(e.target.value)}
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
          >
            ← Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-lg hover:shadow-xl disabled:opacity-60"
            style={{ background: 'var(--theme-accent)' }}
          >
            {loading ? '⏳ Submitting...' : '📤 Submit Report'}
          </button>
        </div>

        {/* Preview info */}
        <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl">
          <p className="text-xs text-teal-700 text-center">
            <strong>What happens after you submit?</strong> The parent will receive a notification that the session report
            is ready. They can view it in their dashboard under &ldquo;Reports&rdquo;. Your earnings for this session will be released.
          </p>
        </div>
      </form>
    </div>
  )
}

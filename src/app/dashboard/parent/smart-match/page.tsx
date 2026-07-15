import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Beneficiary, SpecialistApplication } from '@/types'

// ─── AI SMART MATCHING ALGORITHM ───────────────────────────────────────────
// Scores each specialist against a beneficiary's profile. No external API needed.

function getAgeGroup(dob?: string): string {
  if (!dob) return ''
  const age = new Date().getFullYear() - new Date(dob).getFullYear()
  if (age <= 5) return 'Early Intervention (0-5)'
  if (age <= 12) return 'School Age (6-12)'
  if (age <= 18) return 'Teens (13-18)'
  return 'Adults (19+)'
}

function scoreSpecialist(specialist: SpecialistApplication, beneficiary: Beneficiary): number {
  let score = 0

  // 1. Condition Match (Highest Priority)
  const bConds = beneficiary.conditions || []
  const sConds = specialist.conditions_handled || []
  const conditionOverlap = bConds.filter(c => sConds.includes(c)).length
  score += conditionOverlap * 30

  // 2. Age Group Match
  const ageGroup = getAgeGroup(beneficiary.date_of_birth)
  if (ageGroup && (specialist.age_groups || []).includes(ageGroup)) {
    score += 20
  }

  // 3. Communication Level Match (e.g., Non-verbal / Sign Language)
  if (beneficiary.communication_level === 'Non-verbal' || beneficiary.communication_level === 'AAC') {
    if ((specialist.languages || []).includes('Sign Language') || (specialist.specialties || []).includes('Speech Therapist')) {
      score += 25
    }
  }

  // 4. Base availability / Experience (assuming approved specialists are highly vetted)
  if (specialist.status === 'approved') score += 10

  return score
}

function getAIInsights(beneficiary: Beneficiary, sessions: any[]): string[] {
  const insights: string[] = []

  const conditions = beneficiary.conditions || []
  
  if (conditions.length > 0) {
    insights.push(`🧠 Your profile indicates ${conditions[0]}. We'll prioritize specialists experienced in this area.`)
  }

  if (beneficiary.communication_level === 'Non-verbal') {
    insights.push(`🗣️ We will look for Speech Therapists or Sign Language Interpreters.`)
  }

  const sessionCount = sessions.filter(s => s.status === 'completed').length
  if (sessionCount === 0) {
    insights.push(`🚀 Book your first session to start the initial evaluation and build the Individualized Education Plan (IEP).`)
  } else {
    insights.push(`📈 ${beneficiary.full_name} has completed ${sessionCount} sessions. Consistency is key!`)
  }

  return insights.slice(0, 4)
}

// ─── PAGE ──────────────────────────────────────────────────────────────────

export default async function SmartMatchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: parentProfile } = await supabase.from('parent_profiles').select('id').eq('user_id', user.id).single()
  if (!parentProfile) redirect('/dashboard/parent')

  const { data: beneficiaries } = await supabase.from('beneficiaries').select('*').eq('parent_id', parentProfile.id)
  
  // Cast to standard array for iteration
  const bens = (beneficiaries as Beneficiary[]) || []

  const { data: specs } = await supabase.from('specialist_applications').select('*').eq('status', 'approved')
  const specialists = (specs as SpecialistApplication[]) || []

  const { data: allSessions } = await supabase.from('bookings').select('*').eq('parent_id', parentProfile.id)

  const beneficiaryInsights = bens.map(beneficiary => ({
    beneficiary,
    sessions: (allSessions || []).filter(s => s.beneficiary_id === beneficiary.id),
    insights: getAIInsights(beneficiary, (allSessions || []).filter(s => s.beneficiary_id === beneficiary.id)),
    topSpecialists: [...specialists]
      .map(t => ({ ...t, aiScore: scoreSpecialist(t, beneficiary) }))
      // Must have some relevant score to be matched, otherwise just sort randomly or by score
      .filter(t => t.aiScore > 10)
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, 3),
  }))

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-6 lg:p-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-900 via-[#0B2341] to-[#0B2341] rounded-3xl p-8 mb-8 relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 2px, transparent 2px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-4xl border border-white/20 shadow-inner shrink-0">✨</div>
          <div>
            <h1 className="text-3xl font-black !text-white mb-2">AI Smart Match</h1>
            <p className="!text-teal-100 text-lg">Intelligent specialist recommendations based on your beneficiary's unique profile</p>
          </div>
        </div>
      </div>

      {bens.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-16 text-center">
          <div className="text-6xl mb-4">👦</div>
          <h3 className="font-bold text-[#0B2341] text-xl mb-2">No Beneficiaries Added</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Add a profile for your loved one first to get AI-powered recommendations.</p>
          <Link href="/dashboard/parent/beneficiaries/new" className="inline-block bg-[#0B2341] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#071829] shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5">
            + Add Beneficiary
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {beneficiaryInsights.map(({ beneficiary, insights, topSpecialists }) => (
            <div key={beneficiary.id} className="space-y-6">
              {/* Beneficiary Header */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#0B2341] rounded-2xl flex items-center justify-center font-black text-white text-2xl shadow-inner border border-[#0B2341]/20">
                  {beneficiary.full_name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#0B2341]">{beneficiary.full_name}</h2>
                  <p className="text-sm text-gray-500 font-medium mt-1">
                    {getAgeGroup(beneficiary.date_of_birth)} • {(beneficiary.conditions || []).join(', ') || 'No conditions specified'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* AI Insights */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 lg:p-8">
                  <h3 className="font-bold text-[#0B2341] mb-6 flex items-center gap-3 text-lg">
                    <span className="text-2xl bg-amber-100 p-2 rounded-xl">💡</span>
                    Analysis & Insights
                  </h3>
                  <div className="space-y-3">
                    {insights.length > 0 ? insights.map((insight, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 items-start">
                        <p className="text-sm text-gray-700 leading-relaxed font-medium">{insight}</p>
                      </div>
                    )) : (
                      <p className="text-gray-400 text-sm italic">Add more details to the profile to unlock insights.</p>
                    )}
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <Link href={`/dashboard/parent/student/${beneficiary.id}/learning-profile`} className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2">
                      Update Profile for better matching →
                    </Link>
                  </div>
                </div>

                {/* Top Matched Specialists */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 lg:p-8">
                  <h3 className="font-bold text-[#0B2341] mb-6 flex items-center gap-3 text-lg">
                    <span className="text-2xl bg-teal-100 p-2 rounded-xl">🏆</span>
                    Top Matched Specialists
                  </h3>
                  {topSpecialists.length > 0 ? (
                    <div className="space-y-4">
                      {topSpecialists.map((spec, rank) => (
                        <div key={spec.user_id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-2xl border-2 border-gray-100 hover:border-[#0B2341]/30 transition-all bg-white relative group">
                          {/* Rank badge */}
                          <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-md border-2 border-white ${rank === 0 ? 'bg-amber-400 text-white' : rank === 1 ? 'bg-gray-200 text-gray-600' : 'bg-orange-200 text-orange-800'}`}>
                            {rank + 1}
                          </div>

                          <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center font-bold text-blue-600 text-xl shrink-0">
                            {spec.full_name?.charAt(0)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[#0B2341] text-base group-hover:text-blue-600 transition-colors">Dr. {spec.full_name}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {(spec.specialties || []).slice(0, 2).map((s: string) => (
                                <span key={s} className="text-[10px] bg-gray-100 text-gray-600 font-bold px-2 py-1 rounded-md uppercase tracking-wider">{s}</span>
                              ))}
                            </div>
                          </div>

                          <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between mt-2 sm:mt-0 gap-3 sm:gap-2">
                            <div className="text-xs text-teal-700 font-bold bg-teal-50 border border-teal-200 px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
                              {spec.aiScore} Match Score
                            </div>
                            <Link href={`/dashboard/parent/book/${spec.user_id}`} className="text-sm font-bold text-white bg-[#0B2341] hover:bg-[#071829] px-4 py-2 rounded-xl transition-colors whitespace-nowrap shadow-md">
                              Book Now
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-gray-500 font-medium">No verified specialists match these criteria yet.</p>
                      <Link href="/dashboard/parent/specialists" className="text-sm text-blue-600 font-bold hover:underline mt-2 inline-block">Browse all specialists</Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

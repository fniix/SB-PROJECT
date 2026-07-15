import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function BeneficiariesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: parentProfile } = await supabase
    .from('parent_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!parentProfile) {
    redirect('/dashboard')
  }

  const { data: beneficiaries } = await supabase
    .from('beneficiaries')
    .select('id, full_name, date_of_birth, gender, conditions, communication_level, created_at')
    .eq('parent_id', parentProfile.id)
    .order('created_at', { ascending: false })

  const getAge = (dob: string) => {
    if (!dob) return null
    const diff = Date.now() - new Date(dob).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
  }

  const getGenderIcon = (gender: string) => {
    return gender === 'male' ? '👦' : gender === 'female' ? '👧' : '🧒'
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Verbal': return 'bg-green-100 text-green-700 border-green-200'
      case 'Limited Verbal': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'Non-verbal': return 'bg-red-100 text-red-700 border-red-200'
      case 'AAC': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="p-6 lg:p-8 min-h-screen bg-[#F3F4F6]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Link href="/dashboard/parent" className="text-sm font-semibold text-gray-500 hover:text-[#0B2341] flex items-center gap-2 mb-3 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-[#0B2341] flex items-center gap-3">
              <span className="text-3xl">🦸‍♂️</span> My Heroes
            </h1>
            <p className="text-gray-500 mt-1">Manage your children&apos;s profiles</p>
          </div>
          <Link
            href="/dashboard/parent/beneficiaries/new"
            className="bg-[#0B2341] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#071829] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 w-fit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            Add a Hero
          </Link>
        </div>

        {/* Cards */}
        {beneficiaries && beneficiaries.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {beneficiaries.map((child) => {
              const age = getAge(child.date_of_birth)
              return (
                <div key={child.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
                  {/* Card Header */}
                  <div className="bg-[#0B2341] px-6 py-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-14 h-14 bg-white/10 border-2 border-white/20 rounded-2xl flex items-center justify-center text-3xl">
                        {getGenderIcon(child.gender)}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{child.full_name}</h2>
                        <p className="text-blue-200 text-sm font-medium">
                          {age !== null ? `${age} years old` : 'Age not set'} • {child.gender ? child.gender.charAt(0).toUpperCase() + child.gender.slice(1) : 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4">
                    {/* Communication Level */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Communication:</span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getLevelColor(child.communication_level)}`}>
                        {child.communication_level || 'Not assessed'}
                      </span>
                    </div>

                    {/* Conditions */}
                    {child.conditions && child.conditions.length > 0 ? (
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Conditions</p>
                        <div className="flex flex-wrap gap-2">
                          {child.conditions.map((c: string) => (
                            <span key={c} className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full border border-blue-100">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No conditions specified</p>
                    )}

                    {/* Actions */}
                    <div className="pt-3 border-t border-gray-100 flex gap-3">
                      <Link
                        href={`/dashboard/parent/smart-match`}
                        className="flex-1 bg-[#D4A017]/10 text-[#D4A017] hover:bg-[#D4A017]/20 text-center py-2.5 rounded-xl text-sm font-bold transition-all border border-[#D4A017]/20"
                      >
                        🔍 Find Match
                      </Link>
                      <Link
                        href={`/dashboard/parent/iep`}
                        className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 text-center py-2.5 rounded-xl text-sm font-bold transition-all border border-blue-100"
                      >
                        📝 IEP Plan
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center bg-white border border-gray-100 rounded-2xl p-16 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#D4A017]"></div>
            <div className="w-20 h-20 bg-[#0B2341] text-white rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
              🦸‍♂️
            </div>
            <h3 className="text-2xl font-bold text-[#0B2341] mb-3">No Heroes Added Yet</h3>
            <p className="text-gray-600 max-w-md mx-auto text-lg mb-8">
              Add your child&apos;s profile to start finding the perfect specialists and track their progress.
            </p>
            <Link
              href="/dashboard/parent/beneficiaries/new"
              className="inline-flex items-center gap-2 bg-[#0B2341] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#071829] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
              Add Your First Hero
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

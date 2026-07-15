import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function SpecialistsSearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    specialty?: string
    condition?: string
    session_type?: string
  }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const q = params?.q || ''
  const specialtyFilter = params?.specialty || ''
  const conditionFilter = params?.condition || ''
  const sessionTypeFilter = params?.session_type || ''

  // Fetch approved specialists
  let query = supabase
    .from('specialist_applications')
    .select('user_id, full_name, bio, specialties, conditions_handled, session_types, price_per_hour, languages')
    .eq('status', 'approved')

  if (q) {
    query = query.ilike('full_name', `%${q}%`)
  }
  
  if (specialtyFilter) {
    query = query.contains('specialties', [specialtyFilter])
  }
  
  if (conditionFilter) {
    query = query.contains('conditions_handled', [conditionFilter])
  }
  
  if (sessionTypeFilter) {
    query = query.contains('session_types', [sessionTypeFilter])
  }

  const { data: specialists, error } = await query

  const SPECIALTIES = ['Speech Therapist', 'Behavioral Analyst (ABA)', 'Special Ed Teacher', 'Occupational Therapist', 'Psychologist', 'Sign Language Interpreter']
  const CONDITIONS = ['Autism Spectrum Disorder', 'ADHD', 'Down Syndrome', 'Learning Disabilities', 'Speech/Language Disorders', 'Intellectual Disability', 'Multiple Disabilities']
  const SESSION_TYPES = ['Online', 'In-Person (Home)', 'In-Person (Center)']

  return (
    <div className="p-6 lg:p-8 min-h-screen bg-[#F3F4F6]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2341]">Find a Specialist</h1>
        <p className="text-gray-500 mt-2">Search and filter to find the right provider for your beneficiary's needs.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-72 shrink-0">
          <form className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sticky top-6">
            <h3 className="font-bold text-[#0B2341] mb-4 text-lg">Filters</h3>
            
            <div className="space-y-5">
              {/* Search */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Search Name</label>
                <input 
                  type="text" 
                  name="q"
                  defaultValue={q}
                  placeholder="e.g. Dr. Ahmed"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:bg-white focus:border-[#0B2341] focus:ring-2 focus:ring-[#0B2341]/10 outline-none transition-all"
                />
              </div>

              {/* Specialty */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Specialty</label>
                <select 
                  name="specialty" 
                  defaultValue={specialtyFilter}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:bg-white focus:border-[#0B2341] focus:ring-2 focus:ring-[#0B2341]/10 outline-none transition-all"
                >
                  <option value="">All Specialties</option>
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Conditions */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Conditions Handled</label>
                <select 
                  name="condition" 
                  defaultValue={conditionFilter}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:bg-white focus:border-[#0B2341] focus:ring-2 focus:ring-[#0B2341]/10 outline-none transition-all"
                >
                  <option value="">All Conditions</option>
                  {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Session Types */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Session Type</label>
                <select 
                  name="session_type" 
                  defaultValue={sessionTypeFilter}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:bg-white focus:border-[#0B2341] focus:ring-2 focus:ring-[#0B2341]/10 outline-none transition-all"
                >
                  <option value="">All Session Types</option>
                  {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full bg-[#0B2341] text-white py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-[#071829] transition-colors">
                  Apply Filters
                </button>
                <Link href="/dashboard/parent/specialists" className="block text-center mt-3 text-xs text-gray-400 hover:text-[#0B2341] font-semibold">
                  Clear All
                </Link>
              </div>
            </div>
          </form>
        </div>

        {/* Results List */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-[#0B2341]">{specialists?.length || 0} Specialists Found</h2>
            <Link href="/dashboard/parent/smart-match" className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2">
              <span>✨</span> Try AI Smart Match
            </Link>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
              Error loading specialists. Please try again later.
            </div>
          )}

          {specialists && specialists.length > 0 ? (
            specialists.map((spec) => (
              <div key={spec.user_id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Avatar */}
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center font-bold text-[#0B2341] text-2xl shrink-0">
                    {spec.full_name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-[#0B2341] flex items-center gap-2">
                          Dr. {spec.full_name}
                          <span className="bg-blue-50 text-blue-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                            Verified
                          </span>
                        </h3>
                        <p className="text-sm font-semibold text-gray-500 mt-1">{(spec.specialties || []).join(' • ')}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-2xl font-black text-[#0B2341]">SAR {spec.price_per_hour}</p>
                        <p className="text-xs text-gray-400 font-medium">per hour</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mt-4 line-clamp-2 leading-relaxed">
                      {spec.bio || 'No biography provided by the specialist.'}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {(spec.conditions_handled || []).slice(0, 3).map((c: string) => (
                        <span key={c} className="bg-teal-50 text-teal-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                          {c}
                        </span>
                      ))}
                      {(spec.conditions_handled?.length || 0) > 3 && (
                        <span className="bg-gray-50 text-gray-500 text-xs font-semibold px-2.5 py-1 rounded-lg">
                          +{(spec.conditions_handled?.length || 0) - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col justify-end border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6 shrink-0 gap-3">
                    <Link href={`/dashboard/parent/specialists/${spec.user_id}`} className="w-full sm:w-auto text-center px-6 py-2.5 bg-white text-[#0B2341] border-2 border-gray-200 hover:border-[#0B2341] rounded-xl font-bold text-sm transition-colors">
                      View Profile
                    </Link>
                    <Link href={`/dashboard/parent/book/${spec.user_id}`} className="w-full sm:w-auto text-center px-6 py-2.5 bg-[#0B2341] hover:bg-[#071829] text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all">
                      Book Session
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
              <div className="text-5xl mb-4">🩺</div>
              <h3 className="text-lg font-bold text-[#0B2341] mb-2">No Specialists Found</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">We couldn't find any specialists matching your exact criteria. Try removing some filters or use our Smart Match AI.</p>
              <Link href="/dashboard/parent/specialists" className="inline-block mt-6 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors">
                Clear Filters
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

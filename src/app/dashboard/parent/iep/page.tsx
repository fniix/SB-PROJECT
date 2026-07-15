import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function IEPPlansPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get parent profile
  const { data: parentProfile } = await supabase
    .from('parent_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  // Get beneficiaries/students
  const { data: beneficiaries } = await supabase
    .from('beneficiaries')
    .select('id, full_name, conditions, communication_level')
    .eq('parent_id', parentProfile?.id)

  return (
    <div className="p-6 lg:p-8 min-h-screen bg-[#F3F4F6]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/parent" className="text-sm font-semibold text-gray-500 hover:text-[#0B2341] flex items-center gap-2 mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-[#0B2341]">IEP Plans</h1>
          <p className="text-gray-500 mt-1">Individualized Education Plans for your children</p>
        </div>

        {/* Content */}
        {beneficiaries && beneficiaries.length > 0 ? (
          <div className="grid gap-6">
            {beneficiaries.map((child) => (
              <div key={child.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-[#0B2341] px-6 py-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                    {child.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{child.full_name}</h2>
                    <p className="text-blue-200 text-sm">{(child.conditions || []).join(' • ') || 'No conditions specified'}</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Communication Level</p>
                      <p className="text-lg font-bold text-[#0B2341] capitalize">{child.communication_level || 'Not assessed'}</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Plan Status</p>
                      <p className="text-lg font-bold text-[#0B2341]">Active</p>
                    </div>
                  </div>

                  {/* Goals Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-[#0B2341] mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#D4A017] text-white text-xs flex items-center justify-center">🎯</span>
                      Goals & Objectives
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-green-100 border border-green-300 flex items-center justify-center mt-0.5">
                            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                          </div>
                          <div>
                            <p className="font-semibold text-[#0B2341]">Communication Skills</p>
                            <p className="text-sm text-gray-500">Improve expressive language and social communication</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center mt-0.5">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                          <div>
                            <p className="font-semibold text-[#0B2341]">Academic Progress</p>
                            <p className="text-sm text-gray-500">Meet grade-level benchmarks with appropriate accommodations</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center mt-0.5">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          </div>
                          <div>
                            <p className="font-semibold text-[#0B2341]">Social Skills</p>
                            <p className="text-sm text-gray-500">Build peer interaction and self-regulation strategies</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div>
                    <h3 className="text-lg font-bold text-[#0B2341] mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#0B2341] text-white text-xs flex items-center justify-center">📊</span>
                      Progress Overview
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="bg-green-50 rounded-xl p-4 border border-green-100 text-center">
                        <p className="text-3xl font-black text-green-600">3</p>
                        <p className="text-xs font-bold text-green-700 mt-1">Goals Met</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-center">
                        <p className="text-3xl font-black text-blue-600">2</p>
                        <p className="text-xs font-bold text-blue-700 mt-1">In Progress</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
                        <p className="text-3xl font-black text-gray-600">1</p>
                        <p className="text-xs font-bold text-gray-700 mt-1">Upcoming</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white border border-gray-100 rounded-2xl p-16 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#D4A017]"></div>
            <div className="w-20 h-20 bg-[#0B2341] text-[#D4A017] rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner">
              📝
            </div>
            <h3 className="text-2xl font-bold text-[#0B2341] mb-3">No IEP Plans Yet</h3>
            <p className="text-gray-600 max-w-md mx-auto text-lg mb-8">
              Add a beneficiary first to start creating individualized education plans.
            </p>
            <Link
              href="/dashboard/parent/beneficiaries/new"
              className="text-[#D4A017] hover:text-[#b8860b] font-bold text-lg inline-flex items-center gap-2 transition-colors border-b-2 border-transparent hover:border-[#D4A017]"
            >
              <span>Add a Beneficiary &rarr;</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

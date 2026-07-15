import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function BookSpecialistPage({
  params,
}: {
  params: { specialistId: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get specialist details
  const { data: specialist, error } = await supabase
    .from('specialist_applications')
    .select('*')
    .eq('user_id', params.specialistId)
    .single()

  if (error || !specialist) {
    redirect('/dashboard/parent/specialists')
  }

  // Get parent's beneficiaries
  const { data: parentProfile } = await supabase
    .from('parent_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const { data: beneficiaries } = await supabase
    .from('beneficiaries')
    .select('id, full_name, conditions, communication_level')
    .eq('parent_id', parentProfile?.id)

  return (
    <div className="p-6 lg:p-8 min-h-screen bg-[#F3F4F6] flex justify-center">
      <div className="w-full max-w-3xl">
        {/* Back */}
        <Link href="/dashboard/parent/specialists" className="text-sm font-semibold text-gray-500 hover:text-[#0B2341] flex items-center gap-2 mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Back to Specialists
        </Link>

        {/* Header */}
        <div className="bg-[#0B2341] rounded-t-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 bg-white/10 border-2 border-white/20 rounded-2xl flex items-center justify-center font-bold text-3xl">
              {specialist.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Dr. {specialist.full_name}
                <span className="bg-blue-500/20 text-blue-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-blue-500/30">
                  Verified
                </span>
              </h1>
              <p className="text-blue-200 mt-1 font-medium">{(specialist.specialties || []).join(' • ')}</p>
            </div>
            <div className="sm:ml-auto mt-4 sm:mt-0 text-left sm:text-right">
              <p className="text-3xl font-black text-[#D4A017]">SAR {specialist.price_per_hour}</p>
              <p className="text-xs text-blue-200 font-medium">per hour</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="bg-white rounded-b-3xl shadow-sm border border-t-0 border-gray-200 p-8">
          <form className="space-y-8" action={async (formData) => {
            'use server'
            const sup = await createClient()
            const { data: { user } } = await sup.auth.getUser()
            const pId = (await sup.from('parent_profiles').select('id').eq('user_id', user?.id).single()).data?.id

            await sup.from('bookings').insert({
              parent_id: pId,
              specialist_id: params.specialistId,
              beneficiary_id: formData.get('beneficiary_id'),
              service_type: formData.get('service_type'),
              session_type: formData.get('session_type'),
              date: formData.get('date'),
              time: formData.get('time'),
              duration_minutes: 60,
              status: 'pending',
              price: specialist.price_per_hour,
              paid: false,
              notes: formData.get('notes'),
            })

            redirect('/dashboard/parent/sessions?success=true')
          }}>

            {/* 1. Select Beneficiary */}
            <div>
              <h3 className="text-lg font-bold text-[#0B2341] mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#0B2341] text-white text-xs flex items-center justify-center">1</span>
                Who is this session for?
              </h3>
              {beneficiaries && beneficiaries.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {beneficiaries.map(b => (
                    <label key={b.id} className="relative flex p-4 rounded-xl border-2 border-gray-100 hover:border-[#0B2341]/30 cursor-pointer transition-all has-[:checked]:border-[#0B2341] has-[:checked]:bg-[#0B2341]/5 group">
                      <input type="radio" name="beneficiary_id" value={b.id} required className="absolute right-4 top-4 w-4 h-4 accent-[#0B2341]" />
                      <div>
                        <p className="font-bold text-[#0B2341]">{b.full_name}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{(b.conditions || []).join(', ') || 'No conditions specified'}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="bg-amber-50 text-amber-700 p-4 rounded-xl text-sm border border-amber-200">
                  You need to add a beneficiary profile first. <Link href="/dashboard/parent/beneficiaries/new" className="font-bold underline">Add one now</Link>.
                </div>
              )}
            </div>

            {/* 2. Session Type */}
            <div>
              <h3 className="text-lg font-bold text-[#0B2341] mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#0B2341] text-white text-xs flex items-center justify-center">2</span>
                Type of Session
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="relative flex flex-col p-4 rounded-xl border-2 border-gray-100 hover:border-[#0B2341]/30 cursor-pointer transition-all has-[:checked]:border-[#0B2341] has-[:checked]:bg-[#0B2341]/5">
                  <input type="radio" name="service_type" value="Initial Evaluation" required className="absolute right-4 top-4 w-4 h-4 accent-[#0B2341]" />
                  <p className="font-bold text-[#0B2341]">Initial Evaluation</p>
                  <p className="text-xs text-gray-500 mt-1">First time meeting? Start here to assess needs and build an IEP.</p>
                </label>
                <label className="relative flex flex-col p-4 rounded-xl border-2 border-gray-100 hover:border-[#0B2341]/30 cursor-pointer transition-all has-[:checked]:border-[#0B2341] has-[:checked]:bg-[#0B2341]/5">
                  <input type="radio" name="service_type" value="Therapy Session" required className="absolute right-4 top-4 w-4 h-4 accent-[#0B2341]" />
                  <p className="font-bold text-[#0B2341]">Regular Therapy Session</p>
                  <p className="text-xs text-gray-500 mt-1">Standard 60-minute therapeutic or educational session.</p>
                </label>
              </div>

              <div className="mt-4">
                <select name="session_type" required className="w-full rounded-xl border-2 border-gray-100 bg-white px-4 py-3 text-sm font-semibold text-[#0B2341] focus:border-[#0B2341] focus:ring-0 outline-none transition-all">
                  <option value="">Select Location Modality...</option>
                  {specialist.session_types?.map((t: string) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Date & Time */}
            <div>
              <h3 className="text-lg font-bold text-[#0B2341] mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#0B2341] text-white text-xs flex items-center justify-center">3</span>
                Date & Time
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Date</label>
                  <input type="date" name="date" required className="w-full rounded-xl border-2 border-gray-100 bg-white px-4 py-3 text-sm font-semibold text-[#0B2341] focus:border-[#0B2341] focus:ring-0 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Time</label>
                  <input type="time" name="time" required className="w-full rounded-xl border-2 border-gray-100 bg-white px-4 py-3 text-sm font-semibold text-[#0B2341] focus:border-[#0B2341] focus:ring-0 outline-none transition-all" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2 font-medium">
                Note: Dr. {specialist.full_name} is generally available on {(specialist.available_days || []).join(', ')} during {specialist.available_time}s.
              </p>
            </div>

            {/* 4. Notes */}
            <div>
              <h3 className="text-lg font-bold text-[#0B2341] mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#0B2341] text-white text-xs flex items-center justify-center">4</span>
                Notes for Specialist
              </h3>
              <textarea name="notes" rows={3} placeholder="Any specific goals or behaviors the specialist should know about before the session?" className="w-full rounded-xl border-2 border-gray-100 bg-white px-4 py-3 text-sm text-[#0B2341] focus:border-[#0B2341] focus:ring-0 outline-none transition-all resize-none"></textarea>
            </div>

            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-500">Total Price</p>
                <p className="text-3xl font-black text-[#0B2341]">SAR {specialist.price_per_hour}</p>
              </div>
              <button type="submit" className="bg-[#0B2341] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-[#071829] hover:shadow-2xl hover:-translate-y-0.5 transition-all">
                Request Session
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AddHeroPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let { data: parentProfile } = await supabase
    .from('parent_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!parentProfile) {
    const { data: newProfile, error } = await supabase
      .from('parent_profiles')
      .insert({ id: user.id, user_id: user.id })
      .select('id')
      .single()
    
    if (!error && newProfile) {
      parentProfile = newProfile
    } else {
      redirect('/dashboard')
    }
  }

  return (
    <div className="p-6 lg:p-8 min-h-screen bg-[#F3F4F6] flex justify-center">
      <div className="w-full max-w-2xl">
        <Link href="/dashboard/parent" className="text-sm font-semibold text-gray-500 hover:text-[#0B2341] flex items-center gap-2 mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-[#0B2341] p-8 text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            <h1 className="text-3xl font-black mb-2 relative z-10 flex items-center gap-3">
              <span className="text-4xl">🦸‍♂️</span> Add a Hero
            </h1>
            <p className="text-blue-200 font-medium relative z-10">
              Create a profile for your hero to unlock personalized matches and track their journey.
            </p>
          </div>

          <form action={async (formData) => {
            'use server'
            const sup = await createClient()
            
            // For now, we will save special_traits in medical_history or a separate note, 
            // but since our beneficiaries table has an "additional_notes" or we can store it in medical_history
            const conditions = formData.getAll('conditions')
            const specialTraits = formData.get('special_traits')
            
            const insertData = {
              parent_id: parentProfile.id,
              full_name: formData.get('full_name'),
              date_of_birth: formData.get('date_of_birth'),
              gender: formData.get('gender'),
              conditions: conditions,
              communication_level: formData.get('communication_level'),
              notes: `Special Traits: ${specialTraits}\n\nMedical Notes: ${formData.get('medical_history') || ''}`
            }

            const { data, error } = await sup.from('beneficiaries').insert(insertData).select('id').single()

            if (!error && data) {
              redirect(`/dashboard/parent/student/${data.id}`)
            } else {
              // fallback if redirect fails or error happens
              redirect('/dashboard/parent?error=add_hero_failed')
            }

          }} className="p-8 space-y-8">
            
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-bold text-[#0B2341] mb-4 border-b pb-2">Hero Information</h3>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input type="text" name="full_name" required placeholder="e.g. Abdullah" className="w-full rounded-xl border-2 border-gray-100 px-4 py-3 text-sm focus:border-[#0B2341] focus:ring-0 outline-none transition-all bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Date of Birth</label>
                  <input type="date" name="date_of_birth" required className="w-full rounded-xl border-2 border-gray-100 px-4 py-3 text-sm focus:border-[#0B2341] focus:ring-0 outline-none transition-all bg-gray-50 focus:bg-white text-gray-700" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
                  <select name="gender" required className="w-full rounded-xl border-2 border-gray-100 px-4 py-3 text-sm focus:border-[#0B2341] focus:ring-0 outline-none transition-all bg-gray-50 focus:bg-white text-gray-700">
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Communication Level</label>
                  <select name="communication_level" required className="w-full rounded-xl border-2 border-gray-100 px-4 py-3 text-sm focus:border-[#0B2341] focus:ring-0 outline-none transition-all bg-gray-50 focus:bg-white text-gray-700">
                    <option value="">Select level</option>
                    <option value="Verbal">Verbal (Speaks clearly)</option>
                    <option value="Limited Verbal">Limited Verbal (Short phrases)</option>
                    <option value="Non-verbal">Non-verbal</option>
                    <option value="AAC">Uses AAC Device</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Conditions */}
            <div>
              <h3 className="text-lg font-bold text-[#0B2341] mb-4 border-b pb-2">Conditions / Diagnosis</h3>
              <p className="text-xs text-gray-500 mb-3 font-medium">Select all that apply to help us find the perfect match.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {['Autism Spectrum Disorder', 'ADHD', 'Down Syndrome', 'Learning Disabilities', 'Speech/Language Disorders', 'Intellectual Disability', 'Physical Disability'].map(c => (
                  <label key={c} className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-100 hover:border-blue-200 cursor-pointer transition-colors has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                    <input type="checkbox" name="conditions" value={c} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                    <span className="text-sm font-semibold text-gray-700">{c}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* The Special Traits Field (Requested by User) */}
            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 text-6xl opacity-10 -translate-y-2 translate-x-2">🌟</div>
              <h3 className="text-lg font-bold text-amber-900 mb-2 relative z-10 flex items-center gap-2">
                What makes your hero special?
              </h3>
              <p className="text-sm text-amber-700 mb-4 relative z-10 font-medium">
                Every child has their own superpower. Tell us what makes them unique, their interests, or how we can give them the best advanced support.
              </p>
              <textarea 
                name="special_traits" 
                rows={4} 
                required
                placeholder="e.g. He loves drawing and is incredibly observant. He responds very well to visual schedules..."
                className="w-full rounded-xl border-2 border-amber-200/50 px-4 py-3 text-sm focus:border-amber-500 focus:ring-0 outline-none transition-all bg-white relative z-10 resize-none shadow-sm"
              ></textarea>
            </div>

            {/* Submit */}
            <div className="pt-6">
              <button type="submit" className="w-full bg-[#0B2341] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#071829] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 flex justify-center items-center gap-2">
                <span>Save Hero Profile</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

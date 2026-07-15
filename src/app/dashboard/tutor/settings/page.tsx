'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function TutorSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [tutorProfileId, setTutorProfileId] = useState<string | null>(null)
  const [bio, setBio] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [experienceYears, setExperienceYears] = useState('')
  const [subjects, setSubjects] = useState<string>('')
  
  const [online, setOnline] = useState(false)
  const [inPerson, setInPerson] = useState(false)
  const [hybrid, setHybrid] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('tutor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        setError('Could not load profile.')
      } else {
        setTutorProfileId(data.id)
        setBio(data.bio || '')
        setHourlyRate(data.hourly_rate ? data.hourly_rate.toString() : '')
        setExperienceYears(data.experience_years ? data.experience_years.toString() : '')
        setSubjects((data.subjects || []).join(', '))
        
        const methods = data.teaching_methods || []
        setOnline(methods.includes('online'))
        setInPerson(methods.includes('in-person'))
        setHybrid(methods.includes('hybrid'))
      }
      setLoading(false)
    }

    fetchProfile()
  }, [router, supabase])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    if (!tutorProfileId) return

    const methods = []
    if (online) methods.push('online')
    if (inPerson) methods.push('in-person')
    if (hybrid) methods.push('hybrid')

    const subjectsArray = subjects.split(',').map(s => s.trim()).filter(Boolean)

    const { error: updateError } = await supabase
      .from('tutor_profiles')
      .update({
        bio,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : 0,
        experience_years: experienceYears ? parseInt(experienceYears) : 0,
        subjects: subjectsArray,
        teaching_methods: methods
      })
      .eq('id', tutorProfileId)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen bg-[#FDFBF7] p-12 flex justify-center text-[#0B2341] font-bold text-xl">Loading...</div>

  if (error && !tutorProfileId) return (
    <div className="min-h-screen bg-[#FDFBF7] p-12">
      <div className="max-w-4xl mx-auto bg-red-50 text-red-600 p-6 rounded-lg border border-red-100 font-medium text-center">
        {error}
        <div className="mt-4">
          <Link href="/dashboard/tutor" className="text-blue-600 hover:underline">Return to Dashboard</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/dashboard/tutor" className="text-[#0B2341] hover:text-[#D4A017] transition-colors flex items-center gap-1 font-bold bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm hover:shadow-md">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-[#0B2341]">Profile Settings</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#D4A017]"></div>
          
          {success && <div className="text-green-700 text-sm mb-6 bg-green-50 p-4 rounded-lg border border-green-200 font-bold flex items-center gap-2">✓ Profile updated successfully!</div>}
          {error && <div className="text-red-600 text-sm mb-6 bg-red-50 p-4 rounded-lg border border-red-100 font-medium">{error}</div>}

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#0B2341] mb-1">Biography</label>
              <textarea
                rows={4}
                className="block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-[#D4A017] focus:ring-[#D4A017] shadow-sm bg-[#FDFBF7]"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell parents and students about yourself..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#0B2341] mb-1">Hourly Rate ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-[#D4A017] focus:ring-[#D4A017] shadow-sm bg-[#FDFBF7]"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#0B2341] mb-1">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  className="block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-[#D4A017] focus:ring-[#D4A017] shadow-sm bg-[#FDFBF7]"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0B2341] mb-1">Subjects (Comma separated)</label>
              <input
                type="text"
                className="block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-[#D4A017] focus:ring-[#D4A017] shadow-sm bg-[#FDFBF7]"
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
                placeholder="Math, Science, English..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0B2341] mb-3">Teaching Methods</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-gray-700">
                  <input type="checkbox" checked={online} onChange={e => setOnline(e.target.checked)} className="rounded text-[#D4A017] focus:ring-[#D4A017]" />
                  Online
                </label>
                <label className="flex items-center gap-2 text-gray-700">
                  <input type="checkbox" checked={inPerson} onChange={e => setInPerson(e.target.checked)} className="rounded text-[#D4A017] focus:ring-[#D4A017]" />
                  In-Person
                </label>
                <label className="flex items-center gap-2 text-gray-700">
                  <input type="checkbox" checked={hybrid} onChange={e => setHybrid(e.target.checked)} className="rounded text-[#D4A017] focus:ring-[#D4A017]" />
                  Hybrid
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#0B2341] px-8 py-2.5 text-white font-bold rounded-lg hover:bg-blue-900 disabled:opacity-50 transition-all shadow-md hover:shadow-lg border-2 border-transparent hover:border-[#D4A017]"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

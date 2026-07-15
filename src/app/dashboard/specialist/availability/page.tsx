'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SpecialistAvailabilityPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [availability, setAvailability] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: false,
    saturday: false,
    sunday: false,
  })

  useEffect(() => {
    // In a real implementation, you'd fetch the specialist's saved availability from the DB here.
    // For now, this acts as a functional UI placeholder.
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [])

  const handleToggle = (day: keyof typeof availability) => {
    setAvailability(prev => ({ ...prev, [day]: !prev[day] }))
  }

  const handleSave = async () => {
    setSaving(true)
    // Here you would save to the specialist_profiles table.
    await new Promise(resolve => setTimeout(resolve, 800))
    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FDFBF7] p-12 flex flex-col items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#0B2341] border-t-transparent rounded-full animate-spin mb-4"></div>
      <div className="text-[#0B2341] font-bold">Loading availability...</div>
    </div>
  )

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ] as const

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/specialist" className="text-gray-400 hover:text-[#D4A017] transition-colors text-sm font-bold flex items-center gap-1">
            &larr; Dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-black text-[#0B2341] tracking-tight mb-2">My Availability</h1>
        <p className="text-gray-500 mb-8">Set the days you are available to take sessions.</p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8 space-y-6">
            {success && (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-100 font-medium flex items-center gap-3">
                <span>✅</span> Availability updated successfully!
              </div>
            )}

            <div className="space-y-4">
              {days.map(day => (
                <div key={day.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <span className="font-bold text-gray-700">{day.label}</span>
                  <button
                    onClick={() => handleToggle(day.key)}
                    className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
                      availability[day.key] ? 'bg-[#0B2341]' : 'bg-gray-200'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${
                        availability[day.key] ? 'left-8' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto px-8 py-3 bg-[#D4A017] text-white rounded-xl font-bold hover:bg-[#b8860b] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {saving ? 'Saving...' : 'Save Availability'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, use } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function EditStudentPage() {
  const params = useParams()
  const studentId = params.id as string
  
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [grade, setGrade] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [curriculum, setCurriculum] = useState('')
  const [learningGoal, setLearningGoal] = useState('')
  
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchStudent() {
      if (!studentId) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single()

      if (error || !data) {
        setError('Could not load student profile.')
      } else {
        setFullName(data.full_name || '')
        setAge(data.age ? data.age.toString() : '')
        setGrade(data.grade || '')
        setSchoolName(data.school_name || '')
        setCurriculum(data.curriculum || '')
        setLearningGoal(data.learning_goal || '')
      }
      setLoading(false)
    }

    fetchStudent()
  }, [studentId, router, supabase])

  const handleUpdateChild = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { error: updateError } = await supabase
      .from('students')
      .update({
        full_name: fullName,
        age: age ? parseInt(age) : null,
        grade,
        school_name: schoolName,
        curriculum,
        learning_goal: learningGoal
      })
      .eq('id', studentId)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    router.push(`/dashboard/parent/student/${studentId}`)
    router.refresh()
  }

  if (loading) return <div className="min-h-screen bg-[#FDFBF7] p-12 flex justify-center text-[#0B2341] font-bold text-xl">Loading...</div>

  if (error) return (
    <div className="min-h-screen bg-[#FDFBF7] p-12">
      <div className="max-w-4xl mx-auto bg-red-50 text-red-600 p-6 rounded-lg border border-red-100 font-medium text-center">
        {error}
        <div className="mt-4">
          <Link href="/dashboard/parent" className="text-blue-600 hover:underline">Return to Dashboard</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Link href={`/dashboard/parent/student/${studentId}`} className="text-[#0B2341] hover:text-[#D4A017] transition-colors flex items-center gap-1 font-bold bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm hover:shadow-md">
            &larr; Back
          </Link>
          <h1 className="text-3xl font-bold text-[#0B2341]">Edit Student Profile</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#D4A017]"></div>
          
          <form onSubmit={handleUpdateChild} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#0B2341] mb-1">Full Name <span className="text-[#D4A017]">*</span></label>
                <input
                  type="text"
                  required
                  className="block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-[#D4A017] focus:ring-[#D4A017] shadow-sm bg-[#FDFBF7]"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#0B2341] mb-1">Age</label>
                <input
                  type="number"
                  className="block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-[#D4A017] focus:ring-[#D4A017] shadow-sm bg-[#FDFBF7]"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#0B2341] mb-1">Grade <span className="text-[#D4A017]">*</span></label>
                <input
                  type="text"
                  required
                  className="block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-[#D4A017] focus:ring-[#D4A017] shadow-sm bg-[#FDFBF7]"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#0B2341] mb-1">School Name</label>
                <input
                  type="text"
                  className="block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-[#D4A017] focus:ring-[#D4A017] shadow-sm bg-[#FDFBF7]"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-[#0B2341] mb-1">Curriculum</label>
                <select
                  className="block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-[#D4A017] focus:ring-[#D4A017] shadow-sm bg-[#FDFBF7]"
                  value={curriculum}
                  onChange={(e) => setCurriculum(e.target.value)}
                >
                  <option value="">Select Curriculum</option>
                  <option value="British">British (IGCSE/A-Levels)</option>
                  <option value="American">American (SAT/AP)</option>
                  <option value="IB">International Baccalaureate (IB)</option>
                  <option value="National">National Curriculum</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0B2341] mb-1">Learning Goal</label>
              <textarea
                rows={4}
                className="block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-[#D4A017] focus:ring-[#D4A017] shadow-sm bg-[#FDFBF7]"
                value={learningGoal}
                onChange={(e) => setLearningGoal(e.target.value)}
              />
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#0B2341] px-8 py-2.5 text-white font-bold rounded-lg hover:bg-blue-900 disabled:opacity-50 transition-all shadow-md hover:shadow-lg border-2 border-transparent hover:border-[#D4A017]"
              >
                {saving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

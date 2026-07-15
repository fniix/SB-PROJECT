'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface TutorApp {
  id: string
  user_id: string
  full_name: string
  email: string
  phone: string
  bio: string
  subjects: string[]
  levels: string[]
  curriculum: string[]
  languages: string[]
  session_types: string[]
  price_per_hour: number
  special_needs_trained: boolean
  cv_url: string | null
  certificate_url: string | null
  demo_video_url: string | null
  available_days: string[]
  available_time: string
  status: string
  created_at: string
}

export default function AdminVerificationsPage() {
  const [applications, setApplications] = useState<TutorApp[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadApplications() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Optional: Check if admin
      const role = user.user_metadata?.role
      if (role !== 'admin') {
        router.push('/dashboard')
        return
      }

      // Fetch pending/under_review applications
      const { data, error } = await supabase
        .from('tutor_applications')
        .select('*')
        .in('status', ['pending', 'under_review'])
        .order('created_at', { ascending: false })

      if (error) {
        if (error.message.includes('Could not find the table')) {
          setError("The 'tutor_applications' table is missing from your Supabase database. Please run the SQL schema to create it.");
        } else {
          setError(error.message);
        }
      } else {
        setApplications(data || [])
      }
      setLoading(false)
    }

    loadApplications()
  }, [router, supabase])

  const handleApprove = async (appId: string) => {
    if (!window.confirm('Approve this tutor application? They will immediately appear on the platform.')) return
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Call our SQL function
    const { error } = await supabase.rpc('approve_tutor_application', {
      p_application_id: appId,
      p_admin_id: user.id
    })

    if (error) {
      alert('Error approving application: ' + error.message)
    } else {
      setApplications(prev => prev.filter(a => a.id !== appId))
      alert('Tutor approved successfully! Their profile is now live.')
    }
  }

  const handleReject = async (appId: string) => {
    const reason = window.prompt('Reject this application? Optional: enter a reason (will be saved in admin notes):')
    if (reason === null) return // Cancelled

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('tutor_applications')
      .update({ 
        status: 'rejected',
        admin_notes: reason,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', appId)

    if (error) {
      alert('Error rejecting application: ' + error.message)
    } else {
      setApplications(prev => prev.filter(a => a.id !== appId))
    }
  }

  const handleMarkReview = async (appId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('tutor_applications')
      .update({ status: 'under_review' })
      .eq('id', appId)

    if (error) {
      alert('Error: ' + error.message)
    } else {
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'under_review' } : a))
    }
  }

  if (loading) return <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center font-bold text-[#0B2341]">Loading applications...</div>

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/dashboard/admin" className="text-[#0B2341] hover:text-[#D4A017] font-bold bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 text-sm">
            &larr; Back
          </Link>
          <h1 className="text-3xl font-bold text-[#0B2341]">Tutor Applications</h1>
        </div>

        {error && <div className="text-red-600 mb-6 bg-red-50 p-4 rounded-xl border border-red-100 text-sm font-medium">{error}</div>}

        {applications.length > 0 ? (
          <div className="space-y-6">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                
                {/* Info Section */}
                <div className="flex-1 p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      app.status === 'under_review' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {app.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-400">
                      Applied: {new Date(app.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-[#0B2341] mb-1">{app.full_name}</h3>
                  <div className="flex gap-4 text-sm text-gray-500 mb-6 font-medium">
                    <span>📧 {app.email}</span>
                    <span>📱 {app.phone}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-2">Teaching Profile</p>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-semibold">Subjects:</span> {app.subjects.join(', ')}</p>
                        <p><span className="font-semibold">Levels:</span> {app.levels.join(', ')}</p>
                        <p><span className="font-semibold">Curriculum:</span> {app.curriculum.join(', ')}</p>
                        <p><span className="font-semibold">Format:</span> {app.session_types.join(', ')}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-2">Details</p>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-semibold">Hourly Rate:</span> {app.price_per_hour} BHD</p>
                        <p><span className="font-semibold">Availability:</span> {app.available_time} ({app.available_days.join(', ')})</p>
                        <p><span className="font-semibold">Special Needs:</span> {app.special_needs_trained ? '✅ Yes' : '❌ No'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-2">Bio</p>
                    <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                      {app.bio || 'No bio provided.'}
                    </p>
                  </div>
                </div>

                {/* Action Section */}
                <div className="w-full md:w-80 bg-gray-50 p-6 md:p-8 flex flex-col justify-between border-l border-gray-100">
                  <div className="space-y-4 mb-8">
                    <p className="text-sm font-bold text-[#0B2341] mb-4">Documents & Links</p>
                    
                    <a href={app.cv_url ? supabase.storage.from('tutor-documents').getPublicUrl(app.cv_url).data.publicUrl : '#'} target="_blank" rel="noreferrer"
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-sm font-semibold
                        ${app.cv_url ? 'border-gray-200 bg-white hover:border-[#D4A017] text-[#0B2341]' : 'border-dashed border-gray-200 text-gray-400 pointer-events-none'}`}>
                      <span>📄</span> CV / Resume
                    </a>
                    
                    <a href={app.certificate_url ? supabase.storage.from('tutor-documents').getPublicUrl(app.certificate_url).data.publicUrl : '#'} target="_blank" rel="noreferrer"
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-sm font-semibold
                        ${app.certificate_url ? 'border-gray-200 bg-white hover:border-[#D4A017] text-[#0B2341]' : 'border-dashed border-gray-200 text-gray-400 pointer-events-none'}`}>
                      <span>🎓</span> Qualifications
                    </a>
                    
                    <a href={app.demo_video_url || '#'} target="_blank" rel="noreferrer"
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-sm font-semibold
                        ${app.demo_video_url ? 'border-blue-200 bg-blue-50 hover:border-blue-400 text-blue-800' : 'border-dashed border-gray-200 text-gray-400 pointer-events-none'}`}>
                      <span>🎥</span> Demo Video Link
                    </a>
                  </div>

                  <div className="space-y-3">
                    {app.status === 'pending' && (
                      <button onClick={() => handleMarkReview(app.id)} className="w-full py-3 rounded-xl font-bold border-2 border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 text-sm transition-colors">
                        Mark as "Under Review"
                      </button>
                    )}
                    <button onClick={() => handleApprove(app.id)} className="w-full py-3 rounded-xl font-bold bg-[#0B2341] text-white hover:bg-[#071829] shadow-md text-sm transition-all border-2 border-transparent hover:border-[#D4A017]">
                      Approve & Publish
                    </button>
                    <button onClick={() => handleReject(app.id)} className="w-full py-3 rounded-xl font-bold border-2 border-red-200 text-red-600 bg-white hover:bg-red-50 text-sm transition-colors">
                      Reject Application
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white border border-gray-100 rounded-3xl p-16 shadow-sm">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm border-2 border-green-200">
              ✅
            </div>
            <h3 className="text-2xl font-bold text-[#0B2341] mb-2">All Caught Up!</h3>
            <p className="text-gray-500 text-lg">There are no pending tutor applications to review right now.</p>
          </div>
        )}
      </div>
    </div>
  )
}

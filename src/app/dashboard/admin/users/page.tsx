import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // Fetch all profiles
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch all student profiles (children)
  const { data: students } = await supabase
    .from('student_profiles')
    .select('*, parent:parent_id(full_name)')
    .order('created_at', { ascending: false })

  const parents = users?.filter(u => u.role === 'parent') || []
  const tutors = users?.filter(u => u.role === 'tutor') || []
  const admins = users?.filter(u => u.role === 'admin') || []

  return (
    <div className="p-6 space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div>
        <h1 className="text-2xl font-black text-[#0B2341]">👥 User Management</h1>
        <p className="text-gray-400 text-sm mt-1">Manage all parents, students, tutors, and admins</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Parents', value: parents.length, icon: '👨‍👩‍👧', bg: 'bg-[#0B2341] text-white', valColor: 'text-[#D4A017]' },
          { label: 'Students', value: students?.length || 0, icon: '👧', bg: 'bg-white border border-gray-100', valColor: 'text-[#0B2341]' },
          { label: 'Tutors', value: tutors.length, icon: '👨‍🏫', bg: 'bg-white border border-gray-100', valColor: 'text-[#0B2341]' },
          { label: 'Admins', value: admins.length, icon: '🛡️', bg: 'bg-white border border-gray-100', valColor: 'text-gray-400' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-5 shadow-sm`}>
            <div className="flex justify-between items-start mb-2">
              <p className={`text-sm font-medium ${s.bg.includes('text-white') ? 'text-gray-300' : 'text-gray-500'}`}>{s.label}</p>
              <span className="text-xl">{s.icon}</span>
            </div>
            <p className={`text-3xl font-black ${s.valColor}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Parents List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-black text-[#0B2341] text-lg">Parents ({parents.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-bold text-gray-400 uppercase pb-3">Name</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase pb-3">Joined</th>
                  <th className="text-right text-xs font-bold text-gray-400 uppercase pb-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {parents.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <p className="font-bold text-[#0B2341]">{p.full_name}</p>
                      <p className="text-gray-400 text-xs truncate max-w-[150px]">{p.id}</p>
                    </td>
                    <td className="py-3 text-gray-500 text-xs">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td className="py-3 text-right">
                      <button className="text-xs text-[#D4A017] font-bold hover:underline">View</button>
                    </td>
                  </tr>
                ))}
                {parents.length === 0 && <tr><td colSpan={3} className="py-4 text-center text-gray-400">No parents found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tutors List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-black text-[#0B2341] text-lg">Tutors ({tutors.length})</h2>
            <Link href="/dashboard/admin/verifications" className="text-xs font-bold text-[#D4A017] hover:underline">Verify Pending →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-bold text-gray-400 uppercase pb-3">Name</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase pb-3">Status</th>
                  <th className="text-right text-xs font-bold text-gray-400 uppercase pb-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tutors.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <p className="font-bold text-[#0B2341]">{t.full_name}</p>
                      <p className="text-gray-400 text-xs truncate max-w-[150px]">{t.id}</p>
                    </td>
                    <td className="py-3">
                      <span className="text-[10px] font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full uppercase">Approved</span>
                    </td>
                    <td className="py-3 text-right">
                      <button className="text-xs text-[#D4A017] font-bold hover:underline">View</button>
                    </td>
                  </tr>
                ))}
                {tutors.length === 0 && <tr><td colSpan={3} className="py-4 text-center text-gray-400">No tutors found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden">
        <h2 className="font-black text-[#0B2341] text-lg mb-5">Students / Children ({students?.length || 0})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-bold text-gray-400 uppercase pb-3">Name</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase pb-3">Parent</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase pb-3">Grade</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase pb-3">Curriculum</th>
                <th className="text-right text-xs font-bold text-gray-400 uppercase pb-3">Needs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students?.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="py-3 font-bold text-[#0B2341]">{s.full_name}</td>
                  <td className="py-3 text-gray-600 text-xs">{s.parent?.full_name || 'Unknown'}</td>
                  <td className="py-3 text-gray-600 text-xs">{s.grade || '—'}</td>
                  <td className="py-3 text-gray-600 text-xs">{s.curriculum || '—'}</td>
                  <td className="py-3 text-right">
                    {s.special_needs ? (
                      <span className="text-[10px] font-bold px-2 py-1 bg-teal-100 text-teal-700 rounded-full uppercase">Special Support</span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {(!students || students.length === 0) && <tr><td colSpan={5} className="py-4 text-center text-gray-400">No students found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

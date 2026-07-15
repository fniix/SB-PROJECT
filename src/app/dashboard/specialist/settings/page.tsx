
import Link from 'next/link'

export default function Page() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/specialist" className="text-gray-400 hover:text-[#D4A017] transition-colors text-sm font-bold flex items-center gap-1">
            &larr; Dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-black text-[#0B2341] mb-6">Profile Settings</h1>
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
          <div className="text-4xl mb-4">⚙️</div>
          <h3 className="text-xl font-bold text-[#0B2341] mb-2">Coming Soon</h3>
          <p className="text-gray-500 max-w-md mx-auto">Update your professional profile and credentials.</p>
        </div>
      </div>
    </div>
  )
}
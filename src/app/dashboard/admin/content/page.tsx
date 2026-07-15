import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminContentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="p-6 space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-[#0B2341]">📝 Content Management</h1>
          <p className="text-gray-400 text-sm mt-1">Manage FAQs, policies, and platform text</p>
        </div>
        <button className="bg-[#0B2341] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#071829] transition-colors">
          + Add Content
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar Nav */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 h-fit">
          <ul className="space-y-1">
            <li>
              <button className="w-full text-left px-4 py-3 bg-[#F0EDE8] text-[#0B2341] rounded-xl font-bold text-sm">
                📌 Frequently Asked Questions (FAQ)
              </button>
            </li>
            <li>
              <button className="w-full text-left px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-semibold text-sm transition-colors">
                📜 Privacy Policy
              </button>
            </li>
            <li>
              <button className="w-full text-left px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-semibold text-sm transition-colors">
                ⚖️ Terms & Conditions
              </button>
            </li>
            <li>
              <button className="w-full text-left px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-semibold text-sm transition-colors">
                🛡️ Safeguarding Policy
              </button>
            </li>
            <li>
              <button className="w-full text-left px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-semibold text-sm transition-colors">
                💵 Refund Policy
              </button>
            </li>
          </ul>
        </div>

        {/* Content Editor */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-black text-[#0B2341] text-lg">FAQs List</h2>
            <div className="relative">
              <input type="text" placeholder="Search FAQs..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#D4A017] w-64" />
              <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { q: 'What payment methods are accepted?', a: 'We accept credit/debit cards, BenefitPay, and SB Project wallet credits. The wallet can be topped up in advance and used for any session.', cat: 'Payments' },
              { q: 'How are tutors verified?', a: 'Every tutor submits identity documents, qualification proof, and a demo lesson. Our admin team reviews everything and conducts a brief interview before approval.', cat: 'Tutors' },
              { q: 'Do you support students with ADHD or dyslexia?', a: 'Yes. We have tutors with verified training in ADHD support, dyslexia strategies, autism spectrum support, and other learning differences.', cat: 'Special Needs' }
            ].map((faq, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-[#D4A017] transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-[#0B2341] text-sm">{faq.q}</h3>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-gray-400 hover:text-blue-500 transition-colors">✏️</button>
                    <button className="text-gray-400 hover:text-red-500 transition-colors">🗑️</button>
                  </div>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed mb-3">{faq.a}</p>
                <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded-md">
                  {faq.cat}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-center">
            <button className="text-[#D4A017] font-bold text-sm hover:underline">Load More...</button>
          </div>
        </div>
      </div>
    </div>
  )
}

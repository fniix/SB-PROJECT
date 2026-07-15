import type { Metadata } from 'next'
import PublicNav from '@/components/PublicNav'
import PublicFooter from '@/components/PublicFooter'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Terms & Conditions — SB Project', description: 'SB Project terms and conditions for parents, students, and tutors using the platform.' }

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      <PublicNav />
      <div className="pt-24 bg-[#0B2341] pb-12">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-black text-white mb-2">Terms & Conditions</h1>
          <p className="text-gray-300 text-sm">Last updated: June 2026 | SB Project, Kingdom of Bahrain</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-16">
        {[
          { title: '1. Acceptance of Terms', content: 'By creating an account or using the SB Project platform, you agree to these Terms & Conditions. If you do not agree, do not use the platform.' },
          { title: '2. User Roles', content: 'SB Project serves parents/guardians, school students, and tutors. Each role has specific permissions. Admin accounts are internal only.' },
          { title: '3. Account Responsibilities', content: 'You are responsible for maintaining the security of your account. Do not share your login credentials. You are responsible for all activity under your account.' },
          { title: '4. Tutor Standards', content: 'Tutors must pass verification before appearing publicly. Tutors must provide accurate qualifications, attend booked sessions, and adhere to our safeguarding and communication policies.' },
          { title: '5. Booking & Payment', content: 'Bookings are confirmed upon payment. Prices shown at checkout are final. Session fees, platform fees, and applicable taxes are shown before payment. We do not store raw card data.' },
          { title: '6. Cancellation', content: 'Cancellations made 24+ hours before a session receive a full wallet credit. Cancellations within 24 hours receive 50% credit. Cancellations within 3 hours are non-refundable unless the tutor cancels. See our Refund Policy for full details.' },
          { title: '7. Academic Integrity', content: 'SB Project tutors provide learning guidance and support. Tutors must not complete assignments, exams, or academic work on behalf of students. This violates our terms and may result in tutor removal.' },
          { title: '8. Prohibited Conduct', content: 'Users may not: share contact details outside the platform with minors, conduct sessions outside the platform booking system, harass or threaten other users, post false reviews, or misuse the refund system.' },
          { title: '9. Limitation of Liability', content: 'SB Project is a managed marketplace. We facilitate connections between parents and tutors. We do not guarantee specific academic outcomes. We are not liable for tutor misconduct beyond our stated dispute resolution process.' },
          { title: '10. Governing Law', content: 'These terms are governed by the laws of the Kingdom of Bahrain. Disputes shall be resolved through appropriate Bahraini legal channels.' },
        ].map(s => (
          <div key={s.title} className="mb-8">
            <h2 className="text-xl font-black text-[#0B2341] mb-3">{s.title}</h2>
            <p className="text-gray-600 leading-relaxed">{s.content}</p>
          </div>
        ))}
        <div className="mt-12 flex gap-4 flex-wrap">
          <Link href="/legal/privacy" className="text-[#D4A017] font-bold hover:underline">Privacy Policy →</Link>
          <Link href="/legal/refund" className="text-[#D4A017] font-bold hover:underline">Refund Policy →</Link>
          <Link href="/legal/safeguarding" className="text-[#D4A017] font-bold hover:underline">Safeguarding Policy →</Link>
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}

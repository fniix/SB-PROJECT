import type { Metadata } from 'next'
import PublicNav from '@/components/PublicNav'
import PublicFooter from '@/components/PublicFooter'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — SB Project',
  description: 'SB Project privacy policy — how we collect, use, and protect your personal data and your child\'s information.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      <PublicNav />
      <div className="pt-24 bg-[#0B2341] pb-12">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-black text-white mb-2">Privacy Policy</h1>
          <p className="text-gray-300 text-sm">Last updated: June 2026 | SB Project, Kingdom of Bahrain</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-16 prose prose-gray max-w-none">
        {[
          { title: '1. Introduction', content: 'SB Project ("we", "us", "our") is committed to protecting the privacy of all users of our platform, especially parents, students, and minors. This policy explains what data we collect, how we use it, and how we protect it.' },
          { title: '2. Data We Collect', content: 'We collect: name, email address, phone number, payment method details (processed securely by a third-party gateway — we never store raw card data), child profile information (name, grade, curriculum, learning goals), session reports and progress data, support ticket content, and usage data for platform improvement.' },
          { title: '3. How We Use Your Data', content: 'We use data to: create and manage your account, match your child with appropriate tutors, process bookings and payments, generate session reports, send important notifications about bookings and sessions, provide customer support, improve our platform and services, and comply with legal obligations in the Kingdom of Bahrain.' },
          { title: '4. Data Relating to Minors', content: 'We take the protection of children\'s data very seriously. Child profiles are accessible only to the registered parent/guardian. Tutors can view a child\'s learning profile and session history only for sessions they are assigned to. We collect only the minimum information necessary to provide learning support.' },
          { title: '5. Data Sharing', content: 'We do not sell personal data to third parties. Data may be shared with: payment processors (for transaction processing only), tutors (limited to the information needed for their sessions), and legal authorities if required by law in Bahrain.' },
          { title: '6. Data Retention', content: 'Account data is retained while your account is active. After account deletion, we retain minimal records for legal and financial compliance purposes for up to 3 years as required by Bahraini law.' },
          { title: '7. Your Rights', content: 'You have the right to: access your personal data, correct inaccurate data, request deletion of your account and data, withdraw consent for non-essential processing, and lodge a complaint with the relevant authority in Bahrain.' },
          { title: '8. Security', content: 'We use industry-standard security measures including encrypted data transmission, secure password storage, and role-based access control. No raw card data is stored on SB Project servers.' },
          { title: '9. Contact', content: 'For privacy concerns or data requests, contact us at: privacy@sbproject.bh or through the Contact page.' },
        ].map(s => (
          <div key={s.title} className="mb-8">
            <h2 className="text-xl font-black text-[#0B2341] mb-3">{s.title}</h2>
            <p className="text-gray-600 leading-relaxed">{s.content}</p>
          </div>
        ))}
        <div className="mt-12 flex gap-4 flex-wrap">
          <Link href="/legal/terms" className="text-[#D4A017] font-bold hover:underline">Terms & Conditions →</Link>
          <Link href="/legal/refund" className="text-[#D4A017] font-bold hover:underline">Refund Policy →</Link>
          <Link href="/legal/safeguarding" className="text-[#D4A017] font-bold hover:underline">Safeguarding Policy →</Link>
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}

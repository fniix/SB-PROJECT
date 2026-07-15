import type { Metadata } from 'next'
import PublicNav from '@/components/PublicNav'
import PublicFooter from '@/components/PublicFooter'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Safeguarding Policy — SB Project', description: 'SB Project safeguarding policy — how we protect minors on the platform and ensure safe, professional tutor communication.' }

export default function SafeguardingPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      <PublicNav />
      <div className="pt-24 bg-teal-900 pb-12">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-black text-white mb-2">Safeguarding Policy</h1>
          <p className="text-teal-300 text-sm">Last updated: June 2026 | SB Project, Kingdom of Bahrain</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 mb-10">
          <p className="text-teal-800 font-semibold text-sm">
            🛡️ SB Project takes the safety of all users — especially minors — very seriously. This policy outlines how we protect children and ensure professional, safe interactions on our platform.
          </p>
        </div>

        {[
          { title: '1. Our Commitment', content: 'SB Project is committed to creating a safe learning environment for every student. We believe every learner has the right to safe, respectful, and professional educational support. Safeguarding is built into every part of our platform — from tutor verification to session communication.' },
          { title: '2. Who This Policy Applies To', content: 'This policy applies to all users of SB Project, including parents, guardians, school-age students (minors), tutors, and platform administrators. All users must agree to this policy when creating an account.' },
          { title: '3. Communication Rules', content: 'All communication between tutors and students (especially minors) must happen inside the SB Project platform. Tutors must not: request personal contact information from students or parents, contact students or parents through personal phone numbers, social media, or messaging apps, conduct sessions outside the platform booking system, or communicate with minors without parent visibility.' },
          { title: '4. Tutor Verification for Minors', content: 'Tutors teaching school-age students (minors) undergo additional review during verification. This includes identity document verification, qualification verification, demo lesson review, admin interview, and a probation period covering the first 10 sessions. Tutors with unresolved safeguarding concerns are removed from the platform immediately.' },
          { title: '5. Session Monitoring', content: 'Sessions are conducted through platform-tracked join links. Session reports are mandatory after every class with a minor. Parents can view all session reports. Admins can review session notes and flag any concerns. Our quality team monitors low-rated sessions and unusual patterns.' },
          { title: '6. Incident Reporting', content: 'Any safeguarding concern — whether from a parent, student, tutor, or observer — should be reported immediately through: the Support Ticket system (select "Safety Concern" as category), or by contacting our team directly at safety@sbproject.bh. All reports are reviewed by our safeguarding lead within 24 hours.' },
          { title: '7. Special Needs Learners', content: 'Additional safeguarding measures apply for learners with special needs: only trained, admin-approved tutors work with this group, intake forms collect sensitivity information to protect the learner, parent consent is required before any session, and session lengths are adjusted to the learner\'s tolerance to prevent distress.' },
          { title: '8. Data Protection for Minors', content: 'Child profiles are visible only to the registered parent/guardian and assigned tutors. We collect only the minimum data necessary for educational support. We do not share minor data with third parties for any commercial purpose.' },
          { title: '9. Violations', content: 'Any tutor found to have violated this safeguarding policy will be immediately suspended pending investigation and, if confirmed, permanently removed from the platform. Serious violations will be reported to relevant Bahraini authorities.' },
          { title: '10. Contact', content: 'Safeguarding Lead: safety@sbproject.bh\nGeneral Support: support@sbproject.bh\nEmergency (child safety): Please contact Bahrain authorities if there is immediate risk to a child.' },
        ].map(s => (
          <div key={s.title} className="mb-8">
            <h2 className="text-xl font-black text-[#0B2341] mb-3">{s.title}</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{s.content}</p>
          </div>
        ))}

        <div className="mt-10 flex gap-4 flex-wrap">
          <Link href="/legal/privacy" className="text-[#D4A017] font-bold hover:underline">Privacy Policy →</Link>
          <Link href="/legal/terms" className="text-[#D4A017] font-bold hover:underline">Terms & Conditions →</Link>
          <Link href="/legal/refund" className="text-[#D4A017] font-bold hover:underline">Refund Policy →</Link>
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}

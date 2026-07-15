import Link from 'next/link'

const footerLinks = {
  Platform: [
    { href: '/school-students', label: 'School Students' },
    { href: '/special-needs', label: 'Special Needs Support' },
    { href: '/pricing', label: 'Pricing Plans' },
    { href: '/apply', label: 'Become a Tutor' },
  ],
  Support: [
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/about', label: 'About SB Project' },
  ],
  Legal: [
    { href: '/legal/privacy', label: 'Privacy Policy' },
    { href: '/legal/terms', label: 'Terms & Conditions' },
    { href: '/legal/refund', label: 'Refund Policy' },
    { href: '/legal/safeguarding', label: 'Safeguarding Policy' },
  ],
}

export default function PublicFooter() {
  return (
    <footer className="bg-[#0B2341] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/assets/logo/sb_logo_light.png" alt="SB Project Logo" className="h-10 w-auto" />
              <span className="font-black text-white text-2xl">SB <span className="text-[#D4A017]">Project</span></span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6 max-w-xs">
              Bahrain's trusted learning platform connecting students with verified tutors for measurable academic progress.
            </p>
            <p className="text-[#D4A017] text-sm font-bold italic">"Because Every Learner Matters"</p>
            <div className="flex gap-3 mt-6">
              <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center text-sm hover:bg-[#D4A017] transition-colors cursor-pointer">📧</div>
              <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center text-sm hover:bg-[#D4A017] transition-colors cursor-pointer">📱</div>
              <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center text-sm hover:bg-[#D4A017] transition-colors cursor-pointer">💬</div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-[#D4A017] font-bold text-sm uppercase tracking-wider mb-4">{group}</h4>
              <ul className="space-y-2.5">
                {links.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-gray-300 text-sm hover:text-white transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">© 2026 SB Project. All rights reserved. Kingdom of Bahrain.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-gray-400 text-xs">Platform Online</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

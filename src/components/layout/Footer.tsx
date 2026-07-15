import Link from "next/link";

export default function Footer() {
  const footerLinks = {
    Company: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Contact", href: "/contact" },
    ],
    Platform: [
      { name: "How It Works", href: "/how-it-works" },
      { name: "Pricing", href: "/pricing" },
      { name: "Tutors", href: "/tutors" },
    ],
    Legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Refund Policy", href: "/refunds" },
      { name: "Safeguarding", href: "/safeguarding" },
    ],
  };

  return (
    <footer className="bg-[var(--color-sb-primary)] text-white py-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
          <span className="text-2xl font-bold tracking-tight text-[var(--color-sb-background)] flex items-center gap-2">
            <img src="/assets/logo/sb_logo_light.png" alt="SB Project Logo" className="h-10 w-auto" />
            SB Project
          </span>
          <p className="text-sm text-gray-300 leading-relaxed">
            Learning support for every future. A Bahrain-based education ecosystem built on trust, quality, and verified progress.
          </p>
        </div>

        {Object.entries(footerLinks).map(([category, links]) => (
          <div key={category} className="flex flex-col gap-4">
            <h4 className="font-semibold text-lg text-[var(--color-sb-secondary)]">
              {category}
            </h4>
            <ul className="flex flex-col gap-3">
              {links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} SB Project. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          {/* Social icons can go here */}
        </div>
      </div>
    </footer>
  );
}

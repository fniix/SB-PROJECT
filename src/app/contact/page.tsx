'use client'
import { useState } from 'react'
import PublicNav from '@/components/PublicNav'
import PublicFooter from '@/components/PublicFooter'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', category: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      <PublicNav />

      {/* Hero */}
      <section className="bg-[#0B2341] pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <span className="inline-block bg-[#D4A017]/20 text-[#D4A017] text-sm font-bold px-4 py-1.5 rounded-full mb-6 border border-[#D4A017]/30">Get In Touch</span>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
            We're Here to <span className="text-[#D4A017]">Help</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Whether you have a question, a booking issue, or a concern — our team responds quickly.
          </p>
        </div>
      </section>

      {/* Quick Contact Options */}
      <section className="py-14 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '💬', title: 'WhatsApp', desc: 'Fastest response. Message us directly.', action: 'Open WhatsApp', href: 'https://wa.me/973XXXXXXXX', color: 'bg-green-500' },
              { icon: '📧', title: 'Email', desc: 'For detailed inquiries and attachments.', action: 'support@sbproject.bh', href: 'mailto:support@sbproject.bh', color: 'bg-blue-500' },
              { icon: '🕐', title: 'Support Hours', desc: 'Sunday to Thursday: 8am – 8pm\nFriday & Saturday: 10am – 6pm', action: null, href: null, color: 'bg-[#0B2341]' },
            ].map(c => (
              <div key={c.title} className="bg-[#F0EDE8] rounded-2xl p-6 border border-gray-100 text-center hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${c.color} rounded-xl flex items-center justify-center text-2xl mx-auto mb-4`}>{c.icon}</div>
                <h3 className="font-bold text-[#0B2341] mb-2">{c.title}</h3>
                <p className="text-gray-500 text-sm mb-4 whitespace-pre-line">{c.desc}</p>
                {c.action && c.href && (
                  <a href={c.href} target="_blank" rel="noopener noreferrer" className="inline-block bg-[#0B2341] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#071829] transition-all">
                    {c.action}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-[#F0EDE8]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Info */}
            <div>
              <h2 className="text-3xl font-black text-[#0B2341] mb-6">Send Us a Message</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                For booking issues, payment disputes, tutor concerns, or any platform question — fill the form and our team will respond within a few hours.
              </p>
              <div className="space-y-4">
                {[
                  { icon: '📅', title: 'Booking Issues', desc: 'Cancellations, reschedules, join link problems.' },
                  { icon: '💳', title: 'Payment Questions', desc: 'Invoices, refunds, wallet top-up issues.' },
                  { icon: '🛡️', title: 'Tutor Concerns', desc: 'Quality, professionalism, safeguarding.' },
                  { icon: '💛', title: 'Special Needs Consultation', desc: 'Request a consultation for your child\'s support needs.' },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="font-bold text-[#0B2341] text-sm">{item.title}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            {submitted ? (
              <div className="bg-white rounded-3xl shadow-md p-12 text-center border border-gray-100">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-black text-[#0B2341] mb-2">Message Received!</h3>
                <p className="text-gray-500">Our team will get back to you within a few hours. Check your email for confirmation.</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-md p-8 border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#0B2341] mb-1.5">Full Name *</label>
                      <input required type="text" placeholder="Your name" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                        className="w-full rounded-xl border border-gray-200 bg-[#F0EDE8] px-4 py-3 text-sm focus:outline-none focus:border-[#D4A017]" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0B2341] mb-1.5">Phone</label>
                      <input type="tel" placeholder="+973 XXXX XXXX" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                        className="w-full rounded-xl border border-gray-200 bg-[#F0EDE8] px-4 py-3 text-sm focus:outline-none focus:border-[#D4A017]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#0B2341] mb-1.5">Email Address *</label>
                    <input required type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                      className="w-full rounded-xl border border-gray-200 bg-[#F0EDE8] px-4 py-3 text-sm focus:outline-none focus:border-[#D4A017]" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#0B2341] mb-1.5">Category *</label>
                    <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                      className="w-full rounded-xl border border-gray-200 bg-[#F0EDE8] px-4 py-3 text-sm focus:outline-none focus:border-[#D4A017]">
                      <option value="">Select a category</option>
                      <option>Booking Issue</option>
                      <option>Payment Question</option>
                      <option>Tutor Concern</option>
                      <option>Special Needs Consultation</option>
                      <option>Technical Problem</option>
                      <option>General Question</option>
                      <option>Apply as Tutor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#0B2341] mb-1.5">Message *</label>
                    <textarea required rows={4} placeholder="Describe your question or concern in detail..." value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                      className="w-full rounded-xl border border-gray-200 bg-[#F0EDE8] px-4 py-3 text-sm focus:outline-none focus:border-[#D4A017] resize-none" />
                  </div>
                  <button type="submit" className="w-full bg-[#0B2341] text-white py-4 rounded-xl font-black text-base hover:bg-[#071829] border-2 border-transparent hover:border-[#D4A017] transition-all shadow-md">
                    Send Message
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

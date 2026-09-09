import { useState } from 'react'
import PageShell from '../components/PageShell'
import { IconMailFooter, IconPhone, IconClock } from '../components/icons'

const CHANNELS = [
  { icon: IconMailFooter, label: 'Email', value: 'support@smads.com' },
  { icon: IconPhone, label: 'WhatsApp / Phone', value: '+92 300 0000000' },
  { icon: IconClock, label: 'Support Hours', value: 'Mon–Sat, 9AM–8PM PKT' },
]

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // No backend "contact" endpoint yet — this simply confirms receipt client-side.
    setSent(true)
  }

  return (
    <PageShell
      eyebrow="Get In Touch"
      title="We're here to help"
      subtitle="Questions about registration, payments, or a job category? Reach out and our team will get back to you."
    >
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {CHANNELS.map(({ icon: Icon, label, value }) => (
            <div key={label} className="glass-card rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
              <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Icon />
              </span>
              <div>
                <div className="text-xs text-gray-400">{label}</div>
                <div className="text-sm font-bold text-gray-800">{value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-3 glass-card rounded-2xl border border-gray-200 p-6 sm:p-8">
          {sent ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-bold text-gray-900 mb-1.5">Message sent!</h3>
              <p className="text-gray-500 text-sm">Thanks for reaching out — we'll reply within 1 business day.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                required
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="form-input"
              />
              <input
                required
                type="email"
                placeholder="Your email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="form-input"
              />
              <textarea
                required
                rows={5}
                placeholder="How can we help?"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="form-input resize-none"
              />
              <button type="submit" className="btn-primary w-full py-3.5 text-sm font-bold">
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </PageShell>
  )
}

import { Link } from 'react-router-dom'
import PageShell from '../components/PageShell'
import { IconArrowRight, IconWallet, IconUsers, IconTag } from '../components/icons'

const TOPICS = [
  { icon: IconWallet, title: 'Payments & Registration', desc: 'Fee amounts, payment methods, and screenshot verification.', to: '/faq' },
  { icon: IconTag, title: 'Jobs & Applications', desc: 'How to apply, track applications, and the 3-day activity rule.', to: '/faq' },
  { icon: IconUsers, title: 'Account & Profile', desc: 'Updating your bio, changing your password, and account status.', to: '/settings' },
]

export default function HelpSupport() {
  return (
    <PageShell
      eyebrow="Help Center"
      title="How can we help?"
      subtitle="Browse common topics below, or reach out directly if you can't find what you need."
    >
      <div className="grid sm:grid-cols-3 gap-5 mb-12">
        {TOPICS.map(({ icon: Icon, title, desc, to }) => (
          <Link key={title} to={to} className="glass-card rounded-2xl border border-gray-200 p-6 hover:border-amber-300 transition-colors group">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Icon />
            </div>
            <h3 className="font-bold text-gray-900 mb-1.5">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-3">{desc}</p>
            <span className="text-amber-600 text-xs font-bold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Learn more <IconArrowRight />
            </span>
          </Link>
        ))}
      </div>

      <div className="glass-card rounded-2xl border border-gray-200 p-7 sm:p-9 text-center">
        <h2 className="font-extrabold text-gray-900 mb-2">Still need help?</h2>
        <p className="text-gray-500 text-sm mb-5">Our support team typically replies within 1 business day.</p>
        <Link to="/contact" className="btn-primary w-auto py-3 px-8 inline-flex items-center gap-2 text-sm">
          Contact Support <IconArrowRight />
        </Link>
      </div>
    </PageShell>
  )
}

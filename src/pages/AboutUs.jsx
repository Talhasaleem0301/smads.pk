import PageShell from '../components/PageShell'
import { IconUsers, IconShieldCheck, IconZap, IconTag } from '../components/icons'

const VALUES = [
  { icon: IconShieldCheck, title: 'Trust First', desc: 'A mandatory registration fee and admin-verified payments keep the community serious and scam-free.' },
  { icon: IconZap, title: 'Real Opportunities', desc: 'Every job category connects members to genuine, paid freelance work — not empty promises.' },
  { icon: IconUsers, title: 'Community Driven', desc: 'Social features let members build a network, not just complete transactions.' },
  { icon: IconTag, title: 'Fair & Transparent', desc: 'Clear pricing, visible payment proofs, and honest account rules for everyone.' },
]

export default function AboutUs() {
  return (
    <PageShell
      eyebrow="About Sm Ads"
      title="Where social networking meets real freelance work"
      subtitle="Sm Ads is a hybrid platform: part social network, part hiring marketplace. Members build a profile, connect with others, and get hired for paid tasks across categories like TikTok, Instagram, YouTube, assignments, typing, and Facebook page management."
    >
      <div className="grid sm:grid-cols-2 gap-5 mb-14">
        {VALUES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="glass-card rounded-2xl border border-gray-200 p-6">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Icon />
            </div>
            <h3 className="font-bold text-gray-900 mb-1.5">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl border border-gray-200 p-7 sm:p-9">
        <h2 className="text-xl font-extrabold mb-3">Our Mission</h2>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          We built Sm Ads to solve a simple problem: freelance platforms are full of noise, and social platforms
          don't pay the bills. By combining a verified membership model with real hiring tools, we give workers a
          trustworthy place to earn and employers a serious pool of talent to hire from.
        </p>
        <p className="text-gray-600 text-sm leading-relaxed">
          Every member pays a one-time registration fee to join, and accounts that stay inactive for 3 consecutive
          days are automatically expired — keeping the platform active, accountable, and productive for everyone.
        </p>
      </div>
    </PageShell>
  )
}

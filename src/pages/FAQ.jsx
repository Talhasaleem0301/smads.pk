import { useState } from 'react'
import PageShell from '../components/PageShell'

const IconChevron = ({ open }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const FAQS = [
  { q: 'Why do I have to pay a registration fee?', a: 'The one-time fee filters out serious members and helps keep the platform free of spam accounts. It also unlocks both the social networking and job-hiring features.' },
  { q: 'What happens if my account is inactive for 3 days?', a: 'If a hired worker doesn\'t submit or perform any work for 3 consecutive days, their account status automatically changes to "Expired." You\'ll be notified before and after this happens.' },
  { q: 'Can I reactivate an expired account?', a: 'Yes — an admin can manually reactivate your account, with or without a reactivation fee depending on the situation. Simply signing back in also reactivates an expired account.' },
  { q: 'How do I know my payment was received?', a: 'After paying the registration fee, you\'ll be asked to upload a screenshot of your payment. An admin reviews and approves it — you can track the status from your Profile page.' },
  { q: 'What is the qualification test?', a: 'Once your payment is approved, a 10-question test unlocks 24 hours later. You need at least 6 correct answers to pass and become eligible for job assignments.' },
  { q: 'Which payment methods are supported?', a: 'JazzCash is the only supported payment method for the registration fee. Send to our official JazzCash number: 03157906576.' },
  { q: 'Can I apply to more than one job category?', a: 'Yes — you can apply to as many job categories as you like from your Profile\'s "Job Applications" section.' },
]

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(0)

  return (
    <PageShell
      eyebrow="FAQ"
      title="Frequently Asked Questions"
      subtitle="Everything about registration, fees, and the 3-day activity rule."
    >
      <div className="space-y-3">
        {FAQS.map((item, i) => (
          <div key={item.q} className="glass-card rounded-2xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
              className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
            >
              <span className="text-sm font-bold text-gray-800">{item.q}</span>
              <span className="text-gray-400 flex-shrink-0"><IconChevron open={openIdx === i} /></span>
            </button>
            {openIdx === i && (
              <div className="px-6 pb-5 text-sm text-gray-500 leading-relaxed">{item.a}</div>
            )}
          </div>
        ))}
      </div>
    </PageShell>
  )
}

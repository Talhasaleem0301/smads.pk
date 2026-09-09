import PageShell from '../components/PageShell'

const SECTIONS = [
  { title: '1. Registration & Membership Fee', body: 'Access to Sm Ads requires a one-time, non-refundable registration fee, payable via JazzCash only (03157906576). Your account remains "Pending Payment" until the fee is verified by an admin.' },
  { title: '2. 3-Day Inactivity & Auto-Expiry', body: 'Any hired worker who does not perform or submit work for 3 consecutive days will have their account automatically changed to "Expired." Expired accounts lose access to job features until reactivated.' },
  { title: '3. Qualification Test', body: 'After payment approval, members must pass a 10-question qualification test (minimum 6 correct) within 24 hours of it unlocking, to remain eligible for job assignments.' },
  { title: '4. User Conduct', body: 'Members agree not to post harmful, fraudulent, or misleading content, and to complete assigned work honestly and on time.' },
  { title: '5. Payments & Wallet', body: 'Earnings from completed jobs are credited to your in-platform wallet. Withdrawals are processed via JazzCash.' },
  { title: '6. Account Termination', body: 'Sm Ads reserves the right to suspend or terminate accounts that violate these terms, engage in fraud, or repeatedly fail the 3-day activity rule.' },
  { title: '7. Changes to These Terms', body: 'We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the revised terms.' },
]

export default function Terms() {
  return (
    <PageShell eyebrow="Legal" title="Terms & Conditions" subtitle="Last updated: August 2026">
      <div className="space-y-8">
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <h2 className="font-extrabold text-gray-900 mb-2">{s.title}</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </PageShell>
  )
}

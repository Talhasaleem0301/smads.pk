import PageShell from '../components/PageShell'

const SECTIONS = [
  { title: '1. Information We Collect', body: 'We collect your name, email, and payment details when you register, plus any profile info (bio, work history) you choose to add.' },
  { title: '2. How We Use Your Data', body: 'Your data is used to operate your account, verify payments, match you with job categories, and communicate important account updates (payment status, test results, expiry notices).' },
  { title: '3. Payment Screenshots', body: 'Screenshots uploaded for payment verification are visible only to admin reviewers and are used solely to confirm your registration fee.' },
  { title: '4. Data Sharing', body: 'We do not sell your personal data. Limited information (name, rating) may be visible to employers when you apply for jobs.' },
  { title: '5. Data Security', body: 'Passwords are hashed and never stored in plain text. Access to sensitive data is restricted to authorized admin accounts.' },
  { title: '6. Your Rights', body: 'You can update your profile info at any time from Settings, and can request account deletion by contacting support.' },
]

export default function PrivacyPolicy() {
  return (
    <PageShell eyebrow="Legal" title="Privacy Policy" subtitle="Last updated: August 2026">
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

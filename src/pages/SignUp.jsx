import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { authApi, paymentApi, setSession } from '../lib/api'
import PaymentProofModal from '../components/PaymentProofModal'
import TestPromptModal from '../components/TestPromptModal'
import RegistrationFeeModal from '../components/RegistrationFeeModal'
import JobCategoryModal from '../components/JobCategoryModal'
import logo from '../assets/sm-ads-logo-white.svg'

// ─── Icons ───────────────────────────────────────────────────────────
const IconUser = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/>
  </svg>
)
const IconMail = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
)
const IconLock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const IconBriefcase = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
)
const IconEye = ({ open }) => open ? (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
    <line x1="2" x2="22" y1="2" y2="22"/>
  </svg>
)
const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
)
const IconArrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
)
const IconGoogle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)
const IconShield = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const IconCreditCard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="5" rx="2"/>
    <line x1="2" x2="22" y1="10" y2="10"/>
  </svg>
)
const IconReceipt = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
    <path d="M12 6v12"/>
  </svg>
)

// ─── Password strength meter ──────────────────────────────────────────
const getStrength = (pw) => {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}
const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e']

const PasswordStrength = ({ password }) => {
  const score = getStrength(password)
  if (!password) return null
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? strengthColor[score] : 'rgba(255,255,255,0.1)' }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color: strengthColor[score] }}>
        {strengthLabel[score]} password
      </p>
    </div>
  )
}

// ─── Step indicator ───────────────────────────────────────────────────
const StepIndicator = ({ current, total }) => (
  <div className="flex items-center gap-2 mb-8">
    {Array.from({ length: total }, (_, i) => (
      <div key={i} className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-400
          ${i < current
            ? 'bg-yellow-400 text-brand-blue-900'
            : i === current
            ? 'bg-amber-100 border-2 border-yellow-400 text-amber-600'
            : 'bg-gray-50 border border-gray-200 text-gray-400'}`}
        >
          {i < current ? <IconCheck /> : i + 1}
        </div>
        {i < total - 1 && (
          <div className={`h-px w-6 transition-all duration-500 ${i < current ? 'bg-yellow-400' : 'bg-gray-100'}`} />
        )}
      </div>
    ))}
    <span className="ml-2 text-gray-400 text-xs">Step {current + 1} of {total}</span>
  </div>
)

// ─── Role card ────────────────────────────────────────────────────────
const RoleCard = ({ role, label, desc, icon, selected, onClick }) => (
  <button
    type="button"
    id={`role-${role}`}
    onClick={onClick}
    className={`relative w-full text-left rounded-2xl p-5 border transition-all duration-300 group
      ${selected
        ? 'border-amber-500 bg-amber-50 shadow-[0_0_20px_rgba(250,204,21,0.15)]'
        : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-50'}`}
    aria-pressed={selected}
  >
    <div className="flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-all duration-300
        ${selected ? 'bg-amber-100' : 'bg-gray-50 group-hover:bg-gray-100'}`}>
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className={`font-semibold text-sm transition-colors duration-200 ${selected ? 'text-amber-600' : 'text-gray-900'}`}>{label}</span>
          {selected && (
            <span className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
              <IconCheck />
            </span>
          )}
        </div>
        <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  </button>
)

// ─── Animated particles ───────────────────────────────────────────────
const Particles = () => {
  const dots = Array.from({ length: 18 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 3 + 1, delay: Math.random() * 5, duration: Math.random() * 5 + 5,
  }))
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {dots.map(dot => (
        <div key={dot.id} className="absolute rounded-full bg-amber-50 animate-pulse-slow"
          style={{ left: `${dot.x}%`, top: `${dot.y}%`, width: `${dot.size}px`, height: `${dot.size}px`,
            animationDelay: `${dot.delay}s`, animationDuration: `${dot.duration}s` }} />
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────
export default function SignUp({ onNavigate }) {
  const routerNavigate = useNavigate()
  const navigate = (path) => {
    if (onNavigate) onNavigate(path)
    else routerNavigate(path.startsWith('/') ? path : `/${path}`)
  }

  const containerRef = useRef(null)
  const leftRef = useRef(null)
  const rightRef = useRef(null)
  const stepRef = useRef(null)

  // 3 Steps: 0 = Role, 1 = Personal Details (No phone), 2 = Password/Terms
  const TOTAL_STEPS = 3

  // Form state
  const [step, setStep] = useState(0)
  const [role, setRole] = useState('worker')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreedTerms, setAgreedTerms] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Post-signup onboarding popup chain:
  // null -> 'test' -> 'fee' -> 'proof' -> 'category' -> done (redirect to dashboard)
  const [flowStep, setFlowStep] = useState(null)
  const [pendingPaymentId, setPendingPaymentId] = useState(null)

  // Entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(leftRef.current, { x: -80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9 })
      tl.fromTo(rightRef.current, { x: 80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9 }, 0.2)
    }, containerRef)
    return () => ctx.revert()
  }, [])

  // Animate step change
  const animateStep = (direction) => {
    return new Promise(resolve => {
      gsap.to(stepRef.current, {
        opacity: 0, x: direction === 'next' ? -30 : 30, duration: 0.25,
        onComplete: () => {
          gsap.fromTo(stepRef.current,
            { opacity: 0, x: direction === 'next' ? 30 : -30 },
            { opacity: 1, x: 0, duration: 0.35, ease: 'power3.out', onComplete: resolve }
          )
        }
      })
    })
  }

  const goNext = async () => {
    setError('')
    if (step === 0 && !role) { setError('Please select your account type.'); return }
    if (step === 1) {
      if (!fullName.trim()) { setError('Please enter your full name.'); return }
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email address.'); return }
    }
    if (step === 2) {
      if (!password || password.length < 8) { setError('Password must be at least 8 characters.'); return }
      if (password !== confirmPassword) { setError('Passwords do not match.'); return }
      if (!agreedTerms) { setError('Please agree to the Terms of Service to continue.'); return }
      await handleSignUp()
      return
    }
    await animateStep('next')
    setStep(s => s + 1)
  }

  const goBack = async () => {
    setError('')
    await animateStep('back')
    setStep(s => s - 1)
  }

  const handleSignUp = async () => {
    setError('')
    setLoading(true)
    gsap.to('.submit-btn-signup', { scale: 0.97, duration: 0.1, yoyo: true, repeat: 1 })

    try {
      // Create account directly
      const signUpRes = await authApi.signup({ fullName, email, password, role })
      setSession(signUpRes.token, signUpRes.user)
      setSuccess(true)
      // Show the "Now attempt your test" popup right after the account is created,
      // instead of auto-redirecting straight to the dashboard.
      setTimeout(() => {
        setFlowStep('test')
      }, 1500)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setError('')
    try {
      await authApi.signInWithGoogle()
    } catch (err) {
      setError(err.message || 'Google sign-up failed.')
    }
  }

  const stats = [
    { value: '12K+', label: 'Active Users' },
    { value: '3.4K+', label: 'Jobs Posted' },
    { value: '98%', label: 'Satisfaction' },
  ]

  // ── Success screen (direct redirect after free signup) ──
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sora relative overflow-hidden p-4">
        <div className="orb w-96 h-96 bg-blue-600 top-[-10%] left-[-10%]" aria-hidden="true" />
        <div className="orb w-80 h-80 bg-yellow-400 bottom-[-5%] right-[-8%]" aria-hidden="true" />
        <Particles />
        <div className="success-panel relative z-10 glass-card rounded-3xl p-8 lg:p-10 max-w-lg w-full text-center shadow-[0_0_50px_rgba(250,204,21,0.2)]">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center mx-auto mb-5 shadow-yellow-glow text-[#060e2b] animate-bounce-slow">
            <IconCheck />
          </div>
          
          <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-2">
            Account Created! 🎉
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm mb-4 max-w-sm mx-auto">
            Welcome to SmAds! Your account has been successfully created. Redirecting to your dashboard...
          </p>
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mt-4" />
        </div>

        {/* ── Post-signup popup chain: test prompt → fee → screenshot → category ── */}
        {flowStep === 'test' && (
          <TestPromptModal
            onAttempt={() => setFlowStep('fee')}
            onSkip={() => navigate('/dashboard')}
          />
        )}

        {flowStep === 'fee' && (
          <RegistrationFeeModal
            onPaid={(paymentId) => {
              setPendingPaymentId(paymentId)
              setFlowStep('proof')
            }}
            onClose={() => navigate('/dashboard')}
          />
        )}

        {flowStep === 'proof' && pendingPaymentId && (
          <PaymentProofModal
            paymentId={pendingPaymentId}
            onSubmitted={() => setFlowStep('category')}
            onClose={() => navigate('/dashboard')}
          />
        )}

        {flowStep === 'category' && (
          <JobCategoryModal
            onSelected={() => navigate('/dashboard')}
            onClose={() => navigate('/dashboard')}
          />
        )}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full flex items-center justify-center bg-gray-50 relative overflow-hidden font-sora py-10"
    >
      {/* Background Orbs */}
      <div className="orb w-96 h-96 bg-blue-600 top-[-10%] left-[-10%]" aria-hidden="true" />
      <div className="orb w-80 h-80 bg-yellow-400 bottom-[-5%] right-[-8%]" aria-hidden="true" />
      <div className="orb w-64 h-64 bg-brand-blue-600 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
        aria-hidden="true" />
      <Particles />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-5xl mx-4 lg:mx-8 flex flex-col lg:flex-row rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.6)] min-h-[620px]">

        {/* ─── LEFT PANEL ──────────────────────────────────────────── */}
        <div
          ref={leftRef}
          className="relative flex-1 bg-gradient-to-br from-brand-blue-900 via-brand-blue-800 to-brand-blue-700 p-10 lg:p-14 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full border border-gray-100 animate-spin-slow" aria-hidden="true" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full border border-amber-100" aria-hidden="true" />

          {/* Logo */}
          <Link to="/" className="flex items-center w-fit group">
            <img src={logo} alt="Sm Ads - Social Media Advertiser" className="h-10 w-auto object-contain" />
          </Link>

          {/* Hero content */}
          <div className="flex-1 flex flex-col justify-center mt-8">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 mb-5 w-fit">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-amber-600 text-xs font-semibold tracking-widest uppercase">Verified Registration</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
              Join The Verified<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
                Work Ecosystem.
              </span>
            </h1>

            <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-xs">
              Registration fee filters serious members and protects workers & employers on a high-trust platform.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {stats.map((s, i) => (
                <div key={i} className="glass-card rounded-2xl p-3.5 text-center border border-gray-100">
                  <div className="text-lg font-bold text-amber-600">{s.value}</div>
                  <div className="text-gray-400 text-[11px] mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Platform Highlights */}
            <div className="space-y-3">
              {[
                { icon: <IconShield />, text: 'Mandatory Registration Fee ensures quality users' },
                { icon: <IconCreditCard />, text: 'Instant payment via JazzCash' },
                { icon: <IconBriefcase />, text: '3-Day Activity Rule maintains high productivity' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-amber-600 group-hover:border-amber-300 transition-all duration-300">
                    {item.icon}
                  </div>
                  <span className="text-gray-500 text-xs group-hover:text-gray-800 transition-colors duration-300">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Already have account */}
          <div className="mt-8 pt-5 border-t border-gray-200">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/signin')}
                className="text-amber-600 font-semibold hover:text-amber-500 transition-colors underline-offset-2 hover:underline"
              >
                Sign in →
              </button>
            </p>
          </div>
        </div>

        {/* ─── RIGHT PANEL (FORM) ───────────────────────────────────── */}
        <div
          ref={rightRef}
          className="w-full lg:w-[490px] bg-gray-50 backdrop-blur-2xl border-l border-gray-200 p-8 lg:p-12 flex flex-col justify-center"
        >
          {/* Header */}
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
            <p className="text-gray-400 text-xs">Fill in your details and complete registration fee to activate.</p>
          </div>

          {/* Step indicator */}
          <StepIndicator current={step} total={TOTAL_STEPS} />

          {/* Error Banner */}
          {error && (
            <div className="error-banner mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/25 rounded-xl p-4">
              <span className="text-red-400 text-sm leading-snug">{error}</span>
            </div>
          )}

          {/* ── STEP CONTENT ── */}
          <div ref={stepRef}>

            {/* STEP 0 — Account Type */}
            {step === 0 && (
              <div className="space-y-4">
                <p className="text-gray-500 text-sm mb-3">How will you use Sm Ads?</p>
                <RoleCard
                  role="worker"
                  label="I'm here to work"
                  desc="Find tasks, get hired, earn money and build your professional reputation."
                  icon="💼"
                  selected={role === 'worker'}
                  onClick={() => setRole('worker')}
                />
              </div>
            )}

            {/* STEP 1 — Personal Details (NO PHONE NUMBER) */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-gray-500 text-sm mb-3">Tell us about yourself.</p>

                {/* Google Sign Up shortcut */}
                <button
                  type="button"
                  id="btn-google-signup"
                  onClick={handleGoogleSignUp}
                  className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3.5 rounded-xl text-sm hover:bg-gray-100 hover:shadow-lg active:scale-[0.98] transition-all duration-300 mb-2"
                >
                  <IconGoogle />
                  Continue with Google
                </button>

                <div className="divider-line">
                  <span className="text-gray-300 text-xs">or enter details</span>
                </div>

                <div className="input-group">
                  <span className="input-icon"><IconUser /></span>
                  <input
                    id="signup-fullname"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Full name"
                    className="form-input"
                    aria-label="Full name"
                  />
                </div>

                <div className="input-group">
                  <span className="input-icon"><IconMail /></span>
                  <input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="form-input"
                    aria-label="Email address"
                  />
                </div>
              </div>
            )}

            {/* STEP 2 — Password & Terms */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-gray-500 text-sm mb-3">Set a strong password for your account.</p>

                <div className="input-group mb-1">
                  <span className="input-icon"><IconLock /></span>
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Create password"
                    className="form-input pr-12"
                    aria-label="Create password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    <IconEye open={showPassword} />
                  </button>
                </div>
                <PasswordStrength password={password} />

                <div className="input-group mt-3 mb-4">
                  <span className="input-icon"><IconLock /></span>
                  <input
                    id="signup-confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className={`form-input pr-12 ${confirmPassword && password !== confirmPassword ? 'border-red-500/60' : confirmPassword && password === confirmPassword ? 'border-green-500/60' : ''}`}
                    aria-label="Confirm password"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-600 transition-colors"
                    aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}>
                    <IconEye open={showConfirm} />
                  </button>
                </div>

                {/* Terms agreement */}
                <label className="flex items-start gap-3 cursor-pointer group my-4">
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input
                      id="agree-terms"
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={e => setAgreedTerms(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-[6px] border transition-all duration-200 flex items-center justify-center
                      ${agreedTerms ? 'bg-yellow-400 border-yellow-400' : 'border-gray-300 bg-gray-50 group-hover:border-amber-300'}`}>
                      {agreedTerms && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="#030820" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-500 text-xs leading-relaxed group-hover:text-gray-600 transition-colors">
                    I agree to the <span className="text-amber-600">Terms of Service</span>, <span className="text-amber-600">Privacy Policy</span>, and understand that a mandatory Registration Fee is required to activate my account.
                  </span>
                </label>
              </div>
            )}

            {/* STEP 3 was removed */}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button
                type="button"
                id="btn-step-back"
                onClick={goBack}
                className="btn-ghost flex-shrink-0"
                aria-label="Go back"
              >
                ← Back
              </button>
            )}
            <button
              type="button"
              id="btn-step-next"
              onClick={goNext}
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2 flex-1 submit-btn-signup"
              aria-label={step === 2 ? 'Create Account' : 'Continue to next step'}
            >
              {loading ? (
                <>Creating Account...</>
              ) : (
                <>{step === 2 ? 'Create Account' : 'Continue'} <IconArrow /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


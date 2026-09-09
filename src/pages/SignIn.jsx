import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { authApi, setSession } from '../lib/api'
import logo from '../assets/sm-ads-logo-white.svg'

// Icons (inline SVG to avoid extra deps)
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

const IconEye = ({ open }) => open ? (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
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

// Animated background particles
const Particles = () => {
  const dots = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 5 + 5,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {dots.map(dot => (
        <div
          key={dot.id}
          className="absolute rounded-full bg-amber-100 animate-pulse-slow"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            animationDelay: `${dot.delay}s`,
            animationDuration: `${dot.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function SignIn({ onNavigate }) {
  const routerNavigate = useNavigate()
  const navigate = (path) => {
    if (onNavigate) onNavigate(path)
    else routerNavigate(path.startsWith('/') ? path : `/${path}`)
  }

  const containerRef = useRef(null)
  const leftPanelRef = useRef(null)
  const rightPanelRef = useRef(null)
  const logoRef = useRef(null)
  const headlineRef = useRef(null)
  const subRef = useRef(null)
  const featureRefs = useRef([])
  const formRef = useRef(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // GSAP entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // Left panel
      tl.fromTo(leftPanelRef.current,
        { x: -80, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.9 }
      )

      // Logo
      tl.fromTo(logoRef.current,
        { scale: 0.6, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6 },
        '-=0.5'
      )

      // Headline
      tl.fromTo(headlineRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        '-=0.3'
      )

      // Sub text
      tl.fromTo(subRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.4'
      )

      // Feature items stagger
      tl.fromTo(featureRefs.current,
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, stagger: 0.12 },
        '-=0.3'
      )

      // Right panel (form)
      tl.fromTo(rightPanelRef.current,
        { x: 80, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.9 },
        0.2
      )

      // Form elements stagger — guard against empty NodeList
      const formEls = formRef.current ? [...formRef.current.querySelectorAll('.form-animate')] : []
      if (formEls.length) {
        tl.fromTo(formEls,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.08 },
          '-=0.6'
        )
      }

    }, containerRef)

    return () => ctx.revert()
  }, [])

  // Button hover animation
  const handleBtnHover = (e, enter) => {
    gsap.to(e.currentTarget.querySelector('.btn-shine'), {
      x: enter ? '100%' : '-100%',
      duration: enter ? 0.6 : 0,
      ease: 'power2.inOut',
    })
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Animate button
    gsap.to('.submit-btn', { scale: 0.97, duration: 0.1, yoyo: true, repeat: 1 })

    try {
      const { token, user } = await authApi.login({ email, password })
      setSession(token, user)

      const targetPath = (user?.role === 'admin' || user?.email?.includes('admin')) ? '/admin' : '/profile'
      setSuccessMessage('Welcome back! Redirecting...')
      gsap.to(containerRef.current, {
        opacity: 0, y: -20, duration: 0.5, delay: 0.8,
        onComplete: () => navigate(targetPath),
      })
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.')
      // Delay so React renders the banner before we animate it
      requestAnimationFrame(() => {
        const banner = document.querySelector('.error-banner')
        if (banner) gsap.fromTo(banner, { x: -8, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: 'back.out' })
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    try {
      await authApi.signInWithGoogle()
    } catch (err) {
      setError(err.message || 'Google sign-in failed.')
    }
  }

  const features = [
    { icon: '🌐', text: 'Connect with professionals worldwide' },
    { icon: '💼', text: 'Find and post high-paying tasks' },
    { icon: '💬', text: 'Real-time messaging & collaboration' },
    { icon: '⭐', text: 'Build your reputation & get rated' },
  ]

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full flex items-center justify-center bg-gray-50 relative overflow-hidden font-sora"
    >
      {/* Background Orbs */}
      <div className="orb w-96 h-96 bg-blue-600 top-[-10%] left-[-10%]" aria-hidden="true" />
      <div className="orb w-80 h-80 bg-yellow-400 bottom-[-5%] right-[-8%]" aria-hidden="true" />
      <div className="orb w-64 h-64 bg-brand-blue-600 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />

      {/* Animated Grid Lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
        aria-hidden="true"
      />

      <Particles />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-5xl mx-4 lg:mx-8 flex flex-col lg:flex-row rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.6)] min-h-[600px]">

        {/* ─── LEFT PANEL ─── */}
        <div
          ref={leftPanelRef}
          className="relative flex-1 bg-gradient-to-br from-brand-blue-900 via-brand-blue-800 to-brand-blue-700 p-10 lg:p-14 flex flex-col justify-between overflow-hidden"
        >
          {/* Decorative Ring */}
          <div
            className="absolute -top-20 -right-20 w-72 h-72 rounded-full border border-gray-100 animate-spin-slow"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full border border-amber-100"
            aria-hidden="true"
          />

          {/* Logo */}
          <Link to="/" className="flex items-center w-fit group">
            <img src={logo} alt="Sm Ads - Social Media Advertiser" className="h-10 w-auto object-contain" />
          </Link>

          {/* Headline */}
          <div className="flex-1 flex flex-col justify-center mt-10">
            <div ref={headlineRef}>
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 mb-6 w-fit">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-amber-600 text-xs font-semibold tracking-widest uppercase">Platform Live</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                Your Career,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
                  Supercharged.
                </span>
              </h1>
            </div>

            <p ref={subRef} className="text-gray-500 text-sm leading-relaxed mb-10 max-w-xs">
              Join thousands of professionals who work, connect, and grow on a single trusted platform.
            </p>

            {/* Feature List */}
            <ul className="space-y-4">
              {features.map((f, i) => (
                <li
                  key={i}
                  ref={el => featureRefs.current[i] = el}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-base group-hover:border-amber-300 group-hover:bg-amber-50 transition-all duration-300">
                    {f.icon}
                  </div>
                  <span className="text-gray-500 text-sm group-hover:text-gray-800 transition-colors duration-300">{f.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom quote */}
          <div className="mt-10 border-t border-gray-200 pt-6">
            <p className="text-gray-400 text-xs italic">"The only platform where your skills meet real opportunity."</p>
          </div>
        </div>

        {/* ─── RIGHT PANEL (FORM) ─── */}
        <div
          ref={rightPanelRef}
          className="w-full lg:w-[460px] bg-gray-50 backdrop-blur-2xl border-l border-gray-200 p-10 lg:p-14 flex flex-col justify-center"
        >
          <form ref={formRef} onSubmit={handleSignIn} noValidate>

            {/* Header */}
            <div className="form-animate mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-1.5">Welcome back</h2>
              <p className="text-gray-400 text-sm">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="text-amber-600 hover:text-amber-500 font-semibold transition-colors duration-200 underline-offset-2 hover:underline"
                >
                  Sign up for free
                </button>
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="error-banner form-animate mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/25 rounded-xl p-4">
                <span className="text-red-400 text-sm leading-snug">{error}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div className="form-animate mb-5 flex items-center gap-3 bg-green-500/10 border border-green-500/25 rounded-xl p-4">
                <span className="text-green-400 text-sm">{successMessage}</span>
              </div>
            )}

            {/* Google Sign In */}
            <div className="form-animate mb-5">
              <button
                type="button"
                id="btn-google-signin"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3.5 rounded-xl text-sm hover:bg-gray-100 hover:shadow-lg active:scale-[0.98] transition-all duration-300"
              >
                <IconGoogle />
                Continue with Google
              </button>
            </div>

            {/* Divider */}
            <div className="form-animate divider-line">
              <span className="text-gray-300 text-xs">or sign in with email</span>
            </div>

            {/* Email */}
            <div className="form-animate input-group mb-4">
              <span className="input-icon"><IconMail /></span>
              <input
                id="signin-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                className="form-input"
                aria-label="Email address"
              />
            </div>

            {/* Password */}
            <div className="form-animate input-group mb-2 relative">
              <span className="input-icon"><IconLock /></span>
              <input
                id="signin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="form-input pr-12"
                aria-label="Password"
              />
              <button
                type="button"
                id="toggle-password-visibility"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-600 transition-colors duration-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <IconEye open={showPassword} />
              </button>
            </div>

            {/* Remember + Forgot */}
            <div className="form-animate flex items-center justify-between mb-6 mt-3">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-4.5 h-4.5 w-[18px] h-[18px] rounded-[5px] border transition-all duration-200 flex items-center justify-center
                    ${rememberMe
                      ? 'bg-yellow-400 border-yellow-400'
                      : 'border-gray-300 bg-gray-50 group-hover:border-amber-300'}`}
                  >
                    {rememberMe && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="#030820" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-gray-500 text-xs group-hover:text-gray-600 transition-colors duration-200">Remember me</span>
              </label>

              <button
                type="button"
                id="forgot-password-link"
                onClick={() => navigate('/forgot-password')}
                className="text-amber-600/80 hover:text-amber-600 text-xs font-medium transition-colors duration-200"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <div className="form-animate">
              <button
                id="btn-signin-submit"
                type="submit"
                disabled={loading}
                onMouseEnter={e => handleBtnHover(e, true)}
                onMouseLeave={e => handleBtnHover(e, false)}
                className="submit-btn btn-primary flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                aria-label="Sign in to your account"
              >
                {/* Shine effect */}
                <span
                  className="btn-shine absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full pointer-events-none"
                  aria-hidden="true"
                />
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <IconArrow />
                  </>
                )}
              </button>
            </div>

            {/* Terms */}
            <p className="form-animate text-center text-gray-300 text-xs mt-6 leading-relaxed">
              By signing in, you agree to our{' '}
              <button type="button" className="text-amber-600/60 hover:text-amber-600 transition-colors">Terms of Service</button>
              {' '}and{' '}
              <button type="button" className="text-amber-600/60 hover:text-amber-600 transition-colors">Privacy Policy</button>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

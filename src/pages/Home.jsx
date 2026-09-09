import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import {
  IconBriefcase,
  IconUsers,
  IconShieldCheck,
  IconClock,
  IconArrowRight,
  IconCheck,
  IconZap,
  IconUserCheck,
  IconMap,
  IconChevronDown,
  IconHeadset,
} from '../components/icons'
import { paymentProofs, paymentStats } from '../data/paymentProofs'
import { jobCategories as jobCategoriesData } from '../data/jobCategories'
import PackageCards from '../components/PackageCards'
import Header from '../components/Header'
import Footer from '../components/Footer'

// Hero background photo — team collaborating in a modern office (matches the
// reference homepage design). Swap this for your own photo by replacing the
// URL, or drop a local file into src/assets and import it instead.
const heroPhoto = 'https://images.pexels.com/photos/7693698/pexels-photo-7693698.jpeg?auto=compress&cs=tinysrgb&w=1920'

// Lightweight scroll-reveal wrapper — fades + slides content in once it enters
// the viewport. Pure CSS transition + IntersectionObserver, no extra deps.
function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const heroRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Entrance Animations
      gsap.from('.hero-title-main', { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out' })
      gsap.from('.hero-subtitle-main', { y: 25, opacity: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' })
      gsap.from('.hero-cta-main', { scale: 0.9, opacity: 0, duration: 0.7, delay: 0.4, ease: 'back.out(1.5)' })
      
      // Funky Badges Pop-In Stagger
      const popBadges = document.querySelectorAll('.funky-pop-badge')
      if (popBadges.length) {
        gsap.from(popBadges, {
          scale: 0,
          opacity: 0,
          y: 20,
          duration: 0.6,
          stagger: 0.12,
          delay: 0.5,
          ease: 'back.out(2)'
        })
      }
    }, heroRef)

    return () => ctx.revert()
  }, [])

  const jobCategories = jobCategoriesData

  const marqueeItems = [
    { text: 'Instant PKR 500 Activation' },
    { text: 'Task Marketplace' },
    { text: 'Real-Time Direct Messaging' },
    { text: '4.9/5 Rating Average' },
    { text: '3-Day Activity Rule Enforced' },
    { text: 'Global Freelance Community' },
    { text: 'Escrow Protected Payments' },
    { text: 'JazzCash Supported' },
  ]

  return (
    <div id="top" ref={heroRef} className="min-h-screen bg-white text-gray-900 font-sora relative overflow-x-hidden">
      {/* ─── NAVIGATION BAR ─── */}
      <Header />

      {/* ─── FULL-WIDTH PHOTO HERO SECTION (background photo, like the reference design) ─── */}
      <section
        className="relative z-10 px-6 lg:px-16 pt-24 sm:pt-28 pb-14 sm:pb-16 text-center bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url(${heroPhoto})` }}
      >
        {/* Subtle navy vignette: darker behind the centered text, brighter toward the
            edges so the photo (and people's faces) stay clearly visible on the sides. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 90% at 50% 38%, rgba(6,14,43,0.70) 0%, rgba(6,14,43,0.42) 48%, rgba(6,14,43,0.10) 100%)',
          }}
          aria-hidden="true"
        />
        {/* Gentle top-to-bottom depth so the stats row at the bottom stays readable */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-brand-blue-900/15 via-transparent to-brand-blue-900/45"
          aria-hidden="true"
        />

        {/* Decorative gold glow orbs for depth, kept away from the text column */}
        <div className="orb w-72 h-72 bg-amber-400 -top-16 -left-10 opacity-[0.14]" aria-hidden="true" />
        <div className="orb w-80 h-80 bg-amber-300 -bottom-24 -right-16 opacity-[0.12]" aria-hidden="true" />

        {/* 3-Day Activity Rule card — anchored to the far right of the section itself
            (not the centered text column), so it never overlaps the heading/paragraph. */}
        <div className="funky-pop-badge hidden 2xl:flex z-20 flex-col gap-1.5 absolute top-1/2 -translate-y-1/2 right-8 xl:right-14 w-[230px] text-left bg-white/10 backdrop-blur-md border border-white/25 rounded-2xl px-5 py-4 animate-float-reverse hover:scale-105 transition-transform cursor-pointer">
          <span className="flex items-center gap-2 text-amber-300 text-sm font-bold">
            <IconClock /> 3-Day Activity Rule
          </span>
          <span className="text-[11px] font-medium text-white/70 leading-snug">
            Stay active & respond within 3 days to keep your member status.
          </span>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Decorative floating badges — kept clear of the text column, bottom corners only */}
          <div className="hidden xl:block">
            <div className="funky-pop-badge absolute bottom-14 left-12 bg-white/10 backdrop-blur-md border border-white/25 rounded-2xl px-4 py-2 flex items-center gap-2 text-xs font-bold text-green-300 animate-float-reverse hover:scale-110 hover:rotate-2 transition-transform cursor-pointer">
              <span>💳</span> JazzCash Only
            </div>

            <div className="funky-pop-badge absolute bottom-10 right-12 bg-white/10 backdrop-blur-md border border-white/25 rounded-2xl px-4 py-2 flex items-center gap-2 text-xs font-bold text-amber-300 animate-float-slow hover:scale-110 hover:-rotate-2 transition-transform cursor-pointer">
              <span>🛡️</span> Escrow Protected Wallet
            </div>
          </div>

          {/* Single trust badge, directly above the heading */}
          <div className="hero-subtitle-main inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 mb-6 text-sm font-semibold text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <IconCheck /> Verified & Trusted Community
          </div>

          {/* Full Width Main Heading */}
          <h1 className="hero-title-main text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight max-w-4xl mx-auto mb-5 text-white drop-shadow-[0_2px_20px_rgba(6,14,43,0.5)]">
            Connect. Showcase.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 drop-shadow-[0_0_35px_rgba(245,158,11,0.35)]">
              Get Hired.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle-main text-white/90 text-lg sm:text-xl lg:text-2xl leading-relaxed max-w-3xl mx-auto mb-8 font-medium">
            A trusted social marketplace where talented people connect, collaborate and find real freelance
            opportunities.
          </p>

          {/* Hero CTA Buttons */}
          <div className="hero-cta-main flex flex-col items-center justify-center gap-5 mb-12">
            <div className="flex flex-wrap items-center justify-center gap-5">
              <button
                onClick={() => navigate('/signup')}
                className="btn-primary w-auto py-4 px-10 text-base lg:text-lg inline-flex items-center gap-3 justify-center shadow-yellow-glow hover:scale-105 transition-transform"
              >
                Join SmAds Now — PKR 500 <IconArrowRight />
              </button>
              <button
                onClick={() => {
                  document.getElementById('job-categories')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="border border-white/40 text-white hover:bg-white hover:text-brand-blue-900 transition-all duration-300 rounded-xl px-10 py-4 text-base lg:text-lg font-medium hover:scale-105 backdrop-blur-sm bg-white/5"
              >
                Explore Jobs
              </button>
            </div>
            <p className="text-white/70 text-xs font-medium tracking-wide">One-time membership fee · Existing member? <button onClick={() => navigate('/signin')} className="text-amber-300 hover:text-amber-200 underline underline-offset-2">Sign in</button></p>
          </div>

          {/* Quick Stats Banner */}
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16 border-t border-white/20 pt-8">
            <div className="text-center">
              <div className="text-3xl font-black text-amber-300">100%</div>
              <div className="text-xs text-white/70 font-medium mt-1">Verified Paid Accounts</div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-black text-amber-300">3 Days</div>
              <div className="text-xs text-white/70 font-medium mt-1">Inactivity Auto-Expiry</div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-black text-amber-300">PKR 500</div>
              <div className="text-xs text-white/70 font-medium mt-1">Instant Verification Fee</div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-black text-amber-300">Escrow</div>
              <div className="text-xs text-white/70 font-medium mt-1">Protected Payments</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST INDICATORS ─── */}
      <section className="relative z-10 px-6 lg:px-16 -mt-10 sm:-mt-12">
        <Reveal className="max-w-6xl mx-auto glass-card rounded-3xl border border-gray-200 shadow-2xl grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100">
          {[
            { icon: IconUserCheck, label: 'Verified Members', desc: 'Every member registers with a paid, verified account' },
            { icon: IconShieldCheck, label: 'Secure Payments', desc: 'Escrow-protected wallet & trusted payment gateways' },
            { icon: IconBriefcase, label: 'Real Opportunities', desc: 'Genuine employer-posted, paid freelance tasks' },
            { icon: IconZap, label: 'Active Community', desc: 'Daily activity tracking keeps the platform moving' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center text-center gap-2 px-5 py-7 hover:bg-amber-50/40 transition-colors duration-300">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1">
                <item.icon />
              </div>
              <div className="font-extrabold text-sm text-gray-900">{item.label}</div>
              <div className="text-gray-500 text-[11px] leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ─── INFINITE SCROLLING MARQUEE BANNER ─── */}
      <section className="relative z-10 py-8 bg-gray-50 border-y border-gray-200 my-10 overflow-hidden">
        <div className="marquee-container">
          <div className="marquee-track">
            {marqueeItems.concat(marqueeItems).map((item, idx) => (
              <div
                key={idx}
                className="glass-card border border-gray-200 rounded-2xl px-6 py-3.5 flex items-center gap-3 text-sm font-bold text-gray-800 whitespace-nowrap hover:border-amber-400 hover:bg-amber-50 transition-all cursor-pointer shadow-lg"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" aria-hidden="true" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── JOB CATEGORIES SECTION ─── */}
      <section id="job-categories" className="relative z-10 px-6 lg:px-16 py-24 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1 mb-3 text-amber-600 text-xs font-bold uppercase tracking-wider">
            Choose Your Track
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black">Popular Job Categories</h2>
          <p className="text-gray-500 text-base mt-3">
            Six proven earning tracks. Pick one, apply in seconds, and start getting matched with paid tasks today.
          </p>
        </div>

        <div className="flex justify-end mb-4">
          <a
            href="#job-categories"
            className="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-amber-600 hover:text-amber-700 uppercase tracking-wider"
          >
            View All Categories <IconArrowRight />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {jobCategories.map((cat, idx) => {
            const Icon = IconMap[cat.iconKey]
            return (
              <Reveal key={cat.slug} delay={(idx % 3) * 90}>
              <div
                role="link"
                tabIndex={0}
                onClick={() => navigate(`/jobs/${cat.slug}`)}
                onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/jobs/${cat.slug}`) }}
                aria-label={`View ${cat.name} details, tasks and payment info`}
                className="group relative glass-card rounded-3xl p-7 border border-gray-200 hover:border-amber-400 hover:-translate-y-2 hover:shadow-yellow-glow transition-all duration-300 shadow-xl overflow-hidden cursor-pointer block h-full"
              >
                {/* corner tag */}
                <div className={`absolute top-5 right-5 border rounded-full px-3 py-1 text-[10px] font-bold ${cat.tagColor}`}>
                  {cat.tag}
                </div>

                {/* icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.iconBg} text-gray-900 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <Icon />
                </div>

                <h3 className="text-xl font-extrabold mb-2">{cat.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6 pr-4">
                  {cat.desc}
                </p>

                <div className="flex items-center justify-between border-t border-gray-200 pt-4 text-xs mb-4">
                  <span className="text-amber-600 font-bold">{cat.rate}</span>
                  <span className="text-gray-400 font-medium">{cat.openings}</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <Link
                    to={`/jobs/${cat.slug}`}
                    className="flex items-center gap-2 text-xs font-bold text-amber-600 group-hover:gap-3 transition-all"
                  >
                    View Details <IconArrowRight />
                  </Link>
                  <Link
                    to={`/jobs/${cat.slug}?apply=1`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-bold px-4 py-2 rounded-full bg-amber-400 text-brand-blue-900 hover:bg-amber-500 transition-colors shadow-yellow-glow"
                  >
                    Apply
                  </Link>
                </div>

                <div className="pointer-events-none absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-gray-50 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              </Reveal>
            )
          })}
        </div>

        {/* Apply Now CTA */}
        <div className="mt-14 flex flex-col items-center text-center">
          <button
            onClick={() => navigate('/signup')}
            className="btn-primary w-auto py-4 px-14 text-base font-bold shadow-yellow-glow hover:scale-105 transition-transform inline-flex items-center gap-2"
          >
            Apply Now <IconArrowRight />
          </button>
          <p className="text-gray-400 text-xs mt-4 max-w-md">
            Register once for PKR 500, then apply to any category above — no separate fee per category.
          </p>
        </div>
      </section>

      {/* ─── HOW IT WORKS SECTION ─── */}
      <section id="how-it-works" className="relative z-10 px-6 lg:px-16 py-24 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1 mb-3 text-amber-600 text-xs font-bold uppercase tracking-wider">
            Step-By-Step Guide
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black">How SmAds Works</h2>
          <p className="text-gray-500 text-base mt-3">From paid registration to social networking and task completion in 4 easy steps.</p>
        </div>

        <div className="relative">
          {/* Desktop connecting timeline line */}
          <div className="hidden lg:block absolute top-6 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200" aria-hidden="true" />

          <Reveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="glass-card rounded-3xl p-8 border border-gray-200 relative flex flex-col justify-between group hover:border-amber-400 hover:-translate-y-2 transition-all duration-300 shadow-xl">
              <div>
                <div className="relative z-10 w-12 h-12 rounded-2xl bg-amber-400 text-brand-blue-900 font-black text-base flex items-center justify-center mb-6 shadow-yellow-glow group-hover:scale-110 transition-transform">
                  01
                </div>
                <h3 className="text-xl font-extrabold mb-3">Register</h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Sign up with your email and pay the mandatory PKR 500 verification fee via JazzCash. Receive an instant digital receipt.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-200 text-amber-600 text-xs font-bold flex items-center gap-2">
                <IconUserCheck /> Verified Member
              </div>
            </div>

            {/* Step 2 */}
            <div className="glass-card rounded-3xl p-8 border border-gray-200 relative flex flex-col justify-between group hover:border-amber-400 hover:-translate-y-2 transition-all duration-300 shadow-xl">
              <div>
                <div className="relative z-10 w-12 h-12 rounded-2xl bg-amber-400 text-brand-blue-900 font-black text-base flex items-center justify-center mb-6 shadow-yellow-glow group-hover:scale-110 transition-transform">
                  02
                </div>
                <h3 className="text-xl font-extrabold mb-3">Build Profile</h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Create your custom profile, post status updates, follow industry peers, message in real-time, and showcase portfolio projects.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-200 text-amber-600 text-xs font-bold flex items-center gap-2">
                <IconUsers /> Social Connections
              </div>
            </div>

            {/* Step 3 */}
            <div className="glass-card rounded-3xl p-8 border border-gray-200 relative flex flex-col justify-between group hover:border-amber-400 hover:-translate-y-2 transition-all duration-300 shadow-xl">
              <div>
                <div className="relative z-10 w-12 h-12 rounded-2xl bg-amber-400 text-brand-blue-900 font-black text-base flex items-center justify-center mb-6 shadow-yellow-glow group-hover:scale-110 transition-transform">
                  03
                </div>
                <h3 className="text-xl font-extrabold mb-3">Connect</h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Employers post jobs with fixed budgets. Workers browse and apply or get directly assigned with escrow wallet protection.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-200 text-amber-600 text-xs font-bold flex items-center gap-2">
                <IconBriefcase /> Escrow Protected
              </div>
            </div>

            {/* Step 4 */}
            <div className="glass-card rounded-3xl p-8 border border-gray-200 relative flex flex-col justify-between group hover:border-amber-400 hover:-translate-y-2 transition-all duration-300 shadow-xl">
              <div>
                <div className="relative z-10 w-12 h-12 rounded-2xl bg-amber-400 text-brand-blue-900 font-black text-base flex items-center justify-center mb-6 shadow-yellow-glow group-hover:scale-110 transition-transform">
                  04
                </div>
                <h3 className="text-xl font-extrabold mb-3">Get Hired</h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Submit work daily to stay active. Avoid 3-day inactivity auto-expiry, earn ratings, and withdraw payments to your wallet.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-200 text-amber-600 text-xs font-bold flex items-center gap-2">
                <IconClock /> 3-Day Rule Enforced
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── WHY CHOOSE SMADS SECTION ─── */}
      <section id="features" className="relative z-10 px-6 lg:px-16 py-20 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1 mb-3 text-amber-600 text-xs font-bold uppercase tracking-wider">
            Platform Features
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black">Why Choose SmAds</h2>
          <p className="text-gray-500 text-base mt-3">Engineered for quality, trust, and steady earnings.</p>
        </div>

        <Reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {/* Card 1 */}
          <div className="glass-card rounded-3xl p-8 border border-gray-200 hover:border-amber-400 hover:-translate-y-2 hover:shadow-yellow-glow transition-all duration-300 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
              <IconUsers />
            </div>
            <h3 className="text-xl font-extrabold mb-3">Trusted Community</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              A mandatory verification fee filters out fake accounts and spam, so every profile, post, and message you see is from a real, committed member.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card rounded-3xl p-8 border border-gray-200 hover:border-amber-400 hover:-translate-y-2 transition-all duration-300 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
              <IconBriefcase />
            </div>
            <h3 className="text-xl font-extrabold mb-3">Quality Opportunities</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Employers post real tasks with fixed budgets across six proven categories. Apply, get matched, and start earning with transparent rates.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card rounded-3xl p-8 border border-gray-200 hover:border-amber-400 hover:-translate-y-2 transition-all duration-300 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
              <IconZap />
            </div>
            <h3 className="text-xl font-extrabold mb-3">Secure Payments</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Funds sit in an escrow-protected wallet until a task is approved, then payout instantly via JazzCash.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-card rounded-3xl p-8 border border-gray-200 hover:border-amber-400 hover:-translate-y-2 transition-all duration-300 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
              <IconHeadset />
            </div>
            <h3 className="text-xl font-extrabold mb-3">Support Always</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Daily activity tracking and admin oversight keep the platform healthy — with help on hand whenever you need it.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ─── 3-DAY RULE HIGHLIGHT ─── */}
      <section id="inactivity-rule" className="relative z-10 px-6 lg:px-16 py-20 bg-gray-50 border-y border-gray-200">
        <Reveal className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-full px-4 py-1 mb-6 text-amber-600 text-xs font-bold uppercase tracking-wider">
              Automated Productivity Guarantee
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">
              The 3-Day Consecutive Inactivity Auto-Expiry Rule
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              To keep the platform active and protect employers from abandoned contracts, our automated background engine runs daily.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5"><IconCheck /></span>
                <span className="text-sm text-gray-700">Daily activity tracking on all hired users and assigned tasks.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5"><IconCheck /></span>
                <span className="text-sm text-gray-700">If no work activity is logged for 3 consecutive days, status automatically becomes <strong>Expired</strong>.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5"><IconCheck /></span>
                <span className="text-sm text-gray-700">Expired users lose job privileges until reviewed or reactivated by Admin.</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6">
            <div className="glass-card rounded-3xl p-8 border border-gray-200 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-sm font-medium">Day 1: No activity logged</span>
                <span className="text-xs bg-amber-100 text-amber-500 px-3 py-1 rounded-full font-bold">Warning Notification</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-sm font-medium">Day 2: No activity logged</span>
                <span className="text-xs bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full font-bold">Urgent Alert</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-2xl border border-red-500/30">
                <span className="text-sm font-medium text-red-200">Day 3: Inactivity reached</span>
                <span className="text-xs bg-red-500/30 text-red-400 px-3 py-1 rounded-full font-bold">ACCOUNT EXPIRED</span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── PAYMENT PROOF SECTION ─── */}
      <section id="payment-proof" className="relative z-10 px-6 lg:px-16 py-24 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1 mb-3 text-amber-600 text-xs font-bold uppercase tracking-wider">
            Real Payouts, Real Trust
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black">Payment Proof</h2>
          <p className="text-gray-500 text-base mt-3">
            A log of recent payouts sent to workers across job categories via JazzCash.
          </p>
        </div>

        <Reveal className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
          {paymentStats.map((s) => (
            <div key={s.label} className="glass-card rounded-2xl p-6 border border-gray-200 text-center hover:border-amber-300 transition-colors">
              <div className="text-amber-600 font-black text-2xl sm:text-3xl mb-1">{s.value}</div>
              <div className="text-gray-500 text-xs font-medium">{s.label}</div>
            </div>
          ))}
        </Reveal>

        <Reveal className="glass-card rounded-3xl border border-gray-200 overflow-hidden mb-8 max-w-5xl mx-auto">
          <div className="hidden md:grid grid-cols-5 gap-4 px-6 py-4 bg-gray-50 text-[11px] uppercase tracking-wider font-bold text-gray-400">
            <span>Transaction ID</span>
            <span>Worker</span>
            <span>Category</span>
            <span>Method</span>
            <span className="text-right">Amount</span>
          </div>
          <div className="divide-y divide-gray-100">
            {paymentProofs.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 px-6 py-4 hover:bg-gray-50 transition-colors items-center"
              >
                <span className="text-gray-500 text-xs font-mono md:text-sm">{p.id}</span>
                <span className="text-gray-700 text-sm font-semibold">{p.worker}</span>
                <span className="text-gray-500 text-xs md:text-sm">{p.category}</span>
                <span className="text-gray-500 text-xs md:text-sm">{p.method}</span>
                <span className="flex items-center justify-start md:justify-end gap-2">
                  <span className="text-amber-600 font-bold text-sm">{p.amount}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                    <IconCheck /> {p.status}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="text-center">
          <Link
            to="/payment-proof"
            className="inline-flex items-center gap-2 border border-amber-300 text-amber-600 hover:bg-amber-50 transition-all duration-300 rounded-xl px-8 py-3.5 text-sm font-bold"
          >
            View All Proofs <IconArrowRight />
          </Link>
        </div>
      </section>

      {/* ─── REGISTRATION FEE & PRICING SECTION ─── */}
      <section id="pricing" className="relative z-10 px-6 lg:px-16 py-24 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1 mb-3 text-amber-600 text-xs font-bold uppercase tracking-wider">
            Transparent Membership Model
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black">Choose Your Membership Package</h2>
          <p className="text-gray-500 text-sm mt-3">A mandatory one-time package fee filters out fake accounts and unlocks full platform access. Registration fee is included in every package.</p>
        </div>

        <Reveal>
          <PackageCards onSelect={() => navigate('/signup')} />
          <p className="text-center text-xs text-gray-400 mt-8">
            Payment is completed via JazzCash after signup. Admin verifies your screenshot and activates your account.
          </p>
        </Reveal>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="relative z-10 px-6 lg:px-16 py-24">
        <Reveal className="max-w-5xl mx-auto rounded-3xl bg-hero-gradient relative overflow-hidden text-center px-8 py-16 sm:py-20 shadow-2xl">
          <div className="orb w-[400px] h-[400px] bg-amber-400 top-[-15%] right-[-5%]" aria-hidden="true" />
          <div className="orb w-[300px] h-[300px] bg-blue-400 bottom-[-15%] left-[-5%]" aria-hidden="true" />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-5">
              Ready to Connect and Get Hired?
            </h2>
            <p className="text-white/75 text-base sm:text-lg max-w-xl mx-auto mb-10">
              Join a verified community of freelancers and employers building real opportunities together.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="btn-primary w-auto py-4 px-12 text-base lg:text-lg inline-flex items-center gap-3 justify-center shadow-yellow-glow hover:scale-105 transition-transform"
            >
              Join SmAds Now — PKR 500 <IconArrowRight />
            </button>
          </div>
        </Reveal>
      </section>

      {/* ─── FAQ SECTION ─── */}
      <FaqSection />

      {/* ─── FOOTER ─── */}
      <Footer />
    </div>
  )
}

// ─── FAQ ACCORDION ────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: 'What is SmAds?',
    a: 'SmAds is a social marketplace that combines a professional networking layer with a freelance hiring platform. Members build a profile, connect with employers and peers, and apply for paid tasks across categories like TikTok, Instagram, YouTube, assignments, typing, and Facebook page management.',
  },
  {
    q: 'How does the 3-Day Activity Rule work?',
    a: 'Once you\u2019re hired for a task, our system tracks your activity daily. If no work is submitted or logged for 3 consecutive days, your status automatically changes to "Expired" and job privileges pause until an admin reviews or reactivates your account. This keeps tasks moving for employers and rewards active members.',
  },
  {
    q: 'Is the PKR 500 membership refundable?',
    a: 'The PKR 500 registration fee is a one-time payment that unlocks full platform access — verification, social features, and the ability to apply for or post jobs. Refund eligibility depends on your individual situation, so please reach out to our support team via the Contact section and we\u2019ll review your case.',
  },
  {
    q: 'How secure are payments?',
    a: 'Employer funds are held in an escrow-protected wallet and only released to workers once a task is approved. Payouts are processed through JazzCash — the same trusted gateway used for the registration fee itself.',
  },
  {
    q: 'How can I contact support?',
    a: 'You can reach our team through the Contact section in the footer of this site. We\u2019re happy to help with account issues, payment questions, or anything else related to your membership.',
  },
]

function FaqSection() {
  const [openIdx, setOpenIdx] = useState(0)

  return (
    <section id="faq" className="relative z-10 px-6 lg:px-16 py-24 max-w-4xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1 mb-3 text-amber-600 text-xs font-bold uppercase tracking-wider">
          Got Questions?
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black">Frequently Asked Questions</h2>
      </div>

      <div className="space-y-4">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIdx === idx
          return (
            <div
              key={item.q}
              className={`glass-card rounded-2xl border transition-colors duration-300 overflow-hidden ${
                isOpen ? 'border-amber-300' : 'border-gray-200'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-4 text-left px-6 py-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-2xl"
              >
                <span className="font-bold text-sm sm:text-base text-gray-900">{item.q}</span>
                <span
                  className={`flex-shrink-0 w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                >
                  <IconChevronDown />
                </span>
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-6 text-sm text-gray-500 leading-relaxed">{item.a}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

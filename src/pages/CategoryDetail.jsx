import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { gsap } from 'gsap'
import {
  IconArrowRight,
  IconArrowLeft,
  IconCheck,
  IconWallet,
  IconPhone,
  IconTag,
  IconClock,
  IconMap,
} from '../components/icons'
import { getCategoryBySlug, paymentMethods } from '../data/jobCategories'
import { jobApi, authApi, paymentApi, getStoredUser, isAuthenticated } from '../lib/api'
import PaymentProofModal from '../components/PaymentProofModal'
import PackageCards from '../components/PackageCards'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function CategoryDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const pageRef = useRef(null)
  const cat = getCategoryBySlug(slug)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [applyError, setApplyError] = useState('')

  const [user, setUser] = useState(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showProofModal, setShowProofModal] = useState(false)
  const [pendingPaymentId, setPendingPaymentId] = useState(null)
  const [paymentPendingReview, setPaymentPendingReview] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [packageError, setPackageError] = useState('')

  // Defined early (only depends on `cat`, which is resolved above) so it can
  // be triggered automatically by the ?apply=1 effect below, e.g. when a
  // user clicks "Apply" directly from the category cards on the homepage.
  const handleApplyClick = async () => {
    if (!cat) return
    if (!isAuthenticated()) {
      navigate('/signup')
      return
    }

    setApplyError('')
    setApplying(true)

    try {
      const meRes = await authApi.me()
      const freshUser = meRes.user
      setUser(freshUser)

      if (freshUser.registrationFeePaid) {
        // Apply for the job category directly
        await jobApi.apply(cat.slug, cat.name)
        setApplied(true)
      } else {
        // Not paid! Show the payment instructions
        setShowPaymentForm(true)
      }
    } catch (err) {
      setApplyError(err.message || 'Failed to apply. Please check your connection and try again.')
    } finally {
      setApplying(false)
    }
  }

  useEffect(() => {
    if (!cat) return
    const ctx = gsap.context(() => {
      gsap.from('.detail-fade', { y: 24, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' })
    }, pageRef)
    return () => ctx.revert()
  }, [cat])

  useEffect(() => {
    if (isAuthenticated()) {
      authApi.me().then((res) => {
        if (res.success && res.user) {
          setUser(res.user)
          // If they applied before and screenshot is pending review
          if (res.user.accountStatus === 'pending_payment' && !res.user.registrationFeePaid) {
            setPaymentPendingReview(true)
          }
        }
      }).catch(() => {
        const cached = getStoredUser()
        setUser(cached)
        if (cached?.accountStatus === 'pending_payment') {
          setPaymentPendingReview(true)
        }
      })
    }
  }, [])

  // Auto-trigger the apply flow when arriving from the category card's
  // "Apply" quick-link (e.g. /jobs/tiktok-content?apply=1).
  useEffect(() => {
    if (!cat) return
    if (searchParams.get('apply') === '1') {
      handleApplyClick()
      const next = new URLSearchParams(searchParams)
      next.delete('apply')
      setSearchParams(next, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat, searchParams])

  if (!cat) {
    return (
      <div className="min-h-screen bg-white text-gray-900 font-sora flex flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-3xl font-black">Category not found</h1>
        <p className="text-gray-500">This job category doesn't exist or may have been removed.</p>
        <Link to="/" className="btn-primary py-3 px-8 inline-flex items-center gap-2">
          Back to Home <IconArrowRight />
        </Link>
      </div>
    )
  }

  const Icon = IconMap[cat.iconKey]

  const handlePayRegistration = async () => {
    if (!selectedPackage) {
      setPackageError('Please select a package (Silver, Golden or Platinum) before continuing.')
      return
    }
    setPackageError('')
    setApplying(true)
    setApplyError('')
    try {
      const res = await paymentApi.payRegistrationFee({
        gateway: 'JAZZCASH',
        accountNumber: paymentMethods[0]?.account || '',
        amount: 500,
        packageName: selectedPackage.name,
      })
      setPendingPaymentId(res.receipt.paymentId)
      setShowProofModal(true)
    } catch (err) {
      setApplyError(err.message || 'Payment initiation failed. Please try again.')
    } finally {
      setApplying(false)
    }
  }

  const handleProofSubmitted = () => {
    setShowProofModal(false)
    setShowPaymentForm(false)
    setPaymentPendingReview(true)
    // Update local user status in memory
    setUser(prev => prev ? { ...prev, accountStatus: 'pending_payment' } : null)
  }

  return (
    <div ref={pageRef} className="min-h-screen bg-white text-gray-900 font-sora relative overflow-x-hidden">
      {/* Background glow */}
      <div className="orb w-[500px] h-[500px] bg-blue-600/20 top-[-10%] right-[10%]" aria-hidden="true" />
      <div className="orb w-[400px] h-[400px] bg-amber-50 bottom-[5%] left-[-10%]" aria-hidden="true" />

      {/* ─── NAV ─── */}
      <Header />

      <main className="relative z-10 px-6 lg:px-16 py-14 max-w-6xl mx-auto">
        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="detail-fade inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-amber-600 transition-colors mb-8"
        >
          <IconArrowLeft /> Back to all categories
        </button>

        {/* ─── HERO ─── */}
        <div className="detail-fade flex flex-col sm:flex-row sm:items-center gap-6 mb-10">
          <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${cat.iconBg} text-gray-900 flex items-center justify-center shadow-lg flex-shrink-0`}>
            <Icon />
          </div>
          <div>
            <div className={`inline-flex items-center gap-1 border rounded-full px-3 py-1 text-[10px] font-bold mb-3 ${cat.tagColor}`}>
              {cat.tag}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black">{cat.name}</h1>
          </div>
        </div>

        <p className="detail-fade text-gray-600 text-base lg:text-lg leading-relaxed max-w-3xl mb-10">
          {cat.longDesc}
        </p>

        {/* Quick stats */}
        <div className="detail-fade grid grid-cols-1 sm:grid-cols-3 gap-5 mb-14">
          <div className="glass-card rounded-2xl p-6 border border-gray-200">
            <div className="text-amber-600 font-black text-xl mb-1">{cat.rate}</div>
            <div className="text-gray-500 text-xs font-medium">Typical pay range</div>
          </div>
          <div className="glass-card rounded-2xl p-6 border border-gray-200">
            <div className="text-amber-600 font-black text-xl mb-1">{cat.openings}</div>
            <div className="text-gray-500 text-xs font-medium">Currently available</div>
          </div>
          <div className="glass-card rounded-2xl p-6 border border-gray-200 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0"><IconClock /></span>
            <div>
              <div className="text-gray-900 font-bold text-sm">Paid per task</div>
              <div className="text-gray-500 text-xs">Released after employer approval</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10">
          {/* ─── REQUIREMENTS ─── */}
          <section className="detail-fade">
            <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-2">
              <IconTag /> Requirements
            </h2>
            <ul className="space-y-3 max-w-3xl">
              {cat.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5"><IconCheck /></span>
                  <span className="text-sm text-gray-700">{req}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* ─── MEMBERSHIP PACKAGES ─── */}
          <section className="detail-fade">
            <h2 className="text-2xl font-extrabold mb-2 flex items-center gap-2">
              <IconWallet /> Choose Your Package
            </h2>
            <p className="text-gray-500 text-sm mb-6 max-w-2xl">
              Pick a membership package to unlock this category. A one-time PKR 500 activation fee is required for every package — pay via JazzCash and upload your screenshot for admin review.
            </p>

            <PackageCards selectedKey={selectedPackage?.key} onSelect={(pkg) => { setSelectedPackage(pkg); setPackageError('') }} />

            {packageError && (
              <p className="text-red-500 text-xs font-semibold mt-4 text-center">{packageError}</p>
            )}
            {applyError && (
              <p className="text-red-500 text-xs font-semibold mt-4 text-center">{applyError}</p>
            )}

            {/* Payment box once a package + apply is triggered */}
            {showPaymentForm && (
              <div className="mt-6 p-5 bg-amber-50/80 border border-amber-200 rounded-3xl space-y-4 max-w-md mx-auto">
                <h3 className="text-sm font-bold text-amber-900">🔒 Registration Payment Required</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Send your PKR 500 one-time activation fee to the account below, then upload a screenshot of your payment for admin review.
                </p>

                <div className="space-y-3">
                  {paymentMethods.map((pm) => (
                    <div key={pm.name} className="bg-white rounded-2xl p-4 border border-amber-200">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-sm text-gray-900">{pm.name}</span>
                        <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"><IconPhone /></span>
                      </div>
                      <div className="text-amber-600 font-mono font-bold text-base mb-1 break-all">{pm.account}</div>
                      <div className="text-gray-400 text-xs mb-2">{pm.accountTitle}</div>
                      <div className="text-gray-500 text-[11px] leading-relaxed">{pm.note}</div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handlePayRegistration}
                  disabled={applying}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl text-xs transition-colors"
                >
                  {applying ? 'Preparing...' : "I've Sent PKR 500 — Upload Screenshot"}
                </button>
              </div>
            )}

            {paymentPendingReview && (
              <div className="mt-6 p-5 bg-blue-50/80 border border-blue-200 rounded-3xl text-center space-y-2 max-w-md mx-auto">
                <div className="text-xs font-bold text-blue-800">⏳ Payment Verification Pending</div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Your payment screenshot has been uploaded successfully. Our administrator will review it shortly. Once approved, you will be assigned to this category.
                </p>
              </div>
            )}

            {/* Standard Apply button */}
            {!showPaymentForm && !paymentPendingReview && (
              <button
                disabled={applying || applied}
                onClick={() => {
                  if (!selectedPackage) {
                    setPackageError('Please select a package (Silver, Golden or Platinum) first.')
                    return
                  }
                  handleApplyClick()
                }}
                className="btn-primary py-4 w-full max-w-md mx-auto mt-6 flex items-center justify-center gap-2 text-sm font-bold shadow-yellow-glow hover:scale-105 transition-transform disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {applied ? (
                  <>Applied <IconCheck /></>
                ) : applying ? (
                  'Checking Account...'
                ) : (
                  <>Apply for {cat.name} <IconArrowRight /></>
                )}
              </button>
            )}
          </section>
        </div>
      </main>

      <Footer />

      {/* Proof upload modal overlay */}
      {showProofModal && pendingPaymentId && (
        <PaymentProofModal
          paymentId={pendingPaymentId}
          onSubmitted={handleProofSubmitted}
          onClose={() => setShowProofModal(false)}
        />
      )}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import {
  IconArrowRight,
  IconArrowLeft,
  IconCheck,
  IconWallet,
  IconShieldCheck,
  IconZap,
} from '../components/icons'
import { paymentProofs as staticPaymentProofs, paymentStats } from '../data/paymentProofs'
import { paymentProofApi } from '../lib/api'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function PaymentProof() {
  const navigate = useNavigate()
  const pageRef = useRef(null)
  const [proofs, setProofs] = useState(staticPaymentProofs)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    paymentProofApi
      .list()
      .then((res) => {
        if (res.proofs && res.proofs.length > 0) {
          setProofs(
            res.proofs.map((p) => ({
              id: p.txnId,
              worker: p.worker,
              category: p.category,
              method: p.method,
              amount: p.amount,
              date: p.date,
              status: p.status,
            }))
          )
          setIsLive(true)
        }
      })
      .catch(() => {
        // Backend not reachable yet — keep showing the static sample data
        setIsLive(false)
      })
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.proof-fade', { y: 24, opacity: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out' })
      gsap.from('.proof-card', { y: 20, opacity: 0, duration: 0.5, stagger: 0.05, delay: 0.3, ease: 'power2.out' })
    }, pageRef)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={pageRef} className="min-h-screen bg-white text-gray-900 font-sora relative overflow-x-hidden">
      {/* Background glow */}
      <div className="orb w-[500px] h-[500px] bg-amber-50 top-[-10%] right-[5%]" aria-hidden="true" />
      <div className="orb w-[400px] h-[400px] bg-blue-600/20 bottom-[5%] left-[-10%]" aria-hidden="true" />

      {/* ─── NAV ─── */}
      <Header />

      <main className="relative z-10 px-6 lg:px-16 py-14 max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="proof-fade inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-amber-600 transition-colors mb-8"
        >
          <IconArrowLeft /> Back
        </button>

        {/* ─── HERO ─── */}
        <div className="proof-fade text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1 mb-4 text-amber-600 text-xs font-bold uppercase tracking-wider">
            Real Payouts, Real Trust
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-5">Payment Proof</h1>
          <p className="text-gray-500 text-base lg:text-lg leading-relaxed">
            Every completed task gets paid — no excuses. Below is a live-style log of recent payouts sent to
            workers across all job categories via JazzCash.
          </p>
        </div>

        {/* ─── STATS ─── */}
        <div className="proof-fade grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {paymentStats.map((s) => (
            <div key={s.label} className="glass-card rounded-2xl p-6 border border-gray-200 text-center">
              <div className="text-amber-600 font-black text-2xl sm:text-3xl mb-1">{s.value}</div>
              <div className="text-gray-500 text-xs font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ─── PROOF LIST ─── */}
        <div className="proof-fade flex items-center gap-2 mb-6">
          <IconWallet />
          <h2 className="text-2xl font-extrabold">Recent Transactions</h2>
        </div>

        <div className="glass-card rounded-3xl border border-gray-200 overflow-hidden mb-6">
          {/* header row - desktop only */}
          <div className="hidden md:grid grid-cols-6 gap-4 px-6 py-4 bg-gray-50 text-[11px] uppercase tracking-wider font-bold text-gray-400">
            <span>Transaction ID</span>
            <span>Worker</span>
            <span>Category</span>
            <span>Method</span>
            <span>Date</span>
            <span className="text-right">Amount</span>
          </div>

          <div className="divide-y divide-white/10">
            {proofs.map((p) => (
              <div
                key={p.id}
                className="proof-card grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4 px-6 py-4 hover:bg-gray-50 transition-colors items-center"
              >
                <span className="text-gray-500 text-xs font-mono md:text-sm">{p.id}</span>
                <span className="text-gray-700 text-sm font-semibold">{p.worker}</span>
                <span className="text-gray-500 text-xs md:text-sm">{p.category}</span>
                <span className="text-gray-500 text-xs md:text-sm">{p.method}</span>
                <span className="text-gray-400 text-xs md:text-sm">{p.date}</span>
                <span className="flex items-center justify-start md:justify-end gap-2">
                  <span className="text-amber-600 font-bold text-sm">{p.amount}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 rounded-full px-2 py-0.5">
                    <IconCheck /> {p.status}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="proof-fade text-gray-400 text-[11px] leading-relaxed max-w-2xl mb-16">
          {isLive
            ? 'Live transaction log pulled directly from the backend database. Worker names are shortened for privacy.'
            : "Sample transactions shown for illustration. Worker names are shortened for privacy. Once the backend database is connected, this log pulls directly from real payout records."}
        </p>

        {/* ─── TRUST BADGES ─── */}
        <div className="proof-fade grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
          <div className="glass-card rounded-3xl p-8 border border-gray-200 flex items-start gap-4">
            <span className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0"><IconShieldCheck /></span>
            <div>
              <h3 className="font-extrabold text-lg mb-1">Escrow Protected</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Employer funds are held safely and only released to workers once a task is approved.</p>
            </div>
          </div>
          <div className="glass-card rounded-3xl p-8 border border-gray-200 flex items-start gap-4">
            <span className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0"><IconZap /></span>
            <div>
              <h3 className="font-extrabold text-lg mb-1">Fast Payouts</h3>
              <p className="text-gray-500 text-sm leading-relaxed">JazzCash payouts are typically credited within minutes of approval.</p>
            </div>
          </div>
        </div>

        {/* ─── CTA ─── */}
        <div className="proof-fade text-center">
          <button
            onClick={() => navigate('/signup')}
            className="btn-primary py-4 px-14 text-base font-bold shadow-yellow-glow hover:scale-105 transition-transform inline-flex items-center gap-2"
          >
            Start Earning Now <IconArrowRight />
          </button>
        </div>
      </main>

      <Footer />
    </div>
  )
}

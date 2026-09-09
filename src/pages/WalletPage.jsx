import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi, getStoredUser, isAuthenticated } from '../lib/api'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { IconWallet, IconArrowRight, IconCheck } from '../components/icons'

export default function WalletPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => getStoredUser())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/signin', { replace: true })
      return
    }
    authApi.me().then((res) => setUser(res.user)).finally(() => setLoading(false))
  }, [navigate])

  if (!isAuthenticated()) return null

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sora relative overflow-x-hidden">
      <div className="orb w-[400px] h-[400px] bg-amber-50 top-[-10%] right-[10%]" aria-hidden="true" />
      <Header />

      <main className="relative z-10 px-6 lg:px-16 py-14 max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-black mb-1.5">Wallet</h1>
        <p className="text-gray-500 text-sm mb-8">Track your earnings, payment history, and withdrawals.</p>

        {loading ? (
          <div className="text-gray-400 text-sm">Loading wallet...</div>
        ) : (
          <>
            <div className="glass-card rounded-3xl border border-gray-200 p-7 sm:p-9 mb-8 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400 mb-1">Available Balance</div>
                <div className="text-3xl sm:text-4xl font-black text-amber-600">
                  PKR {(user?.walletBalance ?? 0).toLocaleString()}
                </div>
              </div>
              <span className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <IconWallet />
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <button
                disabled
                className="glass-card rounded-2xl border border-gray-200 p-5 text-left opacity-60 cursor-not-allowed"
              >
                <div className="text-sm font-bold text-gray-700 mb-1">Withdraw Funds</div>
                <div className="text-xs text-gray-400">Available once you've completed paid jobs.</div>
              </button>
              <div className="glass-card rounded-2xl border border-gray-200 p-5">
                <div className="text-sm font-bold text-gray-700 mb-1">Registration Fee</div>
                <div className={`text-xs font-semibold ${user?.registrationFeePaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {user?.registrationFeePaid ? 'Paid ✓' : 'Pending — complete payment to activate'}
                </div>
              </div>
            </div>

            <h2 className="font-bold text-gray-900 text-sm mb-4">Transaction History</h2>
            <div className="glass-card rounded-2xl border border-gray-200 p-10 text-center">
              <div className="w-11 h-11 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-3">
                <IconCheck />
              </div>
              <p className="text-gray-500 text-sm mb-1">No transactions yet.</p>
              <p className="text-gray-400 text-xs">Earnings from completed jobs will appear here.</p>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationApi, isAuthenticated } from '../lib/api'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { IconCheck, IconWallet, IconTag, IconClock, IconUsers } from '../components/icons'

const TYPE_ICON = {
  payment: IconWallet,
  application: IconTag,
  test: IconClock,
  account: IconUsers,
  message: IconClock,
  general: IconClock,
}

export default function Notifications() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/signin', { replace: true })
      return
    }
    notificationApi.list().then((res) => setNotifications(res.notifications || [])).finally(() => setLoading(false))
  }, [navigate])

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (err) {
      // no-op
    }
  }

  const handleClick = async (n) => {
    if (n.read) return
    try {
      await notificationApi.markRead(n._id)
      setNotifications((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)))
    } catch (err) {
      // no-op
    }
  }

  if (!isAuthenticated()) return null

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sora relative overflow-x-hidden">
      <div className="orb w-[400px] h-[400px] bg-amber-50 top-[-10%] right-[10%]" aria-hidden="true" />
      <Header />

      <main className="relative z-10 px-6 lg:px-16 py-14 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black mb-1.5">Notifications</h1>
            <p className="text-gray-500 text-sm">Payment, application, and account updates.</p>
          </div>
          {notifications.some((n) => !n.read) && (
            <button onClick={handleMarkAllRead} className="text-xs font-bold text-amber-600 hover:text-amber-700 whitespace-nowrap">
              Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-gray-400 text-sm">Loading notifications...</div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((n) => {
              const Icon = TYPE_ICON[n.type] || IconClock
              return (
                <button
                  key={n._id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left glass-card rounded-2xl border p-5 flex items-start gap-4 transition-colors ${
                    n.read ? 'border-gray-200' : 'border-amber-300 bg-amber-50/30'
                  }`}
                >
                  <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <Icon />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-700 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-2" />}
                </button>
              )
            })}
          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-3">
              <IconCheck />
            </div>
            <p className="text-gray-500 text-sm">You're all caught up — no notifications yet.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

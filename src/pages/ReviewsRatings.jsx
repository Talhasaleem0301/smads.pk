import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi, reviewApi, isAuthenticated } from '../lib/api'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { IconStar } from '../components/icons'

function initialsOf(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'U'
}

export default function ReviewsRatings() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/signin', { replace: true })
      return
    }
    Promise.allSettled([authApi.me(), reviewApi.myReviews()]).then(([meRes, revRes]) => {
      if (meRes.status === 'fulfilled') setUser(meRes.value.user)
      if (revRes.status === 'fulfilled') setReviews(revRes.value.reviews || [])
      setLoading(false)
    })
  }, [navigate])

  if (!isAuthenticated()) return null

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sora relative overflow-x-hidden">
      <div className="orb w-[400px] h-[400px] bg-amber-50 top-[-10%] right-[10%]" aria-hidden="true" />
      <Header />

      <main className="relative z-10 px-6 lg:px-16 py-14 max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-black mb-1.5">Reviews & Ratings</h1>
        <p className="text-gray-500 text-sm mb-8">Feedback you've received after completed jobs.</p>

        {loading ? (
          <div className="text-gray-400 text-sm">Loading reviews...</div>
        ) : (
          <>
            <div className="glass-card rounded-2xl border border-gray-200 p-6 mb-6 flex items-center gap-4">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.round(user?.rating || 0) ? '' : 'opacity-25'}>
                    <IconStar />
                  </span>
                ))}
              </div>
              <div>
                <div className="text-sm font-bold text-gray-800">
                  {user?.rating ? `${user.rating.toFixed(1)} / 5` : 'No rating yet'}
                </div>
                <div className="text-xs text-gray-400">{user?.reviewCount || 0} reviews</div>
              </div>
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r._id} className="glass-card rounded-2xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-brand-blue-900 flex items-center justify-center text-xs font-black flex-shrink-0">
                        {initialsOf(r.fromUser?.fullName)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{r.fromUser?.fullName || 'Member'}</div>
                        <div className="flex text-amber-500 text-xs">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < r.rating ? '' : 'opacity-25'}><IconStar /></span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-2xl border border-gray-200 p-12 text-center">
                <p className="text-gray-500 text-sm mb-1">No reviews yet.</p>
                <p className="text-gray-400 text-xs">Reviews from employers appear here after your first completed job.</p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

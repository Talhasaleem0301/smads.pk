import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { postApi, getStoredUser, isAuthenticated } from '../lib/api'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { IconMessageCircle } from '../components/icons'

const IconHeart = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
)

function initialsOf(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'U'
}

export default function NewsFeed() {
  const navigate = useNavigate()
  const user = getStoredUser()

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')

  const loadFeed = () => {
    postApi.feed().then((res) => setPosts(res.posts || [])).finally(() => setLoading(false))
  }

  useEffect(() => { loadFeed() }, [])

  const handlePost = async (e) => {
    e.preventDefault()
    if (!isAuthenticated()) {
      navigate('/signin')
      return
    }
    if (!content.trim()) return
    setPosting(true)
    setError('')
    try {
      const res = await postApi.create(content)
      setPosts((prev) => [res.post, ...prev])
      setContent('')
    } catch (err) {
      setError(err.message || 'Could not publish your post.')
    } finally {
      setPosting(false)
    }
  }

  const handleLike = async (id) => {
    if (!isAuthenticated()) {
      navigate('/signin')
      return
    }
    try {
      const res = await postApi.toggleLike(id)
      setPosts((prev) => prev.map((p) => (p._id === id ? { ...p, likes: Array(res.likeCount).fill(null) } : p)))
    } catch (err) {
      // no-op — like is a soft interaction
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sora relative overflow-x-hidden">
      <div className="orb w-[400px] h-[400px] bg-amber-50 top-[-10%] right-[10%]" aria-hidden="true" />
      <Header />

      <main className="relative z-10 px-6 lg:px-16 py-14 max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-black mb-1.5">News Feed</h1>
        <p className="text-gray-500 text-sm mb-8">See what the community is sharing.</p>

        {/* Composer */}
        <form onSubmit={handlePost} className="glass-card rounded-2xl border border-gray-200 p-5 mb-8">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder={isAuthenticated() ? "Share an update with your network..." : 'Sign in to post an update...'}
            className="form-input resize-none mb-3"
          />
          {error && <p className="text-red-500 text-xs font-semibold mb-3">{error}</p>}
          <div className="flex justify-end">
            <button type="submit" disabled={posting || !content.trim()} className="btn-primary w-auto py-2.5 px-6 text-xs disabled:opacity-60">
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>

        {/* Feed */}
        {loading ? (
          <div className="text-gray-400 text-sm">Loading feed...</div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((p) => (
              <div key={p._id} className="glass-card rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-brand-blue-900 flex items-center justify-center text-sm font-black flex-shrink-0">
                    {initialsOf(p.author?.fullName)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{p.author?.fullName || 'Member'}</div>
                    <div className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-3 whitespace-pre-wrap">{p.content}</p>
                <button
                  onClick={() => handleLike(p._id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-rose-500 transition-colors"
                >
                  <IconHeart filled={false} /> {p.likes?.length || 0}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <IconMessageCircle />
            </div>
            <p className="text-gray-500 text-sm mb-1">No posts yet.</p>
            <p className="text-gray-400 text-xs">Be the first to share an update with the community.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jobPostApi, getStoredUser, isAuthenticated } from '../lib/api'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { IconCheck, IconTag, IconArrowRight } from '../components/icons'

export default function PostJob() {
  const navigate = useNavigate()
  const user = getStoredUser()

  const [myJobs, setMyJobs] = useState([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({ title: '', description: '', category: 'General', budget: '', deadline: '' })
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/signin', { replace: true })
      return
    }
    if (user?.role === 'employer' || user?.role === 'admin') {
      jobPostApi.myJobs().then((res) => setMyJobs(res.jobs || [])).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setPosting(true)
    setError('')
    try {
      const res = await jobPostApi.create(form)
      setMyJobs((prev) => [res.job, ...prev])
      setForm({ title: '', description: '', category: 'General', budget: '', deadline: '' })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Could not post this job.')
    } finally {
      setPosting(false)
    }
  }

  if (!isAuthenticated()) return null

  const isEmployer = user?.role === 'employer' || user?.role === 'admin'

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sora relative overflow-x-hidden">
      <div className="orb w-[400px] h-[400px] bg-amber-50 top-[-10%] right-[10%]" aria-hidden="true" />
      <Header />

      <main className="relative z-10 px-6 lg:px-16 py-14 max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-black mb-1.5">Post a Job</h1>
        <p className="text-gray-500 text-sm mb-8">Publish a task or job for workers to apply to.</p>

        {!isEmployer ? (
          <div className="glass-card rounded-2xl border border-gray-200 p-10 text-center">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <IconTag />
            </div>
            <p className="text-gray-700 text-sm font-semibold mb-1">Employer account required</p>
            <p className="text-gray-500 text-xs">Only employer accounts can post jobs. Your account role is <strong>{user?.role}</strong>.</p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="glass-card rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-4 mb-10">
              <input
                required
                placeholder="Job title (e.g. Edit 5 TikTok videos)"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="form-input"
              />
              <textarea
                required
                rows={4}
                placeholder="Describe the task, requirements, and deliverables..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="form-input resize-none"
              />
              <div className="grid sm:grid-cols-3 gap-3">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="form-input"
                >
                  {['General', 'TikTok', 'Instagram', 'YouTube', 'Assignments', 'Typing', 'Facebook'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  required
                  placeholder="Budget (e.g. PKR 1,000)"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  className="form-input"
                />
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="form-input"
                />
              </div>

              {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}
              {success && (
                <p className="text-emerald-600 text-xs font-semibold flex items-center gap-1.5"><IconCheck /> Job posted successfully!</p>
              )}

              <button type="submit" disabled={posting} className="btn-primary w-full py-3.5 text-sm font-bold disabled:opacity-60">
                {posting ? 'Publishing...' : 'Publish Job'}
              </button>
            </form>

            <h2 className="font-bold text-gray-900 text-sm mb-4">Your Posted Jobs</h2>
            {loading ? (
              <div className="text-gray-400 text-sm">Loading...</div>
            ) : myJobs.length > 0 ? (
              <div className="space-y-3">
                {myJobs.map((j) => (
                  <div key={j._id} className="glass-card rounded-2xl border border-gray-200 p-5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-gray-900 truncate">{j.title}</div>
                      <div className="text-xs text-gray-400">{j.category} · {j.budget}</div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border flex-shrink-0 ${
                      j.status === 'open' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>
                      {j.status === 'open' ? 'Open' : 'Closed'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-2xl border border-gray-200 p-10 text-center">
                <p className="text-gray-500 text-sm">You haven't posted any jobs yet.</p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

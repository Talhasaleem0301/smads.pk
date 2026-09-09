import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { authApi, jobApi, taskApi, clearSession, getStoredUser, isAuthenticated } from '../lib/api'
import { jobCategories } from '../data/jobCategories'
import Header from '../components/Header'
import Footer from '../components/Footer'
import TestAttemptModal from '../components/TestAttemptModal'
import {
  IconArrowRight,
  IconCheck,
  IconClock,
  IconStar,
  IconWallet,
  IconTag,
  IconUsers,
  IconMessageCircle,
  IconUpload,
  IconLink,
} from '../components/icons'

function initialsOf(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || 'U'
}

function StatusPill({ status }) {
  const map = {
    active: 'bg-emerald-500/15 text-emerald-600 border-emerald-400/30',
    pending: 'bg-amber-500/15 text-amber-600 border-amber-400/30',
    expired: 'bg-red-500/15 text-red-500 border-red-400/30',
    inactive: 'bg-gray-200 text-gray-500 border-gray-300',
  }
  const key = (status || 'pending').toLowerCase()
  const label = key.charAt(0).toUpperCase() + key.slice(1)
  return (
    <span className={`inline-flex items-center gap-1.5 border rounded-full px-3 py-1 text-[11px] font-bold ${map[key] || map.pending}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}

// One task's submission form: assignment write-up, zip file upload, and a
// Google Sheet link. Any combination of the three can be submitted — the
// worker only fills in what's relevant to that task.
function SubmitWorkCard({ task, onSubmitted }) {
  const [text, setText] = useState(task.user_text_submission || '')
  const [file, setFile] = useState(null)
  const [sheetUrl, setSheetUrl] = useState(task.google_sheet_url || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    if (f && !f.name.toLowerCase().endsWith('.zip')) {
      setError('Please upload a .zip file.')
      setFile(null)
      return
    }
    setError('')
    setFile(f || null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim() && !file && !sheetUrl.trim()) {
      setError('Add at least one of: assignment write-up, zip file, or Google Sheet link.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      let fileUrl = task.user_file_url || ''
      if (file) {
        const uploadRes = await taskApi.uploadSubmissionFile(file)
        fileUrl = uploadRes.fileUrl
      }
      const res = await taskApi.submitTask(task.id, {
        text: text.trim(),
        fileUrl,
        googleSheetUrl: sheetUrl.trim(),
      })
      onSubmitted(res.task)
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="glass-card rounded-2xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-gray-900">{task.title}</div>
          <div className="text-xs text-gray-400">{task.category}</div>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
          task.status === 'rejected' ? 'bg-red-50 text-red-500 border-red-200' : 'bg-amber-50 text-amber-600 border-amber-200'
        }`}>
          {task.status === 'rejected' ? 'Needs resubmission' : 'Pending submission'}
        </span>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 leading-relaxed">{task.description}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-[10px] font-semibold uppercase text-gray-500 mb-1">Assignment write-up</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Write or paste your completed assignment here..."
            className="form-input resize-none text-xs"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold uppercase text-gray-500 mb-1 flex items-center gap-1.5">
            <IconUpload /> Zip file
          </label>
          <input
            type="file"
            accept=".zip"
            onChange={handleFileChange}
            className="w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-600 hover:file:bg-amber-100"
          />
          {task.user_file_url && !file && (
            <a href={task.user_file_url} target="_blank" rel="noreferrer" className="text-[11px] text-amber-600 font-semibold mt-1 inline-block">
              Previously submitted file
            </a>
          )}
        </div>

        <div>
          <label className="block text-[10px] font-semibold uppercase text-gray-500 mb-1 flex items-center gap-1.5">
            <IconLink /> Google Sheet link
          </label>
          <input
            type="url"
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/..."
            className="form-input text-xs"
          />
        </div>

        {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary py-2.5 px-5 text-xs w-auto disabled:opacity-70"
        >
          {submitting ? 'Submitting...' : 'Submit Work'}
        </button>
      </form>
    </div>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const pageRef = useRef(null)

  const [user, setUser] = useState(() => getStoredUser())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bio, setBio] = useState('')
  const [editingBio, setEditingBio] = useState(false)
  const [savingBio, setSavingBio] = useState(false)
  const [applications, setApplications] = useState([])
  const [tasks, setTasks] = useState([])

  // Qualification Test — "Attempt Test" flow (admin publishes the test
  // bank from the Admin > Job Listing Moderation > Test Submission panel).
  const [attemptOpen, setAttemptOpen] = useState(false)
  const testPublished = typeof window !== 'undefined' && localStorage.getItem('ilab_test_published') === 'true'

  // Redirect to sign in if no session exists at all.
  useEffect(() => {
    if (!isAuthenticated() && !getStoredUser()) {
      navigate('/signin', { replace: true })
    }
  }, [navigate])

  // Load the freshest profile from the backend; fall back to the cached copy.
  useEffect(() => {
    let cancelled = false
    async function loadProfile() {
      try {
        const data = await authApi.me()
        if (!cancelled && data?.user) {
          setUser(data.user)
          setBio(data.user.bio || '')
        }
      } catch (err) {
        // Backend may be unreachable — fall back to the cached session user.
        if (!cancelled) {
          const cached = getStoredUser()
          if (cached) {
            setUser(cached)
            setBio(cached.bio || '')
          } else {
            setError('Could not load your profile. Please sign in again.')
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadProfile()
    return () => { cancelled = true }
  }, [])

  // Jobs the worker has applied to (see CategoryDetail's Apply button).
  useEffect(() => {
    jobApi.myApplications()
      .then((res) => setApplications(res.applications || []))
      .catch(() => setApplications([]))
  }, [])

  // Tasks assigned by admin that still need to be submitted (zip file,
  // assignment write-up, or a Google Sheet link).
  useEffect(() => {
    taskApi.getMyTasks()
      .then((res) => setTasks(res.tasks || []))
      .catch(() => setTasks([]))
  }, [])

  const handleTaskSubmitted = (updatedTask) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)))
  }

  // Where "Complete Payment" should send an unpaid member: straight to the
  // package-selection box on their assigned category page (or the first
  // category as a sensible default), so they can pick Silver/Golden/Platinum
  // and pay — instead of the read-only Payment Proof transactions log.
  const goToPayment = () => {
    const match = jobCategories.find((c) => c.name === user?.assignedCategory)
    const slug = match?.slug || jobCategories[0]?.slug
    navigate(slug ? `/jobs/${slug}?apply=1` : '/#pricing')
  }

  const tasksAwaitingSubmission = tasks.filter((t) => t.status === 'pending' || t.status === 'rejected')

  useEffect(() => {
    if (loading) return
    const ctx = gsap.context(() => {
      gsap.from('.profile-fade', { y: 20, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' })
    }, pageRef)
    return () => ctx.revert()
  }, [loading])

  const handleLogout = () => {
    clearSession()
    navigate('/signin')
  }

  const handleSaveBio = async () => {
    setSavingBio(true)
    try {
      const data = await authApi.updateMe({ bio })
      if (data?.user) setUser(data.user)
    } catch (err) {
      // Keep the locally-edited bio visible even if the save call fails.
    } finally {
      setSavingBio(false)
      setEditingBio(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-sora">
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading your profile...
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white text-gray-900 font-sora flex flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-3xl font-black">{error || "We couldn't find your account"}</h1>
        <Link to="/signin" className="btn-primary py-3 px-8 inline-flex items-center gap-2 w-auto">
          Sign In <IconArrowRight />
        </Link>
      </div>
    )
  }

  const roleLabel = user.role === 'employer' ? 'Employer' : 'Worker / Member'

  return (
    <div ref={pageRef} className="min-h-screen bg-white text-gray-900 font-sora relative overflow-x-hidden">
      <div className="orb w-[500px] h-[500px] bg-blue-600/20 top-[-10%] right-[10%]" aria-hidden="true" />
      <div className="orb w-[400px] h-[400px] bg-amber-50 bottom-[5%] left-[-10%]" aria-hidden="true" />

      <Header />

      <main className="relative z-10 px-6 lg:px-16 py-14 max-w-6xl mx-auto">
        {/* ─── PROFILE HEADER ─── */}
        <div className="profile-fade glass-card rounded-3xl border border-gray-200 p-7 sm:p-9 mb-8 flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-500 text-brand-blue-900 flex items-center justify-center text-2xl font-black shadow-lg flex-shrink-0">
            {initialsOf(user.fullName)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-black truncate">{user.fullName || 'Your Profile'}</h1>
              <StatusPill status={user.accountStatus} />
            </div>
            <p className="text-gray-500 text-sm mb-3">{user.email}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="border border-gray-200 rounded-full px-3 py-1 text-gray-600">{roleLabel}</span>
              <span className={`border rounded-full px-3 py-1 ${user.registrationFeePaid ? 'border-emerald-300 text-emerald-600 bg-emerald-50' : 'border-amber-300 text-amber-600 bg-amber-50'}`}>
                {user.registrationFeePaid ? 'Registration fee paid' : 'Registration fee pending'}
              </span>
            </div>
          </div>

          <div className="flex sm:flex-col gap-2 flex-shrink-0">
            {!user.registrationFeePaid && (
              <button
                onClick={goToPayment}
                className="btn-primary py-2.5 px-5 text-xs w-auto whitespace-nowrap"
              >
                Complete Payment
              </button>
            )}
            <button onClick={handleLogout} className="btn-ghost py-2.5 px-5 text-xs whitespace-nowrap">
              Log Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ─── LEFT: BIO + WORK HISTORY + POSTS ─── */}
          <div className="lg:col-span-7 space-y-8">
            {/* Bio */}
            <section className="profile-fade">
              <h2 className="text-lg font-extrabold mb-4">About</h2>
              <div className="glass-card rounded-2xl border border-gray-200 p-6">
                {editingBio ? (
                  <div>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      maxLength={400}
                      placeholder="Tell employers a bit about your skills and experience..."
                      className="form-input resize-none"
                    />
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={handleSaveBio}
                        disabled={savingBio}
                        className="btn-primary py-2 px-5 text-xs w-auto disabled:opacity-70"
                      >
                        {savingBio ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => { setEditingBio(false); setBio(user.bio || '') }}
                        className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {bio || 'No bio added yet. Add a short introduction so employers know who they’re hiring.'}
                    </p>
                    <button
                      onClick={() => setEditingBio(true)}
                      className="mt-4 text-xs font-bold text-amber-600 hover:text-amber-700"
                    >
                      {bio ? 'Edit bio' : 'Add a bio'}
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Work History */}
            <section className="profile-fade">
              <h2 className="text-lg font-extrabold mb-4 flex items-center gap-2">
                <IconTag /> Work History
              </h2>
              <div className="glass-card rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                {(user.workHistory && user.workHistory.length > 0) ? (
                  user.workHistory.map((w, i) => (
                    <div key={i} className="flex items-center justify-between gap-4 px-6 py-4">
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{w.title}</div>
                        <div className="text-xs text-gray-400">{w.category}</div>
                      </div>
                      <span className="text-amber-600 font-bold text-sm whitespace-nowrap">{w.pay}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-10 text-center">
                    <p className="text-gray-500 text-sm mb-3">You haven't completed any tasks yet.</p>
                    <Link to="/#job-categories" className="text-amber-600 text-xs font-bold hover:text-amber-700 inline-flex items-center gap-1">
                      Browse job categories <IconArrowRight />
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* Submit Your Work — always visible so members can see their
                registration/payment status and the zip-upload option even
                before any task has been assigned by admin. */}
            <section className="profile-fade">
              <h2 className="text-lg font-extrabold mb-4 flex items-center gap-2">
                <IconUpload /> Submit Your Work
              </h2>

              {!user.registrationFeePaid && tasksAwaitingSubmission.length === 0 ? (
                <div className="glass-card rounded-2xl border border-amber-200 bg-amber-50/60 p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 border border-amber-300 bg-amber-100 text-amber-700 rounded-full px-3 py-1 text-[11px] font-bold flex-shrink-0">
                      Not Paid
                    </span>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Complete your registration fee to get assigned tasks and unlock work submission (zip file, write-up, or Google Sheet link).
                    </p>
                  </div>
                  <button
                    onClick={goToPayment}
                    className="btn-primary py-2.5 px-5 text-xs w-auto whitespace-nowrap flex-shrink-0"
                  >
                    Complete Payment
                  </button>
                </div>
              ) : tasksAwaitingSubmission.length > 0 ? (
                <div className="space-y-4">
                  {!user.registrationFeePaid && (
                    <div className="glass-card rounded-2xl border border-amber-200 bg-amber-50/60 p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 border border-amber-300 bg-amber-100 text-amber-700 rounded-full px-3 py-1 text-[11px] font-bold flex-shrink-0">
                          Not Paid
                        </span>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          You have a task assigned, but your registration fee is still pending. Complete payment to keep receiving new work.
                        </p>
                      </div>
                      <button
                        onClick={goToPayment}
                        className="btn-primary py-2.5 px-5 text-xs w-auto whitespace-nowrap flex-shrink-0"
                      >
                        Complete Payment
                      </button>
                    </div>
                  )}
                  {tasksAwaitingSubmission.map((task) => (
                    <SubmitWorkCard key={task.id} task={task} onSubmitted={handleTaskSubmitted} />
                  ))}
                </div>
              ) : (
                <div className="glass-card rounded-2xl border border-gray-200 p-6 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 border border-emerald-300 bg-emerald-50 text-emerald-600 rounded-full px-3 py-1 text-[11px] font-bold flex-shrink-0">
                    Paid
                  </span>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    No task has been assigned to you yet. Once admin assigns you a task, your zip file upload, assignment write-up, and Google Sheet link options will appear here.
                  </p>
                </div>
              )}
            </section>

            {/* Job Applications */}
            <section className="profile-fade">
              <h2 className="text-lg font-extrabold mb-4 flex items-center gap-2">
                <IconArrowRight /> Job Applications
              </h2>
              <div className="glass-card rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                {applications.length > 0 ? (
                  applications.map((a) => (
                    <div key={a._id} className="flex items-center justify-between gap-4 px-6 py-4">
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{a.categoryName}</div>
                        <div className="text-xs text-gray-400">
                          Applied {new Date(a.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        a.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        a.status === 'Rejected' ? 'bg-red-50 text-red-500 border-red-200' :
                        a.status === 'Completed' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        'bg-amber-50 text-amber-600 border-amber-200'
                      }`}>
                        {a.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-10 text-center">
                    <p className="text-gray-500 text-sm mb-3">You haven't applied to any jobs yet.</p>
                    <Link to="/#job-categories" className="text-amber-600 text-xs font-bold hover:text-amber-700 inline-flex items-center gap-1">
                      Browse job categories <IconArrowRight />
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* Posts */}
            <section className="profile-fade">
              <h2 className="text-lg font-extrabold mb-4 flex items-center gap-2">
                <IconMessageCircle /> Posts
              </h2>
              <div className="glass-card rounded-2xl border border-gray-200 p-10 text-center">
                <p className="text-gray-500 text-sm mb-1">No posts yet.</p>
                <p className="text-gray-400 text-xs">Updates you share with your network will show up here.</p>
              </div>
            </section>
          </div>

          {/* ─── RIGHT: STATS + RATINGS ─── */}
          <aside className="lg:col-span-5 space-y-6">
            <section className="profile-fade grid grid-cols-2 gap-4">
              <div className="glass-card rounded-2xl p-5 border border-gray-200 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0"><IconClock /></span>
                <div>
                  <div className="text-gray-900 font-bold text-sm">
                    {user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString() : '—'}
                  </div>
                  <div className="text-gray-400 text-[11px]">Last active</div>
                </div>
              </div>
              <div className="glass-card rounded-2xl p-5 border border-gray-200 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0"><IconUsers /></span>
                <div>
                  <div className="text-gray-900 font-bold text-sm">{user.connections ?? 0}</div>
                  <div className="text-gray-400 text-[11px]">Connections</div>
                </div>
              </div>
            </section>

            {/* Ratings & reviews */}
            <section className="profile-fade">
              <h2 className="text-lg font-extrabold mb-4 flex items-center gap-2">
                <IconStar /> Ratings & Reviews
              </h2>
              <div className="glass-card rounded-2xl border border-gray-200 p-6">
                {user.rating ? (
                  <div className="flex items-center gap-4">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => <IconStar key={i} />)}
                    </div>
                    <div>
                      <div className="text-sm font-bold">{user.rating.toFixed(1)} / 5</div>
                      <div className="text-gray-400 text-xs">{user.reviewCount || 0} reviews</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm mb-1">No ratings yet.</p>
                    <p className="text-gray-400 text-xs">Reviews from employers will appear here after your first completed job.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Qualification Test */}
            <section className="profile-fade">
              <h2 className="text-lg font-extrabold mb-4 flex items-center gap-2">
                <IconClock /> Qualification Test
              </h2>
              <div className="glass-card rounded-2xl border border-gray-200 p-6">
                {user.testStatus === 'passed' ? (
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0"><IconCheck /></span>
                    <div>
                      <div className="text-sm font-bold text-emerald-600">Passed — {user.testScore}/10</div>
                      <div className="text-gray-400 text-xs">You're eligible for job assignments.</div>
                    </div>
                  </div>
                ) : user.testStatus === 'pending_verification' ? (
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0"><IconClock /></span>
                    <div>
                      <div className="text-sm font-bold text-amber-600">Passed — {user.testScore}/10, pending verification</div>
                      <div className="text-gray-400 text-xs">Your result is being confirmed by an admin. You'll be notified shortly.</div>
                    </div>
                  </div>
                ) : user.testStatus === 'failed' ? (
                  <div>
                    <div className="text-sm font-bold text-red-500 mb-1">Not passed — {user.testScore}/10</div>
                    <p className="text-gray-500 text-xs mb-3">You needed 6/10 to pass. Contact support to discuss next steps.</p>
                    {testPublished && (
                      <button
                        onClick={() => setAttemptOpen(true)}
                        className="btn-primary text-xs font-bold px-5 py-2.5"
                      >
                        Retake Test
                      </button>
                    )}
                  </div>
                ) : user.testStatus === 'scheduled' ? (
                  <div>
                    <div className="text-sm font-bold text-gray-800 mb-1">
                      {new Date(user.testAvailableAt) > new Date() ? 'Unlocks soon' : 'Ready to take'}
                    </div>
                    <p className="text-gray-500 text-xs mb-1">
                      {new Date(user.testAvailableAt) > new Date()
                        ? `Available from ${new Date(user.testAvailableAt).toLocaleString()}.`
                        : 'Your qualification test is now available.'}
                    </p>
                    <p className="text-gray-400 text-[11px] mb-3">10 questions · need 6 correct to pass.</p>
                    {new Date(user.testAvailableAt) <= new Date() && (
                      testPublished ? (
                        <button
                          onClick={() => setAttemptOpen(true)}
                          className="btn-primary text-xs font-bold px-5 py-2.5"
                        >
                          Attempt Test
                        </button>
                      ) : (
                        <p className="text-gray-400 text-[11px] italic">Waiting for admin to publish the test question bank.</p>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-gray-500 text-sm mb-1">No test scheduled yet.</p>
                    <p className="text-gray-400 text-xs">Your qualification test unlocks 24 hours after your registration payment is approved.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Wallet snapshot */}
            <section className="profile-fade">
              <h2 className="text-lg font-extrabold mb-4 flex items-center gap-2">
                <IconWallet /> Wallet
              </h2>
              <div className="glass-card rounded-2xl border border-gray-200 p-6 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-black text-amber-600">
                    PKR {(user.walletBalance ?? 0).toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-xs mt-1">Available balance</div>
                </div>
                <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><IconCheck /></span>
              </div>
            </section>
          </aside>
        </div>
      </main>

      <Footer />

      {attemptOpen && (
        <TestAttemptModal
          onClose={() => setAttemptOpen(false)}
          onFinished={(updatedUser) => {
            if (updatedUser) setUser(updatedUser)
          }}
        />
      )}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi, jobApi, taskApi, getStoredUser, isAuthenticated } from '../lib/api'
import Header from '../components/Header'
import Footer from '../components/Footer'
import {
  IconArrowRight,
  IconCheck,
  IconClock,
  IconWallet,
  IconTag,
  IconUsers,
  IconClipboard,
} from '../components/icons'

const MAX_SUBMISSION_MB = 15

function TaskSubmitRow({ task, onSubmitted }) {
  const fileInputRef = useRef(null)
  const [text, setText] = useState(task.user_text_submission || '')
  const [fileName, setFileName] = useState('')
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setError('')
    if (f.size > MAX_SUBMISSION_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_SUBMISSION_MB}MB.`)
      return
    }
    setFile(f)
    setFileName(f.name)
  }

  const handleSubmit = async () => {
    if (!text.trim() && !file) {
      setError('Type your work or attach a file (zip / excel / doc) before submitting.')
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
      const res = await taskApi.submitTask(task.id, { text, fileUrl })
      onSubmitted?.(res.task)
    } catch (err) {
      setError(err.message || 'Could not submit your work. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const statusColors = {
    pending: 'bg-amber-50 text-amber-600 border-amber-200',
    submitted: 'bg-blue-50 text-blue-600 border-blue-200',
    completed: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    rejected: 'bg-red-50 text-red-600 border-red-200',
  }

  return (
    <div className="border border-gray-200 rounded-2xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="text-sm font-bold text-gray-900">{task.title}</div>
          <div className="text-xs text-gray-400">{task.category}</div>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border capitalize ${statusColors[task.status] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
          {task.status}
        </span>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 mb-2 leading-relaxed">{task.description}</p>
      )}

      {task.admin_file_url && (
        <a
          href={task.admin_file_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 mb-3"
        >
          Download assignment file <IconArrowRight />
        </a>
      )}

      {(task.status === 'pending' || task.status === 'rejected') ? (
        <div className="mt-2 space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your work here (e.g. assignment writing)..."
            rows={3}
            className="w-full text-xs rounded-xl border border-gray-200 p-3 focus:outline-none focus:border-amber-400"
          />
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-bold px-3 py-2 rounded-full border border-gray-200 text-gray-600 hover:border-amber-300"
            >
              {fileName ? `📎 ${fileName}` : 'Attach file (zip / excel / doc)'}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary text-xs font-bold px-4 py-2 disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit Work'}
            </button>
          </div>
          {error && <p className="text-red-500 text-[11px] font-semibold">{error}</p>}
        </div>
      ) : (
        <div className="text-[11px] text-gray-400">
          {task.status === 'submitted' && 'Submitted — waiting for admin review.'}
          {task.status === 'completed' && 'Approved by admin.'}
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, accent = 'text-amber-600 bg-amber-50' }) {
  return (
    <div className="glass-card rounded-2xl border border-gray-200 p-5 flex items-center gap-3">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
        <Icon />
      </span>
      <div>
        <div className="text-gray-900 font-bold text-sm">{value}</div>
        <div className="text-gray-400 text-[11px]">{label}</div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => getStoredUser())
  const [applications, setApplications] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/signin', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    Promise.allSettled([authApi.me(), jobApi.myApplications(), taskApi.getMyTasks()]).then(([meRes, appsRes, tasksRes]) => {
      if (meRes.status === 'fulfilled') setUser(meRes.value.user)
      if (appsRes.status === 'fulfilled') setApplications(appsRes.value.applications || [])
      if (tasksRes.status === 'fulfilled') setTasks(tasksRes.value.tasks || [])
      setLoading(false)
    })
  }, [])

  const completedCount = tasks.filter((t) => t.status === 'completed').length
  const pendingCount = tasks.filter((t) => t.status === 'pending' || t.status === 'submitted').length

  const handleTaskUpdated = (updated) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  if (!isAuthenticated()) return null

  const accountStatusLabel = {
    active: 'Active',
    pending_payment: 'Pending Payment',
    expired: 'Expired',
    inactive: 'Inactive',
  }[user?.accountStatus] || 'Unknown'

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sora relative overflow-x-hidden">
      <div className="orb w-[500px] h-[500px] bg-blue-600/20 top-[-10%] right-[10%]" aria-hidden="true" />
      <Header />

      <main className="relative z-10 px-6 lg:px-16 py-14 max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-black mb-1.5">
          Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''} 👋
        </h1>
        <p className="text-gray-500 text-sm mb-8">Here's a quick summary of your account and activity.</p>

        {loading ? (
          <div className="text-gray-400 text-sm">Loading dashboard...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
              <StatCard icon={IconCheck} label="Account Status" value={accountStatusLabel} />
              <StatCard icon={IconTag} label="Applications" value={applications.length} />
              <StatCard icon={IconWallet} label="Wallet Balance" value={`PKR ${(user?.walletBalance ?? 0).toLocaleString()}`} />
              <StatCard icon={IconUsers} label="Connections" value={user?.connections ?? 0} />
              <StatCard icon={IconClipboard} label="Tasks Completed" value={completedCount} accent="text-emerald-600 bg-emerald-50" />
              <StatCard icon={IconClock} label="Tasks Pending" value={pendingCount} accent="text-blue-600 bg-blue-50" />
            </div>

            {/* My Tasks */}
            {tasks.length > 0 && (
              <div className="glass-card rounded-2xl border border-gray-200 p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900 text-sm">My Tasks {user?.assignedCategory ? `— ${user.assignedCategory}` : ''}</h2>
                  <span className="text-[11px] text-gray-400">{completedCount} completed · {pendingCount} pending</span>
                </div>
                <div className="space-y-4">
                  {tasks.map((t) => (
                    <TaskSubmitRow key={t.id} task={t} onSubmitted={handleTaskUpdated} />
                  ))}
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Account status card */}
              <div className="lg:col-span-1 glass-card rounded-2xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-4 text-sm">Account</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Registration fee</span>
                    <span className={user?.registrationFeePaid ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                      {user?.registrationFeePaid ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Qualification test</span>
                    <span className="font-semibold text-gray-700 capitalize">{(user?.testStatus || 'not_scheduled').replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Role</span>
                    <span className="font-semibold text-gray-700 capitalize">{user?.role}</span>
                  </div>
                </div>
                <Link to="/profile" className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700">
                  View full profile <IconArrowRight />
                </Link>
              </div>

              {/* Recent applications */}
              <div className="lg:col-span-2 glass-card rounded-2xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-4 text-sm">Recent Job Applications</h2>
                {applications.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {applications.slice(0, 5).map((a) => (
                      <div key={a._id} className="flex items-center justify-between py-3">
                        <div>
                          <div className="text-sm font-semibold text-gray-800">{a.categoryName}</div>
                          <div className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</div>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                          {a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm mb-3">No applications yet.</p>
                    <Link to="/#job-categories" className="text-amber-600 text-xs font-bold hover:text-amber-700 inline-flex items-center gap-1">
                      Browse job categories <IconArrowRight />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quick links */}
            <div className="grid sm:grid-cols-3 gap-4 mt-8">
              <Link to="/notifications" className="glass-card rounded-2xl border border-gray-200 p-5 hover:border-amber-300 transition-colors flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><IconClock /></span>
                <span className="text-sm font-semibold text-gray-700">Notifications</span>
              </Link>
              <Link to="/wallet" className="glass-card rounded-2xl border border-gray-200 p-5 hover:border-amber-300 transition-colors flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><IconWallet /></span>
                <span className="text-sm font-semibold text-gray-700">Wallet</span>
              </Link>
              <Link to="/settings" className="glass-card rounded-2xl border border-gray-200 p-5 hover:border-amber-300 transition-colors flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><IconUsers /></span>
                <span className="text-sm font-semibold text-gray-700">Settings</span>
              </Link>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

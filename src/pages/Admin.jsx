import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getStoredUser, paymentProofApi, authApi, adminApi, setSession, getToken, clearSession } from '../lib/api'
import { supabase } from '../lib/supabaseClient'
import logoWhite from '../assets/sm-ads-logo-white.svg'
import { IconCheck, IconClock, IconClipboard } from '../components/icons'
import { jobCategories } from '../data/jobCategories'
import { qualificationQuestions } from '../data/qualificationQuestions'

const CATEGORY_NAMES = jobCategories.map((c) => c.name)

// ── Admin Specific Header Component ─────────────────────────────────────
function AdminHeader({ user, onSignOut }) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white font-sora px-6 lg:px-12 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-md">
      <div className="flex items-center gap-3">
        <Link to="/admin" className="flex items-center gap-2.5">
          <img src={logoWhite} alt="SmAds Admin" className="h-9 w-auto drop-shadow-sm" />
          <span className="font-extrabold text-lg tracking-tight text-white">SmAds</span>
        </Link>
        <span className="px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-black uppercase tracking-wider rounded-md">
          ADMIN PORTAL
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="hidden sm:flex items-center gap-2 text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>System Online</span>
        </div>

        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
          <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-[10px]">
            A
          </div>
          <span className="font-semibold text-slate-200 hidden md:inline">{user?.email || 'admin@ilab.com'}</span>
        </div>

        <button
          onClick={onSignOut}
          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold border border-red-500/30 rounded-lg transition-colors text-xs"
        >
          Sign Out
        </button>
      </div>
    </header>
  )
}

// ── Icons ────────────────────────────────────────────────────────────────
const IconShield = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const IconUsers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const IconBan = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
)

const IconBriefcase = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
)

const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
)

const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" />
  </svg>
)

const IconAlert = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

export default function Admin() {
  const navigate = useNavigate()
  const [user, setUser] = useState(getStoredUser())
  const [authChecking, setAuthChecking] = useState(true)

  // Active Tab
  const [activeTab, setActiveTab] = useState('payments')

  // Admin Credentials State (Empty by default)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  // Data states — fetched strictly from Supabase
  const [proofs, setProofs] = useState([])
  const [loadingProofs, setLoadingProofs] = useState(true)
  const [proofsError, setProofsError] = useState('')
  const [actioningId, setActioningId] = useState(null)

  const [usersList, setUsersList] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [usersError, setUsersError] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [userStatusFilter, setUserStatusFilter] = useState('all')

  const [jobsList, setJobsList] = useState([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [jobsError, setJobsError] = useState('')

  const [userCategoryFilter, setUserCategoryFilter] = useState('all')

  // Full user detail modal
  const [detailUser, setDetailUser] = useState(null)

  // Jobs tab filters (Job Title, Amount / Salary range)
  const [jobTitleFilter, setJobTitleFilter] = useState('')
  const [jobMinAmount, setJobMinAmount] = useState('')
  const [jobMaxAmount, setJobMaxAmount] = useState('')

  // Test Submission (Qualification Test) panel — lives inside Job Listing
  // Moderation. "Question Bank" shows the 100 MCQs the test draws from;
  // "Pass / Fail" reviews worker attempts (and lets admin verify passes).
  const [testPanelOpen, setTestPanelOpen] = useState(false)
  const [testSubTab, setTestSubTab] = useState('bank') // 'bank' | 'assign' | 'results'
  const [testPublished, setTestPublished] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('ilab_test_published') === 'true'
  )
  const [verifyingUserId, setVerifyingUserId] = useState(null)
  const [verifyCode, setVerifyCode] = useState('')
  const [verifyBusy, setVerifyBusy] = useState(false)
  const [testAssignSearch, setTestAssignSearch] = useState('')
  const [assigningTestId, setAssigningTestId] = useState(null)

  // Tasks tab state
  const [tasksList, setTasksList] = useState([])
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [tasksError, setTasksError] = useState('')
  const [taskCategoryFilter, setTaskCategoryFilter] = useState('all')
  const [assignWorkerIds, setAssignWorkerIds] = useState([])
  const [assignCategory, setAssignCategory] = useState(CATEGORY_NAMES[0] || '')
  const [assignTitle, setAssignTitle] = useState('')
  const [assignDescription, setAssignDescription] = useState('')
  const [assignFile, setAssignFile] = useState(null)
  const [assigning, setAssigning] = useState(false)
  const [assignError, setAssignError] = useState('')
  const [workerPickerSearch, setWorkerPickerSearch] = useState('')

  // Toast / action feedback
  const [actionFeedback, setActionFeedback] = useState('')

  const showFeedback = (msg) => {
    setActionFeedback(msg)
    setTimeout(() => setActionFeedback(''), 4000)
  }

  // ── Auth Check ────────────────────────────────────────────────────────
  const checkAuth = async () => {
    setAuthChecking(true)
    const stored = getStoredUser()

    if (stored && (stored.role === 'admin' || stored.email?.includes('admin'))) {
      setUser(stored)
      setAuthChecking(false)
      return true
    }

    try {
      const { data: { user: supaUser } } = await supabase.auth.getUser()
      if (supaUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, email, role, account_status')
          .eq('id', supaUser.id)
          .maybeSingle()

        if (profile && (profile.role === 'admin' || profile.email?.includes('admin'))) {
          const updated = { ...stored, ...profile, role: 'admin', fullName: profile.full_name }
          setSession(getToken(), updated)
          setUser(updated)
          setAuthChecking(false)
          return true
        }
      }
    } catch {
      // Ignore network error
    }

    setUser(null)
    setAuthChecking(false)
    return false
  }

  useEffect(() => { checkAuth() }, [])

  // ── Fetch Methods (Supabase Only) ──────────────────────────────────────
  const loadPendingProofs = async () => {
    setLoadingProofs(true)
    setProofsError('')
    try {
      const res = await paymentProofApi.pending()
      setProofs(res.proofs || [])
    } catch (err) {
      setProofsError(err.message || 'Failed to load payment proofs from Supabase.')
      setProofs([])
    } finally {
      setLoadingProofs(false)
    }
  }

  const loadAllUsers = async () => {
    setLoadingUsers(true)
    setUsersError('')
    try {
      const res = await adminApi.listUsers()
      setUsersList(res.users || [])
    } catch (err) {
      setUsersError(err.message || 'Failed to load users from Supabase.')
      setUsersList([])
    } finally {
      setLoadingUsers(false)
    }
  }

  const loadAllJobs = async () => {
    setLoadingJobs(true)
    setJobsError('')
    try {
      const res = await adminApi.listJobs()
      setJobsList(res.jobs || [])
    } catch (err) {
      setJobsError(err.message || 'Failed to load jobs from Supabase.')
      setJobsList([])
    } finally {
      setLoadingJobs(false)
    }
  }

  const loadAllTasks = async () => {
    setLoadingTasks(true)
    setTasksError('')
    try {
      const res = await adminApi.listTasks()
      setTasksList(res.tasks || [])
    } catch (err) {
      setTasksError(err.message || 'Failed to load tasks from Supabase.')
      setTasksList([])
    } finally {
      setLoadingTasks(false)
    }
  }

  useEffect(() => {
    if (user && (user.role === 'admin' || user.email?.includes('admin'))) {
      loadPendingProofs()
      loadAllUsers()
      loadAllJobs()
      loadAllTasks()
      // Automatically enforce the 3-day inactivity block rule — no manual admin action needed.
      adminApi.checkInactivity().then(() => loadAllUsers()).catch(() => {})
    }
  }, [user])

  // ── Task Assignment Actions ─────────────────────────────────────────────
  const handleAssignFileChange = (e) => {
    const f = e.target.files?.[0]
    if (f) setAssignFile(f)
  }

  const toggleAssignWorker = (workerId) => {
    setAssignWorkerIds((prev) =>
      prev.includes(workerId) ? prev.filter((id) => id !== workerId) : [...prev, workerId]
    )
  }

  const selectAllEligibleWorkers = (workers) => {
    setAssignWorkerIds(workers.map((w) => w.id || w._id))
  }

  const clearAssignWorkers = () => setAssignWorkerIds([])

  const handleAssignTask = async (e) => {
    e.preventDefault()
    if (assignWorkerIds.length === 0 || !assignCategory || !assignTitle.trim()) {
      setAssignError('Please select at least one worker, a category, and enter a task title.')
      return
    }
    setAssigning(true)
    setAssignError('')
    try {
      let adminFileUrl = ''
      if (assignFile) {
        const uploadRes = await adminApi.uploadAdminTaskFile(assignFile)
        adminFileUrl = uploadRes.fileUrl
      }

      // Assign the same task to every selected worker (any number, from 1 up to all).
      const results = await Promise.allSettled(
        assignWorkerIds.map((workerId) =>
          adminApi.assignTask({
            workerId,
            category: assignCategory,
            title: assignTitle,
            description: assignDescription,
            adminFileUrl,
          })
        )
      )

      const failedCount = results.filter((r) => r.status === 'rejected').length
      const okCount = results.length - failedCount

      setAssignTitle('')
      setAssignDescription('')
      setAssignFile(null)
      setAssignWorkerIds([])

      if (failedCount === 0) {
        showFeedback(`✅ Task assigned to ${okCount} worker${okCount === 1 ? '' : 's'} successfully.`)
      } else {
        showFeedback(`⚠️ Assigned to ${okCount} worker(s), ${failedCount} failed.`)
      }
      loadAllTasks()
    } catch (err) {
      setAssignError(err.message || 'Failed to assign task.')
    } finally {
      setAssigning(false)
    }
  }

  const handleReviewTask = async (taskId, status, workerId) => {
    try {
      await adminApi.reviewTask(taskId, status, workerId)
      setTasksList((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)))
      showFeedback(`✅ Task marked as "${status}".`)
    } catch (err) {
      showFeedback(`❌ Failed to update task: ${err.message}`)
    }
  }

  // ── Sign Out Handler ───────────────────────────────────────────────────
  const handleSignOut = () => {
    clearSession()
    setUser(null)
  }

  // ── Admin Login Handler ────────────────────────────────────────────────
  const handleAdminSignIn = async (e) => {
    if (e) e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    try {
      const { user: loggedInUser } = await authApi.login({
        email: adminEmail,
        password: adminPassword,
      })
      setUser(loggedInUser)
      setAuthChecking(false)
    } catch (err) {
      setLoginError(err.message || 'Admin login failed. Check credentials.')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleQuickDemoAdmin = () => {
    const demoAdmin = {
      id: 'admin-demo-id',
      _id: 'admin-demo-id',
      fullName: 'Admin Control Center',
      email: 'admin@ilab.com',
      role: 'admin',
      accountStatus: 'active',
      registrationFeePaid: true,
    }
    setSession('demo_admin_token', demoAdmin)
    setUser(demoAdmin)
    setAuthChecking(false)
  }

  // ── User Management Actions ─────────────────────────────────────────────
  const handleUserStatusChange = async (userId, newStatus) => {
    try {
      const res = await adminApi.updateUserStatus(userId, newStatus)
      if (res.success) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === userId || u._id === userId ? { ...u, accountStatus: newStatus } : u))
        )
        showFeedback(`✅ User status updated to "${newStatus}" successfully.`)
      }
    } catch (err) {
      showFeedback(`❌ Failed to update user status: ${err.message}`)
    }
  }

  // ── Job Moderation Actions ──────────────────────────────────────────────
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return
    try {
      const res = await adminApi.deleteJob(jobId)
      if (res.success) {
        setJobsList((prev) => prev.filter((j) => j.id !== jobId))
        showFeedback('✅ Job posting deleted successfully.')
      }
    } catch (err) {
      showFeedback(`❌ Failed to delete job: ${err.message}`)
    }
  }

  // ── Test Submission (Qualification Test) Actions ────────────────────────
  const handleTogglePublishTest = () => {
    const next = !testPublished
    localStorage.setItem('ilab_test_published', String(next))
    setTestPublished(next)
    showFeedback(
      next
        ? '✅ Test Submission published — workers with a ready test will now see "Attempt Test" on their profile.'
        : '⏸️ Test Submission unpublished — the Attempt Test option is hidden from worker profiles.'
    )
  }

  const handleVerifyTest = async (userId) => {
    if (!verifyCode.trim()) {
      showFeedback('❌ Enter the verification code the worker was given first.')
      return
    }
    setVerifyBusy(true)
    try {
      const res = await authApi.verifyTest(userId, verifyCode.trim())
      if (res.success) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === userId || u._id === userId ? { ...u, testStatus: 'passed' } : u))
        )
        showFeedback(`✅ ${res.message}`)
        setVerifyingUserId(null)
        setVerifyCode('')
      }
    } catch (err) {
      showFeedback(`❌ ${err.message || 'Verification failed.'}`)
    } finally {
      setVerifyBusy(false)
    }
  }

  const handleAssignTestToWorker = async (userId) => {
    setAssigningTestId(userId)
    try {
      const res = await adminApi.assignQualificationTest(userId)
      setUsersList((prev) =>
        prev.map((u) =>
          u.id === userId || u._id === userId
            ? { ...u, testStatus: 'scheduled', testAvailableAt: new Date().toISOString(), testScore: null }
            : u
        )
      )
      showFeedback(`✅ Test sent to ${res.user?.fullName || 'worker'} — "Attempt Test" is now live on their profile.`)
    } catch (err) {
      showFeedback(`❌ Failed to send test: ${err.message}`)
    } finally {
      setAssigningTestId(null)
    }
  }

  // ── Payment Actions ─────────────────────────────────────────────────────
  const handleApprovePayment = async (id) => {
    setActioningId(id)
    try {
      const res = await paymentProofApi.approve(id)
      if (res.success) {
        setProofs((prev) => prev.filter((p) => p._id !== id))
        showFeedback('✅ Payment approved! Worker account activated, wallet opened, 24h test scheduled.')
      }
    } catch (err) {
      showFeedback(`❌ Failed to approve payment: ${err.message}`)
    } finally {
      setActioningId(null)
    }
  }

  const handleRejectPayment = async (id) => {
    const reason = window.prompt('Reason for rejecting receipt screenshot:', 'Screenshot unreadable or invalid.')
    if (reason === null) return
    setActioningId(id)
    try {
      const res = await paymentProofApi.reject(id, reason)
      if (res.success) {
        setProofs((prev) => prev.filter((p) => p._id !== id))
        showFeedback('✅ Payment proof rejected. Worker has been notified.')
      }
    } catch (err) {
      showFeedback(`❌ Failed to reject payment: ${err.message}`)
    } finally {
      setActioningId(null)
    }
  }

  // ── Loading Screen ─────────────────────────────────────────────────────
  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sora">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-gray-400 text-sm">Verifying Admin Access...</div>
        </div>
      </div>
    )
  }

  const isAdmin = user && (user.role === 'admin' || user.email?.includes('admin'))

  // ── Render Admin Login Form if Not Admin ──────────────────────────────
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-white font-sora flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logoWhite} alt="SmAds Admin" className="h-9 w-auto drop-shadow-sm" />
            <span className="font-extrabold text-lg tracking-tight text-white">SmAds</span>
            <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-black uppercase tracking-wider rounded">
              ADMIN PORTAL
            </span>
          </div>
        </header>

        <main className="relative z-10 px-6 py-12 flex-1 flex items-center justify-center">
          <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-500/10">
              <IconShield />
            </div>

            <h1 className="text-2xl font-black text-center text-white mb-2">Admin Control Portal</h1>
            <p className="text-slate-400 text-xs text-center mb-6">
              Sign in with your administrator credentials.
            </p>

            {loginError && (
              <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium">
                {loginError}
              </div>
            )}

            <form onSubmit={handleAdminSignIn} className="space-y-4" autoComplete="off">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Admin Email</label>
                <input
                  type="email"
                  name="admin_email_no_autofill"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Enter admin email"
                  autoComplete="off"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Password</label>
                <input
                  type="password"
                  name="admin_password_no_autofill"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoComplete="new-password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50"
              >
                {loginLoading ? 'Authenticating...' : 'Sign In as Admin'}
              </button>
            </form>
          </div>
        </main>

        <footer className="border-t border-slate-900 py-4 text-center text-slate-500 text-xs">
          SmAds Security Systems • Authorized Admin Terminal
        </footer>
      </div>
    )
  }

  // Filtered Users List
  const filteredUsers = usersList.filter((u) => {
    const matchQuery = (u.fullName || '').toLowerCase().includes(userSearch.toLowerCase()) ||
                       (u.email || '').toLowerCase().includes(userSearch.toLowerCase())
    const matchStatus = userStatusFilter === 'all' || (u.accountStatus || 'active') === userStatusFilter
    const matchCategory = userCategoryFilter === 'all' || u.assignedCategory === userCategoryFilter
    return matchQuery && matchStatus && matchCategory
  })

  // Filtered Tasks List (by category)
  const filteredTasks = tasksList.filter((t) => taskCategoryFilter === 'all' || t.category === taskCategoryFilter)

  // Workers who have taken (or are scheduled for) the Qualification Test —
  // powers the "Pass / Fail" view inside the Test Submission panel.
  const testTakers = usersList.filter((u) => u.testStatus && u.testStatus !== 'not_scheduled')

  // Any worker can be assigned new work (not just ones who already paid) so
  // admin selection is never silently empty. Paid/unpaid is shown as a badge.
  const eligibleWorkers = usersList.filter((u) => (u.role || 'worker') === 'worker')

  // Search-by-name/email results for the "Assign to Worker" sub-tab.
  const testAssignResults = testAssignSearch.trim()
    ? eligibleWorkers.filter((w) => {
        const q = testAssignSearch.toLowerCase()
        return (w.fullName || '').toLowerCase().includes(q) || (w.email || '').toLowerCase().includes(q)
      })
    : []

  // Worker picker search (used inside the multi-select checklist for assigning work)
  const pickerWorkers = eligibleWorkers.filter((w) => {
    const q = workerPickerSearch.toLowerCase()
    return !q || (w.fullName || '').toLowerCase().includes(q) || (w.email || '').toLowerCase().includes(q)
  })

  // Filtered Jobs List (by Job Title, Min Amount, Max Amount / Salary)
  const filteredJobs = jobsList.filter((job) => {
    const matchTitle = !jobTitleFilter || (job.title || '').toLowerCase().includes(jobTitleFilter.toLowerCase())
    const budget = Number(job.budget) || 0
    const matchMin = jobMinAmount === '' || budget >= Number(jobMinAmount)
    const matchMax = jobMaxAmount === '' || budget <= Number(jobMaxAmount)
    return matchTitle && matchMin && matchMax
  })

  // ── Error Banner Component ─────────────────────────────────────────────
  const ErrorBanner = ({ message }) => (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
      <div className="w-10 h-10 rounded-xl bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-2">
        <IconAlert />
      </div>
      <p className="text-red-700 text-xs font-semibold mb-1">Supabase Connection Error</p>
      <p className="text-red-500 text-[11px]">{message}</p>
      <p className="text-red-400 text-[11px] mt-2">Make sure Supabase is configured in <code className="bg-red-100 px-1 rounded">.env</code> and the schema SQL has been run.</p>
    </div>
  )

  // ── Render Full Admin Dashboard ───────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sora relative overflow-x-hidden flex flex-col justify-between">
      <AdminHeader user={user} onSignOut={handleSignOut} />

      {/* Action Feedback Toast */}
      {actionFeedback && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-semibold border border-slate-700 max-w-sm animate-fade-in">
          {actionFeedback}
        </div>
      )}

      {/* Full User Detail Modal — shows every field admin has access to */}
      {detailUser && (
        <div
          className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setDetailUser(null)}
        >
          <div
            className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                {detailUser.avatarUrl ? (
                  <img src={detailUser.avatarUrl} alt={detailUser.fullName} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 font-black flex items-center justify-center">
                    {(detailUser.fullName || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-black text-gray-900 text-sm">{detailUser.fullName}</div>
                  <div className="text-gray-400 text-[11px]">{detailUser.email}</div>
                </div>
              </div>
              <button
                onClick={() => setDetailUser(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <IconX />
              </button>
            </div>

            <div className="p-6 grid grid-cols-2 gap-x-4 gap-y-4 text-xs">
              {[
                ['User ID', detailUser.id],
                ['Role', detailUser.role || 'worker'],
                ['Account Status', detailUser.accountStatus || 'active'],
                ['Registration Fee Paid', detailUser.registrationFeePaid ? 'Yes' : 'No'],
                ['Assigned Category', detailUser.assignedCategory || '—'],
                ['Test Status', detailUser.testStatus || 'not_scheduled'],
                ['Test Score', detailUser.testScore ?? '—'],
                ['Test Available At', detailUser.testAvailableAt ? new Date(detailUser.testAvailableAt).toLocaleString() : '—'],
                ['Rating', detailUser.rating ?? '—'],
                ['Review Count', detailUser.reviewCount ?? 0],
                ['Connections', detailUser.connections ?? 0],
                ['Last Active At', detailUser.lastActiveAt ? new Date(detailUser.lastActiveAt).toLocaleString() : '—'],
                ['Last Work At', detailUser.lastWorkAt ? new Date(detailUser.lastWorkAt).toLocaleString() : '—'],
                ['Account Created', detailUser.createdAt ? new Date(detailUser.createdAt).toLocaleString() : '—'],
                ['Profile Updated', detailUser.updatedAt ? new Date(detailUser.updatedAt).toLocaleString() : '—'],
                ['Expired At', detailUser.expiredAt ? new Date(detailUser.expiredAt).toLocaleString() : '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="text-gray-400 font-semibold uppercase tracking-wider text-[10px] mb-0.5">{label}</div>
                  <div className="text-gray-800 font-bold break-words">{String(value)}</div>
                </div>
              ))}

              <div className="col-span-2">
                <div className="text-gray-400 font-semibold uppercase tracking-wider text-[10px] mb-0.5">Bio</div>
                <div className="text-gray-800 font-medium">{detailUser.bio || '—'}</div>
              </div>

              <div className="col-span-2">
                <div className="text-gray-400 font-semibold uppercase tracking-wider text-[10px] mb-1">Work History</div>
                {Array.isArray(detailUser.workHistory) && detailUser.workHistory.length > 0 ? (
                  <ul className="list-disc list-inside space-y-0.5 text-gray-700">
                    {detailUser.workHistory.map((w, i) => (
                      <li key={i}>{typeof w === 'string' ? w : JSON.stringify(w)}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-400">No work history recorded.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="relative z-10 px-6 lg:px-12 py-8 max-w-6xl mx-auto flex-1 w-full">
        {/* Admin Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full mb-1.5 border border-amber-200">
              <IconShield /> Executive Administration Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Admin Control Center</h1>
            <p className="text-gray-500 text-xs mt-0.5">
              Logged in as <strong className="text-gray-800">{user.email}</strong> • Full Platform Management Authority
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { loadPendingProofs(); loadAllUsers(); loadAllJobs() }}
              className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              🔄 Refresh System Data
            </button>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Registered Users</div>
            <div className="text-2xl font-black text-gray-900 mt-1">{usersList.length}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">From Supabase</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending Payment Receipts</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{proofs.length}</div>
            <div className="text-[11px] text-amber-700 font-medium mt-1">Awaiting Review</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Blocked / Expired Accounts</div>
            <div className="text-2xl font-black text-red-600 mt-1">
              {usersList.filter((u) => u.accountStatus === 'blocked' || u.accountStatus === 'expired').length}
            </div>
            <div className="text-[11px] text-red-500 font-medium mt-1">Managed by Admin</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Job Listings</div>
            <div className="text-2xl font-black text-blue-600 mt-1">{jobsList.length}</div>
            <div className="text-[11px] text-blue-500 font-medium mt-1">Moderation Available</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6 gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-5 py-3 rounded-xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'payments'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <IconClock /> Payment Approvals ({proofs.length})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-5 py-3 rounded-xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <IconUsers /> User Management & Blocking ({usersList.length})
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-5 py-3 rounded-xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'jobs'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <IconBriefcase /> Test Generation & Submission
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-5 py-3 rounded-xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <IconClipboard /> Assign Work & Submissions ({tasksList.length})
          </button>
        </div>

        {/* ── TAB 1: Payment Screenshot Approvals ───────────────────────── */}
        {activeTab === 'payments' && (
          <div>
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 mb-6 leading-relaxed">
              <strong>Admin Payment Approval Flow:</strong> When a worker pays their registration fee via JazzCash and uploads a screenshot, it lands here. Clicking <strong>Approve</strong> marks the payment as PAID in Supabase, activates their account, opens their wallet, and unlocks their 24h qualification test.
            </div>

            {loadingProofs ? (
              <div className="text-gray-400 text-sm py-8 text-center flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                Loading payment proofs from Supabase...
              </div>
            ) : proofsError ? (
              <ErrorBanner message={proofsError} />
            ) : proofs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                  <IconCheck />
                </div>
                <p className="text-gray-600 text-sm font-semibold">No pending payment screenshots.</p>
                <p className="text-gray-400 text-xs mt-1">All payment proofs have been reviewed, or no workers have submitted screenshots yet.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {proofs.map((p) => (
                  <div key={p._id} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col sm:flex-row gap-6 shadow-sm">
                    {p.screenshotData && (
                      <img
                        src={p.screenshotData}
                        alt={`Payment receipt from ${p.worker}`}
                        className="w-full sm:w-48 h-48 object-cover bg-gray-100 rounded-xl border border-gray-200 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">
                        <IconClock /> Pending Review
                      </div>

                      <div className="text-base font-bold text-gray-900">{p.worker}</div>
                      {p.user?.email && <div className="text-xs text-gray-400">{p.user.email}</div>}

                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 mt-3 mb-3 pb-3 border-b border-gray-100">
                        <div><span className="text-gray-400">Role:</span> {p.user?.role || 'worker'}</div>
                        <div><span className="text-gray-400">Account Status:</span> <strong className="text-amber-700">{p.user?.accountStatus || p.user?.account_status || 'pending_payment'}</strong></div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 mb-5">
                        <div><span className="text-gray-400">Method:</span> <strong className="text-gray-900">{p.method}</strong></div>
                        <div><span className="text-gray-400">Amount:</span> <strong className="text-gray-900">{p.amount}</strong></div>
                        <div><span className="text-gray-400">Txn ID:</span> {p.txn_id || p.txnId}</div>
                        <div><span className="text-gray-400">Submitted:</span> {p.date}</div>
                        {p.payment?.account_number && <div><span className="text-gray-400">Account No:</span> {p.payment.account_number}</div>}
                        {p.payment?.invoice_no && <div><span className="text-gray-400">Invoice:</span> {p.payment.invoice_no}</div>}
                      </div>

                      <div className="flex gap-3">
                        <button
                          disabled={actioningId === p._id}
                          onClick={() => handleApprovePayment(p._id)}
                          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                        >
                          <IconCheck /> {actioningId === p._id ? 'Approving...' : 'Approve Payment & Activate Worker'}
                        </button>
                        <button
                          disabled={actioningId === p._id}
                          onClick={() => handleRejectPayment(p._id)}
                          className="py-3 px-5 border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                        >
                          <IconX /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: User Management & Blocking ─────────────────────────── */}
        {activeTab === 'users' && (
          <div>
            <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 text-xs text-blue-900 mb-6 leading-relaxed">
              <strong>Admin User Management Authority:</strong> View all registered platform members from Supabase. As Administrator, you can <strong>Block</strong> malicious or spam accounts, <strong>Reactivate Expired Accounts</strong> (due to 3-day inactivity), or unblock users.
            </div>

            {loadingUsers ? (
              <div className="text-gray-400 text-sm py-8 text-center flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                Loading users from Supabase...
              </div>
            ) : usersError ? (
              <ErrorBanner message={usersError} />
            ) : (
              <>
                {/* Filter & Search Toolbar */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-3 justify-between items-center">
                  <input
                    type="text"
                    placeholder="Search user by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full sm:w-72 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-amber-500"
                  />

                  <div className="flex flex-col sm:flex-row items-center gap-2 text-xs w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-medium">Status:</span>
                      <select
                        value={userStatusFilter}
                        onChange={(e) => setUserStatusFilter(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 font-semibold focus:outline-none focus:border-amber-500"
                      >
                        <option value="all">All Statuses ({usersList.length})</option>
                        <option value="active">Active</option>
                        <option value="pending_payment">Pending Payment</option>
                        <option value="expired">Expired (Inactivity)</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-medium">Category:</span>
                      <select
                        value={userCategoryFilter}
                        onChange={(e) => setUserCategoryFilter(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 font-semibold focus:outline-none focus:border-amber-500"
                      >
                        <option value="all">All Categories</option>
                        {CATEGORY_NAMES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-700">
                      <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
                        <tr>
                          <th className="p-4">User</th>
                          <th className="p-4">Role</th>
                          <th className="p-4">Payment</th>
                          <th className="p-4">Job / Category</th>
                          <th className="p-4">Account Status</th>
                          <th className="p-4">Details</th>
                          <th className="p-4 text-right">Admin Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="p-8 text-center text-gray-400">
                              {usersList.length === 0
                                ? 'No users registered yet. Users will appear here after signing up via Supabase.'
                                : 'No matching users found.'}
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((u) => {
                            const uid = u.id || u._id
                            const status = u.accountStatus || 'active'

                            return (
                              <tr key={uid} className="hover:bg-gray-50/80 transition-colors">
                                <td className="p-4">
                                  <div className="font-bold text-gray-900">{u.fullName || 'User'}</div>
                                  <div className="text-gray-400 text-[11px]">{u.email}</div>
                                </td>

                                <td className="p-4">
                                  <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                                    u.role === 'admin' ? 'bg-amber-100 text-amber-800' :
                                    u.role === 'employer' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {u.role || 'worker'}
                                  </span>
                                </td>

                                <td className="p-4">
                                  <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                                    u.registrationFeePaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {u.registrationFeePaid ? 'Paid' : 'Not Paid'}
                                  </span>
                                </td>

                                <td className="p-4">
                                  <span className="text-gray-600 text-[11px] font-semibold">
                                    {u.assignedCategory || '—'}
                                  </span>
                                </td>

                                <td className="p-4">
                                  <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                                    status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                                    status === 'pending_payment' ? 'bg-amber-100 text-amber-800' :
                                    status === 'expired' ? 'bg-orange-100 text-orange-800' :
                                    status === 'blocked' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {status === 'expired' ? 'Expired (3-Day Inactive)' : status}
                                  </span>
                                </td>

                                <td className="p-4">
                                  <button
                                    onClick={() => setDetailUser(u)}
                                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors"
                                  >
                                    View Full Detail
                                  </button>
                                </td>

                                <td className="p-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {status === 'blocked' ? (
                                      <button
                                        onClick={() => handleUserStatusChange(uid, 'active')}
                                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 transition-colors"
                                      >
                                        Unblock User
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleUserStatusChange(uid, 'blocked')}
                                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition-colors flex items-center gap-1"
                                      >
                                        <IconBan /> Block User
                                      </button>
                                    )}

                                    {status === 'expired' && (
                                      <button
                                        onClick={() => handleUserStatusChange(uid, 'active')}
                                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition-colors"
                                      >
                                        Reactivate
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── TAB 3: Test Generation & Submission ─────────────────────────── */}
        {activeTab === 'jobs' && (
          <div>
            <div className="bg-purple-50/80 border border-purple-200/80 rounded-2xl p-4 text-xs text-purple-900 mb-6 leading-relaxed">
              <strong>Test Generation &amp; Submission:</strong> Review the 100-question qualification test bank, publish or unpublish it sitewide, and verify worker test submissions with pass / fail review below.
            </div>

            {/* ── Test Submission (Qualification Test) Panel ────────────── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setTestPanelOpen((o) => !o)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <IconClipboard />
                  </span>
                  <div className="text-left">
                    <div className="text-sm font-bold text-gray-900">Test Submission</div>
                    <div className="text-gray-400 text-xs">Qualification test question bank &amp; pass / fail review</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                    testPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {testPublished ? 'Published' : 'Unpublished'}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    className={`text-gray-400 transition-transform ${testPanelOpen ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </button>

              {testPanelOpen && (
                <div className="border-t border-gray-100 p-5">
                  <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-2xl p-4 text-xs text-indigo-900 mb-5 leading-relaxed">
                    <strong>Test Submission:</strong> Review the 100-question MCQ Question Bank, use <strong>Assign to
                    Worker</strong> to search a worker by name/email and send them the test directly (unlocks it on
                    their profile immediately), and check <strong>Pass / Fail</strong> results here. Click <strong>Publish
                    Test Submission</strong> once to turn the feature on sitewide — after that, each &ldquo;Attempt
                    Test&rdquo; draws 10 random questions from this bank.
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-5">
                    <button
                      type="button"
                      onClick={() => setTestSubTab('bank')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                        testSubTab === 'bank' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Question Bank ({qualificationQuestions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTestSubTab('assign')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                        testSubTab === 'assign' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Assign to Worker
                    </button>
                    <button
                      type="button"
                      onClick={() => setTestSubTab('results')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                        testSubTab === 'results' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Pass / Fail ({testTakers.length})
                    </button>
                    <button
                      type="button"
                      onClick={handleTogglePublishTest}
                      className={`ml-auto px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                        testPublished
                          ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                          : 'bg-emerald-500 text-white hover:bg-emerald-600'
                      }`}
                    >
                      {testPublished ? 'Unpublish' : 'Publish Test Submission'}
                    </button>
                  </div>

                  {testSubTab === 'bank' ? (
                    <div className="max-h-[440px] overflow-y-auto pr-1 space-y-2.5">
                      {qualificationQuestions.map((q, idx) => (
                        <div key={q.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3.5">
                          <div className="text-xs font-bold text-gray-800 mb-2">{idx + 1}. {q.question}</div>
                          <div className="grid sm:grid-cols-2 gap-1.5">
                            {q.options.map((opt, i) => (
                              <div
                                key={i}
                                className={`text-[11px] px-2.5 py-1.5 rounded-lg ${
                                  i === q.correctIndex
                                    ? 'bg-emerald-100 text-emerald-800 font-bold'
                                    : 'bg-white text-gray-500 border border-gray-100'
                                }`}
                              >
                                {String.fromCharCode(65 + i)}. {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : testSubTab === 'assign' ? (
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">
                        Search Worker by Name or Email
                      </label>
                      <input
                        type="text"
                        placeholder="Search by email or name..."
                        value={testAssignSearch}
                        onChange={(e) => setTestAssignSearch(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 mb-4 focus:outline-none focus:border-amber-500"
                      />

                      {!testAssignSearch.trim() ? (
                        <p className="text-gray-400 text-xs py-6 text-center">
                          Start typing a worker's email or name to find them and send the qualification test directly.
                        </p>
                      ) : testAssignResults.length === 0 ? (
                        <p className="text-gray-400 text-xs py-6 text-center">No workers match "{testAssignSearch}".</p>
                      ) : (
                        <div className="space-y-2">
                          {testAssignResults.map((w) => {
                            const wid = w.id || w._id
                            return (
                              <div
                                key={wid}
                                className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3.5"
                              >
                                <div className="min-w-0">
                                  <div className="font-bold text-gray-900 text-xs truncate">{w.fullName}</div>
                                  <div className="text-gray-400 text-[11px] truncate">{w.email}</div>
                                  <div className="text-[10px] mt-1 font-bold uppercase tracking-wider text-gray-400">
                                    Status: {w.testStatus === 'not_scheduled' ? 'no test yet' : w.testStatus?.replace('_', ' ')}
                                    {w.testScore != null && ` · ${w.testScore}/10`}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleAssignTestToWorker(wid)}
                                  disabled={assigningTestId === wid}
                                  className="flex-shrink-0 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-xl disabled:opacity-60"
                                >
                                  {assigningTestId === wid
                                    ? 'Sending...'
                                    : w.testStatus === 'scheduled' || w.testStatus === 'passed' || w.testStatus === 'pending_verification'
                                    ? 'Resend Test'
                                    : 'Send Test'}
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ) : testTakers.length === 0 ? (
                    <div className="bg-gray-50 rounded-2xl border border-gray-200 p-10 text-center">
                      <p className="text-gray-600 text-sm font-semibold">No test attempts yet.</p>
                      <p className="text-gray-400 text-xs mt-1">Results appear here once workers attempt the qualification test.</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-gray-700">
                          <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
                            <tr>
                              <th className="p-3.5">Worker</th>
                              <th className="p-3.5">Score</th>
                              <th className="p-3.5">Status</th>
                              <th className="p-3.5 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {testTakers.map((u) => {
                              const uid = u.id || u._id
                              const pass = (u.testScore ?? 0) >= 6
                              return (
                                <tr key={uid} className="align-top">
                                  <td className="p-3.5">
                                    <div className="font-bold text-gray-900">{u.fullName}</div>
                                    <div className="text-gray-400 text-[11px]">{u.email}</div>
                                  </td>
                                  <td className="p-3.5 font-bold">{u.testScore ?? '—'}/10</td>
                                  <td className="p-3.5">
                                    <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                                      u.testStatus === 'passed' ? 'bg-emerald-100 text-emerald-800' :
                                      u.testStatus === 'pending_verification' ? 'bg-amber-100 text-amber-800' :
                                      u.testStatus === 'failed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      {u.testStatus === 'pending_verification' ? 'Pending Verification' : pass ? 'Pass' : u.testStatus}
                                    </span>
                                  </td>
                                  <td className="p-3.5 text-right">
                                    {u.testStatus === 'pending_verification' && (
                                      verifyingUserId === uid ? (
                                        <div className="flex items-center justify-end gap-1.5">
                                          <input
                                            type="text"
                                            placeholder="Code"
                                            value={verifyCode}
                                            onChange={(e) => setVerifyCode(e.target.value)}
                                            className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[11px] focus:outline-none focus:border-amber-500"
                                          />
                                          <button
                                            onClick={() => handleVerifyTest(uid)}
                                            disabled={verifyBusy}
                                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] rounded-lg border border-emerald-200 disabled:opacity-60"
                                          >
                                            Confirm
                                          </button>
                                          <button
                                            onClick={() => { setVerifyingUserId(null); setVerifyCode('') }}
                                            className="px-2 py-1.5 text-gray-400 hover:text-gray-600 text-[11px] font-bold"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => setVerifyingUserId(uid)}
                                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl border border-amber-200"
                                        >
                                          Verify
                                        </button>
                                      )
                                    )}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 4: Assign Work (Zip Upload) & Review Submissions ────────── */}
        {activeTab === 'tasks' && (
          <div>
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 mb-6 leading-relaxed">
              <strong>Assign Work to Workers:</strong> Select one or more paid, active workers (any number — one, a few, or all of them), choose one of the 6 job categories, give the task a title, and optionally attach a ZIP file with the work brief. Every selected worker will see it on their Dashboard and can submit typed text and/or a file (zip, Excel, doc) back to you for review.
            </div>

            {/* Assign Task Form */}
            <form onSubmit={handleAssignTask} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-8 grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase">
                    Workers ({assignWorkerIds.length} selected of {eligibleWorkers.length})
                  </label>
                  <div className="flex items-center gap-3 text-[11px] font-bold">
                    <button type="button" onClick={() => selectAllEligibleWorkers(pickerWorkers)} className="text-amber-600 hover:text-amber-700">
                      Select All
                    </button>
                    <button type="button" onClick={clearAssignWorkers} className="text-gray-400 hover:text-gray-600">
                      Clear
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Search workers by name or email..."
                  value={workerPickerSearch}
                  onChange={(e) => setWorkerPickerSearch(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 mb-2 focus:outline-none focus:border-amber-500"
                />

                <div className="w-full bg-gray-50 border border-gray-200 rounded-xl max-h-48 overflow-y-auto divide-y divide-gray-100">
                  {pickerWorkers.length === 0 ? (
                    <div className="p-3 text-xs text-gray-400 text-center">
                      {usersList.length === 0 ? 'No users loaded yet.' : 'No workers match your search.'}
                    </div>
                  ) : (
                    pickerWorkers.map((w, idx) => {
                      const wid = w.id || w._id || `worker-${idx}`
                      const checked = assignWorkerIds.includes(wid)
                      return (
                        <label
                          key={wid}
                          htmlFor={`worker-check-${wid}`}
                          className={`flex items-center gap-2.5 px-3 py-2 text-xs cursor-pointer hover:bg-white transition-colors select-none ${checked ? 'bg-amber-50' : ''}`}
                        >
                          <input
                            id={`worker-check-${wid}`}
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleAssignWorker(wid)}
                            className="w-3.5 h-3.5 accent-amber-500 pointer-events-none"
                          />
                          <span className="font-bold text-gray-800">{w.fullName}</span>
                          <span className="text-gray-400">({w.email})</span>
                          <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border ${w.registrationFeePaid ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                            {w.registrationFeePaid ? 'Paid' : 'Not Paid'}
                          </span>
                        </label>
                      )
                    })
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Category</label>
                <select
                  value={assignCategory}
                  onChange={(e) => setAssignCategory(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 font-semibold focus:outline-none focus:border-amber-500"
                >
                  {CATEGORY_NAMES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Task Title</label>
                <input
                  type="text"
                  value={assignTitle}
                  onChange={(e) => setAssignTitle(e.target.value)}
                  placeholder="e.g. Write a 1,000-word assignment on..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Description / Instructions</label>
                <textarea
                  value={assignDescription}
                  onChange={(e) => setAssignDescription(e.target.value)}
                  rows={3}
                  placeholder="Task details / instructions for the worker..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                <input
                  id="admin-task-file"
                  type="file"
                  onChange={handleAssignFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="admin-task-file"
                  className="cursor-pointer text-xs font-bold px-3 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:border-amber-300"
                >
                  {assignFile ? `📎 ${assignFile.name}` : 'Attach ZIP file with the work'}
                </label>
                <button
                  type="submit"
                  disabled={assigning}
                  className="btn-primary text-xs font-bold px-5 py-2.5 disabled:opacity-60"
                >
                  {assigning
                    ? 'Assigning...'
                    : `Assign Task to ${assignWorkerIds.length || 0} Worker${assignWorkerIds.length === 1 ? '' : 's'}`}
                </button>
                {assignError && <p className="text-red-500 text-[11px] font-semibold w-full">{assignError}</p>}
              </div>
            </form>

            {/* Category filter for task list */}
            <div className="flex items-center gap-2 text-xs mb-4">
              <span className="text-gray-400 font-medium">Filter by Category:</span>
              <select
                value={taskCategoryFilter}
                onChange={(e) => setTaskCategoryFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 font-semibold focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Categories ({tasksList.length})</option>
                {CATEGORY_NAMES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {loadingTasks ? (
              <div className="text-gray-400 text-sm py-8 text-center flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                Loading tasks from Supabase...
              </div>
            ) : tasksError ? (
              <ErrorBanner message={tasksError} />
            ) : filteredTasks.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                <p className="text-gray-600 text-sm font-semibold">No tasks assigned yet in this category.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-700">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
                      <tr>
                        <th className="p-4">Worker</th>
                        <th className="p-4">Category / Task</th>
                        <th className="p-4">Submission</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Review</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredTasks.map((t) => (
                        <tr key={t.id} className="hover:bg-gray-50/80 transition-colors align-top">
                          <td className="p-4">
                            <div className="font-bold text-gray-900">{t.worker?.full_name || 'Worker'}</div>
                            <div className="text-gray-400 text-[11px]">{t.worker?.email}</div>
                            <div className="text-[10px] mt-1 font-bold">
                              {t.worker?.registration_fee_paid ? (
                                <span className="text-emerald-600">Paid</span>
                              ) : (
                                <span className="text-amber-600">Not Paid</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-[10px] font-bold text-blue-600 uppercase">{t.category}</div>
                            <div className="font-semibold text-gray-800">{t.title}</div>
                            {t.admin_file_url && (
                              <a href={t.admin_file_url} target="_blank" rel="noreferrer" className="text-amber-600 text-[11px] font-bold">
                                View assignment file
                              </a>
                            )}
                          </td>
                          <td className="p-4 max-w-xs">
                            {t.user_text_submission && (
                              <p className="text-gray-600 text-[11px] mb-1 line-clamp-3">{t.user_text_submission}</p>
                            )}
                            {t.user_file_url ? (
                              <a href={t.user_file_url} target="_blank" rel="noreferrer" className="text-amber-600 text-[11px] font-bold">
                                Download submitted file
                              </a>
                            ) : !t.user_text_submission ? (
                              <span className="text-gray-300 text-[11px]">Not submitted yet</span>
                            ) : null}
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                              t.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                              t.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                              t.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {t.status === 'submitted' && (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleReviewTask(t.id, 'completed', t.worker_id)}
                                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReviewTask(t.id, 'rejected', t.worker_id)}
                                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-4 text-center text-gray-400 text-xs font-sora">
        SmAds Administration System • All data fetched from Supabase
      </footer>
    </div>
  )
}

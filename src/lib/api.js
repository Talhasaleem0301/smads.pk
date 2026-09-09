// Production-ready API client for i-Lab Solutions powered by Supabase.
// Integrates Supabase Auth, PostgreSQL tables, Storage Buckets, and Realtime.

import { supabase } from './supabaseClient.js'

const TOKEN_KEY = 'ilab_token'
const USER_KEY = 'ilab_user'

// Small helper: run a Supabase POSTGREST query builder (from/select/insert/
// update/upsert/rpc) but swallow errors. The Postgrest query builder is
// "thenable" (works with await) but does NOT implement a real .catch()
// method like a native Promise does — calling .catch() directly on it
// throws "X.catch is not a function". NOTE: supabase.auth.* methods DO
// return real Promises, so those don't need this wrapper.
async function safeRun(queryBuilder) {
  try {
    return await queryBuilder
  } catch (err) {
    return { data: null, error: err }
  }
}

// ── Token / Session Helpers ──────────────────────────────────────────────
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setSession(token, user) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  supabase.auth.signOut().catch(() => {})
}

export function isAuthenticated() {
  return Boolean(getToken())
}

// Format DB profile object to match expected UI profile keys
function formatProfile(profile) {
  if (!profile) return null
  return {
    id: profile.id,
    _id: profile.id,
    fullName: profile.full_name || 'User',
    email: profile.email || '',
    role: profile.role || 'worker',
    registrationFeePaid: Boolean(profile.registration_fee_paid),
    accountStatus: profile.account_status || 'active',
    lastActiveAt: profile.last_active_at,
    bio: profile.bio || '',
    connections: profile.connections || 0,
    rating: profile.rating,
    reviewCount: profile.review_count || 0,
    workHistory: profile.work_history || [],
    testStatus: profile.test_status || 'not_scheduled',
    testAvailableAt: profile.test_available_at,
    testScore: profile.test_score,
    createdAt: profile.created_at,
    assignedCategory: profile.assigned_category || null,
    lastWorkAt: profile.last_work_at,
    avatarUrl: profile.avatar_url || '',
    expiredAt: profile.expired_at || null,
    updatedAt: profile.updated_at || null,
  }
}

// Helper: Convert base64 data URL to Blob for Supabase Storage uploads
function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

// ── Auth Endpoints ──────────────────────────────────────────────────────
export const authApi = {
  async signup({ fullName, email, password, role }) {
    const userRole = (role === 'employer' || email.toLowerCase().includes('admin'))
      ? (email.toLowerCase().includes('admin') ? 'admin' : 'employer')
      : 'worker'

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName,
          role: userRole,
        },
      },
    })
    if (authError) throw new Error(authError.message)

    const userObj = authData.user
    if (!userObj) throw new Error('Signup failed. Please try again.')

    // Direct profile & wallet creation in client
    await safeRun(
      supabase.from('profiles').upsert({
        id: userObj.id,
        full_name: fullName,
        email: email.toLowerCase(),
        role: userRole,
        account_status: userRole === 'admin' ? 'active' : 'pending_payment',
        registration_fee_paid: userRole === 'admin',
      })
    )

    await safeRun(
      supabase.from('wallets').upsert({
        user_id: userObj.id,
        balance: 0,
        total_earned: 0,
        total_withdrawn: 0,
      })
    )

    const formatted = {
      id: userObj.id,
      _id: userObj.id,
      fullName,
      email: email.toLowerCase(),
      role: userRole,
      accountStatus: userRole === 'admin' ? 'active' : 'pending_payment',
      registrationFeePaid: userRole === 'admin',
    }

    const token = authData.session?.access_token || 'supabase_token'
    setSession(token, formatted)

    return {
      success: true,
      message: 'Account created successfully.',
      token,
      user: formatted,
    }
  },

  async login({ email, password }) {
    const cleanEmail = email.toLowerCase().trim()

    // ── Real Supabase Auth Login (Admin & Normal Users) ────────────────────
    // NOTE: There used to be a "hardcoded admin fast-path" here that created a
    // fake local-only session whenever the real Supabase sign-in failed. That
    // fake session was never registered with the Supabase client, so
    // auth.uid() was NULL for every subsequent request — meaning every admin
    // database write (approving proofs, updating users, deleting jobs,
    // assigning tasks) was silently rejected by Row Level Security. Every
    // login now goes through real Supabase Auth so auth.uid() is always
    // populated correctly, for both admin and regular users.
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })
    if (authError) throw new Error(authError.message)

    const userObj = authData.user
    if (!userObj) throw new Error('Login failed. Please check your credentials.')

    const userId = userObj.id

    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    // Safety net: if the profiles row wasn't created by the on_auth_user_created
    // trigger for some reason, create it now so the rest of the app doesn't break.
    if (!profile) {
      const inferredRole = cleanEmail.includes('admin') ? 'admin' : (userObj.user_metadata?.role || 'worker')
      await safeRun(
        supabase.from('profiles').upsert({
          id: userId,
          full_name: userObj.user_metadata?.full_name || 'User',
          email: cleanEmail,
          role: inferredRole,
          account_status: inferredRole === 'admin' ? 'active' : 'pending_payment',
          registration_fee_paid: inferredRole === 'admin',
        })
      )
      const refetched = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
      profile = refetched.data
    }

    if (profile && (profile.account_status === 'blocked' || profile.account_status === 'inactive')) {
      throw new Error('Your account has been blocked or deactivated by an administrator.')
    }

    await safeRun(
      supabase.from('profiles').update({ last_active_at: new Date().toISOString() }).eq('id', userId)
    )

    const formatted = formatProfile(profile) || {
      id: userId,
      _id: userId,
      fullName: userObj.user_metadata?.full_name || 'User',
      email: userObj.email,
      role: userObj.user_metadata?.role || 'worker',
      accountStatus: profile?.account_status || 'active',
      registrationFeePaid: Boolean(profile?.registration_fee_paid),
    }

    const token = authData.session?.access_token || 'supabase_user_token'
    setSession(token, formatted)

    return {
      success: true,
      token,
      user: formatted,
    }
  },

  async me() {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) throw new Error('Not authenticated')

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .maybeSingle()

    const formatted = formatProfile(profile) || {
      id: currentUser.id,
      _id: currentUser.id,
      fullName: currentUser.user_metadata?.full_name || 'User',
      email: currentUser.email,
      role: currentUser.user_metadata?.role || 'worker',
      accountStatus: 'active',
    }

    setSession(getToken(), formatted)
    return { success: true, user: formatted }
  },

  async updateMe(updates) {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) throw new Error('Not authenticated')

    const dbUpdates = {}
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio

    const { data: updated, error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', currentUser.id)
      .select()
      .maybeSingle()

    if (error) throw new Error(error.message)
    const formatted = formatProfile(updated) || { id: currentUser.id, fullName: updates.fullName }
    setSession(getToken(), formatted)

    return { success: true, user: formatted }
  },

  async submitTestScore(score) {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) throw new Error('Not authenticated')

    const numericScore = Number(score)
    const passed = numericScore >= 6

    let dbUpdates = { test_score: numericScore }
    if (passed) {
      const code = String(Math.floor(100000 + Math.random() * 900000))
      const expires = new Date(Date.now() + 30 * 60 * 1000).toISOString()
      dbUpdates = {
        ...dbUpdates,
        test_status: 'pending_verification',
        test_verification_code: code,
        test_verification_expires: expires,
      }
    } else {
      dbUpdates = { ...dbUpdates, test_status: 'failed' }
    }

    const { data: updated, error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', currentUser.id)
      .select()
      .maybeSingle()

    if (error) throw new Error(error.message)
    const formatted = formatProfile(updated)
    setSession(getToken(), formatted)

    return {
      success: true,
      message: passed
        ? "You passed! Your result is pending a final admin verification — you'll be notified once it's confirmed."
        : 'You scored below the passing mark (6/10). Contact support to discuss next steps.',
      user: formatted,
    }
  },

  async pendingTestVerifications() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, test_score, test_verification_expires, created_at')
      .eq('test_status', 'pending_verification')

    if (error) throw new Error(error.message)
    const users = (data || []).map((u) => ({
      _id: u.id,
      fullName: u.full_name,
      email: u.email,
      testScore: u.test_score,
      testVerificationExpires: u.test_verification_expires,
      createdAt: u.created_at,
    }))

    return { success: true, count: users.length, users }
  },

  async verifyTest(userId, code) {
    const { data: profile, error: fetchErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (fetchErr || !profile) throw new Error('Worker profile not found.')
    if (profile.test_verification_code !== String(code).trim()) {
      throw new Error('Incorrect verification code.')
    }

    const { data: updated, error: updateErr } = await supabase
      .from('profiles')
      .update({
        test_status: 'passed',
        test_verification_code: null,
        test_verification_expires: null,
      })
      .eq('id', userId)
      .select()
      .maybeSingle()

    if (updateErr) throw new Error(updateErr.message)

    return {
      success: true,
      message: `${profile.full_name}'s test result is confirmed.`,
      user: formatProfile(updated),
    }
  },

  async changePassword(currentPassword, newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw new Error(error.message)
    return { success: true, message: 'Password updated successfully.' }
  },

  async signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
    if (error) throw new Error(error.message)
  },
}

// ── Admin Management Endpoints (Proposal Specifics) ──────────────────────
export const adminApi = {
  async listUsers() {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return {
      success: true,
      users: (profiles || []).map((p) => formatProfile(p)),
    }
  },

  async updateUserStatus(userId, accountStatus, role) {
    const updates = {}
    if (accountStatus) updates.account_status = accountStatus
    if (role) updates.role = role

    const { data: updated, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .maybeSingle()

    if (error) throw new Error(error.message)
    return { success: true, user: formatProfile(updated) }
  },

  async listJobs() {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*, employer:employer_id(full_name, email)')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return { success: true, jobs: jobs || [] }
  },

  async deleteJob(jobId) {
    const { error } = await supabase.from('jobs').delete().eq('id', jobId)
    if (error) throw new Error(error.message)
    return { success: true, message: 'Job posting deleted by admin.' }
  },

  // Manually send/enable the Qualification Test for one specific worker,
  // used by the Admin > Job Listing Moderation > Test Submission > Assign
  // to Worker search flow. Unlocks it immediately (bypasses the 24h wait)
  // and resets any previous score/verification so they get a clean attempt.
  async assignQualificationTest(userId) {
    const { data: updated, error } = await supabase
      .from('profiles')
      .update({
        test_status: 'scheduled',
        test_available_at: new Date().toISOString(),
        test_score: null,
        test_verification_code: null,
        test_verification_expires: null,
      })
      .eq('id', userId)
      .select()
      .maybeSingle()

    if (error) throw new Error(error.message)
    return { success: true, user: formatProfile(updated) }
  },

  async listTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, worker:worker_id(full_name, email, registration_fee_paid, account_status)')
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return { success: true, tasks: data || [] }
  },

  async assignTask({ workerId, category, title, description, adminFileUrl }) {
    // 1. Create the task record
    const { data: task, error: taskErr } = await supabase
      .from('tasks')
      .insert({
        worker_id: workerId,
        category,
        title,
        description: description || '',
        admin_file_url: adminFileUrl || '',
        status: 'pending'
      })
      .select()
      .single()

    if (taskErr) throw new Error(taskErr.message)

    // 2. Also ensure worker's profile category is updated
    await safeRun(
      supabase
        .from('profiles')
        .update({ assigned_category: category })
        .eq('id', workerId)
    )

    return { success: true, task }
  },

  async reviewTask(taskId, status, workerId) {
    const { data: task, error: taskErr } = await supabase
      .from('tasks')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .maybeSingle()

    if (taskErr) throw new Error(taskErr.message)

    // If completed, update worker's last_work_at date
    if (status === 'completed' && workerId) {
      await safeRun(
        supabase
          .from('profiles')
          .update({ last_work_at: new Date().toISOString() })
          .eq('id', workerId)
      )
    }

    return { success: true, task }
  },

  async uploadAdminTaskFile(file) {
    const fileName = `admin_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]+/g, '_')}`
    const { data, error } = await supabase.storage
      .from('admin-tasks')
      .upload(fileName, file, { cacheControl: '3600', upsert: true })

    if (error) throw new Error(error.message)

    const { data: urlData } = supabase.storage
      .from('admin-tasks')
      .getPublicUrl(fileName)

    return { success: true, fileUrl: urlData.publicUrl }
  },

  async checkInactivity() {
    const { error } = await supabase.rpc('check_and_block_inactive_workers')
    if (error) throw new Error(error.message)
    return { success: true }
  },
}

// ── Payment Endpoints ────────────────────────────────────────────────────
export const paymentApi = {
  async payRegistrationFee({ gateway, accountNumber = '', transactionRef, amount = 500, packageName = '' }) {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) throw new Error('Not authenticated')

    // Defensive: make sure a profiles row exists for this user before we try
    // to insert a payment that has a foreign key to profiles.id.
    const { error: ensureProfileError } = await supabase.from('profiles').upsert({
      id: currentUser.id,
      email: currentUser.email,
      full_name: currentUser.user_metadata?.full_name || currentUser.email,
      role: currentUser.user_metadata?.role || 'worker',
    }, { onConflict: 'id', ignoreDuplicates: false })
    if (ensureProfileError) {
      throw new Error(`Could not verify your profile before payment: ${ensureProfileError.message}. Check your Supabase 'profiles' table RLS policies allow authenticated users to upsert their own row.`)
    }

    const invoiceNo = `INV-${Math.floor(100000 + Math.random() * 900000)}`
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        user_id: currentUser.id,
        invoice_no: invoiceNo,
        amount,
        currency: 'PKR',
        gateway: gateway.toUpperCase(),
        account_number: accountNumber,
        transaction_ref: transactionRef || packageName || '',
        status: 'PENDING',
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    return {
      success: true,
      message: 'Payment recorded. Please upload a screenshot of your payment for admin verification.',
      receipt: {
        paymentId: payment.id,
        invoiceNo: payment.invoice_no,
        amount: `PKR ${payment.amount}`,
        gateway: payment.gateway,
        accountNumber: payment.account_number,
        status: payment.status,
        date: payment.created_at,
      },
    }
  },

  async myPayments() {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return { success: true, count: (data || []).length, payments: data || [] }
  },
}

// ── Payment Proof Endpoints ──────────────────────────────────────────────
export const paymentProofApi = {
  async list(page = 1, limit = 20) {
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: proofs, count, error } = await supabase
      .from('payment_proofs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw new Error(error.message)
    return {
      success: true,
      proofs: proofs || [],
      total: count || 0,
      page,
      pages: Math.ceil((count || 0) / limit),
    }
  },

  async submit({ paymentId, screenshotData }) {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) throw new Error('Not authenticated')

    let screenshotUrl = screenshotData
    if (screenshotData.startsWith('data:image')) {
      const blob = dataURLtoBlob(screenshotData)
      const fileName = `${currentUser.id}_${Date.now()}.png`
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, blob, { contentType: 'image/png', upsert: true })

      if (!uploadErr && uploadData) {
        const { data: publicUrlObj } = supabase.storage
          .from('payment-proofs')
          .getPublicUrl(fileName)
        screenshotUrl = publicUrlObj.publicUrl
      }
    }

    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', currentUser.id).maybeSingle()
    const { data: payment } = await supabase.from('payments').select('gateway, amount').eq('id', paymentId).maybeSingle()

    const txnId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`
    const { data: proof, error } = await supabase
      .from('payment_proofs')
      .insert({
        txn_id: txnId,
        worker: profile?.full_name || 'Worker',
        category: 'Registration Fee',
        method: payment?.gateway || 'JAZZCASH',
        amount: `PKR ${payment?.amount || 500}`,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        status: 'Pending Review',
        user_id: currentUser.id,
        payment_id: paymentId,
        screenshot_url: screenshotUrl,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return { success: true, message: 'Screenshot submitted for review.', proof }
  },

  async pending() {
    const { data: proofs, error } = await supabase
      .from('payment_proofs')
      .select('*, user:user_id(id, full_name, email, role, account_status), payment:payment_id(id, invoice_no, amount, gateway, status)')
      .eq('status', 'Pending Review')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    const formatted = (proofs || []).map((p) => ({
      ...p,
      _id: p.id,
      user: p.user ? { ...p.user, _id: p.user.id, fullName: p.user.full_name } : null,
      payment: p.payment ? { ...p.payment, _id: p.payment.id } : null,
      screenshotData: p.screenshot_url,
    }))

    return { success: true, count: formatted.length, proofs: formatted }
  },

  async approve(id) {
    const storedUser = getStoredUser()
    const testAvailableAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const { data: proof, error: proofErr } = await supabase
      .from('payment_proofs')
      .update({
        status: 'Approved',
        reviewed_by: storedUser?.id || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle()

    if (proofErr) throw new Error(proofErr.message)

    if (proof?.payment_id) {
      await safeRun(
        supabase.from('payments').update({ status: 'PAID' }).eq('id', proof.payment_id)
      )
    }

    if (proof?.user_id) {
      await safeRun(
        supabase
          .from('profiles')
          .update({
            registration_fee_paid: true,
            account_status: 'active',
            test_status: 'scheduled',
            test_available_at: testAvailableAt,
          })
          .eq('id', proof.user_id)
      )
    }

    return { success: true, message: 'Payment approved. Account activated.', proof }
  },

  async reject(id, reason) {
    const storedUser = getStoredUser()
    const { data: proof, error } = await supabase
      .from('payment_proofs')
      .update({
        status: 'Rejected',
        reviewed_by: storedUser?.id || null,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason || '',
      })
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) throw new Error(error.message)
    return { success: true, message: 'Payment proof rejected.', proof }
  },
}

// ── Job Postings Endpoints ───────────────────────────────────────────────
export const jobPostApi = {
  async listOpen() {
    const { data, error } = await supabase.from('jobs').select('*').eq('status', 'open').order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return { success: true, jobs: data || [] }
  },

  async myJobs() {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) throw new Error('Not authenticated')

    const { data, error } = await supabase.from('jobs').select('*').eq('employer_id', currentUser.id).order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return { success: true, jobs: data || [] }
  },

  async create(job) {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) throw new Error('Not authenticated')

    const slug = (job.title || 'job').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        slug,
        title: job.title,
        category: job.category,
        description: job.description || '',
        budget: Number(job.budget) || 0,
        duration: job.duration || '',
        employer_id: currentUser.id,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return { success: true, job: data }
  },
}

// ── Job Application Endpoints ────────────────────────────────────────────
export const jobApi = {
  async apply(slug, categoryName) {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) throw new Error('Not authenticated')

    const { data: job } = await supabase.from('jobs').select('id').eq('slug', slug).maybeSingle()
    const { data, error } = await supabase
      .from('job_applications')
      .insert({
        job_id: job?.id || null,
        job_slug: slug,
        applicant_id: currentUser.id,
        category_name: categoryName,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return { success: true, message: 'Application submitted successfully.', application: data }
  },

  async myApplications() {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('applicant_id', currentUser.id)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return { success: true, applications: data || [] }
  },
}

// ── Feed / Posts Endpoints ───────────────────────────────────────────────
export const postApi = {
  async feed(page = 1, limit = 20) {
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: posts, count, error } = await supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw new Error(error.message)
    const formatted = (posts || []).map((p) => ({ ...p, _id: p.id, likes: p.likes_count || 0 }))
    return { success: true, posts: formatted, total: count || 0 }
  },

  async myPosts() {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) throw new Error('Not authenticated')

    const { data: posts, error } = await supabase.from('posts').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return { success: true, posts: posts || [] }
  },

  async create(content) {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) throw new Error('Not authenticated')

    const { data: profile } = await supabase.from('profiles').select('full_name, role').eq('id', currentUser.id).maybeSingle()

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id: currentUser.id,
        author_name: profile?.full_name || 'User',
        author_role: profile?.role || 'worker',
        content,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return { success: true, post: { ...post, _id: post.id } }
  },

  async toggleLike(id) {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) throw new Error('Not authenticated')

    const { data: existing } = await supabase.from('post_likes').select('id').eq('post_id', id).eq('user_id', currentUser.id).maybeSingle()

    if (existing) {
      await safeRun(supabase.from('post_likes').delete().eq('id', existing.id))
      await safeRun(supabase.rpc('decrement_likes', { post_id_input: id }))
    } else {
      await safeRun(supabase.from('post_likes').insert({ post_id: id, user_id: currentUser.id }))
      await safeRun(supabase.rpc('increment_likes', { post_id_input: id }))
    }

    return { success: true }
  },
}

// ── Notifications Endpoints ──────────────────────────────────────────────
export const notificationApi = {
  async list() {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) throw new Error('Not authenticated')

    const { data, error } = await supabase.from('notifications').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return { success: true, notifications: data || [] }
  },

  async markRead(id) {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    if (error) throw new Error(error.message)
    return { success: true }
  },

  async markAllRead() {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) throw new Error('Not authenticated')

    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', currentUser.id)
    if (error) throw new Error(error.message)
    return { success: true }
  },
}

// ── Reviews Endpoints ────────────────────────────────────────────────────
export const reviewApi = {
  async myReviews() {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) throw new Error('Not authenticated')

    const { data, error } = await supabase.from('reviews').select('*').eq('to_user_id', currentUser.id).order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return { success: true, reviews: data || [] }
  },

  async create(toUserId, rating, comment) {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        from_user_id: currentUser.id,
        to_user_id: toUserId,
        rating: Number(rating),
        comment,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return { success: true, review: data }
  },
}

// ── Messages / Chat Endpoints ────────────────────────────────────────────
export const messageApi = {
  async conversations() {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('conversations')
      .select('*, p1:participant_1(id, full_name, role), p2:participant_2(id, full_name, role)')
      .or(`participant_1.eq.${currentUser.id},participant_2.eq.${currentUser.id}`)
      .order('last_message_at', { ascending: false })

    if (error) throw new Error(error.message)
    const formatted = (data || []).map((c) => ({
      ...c,
      _id: c.id,
      participants: [
        c.p1 ? { _id: c.p1.id, fullName: c.p1.full_name, role: c.p1.role } : null,
        c.p2 ? { _id: c.p2.id, fullName: c.p2.full_name, role: c.p2.role } : null,
      ].filter(Boolean),
    }))

    return { success: true, conversations: formatted }
  },

  async startConversation(email) {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) throw new Error('Not authenticated')

    const { data: other, error: findErr } = await supabase.from('profiles').select('id, full_name, role').eq('email', email.toLowerCase()).maybeSingle()
    if (findErr || !other) throw new Error('No user found with that email.')

    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(participant_1.eq.${currentUser.id},participant_2.eq.${other.id}),and(participant_1.eq.${other.id},participant_2.eq.${currentUser.id})`)
      .maybeSingle()

    if (existing) {
      return { success: true, conversation: { ...existing, _id: existing.id } }
    }

    const { data: created, error: createErr } = await supabase
      .from('conversations')
      .insert({ participant_1: currentUser.id, participant_2: other.id })
      .select()
      .single()

    if (createErr) throw new Error(createErr.message)
    return { success: true, conversation: { ...created, _id: created.id } }
  },

  async getMessages(conversationId) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)
    const formatted = (data || []).map((m) => ({ ...m, _id: m.id, sender: m.sender_id }))
    return { success: true, messages: formatted }
  },

  async send(conversationId, text) {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) throw new Error('Not authenticated')

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: currentUser.id,
        text,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    await safeRun(
      supabase
        .from('conversations')
        .update({ last_message: text, last_message_at: new Date().toISOString() })
        .eq('id', conversationId)
    )

    return { success: true, message: { ...message, _id: message.id, sender: message.sender_id } }
  },
}

// ── Worker Tasks Endpoints ───────────────────────────────────────────────
export const taskApi = {
  async getMyTasks() {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('worker_id', currentUser.id)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return { success: true, tasks: data || [] }
  },

  async submitTask(taskId, { text, fileUrl, googleSheetUrl }) {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        status: 'submitted',
        user_text_submission: text || '',
        user_file_url: fileUrl || '',
        google_sheet_url: googleSheetUrl || '',
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .maybeSingle()

    if (error) throw new Error(error.message)
    return { success: true, task: data }
  },

  // Accepts any work file (zip archives included) and stores it in the
  // 'task-submissions' bucket. Used by the Profile "Submit Your Work" form.
  async uploadSubmissionFile(file) {
    const fileName = `user_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]+/g, '_')}`
    const { data, error } = await supabase.storage
      .from('task-submissions')
      .upload(fileName, file, { cacheControl: '3600', upsert: true })

    if (error) throw new Error(error.message)

    const { data: urlData } = supabase.storage
      .from('task-submissions')
      .getPublicUrl(fileName)

    return { success: true, fileUrl: urlData.publicUrl }
  },
}
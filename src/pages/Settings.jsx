import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi, getStoredUser, isAuthenticated } from '../lib/api'
import Header from '../components/Header'
import Footer from '../components/Footer'

function SectionCard({ title, children }) {
  return (
    <div className="glass-card rounded-2xl border border-gray-200 p-6 sm:p-7">
      <h2 className="font-bold text-gray-900 mb-5 text-sm">{title}</h2>
      {children}
    </div>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => getStoredUser())

  const [fullName, setFullName] = useState('')
  const [profileMsg, setProfileMsg] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordErr, setPasswordErr] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  const [prefs, setPrefs] = useState({ email: true, jobUpdates: true, accountAlerts: true })

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/signin', { replace: true })
      return
    }
    authApi.me().then((res) => {
      setUser(res.user)
      setFullName(res.user.fullName || '')
    }).catch(() => {})
  }, [navigate])

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileMsg('')
    try {
      await authApi.updateMe({ fullName })
      setProfileMsg('Profile updated.')
    } catch (err) {
      setProfileMsg(err.message || 'Could not update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setSavingPassword(true)
    setPasswordMsg('')
    setPasswordErr('')
    try {
      await authApi.changePassword(currentPassword, newPassword)
      setPasswordMsg('Password changed successfully.')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      setPasswordErr(err.message || 'Could not change password.')
    } finally {
      setSavingPassword(false)
    }
  }

  if (!isAuthenticated()) return null

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sora relative overflow-x-hidden">
      <div className="orb w-[400px] h-[400px] bg-amber-50 top-[-10%] right-[10%]" aria-hidden="true" />
      <Header />

      <main className="relative z-10 px-6 lg:px-16 py-14 max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-black mb-1.5">Settings</h1>
        <p className="text-gray-500 text-sm mb-8">Manage your profile, password, and notification preferences.</p>

        <div className="space-y-6">
          <SectionCard title="Profile">
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Full Name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Email</label>
                <input value={user?.email || ''} disabled className="form-input opacity-60 cursor-not-allowed" />
              </div>
              {profileMsg && <p className="text-xs font-semibold text-amber-600">{profileMsg}</p>}
              <button type="submit" disabled={savingProfile} className="btn-primary w-auto py-2.5 px-6 text-xs disabled:opacity-60">
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </SectionCard>

          <SectionCard title="Change Password">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <input
                type="password"
                required
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="form-input"
              />
              <input
                type="password"
                required
                minLength={6}
                placeholder="New password (min. 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input"
              />
              {passwordErr && <p className="text-xs font-semibold text-red-500">{passwordErr}</p>}
              {passwordMsg && <p className="text-xs font-semibold text-emerald-600">{passwordMsg}</p>}
              <button type="submit" disabled={savingPassword} className="btn-primary w-auto py-2.5 px-6 text-xs disabled:opacity-60">
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </SectionCard>

          <SectionCard title="Notification Preferences">
            <div className="space-y-4">
              {[
                { key: 'email', label: 'Email notifications' },
                { key: 'jobUpdates', label: 'Job & application updates' },
                { key: 'accountAlerts', label: 'Account status alerts' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-600">{label}</span>
                  <input
                    type="checkbox"
                    checked={prefs[key]}
                    onChange={(e) => setPrefs({ ...prefs, [key]: e.target.checked })}
                    className="w-4 h-4 accent-amber-500"
                  />
                </label>
              ))}
              <p className="text-[11px] text-gray-400 pt-1">
                Preferences are saved locally for now — backend persistence coming soon.
              </p>
            </div>
          </SectionCard>
        </div>
      </main>

      <Footer />
    </div>
  )
}

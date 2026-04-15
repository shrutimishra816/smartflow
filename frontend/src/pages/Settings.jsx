import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import { watchAPI } from '../api/client'
import toast from 'react-hot-toast'
import { User, Lock, Trash2, Download, Watch, Upload, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

const Section = ({ icon: Icon, title, children }) => (
  <div className="card space-y-4">
    <div className="flex items-center gap-2 pb-2 border-b border-blush">
      <Icon size={18} className="text-rose" />
      <h2 className="font-display text-lg text-ink">{title}</h2>
    </div>
    {children}
  </div>
)

const SYNC_OPTIONS = [
  { key: 'sync_bbt',        label: 'Body Temperature (BBT)' },
  { key: 'sync_heart_rate', label: 'Resting Heart Rate' },
  { key: 'sync_sleep',      label: 'Sleep Duration & Quality' },
  { key: 'sync_steps',      label: 'Daily Steps' },
  { key: 'sync_spo2',       label: 'Blood Oxygen (SpO2)' },
]

export default function Settings() {
  const { user, logout }  = useAuth()
  const navigate          = useNavigate()
  const [searchParams]    = useSearchParams()
  const fileRef           = useRef()

  const [profile, setProfile]     = useState({ username: user?.username || '', email: user?.email || '' })
  const [passwords, setPasswords] = useState({ current: '', new_: '', confirm: '' })
  const [syncSettings, setSyncSettings] = useState({
    sync_bbt: true, sync_heart_rate: true, sync_sleep: false, sync_steps: false, sync_spo2: false
  })
  const [importing, setImporting]     = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [loading, setLoading]         = useState({})

  // Watch connection status
  const [fitbitStatus,  setFitbitStatus]  = useState(null)
  const [googleStatus,  setGoogleStatus]  = useState(null)

  const setLoad = (key, val) => setLoading(l => ({ ...l, [key]: val }))

  // Load watch statuses on mount
  useEffect(() => {
    watchAPI.fitbitStatus().then(r => setFitbitStatus(r.data)).catch(() => {})
    watchAPI.googleStatus().then(r => setGoogleStatus(r.data)).catch(() => {})
  }, [])

  // Handle OAuth redirect callbacks
  useEffect(() => {
    const watch     = searchParams.get('watch')
    const connected = searchParams.get('connected')
    if (watch && connected === 'true') {
      toast.success(`${watch === 'fitbit' ? 'Fitbit' : 'Google Fit'} connected! 🌊`)
      // Refresh status
      if (watch === 'fitbit')     watchAPI.fitbitStatus().then(r => setFitbitStatus(r.data)).catch(() => {})
      if (watch === 'googlefit')  watchAPI.googleStatus().then(r => setGoogleStatus(r.data)).catch(() => {})
    } else if (watch && connected === 'false') {
      toast.error(`Failed to connect ${watch}`)
    }
  }, [searchParams])

  // --- Profile ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoad('profile', true)
    try {
      await api.put('/users/profile', profile)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed')
    } finally {
      setLoad('profile', false)
    }
  }

  // --- Password ---
  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwords.new_ !== passwords.confirm) { toast.error('Passwords do not match'); return }
    if (passwords.new_.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoad('password', true)
    try {
      await api.put('/users/password', { current_password: passwords.current, new_password: passwords.new_ })
      toast.success('Password changed!')
      setPasswords({ current: '', new_: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed')
    } finally {
      setLoad('password', false)
    }
  }

  // --- Export ---
  const handleExport = async (format) => {
    setLoad(`export_${format}`, true)
    try {
      const res = await api.get(`/users/export?format=${format}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a   = document.createElement('a')
      a.href = url; a.download = `smartflow_data.${format}`; a.click()
      toast.success(`Exported as ${format.toUpperCase()}!`)
    } catch { toast.error('Export failed') }
    finally { setLoad(`export_${format}`, false) }
  }

  // --- Delete ---
  const handleDeleteAccount = async () => {
    if (deleteInput !== user?.username) { toast.error('Username does not match'); return }
    setLoad('delete', true)
    try {
      await api.delete('/users/me')
      toast.success('Account deleted')
      logout(); navigate('/login')
    } catch { toast.error('Failed to delete account') }
    finally { setLoad('delete', false) }
  }

  // --- Watch OAuth ---
  const handleOAuthConnect = async (platform) => {
    try {
      const res = await (platform === 'fitbit' ? watchAPI.fitbitAuth() : watchAPI.googleAuth())
      window.location.href = res.data.auth_url
    } catch (err) {
      toast.error(err.response?.data?.detail || `Failed to connect ${platform}`)
    }
  }

  const handleDisconnect = async (platform) => {
    try {
      if (platform === 'fitbit') {
        await watchAPI.fitbitDisconnect()
        setFitbitStatus({ connected: false, platform: 'fitbit' })
      } else {
        await watchAPI.googleDisconnect()
        setGoogleStatus({ connected: false, platform: 'googlefit' })
      }
      toast.success(`${platform === 'fitbit' ? 'Fitbit' : 'Google Fit'} disconnected`)
    } catch { toast.error('Failed to disconnect') }
  }

  // --- Import ---
  const handleFileImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImporting(true)
    try {
      const res = await watchAPI.importFile(file)
      toast.success(`Imported ${res.data.imported} logs! ${res.data.skipped > 0 ? `(${res.data.skipped} skipped)` : ''}`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Import failed')
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  const handleDownloadTemplate = async () => {
    const res = await watchAPI.downloadTemplate()
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const a   = document.createElement('a')
    a.href = url; a.download = 'smartflow_import_template.csv'; a.click()
  }

  // Watch status badge
  const StatusBadge = ({ connected, name }) => connected
    ? <span className="flex items-center gap-1.5 text-xs font-medium text-sage bg-sage/10 px-2.5 py-1 rounded-full">
        <CheckCircle size={12} /> Connected
      </span>
    : <span className="flex items-center gap-1.5 text-xs font-medium text-ink-soft bg-blush px-2.5 py-1 rounded-full">
        <XCircle size={12} /> Not connected
      </span>

  const WATCH_PLATFORMS = [
    { id: 'fitbit',    name: 'Fitbit',     emoji: '⌚', desc: 'Sync heart rate, sleep & temperature', oauth: true,  status: fitbitStatus  },
    { id: 'googlefit', name: 'Google Fit', emoji: '🤸', desc: 'Sync activity, heart rate & sleep',    oauth: true,  status: googleStatus  },
    { id: 'apple',     name: 'Apple Watch',emoji: '🍎', desc: 'Import via Health app CSV export',     oauth: false, status: null          },
    { id: 'garmin',    name: 'Garmin',     emoji: '🏃', desc: 'Import via Garmin Connect CSV export', oauth: false, status: null          },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 sm:pb-8 space-y-6 animate-fadeUp">
      <div>
        <h1 className="text-2xl font-display text-ink">Settings</h1>
        <p className="text-ink-soft text-sm font-body mt-0.5">Manage your account, privacy and connected devices</p>
      </div>

      {/* Profile */}
      <Section icon={User} title="Profile">
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-soft mb-1.5">Username</label>
            <input className="input-field" value={profile.username}
              onChange={e => setProfile(p => ({ ...p, username: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-soft mb-1.5">Email</label>
            <input type="email" className="input-field" value={profile.email}
              onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
          </div>
          <button type="submit" className="btn-primary" disabled={loading.profile}>
            {loading.profile ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </Section>

      {/* Password */}
      <Section icon={Lock} title="Change Password">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-soft mb-1.5">Current Password</label>
            <input type="password" className="input-field" value={passwords.current}
              onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-soft mb-1.5">New Password</label>
            <input type="password" className="input-field" value={passwords.new_}
              onChange={e => setPasswords(p => ({ ...p, new_: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-soft mb-1.5">Confirm New Password</label>
            <input type="password" className="input-field" value={passwords.confirm}
              onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} />
          </div>
          <button type="submit" className="btn-primary" disabled={loading.password}>
            {loading.password ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      </Section>

      {/* Export */}
      <Section icon={Download} title="Export My Data">
        <p className="text-sm text-ink-soft font-body">Download all your logged data. Your data belongs to you.</p>
        <div className="flex gap-3">
          <button onClick={() => handleExport('csv')} className="btn-primary flex items-center gap-2"
            disabled={loading.export_csv}>
            <Download size={15} />{loading.export_csv ? 'Exporting…' : 'Export CSV'}
          </button>
          <button onClick={() => handleExport('json')} className="btn-ghost flex items-center gap-2"
            disabled={loading.export_json}>
            <Download size={15} />{loading.export_json ? 'Exporting…' : 'Export JSON'}
          </button>
        </div>
      </Section>

      {/* Watch Integration */}
      <Section icon={Watch} title="Connect Your Watch">
        <p className="text-sm text-ink-soft font-body mb-2">
          Connect your wearable to auto-sync health data into SmartFlow.
        </p>

        {/* Sync preferences */}
        <div className="bg-blush rounded-xl p-4 space-y-2 mb-4">
          <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-3">What to sync</p>
          {SYNC_OPTIONS.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={syncSettings[key]}
                onChange={e => setSyncSettings(s => ({ ...s, [key]: e.target.checked }))}
                className="accent-rose w-4 h-4" />
              <span className="text-sm font-body text-ink">{label}</span>
            </label>
          ))}
        </div>

        {/* Platforms */}
        <div className="space-y-3">
          {WATCH_PLATFORMS.map(({ id, name, emoji, desc, oauth, status }) => (
            <div key={id} className={`p-4 border rounded-xl transition-colors
              ${status?.connected ? 'border-sage/40 bg-sage/5' : 'border-blush hover:border-rose/30'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink">{name}</span>
                      {oauth && status && <StatusBadge connected={status.connected} />}
                    </div>
                    <div className="text-xs text-ink-soft font-body">{desc}</div>
                    {status?.connected && status?.display_name && (
                      <div className="text-xs text-sage font-medium mt-0.5">👤 {status.display_name}</div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {oauth ? (
                    status?.connected ? (
                      <button onClick={() => handleDisconnect(id)}
                        className="btn-ghost text-sm py-1.5 px-3 text-rose border-rose/30 hover:bg-rose/5">
                        Disconnect
                      </button>
                    ) : (
                      <button onClick={() => handleOAuthConnect(id)}
                        className="btn-primary text-sm py-1.5 px-4">
                        Connect
                      </button>
                    )
                  ) : (
                    <button onClick={() => fileRef.current?.click()}
                      className="btn-ghost text-sm py-1.5 px-4 flex items-center gap-1.5">
                      <Upload size={13} /> Import
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Manual import */}
        <div className="border border-dashed border-blush-dark rounded-xl p-4 mt-2">
          <p className="text-sm font-medium text-ink mb-1">Manual CSV/JSON Import</p>
          <p className="text-xs text-ink-soft font-body mb-3">
            Export data from Apple Health, Garmin Connect, or any app and import it here.
          </p>
          <div className="flex gap-3">
            <button onClick={() => fileRef.current?.click()}
              className="btn-primary text-sm flex items-center gap-2" disabled={importing}>
              <Upload size={14} />{importing ? 'Importing…' : 'Upload File'}
            </button>
            <button onClick={handleDownloadTemplate} className="btn-ghost text-sm flex items-center gap-2">
              <Download size={14} /> Download Template
            </button>
          </div>
          <input ref={fileRef} type="file" accept=".csv,.json" className="hidden" onChange={handleFileImport} />
        </div>
      </Section>

      {/* Danger Zone */}
      <Section icon={Trash2} title="Danger Zone">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700">Delete Account</p>
              <p className="text-xs text-red-500 font-body mt-0.5">
                Permanently deletes your account and all data. Cannot be undone.
              </p>
            </div>
          </div>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)}
              className="mt-4 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-full hover:bg-red-600 transition-colors">
              Delete My Account
            </button>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-red-700 font-body">Type <strong>{user?.username}</strong> to confirm:</p>
              <input className="input-field border-red-300 focus:ring-red-300 focus:border-red-400"
                placeholder={user?.username} value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)} />
              <div className="flex gap-3">
                <button onClick={handleDeleteAccount}
                  disabled={deleteInput !== user?.username || loading.delete}
                  className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-full hover:bg-red-600 transition-colors disabled:opacity-50">
                  {loading.delete ? 'Deleting…' : 'Yes, Delete Everything'}
                </button>
                <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput('') }}
                  className="btn-ghost text-sm">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}

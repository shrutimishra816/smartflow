import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', username: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      await register({ email: form.email, username: form.username, password: form.password })
      toast.success('Account created! Welcome to SmartFlow 🌊')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-petal flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fadeUp">
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🌊</div>
          <h1 className="text-3xl text-ink font-display">SmartFlow</h1>
          <p className="text-ink-soft font-body mt-1 text-sm">Start tracking your cycle today</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-display text-ink mb-6">Create account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-soft mb-1.5">Email</label>
              <input type="email" className="input-field" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-soft mb-1.5">Username</label>
              <input type="text" className="input-field" placeholder="yourname"
                value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-soft mb-1.5">Password</label>
              <input type="password" className="input-field" placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-soft mb-1.5">Confirm Password</label>
              <input type="password" className="input-field" placeholder="••••••••"
                value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
            </div>
            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
          <p className="text-center text-sm text-ink-soft mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-rose font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

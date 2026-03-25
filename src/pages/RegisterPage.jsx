import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { register } from '../services/api'
import { Btn, Input, Alert, Spinner } from '../components/ui'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', password: '', fullName: '', email: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { saveAuth } = useAuth()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const { data } = await register(form)
      saveAuth(data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{ position: 'fixed', inset: 0, opacity: 0.03, backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
      <div style={{ width: '100%', maxWidth: 400, animation: 'fadeIn 0.4s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, letterSpacing: 6, color: 'var(--accent)', lineHeight: 1 }}>WMS</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', letterSpacing: '2px', marginTop: 4 }}>CREATE YOUR ACCOUNT</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: 1, marginBottom: 6 }}>REGISTER</h2>
          <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginBottom: 24 }}>New accounts are created as CLIENT</p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Full Name" value={form.fullName} onChange={set('fullName')} placeholder="Alice Johnson" required />
            <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="alice@example.com" required />
            <Input label="Username" value={form.username} onChange={set('username')} placeholder="alice_j" required />
            <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required />
            <Alert type="error" message={error} />
            <Btn type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {loading ? <Spinner size={16} /> : 'Create Account'}
            </Btn>
          </form>
          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text3)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

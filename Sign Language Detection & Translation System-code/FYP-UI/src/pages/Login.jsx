import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Globe, LockKeyhole, Mail, UserRound } from 'lucide-react'
import SignLogo from '../components/SignLogo'
import ParticleBackground from '../components/ParticleBackground'
import GlassCard from '../components/GlassCard'
import { saveSession, seedDemoUser, getUsers } from '../utils/auth'

function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', rememberMe: true })
  const [error, setError] = useState('')

  useEffect(() => {
    seedDemoUser()
  }, [])

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
  }

  const handleLogin = (event) => {
    event.preventDefault()

    const users = getUsers()
    const email = form.email.trim().toLowerCase()
    const user = users.find(
      (entry) => entry.email.toLowerCase() === email && entry.password === form.password,
    )

    if (!user) {
      setError('Invalid email or password. Try demo@sindhisignconnect.app / demo12345.')
      return
    }

    saveSession(user)
    navigate('/dashboard')
  }

  const handleSocialLogin = (provider) => {
    const socialUser = {
      id: crypto.randomUUID(),
      fullName: `${provider} User`,
      email: `${provider.toLowerCase()}@sindhisignconnect.app`,
      role: 'Signer',
      provider,
    }

    saveSession(socialUser)
    navigate('/dashboard')
  }

  return (
    <div className="auth-page">
      <ParticleBackground />
      <GlassCard className="auth-card">
        <SignLogo size={60} />
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Login to continue to your Sindhi Sign Connect dashboard.</p>
        <form className="auth-form" onSubmit={handleLogin}>
          <label className="field-label">
            <span>Email</span>
            <div className="input-shell">
              <Mail size={18} />
              <input
                placeholder="Enter your email"
                type="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
              />
            </div>
          </label>
          <label className="field-label">
            <span>Password</span>
            <div className="input-shell">
              <LockKeyhole size={18} />
              <input
                placeholder="Enter your password"
                type="password"
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
              />
            </div>
          </label>
          <div className="row spread auth-row">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.rememberMe}
                onChange={(event) => updateField('rememberMe', event.target.checked)}
              />
              Remember me
            </label>
            <span className="muted-link">Forgot Password?</span>
          </div>
          {error ? <p className="auth-error">{error}</p> : null}
          <button className="btn-primary full" type="submit">Login</button>
        </form>
        <div className="demo-tip">
          <UserRound size={16} />
          Demo account: `demo@sindhisignconnect.app` / `demo12345`
        </div>
        <p className="divider">or continue with</p>
        <div className="social-grid">
          <button className="btn-outline-cyan full social-btn" type="button" onClick={() => handleSocialLogin('Google')}>
            <Globe size={18} />
            Continue with Google
          </button>
          <button className="btn-outline-cyan full social-btn" type="button" onClick={() => handleSocialLogin('Microsoft')}>
            <Mail size={18} />
            Continue with Microsoft
          </button>
        </div>
        <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
      </GlassCard>
    </div>
  )
}

export default Login

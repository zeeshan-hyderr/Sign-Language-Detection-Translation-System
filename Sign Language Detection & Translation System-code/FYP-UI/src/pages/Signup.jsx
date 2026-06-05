import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Globe, LockKeyhole, Mail, UserRound } from 'lucide-react'
import SignLogo from '../components/SignLogo'
import ParticleBackground from '../components/ParticleBackground'
import GlassCard from '../components/GlassCard'
import { getUsers, saveSession, saveUsers, seedDemoUser } from '../utils/auth'

function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Signer',
    acceptedTerms: false,
  })
  const [error, setError] = useState('')

  useEffect(() => {
    seedDemoUser()
  }, [])

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
  }

  const handleSignup = (event) => {
    event.preventDefault()

    if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!form.acceptedTerms) {
      setError('Please accept the terms and conditions to continue.')
      return
    }

    const users = getUsers()
    const email = form.email.trim().toLowerCase()
    if (users.some((entry) => entry.email.toLowerCase() === email)) {
      setError('An account with this email already exists. Please login instead.')
      return
    }

    const newUser = {
      id: crypto.randomUUID(),
      fullName: form.fullName.trim(),
      email,
      password: form.password,
      role: form.role,
    }

    saveUsers([...users, newUser])
    saveSession(newUser)
    navigate('/dashboard')
  }

  const handleSocialSignup = (provider) => {
    const newUser = {
      id: crypto.randomUUID(),
      fullName: `${provider} User`,
      email: `${provider.toLowerCase()}@sindhisignconnect.app`,
      role: 'Signer',
      provider,
    }

    saveSession(newUser)
    navigate('/dashboard')
  }

  return (
    <div className="auth-page">
      <ParticleBackground />
      <GlassCard className="auth-card">
        <SignLogo size={60} />
        <h2>Create Account</h2>
        <p className="auth-subtitle">Create your account and access the dashboard features.</p>
        <form className="auth-form" onSubmit={handleSignup}>
          <label className="field-label">
            <span>Full Name</span>
            <div className="input-shell">
              <UserRound size={18} />
              <input
                placeholder="Your full name"
                value={form.fullName}
                onChange={(event) => updateField('fullName', event.target.value)}
              />
            </div>
          </label>
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
                placeholder="Create a password"
                type="password"
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
              />
            </div>
          </label>
          <label className="field-label">
            <span>Confirm Password</span>
            <div className="input-shell">
              <LockKeyhole size={18} />
              <input
                placeholder="Confirm your password"
                type="password"
                value={form.confirmPassword}
                onChange={(event) => updateField('confirmPassword', event.target.value)}
              />
            </div>
          </label>
          <div className="pill-row auth-pill-row">
            {['Signer', 'Non-Signer'].map((role) => (
              <button
                key={role}
                className={form.role === role ? 'active' : ''}
                type="button"
                onClick={() => updateField('role', role)}
              >
                {role}
              </button>
            ))}
          </div>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.acceptedTerms}
              onChange={(event) => updateField('acceptedTerms', event.target.checked)}
            />
            Accept Terms and Conditions
          </label>
          {error ? <p className="auth-error">{error}</p> : null}
          <button className="btn-primary full" type="submit">Sign Up</button>
        </form>
        <p className="divider">or continue with</p>
        <div className="social-grid">
          <button className="btn-outline-cyan full social-btn" type="button" onClick={() => handleSocialSignup('Google')}>
            <Globe size={18} />
            Continue with Google
          </button>
          <button className="btn-outline-cyan full social-btn" type="button" onClick={() => handleSocialSignup('Microsoft')}>
            <Mail size={18} />
            Continue with Microsoft
          </button>
        </div>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </GlassCard>
    </div>
  )
}

export default Signup

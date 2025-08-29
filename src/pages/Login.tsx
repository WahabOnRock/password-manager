import { useState } from 'react'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../firebase'
import { Link, useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resetMsg, setResetMsg] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResetMsg(null)
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword() {
    setError(null)
    setResetMsg(null)
    if (!email) {
      setError('Enter your email, then click “Forgot password?”.')
      return
    }
    try {
      await sendPasswordResetEmail(auth, email)
      setResetMsg('Password reset email sent. Check your inbox.')
    } catch (err: any) {
      setError(err.message || 'Could not send reset email')
    }
  }

  return (
    <div className="container" style={{ maxWidth: 480 }}>
      <div className="card" style={{ padding: 20 }}>
        <h2>Login</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
          <button type="button" className="secondary" onClick={handleForgotPassword}>Forgot password?</button>
          {error && <div style={{ color: 'crimson' }}>{error}</div>}
          {resetMsg && <div style={{ color: 'seagreen' }}>{resetMsg}</div>}
        </form>
        <p style={{ marginTop: 12 }}>No account? <Link to="/signup">Sign up</Link></p>
      </div>
    </div>
  )
}



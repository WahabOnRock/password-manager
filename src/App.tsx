import { Route, Routes, Navigate, Link } from 'react-router-dom'
import './App.css'
import Login from './pages/Login.tsx'
import Signup from './pages/Signup.tsx'
import Dashboard from './pages/Dashboard.tsx'
import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from './firebase'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>

  return (
    <div>
      <div className="nav">
        <div className="brand">Password Manager</div>
        <div>
          <Link to="/"></Link>
          {!user && <Link to="/login"></Link>}
          {!user && <Link to="/signup"></Link>}
          {user && <Link to="/dashboard"></Link>}
        </div>
      </div>
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default App

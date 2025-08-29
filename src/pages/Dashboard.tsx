import { signOut } from 'firebase/auth'
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, where } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { auth, db } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'

type Account = {
  id: string
  name: string
  username: string
  password: string
  createdAt?: any
}

export default function Dashboard() {
  const [userId, setUserId] = useState<string | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showAddPassword, setShowAddPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUserId(u?.uid ?? null))
    return () => unsub()
  }, [])

  const accountsQuery = useMemo(() => {
    if (!userId) return null
    return query(
      collection(db, 'accounts'),
      where('ownerId', '==', userId)
    )
  }, [userId])

  useEffect(() => {
    if (!accountsQuery) return
    const unsub = onSnapshot(accountsQuery, (snap) => {
      const list: Account[] = []
      snap.forEach((d) => {
        const data = d.data() as any
        list.push({ id: d.id, name: data.name, username: data.username, password: data.password, createdAt: data.createdAt })
      })
      // Sort client-side by createdAt desc to avoid composite index requirement
      list.sort((a, b) => {
        const ta = a.createdAt?.seconds ?? 0
        const tb = b.createdAt?.seconds ?? 0
        return tb - ta
      })
      setAccounts(list)
    })
    return () => unsub()
  }, [accountsQuery])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    setSaving(true)
    try {
      await addDoc(collection(db, 'accounts'), {
        ownerId: userId,
        name,
        username,
        password,
        createdAt: serverTimestamp(),
      })
      setName('')
      setUsername('')
      setPassword('')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    await deleteDoc(doc(db, 'accounts', id))
  }

  function toggleReveal(id: string) {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="container" style={{ maxWidth: 960 }}>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, marginBottom: 16 }}>
        <h2>Your Password Vault</h2>
        <button onClick={() => signOut(auth)} className="secondary">Sign out</button>
      </div>

      <form className="add-form" onSubmit={handleAdd} style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr 1fr auto auto', alignItems: 'end', marginBottom: 16, background: '#fff', padding: 12, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>
        <div className="field">
          <div className="field-label">Account name:</div>
          <input className="field-box" placeholder="Enter account name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="field">
          <div className="field-label">User name:</div>
          <input className="field-box" placeholder="Enter user name" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="field">
          <div className="field-label">Password:</div>
          <input className="field-box" placeholder="Enter password" type={showAddPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="button" onClick={() => setShowAddPassword((s) => !s)} className="secondary" aria-label={showAddPassword ? 'Hide password' : 'Show password'} style={{ padding: '10px 12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          {showAddPassword ? (
            // Eye off icon
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.6-1.39 1.5-2.66 2.57-3.76M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
              <path d="M10.73 5.08A10.94 10.94 0 0 1 12 4c5 0 9.27 3.89 11 8a11.77 11.77 0 0 1-1.64 2.88"/>
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            // Eye icon
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add'}</button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
        {accounts.map((acc) => (
          <li
            key={acc.id}
            className="card item"
            style={{
              padding: 12,
              borderRadius: 10,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr auto auto',
              gap: 10,
              alignItems: 'end'
            }}
          >
            <div className="field">
              <div className="field-label">Account name:</div>
              <div className="field-box">{acc.name || '(No name)'}</div>
            </div>
            <div className="field">
              <div className="field-label">User name:</div>
              <div className="field-box">{acc.username}</div>
            </div>
            <div className="field">
              <div className="field-label">Password:</div>
              <div className="field-box" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>
                  {revealedIds[acc.id] ? acc.password : '•'.repeat(Math.max(8, Math.min(16, acc.password?.length || 8)))}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleReveal(acc.id)}
              className="secondary"
              aria-label={revealedIds[acc.id] ? 'Hide password' : 'Show password'}
              style={{ height: 42, padding: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {revealedIds[acc.id] ? (
                // Eye off icon
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.6-1.39 1.5-2.66 2.57-3.76M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                  <path d="M10.73 5.08A10.94 10.94 0 0 1 12 4c5 0 9.27 3.89 11 8a11.77 11.77 0 0 1-1.64 2.88"/>
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                // Eye icon
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
            <button onClick={() => handleDelete(acc.id)} className="secondary" aria-label="Delete" title="Delete" style={{ height: 42, padding: '8px 10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/>
                <path d="M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}



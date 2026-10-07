// src/components/Login.jsx
//
// Page de connexion (email + mot de passe) via Supabase Auth.
// À coller dans src/components/.

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const NAVY = '#1B2A4A'
const GOLD = '#B08D3E'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError("Email ou mot de passe incorrect.")
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Arial, sans-serif', padding: 16,
    }}>
      <form onSubmit={handleSubmit} style={{
        background: '#fff', padding: 32, borderRadius: 12, width: '100%', maxWidth: 360,
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)', borderTop: `4px solid ${GOLD}`,
      }}>
        <h1 style={{ color: NAVY, fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>
          Outil d'audit en gestion
        </h1>
        <p style={{ color: '#666', fontSize: 13, marginBottom: 24 }}>
          Imadou-Dini IMOROU — Connexion
        </p>

        <label style={{ fontSize: 12, fontWeight: 'bold', color: '#333' }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        <label style={{ fontSize: 12, fontWeight: 'bold', color: '#333' }}>Mot de passe</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        {error && <p style={{ color: '#C0392B', fontSize: 13, marginTop: 4 }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', backgroundColor: NAVY, color: '#fff', border: 'none',
            padding: '11px 0', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer',
            fontSize: 14, marginTop: 16,
          }}
        >
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}

const inputStyle = {
  display: 'block', width: '100%', padding: '9px 10px', margin: '6px 0 16px',
  border: '1px solid #ccc', borderRadius: 6, fontSize: 14, boxSizing: 'border-box',
}

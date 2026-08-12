import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/')
    })
  }, [])

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else navigate('/')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', system-ui, sans-serif; }
        .login-input {
          width: 100%;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          padding: 11px 14px;
          font-size: 15px;
          font-family: 'Inter', sans-serif;
          color: #0f1f3d;
          outline: none;
          transition: border-color 0.15s;
          background: #fff;
        }
        .login-input:focus { border-color: #c9a84c; }
        .login-input::placeholder { color: #94a3b8; }
        .login-btn {
          width: 100%;
          background: #c9a84c;
          color: #0f1f3d;
          border: none;
          border-radius: 8px;
          padding: 13px;
          font-size: 15px;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: background 0.15s;
          letter-spacing: -0.2px;
        }
        .login-btn:hover:not(:disabled) { background: #b8963e; }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f1f3d 0%, #162b52 60%, #1a3366 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: "'Inter', system-ui, sans-serif"
      }}>
        {/* Nav-style logo at top */}
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <a href="https://manyhandz.ai" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
              ManyHandz<span style={{ color: '#c9a84c', fontSize: 32, lineHeight: 1, marginLeft: 1 }}>.</span>
            </span>
          </a>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 8, fontWeight: 400 }}>
            Sign in to your dashboard
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: '36px 40px',
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f1f3d', marginBottom: 6, letterSpacing: '-0.3px' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28 }}>
            Enter your details to access your account
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0f1f3d', marginBottom: 6 }}>
                Email address
              </label>
              <input
                className="login-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0f1f3d', marginBottom: 6 }}>
                Password
              </label>
              <input
                className="login-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 8,
                padding: '10px 14px',
                color: '#dc2626',
                fontSize: 13,
                marginBottom: 16
              }}>
                {error}
              </div>
            )}

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 24, textAlign: 'center' }}>
          Need help? <a href="mailto:hello@manyhandz.ai" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'underline' }}>Contact support</a>
        </p>
      </div>
    </>
  )
}

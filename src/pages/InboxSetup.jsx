import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../App'
import { supabase } from '../lib/supabase'

const PROVIDERS = {
  gmail: {
    label: 'Gmail',
    host: 'imap.gmail.com',
    logo: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="#fff" stroke="#e2e8f0" strokeWidth="1.5"/>
        <path d="M22 6l-10 7L2 6" stroke="#EA4335" strokeWidth="2" strokeLinecap="round"/>
        <path d="M2 6l5.5 6M22 6l-5.5 6" stroke="#4285F4" strokeWidth="1.5"/>
      </svg>
    ),
    guideUrl: 'https://myaccount.google.com/apppasswords',
    guideSteps: [
      'Go to myaccount.google.com/security',
      'Enable 2-Step Verification if not already on',
      'Search "App passwords" in the search bar',
      'Select Mail + Windows/Mac/Other device',
      'Copy the 16-character password generated',
    ],
    passwordLabel: 'App Password',
    passwordHint: '16-character password from Google (no spaces needed)',
    emailHint: 'yourname@gmail.com'
  },
  outlook: {
    label: 'Outlook / Microsoft 365',
    host: 'outlook.office365.com',
    logo: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#0078D4"/>
        <path d="M13 5h7v14h-7V5z" fill="#50a8f8" opacity="0.7"/>
        <rect x="4" y="8" width="10" height="8" rx="1.5" fill="#fff"/>
        <text x="9" y="14.5" textAnchor="middle" fill="#0078D4" fontSize="5.5" fontWeight="bold" fontFamily="sans-serif">O</text>
      </svg>
    ),
    guideUrl: 'https://account.microsoft.com/security',
    guideSteps: [
      'Go to account.microsoft.com/security',
      'Enable two-step verification if not already on',
      'Go to Security → Advanced security options',
      'Under "App passwords", create a new one',
      'Copy the generated password',
    ],
    passwordLabel: 'App Password',
    passwordHint: 'App password from Microsoft account security settings',
    emailHint: 'yourname@outlook.com or yourname@company.com'
  }
}

export default function InboxSetup() {
  const { customer, refreshCustomer } = useContext(AppContext)
  const navigate = useNavigate()
  const [provider, setProvider] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showGuide, setShowGuide] = useState(false)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [testResult, setTestResult] = useState(null)

  const prov = PROVIDERS[provider]

  async function testConnection() {
    setTesting(true)
    setError('')
    setTestResult(null)
    try {
      const res = await fetch('https://mhprovision.draftpilot.co/test-inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, email, password })
      })
      const data = await res.json()
      if (data.success) {
        setTestResult({ ok: true, count: data.messageCount })
      } else {
        setError(data.error || 'Connection failed. Check your email and app password.')
      }
    } catch(e) {
      setError('Could not reach server. Try again.')
    }
    setTesting(false)
  }

  async function save() {
    setSaving(true)
    setError('')
    try {
      const { error: err } = await supabase
        .from('mh_customers')
        .update({
          inbox_email: email,
          inbox_provider: provider,
          inbox_app_password: password,
          inbox_connected: true
        })
        .eq('id', customer.id)

      if (err) throw err
      await refreshCustomer()
      navigate('/inbox')
    } catch(e) {
      setError('Failed to save. Please try again.')
    }
    setSaving(false)
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 8,
    border: '1.5px solid #e2e8f0', fontSize: 14, fontFamily: "'Inter', sans-serif",
    outline: 'none', color: '#0f1f3d', background: '#fff'
  }

  const labelStyle = { fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 24px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input:focus { border-color: #c9a84c !important; box-shadow: 0 0 0 3px rgba(201,168,76,0.12); }
        .provider-card { transition: all 0.15s; }
        .provider-card:hover { border-color: #c9a84c !important; }
      `}</style>

      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f1f3d', marginBottom: 6, letterSpacing: '-0.5px' }}>
        Connect your inbox
      </h2>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
        Your AI agent will monitor your inbox, filter junk, and draft replies to customer enquiries.
      </p>

      {/* Provider picker */}
      <div style={{ marginBottom: 28 }}>
        <label style={labelStyle}>Email provider</label>
        <div style={{ display: 'flex', gap: 12 }}>
          {Object.entries(PROVIDERS).map(([key, p]) => (
            <div key={key} className="provider-card"
              onClick={() => { setProvider(key); setTestResult(null); setError(''); }}
              style={{
                flex: 1, padding: '16px', borderRadius: 10, cursor: 'pointer',
                border: `2px solid ${provider === key ? '#c9a84c' : '#e2e8f0'}`,
                background: provider === key ? '#fffbf0' : '#fff',
                display: 'flex', alignItems: 'center', gap: 10
              }}>
              {p.logo}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f1f3d' }}>{p.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {provider && (
        <>
          {/* How to get app password */}
          <div style={{ marginBottom: 24, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <button
              onClick={() => setShowGuide(!showGuide)}
              style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'Inter', sans-serif" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0f1f3d' }}>
                📋 How to get your app password
              </span>
              <span style={{ color: '#64748b', fontSize: 18, lineHeight: 1 }}>{showGuide ? '−' : '+'}</span>
            </button>
            {showGuide && (
              <div style={{ padding: '0 16px 16px' }}>
                <ol style={{ margin: 0, paddingLeft: 18 }}>
                  {prov.guideSteps.map((step, i) => (
                    <li key={i} style={{ fontSize: 13, color: '#374151', marginBottom: 8, lineHeight: 1.5 }}>{step}</li>
                  ))}
                </ol>
                <a href={prov.guideUrl} target="_blank" rel="noreferrer"
                  style={{ display: 'inline-block', marginTop: 8, fontSize: 13, color: '#c9a84c', fontWeight: 600, textDecoration: 'none' }}>
                  Open {prov.label} security settings →
                </a>
              </div>
            )}
          </div>

          {/* Email field */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={prov.emailHint}
              style={inputStyle}
            />
          </div>

          {/* App password field */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>{prov.passwordLabel}</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter app password"
              style={inputStyle}
            />
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>{prov.passwordHint}</div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16 }}>
              {error}
            </div>
          )}

          {/* Test result */}
          {testResult?.ok && (
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#16a34a', marginBottom: 16 }}>
              ✓ Connected! Found {testResult.count} emails in inbox.
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={testConnection}
              disabled={!email || !password || testing}
              style={{
                flex: 1, padding: '12px', borderRadius: 8, border: '1.5px solid #c9a84c',
                background: 'transparent', color: '#c9a84c', fontWeight: 600, fontSize: 14,
                cursor: !email || !password || testing ? 'not-allowed' : 'pointer',
                opacity: !email || !password || testing ? 0.5 : 1,
                fontFamily: "'Inter', sans-serif"
              }}>
              {testing ? 'Testing…' : 'Test connection'}
            </button>
            <button
              onClick={save}
              disabled={!testResult?.ok || saving}
              style={{
                flex: 2, padding: '12px', borderRadius: 8, border: 'none',
                background: testResult?.ok ? '#0f1f3d' : '#e2e8f0',
                color: testResult?.ok ? '#fff' : '#94a3b8',
                fontWeight: 700, fontSize: 14,
                cursor: !testResult?.ok || saving ? 'not-allowed' : 'pointer',
                fontFamily: "'Inter', sans-serif"
              }}>
              {saving ? 'Saving…' : 'Connect & continue →'}
            </button>
          </div>

          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 16, textAlign: 'center', lineHeight: 1.5 }}>
            Your credentials are stored securely and only used to connect your inbox. We never store your main account password.
          </p>
        </>
      )}
    </div>
  )
}

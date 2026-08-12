import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { AppContext } from '../App'

const COUNTRIES = [
  { code: 'AU', label: 'Australia (+61)', flag: '🇦🇺', isoCountry: 'AU' },
  { code: 'US', label: 'United States (+1)', flag: '🇺🇸', isoCountry: 'US' },
  { code: 'GB', label: 'United Kingdom (+44)', flag: '🇬🇧', isoCountry: 'GB' },
  { code: 'NZ', label: 'New Zealand (+64)', flag: '🇳🇿', isoCountry: 'NZ' },
  { code: 'CA', label: 'Canada (+1)', flag: '🇨🇦', isoCountry: 'CA' },
  { code: 'SG', label: 'Singapore (+65)', flag: '🇸🇬', isoCountry: 'SG' },
]

const PROVISIONER_URL = 'https://mhprovision.draftpilot.co/provision-number'

export default function SetupVoiceAgent() {
  const { customer, setCustomer } = useContext(AppContext)
  const navigate = useNavigate()
  const [country, setCountry] = useState('AU')
  const [step, setStep] = useState('choose') // choose | provisioning | done | error
  const [number, setNumber] = useState(null)
  const [error, setError] = useState(null)

  async function provision() {
    setStep('provisioning')
    setError(null)
    try {
      const res = await fetch(PROVISIONER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customer.id, country })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Provisioning failed')

      setNumber(data.phone_number)
      setStep('done')

      // Refresh customer row
      const { data: updated } = await supabase
        .from('mh_customers')
        .select('*')
        .eq('id', customer.id)
        .single()
      if (updated) setCustomer(updated)
    } catch (e) {
      setError(e.message)
      setStep('error')
    }
  }

  const selectedCountry = COUNTRIES.find(c => c.code === country)

  return (
    <div className="flex items-center justify-center min-h-screen px-4" style={{ background: '#0D0D12' }}>
      <div style={{ maxWidth: 480, width: '100%' }}>

        {/* Logo */}
        <div className="text-center mb-10">
          <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            Many<span style={{ color: '#D4A017' }}>Handz</span>
          </div>
        </div>

        {step === 'choose' && (
          <div style={{ background: '#13131a', border: '1px solid #1e1e2e', borderRadius: 16, padding: 40 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
              Set up your voice agent
            </h1>
            <p style={{ fontSize: 14, color: '#666680', marginBottom: 32, lineHeight: 1.6 }}>
              We'll assign your business a dedicated phone number. Callers reach your AI agent 24/7 — it answers, qualifies, and either transfers or takes a message.
            </p>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#aaa', display: 'block', marginBottom: 8 }}>
                Which country should your number be in?
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {COUNTRIES.map(c => (
                  <button
                    key={c.code}
                    onClick={() => setCountry(c.code)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: country === c.code ? '2px solid #D4A017' : '1px solid #1e1e2e',
                      background: country === c.code ? '#1a1a0a' : '#0D0D12',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s'
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{c.flag}</span>
                    <span style={{ fontSize: 14, color: country === c.code ? '#D4A017' : '#e8e8f0', fontWeight: country === c.code ? 600 : 400 }}>
                      {c.label}
                    </span>
                    {country === c.code && (
                      <span style={{ marginLeft: 'auto', color: '#D4A017', fontSize: 16 }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={provision}
              style={{
                width: '100%',
                background: '#D4A017',
                color: '#000',
                fontWeight: 700,
                fontSize: 15,
                padding: '14px 24px',
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
              }}
            >
              Get my {selectedCountry?.flag} number →
            </button>
          </div>
        )}

        {step === 'provisioning' && (
          <div style={{ background: '#13131a', border: '1px solid #1e1e2e', borderRadius: 16, padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 20 }}>⏳</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
              Setting up your number…
            </h2>
            <p style={{ fontSize: 14, color: '#666680' }}>
              Provisioning your {selectedCountry?.flag} phone number. This takes about 10 seconds.
            </p>
          </div>
        )}

        {step === 'done' && (
          <div style={{ background: '#13131a', border: '1px solid #4ade8044', borderRadius: 16, padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 20 }}>🎉</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
              You're live!
            </h2>
            <div style={{ background: '#0D0D12', borderRadius: 10, padding: '16px 24px', margin: '20px 0', display: 'inline-block' }}>
              <div style={{ fontSize: 12, color: '#666680', marginBottom: 4 }}>Your phone number</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#D4A017', fontFamily: 'monospace' }}>{number}</div>
            </div>
            <p style={{ fontSize: 14, color: '#666680', marginBottom: 28, lineHeight: 1.6 }}>
              Your AI agent is active on this number. Customise its greeting, sign-off, and instructions from the Phone Agent tab.
            </p>
            <button
              onClick={() => navigate('/phone')}
              style={{
                background: '#D4A017',
                color: '#000',
                fontWeight: 700,
                fontSize: 15,
                padding: '14px 32px',
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
              }}
            >
              Open my dashboard →
            </button>
          </div>
        )}

        {step === 'error' && (
          <div style={{ background: '#13131a', border: '1px solid #f8717144', borderRadius: 16, padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 20 }}>⚠️</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Something went wrong</h2>
            <p style={{ fontSize: 14, color: '#f87171', marginBottom: 24 }}>{error}</p>
            <button
              onClick={() => setStep('choose')}
              style={{
                background: '#D4A017',
                color: '#000',
                fontWeight: 700,
                fontSize: 14,
                padding: '12px 24px',
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

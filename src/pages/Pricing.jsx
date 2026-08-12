import React, { useContext, useState } from 'react'
import { AppContext } from '../App'

const MH_PK = 'pk_live_51TWkJoEx2m1vqgKrVwXBRW4RkFGlY7DCLxVBjnGoqrTQKQTFge5FTUcLJ9JjWUydRWyBz9u3ay0xI73kVzkYf7xF001X0LyTRa'
const PRICES = {
  voice:        'price_1U3TSZEx2m1vqgKreQuXLvba',
  voice_inbox:  'price_1U3TSaEx2m1vqgKrTUfkOgeX'
}

export default function Pricing() {
  const { customer } = useContext(AppContext)
  const [loading, setLoading] = useState(null)

  async function checkout(plan) {
    setLoading(plan)
    try {
      // Dynamically load Stripe.js
      let Stripe = window.Stripe
      if (!Stripe) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script')
          s.src = 'https://js.stripe.com/v3/'
          s.onload = resolve; s.onerror = reject
          document.head.appendChild(s)
        })
        Stripe = window.Stripe
      }

      const stripe = Stripe(MH_PK)
      const priceId = PRICES[plan]

      const { error } = await stripe.redirectToCheckout({
        lineItems: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        successUrl: `${window.location.origin}/setup?payment=success`,
        cancelUrl: `${window.location.origin}/pricing`,
        clientReferenceId: customer?.id || '',
        customerEmail: customer?.owner_email || '',
      })

      if (error) throw new Error(error.message)
    } catch(e) {
      console.error('Checkout error:', e)
      alert('Something went wrong: ' + e.message)
    }
    setLoading(null)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .plan-card { transition: transform 0.15s, box-shadow 0.15s; }
        .plan-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.15); }
        .plan-btn { transition: background 0.15s, opacity 0.15s; }
        .plan-btn:hover:not(:disabled) { opacity: 0.88; }
        .plan-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .check { color: #16a34a; font-weight: 600; margin-right: 8px; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f1f3d 0%, #162b52 60%, #1a3366 100%)',
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: '40px 24px'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <a href="https://manyhandz.ai" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
              ManyHandz<span style={{ color: '#c9a84c', fontSize: 30 }}>.</span>
            </span>
          </a>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginTop: 32, marginBottom: 12, letterSpacing: '-0.5px' }}>
            Choose your plan
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, maxWidth: 440, margin: '0 auto' }}>
            No lock-in. Cancel any time. Your number stays active while you're subscribed.
          </p>
        </div>

        {/* Plans */}
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 820, margin: '0 auto' }}>

          {/* Voice */}
          <div className="plan-card" style={{
            background: '#fff',
            borderRadius: 20,
            padding: '36px 32px',
            flex: '1 1 340px',
            maxWidth: 380,
            border: '2px solid transparent'
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Voice Agent</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
              <span style={{ fontSize: 48, fontWeight: 800, color: '#0f1f3d', letterSpacing: '-2px' }}>$199</span>
              <span style={{ fontSize: 16, color: '#64748b', fontWeight: 500 }}>/mo AUD</span>
            </div>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
              AI agent answers every call, 24/7. Qualifies leads, takes messages, transfers to you.
            </p>
            <div style={{ marginBottom: 32 }}>
              {[
                'Your own AU phone number',
                'AI answers calls 24/7',
                'Lead qualification',
                'Live call transfer to you',
                'SMS follow-ups',
                'Call logs + transcripts',
                'Customise greeting & prompt',
              ].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', marginBottom: 10, fontSize: 14, color: '#334155' }}>
                  <span className="check">✓</span> {f}
                </div>
              ))}
            </div>
            <button
              className="plan-btn"
              onClick={() => checkout('voice')}
              disabled={!!loading}
              style={{
                width: '100%',
                background: '#0f1f3d',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '14px',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif"
              }}
            >
              {loading === 'voice' ? 'Redirecting…' : 'Get started →'}
            </button>
          </div>

          {/* Voice + Inbox */}
          <div className="plan-card" style={{
            background: '#fff',
            borderRadius: 20,
            padding: '36px 32px',
            flex: '1 1 340px',
            maxWidth: 380,
            border: '2px solid #c9a84c',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
              background: '#c9a84c', color: '#0f1f3d', fontSize: 12, fontWeight: 700,
              padding: '4px 16px', borderRadius: 20, letterSpacing: 0.5, whiteSpace: 'nowrap'
            }}>
              MOST POPULAR
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Voice + Inbox</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
              <span style={{ fontSize: 48, fontWeight: 800, color: '#0f1f3d', letterSpacing: '-2px' }}>$349</span>
              <span style={{ fontSize: 16, color: '#64748b', fontWeight: 500 }}>/mo AUD</span>
            </div>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
              Everything in Voice, plus AI email management. Never miss a lead in your inbox either.
            </p>
            <div style={{ marginBottom: 32 }}>
              {[
                'Everything in Voice',
                'Connect your email inbox',
                'AI drafts email replies',
                'Flags urgent emails',
                'Handles routine enquiries',
                'Unified call + email logs',
                'Priority support',
              ].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', marginBottom: 10, fontSize: 14, color: '#334155' }}>
                  <span className="check">✓</span> {f}
                </div>
              ))}
            </div>
            <button
              className="plan-btn"
              onClick={() => checkout('voice_inbox')}
              disabled={!!loading}
              style={{
                width: '100%',
                background: '#c9a84c',
                color: '#0f1f3d',
                border: 'none',
                borderRadius: 10,
                padding: '14px',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif"
              }}
            >
              {loading === 'voice_inbox' ? 'Redirecting…' : 'Get started →'}
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 36 }}>
          Secured by Stripe · Cancel any time in your dashboard · Phone number deactivated on cancellation
        </p>
      </div>
    </>
  )
}

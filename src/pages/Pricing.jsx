import React, { useContext, useState } from 'react'
import { AppContext } from '../App'

const MH_PK = 'pk_live_51TWkJoEx2m1vqgKrVwXBRW4RkFGlY7DCLxVBjnGoqrTQKQTFge5FTUcLJ9JjWUydRWyBz9u3ay0xI73kVzkYf7xF001X0LyTRa'
const PRICES = {
  voice:       'price_1U3TSZEx2m1vqgKreQuXLvba',
  voice_inbox: 'price_1U3TylEx2m1vqgKrHNqOFgNk'
}

export default function Pricing() {
  const { customer } = useContext(AppContext)
  const [loading, setLoading] = useState(null)

  async function checkout(plan) {
    setLoading(plan)
    try {
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
      const { error } = await stripe.redirectToCheckout({
        lineItems: [{ price: PRICES[plan], quantity: 1 }],
        mode: 'subscription',
        successUrl: `${window.location.origin}/setup?payment=success`,
        cancelUrl: `${window.location.origin}/pricing`,
        clientReferenceId: customer?.id || '',
        customerEmail: customer?.owner_email || '',
      })
      if (error) throw new Error(error.message)
    } catch(e) {
      alert('Something went wrong: ' + e.message)
    }
    setLoading(null)
  }

  const check = (color = '#16a34a') => (
    <span style={{ color, fontWeight: 700, marginRight: 10, fontSize: 15 }}>✓</span>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .plan-card { transition: transform 0.15s, box-shadow 0.15s; }
        .plan-card:hover { transform: translateY(-3px); }
        .plan-btn { transition: opacity 0.15s; cursor: pointer; }
        .plan-btn:hover:not(:disabled) { opacity: 0.88; }
        .plan-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f1f3d 0%, #162b52 60%, #1a3366 100%)',
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: '48px 24px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            ManyHandz<span style={{ color: '#c9a84c', fontSize: 30 }}>.</span>
          </span>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#fff', marginTop: 28, marginBottom: 10, letterSpacing: '-0.5px' }}>
            Choose your plan
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, maxWidth: 400, margin: '0 auto' }}>
            No lock-in. Cancel any time.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 860, margin: '0 auto' }}>

          {/* Voice */}
          <div className="plan-card" style={{
            background: '#fff', borderRadius: 20, padding: '36px 32px',
            flex: '1 1 340px', maxWidth: 390,
            border: '2px solid transparent',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Voice Agent</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
              <span style={{ fontSize: 52, fontWeight: 800, color: '#0f1f3d', letterSpacing: '-2px' }}>$199</span>
              <span style={{ fontSize: 15, color: '#64748b' }}>/mo AUD</span>
            </div>
            <p style={{ color: '#64748b', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
              AI agent answers every call 24/7 — qualifies leads, takes messages, transfers to you.
            </p>
            <div style={{ marginBottom: 28 }}>
              {[
                'Your own AU phone number',
                'AI answers calls 24/7',
                'Lead qualification',
                'Live call transfer',
                'SMS follow-ups',
                'Call logs & transcripts',
                'Custom greeting & prompt',
              ].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', marginBottom: 9, fontSize: 13.5, color: '#334155' }}>
                  {check()} {f}
                </div>
              ))}
            </div>
            <button className="plan-btn" onClick={() => checkout('voice')} disabled={!!loading}
              style={{ width: '100%', background: '#0f1f3d', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
              {loading === 'voice' ? 'Redirecting…' : 'Get started →'}
            </button>
          </div>

          {/* Voice + Inbox */}
          <div className="plan-card" style={{
            background: '#fff', borderRadius: 20, padding: '36px 32px',
            flex: '1 1 340px', maxWidth: 390,
            border: '2px solid #c9a84c',
            boxShadow: '0 8px 40px rgba(201,168,76,0.25)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
              background: '#c9a84c', color: '#0f1f3d', fontSize: 11, fontWeight: 700,
              padding: '4px 14px', borderRadius: 20, letterSpacing: 0.5, whiteSpace: 'nowrap'
            }}>MOST POPULAR</div>

            <div style={{ fontSize: 12, fontWeight: 700, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Voice + Inbox</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
              <span style={{ fontSize: 52, fontWeight: 800, color: '#0f1f3d', letterSpacing: '-2px' }}>$299</span>
              <span style={{ fontSize: 15, color: '#64748b' }}>/mo AUD</span>
            </div>
            <p style={{ color: '#64748b', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
              Everything in Voice, plus AI email management so nothing falls through the cracks.
            </p>
            <div style={{ marginBottom: 28 }}>
              {[
                'Everything in Voice',
                'Connect Gmail or Outlook',
                'AI drafts email replies',
                'Junk filtered automatically',
                'Urgent emails flagged instantly',
                'Approve replies before sending',
                'Unified call + email dashboard',
              ].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', marginBottom: 9, fontSize: 13.5, color: '#334155' }}>
                  {check('#c9a84c')} {f}
                </div>
              ))}
            </div>
            <button className="plan-btn" onClick={() => checkout('voice_inbox')} disabled={!!loading}
              style={{ width: '100%', background: '#c9a84c', color: '#0f1f3d', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
              {loading === 'voice_inbox' ? 'Redirecting…' : 'Get started →'}
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 32 }}>
          Secured by Stripe · Cancel any time · Number deactivated on cancellation
        </p>
      </div>
    </>
  )
}

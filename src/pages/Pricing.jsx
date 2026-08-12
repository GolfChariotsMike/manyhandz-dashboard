import React, { useContext, useState } from 'react'
import { AppContext } from '../App'

const MH_PK = 'pk_live_51TWkJoEx2m1vqgKrVwXBRW4RkFGlY7DCLxVBjnGoqrTQKQTFge5FTUcLJ9JjWUydRWyBz9u3ay0xI73kVzkYf7xF001X0LyTRa'
const VOICE_PRICE = 'price_1U3TSZEx2m1vqgKreQuXLvba'

export default function Pricing() {
  const { customer } = useContext(AppContext)
  const [loading, setLoading] = useState(false)

  async function checkout() {
    setLoading(true)
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
        lineItems: [{ price: VOICE_PRICE, quantity: 1 }],
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
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .plan-btn { transition: opacity 0.15s; }
        .plan-btn:hover:not(:disabled) { opacity: 0.88; }
        .plan-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f1f3d 0%, #162b52 60%, #1a3366 100%)',
        fontFamily: "'Inter', system-ui, sans-serif",
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            ManyHandz<span style={{ color: '#c9a84c', fontSize: 30 }}>.</span>
          </span>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginTop: 28, marginBottom: 12, letterSpacing: '-0.5px' }}>
            One plan. Everything you need.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, maxWidth: 420, margin: '0 auto' }}>
            AI agent answers every call, 24/7. No lock-in — cancel any time.
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: '40px 40px',
          width: '100%',
          maxWidth: 420,
          border: '2px solid #c9a84c',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Voice Agent
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
            <span style={{ fontSize: 56, fontWeight: 800, color: '#0f1f3d', letterSpacing: '-2px' }}>$199</span>
            <span style={{ fontSize: 16, color: '#64748b', fontWeight: 500 }}>/mo AUD</span>
          </div>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
            Your own phone number. AI answers every call, qualifies leads, takes messages or transfers to you.
          </p>

          <div style={{ marginBottom: 32 }}>
            {[
              'Your own AU phone number included',
              'AI answers calls 24/7',
              'Lead qualification & discovery',
              'Live transfer to you',
              'SMS follow-ups to callers',
              'Full call logs & transcripts',
              'Customise greeting, tone & prompt',
              'Cancel any time',
            ].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', marginBottom: 11, fontSize: 14, color: '#334155' }}>
                <span style={{ color: '#16a34a', fontWeight: 700, marginRight: 10, fontSize: 15 }}>✓</span> {f}
              </div>
            ))}
          </div>

          <button
            className="plan-btn"
            onClick={checkout}
            disabled={loading}
            style={{
              width: '100%',
              background: '#c9a84c',
              color: '#0f1f3d',
              border: 'none',
              borderRadius: 10,
              padding: '15px',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '-0.2px'
            }}
          >
            {loading ? 'Redirecting to payment…' : 'Get started →'}
          </button>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 24, textAlign: 'center' }}>
          Secured by Stripe · Number deactivated on cancellation
        </p>
      </div>
    </>
  )
}

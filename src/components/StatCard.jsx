import React from 'react'

export default function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: '#13131a',
      border: '1px solid #1e1e2e',
      borderRadius: 12,
      padding: '20px 24px',
      flex: 1,
    }}>
      <div style={{ fontSize: 12, color: '#666680', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent || '#e8e8f0', lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: '#666680', marginTop: 6 }}>{sub}</div>}
    </div>
  )
}

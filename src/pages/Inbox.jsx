import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../App'

export default function Inbox() {
  const { customer } = useContext(AppContext)
  const navigate = useNavigate()

  if (!customer?.inbox_connected) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f1f3d', marginBottom: 8 }}>Inbox not connected</h2>
        <p style={{ color: '#64748b', marginBottom: 24, fontSize: 14 }}>Connect your Gmail or Outlook to let your AI agent manage emails.</p>
        <button onClick={() => navigate('/inbox/setup')}
          style={{ background: '#c9a84c', color: '#0f1f3d', border: 'none', borderRadius: 8, padding: '11px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
          Connect inbox →
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f1f3d', marginBottom: 4 }}>Inbox</h2>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
        Connected: {customer.inbox_email} ({customer.inbox_provider})
      </p>
      <div style={{ background: '#f8fafc', borderRadius: 12, padding: 40, textAlign: 'center', border: '1px dashed #e2e8f0' }}>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>Email monitoring coming soon — your inbox is connected and ready.</p>
      </div>
    </div>
  )
}

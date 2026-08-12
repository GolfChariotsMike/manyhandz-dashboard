import React, { useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { AppContext } from '../App'
import { supabase } from '../lib/supabase'

const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
)

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.15 2.18 2 2 0 012.11 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
  </svg>
)

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

const navItems = [
  { path: '/', label: 'Dashboard', icon: GridIcon, exact: true },
  { path: '/phone', label: 'Phone Agent', icon: PhoneIcon },
  { path: '/inbox', label: 'Inbox', icon: MailIcon },
]

export default function Sidebar() {
  const { customer } = useContext(AppContext)
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const plan = customer?.plan || 'Voice'
  const planIsVoicePlusInbox = plan?.toLowerCase().includes('inbox')

  return (
    <aside style={{ width: 220, background: '#13131a', borderRight: '1px solid #1e1e2e', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #1e1e2e' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Many<span style={{ color: '#D4A017' }}>Handz</span></span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px' }}>
        {navItems.map(({ path, label, icon: Icon, exact }) => (
          <NavLink
            key={path}
            to={path}
            end={exact}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              marginBottom: 2,
              color: isActive ? '#D4A017' : '#666680',
              background: isActive ? 'rgba(212,160,23,0.08)' : 'transparent',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.15s',
            })}
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: business info + logout */}
      <div style={{ padding: '16px', borderTop: '1px solid #1e1e2e' }}>
        {customer && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e8e8f0', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {customer.business_name || customer.owner_email}
            </div>
            <span style={{ fontSize: 11, background: 'rgba(212,160,23,0.15)', color: '#D4A017', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
              {planIsVoicePlusInbox ? 'Voice + Inbox' : 'Voice'}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#666680', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: '6px 0', width: '100%' }}
        >
          <LogoutIcon /> Sign out
        </button>
      </div>
    </aside>
  )
}

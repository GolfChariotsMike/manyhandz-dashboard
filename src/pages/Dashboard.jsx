import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../App'
import { supabase } from '../lib/supabase'
import StatCard from '../components/StatCard'
import ReferralWidget from '../components/ReferralWidget'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function OutcomeBadge({ outcome }) {
  const styles = {
    transferred: { background: 'rgba(74,222,128,0.1)', color: '#4ade80' },
    message: { background: 'rgba(96,165,250,0.1)', color: '#60a5fa' },
    ended: { background: 'rgba(102,102,128,0.1)', color: '#666680' },
  }
  const s = styles[outcome?.toLowerCase()] || styles.ended
  return (
    <span style={{ ...s, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, textTransform: 'capitalize' }}>
      {outcome || 'Ended'}
    </span>
  )
}

export default function Dashboard() {
  const { customer } = useContext(AppContext)
  const navigate = useNavigate()
  const [callLogs, setCallLogs] = useState([])
  const [inboxConfig, setInboxConfig] = useState(null)
  const [voiceConfig, setVoiceConfig] = useState(null)
  const [weekCalls, setWeekCalls] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!customer) return
    Promise.all([
      fetchCallLogs(),
      fetchInboxConfig(),
      fetchVoiceConfig(),
    ]).finally(() => setLoading(false))
  }, [customer])

  async function fetchCallLogs() {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data } = await supabase
      .from('mh_call_logs')
      .select('*')
      .eq('customer_id', customer.id)
      .gte('created_at', weekAgo)
      .order('created_at', { ascending: false })
      .limit(5)
    setCallLogs(data || [])
    setWeekCalls(data?.length || 0)
  }

  async function fetchInboxConfig() {
    const { data } = await supabase
      .from('mh_inbox_config')
      .select('*')
      .eq('customer_id', customer.id)
      .maybeSingle()
    setInboxConfig(data)
  }

  async function fetchVoiceConfig() {
    const { data } = await supabase
      .from('mh_voice_config')
      .select('*')
      .eq('customer_id', customer.id)
      .maybeSingle()
    setVoiceConfig(data)
  }

  const plan = customer?.plan || 'Voice'
  const businessName = customer?.business_name || 'your business'

  function formatTime(ts) {
    if (!ts) return '—'
    const d = new Date(ts)
    return d.toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  function formatDuration(s) {
    if (!s) return '—'
    const m = Math.floor(s / 60)
    const sec = s % 60
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`
  }

  if (loading) return (
    <div style={{ padding: 40, color: '#666680', fontSize: 14 }}>Loading...</div>
  )

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#e8e8f0', marginBottom: 4 }}>
          {getGreeting()}, {businessName}
        </h1>
        <p style={{ color: '#666680', fontSize: 14 }}>Here's what's happening with your AI agent.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
        <StatCard label="Calls this week" value={weekCalls} sub="Last 7 days" />
        <StatCard label="Emails handled" value={inboxConfig?.active ? '—' : 'Not connected'} sub={inboxConfig?.active ? 'Last 7 days' : 'Connect inbox to track'} />
        <StatCard label="Plan" value={plan} accent="#D4A017" />
      </div>

      {/* Status cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
        {/* Phone Agent */}
        <div style={{ flex: 1, background: '#13131a', border: '1px solid #1e1e2e', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#e8e8f0' }}>Phone Agent</span>
            <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 99, fontWeight: 600,
              background: voiceConfig ? 'rgba(74,222,128,0.1)' : 'rgba(102,102,128,0.1)',
              color: voiceConfig ? '#4ade80' : '#666680'
            }}>
              {voiceConfig ? 'Active' : 'Not configured'}
            </span>
          </div>
          <p style={{ color: '#666680', fontSize: 13 }}>
            {voiceConfig ? `Greeting: "${voiceConfig.greeting?.slice(0, 60)}..."` : 'Set up your agent greeting and instructions.'}
          </p>
          <button onClick={() => navigate('/phone')} style={{ marginTop: 14, background: 'none', border: '1px solid #1e1e2e', borderRadius: 8, padding: '7px 14px', color: '#666680', fontSize: 13, cursor: 'pointer' }}>
            Configure →
          </button>
        </div>

        {/* Inbox */}
        <div style={{ flex: 1, background: '#13131a', border: '1px solid #1e1e2e', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#e8e8f0' }}>AI Inbox</span>
            <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 99, fontWeight: 600,
              background: inboxConfig?.active ? 'rgba(74,222,128,0.1)' : 'rgba(102,102,128,0.1)',
              color: inboxConfig?.active ? '#4ade80' : '#666680'
            }}>
              {inboxConfig?.active ? 'Connected' : 'Not connected'}
            </span>
          </div>
          <p style={{ color: '#666680', fontSize: 13 }}>
            {inboxConfig?.active ? `${inboxConfig.email_address} • ${inboxConfig.auto_draft ? 'Auto-draft on' : 'Manual mode'}` : 'Connect your email inbox to enable AI replies.'}
          </p>
          <button onClick={() => navigate('/inbox')} style={{ marginTop: 14, background: 'none', border: '1px solid #1e1e2e', borderRadius: 8, padding: '7px 14px', color: '#666680', fontSize: 13, cursor: 'pointer' }}>
            {inboxConfig?.active ? 'Manage →' : 'Connect →'}
          </button>
        </div>
      </div>

      {/* Recent calls */}
      <div style={{ marginBottom: 28 }}>
        <ReferralWidget customer={customer} />
      </div>

      <div style={{ background: '#13131a', border: '1px solid #1e1e2e', borderRadius: 12, padding: '20px 24px' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#e8e8f0', marginBottom: 16 }}>Recent Calls</div>
        {callLogs.length === 0 ? (
          <div style={{ color: '#666680', fontSize: 14, padding: '20px 0', textAlign: 'center' }}>No calls yet — your agent is ready and waiting.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Caller', 'Time', 'Duration', 'Outcome'].map(h => (
                  <th key={h} style={{ textAlign: 'left', color: '#666680', fontSize: 12, fontWeight: 500, padding: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {callLogs.map(call => (
                <tr key={call.id} style={{ borderTop: '1px solid #1e1e2e' }}>
                  <td style={{ padding: '12px 0', fontSize: 14, color: '#e8e8f0' }}>{call.from_number || 'Unknown'}</td>
                  <td style={{ padding: '12px 0', fontSize: 13, color: '#666680' }}>{formatTime(call.created_at)}</td>
                  <td style={{ padding: '12px 0', fontSize: 13, color: '#666680' }}>{formatDuration(call.duration_seconds)}</td>
                  <td style={{ padding: '12px 0' }}><OutcomeBadge outcome={call.outcome} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

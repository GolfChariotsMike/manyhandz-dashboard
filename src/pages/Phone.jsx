import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../App'
import { supabase } from '../lib/supabase'

function OutcomeBadge({ outcome }) {
  const map = {
    transferred: { bg: 'rgba(74,222,128,0.1)', color: '#4ade80' },
    message: { bg: 'rgba(96,165,250,0.1)', color: '#60a5fa' },
    ended: { bg: 'rgba(102,102,128,0.1)', color: '#666680' },
  }
  const s = map[outcome?.toLowerCase()] || map.ended
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, textTransform: 'capitalize' }}>
      {outcome || 'Ended'}
    </span>
  )
}

export default function Phone() {
  const { customer } = useContext(AppContext)
  const [config, setConfig] = useState({ greeting: '', sign_off: '', system_prompt: '' })
  const [callLogs, setCallLogs] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 20

  useEffect(() => {
    if (!customer) return
    Promise.all([fetchConfig(), fetchCallLogs()]).finally(() => setLoading(false))
  }, [customer])

  async function fetchConfig() {
    const { data } = await supabase
      .from('mh_voice_config')
      .select('*')
      .eq('customer_id', customer.id)
      .maybeSingle()
    if (data) setConfig({ greeting: data.greeting || '', sign_off: data.sign_off || '', system_prompt: data.system_prompt || '' })
  }

  async function fetchCallLogs() {
    const { data } = await supabase
      .from('mh_call_logs')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
    setCallLogs(data || [])
  }

  async function handleSave() {
    setSaving(true)
    const payload = { ...config, customer_id: customer.id, updated_at: new Date().toISOString() }
    const { data: existing } = await supabase
      .from('mh_voice_config')
      .select('id')
      .eq('customer_id', customer.id)
      .maybeSingle()

    if (existing) {
      await supabase.from('mh_voice_config').update(payload).eq('customer_id', customer.id)
    } else {
      await supabase.from('mh_voice_config').insert(payload)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function formatTime(ts) {
    if (!ts) return '—'
    return new Date(ts).toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  function formatDuration(s) {
    if (!s) return '—'
    const m = Math.floor(s / 60); const sec = s % 60
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`
  }

  const inputStyle = {
    width: '100%',
    background: '#0D0D12',
    border: '1px solid #1e1e2e',
    borderRadius: 8,
    padding: '10px 14px',
    color: '#e8e8f0',
    fontSize: 14,
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  }
  const labelStyle = { display: 'block', fontSize: 13, color: '#666680', fontWeight: 500, marginBottom: 6 }

  if (loading) return <div style={{ padding: 40, color: '#666680', fontSize: 14 }}>Loading...</div>

  return (
    <div style={{ padding: '32px 40px', maxWidth: 900 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e8e8f0', marginBottom: 4 }}>Phone Agent</h1>
        <p style={{ color: '#666680', fontSize: 14 }}>Configure how your AI agent handles incoming calls.</p>
      </div>

      {/* Agent Settings */}
      <div style={{ background: '#13131a', border: '1px solid #1e1e2e', borderRadius: 12, padding: '24px', marginBottom: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#e8e8f0', marginBottom: 20 }}>Agent Settings</div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Greeting <span style={{ color: '#444460', fontWeight: 400 }}>— what the AI says when it picks up</span></label>
          <textarea
            rows={3}
            value={config.greeting}
            onChange={e => setConfig(c => ({ ...c, greeting: e.target.value }))}
            placeholder="Hi, thanks for calling [Business Name]! I'm an AI assistant — how can I help you today?"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Sign-off <span style={{ color: '#444460', fontWeight: 400 }}>— closing message before hanging up</span></label>
          <input
            type="text"
            value={config.sign_off}
            onChange={e => setConfig(c => ({ ...c, sign_off: e.target.value }))}
            placeholder="Is there anything else I can help with? Thanks for calling — have a great day!"
            style={{ ...inputStyle, resize: undefined }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>System Prompt <span style={{ color: '#444460', fontWeight: 400 }}>— full instructions for how the agent should behave</span></label>
          <textarea
            rows={10}
            value={config.system_prompt}
            onChange={e => setConfig(c => ({ ...c, system_prompt: e.target.value }))}
            placeholder="You are a helpful phone agent for [Business Name]...&#10;&#10;Your job is to...&#10;&#10;If asked about pricing, say...&#10;&#10;If the caller needs urgent help, transfer them to the team."
            style={{ ...inputStyle, minHeight: 200 }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: saving ? '#333' : '#D4A017',
              color: '#0D0D12',
              border: 'none',
              borderRadius: 8,
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {saved && <span style={{ color: '#4ade80', fontSize: 13 }}>✓ Saved — changes live within 60 seconds</span>}
          {!saved && <span style={{ color: '#444460', fontSize: 12 }}>Changes go live within 60 seconds</span>}
        </div>
      </div>

      {/* Call Logs */}
      <div style={{ background: '#13131a', border: '1px solid #1e1e2e', borderRadius: 12, padding: '24px' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#e8e8f0', marginBottom: 16 }}>Call Logs</div>

        {callLogs.length === 0 ? (
          <div style={{ color: '#666680', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>No calls recorded yet.</div>
        ) : (
          callLogs.map(call => (
            <div key={call.id} style={{ borderTop: '1px solid #1e1e2e' }}>
              {/* Row */}
              <div
                onClick={() => setExpanded(expanded === call.id ? null : call.id)}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 110px 60px', gap: 12, padding: '14px 0', cursor: 'pointer', alignItems: 'center' }}
              >
                <span style={{ fontSize: 14, color: '#e8e8f0' }}>{call.from_number || 'Unknown'}</span>
                <span style={{ fontSize: 13, color: '#666680' }}>{formatTime(call.created_at)}</span>
                <span style={{ fontSize: 13, color: '#666680' }}>{formatDuration(call.duration_seconds)}</span>
                <OutcomeBadge outcome={call.outcome} />
                <span style={{ fontSize: 12, color: '#444460', textAlign: 'right' }}>{expanded === call.id ? '▲' : '▼'}</span>
              </div>

              {/* Expanded transcript */}
              {expanded === call.id && (
                <div style={{ background: '#0D0D12', borderRadius: 8, padding: 16, marginBottom: 12, maxHeight: 320, overflowY: 'auto' }}>
                  {call.message_summary && (
                    <div style={{ marginBottom: 12, padding: '10px 14px', background: 'rgba(212,160,23,0.08)', borderRadius: 8, border: '1px solid rgba(212,160,23,0.2)' }}>
                      <div style={{ fontSize: 11, color: '#D4A017', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Summary</div>
                      <div style={{ fontSize: 13, color: '#e8e8f0' }}>{call.message_summary}</div>
                    </div>
                  )}
                  {Array.isArray(call.transcript) && call.transcript.length > 0 ? (
                    call.transcript.map((turn, i) => (
                      <div key={i} style={{ marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: turn.role === 'assistant' ? '#D4A017' : '#60a5fa', marginRight: 8 }}>
                          {turn.role === 'assistant' ? 'Agent' : 'Caller'}
                        </span>
                        <span style={{ fontSize: 13, color: '#e8e8f0' }}>{turn.content}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#444460', fontSize: 13 }}>No transcript available.</div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

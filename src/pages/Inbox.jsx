import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../App'
import { supabase } from '../lib/supabase'

function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 99,
        background: checked ? '#D4A017' : '#1e1e2e',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 3,
        left: checked ? 23 : 3,
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: '#e8e8f0',
        transition: 'left 0.2s',
      }} />
    </div>
  )
}

export default function Inbox() {
  const { customer } = useContext(AppContext)
  const [config, setConfig] = useState(null)
  const [form, setForm] = useState({ auto_draft: true, auto_reply: false, reply_instructions: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!customer) return
    fetchConfig().finally(() => setLoading(false))
  }, [customer])

  async function fetchConfig() {
    const { data } = await supabase
      .from('mh_inbox_config')
      .select('*')
      .eq('customer_id', customer.id)
      .maybeSingle()
    setConfig(data)
    if (data) setForm({
      auto_draft: data.auto_draft ?? true,
      auto_reply: data.auto_reply ?? false,
      reply_instructions: data.reply_instructions || '',
    })
  }

  async function handleSave() {
    setSaving(true)
    const payload = {
      customer_id: customer.id,
      auto_draft: form.auto_draft,
      auto_reply: form.auto_reply,
      reply_instructions: form.reply_instructions,
      updated_at: new Date().toISOString(),
    }
    if (config) {
      await supabase.from('mh_inbox_config').update(payload).eq('customer_id', customer.id)
    } else {
      await supabase.from('mh_inbox_config').insert(payload)
    }
    await fetchConfig()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
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

  if (loading) return <div style={{ padding: 40, color: '#666680', fontSize: 14 }}>Loading...</div>

  const isConnected = config?.active

  return (
    <div style={{ padding: '32px 40px', maxWidth: 800 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e8e8f0', marginBottom: 4 }}>AI Inbox</h1>
        <p style={{ color: '#666680', fontSize: 14 }}>Connect your email so your AI agent can handle replies.</p>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#13131a', border: '1px solid #1e1e2e', borderRadius: 10, padding: '12px 20px', fontSize: 14, color: '#e8e8f0', zIndex: 999, boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
          {toast}
        </div>
      )}

      {!isConnected ? (
        /* Not connected state */
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          <div style={{ background: '#13131a', border: '1px solid #1e1e2e', borderRadius: 16, padding: '40px 48px', textAlign: 'center', maxWidth: 420 }}>
            <div style={{ width: 56, height: 56, background: 'rgba(212,160,23,0.1)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 24 }}>📬</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e8e8f0', marginBottom: 8 }}>Connect your inbox</h2>
            <p style={{ color: '#666680', fontSize: 14, marginBottom: 28, lineHeight: 1.5 }}>
              Let your AI agent read, draft, and send email replies on your behalf. Connect your email to get started.
            </p>
            <button
              onClick={() => showToast('Coming soon — we\'ll set this up for you. Contact your account manager.')}
              style={{ width: '100%', background: '#D4A017', color: '#0D0D12', border: 'none', borderRadius: 8, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 12 }}
            >
              Connect Gmail
            </button>
            <button
              onClick={() => showToast('Contact your ManyHandz account manager and we\'ll configure IMAP for you.')}
              style={{ width: '100%', background: 'none', color: '#666680', border: '1px solid #1e1e2e', borderRadius: 8, padding: '11px', fontSize: 14, cursor: 'pointer' }}
            >
              I use something else
            </button>
          </div>
        </div>
      ) : (
        /* Connected state */
        <>
          {/* Connection info */}
          <div style={{ background: '#13131a', border: '1px solid #1e1e2e', borderRadius: 12, padding: '20px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 40, height: 40, background: 'rgba(74,222,128,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✉️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#e8e8f0' }}>{config.email_address}</div>
              <div style={{ fontSize: 12, color: '#666680', marginTop: 2 }}>
                Connected via {config.provider || 'Gmail'} · {config.connected_at ? new Date(config.connected_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
              </div>
            </div>
            <span style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 99 }}>Active</span>
          </div>

          {/* Settings */}
          <div style={{ background: '#13131a', border: '1px solid #1e1e2e', borderRadius: 12, padding: '24px' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#e8e8f0', marginBottom: 20 }}>Settings</div>

            {/* Auto-draft toggle */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #1e1e2e' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e8e8f0', marginBottom: 4 }}>AI Auto-Draft</div>
                <div style={{ fontSize: 13, color: '#666680', lineHeight: 1.4 }}>AI drafts replies automatically — you review before sending.</div>
              </div>
              <Toggle checked={form.auto_draft} onChange={v => setForm(f => ({ ...f, auto_draft: v }))} />
            </div>

            {/* Auto-reply toggle */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #1e1e2e' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e8e8f0', marginBottom: 4 }}>AI Auto-Reply</div>
                <div style={{ fontSize: 13, color: '#666680', lineHeight: 1.4 }}>AI sends replies automatically without review. <span style={{ color: '#f87171' }}>Use with care.</span></div>
              </div>
              <Toggle checked={form.auto_reply} onChange={v => setForm(f => ({ ...f, auto_reply: v }))} />
            </div>

            {/* Reply instructions */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#666680', fontWeight: 500, marginBottom: 6 }}>Reply Instructions</label>
              <textarea
                rows={5}
                value={form.reply_instructions}
                onChange={e => setForm(f => ({ ...f, reply_instructions: e.target.value }))}
                placeholder="How should the AI handle emails? What tone? What to prioritise?&#10;&#10;E.g. Reply professionally and warmly. Prioritise quote requests and complaints. Offer to call back for complex issues. Don't discuss pricing — say we'll provide a custom quote."
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ background: saving ? '#333' : '#D4A017', color: '#0D0D12', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
              {saved && <span style={{ color: '#4ade80', fontSize: 13 }}>✓ Saved</span>}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

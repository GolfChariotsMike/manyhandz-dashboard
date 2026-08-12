import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function ReferralWidget({ customer }) {
  const [referralCount, setReferralCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [cashoutRequested, setCashoutRequested] = useState(customer?.referral_cashout_requested || false);

  const referralCode = customer?.referral_code;
  const referralLink = `https://manyhandz.ai/signup?ref=${referralCode}`;
  const creditPerReferral = 20;
  const totalCredit = referralCount * creditPerReferral;
  const accumulatedCredit = customer?.referral_credit_usd || 0;

  useEffect(() => {
    if (!referralCode) return;
    supabase
      .from('mh_customers')
      .select('id', { count: 'exact', head: true })
      .eq('referred_by', referralCode)
      .eq('plan_status', 'active')
      .then(({ count }) => setReferralCount(count || 0));
  }, [referralCode]);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const requestCashout = async () => {
    await supabase
      .from('mh_customers')
      .update({ referral_cashout_requested: true })
      .eq('id', customer.id);
    setCashoutRequested(true);
  };

  return (
    <div style={{
      background: '#13131a',
      border: '1px solid #2a2a3a',
      borderRadius: 12,
      padding: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>🤝</span>
        <h3 style={{ color: '#fff', margin: 0, fontSize: 16, fontWeight: 600 }}>Refer & Earn</h3>
      </div>

      <p style={{ color: '#888', fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
        Every business you refer that stays active knocks <strong style={{ color: '#D4A017' }}>$20/month</strong> off your bill. No limit — refer enough and we'll be paying you.
      </p>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, background: '#0D0D12', borderRadius: 8, padding: '12px 16px', textAlign: 'center' }}>
          <div style={{ color: '#D4A017', fontSize: 24, fontWeight: 700 }}>{referralCount}</div>
          <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>Active referrals</div>
        </div>
        <div style={{ flex: 1, background: '#0D0D12', borderRadius: 8, padding: '12px 16px', textAlign: 'center' }}>
          <div style={{ color: '#D4A017', fontSize: 24, fontWeight: 700 }}>${totalCredit}</div>
          <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>Saved this month</div>
        </div>
        <div style={{ flex: 1, background: '#0D0D12', borderRadius: 8, padding: '12px 16px', textAlign: 'center' }}>
          <div style={{ color: '#D4A017', fontSize: 24, fontWeight: 700 }}>${accumulatedCredit.toFixed(0)}</div>
          <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>Total earned</div>
        </div>
      </div>

      {/* Referral link */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          readOnly
          value={referralLink}
          style={{
            flex: 1, background: '#0D0D12', border: '1px solid #2a2a3a',
            borderRadius: 8, padding: '10px 14px', color: '#ccc', fontSize: 13,
            fontFamily: 'monospace',
          }}
        />
        <button onClick={copyLink} style={{
          background: copied ? '#22c55e22' : '#D4A01722',
          border: `1px solid ${copied ? '#22c55e' : '#D4A017'}`,
          color: copied ? '#22c55e' : '#D4A017',
          borderRadius: 8, padding: '10px 16px', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
        }}>
          {copied ? '✓ Copied' : 'Copy link'}
        </button>
      </div>

      {/* Cashout */}
      {accumulatedCredit > 0 && (
        <div style={{ borderTop: '1px solid #2a2a3a', paddingTop: 16, marginTop: 4 }}>
          {cashoutRequested ? (
            <p style={{ color: '#22c55e', fontSize: 13, margin: 0 }}>
              ✓ Cashout requested — we'll be in touch within 2 business days.
            </p>
          ) : (
            <button onClick={requestCashout} style={{
              background: 'transparent', border: '1px solid #444',
              color: '#888', borderRadius: 8, padding: '8px 14px',
              cursor: 'pointer', fontSize: 13,
            }}>
              Request cashout (${accumulatedCredit.toFixed(0)} AUD)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

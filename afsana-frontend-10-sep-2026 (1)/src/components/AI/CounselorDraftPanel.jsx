import React, { useState } from 'react';
import BASE_URL from '../../Config';

const INTENTS = ['Follow Up', 'Appointment Reminder', 'Document Request', 'Offer Letter Update', 'Visa Advice', 'General Enquiry'];
const CHANNELS = ['whatsapp', 'email'];

const CounselorDraftPanel = ({ lead }) => {
  const [intent, setIntent] = useState('Follow Up');
  const [channel, setChannel] = useState('whatsapp');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateDraft = async () => {
    if (!lead?.id) return;
    setLoading(true);
    setError(null);
    setDraft('');
    try {
      const res = await fetch(`${BASE_URL}ai/counselor/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: lead.id, intent, channel }),
      });
      const data = await res.json();
      if (data.success && (data.draft || data.message)) {
        setDraft(data.draft || data.message);
      } else {
        setError(data.message || 'Draft generation failed');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyDraft = () => {
    if (!draft) return;
    navigator.clipboard.writeText(draft).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ border: '1.5px solid #e0e7ff', borderRadius: 14, padding: '18px 20px', marginBottom: 16, background: '#fafbff' }}>
      <h4 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#1e293b' }}>✍️ AI Message Draft Generator</h4>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        {/* Channel Selector */}
        <div style={{ display: 'flex', background: '#e0e7ff', borderRadius: 20, padding: 2, gap: 2 }}>
          {CHANNELS.map(ch => (
            <button key={ch} onClick={() => setChannel(ch)} style={{
              background: channel === ch ? '#6366f1' : 'transparent',
              color: channel === ch ? '#fff' : '#4f46e5',
              border: 'none', borderRadius: 18, padding: '5px 12px',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {ch === 'whatsapp' ? '💬 WhatsApp' : '📧 Email'}
            </button>
          ))}
        </div>

        {/* Intent Selector */}
        <select
          value={intent}
          onChange={e => setIntent(e.target.value)}
          style={{
            flex: 1, minWidth: 150,
            border: '1.5px solid #e0e7ff', borderRadius: 20,
            padding: '5px 12px', fontSize: 12, color: '#1e293b',
            background: '#fff', outline: 'none', cursor: 'pointer',
          }}
        >
          {INTENTS.map(i => <option key={i}>{i}</option>)}
        </select>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateDraft}
        disabled={loading || !lead?.id}
        style={{
          width: '100%',
          background: loading ? '#e2e8f0' : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
          color: loading ? '#94a3b8' : '#fff',
          border: 'none', borderRadius: 10, padding: '10px',
          fontSize: 13, fontWeight: 600, cursor: loading ? 'default' : 'pointer', marginBottom: 12,
        }}
      >
        {loading ? '⏳ Generating Draft...' : '✨ Generate Draft'}
      </button>

      {error && <p style={{ color: '#ef4444', fontSize: 12, margin: '0 0 10px' }}>⚠️ {error}</p>}

      {/* Draft Output */}
      {draft && (
        <div>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={6}
            style={{
              width: '100%', border: '1.5px solid #c7d2fe', borderRadius: 10,
              padding: '10px 12px', fontSize: 12.5, lineHeight: 1.6,
              color: '#1e293b', background: '#fff', outline: 'none', resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={copyDraft}
            style={{
              marginTop: 8, background: copied ? '#10b981' : '#f1f5f9',
              color: copied ? '#fff' : '#475569',
              border: 'none', borderRadius: 8, padding: '7px 14px',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {copied ? '✅ Copied!' : '📋 Copy to Clipboard'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CounselorDraftPanel;

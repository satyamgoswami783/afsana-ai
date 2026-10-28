import React, { useState } from 'react';
import BASE_URL from '../../Config';

const ScoreColors = {
  hot:  { bg: '#fef2f2', border: '#ef4444', text: '#dc2626', label: '🔴 Hot Lead', bar: '#ef4444' },
  warm: { bg: '#fffbeb', border: '#f59e0b', text: '#d97706', label: '🟡 Warm Lead', bar: '#f59e0b' },
  cold: { bg: '#f0f9ff', border: '#3b82f6', text: '#2563eb', label: '🔵 Cold Lead', bar: '#3b82f6' },
};

const AIScoreCard = ({ leadId, initialScore = null, initialSummary = null }) => {
  const [score, setScore] = useState(initialScore);
  const [summary, setSummary] = useState(initialSummary);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const getCategory = (s) => {
    if (!s && s !== 0) return null;
    if (s >= 75) return 'hot';
    if (s >= 45) return 'warm';
    return 'cold';
  };

  const triggerScoring = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}inquiries/${leadId}/ai-score`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setScore(data.score);
        setSummary(data.details?.summary || null);
      } else {
        setError(data.message || 'AI scoring failed');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetch(`${BASE_URL}inquiries/${leadId}/ai-score/history`);
      const data = await res.json();
      if (data.success) setHistory(data.history || []);
      setShowHistory(!showHistory);
    } catch { setShowHistory(!showHistory); }
  };

  const cat = getCategory(score);
  const col = cat ? ScoreColors[cat] : null;

  return (
    <div style={{
      border: `1.5px solid ${col ? col.border : '#e2e8f0'}`,
      borderRadius: 14,
      background: col ? col.bg : '#f8faff',
      padding: '18px 20px',
      marginBottom: 16,
      transition: 'all 0.3s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
          🤖 AI Lead Score
        </h4>
        <button
          onClick={triggerScoring}
          disabled={loading}
          style={{
            background: loading ? '#e2e8f0' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: loading ? '#94a3b8' : '#fff',
            border: 'none',
            borderRadius: 20,
            padding: '6px 14px',
            fontSize: 12,
            fontWeight: 600,
            cursor: loading ? 'default' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {loading ? '⏳ Analyzing...' : '🔄 Refresh Score'}
        </button>
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: 12, margin: '0 0 10px' }}>⚠️ {error}</p>}

      {score !== null ? (
        <>
          {/* Score Display */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: col.bar, color: '#fff',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 800, boxShadow: `0 4px 16px ${col.bar}50`,
              flexShrink: 0,
            }}>
              {score}
              <span style={{ fontSize: 9, fontWeight: 500, opacity: 0.85 }}>/ 100</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: col.text, marginBottom: 6 }}>{col.label}</div>
              {/* Score Bar */}
              <div style={{ height: 6, background: '#e2e8f0', borderRadius: 6 }}>
                <div style={{ height: '100%', width: `${score}%`, background: col.bar, borderRadius: 6, transition: 'width 0.8s ease' }} />
              </div>
            </div>
          </div>

          {/* Summary */}
          {summary && (
            <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.55, margin: '0 0 10px', padding: '8px 12px', background: 'rgba(255,255,255,0.7)', borderRadius: 8, borderLeft: `3px solid ${col.bar}` }}>
              {summary}
            </p>
          )}

          {/* History toggle */}
          <button onClick={loadHistory} style={{ fontSize: 11.5, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 500 }}>
            {showHistory ? '▲ Hide History' : '▼ Score History'}
          </button>
          {showHistory && history.length > 0 && (
            <div style={{ marginTop: 8, fontSize: 11.5, color: '#64748b' }}>
              {history.slice(0, 3).map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span>Score: <strong>{h.score}</strong> ({h.category})</span>
                  <span>{new Date(h.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '12px 0', color: '#94a3b8', fontSize: 13 }}>
          No score yet. Click <strong>Refresh Score</strong> to generate AI analysis.
        </div>
      )}
    </div>
  );
};

export default AIScoreCard;

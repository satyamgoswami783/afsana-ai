import React, { useState } from 'react';
import BASE_URL from '../../Config';

const RISK_CONFIG = {
  low:    { color: '#10b981', bg: '#f0fdf4', border: '#86efac', icon: '🟢', label: 'Low Risk' },
  medium: { color: '#f59e0b', bg: '#fffbeb', border: '#fcd34d', icon: '🟡', label: 'Medium Risk' },
  high:   { color: '#ef4444', bg: '#fef2f2', border: '#fca5a5', icon: '🔴', label: 'High Risk' },
};

const VisaRiskBadge = ({ lead }) => {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeRisk = async () => {
    if (!lead?.id || !lead?.country) {
      setError('Lead must have a target country selected.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}ai/visa/analyze/${lead.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: lead.country }),
      });
      const data = await res.json();
      if (data.success) {
        setRiskData(data);
      } else {
        setError(data.message || 'Visa risk analysis failed');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cfg = riskData?.risk_level ? RISK_CONFIG[riskData.risk_level.toLowerCase()] || RISK_CONFIG.medium : null;

  return (
    <div style={{ border: '1.5px solid #e0e7ff', borderRadius: 14, padding: '18px 20px', marginBottom: 16, background: '#fafbff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1e293b' }}>🛂 Visa Risk Analysis</h4>
        <button
          onClick={analyzeRisk}
          disabled={loading}
          style={{
            background: loading ? '#e2e8f0' : 'linear-gradient(135deg, #f59e0b, #ef4444)',
            color: loading ? '#94a3b8' : '#fff',
            border: 'none', borderRadius: 20, padding: '6px 14px',
            fontSize: 12, fontWeight: 600, cursor: loading ? 'default' : 'pointer',
          }}
        >
          {loading ? '⏳ Analyzing...' : riskData ? '🔄 Re-analyze' : '🔍 Analyze Risk'}
        </button>
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: 12, margin: '0 0 8px' }}>⚠️ {error}</p>}

      {!riskData && !loading && (
        <p style={{ color: '#94a3b8', fontSize: 12.5, textAlign: 'center', padding: '10px 0', margin: 0 }}>
          {lead?.country
            ? `Click "Analyze Risk" to assess visa risk for ${lead.country}.`
            : 'Please set a target country for this lead first.'}
        </p>
      )}

      {riskData && cfg && (
        <div>
          {/* Risk Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: cfg.bg, border: `1.5px solid ${cfg.border}`,
            borderRadius: 24, padding: '8px 16px', marginBottom: 12,
          }}>
            <span style={{ fontSize: 18 }}>{cfg.icon}</span>
            <span style={{ fontWeight: 700, fontSize: 14, color: cfg.color }}>{cfg.label}</span>
            {riskData.risk_score !== undefined && (
              <span style={{ fontSize: 12, color: '#64748b', marginLeft: 4 }}>({riskData.risk_score}/10)</span>
            )}
          </div>

          {/* Risk Summary */}
          {riskData.summary && (
            <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.55, margin: '0 0 10px', padding: '8px 12px', background: '#fff', borderRadius: 8, borderLeft: `3px solid ${cfg.color}` }}>
              {riskData.summary}
            </p>
          )}

          {/* Red Flags */}
          {riskData.red_flags && riskData.red_flags.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#ef4444', margin: '0 0 6px' }}>⚠️ Risk Factors:</p>
              {riskData.red_flags.map((f, i) => (
                <div key={i} style={{ fontSize: 12, color: '#64748b', padding: '3px 0 3px 12px', borderLeft: '2px solid #fca5a5' }}>
                  • {f}
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {riskData.recommendations && riskData.recommendations.length > 0 && (
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#10b981', margin: '0 0 6px' }}>✅ Recommendations:</p>
              {riskData.recommendations.map((r, i) => (
                <div key={i} style={{ fontSize: 12, color: '#64748b', padding: '3px 0 3px 12px', borderLeft: '2px solid #86efac' }}>
                  • {r}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VisaRiskBadge;

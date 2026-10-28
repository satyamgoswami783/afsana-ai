import React, { useState } from 'react';
import BASE_URL from '../../Config';

const CountryRecommendation = ({ lead }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetched, setFetched] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use lead-based recommendation endpoint if lead has id
      const endpoint = lead?.id
        ? `${BASE_URL}ai/recommend/countries-from-lead/${lead.id}`
        : `${BASE_URL}ai/recommend/countries`;

      const body = lead?.id
        ? undefined
        : JSON.stringify({
            profile: {
              education_level: lead?.study_level,
              ielts_overall: lead?.overall_score,
              budget: lead?.budget,
              preferred_country: lead?.country,
              study_gap: lead?.study_gap,
              name: lead?.full_name,
            }
          });

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      const data = await res.json();
      if (data.success && data.recommendations) {
        setRecommendations(data.recommendations);
        setFetched(true);
      } else if (data.success) {
        // Fallback: response came from AI text
        setRecommendations([{ country: 'See AI Analysis', reason: data.analysis || data.message }]);
        setFetched(true);
      } else {
        setError(data.message || 'Failed to get recommendations');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const flagEmoji = (country) => {
    const flags = { Australia: '🇦🇺', UK: '🇬🇧', Canada: '🇨🇦', USA: '🇺🇸', Germany: '🇩🇪', Malaysia: '🇲🇾', Hungary: '🇭🇺' };
    return flags[country] || '🌍';
  };

  return (
    <div style={{ border: '1.5px solid #e0e7ff', borderRadius: 14, padding: '18px 20px', marginBottom: 16, background: '#fafbff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1e293b' }}>🌍 AI Country Recommendations</h4>
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          style={{
            background: loading ? '#e2e8f0' : 'linear-gradient(135deg, #06b6d4, #6366f1)',
            color: loading ? '#94a3b8' : '#fff',
            border: 'none', borderRadius: 20, padding: '6px 14px',
            fontSize: 12, fontWeight: 600, cursor: loading ? 'default' : 'pointer',
          }}
        >
          {loading ? '⏳ Analyzing...' : fetched ? '🔄 Refresh' : '✨ Get Suggestions'}
        </button>
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: 12, margin: '0 0 8px' }}>⚠️ {error}</p>}

      {!fetched && !loading && (
        <p style={{ color: '#94a3b8', fontSize: 12.5, textAlign: 'center', padding: '10px 0', margin: 0 }}>
          Click "Get Suggestions" to get AI-powered country recommendations for this student.
        </p>
      )}

      {recommendations.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          {recommendations.slice(0, 5).map((rec, i) => (
            <div key={i} style={{
              background: '#fff',
              border: '1px solid #e0e7ff',
              borderRadius: 10,
              padding: '10px 14px',
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{flagEmoji(rec.country || rec.name)}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 3 }}>
                  {rec.country || rec.name}
                  {rec.match_score && <span style={{ marginLeft: 8, fontSize: 11, color: '#6366f1', background: '#e0e7ff', padding: '1px 6px', borderRadius: 10 }}>{rec.match_score}% match</span>}
                </div>
                {rec.reason && <div style={{ fontSize: 11.5, color: '#64748b', lineHeight: 1.45 }}>{rec.reason}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CountryRecommendation;

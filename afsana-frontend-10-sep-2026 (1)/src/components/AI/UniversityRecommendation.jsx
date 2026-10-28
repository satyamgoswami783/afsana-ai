import React, { useState, useEffect } from 'react';
import BASE_URL from '../../Config';

const UniversityRecommendation = ({ studentProfile }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (studentProfile) {
      fetchRecommendations();
    }
  }, [studentProfile]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');
    try {
      // Mocking the call structure similar to countries
      const response = await fetch(`${BASE_URL}aichat/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Suggest 3 universities in ${studentProfile.country || studentProfile.preferred_country || 'any top destination'} suitable for a student with education level: ${studentProfile.study_level}, IELTS: ${studentProfile.ielts_score}, and Budget: ${studentProfile.budget}. Provide a JSON array with objects containing 'name' and 'reason'.`,
          conversationHistory: []
        }),
      });
      const data = await response.json();
      
      // Parse the reply to get JSON
      if (data.success && data.reply) {
        try {
          const parsed = JSON.parse(data.reply.replace(/```json|```/g, '').trim());
          setRecommendations(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          // Fallback if AI didn't return proper JSON
          setRecommendations([{ name: "AI Suggestion", reason: data.reply }]);
        }
      }
    } catch (err) {
      setError('Failed to load recommendations.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-muted"><i className="fa-solid fa-spinner fa-spin me-2"></i>Loading universities...</div>;
  if (error) return <div className="text-danger">{error}</div>;
  if (!recommendations.length) return <div className="text-muted">No specific university recommendations available.</div>;

  return (
    <div className="card shadow-sm border-0 mb-3">
      <div className="card-header bg-light border-bottom-0 py-2">
        <h6 className="mb-0"><i className="fa-solid fa-building-columns text-primary me-2"></i>AI University Recommendations</h6>
      </div>
      <div className="card-body p-0">
        <ul className="list-group list-group-flush">
          {recommendations.map((uni, idx) => (
            <li key={idx} className="list-group-item px-3 py-2 border-bottom-0">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="mb-1 text-dark fw-bold">{uni.name}</h6>
                  <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>{uni.reason}</p>
                </div>
                <span className="badge bg-success rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>Suggested</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UniversityRecommendation;

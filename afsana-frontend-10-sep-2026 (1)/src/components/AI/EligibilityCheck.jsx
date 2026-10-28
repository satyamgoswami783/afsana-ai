import React, { useState, useEffect } from 'react';
import api from '../../interceptors/axiosInterceptor';
import BASE_URL from '../../Config';

const EligibilityCheck = ({ userData, onNext, onCancel }) => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const checkEligibility = async () => {
      try {
        const response = await api.post(`${BASE_URL}ai/eligibility`, userData);
        if (response.data && response.data.success) {
          setResult({
            score: response.data.score,
            status: response.data.eligible ? 'High' : 'Moderate',
            message: response.data.message,
            insights: response.data.insights || []
          });
        }
      } catch (error) {
        console.error("Error fetching AI eligibility:", error);
        setResult({
            score: 50,
            status: 'Moderate',
            message: "Unable to process eligibility at this time.",
            insights: ["Please try again later or contact our support."]
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (userData) {
      checkEligibility();
    }
  }, [userData]);

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="spinner-border text-primary spinner-border-sm mb-2" role="status"></div>
        <p className="mb-0 text-muted small">AI is analyzing your profile...</p>
      </div>
    );
  }

  return (
    <div className="eligibility-check p-3">
      <h6 className="mb-3 text-primary"><i className="fa-solid fa-clipboard-check me-2"></i>Eligibility Result</h6>
      
      <div className={`alert ${result.status === 'High' ? 'alert-success' : 'alert-warning'} py-2 px-3 mb-3`}>
        <div className="d-flex align-items-center mb-1">
          <i className={`fa-solid ${result.status === 'High' ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
          <strong>Eligibility Score: {result.status}</strong>
        </div>
        <p className="mb-0 small">{result.message}</p>
      </div>

      {result.insights.length > 0 && (
        <div className="mb-3">
          <h6 className="small fw-bold">AI Insights:</h6>
          <ul className="small text-muted ps-3 mb-0">
            {result.insights.map((insight, idx) => (
              <li key={idx}>{insight}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="d-flex gap-2 mt-3">
        <button className="btn btn-primary btn-sm flex-grow-1" onClick={onNext}>See Recommendations</button>
      </div>
    </div>
  );
};

export default EligibilityCheck;

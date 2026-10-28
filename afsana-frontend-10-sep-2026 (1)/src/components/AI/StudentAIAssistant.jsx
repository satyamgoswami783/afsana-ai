import React, { useState, useEffect } from 'react';
import api from '../../interceptors/axiosInterceptor';
import BASE_URL from '../../Config';

const StudentAIAssistant = ({ studentId }) => {
  const [insights, setInsights] = useState({
    statusSummary: '',
    missingDocs: [],
    deadlines: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const idToFetch = studentId || localStorage.getItem('user_id') || '1';
        const response = await api.get(`${BASE_URL}ai/student/${idToFetch}/insights`);
        if (response.data && response.data.success) {
          setInsights(response.data.insights);
        }
      } catch (error) {
        console.error("Error fetching student AI insights:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [studentId]);

  if (loading) return <div className="p-3 text-center"><i className="fa-solid fa-spinner fa-spin text-primary"></i> AI is analyzing your profile...</div>;

  return (
    <div className="card shadow-sm border-0 mb-4 rounded-3 overflow-hidden">
      <div className="card-header bg-primary text-white border-bottom-0 py-3 d-flex align-items-center">
        <h5 className="mb-0"><i className="fa-solid fa-wand-magic-sparkles me-2"></i>AI Assistant Insights</h5>
        <span className="badge bg-light text-primary ms-auto">Live</span>
      </div>
      
      <div className="card-body bg-light p-4">
        <div className="mb-4">
          <h6 className="text-dark fw-bold mb-2"><i className="fa-solid fa-chart-line text-success me-2"></i>Application Status</h6>
          <p className="mb-0 text-muted">{insights.statusSummary}</p>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3 mb-md-0">
            <h6 className="text-dark fw-bold mb-2"><i className="fa-solid fa-file-circle-exclamation text-danger me-2"></i>Missing Documents</h6>
            {insights.missingDocs.length > 0 ? (
              <ul className="list-group list-group-flush rounded">
                {insights.missingDocs.map((doc, idx) => (
                  <li key={idx} className="list-group-item list-group-item-danger py-2 px-3 border-0 mb-1 rounded d-flex justify-content-between align-items-center">
                    <span style={{ fontSize: '0.85rem' }}>{doc}</span>
                    <i className="fa-solid fa-arrow-up-from-bracket text-danger" style={{ cursor: 'pointer' }} title="Upload now"></i>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="alert alert-success py-2 mb-0" style={{ fontSize: '0.85rem' }}>All required documents submitted!</div>
            )}
          </div>
          
          <div className="col-md-6">
            <h6 className="text-dark fw-bold mb-2"><i className="fa-solid fa-calendar-clock text-warning me-2"></i>AI Reminders</h6>
            {insights.deadlines.length > 0 ? (
              <ul className="list-group list-group-flush rounded">
                {insights.deadlines.map((dl, idx) => (
                  <li key={idx} className={`list-group-item py-2 px-3 border-0 mb-1 rounded d-flex justify-content-between align-items-center ${dl.urgent ? 'list-group-item-warning' : 'bg-white'}`}>
                    <span style={{ fontSize: '0.85rem' }}>{dl.task}</span>
                    <span className={`badge ${dl.urgent ? 'bg-danger' : 'bg-secondary'}`}>{dl.date}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-muted" style={{ fontSize: '0.85rem' }}>No upcoming deadlines.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAIAssistant;

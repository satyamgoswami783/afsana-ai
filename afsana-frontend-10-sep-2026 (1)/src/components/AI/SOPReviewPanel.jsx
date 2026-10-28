import React, { useState } from 'react';
import BASE_URL from '../../Config';

const SOPReviewPanel = ({ documentUrl, studentName }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const analyzeSOP = async () => {
    setAnalyzing(true);
    setFeedback(null);
    
    // Simulate AI analysis delay
    setTimeout(() => {
      setFeedback({
        score: 82,
        grammar: "Good, but contains 3 minor punctuation errors.",
        structure: "Strong introduction, but the conclusion needs more emphasis on future career goals.",
        content: "Alignment with the chosen university program is clear. Recommend adding specific mention of faculty research.",
        verdict: "Needs minor revisions before final submission."
      });
      setAnalyzing(false);
    }, 2500);
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-dark text-white py-3 d-flex justify-content-between align-items-center">
        <h6 className="mb-0"><i className="fa-solid fa-file-pen me-2"></i>AI SOP Review</h6>
        {!feedback && !analyzing && (
          <button className="btn btn-sm btn-primary" onClick={analyzeSOP}>
            Run Analysis
          </button>
        )}
      </div>
      
      <div className="card-body">
        {analyzing && (
          <div className="text-center py-4">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <p className="text-muted mb-0">AI is analyzing {studentName}'s Statement of Purpose...</p>
          </div>
        )}

        {!analyzing && !feedback && (
          <div className="text-center py-4 text-muted">
            <i className="fa-solid fa-robot fa-2x mb-2 text-secondary opacity-50"></i>
            <p className="mb-0">Click "Run Analysis" to evaluate grammar, structure, and content.</p>
          </div>
        )}

        {feedback && (
          <div>
            <div className="d-flex align-items-center mb-4">
              <div className="display-4 fw-bold text-primary me-3">{feedback.score}</div>
              <div>
                <h5 className="mb-0 text-dark">SOP Quality Score</h5>
                <span className={`badge ${feedback.score > 80 ? 'bg-success' : 'bg-warning'}`}>
                  {feedback.verdict}
                </span>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-12">
                <div className="p-3 bg-light rounded border-start border-4 border-info">
                  <h6 className="fw-bold"><i className="fa-solid fa-spell-check text-info me-2"></i>Grammar & Tone</h6>
                  <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>{feedback.grammar}</p>
                </div>
              </div>
              <div className="col-md-12">
                <div className="p-3 bg-light rounded border-start border-4 border-warning">
                  <h6 className="fw-bold"><i className="fa-solid fa-layer-group text-warning me-2"></i>Structure</h6>
                  <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>{feedback.structure}</p>
                </div>
              </div>
              <div className="col-md-12">
                <div className="p-3 bg-light rounded border-start border-4 border-success">
                  <h6 className="fw-bold"><i className="fa-solid fa-bullseye text-success me-2"></i>Content & Alignment</h6>
                  <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>{feedback.content}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SOPReviewPanel;

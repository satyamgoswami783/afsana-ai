import React from 'react';
import { Modal } from 'react-bootstrap';
import { Bot, CheckCircle, Activity, BrainCircuit, Target, X } from 'lucide-react';

const AIAnalysisModal = ({ show, onHide, lead }) => {
  if (!lead) return null;

  let summary = null;
  if (lead.ai_summary) {
    try {
      // It might be a JSON string from our new Conversational AI
      summary = JSON.parse(lead.ai_summary);
    } catch (e) {
      // Or it might be the old format string
      summary = { concerns: lead.ai_summary, next_steps: 'Follow up', probability: 'Medium', health: 'Yellow' };
    }
  }

  const getHealthColor = (colorStr) => {
    if (!colorStr) return '#f59e0b';
    if (colorStr.toLowerCase() === 'green') return '#10b981';
    if (colorStr.toLowerCase() === 'red') return '#ef4444';
    return '#f59e0b';
  };

  const healthColor = getHealthColor(summary?.health);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <div className="bg-white rounded-3 shadow-lg overflow-hidden position-relative">
        
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-4 border-bottom" style={{ backgroundColor: '#f8fafc' }}>
          <div className="d-flex align-items-center">
            <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px', backgroundColor: '#e0e7ff' }}>
              <Bot size={24} color="#4f46e5" />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-dark">AI Conversation Analysis</h5>
              <span className="text-muted small">Generated securely for Counselor Dashboard</span>
            </div>
          </div>
          <button onClick={onHide} className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center hover-shadow" style={{ width: '36px', height: '36px' }}>
            <X size={18} className="text-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          
          {/* Quick Stats Row */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="p-3 rounded-3 border d-flex flex-column h-100" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                <span className="text-muted small mb-1 fw-medium"><Activity size={14} className="me-1" /> Lead Health</span>
                <div className="d-flex align-items-center mt-1">
                  <div className="rounded-circle me-2" style={{ width: '12px', height: '12px', backgroundColor: healthColor }}></div>
                  <h6 className="mb-0 fw-bold" style={{ color: healthColor }}>
                    {summary?.health || 'Unknown'} (Score: {lead.ai_score || 'N/A'})
                  </h6>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="p-3 rounded-3 border d-flex flex-column h-100" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                <span className="text-muted small mb-1 fw-medium"><Target size={14} className="me-1" /> Conversion Probability</span>
                <h6 className="mb-0 fw-bold text-success mt-1">{summary?.probability || 'Medium'}</h6>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-3 rounded-3 border d-flex flex-column h-100" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
                <span className="text-muted small mb-1 fw-medium"><CheckCircle size={14} className="me-1" /> AI Status</span>
                <h6 className="mb-0 fw-bold text-primary mt-1">Ready for Counselor</h6>
              </div>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="mb-4">
            <h6 className="fw-bold text-dark d-flex align-items-center mb-3">
              <BrainCircuit size={18} className="me-2 text-indigo-600" style={{ color: '#4f46e5' }} /> 
              Student Profile & Concerns
            </h6>
            <div className="p-3 rounded-3" style={{ backgroundColor: '#f1f5f9' }}>
              <p className="mb-0 text-dark" style={{ lineHeight: '1.6' }}>
                {summary?.concerns || (lead.ai_summary ? lead.ai_summary : "The AI was not able to generate a detailed summary for this student. They provided basic details.")}
              </p>
            </div>
          </div>

          <div>
            <h6 className="fw-bold text-dark d-flex align-items-center mb-3">
              <Target size={18} className="me-2 text-warning" /> 
              Recommended Next Steps
            </h6>
            <div className="p-3 rounded-3 border-start border-4 border-warning" style={{ backgroundColor: '#fffbeb' }}>
              <p className="mb-0 text-dark fw-medium" style={{ lineHeight: '1.6' }}>
                {summary?.next_steps || "Reach out to the student to schedule a full counseling session."}
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 border-top bg-light text-end">
          <button className="btn btn-outline-secondary me-2 px-4" onClick={onHide}>Close</button>
          <a 
            href={`https://wa.me/${lead.phone_number || lead.phone}?text=Hi ${lead.full_name}, I am a counselor from Study First.`} 
            target="_blank" 
            rel="noreferrer"
            className="btn btn-success px-4 d-inline-flex align-items-center"
          >
            <i className="fa-brands fa-whatsapp me-2"></i> Connect on WhatsApp
          </a>
        </div>
      </div>
    </Modal>
  );
};

export default AIAnalysisModal;

import React, { useState, useEffect } from 'react';
import api from '../../interceptors/axiosInterceptor';
import BASE_URL from '../../Config';
import AIAnalysisModal from './AIAnalysisModal';
import './AI.css';

const AILeadsList = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchAILeads = async () => {
      try {
        const response = await api.get(`${BASE_URL}inquiries`);
        if (response.data) {
          // Filter only leads that came from the AI Chatbot
          const dataArray = Array.isArray(response.data.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []);
          const aiLeads = dataArray.filter(
            lead => (lead.source && lead.source.toLowerCase().includes('ai')) || 
                    (lead.email && lead.email.toLowerCase().includes('@whatsapp.com'))
          );
          setLeads(aiLeads);
        }
      } catch (error) {
        console.error("Error fetching AI leads:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAILeads();
  }, []);

  const handleRowClick = (lead) => {
    setSelectedLead(lead);
    setShowModal(true);
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1 ai-gradient-text">
            <i className="fa-solid fa-robot me-2"></i> AI Generated Leads
          </h3>
          <p className="text-muted">A dedicated list of all inquiries captured and scored by the AI Assistant.</p>
        </div>
      </div>

      <div className="ai-glass-card">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <i className="fa-solid fa-spinner fa-spin fa-2x text-primary mb-3"></i>
              <p>Fetching AI Leads...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-5">
              <i className="fa-solid fa-inbox fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">No AI Leads Found</h5>
              <p className="text-muted">Leads captured by the chatbot will appear here.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 ai-table">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="py-3">Contact Details</th>
                    <th className="py-3">Education & Budget</th>
                    <th className="py-3">Preferred Country</th>
                    <th className="py-3 text-center">AI Score</th>
                    <th className="py-3 text-center">Assigned To</th>
                    <th className="py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, index) => {
                    const score = lead.ai_score || '-';
                    // Fix status showing "0"
                    const statusText = (lead.lead_status === '0' || !lead.lead_status) ? 'Fresh Lead' : lead.lead_status;
                    const education = lead.study_level || lead.highest_level || 'N/A';
                    
                    return (
                      <tr 
                        key={lead.id || index} 
                        style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
                        onClick={() => handleRowClick(lead)}
                        title="Click to view AI Conversation Analysis"
                      >
                        <td className="px-4 py-3 fw-medium text-dark">
                          {lead.full_name}
                          <div className="small text-muted mt-1">
                            {((lead.source && lead.source.toLowerCase().includes('whatsapp')) || 
                              (lead.email && lead.email.toLowerCase().includes('@whatsapp.com'))) ? (
                              <>
                                <i className="fa-brands fa-whatsapp text-success me-1"></i>
                                {lead.source}
                              </>
                            ) : (
                              <>
                                <i className="fa-solid fa-robot text-primary me-1" style={{ color: '#8a2be2' }}></i>
                                AI Chatbot
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="d-flex flex-column">
                            <span><i className="fa-solid fa-envelope text-muted me-2"></i>{lead.email}</span>
                            <span><i className="fa-solid fa-phone text-muted me-2"></i>{lead.phone_number || lead.phone}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="d-flex flex-column">
                            <span className="badge bg-light text-dark border mb-1 w-fit-content">{education}</span>
                            <span className="small text-muted"><i className="fa-solid fa-wallet me-1"></i>${lead.budget || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="fw-medium">{lead.country || 'Not Specified'}</span>
                        </td>
                        <td className="py-3 text-center">
                          <div className="d-flex flex-column align-items-center">
                            <h5 className={`mb-0 ${score >= 80 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-danger'}`}>
                              {score}
                            </h5>
                            <span style={{ fontSize: '0.7rem' }} className="text-muted">Out of 100</span>
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          {lead.counselor_name || lead.assigned_staff_name ? (
                            <span className="badge bg-info bg-opacity-10 text-info px-3 py-2 border border-info border-opacity-25 rounded-pill">
                              <i className="fa-solid fa-user-check me-1"></i> {lead.counselor_name || lead.assigned_staff_name}
                            </span>
                          ) : (
                            <span className="badge bg-secondary bg-opacity-10 text-secondary px-2 py-1 rounded-pill" style={{ fontSize: '0.75rem' }}>
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2 border border-primary border-opacity-25">
                            {statusText}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <AIAnalysisModal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        lead={selectedLead} 
      />
    </div>
  );
};

export default AILeadsList;

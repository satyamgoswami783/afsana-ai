import React, { useState } from 'react';

const DocumentAuditPanel = ({ studentId, documents }) => {
  const [audited, setAudited] = useState(false);
  const [auditResults, setAuditResults] = useState(null);

  const runAudit = () => {
    // Simulate AI document audit (OCR and matching)
    setTimeout(() => {
      setAuditResults([
        { docName: 'Passport', status: 'Verified', notes: 'Valid until 2029. No issues found.', icon: 'fa-check-circle text-success' },
        { docName: 'IELTS Score', status: 'Warning', notes: 'Score is 6.0, which barely meets the university threshold (6.0).', icon: 'fa-triangle-exclamation text-warning' },
        { docName: 'Bank Statement', status: 'Missing', notes: 'Document not uploaded yet.', icon: 'fa-circle-xmark text-danger' },
        { docName: 'Academic Transcripts', status: 'Verified', notes: 'Matches stated education level. GPA: 3.8/4.0.', icon: 'fa-check-circle text-success' }
      ]);
      setAudited(true);
    }, 1500);
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
        <h6 className="mb-0 fw-bold"><i className="fa-solid fa-magnifying-glass-chart text-primary me-2"></i>AI Document Audit</h6>
        {!audited && (
          <button className="btn btn-sm btn-outline-primary" onClick={runAudit}>
            <i className="fa-solid fa-bolt me-1"></i> Run Smart Audit
          </button>
        )}
      </div>
      
      <div className="card-body p-0">
        {!audited ? (
          <div className="p-4 text-center text-muted">
            <i className="fa-solid fa-file-shield fa-2x mb-3 text-secondary opacity-50"></i>
            <p className="mb-0">Run the AI Smart Audit to automatically scan and verify student documents.</p>
          </div>
        ) : (
          <ul className="list-group list-group-flush">
            {auditResults.map((res, idx) => (
              <li key={idx} className="list-group-item p-3">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <div className="d-flex align-items-center">
                    <i className={`fa-solid ${res.icon} me-2 fs-5`}></i>
                    <h6 className="mb-0 fw-bold text-dark">{res.docName}</h6>
                  </div>
                  <span className={`badge ${res.status === 'Verified' ? 'bg-success' : res.status === 'Warning' ? 'bg-warning' : 'bg-danger'}`}>
                    {res.status}
                  </span>
                </div>
                <p className="mb-0 text-muted ms-4" style={{ fontSize: '0.85rem' }}>{res.notes}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DocumentAuditPanel;

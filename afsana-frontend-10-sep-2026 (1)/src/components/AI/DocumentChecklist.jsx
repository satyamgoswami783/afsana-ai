import React, { useState, useEffect } from 'react';
import api from '../../interceptors/axiosInterceptor';
import BASE_URL from '../../Config';

const DocumentChecklist = ({ studyLevel, country }) => {
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // We fetch documents based on country if available, otherwise just general docs
    const fetchChecklist = async () => {
      setLoading(true);
      try {
        const countryToFetch = country || 'UK'; // Default to UK if not provided
        const response = await api.get(`${BASE_URL}ai/countries/${countryToFetch}/visa-requirements`);
        if (response.data && response.data.success && response.data.requirements) {
          setChecklist(response.data.requirements.map(doc => ({ doc, required: true })));
        } else {
          fallbackChecklist();
        }
      } catch (error) {
        console.error("Error fetching document checklist:", error);
        fallbackChecklist();
      } finally {
        setLoading(false);
      }
    };
    
    fetchChecklist();
  }, [studyLevel, country]);

  const fallbackChecklist = () => {
    const base = [
      { doc: 'Valid Passport (min. 18 months validity)', required: true },
      { doc: 'Academic Certificates & Transcripts', required: true },
      { doc: 'IELTS/PTE/TOEFL Score Report', required: true },
      { doc: 'Bank Statement (last 6 months)', required: true },
      { doc: 'Sponsor\'s Financial Documents', required: true }
    ];
    setChecklist(base);
  };

  if (!checklist.length) return <div className="text-muted text-sm">Please provide study level and country to see required documents.</div>;

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-light border-bottom-0 py-2 d-flex justify-content-between align-items-center">
        <h6 className="mb-0"><i className="fa-solid fa-list-check text-warning me-2"></i>Document Checklist</h6>
        <span className="badge bg-secondary rounded-pill px-2" style={{ fontSize: '0.7rem' }}>Auto-generated</span>
      </div>
      <div className="card-body p-0">
        <ul className="list-group list-group-flush">
          {checklist.map((item, idx) => (
            <li key={idx} className="list-group-item px-3 py-2 border-bottom-0 d-flex align-items-center">
              <input className="form-check-input me-2" type="checkbox" value="" id={`check-${idx}`} />
              <label className="form-check-label text-dark" htmlFor={`check-${idx}`} style={{ fontSize: '0.9rem' }}>
                {item.doc}
              </label>
              {item.required && <span className="text-danger ms-1">*</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DocumentChecklist;

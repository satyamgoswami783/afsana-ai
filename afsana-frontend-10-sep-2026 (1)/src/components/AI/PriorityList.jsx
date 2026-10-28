import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import config from "../../Config";

const PriorityList = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role");
  const counselor_id = localStorage.getItem("counselor_id");
  const loginDetail = JSON.parse(localStorage.getItem("login_detail") || "{}");

  useEffect(() => {
    fetchPriorityLeads();
  }, []);

  const fetchPriorityLeads = async () => {
    try {
      // If counselor - send their ID so they only see their own leads
      // If admin - no filter, show all
      const params = {};
      if (role === 'counselor' && counselor_id) {
        params.counselor_id = counselor_id;
      } else if (loginDetail?.id && role !== 'admin') {
        params.counselor_id = loginDetail.id;
      }
      const response = await axios.get(`${config.apiUrl}/ai-dashboards/priority`, { params });
      setLeads(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching priority leads:", error);
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-dark fw-bold mb-0">🚨 AI Priority Follow-ups</h2>
          <p className="text-muted mb-0">
            {role === 'admin' ? 'All High Priority leads across counselors.' : 'Your assigned leads, sorted by priority.'}
          </p>
        </div>
        <span className="badge bg-danger fs-6 px-3 py-2">{leads.length} Leads</span>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Student Name</th>
                    <th>Phone</th>
                    <th>Country</th>
                    <th>Source</th>
                    <th>Missing Docs</th>
                    <th>Priority</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.length > 0 ? (
                    leads.map((lead, idx) => {
                      const missingDocs = [];
                      if (!lead.passport) missingDocs.push("Passport");
                      if (!lead.sop) missingDocs.push("SOP");

                      const priorityColor = 
                        lead.priority === 'High' || lead.priority === 'hot' ? 'danger' :
                        lead.priority === 'warm' ? 'warning' : 'secondary';

                      return (
                        <tr key={lead.id}>
                          <td className="text-muted">{idx + 1}</td>
                          <td>
                            <div className="fw-bold">{lead.full_name || <span className="text-muted fst-italic">Unknown</span>}</div>
                            <small className="text-muted">{lead.email}</small>
                          </td>
                          <td>
                            <a href={`https://wa.me/${lead.phone_number}`} target="_blank" rel="noreferrer" className="text-success fw-bold text-decoration-none">
                              📱 {lead.phone_number}
                            </a>
                          </td>
                          <td>{lead.country || <span className="text-muted">—</span>}</td>
                          <td>
                            <span className={`badge rounded-pill px-2 ${lead.source?.toLowerCase().includes('whatsapp') ? 'bg-success' : 'bg-info text-dark'}`}>
                              {lead.source || 'Unknown'}
                            </span>
                          </td>
                          <td>
                            {missingDocs.length > 0 ? (
                              <span className="badge bg-danger rounded-pill">
                                ⚠️ {missingDocs.join(", ")}
                              </span>
                            ) : (
                              <span className="badge bg-success rounded-pill">✅ All Good</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge bg-${priorityColor} text-${priorityColor === 'warning' ? 'dark' : 'white'} px-3 py-2 rounded-pill`}>
                              {lead.priority || 'cold'}
                            </span>
                          </td>
                          <td>
                            <Link to={`/inquiries/edit/${lead.id}`} className="btn btn-sm btn-primary">
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-muted">
                        🎉 No pending priority leads. Great job!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriorityList;

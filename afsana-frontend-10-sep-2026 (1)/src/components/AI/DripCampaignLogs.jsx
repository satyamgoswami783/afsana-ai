import React, { useState, useEffect } from 'react';
import BASE_URL from '../../Config';

const DripCampaignLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Example role fetching from localStorage to enforce Role Permissions in UI
  const userRole = localStorage.getItem('role') || 'counselor';
  
  useEffect(() => {
    // In a real app, you would pass role/userId to backend to filter logs appropriately
    setTimeout(() => {
      setLogs([
        {
          id: 1,
          lead_name: "Amit Patel",
          phone: "+919876543222",
          campaign_type: "Day-1 Brochure",
          status: "Delivered",
          sent_time: new Date(Date.now() - 86400000).toISOString(),
          error_message: null
        },
        {
          id: 2,
          lead_name: "Neha Gupta",
          phone: "+919876543233",
          campaign_type: "Day-3 Success Story",
          status: "Failed",
          sent_time: new Date(Date.now() - 3600000).toISOString(),
          error_message: "User blocked the business account"
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Loading Drip Campaign Logs...</div>;
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">
          <i className="fa-solid fa-clock-rotate-left text-primary me-2"></i> 
          Drip Campaign Logs
        </h3>
        {userRole === 'admin' ? (
          <span className="badge bg-danger fs-6">Admin View (All Logs)</span>
        ) : (
          <span className="badge bg-info text-dark fs-6">My Assigned Leads</span>
        )}
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">Lead & Phone</th>
                  <th className="px-4 py-3">Campaign Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Sent Time</th>
                  <th className="px-4 py-3">Error Message</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4">
                      <strong>{log.lead_name}</strong><br/>
                      <small className="text-muted">{log.phone}</small>
                    </td>
                    <td className="px-4">
                      <span className="badge bg-secondary">{log.campaign_type}</span>
                    </td>
                    <td className="px-4">
                      {log.status === 'Delivered' && <span className="badge bg-success"><i className="fa-solid fa-check-double me-1"></i> Delivered</span>}
                      {log.status === 'Sent' && <span className="badge bg-primary"><i className="fa-solid fa-check me-1"></i> Sent</span>}
                      {log.status === 'Failed' && <span className="badge bg-danger"><i className="fa-solid fa-xmark me-1"></i> Failed</span>}
                    </td>
                    <td className="px-4 text-muted small">
                      {new Date(log.sent_time).toLocaleString()}
                    </td>
                    <td className="px-4 text-danger small fw-bold">
                      {log.error_message || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && (
              <div className="text-center p-5 text-muted">
                No marketing logs found for your assigned leads.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DripCampaignLogs;

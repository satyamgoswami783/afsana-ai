import React, { useState, useEffect } from "react";
import BASE_URL from "../../Config";
import api from "../../interceptors/axiosInterceptor";
import { format } from "date-fns";

const DripLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get(`${BASE_URL}ai-dashboards/drip-logs`);
      if (Array.isArray(response.data)) {
        setLogs(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setLogs(response.data.data);
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error("Error fetching drip logs:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-dark fw-bold mb-0">🤖 Marketing Drip Logs</h2>
          <p className="text-muted mb-0">Track automated messages sent by the AI Follow-up Engine.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm border-0" style={{ borderRadius: "16px" }}>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Log ID</th>
                    <th>Student Name</th>
                    <th>Phone Number</th>
                    <th>Campaign Type</th>
                    <th>Status</th>
                    <th>Sent Date</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(logs) && logs.length > 0 ? (
                    logs.map((log) => (
                      <tr key={log.id}>
                        <td>#{log.id}</td>
                        <td className="fw-bold">{log.full_name}</td>
                        <td>{log.phone_number}</td>
                        <td>
                          <span className="badge bg-info text-dark rounded-pill px-3 py-2">
                            {(log.campaign_type || "").replace(/_/g, " ").toUpperCase()}
                          </span>
                        </td>
                        <td>
                          {log.status === "sent" ? (
                            <span className="badge bg-success rounded-pill px-3">
                              <i className="bi bi-check-circle me-1"></i>Sent
                            </span>
                          ) : (
                            <span className="badge bg-danger rounded-pill px-3">
                              <i className="bi bi-x-circle me-1"></i>Failed
                            </span>
                          )}
                        </td>
                        <td className="text-muted">
                          {log.sent_date
                            ? format(new Date(log.sent_date), "MMM dd, yyyy - hh:mm a")
                            : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No automated messages have been sent yet.
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

export default DripLogs;

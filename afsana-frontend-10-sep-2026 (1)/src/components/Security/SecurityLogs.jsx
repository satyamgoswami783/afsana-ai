import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import api from "../../interceptors/axiosInterceptor";
import BASE_URL from "../../Config";
import Loader from "../common/Loader";

const SecurityLogs = () => {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [searchLog, setSearchLog] = useState("");
  const [liveGeoData, setLiveGeoData] = useState(null);
  const [showGeoJson, setShowGeoJson] = useState(false);
  
  // Tabs: 'users' or 'logs'
  const [activeTab, setActiveTab] = useState("users");

  const fetchLiveGeo = async () => {
    try {
      const geoRes = await api.get(`${BASE_URL}public/geo-info`);
      if (geoRes.data?.geoData) {
        setLiveGeoData(geoRes.data.geoData);
        console.log("%c==========================================", "color: green; font-weight: bold;");
        console.log("%c🌐 ALL AVAILABLE LIVE IP & LOCATION GEO-IP OBJECT:", "color: #00ffff; font-weight: bold; font-size: 14px;");
        console.dir(geoRes.data.geoData);
        console.log("%c==========================================", "color: green; font-weight: bold;");
      }
    } catch (err) {
      console.error("Could not fetch live geo data", err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // Support both /api/auth/ format and /api/ format as fallback
      let usersRes, logsRes;
      try {
        [usersRes, logsRes] = await Promise.all([
          api.get(`${BASE_URL}auth/users-status`),
          api.get(`${BASE_URL}auth/login-logs`)
        ]);
      } catch (firstErr) {
        [usersRes, logsRes] = await Promise.all([
          api.get(`${BASE_URL}users-status`),
          api.get(`${BASE_URL}login-logs`)
        ]);
      }
      setUsers(usersRes.data || []);
      setLogs(logsRes.data || []);
      console.log("==========================================");
      console.log("🔍 SECURITY & LOCATION LOGS DATA (FETCHED FROM BACKEND):", logsRes.data);
      console.log("==========================================");
    } catch (err) {
      console.error("Failed to fetch security logs", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load security and tracking logs."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchLiveGeo();
  }, []);

  const handleToggleStatus = async (userId, currentStatus) => {
    const activeState = (currentStatus || "active") === "active";
    const nextStatus = activeState ? "deactivated" : "active";
    const confirmText = nextStatus === "deactivated" 
      ? "Are you sure you want to deactivate this user? They will be immediately blocked from logging in!"
      : "Are you sure you want to reactivate this user?";

    const result = await Swal.fire({
      title: `${nextStatus === "deactivated" ? "Deactivate" : "Activate"} User`,
      text: confirmText,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: nextStatus === "deactivated" ? "#d33" : "#3085d6",
      cancelButtonColor: "#aaa",
      confirmButtonText: nextStatus === "deactivated" ? "Yes, Deactivate" : "Yes, Activate"
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        try {
          await api.put(`${BASE_URL}auth/update-status/${userId}`, { status: nextStatus });
        } catch (firstErr) {
          await api.put(`${BASE_URL}update-status/${userId}`, { status: nextStatus });
        }
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: `User has been ${nextStatus === "deactivated" ? "deactivated" : "activated"}.`,
          timer: 2000,
          showConfirmButton: false
        });
        fetchData();
      } catch (err) {
        console.error("Failed to update status", err);
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Failed to update user status."
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredUsers = users.filter(user => 
    (user.full_name || "").toLowerCase().includes(searchUser.toLowerCase()) ||
    (user.email || "").toLowerCase().includes(searchUser.toLowerCase()) ||
    (user.role || "").toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredLogs = logs.filter(log =>
    (log.email || "").toLowerCase().includes(searchLog.toLowerCase()) ||
    (log.ip_address || "").toLowerCase().includes(searchLog.toLowerCase()) ||
    (log.country || "").toLowerCase().includes(searchLog.toLowerCase()) ||
    (log.city || "").toLowerCase().includes(searchLog.toLowerCase()) ||
    (log.region || "").toLowerCase().includes(searchLog.toLowerCase()) ||
    (log.address || "").toLowerCase().includes(searchLog.toLowerCase()) ||
    (log.isp || "").toLowerCase().includes(searchLog.toLowerCase()) ||
    (log.zip || "").toLowerCase().includes(searchLog.toLowerCase()) ||
    (log.role || "").toLowerCase().includes(searchLog.toLowerCase())
  );

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#f8f9fc", minHeight: "90vh" }}>
      {loading && <Loader />}
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark" style={{ letterSpacing: "-0.5px" }}>Security & Access Control</h2>
          <p className="text-muted mb-0">Monitor user login logs, track location details, and manage account statuses.</p>
        </div>
        <div>
          <button className="btn btn-dark btn-sm px-3 py-2 rounded-3 shadow-sm me-2" onClick={() => setShowGeoJson(!showGeoJson)}>
            <i className="fa-solid fa-code me-1"></i> {showGeoJson ? "Hide Raw Geo JSON" : "Show Raw IP & Geo JSON"}
          </button>
          <button className="btn btn-outline-primary btn-sm px-3 py-2 rounded-3 shadow-sm" onClick={() => { fetchData(); fetchLiveGeo(); }}>
            <i className="fa-solid fa-arrows-rotate me-1"></i> Refresh Data
          </button>
        </div>
      </div>

      {/* Raw GeoIP Data Card */}
      {showGeoJson && (
        <div className="card border-0 rounded-4 shadow-sm p-4 bg-dark text-white mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0 text-warning">
              <i className="fa-solid fa-globe me-2"></i>Live GeoIP Data Object (All Fields Available from IP Engine)
            </h5>
            <span className="badge bg-success">Live JSON Object</span>
          </div>
          <p className="text-light small mb-2">Check F12 Developer Console or view all available fields directly below:</p>
          <pre className="bg-black p-3 rounded-3 text-info mb-0" style={{ maxHeight: "350px", overflowY: "auto", fontSize: "13px" }}>
            {JSON.stringify(liveGeoData || "Fetching live GeoIP data...", null, 2)}
          </pre>
        </div>
      )}

      {/* Tabs Menu */}
      <ul className="nav nav-pills mb-4 bg-white p-2 rounded-4 shadow-sm" style={{ width: "fit-content" }}>
        <li className="nav-item">
          <button 
            className={`nav-link px-4 py-2 rounded-3 fw-semibold ${activeTab === "users" ? "active btn-primary text-white" : "text-muted"}`} 
            onClick={() => setActiveTab("users")}
            style={{ border: "none", background: activeTab === "users" ? undefined : "transparent" }}
          >
            <i className="fa-solid fa-users-gear me-2"></i>User Status Management
          </button>
        </li>
        <li className="nav-item ms-2">
          <button 
            className={`nav-link px-4 py-2 rounded-3 fw-semibold ${activeTab === "logs" ? "active btn-primary text-white" : "text-muted"}`} 
            onClick={() => setActiveTab("logs")}
            style={{ border: "none", background: activeTab === "logs" ? undefined : "transparent" }}
          >
            <i className="fa-solid fa-user-shield me-2"></i>Login Location Logs
          </button>
        </li>
      </ul>

      {/* Tab Content: Users Management */}
      {activeTab === "users" && (
        <div className="card border-0 rounded-4 shadow-sm p-4 bg-white">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
            <h5 className="fw-bold mb-0 text-secondary">Afsana Platform Members</h5>
            <div className="position-relative w-100" style={{ maxWidth: "350px" }}>
              <input
                type="text"
                className="form-control rounded-3 border-light shadow-none bg-light px-3 py-2"
                placeholder="Search by name, email, or role..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive rounded-3">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-3 px-4 text-start">Name</th>
                  <th className="py-3 text-start">Email</th>
                  <th className="py-3 text-start">Role</th>
                  <th className="py-3 text-start">Status</th>
                  <th className="py-3 text-end px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="py-3 px-4 fw-bold text-dark text-start">{user.full_name || user.email || "User #" + user.id}</td>
                      <td className="py-3 text-secondary text-start">{user.email}</td>
                      <td className="py-3 text-start">
                        <span className={`badge px-3 py-2 rounded-pill text-uppercase fs-12 ${
                          user.role === "admin" ? "bg-danger-subtle text-danger" : 
                          user.role === "counselor" ? "bg-primary-subtle text-primary" : 
                          user.role === "processor" ? "bg-warning-subtle text-warning" : 
                          "bg-success-subtle text-success"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 text-start">
                        <span className={`badge px-3 py-2 rounded-pill fw-bold ${
                          (user.status || "active") === "active" ? "bg-success text-white" : "bg-danger text-white"
                        }`}>
                          {(user.status || "active") === "active" ? "Active" : "Deactivated"}
                        </span>
                      </td>
                      <td className="py-3 text-end px-4">
                        {user.role === "admin" ? (
                          <span className="text-muted small">Cannot block admin</span>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(user.id, user.status || "active")}
                            className={`btn btn-sm rounded-3 px-3 py-2 fw-semibold shadow-sm transition-all ${
                              (user.status || "active") === "active" ? "btn-danger" : "btn-success"
                            }`}
                          >
                            {(user.status || "active") === "active" ? (
                              <><i className="fa-solid fa-user-slash me-1"></i> Deactivate</>
                            ) : (
                              <><i className="fa-solid fa-user-check me-1"></i> Activate</>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      No members found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Login Logs */}
      {activeTab === "logs" && (
        <div className="card border-0 rounded-4 shadow-sm p-4 bg-white">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
            <h5 className="fw-bold mb-0 text-secondary">Real-Time Login Audits</h5>
            <div className="position-relative w-100" style={{ maxWidth: "350px" }}>
              <input
                type="text"
                className="form-control rounded-3 border-light shadow-none bg-light px-3 py-2"
                placeholder="Search logs by email, IP, location, address..."
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive rounded-3">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-3 px-4">User Email</th>
                  <th className="py-3">Role</th>
                  <th className="py-3">IP Address</th>
                  <th className="py-3">Location & Address Info</th>
                  <th className="py-3">Timezone</th>
                  <th className="py-3 px-4">Login Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-3 px-4 fw-bold text-dark">{log.email}</td>
                      <td className="py-3">
                        <span className={`badge px-2 py-1 rounded text-uppercase fs-11 ${
                          log.role === "admin" ? "bg-danger text-white" : 
                          log.role === "counselor" ? "bg-primary text-white" : 
                          "bg-dark text-white"
                        }`}>
                          {log.role}
                        </span>
                      </td>
                      <td className="py-3 font-monospace text-secondary">{log.ip_address}</td>
                      <td className="py-3" style={{ minWidth: "260px" }}>
                        {(!log.country || log.country === "Localhost") && !log.latitude ? (
                          <span className="text-muted"><i className="fa-solid fa-laptop me-1"></i> Localhost</span>
                        ) : (
                          <div>
                            <div className="fw-semibold text-dark mb-1">
                              <i className="fa-solid fa-location-dot text-danger me-1"></i>
                              {log.address || `${log.city || log.country}, ${log.region ? log.region + ', ' : ''}${log.country} ${log.zip ? '(' + log.zip + ')' : ''}`}
                            </div>
                            {log.latitude && log.longitude && (
                              <a 
                                href={`https://www.google.com/maps?q=${log.latitude},${log.longitude}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="badge bg-primary-subtle text-primary text-decoration-none me-2 p-2 mt-1 rounded-2"
                              >
                                <i className="fa-solid fa-map-pin me-1"></i> GPS: {Number(log.latitude).toFixed(4)}, {Number(log.longitude).toFixed(4)}
                                {log.accuracy && (
                                  <span className="ms-1 text-secondary font-monospace" style={{ fontSize: "10px" }}>
                                    ({log.accuracy > 1000 ? `±${(log.accuracy / 1000).toFixed(1)} km ISP Gateway` : `±${Math.round(log.accuracy)}m Mobile GPS`})
                                  </span>
                                )}
                              </a>
                            )}
                            {log.isp && (
                              <small className="text-muted d-block mt-1">
                                <i className="fa-solid fa-network-wired me-1"></i> ISP: {log.isp}
                              </small>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 text-muted small">{log.timezone}</td>
                      <td className="py-3 px-4 text-secondary small">
                        {new Date(log.login_time).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      No login logs found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityLogs;

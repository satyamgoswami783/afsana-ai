import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, ListGroup, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaTasks, 
  FaCreditCard, 
  FaPassport, 
  FaArrowRight, 
  FaCheckCircle, 
  FaClock, 
  FaUniversity,
  FaUser,
  FaUpload
} from "react-icons/fa";
import api from "../../interceptors/axiosInterceptor";
import { hasPermission } from "../../authtication/permissionUtils";
import BASE_URL from "../../Config";
import "./StudentDashboard.css";
import StudentAIAssistant from "../AI/StudentAIAssistant";

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ totaltasks: 0, totalpayments: 0, totalvisa_process: 0 });
  const [studentInfo, setStudentInfo] = useState(null);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [assignedCounselor, setAssignedCounselor] = useState(null);
  const [latestVisaProcess, setLatestVisaProcess] = useState(null);
  const [loading, setLoading] = useState(true);

  const stuId = localStorage.getItem("student_id");
  const role = localStorage.getItem("login");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const statsRes = await axios.get(`${BASE_URL}studentsdashboard/${stuId}`);
        setData(statsRes?.data?.data || { totaltasks: 0, totalpayments: 0, totalvisa_process: 0 });

        const studentRes = await api.get(`${BASE_URL}auth/getStudentById/${stuId}`);
        setStudentInfo(studentRes.data);

        const counselorRes = await api.get(`${BASE_URL}auth/getAssignedCounselor/${stuId}`);
        setAssignedCounselor(counselorRes.data?.[0]);

        const updatesRes = await axios.get(`${BASE_URL}recent-updates/${stuId}`);
        setRecentUpdates(updatesRes?.data?.data || []);

        const visaRes = await api.get(`${BASE_URL}auth/getVisaProcessBystudentidsss/${stuId}`);
        if (visaRes.data?.success && visaRes.data?.data?.length > 0) {
          setLatestVisaProcess(visaRes.data.data[0]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    if (stuId) fetchDashboardData();
  }, [stuId]);

  if (!hasPermission("Dashboard", "view")) {
    return <div className="text-center mt-5">You don't have access for Dashboard</div>;
  }

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <Container fluid className="student-dashboard-container">
      <Row className="g-4">
        {/* Left Column - Main Content */}
        <Col lg={8}>
          {/* Status Cards */}
          <Row className="g-4 mb-4">
            <Col md={4}>
              <Card className="dashboard-card pending-tasks-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="p-2 rounded bg-success bg-opacity-10 text-success">
                      <FaTasks size={20} />
                    </div>
                  </div>
                  <div className="card-title">Pending Tasks</div>
                  <div className="card-value">{data.totaltasks}</div>
                  <Link to="/studenttasks" className="view-link">
                    View all tasks <FaArrowRight size={12} className="ms-1" />
                  </Link>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="dashboard-card pending-payments-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="p-2 rounded bg-success bg-opacity-10 text-success">
                      <FaCreditCard size={20} />
                    </div>
                  </div>
                  <div className="card-title">Pending Payments</div>
                  <div className="card-value">{data.totalpayments}</div>
                  <Link to="/payment" className="view-link text-success">
                    View payments <FaArrowRight size={12} className="ms-1" />
                  </Link>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="dashboard-card visa-applications-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="p-2 rounded bg-warning bg-opacity-10 text-warning">
                      <FaPassport size={20} />
                    </div>
                  </div>
                  <div className="card-title">Visa Applications</div>
                  <div className="card-value">{data.totalvisa_process}</div>
                  <Link to="/visaprocesing" className="view-link text-warning">
                    View status <FaArrowRight size={12} className="ms-1" />
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Selected University & Registration Details */}
          <Row className="g-4 mb-4">
            <Col md={6}>
              <Card className="dashboard-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0 fw-bold">Selected University</h5>
                    <Link to="/Searchprograms" className="small text-decoration-none" style={{ color: "#10b981", fontWeight: 600 }}>Change University</Link>
                  </div>
                  <div className="d-flex align-items-center mt-4">
                    <div className="p-3 rounded me-3" style={{ background: "rgba(16, 185, 129, 0.12)" }}>
                      <FaUniversity size={30} style={{ color: "#10b981" }} />
                    </div>
                    <div>
                      <h6 className="mb-1 fw-bold">{latestVisaProcess?.university_name || studentInfo?.university_name || "No University Selected"}</h6>
                      <p className="text-muted small mb-0">{latestVisaProcess?.country || studentInfo?.country || "N/A"}</p>
                    </div>
                  </div>
                  <hr />
                  <div className="mt-3 small">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Program:</span>
                      <span className="fw-bold">{latestVisaProcess?.applied_program || latestVisaProcess?.program_name || "N/A"}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Intake:</span>
                      <span className="fw-bold">{latestVisaProcess?.intake || "N/A"}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Application ID:</span>
                      <span className="fw-bold">{latestVisaProcess?.application_id || studentInfo?.unique_id || "N/A"}</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="dashboard-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0 fw-bold">Registration Details</h5>
                    {studentInfo?.photo && (
                      <img 
                        src={studentInfo.photo.startsWith('http') ? studentInfo.photo : `${BASE_URL.replace('/api/', '')}${studentInfo.photo}`} 
                        alt="Profile" 
                        className="rounded-circle shadow-sm border border-2 border-success"
                        style={{ width: "45px", height: "45px", objectFit: "cover" }}
                      />
                    )}
                  </div>
                  <div className="mt-4 small">
                    <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                      <span className="text-muted">Full Name:</span>
                      <span className="fw-bold">{studentInfo?.full_name}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                      <span className="text-muted">Email:</span>
                      <span className="fw-bold">{studentInfo?.email}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                      <span className="text-muted">Phone:</span>
                      <span className="fw-bold">{studentInfo?.mobile_number}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                      <span className="text-muted">Counselor:</span>
                      <span className="fw-bold">{assignedCounselor?.full_name || "Not Assigned"}</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Right Column - Sidebar */}
        <Col lg={4}>
          {/* Student AI Assistant */}
          <div className="mb-4">
            <StudentAIAssistant studentId={stuId} />
          </div>

          {/* Next Step Card */}
          <Card
            className="mb-4 border-0"
            style={{
              background: "linear-gradient(135deg, #0d1f17 0%, #143325 100%)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              borderRadius: "16px",
              boxShadow: "0 12px 28px rgba(0, 0, 0, 0.25)",
            }}
          >
            <Card.Body className="text-white p-4">
              <div className="d-flex align-items-center mb-2" style={{ color: "#fbbf24" }}>
                <FaClock className="me-2" />
                <span className="small fw-bold text-uppercase">Next Step</span>
              </div>
              <h5 className="fw-bold mb-3" style={{ color: "#ffffff" }}>Upload your Documents to move to the next stage.</h5>
              <button
                className="btn w-100 fw-bold py-2 shadow-sm text-white"
                style={{
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  border: "none",
                  borderRadius: "10px",
                }}
                onClick={() => navigate('/visaprocesing')}
              >
                <FaUpload className="me-2" /> Upload Now
              </button>
            </Card.Body>
          </Card>

          {/* Recent Updates */}
          <Card className="dashboard-card recent-updates-panel">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0 fw-bold">Recent Updates</h5>
              <Link to="/visaprocesing" className="small text-decoration-none" style={{ color: "#10b981", fontWeight: 600 }}>View All</Link>
            </div>
            <div className="updates-list">
              {recentUpdates.length > 0 ? (
                recentUpdates.map((update, index) => (
                  <div key={index} className="update-item">
                    <div
                      className="update-icon"
                      style={{ background: update.type === 'task' ? "#10b981" : "#f59e0b" }}
                    >
                      {update.type === 'task' ? <FaTasks size={14} /> : <FaCheckCircle size={14} />}
                    </div>
                    <div className="update-content">
                      <h6 className="mb-1">{update.title}</h6>
                      <p className="text-muted small mb-1">{update.description}</p>
                      <span className="update-date">{getTimeAgo(update.date)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted py-4">No recent updates</div>
              )}
            </div>
            <button
              className="btn w-100 mt-4 py-2 fw-semibold"
              style={{
                border: "1px solid rgba(16, 185, 129, 0.4)",
                color: "#10b981",
                background: "rgba(16, 185, 129, 0.08)",
                borderRadius: "10px",
              }}
              onClick={() => navigate('/visaprocesing')}
            >
              View All Updates
            </button>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;

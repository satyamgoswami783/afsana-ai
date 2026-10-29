import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import { Row, Col, Card, Form, Button, ProgressBar, Table, Badge } from "react-bootstrap";
import BASE_URL from "../../Config";
import api from "../../interceptors/axiosInterceptor";

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

const StaffDashboard = () => {
  const [metrics, setMetrics] = useState({
    total_leads: 0,
    total_inquiries: 0,
    office_visited: 0,
    scheduled_visits: 0,
    total_follow_ups: 0,
    monthly_achieved: 0,
    monthly_target: 100,
    conversion_rate: 0
  });
  const [chartData, setChartData] = useState([]);
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    country: "",
    staff_id: ""
  });
  const [counselors, setCounselors] = useState([]);
  const [counselorLeadSummary, setCounselorLeadSummary] = useState([]);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedCounselorForReassign, setSelectedCounselorForReassign] = useState(null);
  const [counselorLeads, setCounselorLeads] = useState([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [targetCounselorId, setTargetCounselorId] = useState("");
  const [reassignLoading, setReassignLoading] = useState(false);
  const [counselorSearchTerm, setCounselorSearchTerm] = useState("");
  const [assignedLeadSearch, setAssignedLeadSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const user_id = localStorage.getItem("user_id");
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchCounselors();
    fetchCounselorSummary();
    fetchDashboardData();
  }, []);

  const fetchCounselors = async () => {
    try {
      const res = await api.get(`${BASE_URL}getAllStaff`);
      if (res.data) setCounselors(res.data);
    } catch (err) {
      console.error("Error fetching counselors:", err);
    }
  };

  const fetchCounselorSummary = async () => {
    try {
      const res = await api.get(`${BASE_URL}counselor`);
      if (res.data) setCounselorLeadSummary(res.data);
    } catch (err) {
      console.error("Error fetching counselor summary:", err);
    }
  };

  const handleOpenReassignModal = async (counselor) => {
    try {
      setSelectedCounselorForReassign(counselor);
      setSelectedLeadIds([]);
      setTargetCounselorId("");
      setAssignedLeadSearch("");
      setShowReassignModal(true);
      setReassignLoading(true);
      const res = await api.get(`${BASE_URL}counselor-assigned-leads/${counselor.id}`);
      setCounselorLeads(res.data || []);
    } catch (err) {
      console.error("Failed to fetch assigned leads", err);
      alert("Failed to load assigned leads");
    } finally {
      setReassignLoading(false);
    }
  };

  const filteredAssignedLeads = Array.isArray(counselorLeads)
    ? counselorLeads.filter((l) =>
        (l.full_name || l.student_name || "").toLowerCase().includes(assignedLeadSearch.toLowerCase()) ||
        (l.email || "").toLowerCase().includes(assignedLeadSearch.toLowerCase()) ||
        (l.phone_number || l.phone || "").toLowerCase().includes(assignedLeadSearch.toLowerCase()) ||
        (l.course_name || "").toLowerCase().includes(assignedLeadSearch.toLowerCase())
      )
    : [];

  const handleToggleSelectAllLeads = (e) => {
    if (e.target.checked) {
      const filteredIds = filteredAssignedLeads.map((l) => l.id);
      setSelectedLeadIds((prev) => [...new Set([...prev, ...filteredIds])]);
    } else {
      const filteredIds = filteredAssignedLeads.map((l) => l.id);
      setSelectedLeadIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    }
  };

  const handleToggleSelectLead = (id) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleReassignLeads = async (e) => {
    e.preventDefault();
    if (!selectedLeadIds.length) {
      alert("Please select at least one lead to reassign.");
      return;
    }
    if (!targetCounselorId) {
      alert("Please select a target counselor.");
      return;
    }
    if (String(targetCounselorId) === String(selectedCounselorForReassign?.id)) {
      alert("Please select a different counselor than the current one.");
      return;
    }

    try {
      setReassignLoading(true);
      const payload = {
        inquiry_ids: selectedLeadIds,
        counselor_id: targetCounselorId,
        assigned_by: localStorage.getItem("user_id") || 1,
      };
      const res = await api.post(`${BASE_URL}bulk-assign-inquiry`, payload);
      alert(res.data.message || "Leads reassigned successfully.");
      setShowReassignModal(false);
      fetchCounselorSummary();
      fetchDashboardData();
    } catch (err) {
      console.error("Failed to reassign leads", err);
      alert(err.response?.data?.message || "Failed to reassign leads.");
    } finally {
      setReassignLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const staffRes = await axios.get(`${BASE_URL}getStaffById/${user_id}`);
      if (staffRes.data?.length > 0) {
        const staff = staffRes.data[0];
        const branch = role === "admin" ? "" : staff.branch;
        const created_at = new Date(staff.created_at).toISOString().split("T")[0];

        let queryParams = new URLSearchParams({
          branch,
          ...(role !== "admin" && { created_at }),
          ...filters
        });
        
        if (role === "staff") {
          queryParams.set("staff_id", staff.id);
        }

        const res = await axios.get(`${BASE_URL}staffdashboard?${queryParams.toString()}`);
        if (res.data.success) {
          const staffData = res.data.data;
          setMetrics({
            total_leads: staffData.total_leads,
            total_inquiries: staffData.total_inquiries,
            office_visited: staffData.office_visited,
            scheduled_visits: staffData.scheduled_visits,
            total_follow_ups: staffData.total_follow_ups,
            monthly_achieved: staffData.monthly_achieved,
            monthly_target: staffData.monthly_target,
            conversion_rate: staffData.conversion_rate
          });
          setChartData(staffData.chart_data || []);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    fetchDashboardData();
  };

  const resetFilters = () => {
    setFilters({ fromDate: "", toDate: "", country: "", staff_id: "" });
    fetchDashboardData();
  };

  const barData = {
    labels: chartData.map((item) => item.label),
    datasets: [
      {
        label: "Count",
        data: chartData.map((item) => item.value),
        backgroundColor: ["#10b981", "#f59e0b", "#059669", "#fbbf24", "#0d9488"],
        borderRadius: 8,
      },
    ],
  };

  const target = metrics.monthly_target || 100;
  const progress = Math.min(((metrics.monthly_achieved || 0) / target) * 100, 100);

  const kpiCards = [
    { label: "Total Leads", value: metrics.total_leads, accent: "#34d399" },
    { label: "Total Inquiries", value: metrics.total_inquiries, accent: "#fbbf24" },
    { label: "Scheduled Visits", value: metrics.scheduled_visits, accent: "#10b981" },
    { label: "Office Visited", value: metrics.office_visited, accent: "#f59e0b" },
    { label: "Follow-Ups", value: metrics.total_follow_ups, accent: "#34d399" },
    { label: "Conversion Rate", value: `${metrics.conversion_rate}%`, accent: "#fbbf24" },
  ];

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h2 className="mb-0 fw-bold">Staff Dashboard</h2>
        <div className="d-flex gap-3 align-items-center">
          <span className="fw-bold" style={{ color: "#10b981" }}>
            Monthly Target: {metrics.monthly_achieved}/{target} Visits
          </span>
          <div style={{ width: "250px" }}>
            <ProgressBar
              now={progress}
              label={`${Math.round(progress)}%`}
              variant="success"
              animated
              style={{ height: '20px', borderRadius: '10px' }}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4 shadow-sm border-0" style={{ borderRadius: "16px", border: "1px solid rgba(16, 185, 129, 0.22)" }}>
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={2}>
              <Form.Label className="small fw-bold">From Date</Form.Label>
              <Form.Control type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} size="sm" />
            </Col>
            <Col md={2}>
              <Form.Label className="small fw-bold">To Date</Form.Label>
              <Form.Control type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange} size="sm" />
            </Col>
            <Col md={2}>
              <Form.Label className="small fw-bold">Country</Form.Label>
              <Form.Select name="country" value={filters.country} onChange={handleFilterChange} size="sm">
                <option value="">All Countries</option>
                <option value="Hungary">Hungary</option>
                <option value="UK">UK</option>
                <option value="Malta">Malta</option>
                <option value="Canada">Canada</option>
              </Form.Select>
            </Col>
            {role !== "staff" && (
              <Col md={2}>
                <Form.Label className="small fw-bold">Staff Member</Form.Label>
                <Form.Select name="staff_id" value={filters.staff_id} onChange={handleFilterChange} size="sm">
                  <option value="">All Staff</option>
                  {counselors.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name}</option>
                  ))}
                </Form.Select>
              </Col>
            )}
            <Col md={3} className="d-flex gap-2">
              <Button
                size="sm"
                onClick={applyFilters}
                disabled={loading}
                style={{
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  border: "none",
                  fontWeight: 600,
                  padding: "6px 18px",
                }}
              >
                {loading ? "..." : "Apply"}
              </Button>
              <Button
                variant="outline-warning"
                size="sm"
                onClick={resetFilters}
                style={{ fontWeight: 600, padding: "6px 16px" }}
              >
                Reset
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* KPI Cards */}
      <Row className="g-3 mb-4">
        {kpiCards.map((kpi, idx) => (
          <Col md={2} key={idx}>
            <div
              className="text-center shadow-sm p-3 h-100 d-flex flex-column justify-content-center"
              style={{
                background: "linear-gradient(145deg, #0d1f17 0%, #132e22 100%)",
                border: "1px solid rgba(16, 185, 129, 0.35)",
                borderTop: `3px solid ${kpi.accent}`,
                borderRadius: "16px",
                color: "#ffffff",
              }}
            >
              <small style={{ color: "#cbd5e1", fontWeight: 600 }}>{kpi.label}</small>
              <h3 className="mb-0 fw-bold mt-1" style={{ color: kpi.accent }}>{kpi.value}</h3>
            </div>
          </Col>
        ))}
      </Row>

      {/* Charts */}
      <Row className="g-3">
        <Col md={8}>
          <Card className="shadow-sm border-0 p-4" style={{ borderRadius: "16px" }}>
            <h5 className="mb-3 fw-bold">Performance Analytics</h5>
            <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0 p-4" style={{ borderRadius: "16px" }}>
            <h5 className="mb-3 fw-bold">Lead Distribution</h5>
            <Pie data={{
              labels: ["Leads", "Inquiries", "Visits"],
              datasets: [{
                data: [metrics.total_leads, metrics.total_inquiries, metrics.office_visited],
                backgroundColor: ["#10b981", "#f59e0b", "#059669"]
              }]
            }} />
          </Card>
        </Col>
      </Row>

      {/* Counselor Lead Summary & Bulk Transfer Section */}
      <Card className="shadow-sm border-0 p-4 mt-4" style={{ borderRadius: "16px" }}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div>
            <h5 className="mb-1 fw-bold">👥 Counselor Lead Assignment & Reassignment Summary</h5>
            <small className="text-muted">
              View how many leads are assigned to each counselor. Click the count to reassign or transfer leads in bulk or stages.
            </small>
          </div>
          <div className="d-flex align-items-center gap-2 mt-2 mt-md-0">
            <Form.Control
              size="sm"
              placeholder="🔍 Search Counselor Name..."
              style={{ width: "220px" }}
              value={counselorSearchTerm}
              onChange={(e) => setCounselorSearchTerm(e.target.value)}
            />
            <Button
              variant="outline-success"
              size="sm"
              onClick={fetchCounselorSummary}
              style={{ fontWeight: 600 }}
            >
              Refresh Counts
            </Button>
          </div>
        </div>
        <div className="table-responsive">
          <Table bordered hover className="mb-0 text-center align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Counselor Name</th>
                <th>Branch</th>
                <th>Email</th>
                <th>Status</th>
                <th>Assigned Leads Count (Click to Reassign)</th>
              </tr>
            </thead>
            <tbody>
              {counselorLeadSummary.length > 0 ? (
                counselorLeadSummary
                  .filter((c) =>
                    (c.full_name || "").toLowerCase().includes(counselorSearchTerm.toLowerCase()) ||
                    (c.email || "").toLowerCase().includes(counselorSearchTerm.toLowerCase()) ||
                    (c.branch || "").toLowerCase().includes(counselorSearchTerm.toLowerCase())
                  )
                  .map((c, index) => (
                    <tr key={c.id}>
                    <td>{index + 1}</td>
                    <td className="fw-semibold">{c.full_name}</td>
                    <td>{c.branch || "N/A"}</td>
                    <td>{c.email}</td>
                    <td>
                      <Badge bg={c.status === "active" || !c.status ? "success" : "secondary"}>
                        {c.status || "active"}
                      </Badge>
                    </td>
                    <td>
                      {c.assigned_leads_count > 0 ? (
                        <span
                          className="badge shadow-sm px-3 py-2"
                          style={{
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            color: "#ffffff",
                          }}
                          onClick={() => handleOpenReassignModal(c)}
                          title="Click to view and reassign/transfer leads"
                        >
                          🔄 {c.assigned_leads_count} Leads Assigned
                        </span>
                      ) : (
                        <span className="badge bg-secondary px-3 py-2" style={{ fontSize: "0.9rem" }}>
                          0 Leads
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-3 text-muted">
                    Loading counselors or no counselors found...
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* Reassign / Transfer Leads Modal */}
      {showReassignModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div
                className="modal-header text-white"
                style={{ background: "linear-gradient(135deg, #0d1f17 0%, #132e22 100%)" }}
              >
                <h5 className="modal-title" style={{ color: "#34d399" }}>
                  Assigned Leads for: {selectedCounselorForReassign?.full_name} ({counselorLeads.length} total)
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowReassignModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {reassignLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-success" role="status"></div>
                    <p className="mt-2 text-muted">Loading leads...</p>
                  </div>
                ) : counselorLeads.length === 0 ? (
                  <p className="text-center text-muted my-3">No active leads found for this counselor.</p>
                ) : (
                  <>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 p-3 bg-light rounded gap-2 border">
                      <div className="d-flex align-items-center gap-2">
                        <Form.Select
                          size="sm"
                          style={{ width: "230px" }}
                          value={targetCounselorId}
                          onChange={(e) => setTargetCounselorId(e.target.value)}
                        >
                          <option value="">-- Select Counselor --</option>
                          {counselorLeadSummary
                            .filter((cn) => cn.id !== selectedCounselorForReassign?.id && (cn.status === "active" || !cn.status))
                            .map((cn) => (
                              <option key={cn.id} value={cn.id}>
                                {cn.full_name} {cn.branch ? `(${cn.branch})` : ""}
                              </option>
                            ))}
                        </Form.Select>
                        <Button
                          variant="success"
                          size="sm"
                          className="fw-bold px-3 shadow-sm"
                          disabled={selectedLeadIds.length === 0 || !targetCounselorId || reassignLoading}
                          onClick={handleReassignLeads}
                        >
                          Reassign Selected ({selectedLeadIds.length})
                        </Button>
                      </div>
                      <div className="d-flex align-items-center gap-2 mt-2 mt-md-0">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="🔍 Search Lead Name / Phone..."
                          style={{ minWidth: "220px" }}
                          value={assignedLeadSearch}
                          onChange={(e) => setAssignedLeadSearch(e.target.value)}
                        />
                        {assignedLeadSearch && (
                          <Button variant="outline-secondary" size="sm" onClick={() => setAssignedLeadSearch("")}>
                            ✕
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="small text-muted mb-2">
                      Select leads below to reassign to another counselor in bulk or in stages.
                    </p>
                    <div className="table-responsive" style={{ maxHeight: "350px", overflowY: "auto" }}>
                      <Table bordered hover size="sm" className="align-middle text-center mb-0">
                        <thead className="table-light sticky-top">
                          <tr>
                            <th style={{ width: "45px" }}>
                              <Form.Check
                                type="checkbox"
                                checked={
                                  filteredAssignedLeads.length > 0 &&
                                  filteredAssignedLeads.every((l) => selectedLeadIds.includes(l.id))
                                }
                                onChange={handleToggleSelectAllLeads}
                              />
                            </th>
                            <th>Lead ID</th>
                            <th>Student Name</th>
                            <th>Phone</th>
                            <th>Course</th>
                            <th>Country</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAssignedLeads.map((item) => (
                            <tr key={item.id}>
                              <td>
                                <Form.Check
                                  type="checkbox"
                                  checked={selectedLeadIds.includes(item.id)}
                                  onChange={() => handleToggleSelectLead(item.id)}
                                />
                              </td>
                              <td>{item.id}</td>
                              <td className="fw-semibold">{item.full_name}</td>
                              <td>{item.phone_number || "N/A"}</td>
                              <td>{item.course_name || "N/A"}</td>
                              <td>{item.country || "N/A"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowReassignModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;

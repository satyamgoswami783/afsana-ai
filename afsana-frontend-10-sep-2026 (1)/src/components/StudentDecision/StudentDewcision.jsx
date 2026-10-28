import React, { useState, useEffect } from "react";
import {
  Container,
  Button,
  Table,
  Form,
  Modal,
  Row,
  Col,
} from "react-bootstrap";
import { FaPlus, FaEye } from "react-icons/fa";
import Swal from "sweetalert2";

import BASE_URL from "../../Config";
import api from "../../interceptors/axiosInterceptor";

const StudentDecisions = () => {
  const [decisions, setDecisions] = useState([]);
  const [students, setStudentsData] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const [newDecision, setNewDecision] = useState({
    student_id: "",
    university_id: "",
    status: "accepted",
    date: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortByDate, setSortByDate] = useState("asc");

  useEffect(() => {
    api.get(`${BASE_URL}auth/getAllStudents`)
      .then((res) => setStudentsData(res.data))
      .catch((err) => console.error("Error fetching students:", err));

    api.get(`${BASE_URL}universities`)
      .then((res) => setUniversities(res.data))
      .catch((err) => console.error("Error fetching universities:", err));

    const student_id = localStorage.getItem("student_id");
    if (student_id) {
      api.get(`${BASE_URL}admissiondecisions/${student_id}`)
        .then((res) => {
          const decisionData = Array.isArray(res.data) ? res.data : res.data.data || [];
          setDecisions(decisionData);
        })
        .catch((err) => console.error("Error fetching decisions:", err));
    }
  }, []);

  const getStudentName = (id) => {
    const student = students.find((s) => s.id === id);
    return student ? student.full_name : "N/A";
  };

  const getUniversityName = (id) => {
    const university = universities.find((u) => u.id === id);
    return university ? university.name : "N/A";
  };

  const filteredDecisions = decisions.filter((dec) => {
    const statusMatch = filterStatus === "all" || dec.status === filterStatus;
    const studentName = getStudentName(dec.student_id);
    const universityName = getUniversityName(dec.university_id);
    const studentMatch = studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const universityMatch = universityName.toLowerCase().includes(searchTerm.toLowerCase());
    return (studentMatch || universityMatch) && statusMatch;
  });

  const sortedDecisions = [...filteredDecisions].sort((a, b) =>
    sortByDate === "asc"
      ? new Date(a.decision_date) - new Date(b.decision_date)
      : new Date(b.decision_date) - new Date(a.decision_date)
  );

  const handleNewDecisionChange = (e) => {
    const { name, value } = e.target;
    setNewDecision((prev) => ({ ...prev, [name]: value }));
  };

  const handleViewLeadDetails = (lead) => {
    setSelectedLead(lead);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedLead(null);
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">University Offers & Decisions</h2>
      </div>

      <Form className="mb-4">
        <Row className="g-3">
          <Col md={6}>
            <Form.Control
              type="text"
              placeholder="Search by University or Student name..."
              value={searchTerm}
              className="p-2 shadow-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ borderRadius: "10px" }}
            />
          </Col>
          <Col md={6} className="d-flex justify-content-end align-items-center">
             <Form.Select 
                value={sortByDate} 
                onChange={(e) => setSortByDate(e.target.value)}
                className="w-auto shadow-sm"
                style={{ borderRadius: "10px" }}
             >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </Form.Select>
          </Col>
        </Row>
      </Form>

      {/* Filter Tabs */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {["all", "accepted", "rejected", "waitlisted"].map((status) => (
          <Button
            key={status}
            size="sm"
            variant={filterStatus === status ? "primary" : "outline-secondary"}
            onClick={() => setFilterStatus(status)}
            style={{ 
              borderRadius: "20px", 
              padding: "6px 18px", 
              fontWeight: 500,
              textTransform: "capitalize" 
            }}
          >
            {status}
          </Button>
        ))}
      </div>

      <Row className="g-4">
          {sortedDecisions.length > 0 ? (
            sortedDecisions.map((dec) => {
              // Badge color logic
              let badgeBg = "secondary";
              if (dec.status === "accepted") badgeBg = "success";
              if (dec.status === "rejected") badgeBg = "danger";
              if (dec.status === "waitlisted") badgeBg = "warning";

              return (
                <Col md={6} lg={4} key={dec.id}>
                  <div className="card h-100 shadow-sm border-0" style={{ borderRadius: "15px", overflow: "hidden" }}>
                    <div className="card-body position-relative">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="card-title text-primary mb-0" style={{ fontWeight: "600" }}>
                          {getUniversityName(dec.university_id)}
                        </h5>
                        <span className={`badge bg-${badgeBg} px-3 py-2 rounded-pill text-uppercase`} style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>
                          {dec.status}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-muted mb-1" style={{ fontSize: "0.9rem" }}>
                          <i className="bi bi-person me-2"></i>
                          {getStudentName(dec.student_id)}
                        </p>
                        <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                          <i className="bi bi-calendar me-2"></i>
                          {new Date(dec.decision_date).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>

                      <Button
                        variant="light"
                        className="w-100 mt-2 text-primary border border-primary-subtle"
                        onClick={() => handleViewLeadDetails(dec)}
                        style={{ borderRadius: "8px", fontWeight: "500" }}
                      >
                        <FaEye className="me-2" /> View Details
                      </Button>
                    </div>
                  </div>
                </Col>
              );
            })
          ) : (
            <Col xs={12}>
               <div className="text-center p-5 bg-light rounded" style={{ border: "1px dashed #ccc" }}>
                 <p className="text-muted mb-0 fs-5">No decisions found.</p>
               </div>
            </Col>
          )}
      </Row>

      {/* View Modal */}
      <Modal show={showViewModal} onHide={handleCloseViewModal} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Decision Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLead && (
            <div className="p-2">
              <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                <span className="text-muted">Status</span>
                <span className={`badge bg-${
                  selectedLead.status === "accepted" ? "success" :
                  selectedLead.status === "rejected" ? "danger" : "warning"
                } text-uppercase px-3 py-1 rounded-pill`}>
                  {selectedLead.status}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                <span className="text-muted">Student Name</span>
                <span className="fw-medium">{getStudentName(selectedLead.student_id)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                <span className="text-muted">University</span>
                <span className="fw-medium text-end">{getUniversityName(selectedLead.university_id)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Decision Date</span>
                <span className="fw-medium">{new Date(selectedLead.decision_date).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="secondary" onClick={handleCloseViewModal} style={{ borderRadius: "8px" }}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Add Modal - Save Disabled */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Admission Decision</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Student</Form.Label>
              <Form.Select
                name="student_id"
                value={newDecision.student_id}
                onChange={handleNewDecisionChange}
              >
                <option value="">-- Select Student --</option>
                {students.map((stu) => (
                  <option key={stu.id} value={stu.id}>{stu.full_name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>University</Form.Label>
              <Form.Select
                name="university_id"
                value={newDecision.university_id}
                onChange={handleNewDecisionChange}
              >
                <option value="">-- Select University --</option>
                {universities.map((uni) => (
                  <option key={uni.id} value={uni.id}>{uni.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={newDecision.status}
                onChange={handleNewDecisionChange}
              >
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="waitlisted">Waitlisted</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Decision Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={newDecision.date}
                onChange={handleNewDecisionChange}
              />
            </Form.Group>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="button" variant="primary" disabled>
                Save (Disabled)
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default StudentDecisions;

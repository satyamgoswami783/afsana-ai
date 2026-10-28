import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Swal from 'sweetalert2';
import { Container, Row, Col, Card, Badge, Form, ProgressBar, Pagination, Button } from "react-bootstrap";
import { FaUniversity, FaGraduationCap, FaCalendarAlt, FaFileAlt } from "react-icons/fa";
import BASE_URL from "../../Config";

const MyApplication = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [studentid, setStudentId] = useState("");
      
  useEffect(() => {
    const is_id = localStorage.getItem("student_id");
    if (is_id) {
      setStudentId(is_id);
    }
  }, []);

  useEffect(() => {
    if (studentid) {
      fetchApplications();
    }
  }, [studentid]);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${BASE_URL}auth/getVisaProcessBystudentidsss/${studentid}`);
      if (response.data.success) {
        setApplications(response.data.data);
        setFilteredApplications(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to fetch applications!',
      });
    }
  };

  const uniqueUniversities = [
    ...new Set(applications.map((app) => app.university_names || app.university_name)),
  ];

  const getApplicationStatus = (app) => {
    const stages = [
      app.registration_visa_processing_stage,
      app.documents_visa_processing_stage,
      app.university_application_visa_processing_stage,
      app.fee_payment_visa_processing_stage,
      app.university_interview_visa_processing_stage,
      app.offer_letter_visa_processing_stage,
      app.tuition_fee_visa_processing_stage,
      app.final_offer_visa_processing_stage,
      app.embassy_docs_visa_processing_stage,
      app.appointment_visa_processing_stage,
      app.visa_approval_visa_processing_stage
    ];
    
    const isApproved = stages.every(stage => stage === 1);
    const isPending = stages.some(stage => stage === 0);
    
    return isApproved ? "Approve" : (isPending ? "Pending" : "Rejected");
  };

  useEffect(() => {
    let filtered = [...applications];

    if (selectedUniversity) {
      filtered = filtered.filter(
        (app) => (app.university_names || app.university_name) === selectedUniversity
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter((app) => getApplicationStatus(app) === selectedStatus);
    }

    setFilteredApplications(filtered);
    setCurrentPage(1); // Reset page on filter change
  }, [selectedUniversity, selectedStatus, applications]);

  const getStatusBadge = (status) => {
    if (status === "Approve") return <Badge bg="success" className="px-3 py-2 rounded-pill">Approved</Badge>;
    if (status === "Pending") return <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill">In Progress</Badge>;
    return <Badge bg="danger" className="px-3 py-2 rounded-pill">Rejected</Badge>;
  };

  const getProgress = (app) => {
    const stages = [
      app.registration_visa_processing_stage,
      app.documents_visa_processing_stage,
      app.university_application_visa_processing_stage,
      app.fee_payment_visa_processing_stage,
      app.university_interview_visa_processing_stage,
      app.offer_letter_visa_processing_stage,
      app.tuition_fee_visa_processing_stage,
      app.final_offer_visa_processing_stage,
      app.embassy_docs_visa_processing_stage,
      app.appointment_visa_processing_stage,
      app.visa_approval_visa_processing_stage
    ];
    const completed = stages.filter(stage => stage === 1).length;
    return Math.round((completed / stages.length) * 100);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredApplications.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

  return (
    <Container fluid className="py-4 mt-5">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold text-dark">My Applications</h2>
          <p className="text-muted">Track the progress of your university applications.</p>
        </Col>
      </Row>

      <Card className="shadow-sm border-0 rounded-4 mb-4">
        <Card.Body className="p-4 bg-light rounded-4">
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold text-secondary">Filter by University</Form.Label>
                <Form.Select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                  className="rounded-3 border-0 shadow-sm py-2"
                >
                  <option value="">All Universities</option>
                  {uniqueUniversities.map((uni, index) => (
                    <option key={index} value={uni}>{uni}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold text-secondary">Filter by Status</Form.Label>
                <Form.Select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="rounded-3 border-0 shadow-sm py-2"
                >
                  <option value="">All Statuses</option>
                  <option value="Approve">Approved</option>
                  <option value="Pending">In Progress</option>
                  <option value="Rejected">Rejected</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="g-4">
        {currentItems.length > 0 ? (
          currentItems.map((app, index) => {
            const progress = getProgress(app);
            return (
              <Col lg={6} xl={4} key={app.id || index}>
                <Card className="h-100 shadow-sm border-0 rounded-4 application-card transition-all hover-lift">
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3 text-primary">
                          <FaUniversity size={24} />
                        </div>
                        <div>
                          <h5 className="fw-bold mb-1 text-dark">{app.university_names || app.university_name || "Unknown University"}</h5>
                          <div className="text-muted small d-flex align-items-center">
                            <FaGraduationCap className="me-1" /> 
                            {app.program_name || app.applied_program || "Program not specified"}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <hr className="bg-light opacity-50" />
                    
                    <Row className="mb-4 mt-3">
                      <Col xs={6}>
                        <p className="text-muted small mb-1">Intake</p>
                        <p className="fw-semibold mb-0 d-flex align-items-center"><FaCalendarAlt className="me-2 text-secondary"/>{app.intake || "N/A"}</p>
                      </Col>
                      <Col xs={6}>
                        <p className="text-muted small mb-1">Overall Status</p>
                        <div>{getStatusBadge(getApplicationStatus(app))}</div>
                      </Col>
                    </Row>

                    <div className="mb-4">
                      <div className="d-flex justify-content-between mb-1 small">
                        <span className="text-muted fw-semibold">Application Progress</span>
                        <span className="fw-bold text-primary">{progress}%</span>
                      </div>
                      <ProgressBar 
                        now={progress} 
                        variant={progress === 100 ? "success" : "primary"} 
                        className="rounded-pill"
                        style={{height: '8px'}}
                      />
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-auto pt-2">
                       <div className="text-muted small">
                         <FaFileAlt className="me-1" /> Applied on {app.registration_date ? new Date(app.registration_date).toLocaleDateString() : "N/A"}
                       </div>
                       <Link to="/dashboardvisa">
                         <Button variant="outline-primary" size="sm" className="rounded-pill px-4 fw-bold shadow-sm hover-primary">
                           View Journey
                         </Button>
                       </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })
        ) : (
          <Col xs={12}>
            <div className="text-center py-5 bg-white rounded-4 shadow-sm">
              <div className="text-muted mb-3">
                <FaUniversity size={50} className="opacity-25" />
              </div>
              <h5 className="fw-bold text-dark">No applications found</h5>
              <p className="text-muted">You haven't submitted any applications matching these filters.</p>
            </div>
          </Col>
        )}
      </Row>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-5">
          <Pagination className="shadow-sm rounded-pill overflow-hidden">
            <Pagination.Prev 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(currentPage - 1)}
            />
            {[...Array(totalPages)].map((_, i) => (
              <Pagination.Item 
                key={i} 
                active={currentPage === i + 1}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(currentPage + 1)}
            />
          </Pagination>
        </div>
      )}

      <style jsx="true">{`
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important;
        }
        .transition-all {
          transition: all 0.3s ease;
        }
        .hover-primary:hover {
          background-color: var(--bs-primary);
          color: white !important;
        }
      `}</style>
    </Container>
  );
};

export default MyApplication;
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Badge, Spinner } from "react-bootstrap";
import { FaGraduationCap, FaSearch, FaGlobe, FaArrowRight, FaUniversity } from "react-icons/fa";
import api from "../../../interceptors/axiosInterceptor";
import BASE_URL from "../../../Config";
import Swal from "sweetalert2";
import Loader from "../../common/Loader";

const countryOptions = [
  "Hungary", "UK", "Cyprus", "Canada", "Malaysia", "Lithuania", "Latvia", 
  "Germany", "New Zealand", "Estonia", "Australia", "South Korea", "Georgia", 
  "Denmark", "Netherlands", "Sweden", "Norway", "Belgium", "Romania", "Russia", 
  "Turkey", "Ireland", "USA", "Portugal", "Malta", "Slovakia", "Others"
];

const ProcessorApplyUniversity = () => {
  const [students, setStudents] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [filteredUniversities, setFilteredUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Selection states
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const processorId = localStorage.getItem("user_id");

  const fetchStudents = async () => {
    try {
      const res = await api.get(`auth/getAssignedStudentsinProcessordashboard?processor_id=${processorId}`);
      setStudents(res.data?.users || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const res = await api.get(`${BASE_URL}universities`); // Corrected spelling
      setUniversities(res.data || []);
      setFilteredUniversities(res.data || []);
    } catch (error) {
      console.error("Error fetching universities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchUniversities();
  }, []);

  // Get dynamic country options from fetched universities
  const dynamicCountryOptions = [...new Set(universities.map(u => u.location))].filter(Boolean);

  useEffect(() => {
    let filtered = universities;

    if (selectedCountry) {
      filtered = filtered.filter(u => u.location === selectedCountry);
    }

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.name?.toLowerCase().includes(query) ||
        u.location?.toLowerCase().includes(query)
      );
    }

    setFilteredUniversities(filtered);
  }, [selectedCountry, searchTerm, universities]);

  const handleApply = async (universityId, universityName) => {
    if (!selectedStudent) {
      Swal.fire("Required", "Please select a student first", "warning");
      return;
    }

    const result = await Swal.fire({
      title: 'Apply to University',
      text: `Are you sure you want to apply to ${universityName} on behalf of the selected student? This will open the detailed application journey form.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Apply',
      confirmButtonColor: '#4F46E5'
    });

    if (result.isConfirmed) {
      // ✅ Set student context for the University Form
      localStorage.setItem("student_id", selectedStudent);
      localStorage.setItem("isProcessorApplying", "true");
      
      // ✅ Redirect to the specific University Form (BmuUniversity/Wekerle etc)
      window.location.href = `/university/${universityId}`;
    }
  };

  return (
    <Container fluid className="py-4 mt-5">
      {loading && <Loader text="Processing..." />}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0"><FaGraduationCap className="me-2 text-primary"/> University Applications</h2>
          <p className="text-muted">Apply to partner universities on behalf of your assigned students.</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
        <Card.Body className="p-4 bg-light">
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-bold text-secondary">Step 1: Select Student *</Form.Label>
                <Form.Select 
                  className="rounded-3 border-0 shadow-sm py-2"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  <option value="">Choose Student</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.full_name} ({s.student_email})</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-bold text-secondary">Step 2: Filter by Country</Form.Label>
                <Form.Select 
                  className="rounded-3 border-0 shadow-sm py-2"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                >
                  <option value="">All Countries</option>
                  {dynamicCountryOptions.map((c, i) => <option key={i} value={c}>{c}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={5}>
              <Form.Group>
                <Form.Label className="fw-bold text-secondary">Search University</Form.Label>
                <div className="position-relative">
                  <Form.Control 
                    className="rounded-3 border-0 shadow-sm py-2 ps-5"
                    placeholder="Search by name or country..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="g-4">
        {filteredUniversities.length > 0 ? filteredUniversities.map(uni => (
          <Col key={uni.id} lg={4} md={6}>
            <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden uni-card">
              <div className="position-relative" style={{ height: "160px", background: "#f8f9fa", overflow: "hidden" }}>
                {uni.logo_url ? (
                  <img 
                    src={uni.logo_url.startsWith('http') ? uni.logo_url : `${BASE_URL.replace("/api/", "")}/${uni.logo_url}`} 
                    alt={uni.name}
                    className="w-100 h-100 object-fit-contain p-3"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 bg-light">
                    <FaUniversity size={60} className="text-secondary opacity-25" />
                  </div>
                )}
                <Badge bg="primary" className="position-absolute top-0 end-0 m-3 rounded-pill px-3 py-2 shadow-sm">
                  <FaGlobe className="me-1"/> {uni.location || "N/A"}
                </Badge>
              </div>
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-2 text-dark">{uni.name}</h5>
                <p className="text-muted small mb-4 line-clamp-2">
                  Partner University in {uni.location || "International"}. Offering premium international education programs.
                </p>
                <Button 
                  variant="primary" 
                  className="w-100 rounded-pill py-2 fw-semibold d-flex align-items-center justify-content-center"
                  style={{ background: "#4F46E5", border: "none" }}
                  onClick={() => handleApply(uni.id, uni.name)}
                >
                  Apply Now <FaArrowRight className="ms-2"/>
                </Button>
              </Card.Body>
            </Card>
          </Col>
        )) : (
          <Col xs={12} className="text-center py-5">
            <div className="bg-light p-5 rounded-4 d-inline-block shadow-sm">
              <FaUniversity size={60} className="text-muted mb-3" />
              <h4>No Universities Found</h4>
              <p className="text-muted">Try adjusting your filters or search term.</p>
            </div>
          </Col>
        )}
      </Row>

      <style>{`
        .uni-card {
          transition: transform 0.3s ease, shadow 0.3s ease;
        }
        .uni-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 1rem 3rem rgba(0,0,0,0.1) !important;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </Container>
  );
};

export default ProcessorApplyUniversity;

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Modal, Button, Form, Badge } from "react-bootstrap";
import { saveAs } from "file-saver";
import api from "../../../interceptors/axiosInterceptor";
import BASE_URL from "../../../Config";

// Fixed list of countries
const countryOptions = [
  "Hungary", "UK", "Cyprus", "Canada", "Malaysia", "Lithuania", 
  "Latvia", "Germany", "New Zealand", "Estonia", "Australia", 
  "South Korea", "Georgia", "Denmark", "Netherlands", "Sweden", 
  "Norway", "Belgium", "Romania", "Russia", "Turkey", "Ireland", 
  "USA", "Portugal", "Malta", "Slovakia", "Others"
];   

const ProcessorStudentDetails = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [travelInsuranceStatus, setTravelInsuranceStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [stepStatus, setStepStatus] = useState("");
  const [counselors, setCounselors] = useState([]);
  const [processors, setProcessors] = useState([]);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [selectedProcessor, setSelectedProcessor] = useState(null);
  const [followUpDate, setFollowUpDate] = useState("");
  const [notes, setNotes] = useState("");
  const [assignType, setAssignType] = useState("counselor");
  const navigate = useNavigate();
  
  // New states for search and country filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    full_name: "",
    student_email: "",
    mobile_number: "",
    country: "",
    gender: "",
    date_of_birth: ""
  });

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const pad = (n) => String(n).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Fetch data
  const fetchApplications = async () => {
    const processor_id = localStorage.getItem("user_id");

    try {
      const response = await api.get(
        `auth/getAssignedStudentsinProcessordashboard?processor_id=${processor_id}`
      );
      console.log("Api Response:", response.data);

      if (response.data) {
        setApplications(response.data.users);
        setFilteredApplications(response.data.users);
      } else {
        setApplications([]);
        setFilteredApplications([]);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      setApplications([]);
      setFilteredApplications([]);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Unique Universities & Students
  const uniqueUniversities = [
    ...new Set(applications.map((app) => app?.university_name || "")),
  ].filter(Boolean);

  const uniqueStudents = [
    ...new Set(applications.map((app) => app?.student_name || "")),
  ].filter(Boolean);

  // Filter Change
  useEffect(() => {
    let filtered = [...applications];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app?.full_name?.toLowerCase().includes(query) ||
        app?.student_email?.toLowerCase().includes(query) ||
        app?.university_name?.toLowerCase().includes(query) ||
        app?.identifying_name?.toLowerCase().includes(query) ||
        app?.mobile_number?.includes(query) ||
        app?.unique_id?.toLowerCase().includes(query)
      );
    }
    
    if (selectedUniversity) {
      filtered = filtered.filter(
        (app) => app?.university_name === selectedUniversity
      );
    }
    
    if (selectedCountry) {
      filtered = filtered.filter(
        (app) => app?.country === selectedCountry
      );
    }

    if (stepStatus) {
      if (stepStatus === "Application") {
        filtered = filtered.filter((app) => app?.Application_stage === "1");
      } else if (stepStatus === "Interview") {
        filtered = filtered.filter((app) => app?.Interview === "1");
      } else if (stepStatus === "Visa") {
        filtered = filtered.filter((app) => app?.Visa_process === "1");
      }
    }

    setFilteredApplications(filtered);
  }, [
    selectedUniversity,
    selectedStudent,
    travelInsuranceStatus,
    stepStatus,
    applications,
    searchQuery,
    selectedCountry
  ]);

  const handleExport = () => {
    const headers = ["#", "Name", "Email", "Mobile", "University", "Country", "Gender", "DOB"];
    const rows = filteredApplications.map((app, i) => [
      i + 1,
      app.full_name,
      app.student_email || "-",
      app.mobile_number,
      app.university_name || "-",
      app.country || "-",
      app.gender || "-",
      app.date_of_birth ? new Date(app.date_of_birth).toLocaleDateString() : "-"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(cell => `"${(cell || "").toString().replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `student_details_${new Date().toISOString().split("T")[0]}.csv`);
    Swal.fire("Success", "Report exported successfully!", "success");
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const processor_id = localStorage.getItem("user_id");
      const res = await api.post(`${BASE_URL}auth/processorAddStudent`, {
        ...newStudent,
        processor_id
      });
      
      if (res.status === 201 || res.status === 200) {
        Swal.fire("Success", "Student added successfully", "success");
        setShowAddModal(false);
        fetchApplications();
        setNewStudent({
          full_name: "",
          student_email: "",
          mobile_number: "",
          country: "",
          gender: "",
          date_of_birth: ""
        });
      }
    } catch (error) {
      console.error("Error adding student:", error);
      Swal.fire("Error", error.response?.data?.message || "Failed to add student", "error");
    }
  };

  // Calculate indexes
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredApplications.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="m-0">Assign Student Details</h3>
        <div className="d-flex gap-2">
          <Button variant="success" onClick={handleExport}>
            <i className="fa-solid fa-file-export me-2"></i> Export Report
          </Button>
        </div>
      </div>
      
      {/* Filters Section */}
      <div className="card mb-4 shadow-sm border-0" style={{ borderRadius: "12px" }}>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label fw-semibold">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="col-md-3">
              <label className="form-label fw-semibold">University</label>
              <select
                className="form-select"
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
              >
                <option value="">All Universities</option>
                {uniqueUniversities.map((uni, index) => (
                  <option key={index} value={uni}>{uni}</option>
                ))}
              </select>
            </div>
            
            <div className="col-md-3">
              <label className="form-label fw-semibold">Country</label>
              <select
                className="form-select"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
              >
                <option value="">All Countries</option>
                {countryOptions.map((country, index) => (
                  <option key={index} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">Process Status</label>
              <select
                className="form-select"
                value={stepStatus}
                onChange={(e) => setStepStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Application">Application Stage</option>
                <option value="Interview">Interview Stage</option>
                <option value="Visa">Visa Stage</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Table */}
      <div className="table-responsive shadow-sm rounded-3">
        <table className="table table-bordered table-hover mb-0">
          <thead className="table-light">
            <tr className="text-center align-middle">
              <th className="freeze-column">#</th>
              <th className="freeze-column">Student Name</th>
              <th>Email</th>
              <th>University</th>
              <th>Mobile</th>
              <th>Country</th>
              <th>DOB</th>
              <th>Gender</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems?.map((app, index) => (
                <tr key={app.id} className="text-center align-middle">
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td
                    style={{ cursor: "pointer", color: "#4F46E5", fontWeight: "600" }}
                    onClick={() => navigate(`/processorDetailsTable/${app.id}`)}
                  >
                    {app.full_name}
                  </td>
                  <td>{app.student_email || "-"}</td>
                  <td>{app.university_name || "-"}</td>
                  <td>{app.mobile_number}</td>
                  <td>{app.country || "-"}</td>
                  <td>{app.date_of_birth ? new Date(app.date_of_birth).toLocaleDateString() : "-"}</td>
                  <td>{app.gender || "-"}</td>
                  <td>
                    {app.Visa_process === "1" ? (
                      <Badge bg="success">Visa Stage</Badge>
                    ) : app.Interview === "1" ? (
                      <Badge bg="info">Interview Stage</Badge>
                    ) : app.Application_stage === "1" ? (
                      <Badge bg="primary">Application Stage</Badge>
                    ) : (
                      <Badge bg="secondary">Inquiry</Badge>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-4">
                  No applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav className="mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
            </li>
            {[...Array(totalPages)].map((_, i) => (
              <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
            </li>
          </ul>
        </nav>
      )}

      {/* Add Student Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>Add New Student</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleAddStudent}>
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="Enter student's full name"
                    value={newStudent.full_name}
                    onChange={(e) => setNewStudent({...newStudent, full_name: e.target.value})}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Email *</Form.Label>
                  <Form.Control
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={newStudent.student_email}
                    onChange={(e) => setNewStudent({...newStudent, student_email: e.target.value})}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Mobile Number *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="Enter mobile number"
                    value={newStudent.mobile_number}
                    onChange={(e) => setNewStudent({...newStudent, mobile_number: e.target.value})}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Country *</Form.Label>
                  <Form.Select
                    required
                    value={newStudent.country}
                    onChange={(e) => setNewStudent({...newStudent, country: e.target.value})}
                  >
                    <option value="">Select Country</option>
                    {countryOptions.map((c, i) => <option key={i} value={c}>{c}</option>)}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Gender</Form.Label>
                  <Form.Select
                    value={newStudent.gender}
                    onChange={(e) => setNewStudent({...newStudent, gender: e.target.value})}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    value={newStudent.date_of_birth}
                    onChange={(e) => setNewStudent({...newStudent, date_of_birth: e.target.value})}
                  />
                </Form.Group>
              </div>
            </div>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="light" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit" style={{ background: "#4F46E5", border: "none" }}>Add Student</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProcessorStudentDetails;
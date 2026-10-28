import React, { useState, useEffect } from "react";
import { Container, Card, Row, Col, Table, Badge, Button, Form, Modal } from "react-bootstrap";
import { FaCheckCircle, FaTimesCircle, FaEye, FaFilter, FaCloudUploadAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import api from "../../../interceptors/axiosInterceptor";
import BASE_URL from "../../../Config";
import Loader from "../../common/Loader";

const DocumentReview = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [universityFilter, setUniversityFilter] = useState("");
  const [docTypeFilter, setDocTypeFilter] = useState("");

  // Upload States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [assignedUniversities, setAssignedUniversities] = useState([]);
  const [uploadData, setUploadData] = useState({
    student_id: "",
    university_id: "",
    document_type: "",
    file: null
  });

  const docTypes = [
    "Passport",
    "SSC Certificate",
    "HSC Certificate",
    "Bachelor Certificate",
    "Master Certificate",
    "IELTS/English Test",
    "SOP (Statement of Purpose)",
    "CV/Resume",
    "Recommendation Letter",
    "Experience Letter",
    "Offer Letter",
    "Fee Receipt",
    "Visa Copy",
    "Other"
  ];

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const loginDetail = JSON.parse(localStorage.getItem("login_detail") || "{}");
      const role = loginDetail.role;
      const staff_id = loginDetail.staff_id || loginDetail.id;

      const res = await api.get(`${BASE_URL}studentUploads`, {
        params: { role, staff_id }
      });
      setDocuments(res.data);
      setFilteredDocuments(res.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      Swal.fire("Error", "Failed to fetch student documents", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const loginDetail = JSON.parse(localStorage.getItem("login_detail") || "{}");
      const role = loginDetail.role;
      const processor_id = localStorage.getItem("user_id");
      
      let res;
      if (role === 'admin' || role === 'masteradmin') {
        res = await api.get(`auth/getAllStudents`);
        setStudents(res.data || []);
      } else {
        res = await api.get(`auth/getAssignedStudentsinProcessordashboard?processor_id=${processor_id}`);
        setStudents(res.data?.users || []);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchStudentUniversities = async (studentId) => {
    if (!studentId) {
      setAssignedUniversities([]);
      return;
    }
    try {
      // Fetch applications for this student to get universities
      const res = await api.get(`auth/getVisaProcessBystudentidsss/${studentId}`);
      // The endpoint returns { success: true, data: rows }
      setAssignedUniversities(res.data.data || []);
    } catch (error) {
      console.error("Error fetching student universities:", error);
      setAssignedUniversities([]);
    }
  };

  useEffect(() => {
    if (uploadData.student_id) {
      fetchStudentUniversities(uploadData.student_id);
    } else {
      setAssignedUniversities([]);
    }
  }, [uploadData.student_id]);

  useEffect(() => {
    fetchDocuments();
    fetchStudents();
  }, []);

  useEffect(() => {
    let filtered = documents;
    
    if (statusFilter) {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }
    
    if (studentFilter) {
      filtered = filtered.filter(doc => 
        doc.student_name?.toLowerCase().includes(studentFilter.toLowerCase())
      );
    }

    if (countryFilter) {
      filtered = filtered.filter(doc => doc.country === countryFilter);
    }

    if (universityFilter) {
      filtered = filtered.filter(doc => doc.university_name === universityFilter);
    }

    if (docTypeFilter) {
      filtered = filtered.filter(doc => doc.document_type === docTypeFilter);
    }
    
    setFilteredDocuments(filtered);
  }, [statusFilter, studentFilter, countryFilter, universityFilter, docTypeFilter, documents]);

  const uniqueCountries = [...new Set(documents.map(d => d.country).filter(Boolean))];
  const uniqueUniversities = [...new Set(documents.map(d => d.university_name).filter(Boolean))];
  const uniqueDocTypes = [...new Set(documents.map(d => d.document_type).filter(Boolean))];

  const handleApprove = async (id) => {
    try {
      await api.put(`${BASE_URL}studentUploads/${id}/status`, { status: "approved" });
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Document Approved',
        showConfirmButton: false,
        timer: 1500
      });
      fetchDocuments();
    } catch (error) {
      console.error("Error approving document:", error);
      Swal.fire("Error", "Failed to approve document", "error");
    }
  };

  const handleReject = async (id) => {
    const { value: note } = await Swal.fire({
      title: 'Reject Document',
      input: 'textarea',
      inputLabel: 'Reason for Rejection (Visible to Student)',
      inputPlaceholder: 'e.g. Document is blurry, please re-upload...',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to write a reason for rejection!';
        }
      }
    });

    if (note) {
      try {
        await api.put(`${BASE_URL}studentUploads/${id}/status`, { 
          status: "rejected", 
          notes: note 
        });
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Document Rejected',
          showConfirmButton: false,
          timer: 1500
        });
        fetchDocuments();
      } catch (error) {
        console.error("Error rejecting document:", error);
        Swal.fire("Error", "Failed to reject document", "error");
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.student_id || !uploadData.document_type || !uploadData.file) {
      Swal.fire("Warning", "Please fill all fields", "warning");
      return;
    }

    const loginDetail = JSON.parse(localStorage.getItem("login_detail") || "{}");
    const role = loginDetail.role;
    const userId = loginDetail.id || localStorage.getItem("user_id");

    const formData = new FormData();
    formData.append("student_id", uploadData.student_id);
    formData.append("university_id", uploadData.university_id);
    formData.append("document_type", uploadData.document_type);
    formData.append("document", uploadData.file);
    formData.append("uploaded_by", role);
    formData.append("uploader_id", userId);

    try {
      setLoading(true);
      await api.post(`${BASE_URL}studentUploads`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      Swal.fire("Success", "Document uploaded successfully", "success");
      setShowUploadModal(false);
      fetchDocuments();
    } catch (error) {
      console.error("Error uploading document:", error);
      Swal.fire("Error", "Failed to upload document", "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved': return <Badge bg="success">Approved</Badge>;
      case 'rejected': return <Badge bg="danger">Rejected</Badge>;
      default: return <Badge bg="warning" text="dark">Pending</Badge>;
    }
  };

  return (
    <Container fluid className="py-4 mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Document Approvals</h2>
          <p className="text-muted mb-0">Review and verify student uploaded documents.</p>
        </div>
        <Button variant="primary" onClick={() => setShowUploadModal(true)} className="rounded-pill px-4">
          <FaCloudUploadAlt className="me-2"/> Upload Document
        </Button>
      </div>

      <Card className="shadow-sm border-0 rounded-4 mb-4">
        <Card.Body className="p-4 bg-light rounded-4">
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold text-secondary">Search Student</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Type student name..." 
                  value={studentFilter}
                  onChange={(e) => setStudentFilter(e.target.value)}
                  className="rounded-3 border-0 shadow-sm"
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label className="fw-semibold text-secondary">Status</Form.Label>
                <Form.Select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-3 border-0 shadow-sm"
                >
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label className="fw-semibold text-secondary">Country</Form.Label>
                <Form.Select 
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="rounded-3 border-0 shadow-sm"
                >
                  <option value="">All</option>
                  {uniqueCountries.map((c, i) => <option key={i} value={c}>{c}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label className="fw-semibold text-secondary">University</Form.Label>
                <Form.Select 
                  value={universityFilter}
                  onChange={(e) => setUniversityFilter(e.target.value)}
                  className="rounded-3 border-0 shadow-sm"
                >
                  <option value="">All</option>
                  {uniqueUniversities.map((u, i) => <option key={i} value={u}>{u}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label className="fw-semibold text-secondary">Doc Type</Form.Label>
                <Form.Select 
                  value={docTypeFilter}
                  onChange={(e) => setDocTypeFilter(e.target.value)}
                  className="rounded-3 border-0 shadow-sm"
                >
                  <option value="">All</option>
                  {uniqueDocTypes.map((t, i) => <option key={i} value={t}>{t}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm border-0 rounded-4">
        <Card.Body className="p-0">
          {loading ? (
            <Loader fullPage={false} text="Processing..." />
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-5">
              <h5 className="text-muted">No documents found matching the criteria.</h5>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3 border-0">Student Name</th>
                    <th className="py-3 border-0">University / Country</th>
                    <th className="py-3 border-0">Document Type</th>
                    <th className="py-3 border-0">Uploaded By</th>
                    <th className="py-3 border-0">Uploaded On</th>
                    <th className="py-3 border-0">Status</th>
                    <th className="px-4 py-3 border-0 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id}>
                      <td className="px-4 py-3">
                        <div className="fw-bold text-dark">{doc.student_name || `Student ID: ${doc.student_id}`}</div>
                        <div className="small text-muted">{doc.email}</div>
                      </td>
                      <td className="py-3">
                        <div className="fw-semibold">{doc.university_name || "-"}</div>
                        <div className="small text-muted">{doc.country || "-"}</div>
                      </td>
                      <td className="py-3 fw-semibold">{doc.document_type}</td>
                      <td className="py-3">
                        <Badge bg={(doc.uploaded_by === 'processor' || doc.uploaded_by === 'processors') ? "info" : doc.uploaded_by === 'admin' || doc.uploaded_by === 'masteradmin' ? "primary" : "secondary"} className="rounded-pill">
                          {(doc.uploaded_by === 'processor' || doc.uploaded_by === 'processors') ? "Processor" : doc.uploaded_by === 'admin' || doc.uploaded_by === 'masteradmin' ? "Admin" : "Student"}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted">
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        {getStatusBadge(doc.status)}
                      </td>
                      <td className="px-4 py-3 text-end">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2 rounded-pill px-3"
                          onClick={() => window.open(doc.file_url, '_blank')}
                          title="View Document"
                        >
                          <FaEye className="me-1"/> View
                        </Button>
                        
                        {doc.status !== 'approved' && (
                          <Button 
                            variant="success" 
                            size="sm" 
                            className="me-2 rounded-pill px-3 text-white"
                            onClick={() => handleApprove(doc.id)}
                            title="Approve"
                          >
                            <FaCheckCircle className="me-1"/> Approve
                          </Button>
                        )}
                        
                        {doc.status !== 'rejected' && (
                          <Button 
                            variant="danger" 
                            size="sm" 
                            className="rounded-pill px-3"
                            onClick={() => handleReject(doc.id)}
                            title="Reject"
                          >
                            <FaTimesCircle className="me-1"/> Reject
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Upload Modal */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>Upload Student Document</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleUpload}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Select Student *</Form.Label>
              <Form.Select 
                required
                value={uploadData.student_id}
                onChange={(e) => setUploadData({...uploadData, student_id: e.target.value})}
              >
                <option value="">Choose Student</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.email})</option>)}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Select University (Optional)</Form.Label>
              <Form.Select 
                value={uploadData.university_id}
                onChange={(e) => setUploadData({...uploadData, university_id: e.target.value})}
              >
                <option value="">Choose University</option>
                {assignedUniversities.map(u => (
                  <option key={u.id} value={u.university_id}>
                    {u.university_name || `University ID: ${u.university_id}`}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">Link this document to a specific application.</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Document Type *</Form.Label>
              <Form.Select 
                required
                value={uploadData.document_type}
                onChange={(e) => setUploadData({...uploadData, document_type: e.target.value})}
              >
                <option value="">Select Document Type</option>
                {docTypes.map((type, i) => <option key={i} value={type}>{type}</option>)}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Select File *</Form.Label>
              <Form.Control 
                type="file"
                required
                onChange={(e) => setUploadData({...uploadData, file: e.target.files[0]})}
              />
            </Form.Group>

            <div className="d-grid">
              <Button variant="primary" type="submit" disabled={loading} style={{ background: "#4F46E5", border: "none" }}>
                {loading ? "Uploading..." : "Upload Document"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default DocumentReview;


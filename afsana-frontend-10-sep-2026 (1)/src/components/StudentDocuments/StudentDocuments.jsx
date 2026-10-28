import React, { useState, useEffect } from "react";
import { Container, Card, Row, Col, Form, Button, Badge, Table, Spinner } from "react-bootstrap";
import { FaUpload, FaFilePdf, FaFileImage, FaTrash, FaEye } from "react-icons/fa";
import api from "../../interceptors/axiosInterceptor";
import BASE_URL from "../../Config";
import Swal from "sweetalert2";
import Loader from "../common/Loader";


const StudentDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    document_type: "",
    file: null
  });

  const studentId = localStorage.getItem("student_id");

  const documentTypes = [
    "Passport", "SSC Certificate", "HSC Certificate", "Bachelor Certificate",
    "IELTS/English Test", "CV", "SOP", "Medical Certificate", "Other"
  ];

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get(`${BASE_URL}studentUploads/${studentId}`);
      setDocuments(res.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchDocuments();
    }
  }, [studentId]);

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      file: e.target.files[0]
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.document_type || !formData.file) {
      Swal.fire("Error", "Please select a document type and a file", "error");
      return;
    }

    const data = new FormData();
    data.append("student_id", studentId);
    data.append("document_type", formData.document_type);
    data.append("document", formData.file);

    try {
      setUploading(true);
      await api.post(`${BASE_URL}studentUploads`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      Swal.fire("Success", "Document uploaded successfully", "success");
      setFormData({ document_type: "", file: null });
      document.getElementById("file-upload-input").value = "";
      fetchDocuments();
    } catch (error) {
      console.error("Upload error:", error);
      Swal.fire("Error", "Failed to upload document", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`${BASE_URL}studentUploads/${id}`);
        Swal.fire("Deleted!", "Your file has been deleted.", "success");
        fetchDocuments();
      } catch (error) {
        Swal.fire("Error", "Failed to delete document", "error");
      }
    }
  };

  const getStatusBadge = (status, notes) => {
    switch(status) {
      case 'approved': return <Badge bg="success">Approved</Badge>;
      case 'rejected': return (
        <div>
          <Badge bg="danger">Rejected</Badge>
          {notes && <div className="small text-danger mt-1" style={{fontSize: '0.75rem', maxWidth: '150px'}} title={notes}>
            Reason: {notes}
          </div>}
        </div>
      );
      default: return <Badge bg="warning" text="dark">Pending</Badge>;
    }
  };

  return (
    <Container fluid className="py-4 mt-5">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">My Documents</h2>
          <p className="text-muted">Upload and manage your required admission documents.</p>
        </Col>
      </Row>

      <Row>
        <Col lg={4} className="mb-4">
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Header className="bg-white border-0 pt-4 pb-0">
              <h5 className="fw-bold"><FaUpload className="me-2 text-primary"/> Upload New Document</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleUpload}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Document Type</Form.Label>
                  <Form.Select 
                    value={formData.document_type} 
                    onChange={(e) => setFormData({...formData, document_type: e.target.value})}
                    required
                  >
                    <option value="">Select Document Type</option>
                    {documentTypes.map((type, idx) => (
                      <option key={idx} value={type}>{type}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Select File</Form.Label>
                  <Form.Control 
                    type="file" 
                    id="file-upload-input"
                    onChange={handleFileChange}
                    required
                  />
                  <Form.Text className="text-muted">
                    Max size: 50MB. PDF, JPG, PNG formats accepted.
                  </Form.Text>
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 rounded-pill fw-bold"
                  disabled={uploading}
                >
                  {uploading ? <><Spinner size="sm" className="me-2"/>Uploading...</> : "Upload Document"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Header className="bg-white border-0 pt-4 pb-0">
              <h5 className="fw-bold">Uploaded Documents</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <Loader text="Fetching your documents..." />
              ) : documents.length === 0 ? (

                <div className="text-center py-5 text-muted">
                  <FaFilePdf size={50} className="mb-3 text-light" />
                  <h5>No documents uploaded yet</h5>
                  <p>Upload your first document using the form.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="align-middle border-top">
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0">Document Type</th>
                        <th className="border-0">File Name</th>
                        <th className="border-0">Status</th>
                        <th className="border-0 text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc) => (
                        <tr key={doc.id}>
                          <td className="fw-semibold text-dark">{doc.document_type}</td>
                          <td className="text-muted text-truncate" style={{maxWidth: "200px"}}>
                            {doc.original_name}
                          </td>
                          <td>{getStatusBadge(doc.status, doc.notes)}</td>
                          <td className="text-end">
                            <Button 
                              variant="light" 
                              size="sm" 
                              className="me-2 rounded-circle"
                              onClick={() => window.open(doc.file_url, '_blank')}
                              title="View Document"
                            >
                              <FaEye className="text-primary"/>
                            </Button>
                            {doc.status !== 'approved' && (
                              <Button 
                                variant="light" 
                                size="sm" 
                                className="rounded-circle text-danger"
                                onClick={() => handleDelete(doc.id)}
                                title="Delete Document"
                              >
                                <FaTrash />
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
        </Col>
      </Row>
    </Container>
  );
};

export default StudentDocuments;

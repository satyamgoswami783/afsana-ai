import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Badge, Spinner, Table } from "react-bootstrap";
import { FaUserTie, FaUserCog, FaHeadset, FaTicketAlt, FaPaperPlane } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../interceptors/axiosInterceptor";
import BASE_URL from "../../Config";
import Swal from "sweetalert2";

const ContactSupport = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("login");
  const studentId = localStorage.getItem("student_id");

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    priority: "medium",
    description: ""
  });

  const [assignedStaff, setAssignedStaff] = useState({
    counselor: null,
    processor: null
  });

  useEffect(() => {
    if (studentId) {
      fetchTickets();
      fetchAssignedStaff();
    }
  }, [studentId]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get(`${BASE_URL}supportTickets/student/${studentId}`);
      setTickets(res.data);
    } catch (error) {
      console.error("Failed to fetch tickets", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedStaff = async () => {
    try {
      // Assuming getAssignedCounselor API is available based on previous references
      const counselorRes = await api.get(`${BASE_URL}auth/getAssignedCounselor/${studentId}`);
      
      setAssignedStaff({
        counselor: counselorRes.data?.[0] || null,
        processor: null // Adjust logic if processor assignment API is available
      });
    } catch (error) {
      console.error("Failed to fetch assigned staff", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.description) {
      Swal.fire("Error", "Subject and description are required.", "error");
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`${BASE_URL}supportTickets`, {
        ...formData,
        student_id: studentId
      });
      Swal.fire("Success", "Support ticket submitted successfully.", "success");
      setFormData({ subject: "", priority: "medium", description: "" });
      fetchTickets();
    } catch (error) {
      console.error("Failed to submit ticket", error);
      Swal.fire("Error", "Failed to submit support ticket.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const openChat = (receiverId) => {
    if (role === "student") {
      navigate(`/chat/${receiverId || 1}`);
    } else {
      navigate("/chatList");
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'open': return <Badge bg="warning" text="dark">Open</Badge>;
      case 'in_progress': return <Badge bg="primary">In Progress</Badge>;
      case 'resolved': return <Badge bg="success">Resolved</Badge>;
      case 'closed': return <Badge bg="secondary">Closed</Badge>;
      default: return <Badge bg="light" text="dark">{status}</Badge>;
    }
  };

  return (
    <Container fluid className="py-4 mt-5">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Contact & Support</h2>
          <p className="text-muted">Get in touch with your dedicated team or raise a support ticket.</p>
        </Col>
      </Row>

      {/* Contact Cards Row */}
      <Row className="g-4 mb-5">
        {/* Dedicated Counselor */}
        <Col md={4}>
          <Card className="h-100 shadow-sm border-0 rounded-4 text-center hover-lift">
            <Card.Body className="p-4">
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                <FaUserTie size={30} className="text-primary" />
              </div>
              <h5 className="fw-bold">My Counselor</h5>
              {assignedStaff.counselor ? (
                <>
                  <p className="mb-1 fw-semibold">{assignedStaff.counselor.full_name}</p>
                  <p className="text-muted small mb-3">For university and admission queries.</p>
                  <Button variant="outline-primary" className="rounded-pill px-4 w-100" onClick={() => openChat(assignedStaff.counselor.id)}>
                    Message Counselor
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-muted small mb-3 mt-2">No counselor assigned yet.</p>
                  <Button variant="outline-secondary" className="rounded-pill px-4 w-100" disabled>
                    Unavailable
                  </Button>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Dedicated Processor */}
        <Col md={4}>
          <Card className="h-100 shadow-sm border-0 rounded-4 text-center hover-lift">
            <Card.Body className="p-4">
              <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                <FaUserCog size={30} className="text-info" />
              </div>
              <h5 className="fw-bold">My Processor</h5>
              {assignedStaff.processor ? (
                <>
                  <p className="mb-1 fw-semibold">{assignedStaff.processor.full_name}</p>
                  <p className="text-muted small mb-3">For visa and document processing queries.</p>
                  <Button variant="outline-info" className="rounded-pill px-4 w-100" onClick={() => openChat(assignedStaff.processor.id)}>
                    Message Processor
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-muted small mb-3 mt-2">No processor assigned yet.</p>
                  <Button variant="outline-secondary" className="rounded-pill px-4 w-100" disabled>
                    Unavailable
                  </Button>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* General Support */}
        <Col md={4}>
          <Card className="h-100 shadow-sm border-0 rounded-4 text-center hover-lift">
            <Card.Body className="p-4">
              <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                <FaHeadset size={30} className="text-success" />
              </div>
              <h5 className="fw-bold">General Support</h5>
              <p className="text-muted small mb-3 mt-2">For technical issues or general assistance.</p>
              <Button variant="success" className="rounded-pill px-4 w-100" onClick={() => openChat(1)}>
                Live Chat Support
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Ticketing System Row */}
      <Row className="g-4">
        {/* Ticket Submission Form */}
        <Col lg={4}>
          <Card className="shadow-sm border-0 rounded-4 h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-0">
              <h5 className="fw-bold"><FaTicketAlt className="me-2 text-primary"/> Raise a Ticket</h5>
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handleSubmitTicket}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-secondary small">Subject</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Brief description of the issue"
                    required
                    className="border-0 bg-light rounded-3 py-2"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-secondary small">Priority</Form.Label>
                  <Form.Select 
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="border-0 bg-light rounded-3 py-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-secondary small">Description</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide details about your query or issue..."
                    required
                    className="border-0 bg-light rounded-3 py-2"
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 rounded-pill fw-bold"
                  disabled={submitting}
                >
                  {submitting ? <Spinner size="sm" className="me-2"/> : <FaPaperPlane className="me-2"/>}
                  Submit Ticket
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Ticket History */}
        <Col lg={8}>
          <Card className="shadow-sm border-0 rounded-4 h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-0">
              <h5 className="fw-bold">My Tickets</h5>
            </Card.Header>
            <Card.Body className="p-4">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <FaTicketAlt size={50} className="mb-3 text-light" />
                  <h5>No tickets found</h5>
                  <p>You haven't raised any support tickets yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="align-middle border-top">
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0">Ticket ID</th>
                        <th className="border-0">Subject</th>
                        <th className="border-0">Priority</th>
                        <th className="border-0">Status</th>
                        <th className="border-0 text-end">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td className="fw-bold text-secondary">#{ticket.id}</td>
                          <td className="fw-semibold text-dark">{ticket.subject}</td>
                          <td>
                            <span className={`badge bg-${ticket.priority === 'high' ? 'danger' : ticket.priority === 'medium' ? 'warning' : 'info'}`}>
                              {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                            </span>
                          </td>
                          <td>{getStatusBadge(ticket.status || 'open')}</td>
                          <td className="text-end text-muted small">
                            {new Date(ticket.created_at).toLocaleDateString()}
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

      <style jsx="true">{`
        .hover-lift {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
        }
      `}</style>
    </Container>
  );
};

export default ContactSupport;

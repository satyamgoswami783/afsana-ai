import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Form, Nav } from "react-bootstrap";
import { FaClipboardList, FaPlus, FaFilter, FaCalendarAlt, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import api from "../../../interceptors/axiosInterceptor";
import BASE_URL from "../../../Config";
import Swal from "sweetalert2";
import Loader from "../../common/Loader";

const ProcessorTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  
  // Assign Task Modal States
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [newTask, setNewTask] = useState({
    student_id: "",
    task_name: "",
    description: "",
    priority: "Medium",
    due_date: ""
  });

  const processorId = localStorage.getItem("user_id");

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get(`${BASE_URL}tasks/processor/${processorId}`);
      setTasks(res.data || []);
      setFilteredTasks(res.data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      // Fallback for demo if API doesn't exist yet
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get(`auth/getAssignedStudentsinProcessordashboard?processor_id=${processorId}`);
      setStudents(res.data?.users || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchStudents();
  }, []);

  useEffect(() => {
    let filtered = [...tasks];

    if (activeTab === "pending") {
      filtered = filtered.filter(t => t.status !== "Completed");
    } else if (activeTab === "completed") {
      filtered = filtered.filter(t => t.status === "Completed");
    } else if (activeTab === "priority") {
      filtered = filtered.filter(t => t.priority === "High" && t.status !== "Completed");
    }

    if (dateFilter) {
      filtered = filtered.filter(t => t.due_date && t.due_date.startsWith(dateFilter));
    }

    setFilteredTasks(filtered);
  }, [activeTab, dateFilter, tasks]);

  const handleAssignTask = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post(`${BASE_URL}tasks`, {
        ...newTask,
        assigned_by: processorId,
        assigned_to_role: "student"
      });
      Swal.fire("Success", "Task assigned successfully!", "success");
      setShowAssignModal(false);
      fetchTasks();
      setNewTask({ student_id: "", task_name: "", description: "", priority: "Medium", due_date: "" });
    } catch (error) {
      console.error("Error assigning task:", error);
      Swal.fire("Error", "Failed to assign task", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await api.patch(`${BASE_URL}tasks/${taskId}`, { status: newStatus });
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Task updated',
        showConfirmButton: false,
        timer: 1500
      });
      fetchTasks();
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'High': return <Badge bg="danger">High</Badge>;
      case 'Medium': return <Badge bg="warning" text="dark">Medium</Badge>;
      default: return <Badge bg="info">Low</Badge>;
    }
  };

  return (
    <Container fluid className="py-4 mt-5">
      {loading && <Loader text="Updating..." />}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0"><FaClipboardList className="me-2 text-primary"/> Task Management</h2>
          <p className="text-muted">Manage and assign tasks to your students.</p>
        </div>
        <Button 
          variant="primary" 
          className="rounded-pill px-4 shadow-sm"
          style={{ background: "#4F46E5", border: "none" }}
          onClick={() => setShowAssignModal(true)}
        >
          <FaPlus className="me-2"/> Assign New Task
        </Button>
      </div>

      <Row className="mb-4 g-3">
        <Col md={8}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-2">
              <Nav variant="pills" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="task-nav">
                <Nav.Item>
                  <Nav.Link eventKey="all" className="rounded-3">All Tasks</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="pending" className="rounded-3">Pending</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="priority" className="rounded-3">High Priority</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="completed" className="rounded-3">Completed</Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <div className="d-flex align-items-center bg-white p-2 rounded-4 shadow-sm border">
            <FaCalendarAlt className="mx-3 text-muted" />
            <Form.Control 
              type="date" 
              className="border-0 shadow-none" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3 border-0">Student</th>
                <th className="py-3 border-0">Task Description</th>
                <th className="py-3 border-0">Priority</th>
                <th className="py-3 border-0">Due Date</th>
                <th className="py-3 border-0">Status</th>
                <th className="px-4 py-3 border-0 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length > 0 ? filteredTasks.map(task => (
                <tr key={task.id}>
                  <td className="px-4">
                    <div className="fw-bold">{task.student_name}</div>
                    <div className="small text-muted">{task.student_id}</div>
                  </td>
                  <td>
                    <div className="fw-semibold">{task.task_name}</div>
                    <div className="small text-muted text-truncate" style={{maxWidth: "200px"}}>{task.description}</div>
                  </td>
                  <td>{getPriorityBadge(task.priority)}</td>
                  <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : "No Date"}</td>
                  <td>
                    <Badge bg={task.status === "Completed" ? "success" : "warning"} text={task.status === "Completed" ? "white" : "dark"}>
                      {task.status || "Pending"}
                    </Badge>
                  </td>
                  <td className="px-4 text-end">
                    {task.status !== "Completed" ? (
                      <Button 
                        variant="outline-success" 
                        size="sm" 
                        className="rounded-pill px-3"
                        onClick={() => handleStatusUpdate(task.id, "Completed")}
                      >
                        <FaCheckCircle className="me-1"/> Done
                      </Button>
                    ) : (
                      <span className="text-success"><FaCheckCircle/> Completed</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <FaClipboardList size={40} className="text-muted mb-3 d-block mx-auto"/>
                    <p className="text-muted">No tasks found for the current filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* Assign Task Modal */}
      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>Assign Task to Student</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleAssignTask}>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Select Student *</Form.Label>
                  <Form.Select 
                    required 
                    value={newTask.student_id}
                    onChange={(e) => setNewTask({...newTask, student_id: e.target.value})}
                  >
                    <option value="">Choose a student</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.student_email})</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Task Name *</Form.Label>
                  <Form.Control 
                    type="text" 
                    required 
                    placeholder="e.g. Upload Passport Copy"
                    value={newTask.task_name}
                    onChange={(e) => setNewTask({...newTask, task_name: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Description</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3} 
                    placeholder="Provide details about the task..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Priority</Form.Label>
                  <Form.Select 
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Due Date *</Form.Label>
                  <Form.Control 
                    type="date" 
                    required 
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="light" onClick={() => setShowAssignModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit" style={{ background: "#4F46E5", border: "none" }}>Assign Task</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <style>{`
        .task-nav .nav-link {
          color: #6B7280;
          font-weight: 500;
          padding: 10px 20px;
        }
        .task-nav .nav-link.active {
          background-color: #4F46E5 !important;
          color: white !important;
        }
        .task-nav .nav-link:hover:not(.active) {
          background-color: #F3F4F6;
        }
      `}</style>
    </Container>
  );
};

export default ProcessorTasks;

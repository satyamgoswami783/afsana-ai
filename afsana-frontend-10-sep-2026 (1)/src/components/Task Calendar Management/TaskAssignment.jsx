import { useEffect, useState } from "react";
import {
  Container,
  Table,
  Button,
  Card,
  Form,
  Row,
  Col,
  Badge,
  Modal,
} from "react-bootstrap";
import BASE_URL from "../../Config";
import api from "../../interceptors/axiosInterceptor";
import Swal from "sweetalert2";
import Loader from "../common/Loader";


const AdminTaskManager = () => {
  const [tasks, setTasks] = useState([])
  const [studentdata, setStudentsData] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [staffList, setStaffList] = useState([]); // All staff: counselors, processors, staff
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(tasks.length / itemsPerPage);

  const paginatedTasks = tasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await api.get(`${BASE_URL}auth/getAllStudents`);
        setStudentsData(response.data);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [])


  useEffect(() => {
    const fetchAllStaff = async () => {
      setLoading(true);
      let combined = [];

      // 1. Fetch Counselors
      try {
        const res = await api.get(`${BASE_URL}counselor`);
        const data = Array.isArray(res.data) ? res.data : [];
        setCounselors(data);
        combined = [...combined, ...data.map(c => ({ ...c, type: 'Counselor' }))];
      } catch (err) {
        console.error("Failed to fetch counselors", err);
      }

      // 2. Fetch Processors
      try {
        const res = await api.get(`${BASE_URL}getAllProcessors`);
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        combined = [...combined, ...data.map(p => ({ ...p, type: 'Processor' }))];
      } catch (err) {
        console.error("Failed to fetch processors", err);
      }

      // 3. Fetch Staff
      try {
        const res = await api.get(`${BASE_URL}getAllStaff`);
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        combined = [...combined, ...data.map(s => ({ ...s, type: 'Staff' }))];
      } catch (err) {
        console.error("Failed to fetch staff", err);
      }

      // Remove duplicates (based on full_name)
      const uniqueStaff = combined.filter((v, i, a) => 
        a.findIndex(t => t.full_name === v.full_name) === i
      );
      
      setStaffList(uniqueStaff);
      setLoading(false);
    };


    fetchAllStaff();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get(`${BASE_URL}task`);
      setTasks(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTasks();
  }, []);

  const [form, setForm] = useState({
    student: "",
    counselor: "",
    title: "",
    due: "",
    description: "",
    priority: "",
    status: "",
    relatedTo: "",
    relatedItem: "",
    assignedTo: "",
    assignedDate: "",
    finishingDate: "",
    attachment: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const handleChange = (e) => {
    if (e.target.type === "file") {
      setForm({ ...form, [e.target.name]: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async () => {
    if (!form.student || !form.title || !form.due || !form.description || !form.priority || !form.status || !form.relatedTo || !form.relatedItem || !form.assignedTo || !form.assignedDate || !form.finishingDate) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in all required fields (*) before saving.",
      });
      return;
    }

    const user_id = localStorage.getItem("user_id");

    const taskData = {
      title: form.title,
      user_id,
      due_date: form.due,
      counselor_id: form.counselor,
      student_id: form.student,
      description: form.description,
      priority: form.priority,
      status: form.status,
      related_to: form.relatedTo,
      related_item: form.relatedItem,
      assigned_to: form.assignedTo,
      assigned_date: form.assignedDate,
      finishing_date: form.finishingDate,
      attachment: form.attachment,
    };

    const formData = new FormData();
    Object.keys(taskData).forEach(key => {
      if (taskData[key] !== null && taskData[key] !== undefined) {
        formData.append(key, taskData[key]);
      }
    });

    try {
      let response;
      if (editId) {
        response = await api.put(`${BASE_URL}task/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        response = await api.post(`${BASE_URL}task`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      if (response.status === 201 || response.status === 200) {
        await fetchTasks();

        Swal.fire({
          icon: "success",
          title: editId ? "Task Updated!" : "Task Created!",
          text: `The task was successfully ${editId ? "updated" : "assigned"}.`,
        });

        setForm({
          student: "",
          counselor: "",
          title: "",
          due: "",
          description: "",
          priority: "",
          status: "",
          relatedTo: "",
          relatedItem: "",
          assignedTo: "",
          assignedDate: "",
          finishingDate: "",
          attachment: "",
        });

        setEditId(null);
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error occurred while saving the task:", error);
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: error.response?.data?.message || "Task saving failed. Please try again.",
      });
    }
  };


  const handleEdit = (task) => {
    setForm({
      student: task.student_id || "",
      counselor: task.counselor_id || "",
      title: task.title || "",
      due: task.due_date ? task.due_date.split('T')[0] : "",
      description: task.description || "",
      priority: task.priority || "",
      status: task.status || "",
      relatedTo: task.related_to || "",
      relatedItem: task.related_item || "",
      assignedTo: task.assigned_to || "",
      assignedDate: task.assigned_date ? task.assigned_date.split('T')[0] : "",
      finishingDate: task.finishing_date ? task.finishing_date.split('T')[0] : "",
      attachment: task.attachment || "",
    });
    setEditId(task.id);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditId(null);
    setForm({
      student: "",
      counselor: "",
      title: "",
      due: "",
      description: "",
      priority: "",
      status: "",
      relatedTo: "",
      relatedItem: "",
      assignedTo: "",
      assignedDate: "",
      finishingDate: "",
      attachment: "",
    });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${BASE_URL}task/${id}`, {
            method: "DELETE",
          });
          const data = await response.json();
          if (response.ok) {
            setTasks(tasks.filter((task) => task.id !== id));
            Swal.fire("Deleted!", "The task has been deleted.", "success");
          } else {
            console.error("Failed to delete task:", data);
            Swal.fire("Error", "Failed to delete task.", "error");
          }
        } catch (error) {
          console.error("Error occurred while deleting the task:", error);
          Swal.fire("Error", "Something went wrong while deleting.", "error");
        }
      }
    });
  };


  return (
    <Container className="mt-4">
      {loading && <Loader text="Loading Tasks..." />}

      <h3 className="mb-4">Admin - Task Manager</h3>

      <Card className="mb-3">
        <Card.Body>
          <Row>
            <Col>
              <Button onClick={() => setShowModal(true)}>Assign New Task</Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Table bordered hover responsive className="text-center text-nowrap">
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Task</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Attachment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTasks.map((task, index) => (
                <tr key={task?.id}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>{task?.student_name}</td>
                  <td>{task?.title}</td>
                  <td>{new Date(task?.due_date).toLocaleDateString()}</td>
                  <td>
                    {/* <Badge
                      bg={
                        task?.status === "completed"
                          ? "success"
                          : task?.status === "pending"
                            ? "warning"
                            : "secondary"
                      }
                    >
                      {task?.status === "completed" ? "Completed" : "Pending"}
                    </Badge> */}

                    <Badge
                      bg={
                        task?.status === "Complete"
                          ? "success"
                          : task?.status === "Pending"
                            ? "warning"
                            : "secondary"
                      }
                    >
                      {task?.status === "Complete" ? "Completed" : "Pending"}
                    </Badge>
                  </td>
                  <td>
                    {task?.attachment ? (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => window.open(task.attachment, "_blank")}
                      >
                        View
                      </Button>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-1"
                      onClick={() => handleEdit(task)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(task?.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}

              {tasks.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center">No tasks assigned yet.</td>
                </tr>
              )}
            </tbody>

          </Table>
        </Card.Body>
      </Card>
      <div className="mt-4 d-flex justify-content-center">
        <nav>
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                &laquo;
              </button>
            </li>

            {[...Array(totalPages)].map((_, i) => (
              <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}

            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                &raquo;
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editId ? "Edit Task" : "Assign New Task"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Task Title *</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter task title"
                />
              </Col>
              <Col md={6}>
                <Form.Label>Due Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="due"
                  value={form.due}
                  onChange={handleChange}
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Counselor *</Form.Label>
                <Form.Select
                  name="counselor"
                  value={form.counselor}
                  onChange={handleChange}
                >
                  <option value="">Select Counselor</option>
                  {counselors.map((counselor) => (
                    <option key={counselor.id} value={counselor.id}>
                      {counselor.full_name}
                    </option>
                  ))}
                </Form.Select>

              </Col>
              <Col md={6}>
                <Form.Label>Student *</Form.Label>
                <Form.Select
                  name="student"
                  value={form.student}
                  onChange={handleChange}
                >
                  <option value="">Select Student</option>
                  {studentdata.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.full_name}
                    </option>
                  ))}
                </Form.Select>
              </Col>

            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter task description"
                maxLength={200}
              />
              <Form.Text muted>0/200 characters</Form.Text>
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Priority *</Form.Label>
                <Form.Select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                >
                  <option>Select Priority</option>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Status *</Form.Label>
                <Form.Select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option>Select Status</option>
                  <option>Pending</option>
                  <option>Completed</option>
                </Form.Select>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Related To *</Form.Label>
                <Form.Select
                  name="relatedTo"
                  value={form.relatedTo}
                  onChange={handleChange}
                >
                  <option>Select</option>
                  <option>Application</option>
                  <option>Visa</option>
                  <option>Interview</option>
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Related Item *</Form.Label>
                <Form.Control
                  type="text"
                  name="relatedItem"
                  value={form.relatedItem}
                  onChange={handleChange}
                  placeholder="Enter related item"
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Label>Assigned To *</Form.Label>
                <Form.Select
                  name="assignedTo"
                  value={form.assignedTo}
                  onChange={handleChange}
                >
                  <option value="">Select Staff</option>
                  {staffList.map((staff) => (
                    <option key={`${staff.id}-${staff.type}`} value={staff.full_name}>
                      {staff.full_name} ({staff.type})
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label>Assigned Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="assignedDate"
                  value={form.assignedDate}
                  onChange={handleChange}
                />
              </Col>
              <Col md={4}>
                <Form.Label>Finishing Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="finishingDate"
                  value={form.finishingDate}
                  onChange={handleChange}
                />
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Attach File</Form.Label>
              <Form.Control
                type="file"
                name="attachment"
                onChange={handleChange}
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button
                variant="danger"
                className="me-2"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button variant="dark" onClick={handleSave}>
                {editId ? "Update Task" : "Add Task"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminTaskManager;

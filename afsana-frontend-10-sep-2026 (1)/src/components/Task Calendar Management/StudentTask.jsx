import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Badge,
  Form,
  Modal,
} from "react-bootstrap";
import api from "../../interceptors/axiosInterceptor";

const MyTasks = () => {
  const [studentid, setStudentId] = useState("");
  const [tasksData, setTasksData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [note, setNote] = useState("");
  const [image, setImage] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const is_id = localStorage.getItem("student_id");
    if (is_id) {
      setStudentId(is_id);
    }
  }, []);

  useEffect(() => {
    if (studentid) {
      fetchTasks();
    }
  }, [studentid]);

  const fetchTasks = async () => {
    try {
      const response = await api.get(`student_task/${studentid}`);
      setTasksData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      if (error?.response?.status === 404) {
        setTasksData([]);
      } else {
        console.error("Error fetching tasks:", error);
      }
    }
  };

  const [isCompleted, setIsCompleted] = useState(false);

  const handleShowModal = (task) => {
    setSelectedTask(task);
    setNote(task.notes || "");
    setImage(null);
    setIsCompleted(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTask(null);
    setNote("");
    setImage(null);
    setIsCompleted(false);
  };

  const handleNoteSend = async () => {
    if (!selectedTask) return;

    const formData = new FormData();
    formData.append("notes", note);
    if (image) {
      formData.append("image", image);
    }
    if (isCompleted) {
      formData.append("status", "Complete");
    }

    try {
      await api.patch(`update_task/${selectedTask.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert(isCompleted ? "Task completed successfully!" : "Notes and image sent successfully.");
      handleCloseModal();
      fetchTasks();
    } catch (error) {
      console.error("Error sending notes and image:", error);
      alert("Failed to send notes.");
    }
  };

  // Filter tasks based on active filter
  const filteredTasks = tasksData.filter((task) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Pending") return task.status === "Pending";
    if (activeFilter === "In Progress") return task.status === "In Progress";
    if (activeFilter === "Completed") return task.status === "Complete";
    return true;
  });

  // Count tasks by status
  const taskCounts = {
    All: tasksData.length,
    Pending: tasksData.filter((t) => t.status === "Pending").length,
    "In Progress": tasksData.filter((t) => t.status === "In Progress").length,
    Completed: tasksData.filter((t) => t.status === "Complete").length,
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">My Tasks</h2>

      {/* Filter Tabs */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        {["All", "Pending", "In Progress", "Completed"].map((filter) => (
          <Button
            key={filter}
            size="sm"
            variant={activeFilter === filter ? "primary" : "outline-secondary"}
            onClick={() => setActiveFilter(filter)}
            style={{ borderRadius: "20px", padding: "6px 18px", fontWeight: 500 }}
          >
            {filter}{" "}
            <Badge bg={activeFilter === filter ? "light" : "secondary"} text={activeFilter === filter ? "primary" : "light"} pill className="ms-1">
              {taskCounts[filter]}
            </Badge>
          </Button>
        ))}
      </div>

      <Card>
        <Card.Body>
          <Table bordered hover responsive className="text-center">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Description</th>
                <th>Due Date</th>
                <th>Priority</th>
                <th>Status</th>

                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task, index) => (
                  <tr key={task.id}>
                    <td>{index + 1}</td>
                    <td>{task.title}</td>
                    <td>{task.description}</td>
                    <td>{new Date(task.due_date).toLocaleDateString()}</td>
                    <td>
                      <Badge
                        bg={
                          task.priority === "High"
                            ? "danger"
                            : task.priority === "Medium"
                              ? "warning"
                              : "info"
                        }
                      >
                        {task.priority}
                      </Badge>
                    </td>
                    <td>
                      <Badge
                        bg={
                          task.status === "Complete"
                            ? "success"
                            : task.status === "Pending"
                              ? "secondary"
                              : task.status === "In Progress"
                                ? "primary"
                                : task.status === "Pending Approval"
                                  ? "warning"
                                  : "danger"
                        }
                      >
                        {task.status}
                      </Badge>
                    </td>

                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={task.status?.toString().trim().toLowerCase() === "complete"}
                        onClick={() => handleShowModal(task)}
                        title={
                          task.status?.toString().trim().toLowerCase() === "complete"
                            ? "Task already completed"
                            : "Upload Notes & Image"
                        }
                      >
                        Upload Notes & Image
                      </button>

                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    No tasks found for "{activeFilter}" filter.
                  </td>
                </tr>
              )}
            </tbody>


          </Table>
        </Card.Body>
      </Card>

      {/* Modal for Upload Notes & Image */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Upload Notes & Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTask && (
            <>
              <p>
                <strong>Task:</strong> {selectedTask.title}
              </p>
              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  required
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Upload Image</Form.Label>
                <Form.Control
                  type="file"
                  required
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check 
                  type="checkbox"
                  label="Mark as Completed"
                  checked={isCompleted}
                  onChange={(e) => setIsCompleted(e.target.checked)}
                  className="fw-bold text-success"
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleNoteSend}>
            Send
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MyTasks;

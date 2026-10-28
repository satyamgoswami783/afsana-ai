import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import api from "../../interceptors/axiosInterceptor";
import BASE_URL from "../../Config";
import Swal from "sweetalert2";

const AssignStaffModal = ({ show, onHide, inquiry, onAssigned }) => {
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && inquiry?.branch) {
      fetchStaff();
      // Also reset state on open
      setSelectedStaff(inquiry.assigned_staff_id || "");
    }
  }, [show, inquiry]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await api.get(`${BASE_URL}getAllStaffbybranch?branch=${encodeURIComponent(inquiry.branch)}`);
      if (res.data && res.data.success) {
        setStaffList(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      setStaffList([]); // If no staff found or error
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedStaff) {
      Swal.fire("Warning", "Please select a staff member", "warning");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        inquiry_id: inquiry.id,
        staff_id: selectedStaff,
      };
      const res = await api.post(`${BASE_URL}assignLeadToStaff`, payload);
      
      if (res.status === 200) {
        Swal.fire("Success", "Lead assigned to staff successfully", "success");
        onAssigned();
        onHide();
      }
    } catch (error) {
      console.error("Error assigning staff:", error);
      Swal.fire("Error", "Failed to assign lead", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Assign Staff</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <strong>Lead/Inquiry:</strong> {inquiry?.full_name} <br/>
          <strong>Branch:</strong> {inquiry?.branch}
        </p>
        <Form.Group>
          <Form.Label>Select Staff *</Form.Label>
          <Form.Select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            disabled={loading || staffList.length === 0}
          >
            <option value="">-- Select Staff --</option>
            {staffList.map((staff) => (
              <option key={staff.staff_id || staff.id} value={staff.staff_id || staff.id}>
                {staff.full_name}
              </option>
            ))}
          </Form.Select>
          {staffList.length === 0 && !loading && (
            <Form.Text className="text-danger">
              No staff members found in branch: {inquiry?.branch}
            </Form.Text>
          )}
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleAssign}
          disabled={loading || !selectedStaff}
        >
          {loading ? "Assigning..." : "Assign"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignStaffModal;

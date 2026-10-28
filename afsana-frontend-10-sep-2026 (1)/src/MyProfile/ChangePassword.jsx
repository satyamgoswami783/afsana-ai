import React, { useState } from "react";
import { Container, Form, Button, Alert, Card, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaLock, FaKey, FaShieldAlt, FaArrowLeft } from "react-icons/fa";
import api from "../interceptors/axiosInterceptor";

const ChangePassword = () => {
  const navigate = useNavigate();
  const loginDetail = JSON.parse(localStorage.getItem("login_detail"));
  const userId = loginDetail?.id;

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Please fill all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New Password and Confirm Password do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`auth/changePassword/${userId}`, {
        password: oldPassword,
        newPassword: newPassword,
      });

      if (response.status === 200) {
        setMessage("Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => navigate("/profile"), 2000);
      } else {
        setError(response.data.message || "Failed to update password.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error changing password. Please verify your old password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-start mb-4">
        <Button 
          variant="link" 
          onClick={() => navigate("/profile")} 
          className="text-decoration-none p-0 d-flex align-items-center gap-2"
          style={{ color: "#4F46E5", fontWeight: "600" }}
        >
          <FaArrowLeft /> Back to Profile
        </Button>
      </div>
      
      <div className="d-flex justify-content-center">
        <Card className="shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: "500px", width: "100%" }}>
          <div style={{ background: "linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)", padding: "40px 20px", textAlign: "center", color: "white" }}>
            <div className="bg-white bg-opacity-25 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "70px", height: "70px" }}>
              <FaShieldAlt size={35} />
            </div>
            <h3 className="fw-bold mb-0">Secure Your Account</h3>
            <p className="opacity-75 mt-2 mb-0">Update your password to stay protected</p>
          </div>
          
          <Card.Body className="p-4 p-md-5">
            {message && <Alert variant="success" className="border-0 rounded-3 shadow-sm">{message}</Alert>}
            {error && <Alert variant="danger" className="border-0 rounded-3 shadow-sm">{error}</Alert>}

            <Form onSubmit={handleChangePassword}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold small text-uppercase text-secondary">Current Password</Form.Label>
                <InputGroup className="bg-light rounded-3 overflow-hidden">
                  <InputGroup.Text className="bg-transparent border-0 text-secondary">
                    <FaLock />
                  </InputGroup.Text>
                  <Form.Control
                    type="password"
                    placeholder="Enter current password"
                    className="bg-transparent border-0 py-2 ps-0"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    style={{ boxShadow: "none" }}
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold small text-uppercase text-secondary">New Password</Form.Label>
                <InputGroup className="bg-light rounded-3 overflow-hidden">
                  <InputGroup.Text className="bg-transparent border-0 text-secondary">
                    <FaKey />
                  </InputGroup.Text>
                  <Form.Control
                    type="password"
                    placeholder="Enter new password"
                    className="bg-transparent border-0 py-2 ps-0"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ boxShadow: "none" }}
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold small text-uppercase text-secondary">Confirm New Password</Form.Label>
                <InputGroup className="bg-light rounded-3 overflow-hidden">
                  <InputGroup.Text className="bg-transparent border-0 text-secondary">
                    <FaKey />
                  </InputGroup.Text>
                  <Form.Control
                    type="password"
                    placeholder="Confirm new password"
                    className="bg-transparent border-0 py-2 ps-0"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ boxShadow: "none" }}
                  />
                </InputGroup>
              </Form.Group>

              <Button 
                variant="primary" 
                type="submit" 
                className="w-100 py-3 rounded-3 fw-bold mt-2"
                style={{ 
                  background: "linear-gradient(to right, #4F46E5, #3730A3)",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.4)"
                }}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default ChangePassword;   

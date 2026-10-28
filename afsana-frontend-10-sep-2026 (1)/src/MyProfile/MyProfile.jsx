import React, { useState, useEffect } from "react";
import { Card, ListGroup, Container, Row, Col, Form, Button, Modal } from "react-bootstrap";
import api from "../interceptors/axiosInterceptor"; // your axios setup with interceptors

const MyProfile = () => {
  const loginDetail = JSON.parse(localStorage.getItem("login_detail"));
  const role = loginDetail?.role;

  const [showModal, setShowModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
    date_of_birth: "",
    father_name: "",
    photo_file: null, // New field for the file object
    // admission_no: "",
    // id_no: "",
    category: "",
    role: "",
    university_name: "",
    status: ""
  });

  // ✅ Fetch profile data
  const fetchUserData = async () => {
    if (!loginDetail) return;

    try {
      const res = await api.get(`auth/getUser/${loginDetail.id}`);

      if (res.data.user) {
        setUserData(res.data.user);
        setFormData({
          full_name: res.data.user.full_name || "",
          email: res.data.user.email || "",
          phone: res.data.user.phone || "",
          address: res.data.user.address || "",
          gender: res.data.user.gender || "",
          date_of_birth: res.data.user.date_of_birth ? res.data.user.date_of_birth.split("T")[0] : "",
          father_name: res.data.user.father_name || "",
          // admission_no: res.data.user.admission_no || "",
          // id_no: res.data.user.id_no || "",
          category: res.data.user.category || "",
          role: res.data.user.role || "",
          university_name: res.data.user.university_name || "",
          status: res.data.user.status || "",
          university_id: res.data.user.university_id || 0
        });
      }
    } catch (error) {
      console.error("Failed to fetch user data: ", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // ✅ Form input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Profile update handler
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      // 1. If a new photo is selected, upload it first
      let updatedPhotoUrl = userData?.photo;
      if (formData.photo_file) {
        const photoFormData = new FormData();
        photoFormData.append("photo", formData.photo_file);
        
        // Use main user ID for all roles
        const userId = loginDetail.id;
        
        const photoRes = await api.put(`auth/updateProfilePhoto/${userId}`, photoFormData);
        updatedPhotoUrl = photoRes.data.photo;
        
        // Update login_detail for Navbar
        const updatedDetail = { ...loginDetail, photo: updatedPhotoUrl };
        localStorage.setItem("login_detail", JSON.stringify(updatedDetail));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('loginDetailUpdated'));
      }

      // 2. Update the rest of the profile
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "photo_file") {
          data.append(key, value);
        }
      });

      const res = await api.put(`auth/updateUser/${loginDetail.id}`, data);

      if (res.status === 200) {
        alert("Profile updated successfully!");
        setShowModal(false);
        fetchUserData();
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile: ", error);
      alert("An error occurred while updating the profile.");
    }
  };

  // ✅ Helper for displaying profile fields
  const renderItem = (label, value) => {
    if (!value) return null;
    return (
      <ListGroup.Item className="d-flex justify-content-between align-items-center py-3 px-4 border-0 border-bottom">
        <span className="fw-semibold text-secondary">{label}</span>
        <span className="fw-medium text-dark">{value}</span>
      </ListGroup.Item>
    );
  };

  // ✅ Show message if no user logged in
  if (!loginDetail) {
    return (
      <Container className="mt-5 text-center">
        <h4 className="text-muted">No user is logged in.</h4>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm rounded-4 border-0 overflow-hidden">
            <Card.Header as="h4" className="text-center bg-primary text-white py-3 fw-bold">
              My Profile
            </Card.Header>

            <div className="text-center py-4 bg-light border-bottom position-relative">
              <div className="position-relative d-inline-block">
                <img 
                  src={userData?.photo || "https://via.placeholder.com/150"} 
                  alt="Profile" 
                  className="rounded-circle shadow-sm border border-white border-4"
                  style={{ width: "120px", height: "120px", objectFit: "cover" }}
                />
                <label 
                  htmlFor="photo-upload" 
                  className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2 shadow-sm cursor-pointer"
                  style={{ cursor: "pointer", width: "35px", height: "35px", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <i className="fa fa-camera small"></i>
                  <input 
                    type="file" 
                    id="photo-upload" 
                    className="d-none" 
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      const formData = new FormData();
                      formData.append("photo", file);

                      try {
                        // Pass the main user ID instead of student_id
                        const userId = loginDetail.id;
                        
                        const res = await api.put(`auth/updateProfilePhoto/${userId}`, formData);
                        
                        if (res.data.photo) {
                          alert("Photo updated!");
                          setUserData(prev => ({ ...prev, photo: res.data.photo }));
                          // Also update login_detail in localStorage so Navbar updates
                          const updatedDetail = { ...loginDetail, photo: res.data.photo };
                          localStorage.setItem("login_detail", JSON.stringify(updatedDetail));
                          // Trigger events for Navbar to pick up
                          window.dispatchEvent(new Event('storage'));
                          window.dispatchEvent(new Event('loginDetailUpdated'));
                        }
                      } catch (err) {
                        console.error("Photo upload failed", err);
                        alert("Failed to upload photo");
                      }
                    }}
                  />
                </label>
              </div>
              <h5 className="mt-3 mb-0 fw-bold text-dark">{userData?.full_name}</h5>
              <p className="text-muted small text-uppercase mb-0">{userData?.role}</p>
            </div>

            <ListGroup variant="flush">
              {/* 🔄 Counselor View */}
              {role === "counselor" ? (
                <>
                  {renderItem("Status", userData?.status)}
                  {renderItem("University", userData?.university_name)}
                  {renderItem("Phone", userData?.phone)}
                </>
              ) : (
                <>
                  {renderItem("Full Name", userData?.full_name)}
                  {renderItem("Email", userData?.email)}
                  {renderItem("Phone", userData?.phone)}
                  {renderItem("Gender", userData?.gender)}
                  {renderItem("Date of Birth", userData?.date_of_birth && new Date(userData.date_of_birth).toLocaleDateString())}
                  {renderItem("Address", userData?.address)}
                  {renderItem("Father's Name", userData?.father_name)}
                  {renderItem("Admission No.", userData?.admission_no)}
                  {renderItem("ID No.", userData?.id_no)}
                </>
              )}
            </ListGroup>


            <Card.Footer className="text-center bg-light d-flex justify-content-center gap-3 py-3">
              <Button variant="primary" className="px-4 rounded-pill fw-bold" onClick={() => setShowModal(true)}>
                Update Profile
              </Button>
              <Button 
                variant="outline-secondary" 
                className="px-4 rounded-pill fw-bold"
                onClick={() => window.location.href = "/change-password"}
              >
                Change Password
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      {/* ✅ Update Profile Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateProfile}>
            
            {/* Profile Photo Selection */}
            <Form.Group className="mb-3">
              <Form.Label>Profile Photo</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setFormData(prev => ({ ...prev, photo_file: e.target.files[0] }))}
              />
              <Form.Text className="text-muted">
                Choose a new photo to update your profile picture.
              </Form.Text>
            </Form.Group>

            {/* Full Name (Only Admin & Student) */}
            {(loginDetail.role === "admin" || loginDetail.role === "student") && (
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  name="full_name"
                  value={formData.full_name || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            )}

            {/* Email (Only Admin & Student) */}
            {(loginDetail.role === "admin" || loginDetail.role === "student") && (
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            )}

            {/* Phone (All roles) */}
            {(loginDetail.role === "admin" || loginDetail.role === "student" || loginDetail.role === "counselor") && (
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            )}

            {/* Address (Only Admin & Student) */}
            {(loginDetail.role === "admin" || loginDetail.role === "student") && (
              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            )}

            {/* Gender (Only Student) */}
            {loginDetail.role === "student" && (
              <Form.Group className="mb-3">
                <Form.Label>Gender</Form.Label>
                <Form.Select
                  name="gender"
                  value={formData.gender || ""}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </Form.Select>
              </Form.Group>
            )}

            {/* DOB (Only Student) */}
            {loginDetail.role === "student" && (
              <Form.Group className="mb-3">
                <Form.Label>Date of Birth</Form.Label>
                <Form.Control
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            )}

            {/* Father's Name (Only Student) */}
            {loginDetail.role === "student" && (
              <Form.Group className="mb-3">
                <Form.Label>Father's Name</Form.Label>
                <Form.Control
                  type="text"
                  name="father_name"
                  value={formData.father_name || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            )}

            {/* University (Only Counselor & Student) */}
            {(loginDetail.role === "counselor" || loginDetail.role === "student") && (
              <Form.Group className="mb-3">
                <Form.Label>University</Form.Label>
                <Form.Control
                  type="text"
                  name="university_name"
                  value={formData.university_name || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            )}

            {/* Status (Only Counselor) */}
            {loginDetail.role === "counselor" && (
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Control
                  type="text"
                  name="status"
                  value={formData.status || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            )}

            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Form>
        </Modal.Body>


      </Modal>
    </Container>
  );
};

export default MyProfile;





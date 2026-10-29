import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import api from "../interceptors/axiosInterceptor";
import { IoChevronBackCircleSharp } from "react-icons/io5";
import "./Login.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        role: "student",
      };

      const response = await api.post("auth/createStudent", payload); // Adjust endpoint if needed

      toast.success("Signup successful! You can now login.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error?.response?.data?.message || "Signup failed. Please try again.");
    }
  };

  return (
    <main className="login-page-wrapper">
      <div className="login-card-container">
        {/* Left Campus Showcase Section */}
        <div className="login-showcase-panel">
          <img
            src="/img/landing_hero_campus.jpg"
            alt="International University Campus"
            className="login-showcase-bg"
          />
          <div className="login-showcase-overlay" />

          <div className="login-showcase-top">
            <div className="login-badge-pill">
              <span className="login-badge-dot" />
              <span>Kiaan Technology Global</span>
            </div>
          </div>

          <div className="login-showcase-bottom">
            <h2 className="login-showcase-heading">
              Start Your <span>Global Journey</span>
            </h2>
            <p className="login-showcase-desc">
              Create your student account to explore top international universities, apply for programs, and track your admission & visa process seamlessly.
            </p>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="login-form-panel">
          <div className="login-header">
            <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
              <img src="/img/kiaan_logo.png" alt="Kiaan Technology" height="42" style={{ objectFit: "contain" }} />
              <div className="text-start">
                <div className="fw-bold" style={{ fontSize: "1.2rem", lineHeight: 1 }}>Kiaan</div>
                <div style={{ fontSize: "0.62rem", color: "#10b981", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700 }}>Technology</div>
              </div>
            </div>
            <h2 className="login-title">
              Student <span className="login-title-accent">Register</span>
            </h2>
            <p className="login-subtitle">Create your account to begin your study abroad application</p>
          </div>

          <form onSubmit={handleSignup} className="login-form">
            {/* Full Name */}
            <div className="login-input-group">
              <FaUser className="login-input-icon" />
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                className="login-input-field"
                required
              />
            </div>

            {/* Email */}
            <div className="login-input-group">
              <FaEnvelope className="login-input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="login-input-field"
                required
              />
            </div>

            {/* Password */}
            <div className="login-input-group">
              <FaLock className="login-input-icon" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="login-input-field"
                required
              />
            </div>

            <button type="submit" className="login-submit-btn mt-2">
              Sign Up
            </button>
          </form>

          <div className="text-center mt-4">
            <Link
              to="/login"
              style={{
                color: "#10b981",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.92rem",
              }}
            >
              Already have an account? Log in
            </Link>
            <div className="mt-3">
              <Link to="/" className="login-back-home-btn d-inline-flex align-items-center justify-content-center gap-2 text-decoration-none">
                <IoChevronBackCircleSharp size={18} /> Back To Home
              </Link>
            </div>
          </div>

          <ToastContainer />
        </div>
      </div>
    </main>
  );
};

export default Signup;

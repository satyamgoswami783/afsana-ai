import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../Config";
import "./Login.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}auth/forgotPassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      if (data.success || data.message) {
        alert(data.message || 'Reset link sent successfully!');
      } else {
        alert('Reset link sent (no message from server)');
      }
    } catch (error) {
      alert('Error sending reset link. Please try again.');
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-form-panel shadow-lg" style={{ maxWidth: "440px", width: "100%", borderRadius: "24px", border: "1px solid rgba(16, 185, 129, 0.28)" }}>
        <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
          <img src="/img/kiaan_logo.png" alt="Kiaan Technology" height="40" style={{ objectFit: "contain" }} />
          <div className="text-start">
            <div className="fw-bold" style={{ fontSize: "1.15rem", lineHeight: 1 }}>Kiaan</div>
            <div style={{ fontSize: "0.6rem", color: "#10b981", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700 }}>Technology</div>
          </div>
        </div>
        <h4 className="text-center mb-2 fw-bold login-title" style={{ fontSize: "1.5rem" }}>Forgot Password</h4>
        <p className="text-center login-subtitle mb-4">Enter your registered email to receive a password reset link</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input
              type="email"
              className="form-control login-input-field"
              style={{ paddingLeft: "16px" }}
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="d-grid gap-2 mt-4">
            <button type="submit" className="login-submit-btn">
              Send Reset Link
            </button>
            <button
              type="button"
              className="login-back-home-btn mt-2"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;

// import React, { useState } from "react";
// 
// 
// const ResetPassword = () => {
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   // Extract token from query params
//   const queryParams = new URLSearchParams(location.search);
//   const token = queryParams.get("token");
//   console.log(token)
//   const handleSubmit = (e) => {
//     e.preventDefault();
// 
//     if (password !== confirmPassword) {
//       alert("Passwords do not match!");
//       return;
//     }
// 
//     // TODO: Send password to backend API
//     alert("Password reset successfully!");
//   };
// 
//   return (
//     <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light">
//       <div className="card shadow p-4" style={{ maxWidth: "400px", width: "100%" , borderRadius: "12px" }}>
//         <h4 className="text-center fw-bold mb-4">Reset Your Password</h4>
//         <form onSubmit={handleSubmit}>
//           <div className="mb-3">
//             <label className="form-label">New Password</label>
//             <input
//               type="password"
//               className="form-control"
//               placeholder="Enter new password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>
//           <div className="mb-4">
//             <label className="form-label">Confirm Password</label>
//             <input
//               type="password"
//               className="form-control"
//               placeholder="Confirm new password"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               required
//             />
//           </div>
//           <div className="d-grid">
//             <button type="submit" className="btn btn-primary">
//               Reset Password
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };
// 
// export default ResetPassword;

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BASE_URL from "../Config";
import "./Login.css";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // Extract token from query params
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}auth/resetPassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          newPassword: password,
          confirmPassword: confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Password has been reset successfully!");
        navigate("/login");
      } else {
        alert(data.message || "Failed to reset password");
      }
    } catch (error) {
      alert("An error occurred while resetting the password.");
      console.error(error);
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
        <h4 className="text-center fw-bold mb-2 login-title" style={{ fontSize: "1.5rem" }}>Reset Your Password</h4>
        <p className="text-center login-subtitle mb-4">Enter and confirm your new password below</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">New Password</label>
            <input
              type="password"
              className="form-control login-input-field"
              style={{ paddingLeft: "16px" }}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold">Confirm Password</label>
            <input
              type="password"
              className="form-control login-input-field"
              style={{ paddingLeft: "16px" }}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="d-grid">
            <button type="submit" className="login-submit-btn">
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

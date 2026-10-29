import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import BASE_URL from "../Config";
// import axios from 'axios';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
import { IoChevronBackCircleSharp } from "react-icons/io5";

import axios from "axios";
import api from "../interceptors/axiosInterceptor";
import { auth, provider, signInWithPopup } from "../interceptors/firebase"; // adjust path as needed
import RegisterDeviceToken from "./RegisterDeviceToken";
import { ThemeContext } from "../context/ThemeContext";
import "./Login.css";

const Login = ({ setLogin }) => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    const role = localStorage.getItem("role");

    if (authToken && role) {
      if (role === "admin") {
        navigate("/dashboard");
      } else if (role === "student") {
        navigate("/dashboardvisa");
      } else if (role === "counselor") {
        navigate("/councelor");
      } else if (role === "staff") {
        navigate("/staffDashboard");
      } else if (role === "processors") {
        navigate("/processorsDashboard");
      } else if (role === "masteradmin") {
        navigate("/masterDashboard");
      }
    }
  }, []);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const [gpsData, setGpsData] = useState(null);
  const [gpsStatus, setGpsStatus] = useState("pending");

  const getPositionWithFallback = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      // First attempt: High Accuracy (for Mobile / GPS hardware devices)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy };
          setGpsData(coords);
          setGpsStatus("captured");
          console.log("📍 High-Accuracy GPS Captured:", coords);
          resolve(coords);
        },
        (err) => {
          console.warn("High accuracy GPS failed/timed out, trying standard Wi-Fi location...", err.message);
          // Second attempt: Standard Accuracy (for Desktop PCs / Laptops)
          navigator.geolocation.getCurrentPosition(
            (pos2) => {
              const coords = { latitude: pos2.coords.latitude, longitude: pos2.coords.longitude, accuracy: pos2.coords.accuracy };
              setGpsData(coords);
              setGpsStatus("captured");
              console.log("📍 Standard Wi-Fi Location Captured:", coords);
              resolve(coords);
            },
            (err2) => {
              console.warn("Standard location also failed/unavailable:", err2.message);
              setGpsStatus("denied");
              resolve(null);
            },
            { enableHighAccuracy: false, timeout: 6000, maximumAge: 10000 }
          );
        },
        { enableHighAccuracy: true, timeout: 4000, maximumAge: 0 }
      );
    });
  };

  const requestLocation = () => {
    getPositionWithFallback();
  };

  useEffect(() => {
    // Automatically trigger browser location prompt on login page load
    requestLocation();
  }, []);

  const getUserLocation = async () => {
    if (gpsData) return gpsData;
    return await getPositionWithFallback();
  };

  const handleLogin = async (e) => {
    e.preventDefault();  // Prevent form submission default behavior

    if (!formData.email || !formData.password) {
      toast.error("Please enter email and password.");
      return;
    }

    try {
      let gpsLocation = gpsData;
      if (!gpsLocation) {
        gpsLocation = await getUserLocation();
      }
      const payload = { ...formData, ...gpsLocation };
      console.log("🚀 SENDING LOGIN PAYLOAD WITH GPS COORDS:", payload);
      const response = await axios.post(`${BASE_URL}auth/login`, payload);
      const { token, user } = response.data;
      const role = user.role;

      if (role && token) {
        setLogin(role);
        localStorage.setItem("login", role);
        localStorage.setItem("role", user.role);
        localStorage.setItem("authToken", token);
        localStorage.setItem("user_id", user.id);
        localStorage.setItem("login_detail", JSON.stringify(response.data.user));
        localStorage.setItem("counselor_id", user.counselor_id);
        localStorage.setItem("student_id", user.student_id);

        const permissionsResponse = await api.get(`permission?role_name=${role}`);
        const userpermissionsResponse = await api.get(`permissions?user_id=${user.id}`);
        localStorage.setItem("permissions", JSON.stringify(permissionsResponse.data));
        localStorage.setItem("userpermissions", JSON.stringify(userpermissionsResponse.data));
        setIsLoggedIn(true);
        // Cross-tab login sync
        localStorage.setItem('authEvent', Date.now());

        Swal.fire({
          title: 'Success!',
          text: 'You have logged in successfully.',
          icon: 'success',
          confirmButtonText: 'Ok',
        }).then(() => {
          if (role === "admin") {
            navigate("/dashboard");
          } else if (role === "student") {
            navigate("/dashboardvisa");
          } else if (role === "counselor") {
            navigate("/councelor");
          } else if (role === "staff") {
            navigate("/staffDashboard");
          } else if (role === "processors") {
            navigate("/processorsDashboard");
          } else if (role === "masteradmin") {
            navigate("/masterDashboard");
          }
        });
      } else {
        toast.error("Invalid credentials! Please check your email or password.");
      }

    } catch (error) {
      console.error("Error during login:", error);
      if (error.response && error.response.status === 401) {
        toast.error("Invalid credentials! Please try again.");
      } else {
        toast.error("Something went wrong. Please try again later.");
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken(); // Firebase token

      // Call your backend Google login API
      const response = await axios.post(`${BASE_URL}auth/student/google-signup`, { token });

      const { token: authToken, user } = response.data;

      if (user.role !== "student") {
        toast.error("Only students are allowed to login from Google!");
        return;
      }

      // Save user info in localStorage
      setLogin(user.role);
      localStorage.setItem("login", user.role);
      localStorage.setItem("role", user.role);
      localStorage.setItem("authToken", authToken);
      localStorage.setItem("user_id", user.id);
      localStorage.setItem("login_detail", JSON.stringify(user));
      localStorage.setItem("counselor_id", user.counselor_id);
      localStorage.setItem("student_id", user.student_id);

      // Fetch permissions
      const permissionsResponse = await api.get(`permission?role_name=${user.role}`);
      const userpermissionsResponse = await api.get(`permissions?user_id=${user.id}`);
      localStorage.setItem("permissions", JSON.stringify(permissionsResponse.data));
      localStorage.setItem("userpermissions", JSON.stringify(userpermissionsResponse.data));

      // Cross-tab login sync
      localStorage.setItem('authEvent', Date.now());

      // Show success alert
      Swal.fire({
        title: "Success!",
        text: "Google login successful for Student Portal.",
        icon: "success",
        confirmButtonText: "Ok",
      });

      // Redirect to Student dashboard
      setTimeout(() => {
        navigate("/dashboardvisa");
      }, 300);

    } catch (error) {
      console.error("Google Sign-in error:", error);

      // Show backend message if available, else fallback message
      const backendMessage =
        error?.response?.data?.message || "Google login failed. Try again.";

      toast.error(backendMessage);
    }
  };

  return (
    <main className="login-page-wrapper">
      <div className="login-card-container">
        {/* Left Showcase Panel with 4K Student Image */}
        <div className="login-showcase-panel">
          <img
            src="/img/student_login_hero.jpg"
            alt="International University Student"
            className="login-showcase-bg"
          />
          <div className="login-showcase-overlay" />

          {/* Top Badge */}
          <div className="login-showcase-top">
            <div className="login-badge-pill">
              <span className="login-badge-dot" />
              <span>Kiaan Technology Global</span>
            </div>
          </div>

          {/* Bottom Content / Highlights */}
          <div className="login-showcase-bottom">
            <h2 className="login-showcase-heading">
              Shape Your <span>Global Future</span>
            </h2>
            <p className="login-showcase-desc">
              Access 500+ top universities worldwide. Seamless application tracking, counselor guidance, and visa processing all in one place.
            </p>
            <div className="login-stats-grid">
              <div className="login-stat-chip">
                <strong>500+</strong> Universities
              </div>
              <div className="login-stat-chip">
                <strong>98.5%</strong> Visa Rate
              </div>
              <div className="login-stat-chip">
                <strong>30+</strong> Countries
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="login-form-panel">
          {/* Top-right Theme Toggle Button */}
          <div className="login-theme-toggle-wrap">
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
          </div>

          {/* Brand Header */}
          <div className="login-brand-header">
            <Link to="/">
              <img
                src="/img/kiaan_logo.png"
                alt="Kiaan Technology"
                className="login-brand-logo"
              />
            </Link>
            <h1 className="login-title">
              Student <span className="login-title-accent">Recruitment</span>
            </h1>
            <p className="login-subtitle">
              Enter your credentials to securely access your portal
            </p>
          </div>

          {/* Location Permission Status Indicator */}
          {gpsStatus === "captured" && (
            <div className="login-location-banner granted">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FaCheckCircle style={{ color: "#10b981", fontSize: "1rem" }} />
                <span>GPS Location Verified (Secure Session)</span>
              </div>
            </div>
          )}
          {gpsStatus === "pending" && (
            <div className="login-location-banner pending">
              <span>📍 Allow location for security verification</span>
              <button
                type="button"
                onClick={requestLocation}
                className="login-allow-location-btn"
              >
                Allow Location
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div className="login-input-group">
              <FaUser className="login-input-icon" />
              <input
                type="email"
                name="email"
                className="login-input-field"
                placeholder="Enter your username or email"
                value={formData.email}
                autoComplete="off"
                onChange={handleChange}
                required
              />
            </div>

            <div className="login-input-group">
              <FaLock className="login-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="login-input-field"
                style={{ paddingRight: "48px" }}
                autoComplete="off"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="login-password-toggle"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button type="submit" className="login-submit-btn">
              <span>Sign In to Portal</span>
              <span>→</span>
            </button>

            {isLoggedIn && <RegisterDeviceToken />}
          </form>

          {/* Footer Actions */}
          <div className="login-actions-footer">
            <Link to="/forgotpassword" className="login-forgot-link">
              Forgot Password?
            </Link>

            <Link to="/" className="login-back-home-btn">
              <IoChevronBackCircleSharp style={{ fontSize: "1.15rem" }} />
              <span>Back To Home</span>
            </Link>
          </div>
        </div>
      </div>
      <ToastContainer />
    </main>
  );
};

export default Login;

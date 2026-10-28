import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BASE_URL from "../Config";
// import axios from 'axios';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUser, FaLock } from "react-icons/fa";
import { IoChevronBackCircleSharp } from "react-icons/io5";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import axios from "axios";
import api from "../interceptors/axiosInterceptor";
import { auth, provider, signInWithPopup } from "../interceptors/firebase"; // adjust path as needed
import RegisterDeviceToken from "./RegisterDeviceToken";

const Login = ({ setLogin }) => {
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
    }
    else if (role === "processors") {
      navigate("/processorsDashboard");
    }
     else if (role === "masteradmin") {
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
    <main style={{
      display: "flex", minHeight: "100vh", backgroundColor: "#b4ccf0",
      alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        backgroundColor: "#fff",
        width: "90%",
        maxWidth: "1000px",
        display: "flex",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 8px 16px rgba(0,0,0,0.1)"
      }}>


        {/* Left Image Section */}
        <div className="loginimg" style={{
          flex: 1,
          backgroundColor: "#eef3fc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px"
        }}>
          <img src="https://abcschool.institute.org.in/assets/images/student-login-2.svg" alt="Student"
            style={{ maxWidth: "100%", height: "auto" }} />
        </div>

        {/* Right Form Section */}
        <div style={{ flex: 1, padding: "40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ color: "#1d4ed8", marginBottom: "10px" }}>Student Recruitment</h2>
          <p style={{ marginBottom: "20px", color: "#555" }}>Enter your details to login to your account</p>
          {/* Divider */}


          {/* Google Button */}
<>
  <style>
    {`
      .google-login-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        background-color: #fff;
        color: #444;
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 10px;
        width: 100%;
        font-weight: 500;
        font-size: 15px;
        cursor: pointer;
        transition: background 0.3s;
        text-align: center;
      }

      .google-login-btn:hover {
        background-color: #f7f7f7;
      }

      .google-login-btn img {
        width: 22px;
        height: 22px;
        object-fit: contain;
      }

      @media (max-width: 480px) {
        .google-login-btn {
          font-size: 14px;
          padding: 8px;
        }

        .google-login-btn img {
          width: 20px;
          height: 20px;
        }
      }
    `}
  </style>

  {/* <button className="google-login-btn" onClick={handleGoogleLogin}>
    <img
      src="https://developers.google.com/identity/images/g-logo.png"
      alt="Google"
    />
    <span>Continue with Google</span>
  </button> */}
</>




          <div style={{
            display: "flex",
            alignItems: "center",
            margin: "20px 0"
          }}>
            <hr style={{ flex: 1, border: "none", height: "1px", backgroundColor: "#ccc" }} />
            <hr style={{ flex: 1, border: "none", height: "1px", backgroundColor: "#ccc" }} />
          </div>

          {/* Location Permission Status Indicator */}
          {gpsStatus === "captured" && (
            <div style={{ backgroundColor: "#d1e7dd", color: "#0f5132", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "15px", display: "flex", alignItems: "center" }}>
              <i className="fa-solid fa-circle-check" style={{ marginRight: "8px", fontSize: "16px", color: "#198754" }}></i>
              <span>Location Access Granted (GPS Active)</span>
            </div>
          )}
          {gpsStatus === "pending" && (
            <div style={{ backgroundColor: "#fff3cd", color: "#664d03", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "15px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span><i className="fa-solid fa-location-crosshairs" style={{ marginRight: "8px" }}></i> Allow location for exact login security</span>
              <button type="button" onClick={requestLocation} style={{ backgroundColor: "#1d4ed8", color: "#fff", border: "none", padding: "4px 12px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>Allow Location</button>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "15px", position: "relative" }}>
              <FaUser style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#888"
              }} />
              <input type="email" name="email"
                placeholder="Enter your username/email"
                value={formData.email}
                autoComplete="off"
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 10px 10px 40px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  outline: "none"
                }} required />
            </div>
            <div style={{ marginBottom: "20px", position: "relative" }}>
              <FaLock style={{
                position: "absolute", left: "12px",
                top: "50%", transform: "translateY(-50%)", color: "#888"
              }} />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="off"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 40px 10px 40px", // leave room for the icon
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  outline: "none"
                }}
                required
              />

              {/* Eye Icon Toggle */}
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#888"
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>


            <button type="submit" style={{
              width: "100%", padding: "10px", borderRadius: "8px",
              backgroundColor: "#1d4ed8", color: "#fff", border: "none",
              fontWeight: "bold",
              cursor: "pointer"
            }}>Login </button>
             {isLoggedIn && <RegisterDeviceToken />}
          </form>

          <div style={{
            marginTop: "20px",
            textAlign: "center", fontSize: "14px", color: "#666"
          }}>

            {/* <Link
              to="/signup"
              style={{
                color: "#1d4ed8",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              You don't have an account? signup
            </Link> */}
            {/* <p style={{ marginTop: "15px" }}>
              Don’t have an account? <a href="#" style={{ color: "#1d4ed8" }}>Sign up Now</a>
            </p> */}
            <div className="">
              <Link to="/forgotpassword" >
              <p className="" style={{color:"blue" , fontSize:"bold" ,cursor:"pointer"}}>Forgot Password</p>
           </Link>
            </div>
            <div className="mt-4">


              <Link to="/" style={{
                width: "35%",
                padding: "8px",
                borderRadius: "8px",
                backgroundColor: "#1d4ed8",
                color: "#fff",
                border: "none",
                cursor: "pointer"
              }}>
                <IoChevronBackCircleSharp />  Back To Home
              </Link>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </main>
  );
};

export default Login;

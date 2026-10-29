// import React, { useEffect, useRef, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   Bell,
//   MessageCircle,
//   UserCircle,
//   LogOut,
//   ChevronDown,
// } from "lucide-react";
// import { io } from "socket.io-client";
// import "../layout/Navbar.css";
// import BASE_URL from "../Config";

// const socket = io(`https://afsana-backend-production-0897.up.railway.app`, {
//   reconnection: true,
//   reconnectionAttempts: Infinity,
//   reconnectionDelay: 1000,
// });

// const Navbar = ({ toggleSidebar }) => {
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const navigate = useNavigate();
//   const dropdownRef = useRef(null);

//   const loginDetail = JSON.parse(localStorage.getItem("login_detail"));
//   const loginName = loginDetail?.full_name;
//   const userRole = loginDetail?.role;
//   const student_id = loginDetail?.student_id || null;
//   const counselor_id = loginDetail?.counselor_id || null;
//    const staff_id = loginDetail?.staff_id || null;
//    let processor_id = loginDetail?.id && loginDetail.id !== 1 ? loginDetail.id : null;
//   const user_id = localStorage.getItem("user_id");

//   if(userRole === "staff"){
//    processor_id = staff_id;
//   }  
//   // ✅ Initial load + socket listeners
//   useEffect(() => {
//     // fetch notifications
//     socket.emit("getDashboardData", { student_id, counselor_id, processor_id, staff_id });

//     // listen for response
//     socket.on("dashboardDataResponse", (data) => {
//       if (data.success) {
//         console.log("📩 dashboardDataResponse:", data);
//         setNotifications(data.data || []);
//       }
//     });

//     // listen for broadcast update
//     socket.on("dashboardUpdated", (data) => {
//       if (
//         student_id === data.student_id ||
//         counselor_id === data.counselor_id ||
//         processor_id === data.processor_id ||
//         staff_id === data.staff_id
//       ) {
//         socket.emit("getDashboardData", {
//           student_id,
//           counselor_id,
//           processor_id,
//           staff_id
//         });
//       }
//     });

//     // listen for clear response
//     socket.on("updateDashboardResponse", (data) => {
//       console.log("📩 updateDashboardResponse received:", data);
//       if (data.success) {
//         console.log("✅ Notifications cleared successfully, refetching...");
//         socket.emit("getDashboardData", {
//           student_id,
//           counselor_id,
//           processor_id,
        
//         });
//       } else {
//         console.error("❌ Failed to clear notifications:", data);
//       }
//     });

//     return () => {
//       socket.off("dashboardDataResponse");
//       socket.off("dashboardUpdated");
//       socket.off("updateDashboardResponse");
//     };
//   }, [student_id, counselor_id, processor_id]);

//   // ✅ Clear All handler
//   const handleClearAllNotifications = () => {
//     console.log("🔔 Clear All clicked by role:", userRole);

//     if (userRole === "student" && student_id) {
//       console.log("➡️ Sending clear request for Student:", student_id);
//       socket.emit("updateDashboardNotification", {
//         student_id,
//         sNotification: "0",
//       });
//     } else if (userRole === "counselor" && counselor_id) {
//       console.log("➡️ Sending clear request for Counselor:", counselor_id);
//       socket.emit("updateDashboardNotification", {
//         counselor_id,
//         cNotification: "0",
//       });
//     } else if (userRole === "admin" && user_id) {
//       console.log("➡️ Sending clear request for Admin:", user_id);
//       socket.emit("updateDashboardNotification", {
//         user_id,
//         aNotification: "0",
//       });
//     } else if (userRole === "processors" && processor_id) {
//       console.log("➡️ Sending clear request for Processor:", processor_id);
//       socket.emit("updateDashboardNotification", {
//         processor_id,
//         pNotification: "0",
//       });
//     } else {
//       console.warn("⚠️ No matching role found for clearing notifications!");
//     }
//   };

//   const logout = () => {
//     localStorage.clear();
//     sessionStorage.clear();
//     navigate("/");
//   };

//   const handleChat = () => {
//     navigate("/chat");
//   };

//   // ✅ Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setShowNotifications(false);
//       }
//     };

//     if (showNotifications) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showNotifications]);

//   return (
//     <nav className="navbar bg-white fixed-top w-100 z-50">
//       <div className="container-fluid d-flex justify-content-between align-items-center px-3 py-2">
//         {/* Logo + Sidebar Toggle */}
//         <div
//           className="d-flex align-items-center gap-3"
//           style={{ marginTop: "-20px" }}
//         >
//           <img src="/img/logo.png" alt="Study First Info Ltd." height={70} />
//           <button
//             className="btn btn-light border"
//             onClick={(e) => {
//               e.stopPropagation();
//               toggleSidebar();
//             }}
//           >
//             ☰
//           </button>
//         </div>

//         {/* Right Icons */}
//         <div                   
//           className="d-flex align-items-center gap-4"
//           style={{ marginTop: "-20px" }}
//           ref={dropdownRef}
//         >
//           {/* Notifications */}
//           <div className="position-relative">
//             <Bell
//               size={22}
//               onClick={() => setShowNotifications(!showNotifications)}
//               style={{ cursor: "pointer" }}
//             />
//             {notifications.length > 0 && (
//               <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
//                 {notifications.length}
//               </span>
//             )}
//             {showNotifications && (
//               <div
//                 className="bg-white shadow p-3 rounded position-absolute"
//                 style={{
//                   top: "400%",
//                   transform: "translate(-50%, -50%)",
//                   width: "300px",
//                   zIndex: 1000,
//                 }}
//               >
//                 <div className="d-flex justify-content-between align-items-center mb-2">
//                   <strong>Notifications</strong>
//                   <button
//                     className="btn btn-sm btn-outline-secondary"
//                     onClick={handleClearAllNotifications}
//                   >
//                     Clear All
//                   </button>
//                 </div>

//                 <ul
//                   className="list-unstyled mb-0"
//                   style={{ maxHeight: "200px", overflowY: "auto" }}
//                 >
//                   {notifications.length > 0 ? (
//                     notifications.map((item, index) => (
//                       <li key={index} className="border-bottom py-2">
//                         <div className="fw-semibold">{item.message}</div>
//                         <small className="text-muted">
//                           📅 Created:{" "}
//                           {item.created_at
//                             ? new Date(item.created_at).toLocaleDateString()
//                             : "N/A"}
//                         </small>
//                       </li>
//                     ))
//                   ) : (
//                     <li className="text-muted text-center py-2">
//                       No new notifications
//                     </li>
//                   )}
//                 </ul>
//               </div>
//             )}
//           </div>

//           {/* Chat Icon */}
//           <MessageCircle
//             size={22}
//             style={{ cursor: "pointer" }}
//             onClick={handleChat}
//           />

//           {/* Profile Dropdown */}
//           <div className="dropdown">
//             <div
//               className="d-flex align-items-center gap-2"
//               role="button"
//               data-bs-toggle="dropdown"
//               aria-expanded="false"
//             >
//               <UserCircle size={26} />
//               <span className="fw-semibold loginName">{loginName}</span>
//               <ChevronDown size={16} />
//             </div>
//             <ul className="dropdown-menu dropdown-menu-end mt-2 shadow-sm">
//               <li>
//                 <Link className="dropdown-item" to="/profile">
//                   Profile
//                 </Link>
//               </li>
//               <li>
//                 <Link className="dropdown-item" to="/change-password">
//                   Change Password
//                 </Link>
//               </li>
//               <li>
//                 <hr className="dropdown-divider" />
//               </li>
//               <li>
//                 <button
//                   className="dropdown-item text-danger d-flex align-items-center gap-2"
//                   onClick={logout}
//                 >
//                   <LogOut size={16} /> Logout
//                 </button>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;





import React, { useEffect, useRef, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  MessageCircle,
  UserCircle,
  LogOut,
  ChevronDown,
  Search,
} from "lucide-react";
import { io } from "socket.io-client";
import "../layout/Navbar.css";
import BASE_URL from "../Config";
import { ThemeContext } from "../context/ThemeContext";

const socket = io(BASE_URL.replace('/api/', ''), {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

const Navbar = ({ toggleSidebar }) => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [loginDetail, setLoginDetail] = useState(JSON.parse(localStorage.getItem("login_detail")));
  const loginName = loginDetail?.full_name;
  const userRole = loginDetail?.role;
  const student_id = loginDetail?.student_id || null;
  const counselor_id = loginDetail?.counselor_id || null;
   const staff_id = loginDetail?.staff_id || null;
let processor_id = loginDetail?.id && loginDetail.id !== 135 ? loginDetail.id : null;
  const user_id = localStorage.getItem("user_id");

  if(userRole === "staff"){
   processor_id = staff_id;
  }  

  // ✅ Watch for localStorage changes (for photo sync)
  useEffect(() => {
    const handleStorageChange = () => {
      setLoginDetail(JSON.parse(localStorage.getItem("login_detail")));
    };
    window.addEventListener("storage", handleStorageChange);
    // Also listen for a custom event if dispatched manually from same window
    window.addEventListener("loginDetailUpdated", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("loginDetailUpdated", handleStorageChange);
    };
  }, []);

  // ✅ Initial load + socket listeners
  useEffect(() => {
    // fetch notifications
    socket.emit("getDashboardData", { student_id, counselor_id, processor_id, staff_id });

    // listen for response
    socket.on("dashboardDataResponse", (data) => {
      if (data.success) {
        console.log("📩 dashboardDataResponse:", data);
        setNotifications(data.data || []);
      }
    });

    // listen for broadcast update
    socket.on("dashboardUpdated", (data) => {
      if (
        student_id === data.student_id ||
        counselor_id === data.counselor_id ||
        processor_id === data.processor_id ||
        staff_id === data.staff_id
      ) {
        socket.emit("getDashboardData", {
          student_id,
          counselor_id,
          processor_id,
          staff_id
        });
      }
    });

    // listen for clear response
    socket.on("updateDashboardResponse", (data) => {
      console.log("📩 updateDashboardResponse received:", data);
      if (data.success) {
        console.log("✅ Notifications cleared successfully, refetching...");
        socket.emit("getDashboardData", {
          student_id,
          counselor_id,
          processor_id,
        
        });
      } else {
        console.error("❌ Failed to clear notifications:", data);
      }
    });

    return () => {
      socket.off("dashboardDataResponse");
      socket.off("dashboardUpdated");
      socket.off("updateDashboardResponse");
    };
  }, [student_id, counselor_id, processor_id]);

  // ✅ Clear All handler
  const handleClearAllNotifications = () => {
    console.log("🔔 Clear All clicked by role:", userRole);

    if (userRole === "student" && student_id) {
      console.log("➡️ Sending clear request for Student:", student_id);
      socket.emit("updateDashboardNotification", {
        student_id,
        sNotification: "0",
      });
    } else if (userRole === "counselor" && counselor_id) {
      console.log("➡️ Sending clear request for Counselor:", counselor_id);
      socket.emit("updateDashboardNotification", {
        counselor_id,
        cNotification: "0",
      });
    } else if (userRole === "admin" && user_id) {
      console.log("➡️ Sending clear request for Admin:", user_id);
      socket.emit("updateDashboardNotification", {
        user_id,
        aNotification: "0",
      });
    } else if (userRole === "processors" && processor_id) {
      console.log("➡️ Sending clear request for Processor:", processor_id);
      socket.emit("updateDashboardNotification", {
        processor_id,
        pNotification: "0",
      });
    } else {
      console.warn("⚠️ No matching role found for clearing notifications!");
    }
  };

  const logout = () => {
    const savedTheme = localStorage.getItem("app_theme");
    localStorage.clear();
    if (savedTheme) {
      localStorage.setItem("app_theme", savedTheme);
    }
    sessionStorage.clear();
    navigate("/");
  };

  const handleChat = () => {
    navigate("/chat");
  };

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <nav className={`navbar portal-navbar fixed-top w-100 z-50 ${isDarkMode ? "dark-navbar" : "light-navbar"}`}>
      <div className="container-fluid d-flex justify-content-between align-items-center px-3 py-2">
        {/* Logo + Sidebar Toggle */}
        <div
          className="d-flex align-items-center gap-3"
          style={{ marginTop: "-20px" }}
        >
          <div className="d-flex align-items-center gap-2" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
            <img
              src="/img/kiaan_logo.png"
              alt="Kiaan Technology"
              height={46}
              className="portal-navbar-logo"
              style={{ objectFit: "contain" }}
            />
            <div className="d-none d-sm-flex flex-column" style={{ lineHeight: 1.05 }}>
              <span
                className="fw-bold"
                style={{
                  fontSize: "1.25rem",
                  color: isDarkMode ? "#f8fafc" : "#064e3b",
                  letterSpacing: "0.3px",
                }}
              >
                Kiaan
              </span>
              <span
                style={{
                  fontSize: "0.58rem",
                  color: isDarkMode ? "#34d399" : "#059669",
                  letterSpacing: "1.8px",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                Technology
              </span>
            </div>
          </div>
          <button
            className="btn btn-light border portal-sidebar-toggle-btn"
            onClick={(e) => {
              e.stopPropagation();
              toggleSidebar();
            }}
          >
            ☰
          </button>
        </div>

        {/* Search Bar */}
        {userRole === "student" && (
          <div className="navbar-search position-relative d-none d-md-block" style={{ marginTop: "-20px" }}>
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search students, applications, universities..."
              style={{ paddingLeft: "45px", borderRadius: "25px", width: "100%" }}
            />
          </div>
        )}

        {/* Right Icons */}
        <div
          className="d-flex align-items-center gap-3 gap-md-4"
          style={{ marginTop: "-20px" }}
          ref={dropdownRef}
        >
          {/* Light / Dark Mode Toggle Button */}
          <button
            type="button"
            className="theme-toggle-btn portal-theme-toggle"
            onClick={toggleTheme}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>

          {/* Notifications */}
          <div className="position-relative">
            <Bell
              size={22}
              className="portal-nav-icon"
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ cursor: "pointer" }}
            />
            {notifications.length > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {notifications.length}
              </span>
            )}
            {showNotifications && (
              <div
                className="bg-white shadow p-3 rounded position-absolute portal-notification-popup"
                style={{
                  top: "400%",
                  transform: "translate(-50%, -50%)",
                  width: "300px",
                  zIndex: 1000,
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong>Notifications</strong>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={handleClearAllNotifications}
                  >
                    Clear All
                  </button>
                </div>

                <ul
                  className="list-unstyled mb-0"
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                >
                  {notifications.length > 0 ? (
                    notifications.map((item, index) => (
                      <li key={index} className="border-bottom py-2">
                        <div className="fw-semibold">{item.message}</div>
                        <small className="text-muted">
                          📅 Created:{" "}
                          {item.created_at
                            ? new Date(item.created_at).toLocaleDateString()
                            : "N/A"}
                        </small>
                      </li>
                    ))
                  ) : (
                    <li className="text-muted text-center py-2">
                      No new notifications
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Chat Icon */}
          <MessageCircle
            size={22}
            className="portal-nav-icon"
            style={{ cursor: "pointer" }}
            onClick={handleChat}
          />

          {/* Profile Dropdown */}
          <div className="dropdown">
            <div
              className="d-flex align-items-center gap-2 portal-profile-trigger"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {loginDetail?.photo ? (
                <img 
                  src={loginDetail.photo.startsWith('http') ? loginDetail.photo : `${BASE_URL.replace('/api/', '')}${loginDetail.photo}`} 
                  alt="Profile" 
                  className="rounded-circle" 
                  style={{ width: "32px", height: "32px", objectFit: "cover" }}
                />
              ) : (
                <UserCircle size={26} className="portal-nav-icon" />
              )}
              <div className="d-flex flex-column">
                <span className="fw-semibold loginName" style={{ fontSize: "0.9rem", lineHeight: "1.2" }}>{loginName}</span>
                {userRole === "student" && <small className="text-muted" style={{ fontSize: "0.75rem" }}>Student</small>}
              </div>
              <ChevronDown size={16} className="portal-nav-icon" />
            </div>
            <ul className="dropdown-menu dropdown-menu-end mt-2 shadow-sm portal-dropdown-menu">
              <li>
                <Link className="dropdown-item" to="/profile">
                  Profile
                </Link>
              </li>
              <li>
                <Link className="dropdown-item" to="/change-password">
                  Change Password
                </Link>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <button
                  className="dropdown-item text-danger d-flex align-items-center gap-2"
                  onClick={logout}
                >
                  <LogOut size={16} /> Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

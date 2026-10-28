import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import Navbar from "./layout/Navbar";
import Sidebar from "./layout/Sidebar";
import FloatingAIChatbot from "./components/AI/FloatingAIChatbot";
import AILeadsList from "./components/AI/AILeadsList";
import Home from "./authtication/Home";
import React, { useEffect, useState, Suspense, lazy } from "react";
import Login from "./authtication/Login";
import ChatBox from "./components/CommunicationFollowupManagement/ChatBox";
import Contract from "./components/Lead & Inquiry Management/Contract";
import Profile from "./components/Profile/Profile";
import StudentDetailsPage from "./components/Profile/StudentDetailsPage";
import Lead from "./components/Lead & Inquiry Management/Lead";
import NewLead from "./components/Lead & Inquiry Management/NewLead";
import Deal from "./components/Lead & Inquiry Management/Deal";
import AdmissionNew from "./components/AdmissionTracking/AdmissionNew";
import ProfileDetails from "./components/Profile/ProfileDetails";
import LeadInquiryManagement from "./components/Lead & Inquiry Management/LeadInquiryManagement";
import StudentDetails from "./components/Profile/StudentDetails";
import AdmissionTracking from "./components/AdmissionTracking/AdmissionTracking";
import TaskCalendarManagement from "./components/Task Calendar Management/TaskCalendarManagement";

import PaymentInvoiceMangament from "./components/PaymentInvoiceManagement/PaymentInvoiceManagement";
import ReportingAnalytics from "./components/ReportingAnalytics/ReportingAnalytics";
import UserRolesAccessControl from "./components/UserRolesAccessControl/UserRolesAccessControl";
import CommunicationFollowupManagement from "./components/CommunicationFollowupManagement/CommunicationFollowupManagement";
import Inquriy from "./components/Lead & Inquiry Management/Inquriy";
import ApplicationTracker from "./components/AdmissionTracking/ApplicationTracker";
import DocumentUpload from "./components/AdmissionTracking/DocumentUpload";
import UniversitySubmissions from "./components/AdmissionTracking/UniversitySubmissions";
import AdmissionDecisions from "./components/AdmissionTracking/AdmissionDecisions";
import FollowUpScheduling from "./components/CommunicationFollowupManagement/FollowUpScheduling";
import AutomatedReminders from "./components/CommunicationFollowupManagement/AutomatedReminders";
import ManaDetails from "./components/Profile/ManaDetails";
import AddCounselor from "./components/Task Calendar Management/AddCounselor";
import TaskAssignment from "./components/Task Calendar Management/TaskAssignment";
import TaskReminder from "./components/Task Calendar Management/TaskReminder";
import RolesManagement from "./components/CourseUniversityDatabase/RolesManagement";
import PermissionsTable from "./components/CourseUniversityDatabase/permissionsData";
import CourseUniversityDatabase from "./components/CourseUniversityDatabase/CourseUniversityDatabase";
import StudentUniversity from "./components/PaymentInvoiceManagement/StudentUniversity";

import CounselorTask from "./components/Lead & Inquiry Management/CouncelorTask";
import StatusTracking from "./components/Lead & Inquiry Management/StatusTracking";
import AdminStatus from "./components/Lead & Inquiry Management/AdminStatus";
import { LeadProvider } from "./context/LeadContext";
import LeadCouncelor from "./components/Lead & Inquiry Management/LeadCouncelor";
import UniversityCards from "./components/PaymentInvoiceManagement/UniversityCards";
import BmuUniversity from "./components/universityPagesform/BmuUniversity";
import DebrecenUniversity from "./components/universityPagesform/DebrecenUniversity";
import HunguryUniversity from "./components/universityPagesform/HunguryUniversity";
import GyorUniversity from "./components/universityPagesform/GyorUniversity";
import WekerleUiversity from "./components/universityPagesform/WekerleUniversity";
import MainStudentDetails from "./components/Profile/MainStudentDetails";
import ViewStudentProfile from "./components/AdmissionTracking/ViewStudentProfile";
import SearchPrograms from "./components/Profile/SearchPrograms";
import Payment from "./components/ReportingAnalytics/Payment";
import StudentTask from "./components/Task Calendar Management/StudentTask";
import Support from "./components/CommunicationFollowupManagement/Support";

import MyApplication from "./components/AdmissionTracking/MyApplication";
import CounselorApplications from "./components/AdmissionTracking/CounselorApplications";
import ApplicationTimeline from "./components/AdmissionTracking/ApplicationTimeline";
import MyProfile from "./MyProfile/MyProfile";
import Addbranch from "./components/ReportingAnalytics/Addbranch";
import ChangePassword from "./MyProfile/ChangePassword";
import ProtectedRoute from "./ProtectedRoute/ProtectedRoute";
// import chatBox from "./components/ChatSection/ChatBox"
import ChatBox2 from "./components/ChatSection/ChatBox";
import ChatHistory from "./components/ChatSection/ChatHistory";
import ChatList from "./components/ChatSection/ChatList";
import Signup from "./authtication/Signup";
import InquiryForm from "./authtication/InquiryForm";
import InquryTabledemo from "./demofiles/InquryTabledemo";
import Applicationtracking from "./components/Profile/Applicationtracking";
import CounslerStudentTable from "./components/Profile/CounslerStudentTable";
import Addstaff from "./components/Task Calendar Management/Addstaff";
import StaffInquiry from "./components/Lead & Inquiry Management/StaffInquiry";
import Visaprocesing from "./components/AdmissionTracking/Visaprocesing";
import StaffDashboard from "./components/universityPagesform/StaffDashboard";
import Stafflead from "./components/Lead & Inquiry Management/Stafflead";
import VisaProcessList from "./components/AdmissionTracking/VisaProcessingList";
import StudentDecisions from "./components/StudentDecision/StudentDewcision";
import BASE_URL from "./Config";
import DashboardVisa from "./components/AdmissionTracking/DashboardVisa";
import StudentDocuments from "./components/StudentDocuments/StudentDocuments";
import DocumentReview from "./components/Processors/StudentDocument/DocumentReview";
import StudentDocument from "./components/Processors/StudentDocument/StudentDocument";
import AddProcessor from "./components/Processors/AddProvessor/AddProcessor";
import ProcessorReports from "./components/Processors/Reports/ProcessorReports";
import ApplicationProcessors from "./components/Processors/ApplicationProcessors";
import Chats from "./components/Rehan-chat/Chat";
import MasterTable from "./components/MasterAdmin/MasterTable";
import ChatbotMain from "./components/ChatBot/ChatBot";
import ForgotPassword from "./authtication/ForgotPassword";
import ResetPassword from "./authtication/ResetPassword";
import ProcessorStudentDetails from "./components/Processors/StudentDetails/StudentDetails";
import ProcessorStudentDetailsTable from "./components/ProcessorStudentDetails/ProcessorStudentDetails";
import ProcessorProfile from "./components/ProcessorStudentDetails/ProcessordetailsPage";
import CounselorProfile from "./components/CounseloDetailsPage/CounselorProfile";
import CounselorStudentDetails from "./components/CounseloDetailsPage/CounselorstudentDetails";
import FollowUpHistory from "./components/Lead & Inquiry Management/FollowUpHistory";
import NoteHistory from "./components/Lead & Inquiry Management/NoteHistory";
import { messaging, getToken, onMessage } from "./interceptors/FirebaseNotification";
import GlobalTableScrollbar from "./components/GlobalTableScrollbar/GlobalTableScrollbar";
import VisaProcesingNew from "./components/AdmissionTracking/VisaProcessingNew";
import StudentVisaProcesing from "./components/Processors/StudentVisaProcess/VisaProcessingNew";
import ProcessorDashboard from "./components/Processors/StudentVisaProcess/ProcesssorDashboard";
import StudentVisaProcessList from "./components/AdmissionTracking/StudentVisaProcessList";
import StudentInvoice from "./components/ReportingAnalytics/StudentInvoice";
import StudentInqueryForm from "./demofiles/StudentInqueryForm";
import ProcessorTasks from "./components/Processors/Tasks/ProcessorTasks";
import ProcessorApplyUniversity from "./components/Processors/ApplyUniversity/ProcessorApplyUniversity";
import AIConversations from "./components/AI/AIConversations";
import DripCampaignLogs from "./components/AI/DripCampaignLogs";
import PriorityList from "./components/AI/PriorityList";
import AppointmentsList from "./components/AI/AppointmentsList";
import DripLogs from "./components/AI/DripLogs";
import io from "socket.io-client";
import Swal from "sweetalert2";
import PrivacyPolicy from "./components/PrivacyPolicy";
import SecurityLogs from "./components/Security/SecurityLogs";

const Dashboard = lazy(() => import("./components/dashbord/Dashbord"));
const Councelor = lazy(() => import("./components/dashbord/Councelor"));
const StudentProfile = lazy(() => import("./components/Profile/Dashboard"));
const ProcessorsDashboard = lazy(() => import("./components/Processors/Processors/ProcessorsDashboard"));
const MasterAdminDashboard = lazy(() => import("./components/MasterAdmin/MasterAdminDashboard"));

function App() {
  //show details to admin

  const navigate = useNavigate();
  const [login, setLogin] = useState(localStorage.getItem("login") || "");

  useEffect(() => {
    // ✅ Firebase Messaging sirf HTTPS par kaam karta hai
    if (!messaging || !getToken || !onMessage) {
      console.warn("⚠️ Firebase Messaging not available (HTTP or unsupported browser)");
      return;
    }

    const requestPermission = async () => {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        console.log("✅ Notification permission granted.");

        try {
          const token = await getToken(messaging, {
            vapidKey: "BGtA6rCbw68KOvmAK5q8fQxAsFn7gEfvu8_6Zsu_jACSbptjeA-6NSn9IKfGy_Gk8t6-Tk0OB_P_QuEzIbwgS_k"
          });

          if (token) {
            console.log("🎯 FCM Token:", token);
            localStorage.setItem("fcm_token", token);
            console.log("💾 Token saved in localStorage:", localStorage.getItem("fcm_token"));
          } else {
            console.log("⚠️ No registration token available.");
          }
        } catch (error) {
          console.error("❌ An error occurred while retrieving token:", error);
        }
      } else {
        console.log("🚫 Permission denied.");
      }
    };

    requestPermission();

    // 🔹 Foreground messages
    onMessage(messaging, (payload) => {
      console.log("📩 Message received in foreground:", payload);
    });
  }, []);


  useEffect(() => {
    if (login) {
      localStorage.setItem("login", login);
    }
  }, [login]);

  // Global Chat Notifications
  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    const socketUrl = BASE_URL.replace("/api/", "");
    const socket = io(socketUrl);

    socket.emit("registerUser", userId);

    socket.on("receive_message", (msg) => {
      const senderId = msg.senderId || msg.sender_id;
      const currentPath = window.location.pathname;
      
      // Don't show toast if we are already in the chat with this person
      if (currentPath.includes(`/chat/${senderId}`)) {
        return;
      }

      // Show Toast Notification
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
          toast.onclick = () => {
            navigate(`/chat/${senderId}`);
          };
        }
      });

      Toast.fire({
        icon: 'info',
        title: `New message`,
        text: msg.content || msg.message,
      });

      // Play notification sound
      try {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");
        audio.play();
      } catch (err) {
        console.error("Error playing notification sound:", err);
      }
    });

    socket.on("dashboardUpdated", (data) => {
      console.log("🔔 Dashboard Update received:", data);
      
      // Ignore chat-related dashboard updates to prevent false "Task Update" toasts
      if (data.type === "chat") {
        return;
      }

      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
      });

      Toast.fire({
        icon: 'success',
        title: 'Task Update',
        text: data.message || "A task has been updated",
      });

      // Play sound
      try {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");
        audio.play();
      } catch (err) {}
    });

    return () => {
      socket.disconnect();
    };
  }, [login, navigate]);

  // Cross-tab login/logout sync
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === 'authEvent') {
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
        } else {
          navigate("/login");
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [navigate]);

  const [counselors, setCounselors] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Task 1",
    },
  ]);

  const handleAddCounselor = (name) => {
    setCounselors([...counselors, name]);
  };
  // console.log(counselors);

  const handleTaskAssign = (task) => {
    setTasks([...tasks, task]);
  };
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const menusidebarcollaps = () => {
    setIsSidebarCollapsed(false);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };
  const location = useLocation();
  const user_id = localStorage.getItem("user_id")
  const noLayoutPaths = ["/", "/login", "/signup", "/forgotpassword", "/resetpassword", "/StudentInqueryForm", "/privacy-policy"];
  const hideLayout = noLayoutPaths.includes(location.pathname);
  // Detect screen size on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <>

      {/* navbar */}
      {!hideLayout && <Navbar toggleSidebar={toggleSidebar} />}
      {/* navbar end */}
      {/* sidebar start */}
      <div className={`main-content ${hideLayout ? "full-width" : ""}`}>
        {!hideLayout && (
          <Sidebar
            collapsed={isSidebarCollapsed}
            isMobile={isMobile}
            menuItemClick={menusidebarcollaps}
            login={login}
            toggleSidebar={toggleSidebar}
          />
        )}
        {/* sidebar end */}
        {/* right side  */}
        <div className={`right-side-content ${hideLayout ? "full-width" : isSidebarCollapsed ? "collapsed" : ""}`} style={hideLayout ? { marginTop: "0", paddingLeft: "0" } : {}}>
          {/* Show Chatbot for public users and students on all pages */}
          {(!login || login === "student") && (
            <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1050 }}>
              {isChatbotOpen ? (
                <div style={{ position: 'relative' }}>
                  <button 
                    className="btn btn-danger rounded-circle position-absolute" 
                    style={{ top: '-10px', right: '-10px', zIndex: 1060, width: '30px', height: '30px', padding: 0 }}
                    onClick={() => setIsChatbotOpen(false)}
                  >
                    &times;
                  </button>
                  <ChatbotFullFlow />
                </div>
              ) : (
                <button 
                  className="btn btn-primary rounded-circle shadow-lg" 
                  style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => setIsChatbotOpen(true)}
                >
                  <i className="fa-solid fa-robot fs-3 text-white"></i>
                </button>
              )}
            </div>
          )}
          <LeadProvider>
            <Suspense fallback={
              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading page...</span>
                </div>
              </div>
            }>
              <Routes>
                {/* Public Pages */}
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />

                {/* University Routes */}
              <Route path="/university/GyorUniversity" element={<ProtectedRoute><GyorUniversity /></ProtectedRoute>} />
              <Route path="/university/WekerleUniversity" element={<ProtectedRoute><WekerleUiversity /></ProtectedRoute>} />
              <Route path="/university/HunguryUniversity" element={<ProtectedRoute><HunguryUniversity /></ProtectedRoute>} />
              <Route path="/university/DebrecenUniversity" element={<ProtectedRoute><DebrecenUniversity /></ProtectedRoute>} />
              <Route path="/university/:id" element={<ProtectedRoute><BmuUniversity /></ProtectedRoute>} />
                            <Route path="/StudentInqueryForm" element={<StudentInqueryForm />} />


              {/* Login & Signup */}
              <Route path="/login" element={<Login login={login} setLogin={setLogin} />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgotpassword" element={<ForgotPassword />} />
              <Route path="/resetpassword" element={<ResetPassword />} />
              <Route path="/" element={<Home />} />

              {/* Protected Route for Dashboard */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboardvisa" element={<ProtectedRoute><DashboardVisa /></ProtectedRoute>} />
              <Route path="/security-logs" element={<ProtectedRoute><SecurityLogs /></ProtectedRoute>} />

              {/* Other Protected Routes */}
              <Route path="/councelor" element={<ProtectedRoute><Councelor /></ProtectedRoute>} />
              <Route path="/studentProfile" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
              <Route path="/Searchprograms" element={<ProtectedRoute><SearchPrograms /></ProtectedRoute>} />
              <Route path="/inquiry" element={<ProtectedRoute><Inquriy /></ProtectedRoute>} />
              <Route path="/lead" element={<ProtectedRoute><Lead /></ProtectedRoute>} />
              <Route path="/lead/:id" element={<ProtectedRoute><Deal /></ProtectedRoute>} />
              <Route path="/leadCouncelor" element={<ProtectedRoute><LeadCouncelor /></ProtectedRoute>} />
              <Route path="/newLead" element={<ProtectedRoute><NewLead /></ProtectedRoute>} />
              <Route path="/councelorTask" element={<ProtectedRoute><CounselorTask /></ProtectedRoute>} />
              <Route path="/contract" element={<ProtectedRoute><Contract /></ProtectedRoute>} />
              <Route path="/status" element={<ProtectedRoute><CounselorApplications /></ProtectedRoute>} />
              <Route path="/adminstatus" element={<ProtectedRoute><AdminStatus /></ProtectedRoute>} />
              <Route path="/timeline/:applicationId" element={<ProtectedRoute><ApplicationTimeline /></ProtectedRoute>} />
              <Route path="/studentinvoice" element={<ProtectedRoute><StudentInvoice/></ProtectedRoute>} /> 
              {/* Student Management */}
              <Route path="/studentDetails" element={<ProtectedRoute><StudentDetails /></ProtectedRoute>} />
              <Route path="/MainStudentDetails" element={<ProtectedRoute><MainStudentDetails /></ProtectedRoute>} />
              <Route path="/manaDetails" element={<ProtectedRoute><ManaDetails /></ProtectedRoute>} />
              <Route path="/admission" element={<ProtectedRoute><AdmissionNew /></ProtectedRoute>} />
              <Route path="/new" element={<ProtectedRoute><AdmissionTracking /></ProtectedRoute>} />
              <Route path="/studentProfile/:studentId" element={<ProtectedRoute><StudentDetailsPage /></ProtectedRoute>} />
              <Route path="/student/:id" element={<ProtectedRoute><ViewStudentProfile /></ProtectedRoute>} />

              {/* Communication */}
              <Route path="/communication" element={<ProtectedRoute><CommunicationFollowupManagement /></ProtectedRoute>} />
              <Route path="/myapplication" element={<ProtectedRoute><MyApplication /></ProtectedRoute>} />
              <Route path="/StudentDocuments" element={<ProtectedRoute><StudentDocuments /></ProtectedRoute>} />
              <Route path="/ContactSupport" element={<ProtectedRoute><Support /></ProtectedRoute>} />

              {/* Application Tracking */}
              <Route path="/tracker" element={<ProtectedRoute><ApplicationTracker /></ProtectedRoute>} />

              {/* Admission Decisions */}
              <Route path="/applications" element={<ProtectedRoute><AdmissionDecisions /></ProtectedRoute>} />
              <Route path="/AdmissionTracking" element={<ProtectedRoute><AdmissionTracking /></ProtectedRoute>} />
              <Route path="/studentDecision" element={<ProtectedRoute><StudentDecisions /></ProtectedRoute>} />

              {/* Follow Up */}
              <Route path="/followup" element={<ProtectedRoute><FollowUpScheduling /></ProtectedRoute>} />
              <Route path="/follow-up-history/:id" element={<FollowUpHistory />} />
              <Route path="/note-history/:id" element={<NoteHistory />} />

              {/* Automated Reminders */}
              <Route path="/reminder" element={<ProtectedRoute><AutomatedReminders /></ProtectedRoute>} />

              {/* Add Counselor */}
              <Route path="/addcounselor" element={<ProtectedRoute><AddCounselor onAdd={handleAddCounselor} /></ProtectedRoute>} />

              {/* Tasks */}
              <Route path="/tasks" element={<ProtectedRoute><TaskAssignment counselors={counselors} tasks={tasks} onTaskAssign={handleTaskAssign} /></ProtectedRoute>} />
              <Route path="/tasksreminder" element={<ProtectedRoute><TaskReminder tasks={tasks} /></ProtectedRoute>} />
              <Route path="/studenttasks" element={<ProtectedRoute><StudentTask /></ProtectedRoute>} />

              {/* Roles Permissions */}
              <Route path="/RolesManagement" element={<ProtectedRoute><RolesManagement /></ProtectedRoute>} />
              <Route path="/permissions/:role" element={<ProtectedRoute><PermissionsTable /></ProtectedRoute>} />

              {/* Reports & Analytics */}
              <Route path="/CourseUniversityDatabase" element={<ProtectedRoute><CourseUniversityDatabase /></ProtectedRoute>} />
              <Route path="/ReportingAnalytics" element={<ProtectedRoute><ReportingAnalytics /></ProtectedRoute>} />

              {/* Payment & Invoices */}
              <Route path="/addbranch" element={<ProtectedRoute><Addbranch /></ProtectedRoute>} />
              <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
              <Route path="/UniversityCards" element={<ProtectedRoute><UniversityCards /></ProtectedRoute>} />
              <Route path="/PaymentInvoiceManagement" element={<ProtectedRoute><PaymentInvoiceMangament /></ProtectedRoute>} />

              {/* Chatbox Route */}
              <Route path="/chatbox" element={<ProtectedRoute><ChatBox /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
              <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
              {/* <Route path="/chat" element={<ProtectedRoute><ChatBox2/></ProtectedRoute>} />
             <Route path="/chatHistory" element={<ProtectedRoute><ChatBox2/></ProtectedRoute>} /> */}
              <Route path="/chat/:receiverId" element={<ChatBox2 userId={user_id} />} />
              <Route path="/chatHistory" element={<ChatHistory userId={user_id} />} />
              <Route path="/chatList" element={<ChatList userId={user_id} />} />
              <Route path="/chat" element={<Chats />} />
              <Route path="/chatbot" element={<ChatbotMain />} />
              <Route path="/ai-leads" element={<ProtectedRoute><AILeadsList /></ProtectedRoute>} />
              <Route path="/ai-priority" element={<ProtectedRoute><PriorityList /></ProtectedRoute>} />
              <Route path="/ai-appointments" element={<ProtectedRoute><AppointmentsList /></ProtectedRoute>} />
              <Route path="/ai-drip-logs" element={<ProtectedRoute><DripLogs /></ProtectedRoute>} />
              <Route path="/ai/conversations" element={<ProtectedRoute><AIConversations /></ProtectedRoute>} />
              <Route path="/ai/drip-campaigns" element={<ProtectedRoute><DripCampaignLogs /></ProtectedRoute>} />

              {/* <Route path="/inquirydemo" element={<Inquirydemo/>} /> */}
              <Route path="/inquryTabledemo" element={<InquryTabledemo />} />
              <Route path="/applicationtracking" element={<Applicationtracking />} />
              <Route path="/counslerStudentTable" element={<CounslerStudentTable />} />
              <Route path="/addStaff" element={<Addstaff />} />
              {/* <Route path="/staffInquiry" element={<StaffInquiry />} /> */}
              <Route path="/staffInquiry" element={<Inquriy />} />
              {/* <Route path="/visaprocesing" element={<Visaprocesing />} /> */}
              <Route path="/visaprocesing" element={<VisaProcesingNew />} />

              <Route path="/processorStudent" element={<ProcessorDashboard />} />
              <Route path="/studentvisaprocesing" element={<StudentVisaProcesing />} />
              <Route path="/visaprocesinglist" element={<VisaProcessList />} />
              <Route path="/studentvisaprocesinglist" element={<StudentVisaProcessList />} />
              <Route path="/staffDashboard" element={<StaffDashboard />} />
              <Route path="/stafflead" element={<Stafflead />} />

              <Route path="/processorsDashboard" element={<ProcessorsDashboard />} />
              <Route path="/processorReports" element={<ProcessorReports />} />
              <Route path="/processorsDocument" element={<StudentDocument />} />
              <Route path="/document-review" element={<ProtectedRoute><DocumentReview /></ProtectedRoute>} />
              <Route path="/addProcessor" element={<AddProcessor />} />
              <Route path="/applicationProcessor" element={<ApplicationProcessors />} />
              <Route path="/processorTasks" element={<ProcessorTasks />} />
              <Route path="/processorApply" element={<ProcessorApplyUniversity />} />

              <Route path="/masterDashboard" element={<MasterAdminDashboard />} />
              <Route path="/masterTable" element={<MasterTable />} />
              <Route path="/processordetails" element={<ProcessorStudentDetails />} />
              <Route path="/processorDetailsTable/:id" element={<ProcessorProfile />} />
              <Route path="/counselorDetailsTable" element={<CounselorStudentDetails />} />
              <Route path="/counselorDetailsTable/:id" element={<CounselorProfile />} />
            </Routes>
          </Suspense>
        </LeadProvider>
        </div>
        {/* right end  */}
      </div>
      <FloatingAIChatbot />
    </>
  );
}

export default App;

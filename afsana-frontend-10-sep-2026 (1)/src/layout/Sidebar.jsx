import { useState, useEffect, Profiler } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";
import { RiMenuFold3Line } from "react-icons/ri";
import { FaUserPlus } from "react-icons/fa";
import {
  LayoutDashboard,
  FileText,
  GraduationCap,
  User,
  ClipboardList,
  ShieldCheck,
  BarChart2,
  CreditCard,
  Globe,
  LogOut,
  File,
  MessageCircle
} from "lucide-react";

const Sidebar = ({ login, collapsed, toggleSidebar, menuItemClick }) => {
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userPermissions = JSON.parse(localStorage.getItem("userpermissions")) || [];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSubmenu = (menuName) => {
    setOpenSubmenu(prev => prev === menuName ? null : menuName);
  };

  const isActive = (path) => location.pathname === path;
  const isSubmenuActive = (paths) => paths?.some(path => location.pathname.startsWith(path)) || false;

  const handleMenuItemClick = (item) => {
    if (collapsed) {
      if (typeof toggleSidebar === "function") {
        toggleSidebar();
      } else if (typeof menuItemClick === "function") {
        menuItemClick();
      }
      if (item.submenu) {
        setOpenSubmenu(item.name);
      } else if (item.path) {
        navigate(item.path);
      }
      return;
    }

    if (item.submenu) {
      toggleSubmenu(item.name);
    } else if (item.path) {
      navigate(item.path);
      if (isMobile && typeof toggleSidebar === "function") {
        toggleSidebar();
      }
    }
  };

  const handleSubmenuItemClick = (path) => {
    navigate(path);
    if (isMobile) {
      toggleSidebar();
    }
  };

  const menuItems = {
    admin: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: <LayoutDashboard size={18} className="mr-2" />
      },
      {
        name: "Leads & Inquiries",
        icon: <FileText size={18} className="mr-2" />,
        submenu: [
          { name: "Inquiry", path: "/inquiry" },
          { name: "Lead", path: "/lead" },
          { name: "AI Leads", path: "/ai-leads" },
          { name: "AI Drip Logs", path: "/ai-drip-logs" }
        ]
      },
      {
        name: "Student Management",
        icon: <GraduationCap size={18} className="mr-2" />,
        submenu: [
          { name: "Student Details", path: "/studentDetails" },
          { name: "Communication", path: "/chat" }
        ]
      },
      {
        name: "Applications",
        icon: <User size={18} className="mr-2" />,
        submenu: [
          { name: "Course & University", path: "/PaymentInvoiceManagement" },
          // { name: "Application Tracker", path: "/tracker" },
          { name: "Admission Decision", path: "/applications" },
          { name: "Document Approvals", path: "/document-review" }
        ]
      },
      {
        name: "Task Management",
        icon: <ClipboardList size={18} className="mr-2" />,
        submenu: [
          { name: "Add Counselor", path: "/addcounselor" },
          { name: "Add Staff", path: "/addStaff" },
          { name: "Add Tasks", path: "/tasks" },
          { name: "Add Processor", path: "/addProcessor" }
        ]
      },
      {
        name: "Roles Permissions",
        path: "/RolesManagement",
        icon: <ShieldCheck size={18} className="mr-2" />
      },
      {
        name: "Security & Logs",
        path: "/security-logs",
        icon: <ShieldCheck size={18} className="mr-2" />
      },
      // {
      //   name: "Reports & Analytics",
      //   path: "/CourseUniversityDatabase",
      //   icon: <BarChart2 size={18} className="mr-2" />
      // },
      {
        name: "Payments & Invoices",
        path: "/ReportingAnalytics",
        icon: <CreditCard size={18} className="mr-2" />
      },
      {
        name: "Visa Processing List",
        path: "/visaprocesinglist",
        icon: <Globe size={18} className="mr-2" />
      }
    ],
    student: [
      {
        name: "Dashboard",
        path: "/dashboardvisa",
        icon: <LayoutDashboard size={18} className="mr-2" />
      },
      {
        name: "Communication",
        path: "/chat",
        icon: <MessageCircle size={18} className="mr-2" />
      },
      {
        name: "Student Management",
        icon: <GraduationCap size={18} className="mr-2" />,
        submenu: [
          { name: "Student Details", path: "/MainStudentDetails" },
          { name: "Apply University", path: "/Searchprograms" },
          { name: "Student Decision", path: "/studentDecision" }
        ]
      },
      {
        name: "Application Managment",
        path: "/myapplication",
        icon: <User size={18} className="mr-2" />
      },
      {
        name: "Documents Upload",
        path: "/StudentDocuments",
        icon: <File size={18} className="mr-2" />
      },
      {
        name: "Task Management",
        path: "/studenttasks",
        icon: <ClipboardList size={18} className="mr-2" />
      },
      {
        name: "Payments & Invoices",
        path: "/payment",
        icon: <CreditCard size={18} className="mr-2" />
      },
      {
        name: "Course & University",
        path: "/UniversityCards",
        icon: <GraduationCap size={18} className="mr-2" />
      },
      {
        name: "Check Application Journey",
        path: "/visaprocesing",
        icon: <Globe size={18} className="mr-2" />
      }
    ],
    counselor: [
      {
        name: "Dashboard",
        path: "/councelor",
        icon: <LayoutDashboard size={18} className="mr-2" />
      },
      {
        name: "Leads & Inquiries",
        icon: <GraduationCap size={20} className="mr-2" />,
        submenu: [
          // { name: "Inquiry", path: "/inquiry" },
          // { name: "Assign Inquiry / Lead", path: "/leadCouncelor" },
          { name: "Assign Inquiry / Lead", path: "/newLead" },
          { name: "Priority Follow-ups", path: "/ai-priority" },
          { name: "Upcoming Appointments", path: "/ai-appointments" }
        ]
      },
      {
        name: "Student Management",
        icon: <GraduationCap size={20} className="mr-2" />,
        submenu: [
          { name: "Student Details", path: "/counslerStudentTable" },
          { name: "Communication", path: "/chat" }
        ]
      },
      {
        name: "Task",
        path: "/councelorTask",
        icon: <Globe size={18} className="mr-2" />
      },
      {
        name: "Payments & Invoices",
        path: "/studentinvoice",
        icon: <CreditCard size={18} className="mr-2" />
      },
      {
        name: "Assign Student",
        path: "/counselorDetailsTable",
        icon: <FaUserPlus size={18} className="mr-2" />
      },
      {
        name: "Visa Processing List",
        path: "/studentvisaprocesinglist",
        icon: <Globe size={18} className="mr-2" />
      }
    ],
    staff: [
      {
        name: "Dashboard",
        path: "/staffDashboard",
        icon: <LayoutDashboard size={18} className="mr-2" />
      },
      userPermissions.find(p => p.permission_name === "Inquiry")?.view_permission === 1 && {
        name: "Inquiry",
        path: "/staffInquiry",
        icon: <FileText size={18} className="mr-2" />
      },
      userPermissions.find(p => p.permission_name === "Lead")?.view_permission === 1 && {
        name: "Lead",
        path: "/stafflead",
        icon: <FileText size={18} className="mr-2" />
      },
      userPermissions.find(p => p.permission_name === "Payments & Invoices")?.view_permission === 1 && {
        name: "Payments & Invoices",
        path: "/ReportingAnalytics",
        icon: <CreditCard size={18} className="mr-2" />
      },
    ],
    processors: [
      {
        name: "Dashboard",
        path: "/processorsDashboard",
        icon: <LayoutDashboard size={18} className="mr-2" />
      },
      {
        name: "Reports & Downloads",
        path: "/processorReports",
        icon: <BarChart2 size={18} className="mr-2" />
      },
      {
        name: "Student Details",
        path: "/processordetails",
        icon: <User size={18} className="mr-2" />
      },
      {
        name: "Tasks",
        path: "/processorTasks",
        icon: <ClipboardList size={18} className="mr-2" />
      },
      {
        name: "Apply University",
        path: "/processorApply",
        icon: <GraduationCap size={18} className="mr-2" />
      },
      {
        name: "Communication",
        path: "/chat",
        icon: <MessageCircle size={18} className="mr-2" />
      },
      {
        name: "Student Visa processing",
        path: "/processorStudent",
        icon: <Globe size={18} className="mr-2" />
      },
      {
        name: "Document Approvals",
        path: "/document-review",
        icon: <ShieldCheck size={18} className="mr-2" />
      }
    ],
    masteradmin: [
      {
        name: "Dashboard",
        path: "/masterDashboard",
        icon: <LayoutDashboard size={18} className="mr-2" />
      },
      {
        name: "Admin Management",
        path: "/masterTable",
        icon: <File size={18} className="mr-2" />
      },
      {
        name: "Document Approvals",
        path: "/document-review",
        icon: <ShieldCheck size={18} className="mr-2" />
      }
    ]
  };

  const renderMenuItems = () => {
    const items = (menuItems[login] || []).filter(Boolean);
    return items.map((item, index) => (
      <li
        key={index}
        className={`menu-item ${(item.path && isActive(item.path)) ||
          (item.submenu && isSubmenuActive(item.submenu?.map(i => i.path)))
          ? "active"
          : ""
          } ${item.submenu && openSubmenu === item.name ? "submenu-open" : ""
          }`}
      >
        <div
          className="menu-link"
          title={item.name}
          onClick={() => handleMenuItemClick(item)}
        >
          {item.icon}
          {!collapsed && <span className="menu-text">{item.name}</span>}
          {item.submenu && !collapsed && (
            <i
              className={`fa-solid fa-chevron-${openSubmenu === item.name ? "up" : "down"
                } submenu-arrow`}
            ></i>
          )}
        </div>

        {item.submenu && openSubmenu === item.name && !collapsed && (
          <ul className="submenu">
            {item.submenu.map((subItem, subIndex) => (
              <li
                key={subIndex}
                className={`submenu-item ${isActive(subItem.path) ? "active" : ""
                  }`}
                onClick={() => handleSubmenuItemClick(subItem.path)}
              >
                {subItem.name}
              </li>
            ))}
          </ul>
        )}
      </li>
    ));
  };

  return (
    <div className={`sidebar-container 
      ${collapsed === true ? "collapsed" : ""}
      ${collapsed === "mini" ? "collapsed-desktop" : ""}
    `}>
      <div className="sidebar-toggle-wrapper" style={{ display: "flex", justifyContent: collapsed ? "center" : "flex-end", padding: "10px 14px 4px" }}>
        <button
          className="btn btn-sm sidebar-collapse-btn"
          style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", cursor: "pointer" }}
          onClick={toggleSidebar}
          title={collapsed ? "Expand Menu" : "Collapse Menu"}
        >
          <RiMenuFold3Line style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} size={16} />
        </button>
      </div>
      <div className="sidebar-menu">
        <ul className="menu">{renderMenuItems()}</ul>
      </div>
    </div>
  );
};

export default Sidebar;

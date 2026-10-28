import React, { useState, useEffect, useMemo } from "react";
import {
  FaUsers,
  FaUserGraduate,
  FaUniversity,
  FaTasks,
  FaReply,
  FaChartLine,
} from "react-icons/fa";
import Chart from "chart.js/auto";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import api from "../../interceptors/axiosInterceptor";
import AIAssistantTab from "../AI/AIAssistantTab";

const CounselorDashboard = () => {
  const [allRecentLeads, setAllRecentLeads] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // State for filters
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    country: "",
    status: "",
    intake: ""
  });

  const counselor_id = localStorage.getItem("counselor_id");
  const [kpiData, setKpiData] = useState({});

  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    if (!counselor_id) return;
    
    setLoading(true);
    
    try {
      const { fromDate, toDate, country, status, intake } = filters;
      let url = `getCounselorDashboardData?counselor_id=${counselor_id}`;
      
      if (fromDate) url += `&startDate=${fromDate}`;
      if (toDate) url += `&endDate=${toDate}`;
      if (country) url += `&country=${country}`;
      if (status) url += `&leadStatus=${status}`;
      if (intake) url += `&intake=${intake}`;
      if (fromDate && toDate) url += `&dateRange=Custom`;

      const response = await api.get(url);
      const data = response.data;
      
      console.log("API Response:", data);
      
      // Store all data
      setAllRecentLeads(data.recentLeads || []);
      setAllApplications(data.studentApplications || []);
      setAllTasks(data.recentTasks || []);
      setKpiData(data.kpi || {});
      
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when counselor_id or filters change
  useEffect(() => {
    fetchDashboardData();
  }, [counselor_id, filters]);

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      fromDate: "",
      toDate: "",
      country: "",
      status: "",
      intake: ""
    });
  };

  // Apply filters - this will trigger client-side filtering
  const applyFilters = () => {
    // We don't need to call API again, just trigger re-render
    // The useMemo hooks below will handle the filtering
  };

  // Helper function to check if a date is within a custom range
  const isDateInCustomRange = (dateString, fromDate, toDate) => {
    if (!dateString) return true;
    if (!fromDate && !toDate) return true;
    
    const date = new Date(dateString);
    
    if (fromDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      if (date < from) return false;
    }
    
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      if (date > to) return false;
    }
    
    return true;
  };

  // Client-side filtering for recent leads
  const filteredRecentLeads = useMemo(() => {
    return allRecentLeads.filter(lead => {
      // Country filter
      if (filters.country && lead.country !== filters.country) {
        return false;
      }
      
      // Status filter
      if (filters.status) {
        const leadStatus = lead.status ? lead.status.toString().toLowerCase() : "";
        const filterStatus = filters.status.toString().toLowerCase();
        
        if (!leadStatus.includes(filterStatus) && !filterStatus.includes(leadStatus)) {
          return false;
        }
      }
      
      // Intake filter
      if (filters.intake) {
        const leadIntake = lead.intake ? lead.intake.toString().toLowerCase() : "";
        const filterIntake = filters.intake.toString().toLowerCase();
        
        if (!leadIntake.includes(filterIntake) && !filterIntake.includes(leadIntake)) {
          return false;
        }
      }
      
      // Custom date range filtering
      if (filters.fromDate || filters.toDate) {
        const inRange = isDateInCustomRange(lead.last_follow_up, filters.fromDate, filters.toDate);
        if (!inRange) return false;
      }
      
      return true;
    });
  }, [allRecentLeads, filters]);

  // Client-side filtering for applications
  const filteredApplications = useMemo(() => {
    return allApplications.filter(app => {
      // Country filter
      if (filters.country && app.country !== filters.country) {
        return false;
      }
      
      // Intake filter
      if (filters.intake) {
        const appIntake = app.intake ? app.intake.toString().toLowerCase() : "";
        const filterIntake = filters.intake.toString().toLowerCase();
        
        if (!appIntake.includes(filterIntake) && !filterIntake.includes(appIntake)) {
          return false;
        }
      }
      
      // Custom date range filtering
      if (filters.fromDate || filters.toDate) {
        const inRange = isDateInCustomRange(app.assigned_date, filters.fromDate, filters.toDate);
        if (!inRange) return false;
      }
      
      return true;
    });
  }, [allApplications, filters]);

  // Calculate metrics
  const metrics = useMemo(() => {
    return {
      leads: kpiData.totalLeads || 0,
      students: kpiData.totalStudents || 0,
      universities: kpiData.totalUniversities || 0,
      tasks: kpiData.totalTasks || 0,
      followups: kpiData.totalFollowups || 0,
      followupsDue: kpiData.totalFollowupsDue || 0,
      inquiries: kpiData.inquiries || 0,
      applications: kpiData.applications || 0
    };
  }, [kpiData]);

  const followupEfficiency = kpiData.conversionRate || "0.00"; // Reusing conversionRate or logic from backend
  const conversionRate = kpiData.conversionRate || "0.00";

  const funnelData = {
    labels: ["Inquiries", "Leads", "Students", "Applicants"],
    datasets: [
      {
        label: "Count",
        data: [metrics.inquiries, metrics.leads, metrics.students, metrics.applications],
        backgroundColor: "#5a67d8",
      },
    ],
  };

  return (
    <div className="cd-wrapper">
      {/* Full-screen loader */}
      {loading && (
        <div className="fullscreen-loader">
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Loading dashboard data...</p>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Counselor Dashboard</h2>
        <ul className="nav nav-pills">
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'overview' ? 'active bg-primary text-white' : 'text-dark'}`} onClick={() => setActiveTab('overview')}>Overview</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'ai-assistant' ? 'active bg-primary text-white' : 'text-dark'}`} onClick={() => setActiveTab('ai-assistant')}><i className="fa-solid fa-robot me-1"></i> AI Assistant</button>
          </li>
        </ul>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Filters */}
          <div className="cd-filters ">
            {/* Custom Date Range */}
            <div className="date-range-container">
              <label>From:</label>
              <input 
                type="date" 
                className="cd-date-input"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
              />
              <label>To:</label>
              <input 
                type="date" 
                className="cd-date-input"
                value={filters.toDate}
                onChange={(e) => handleFilterChange('toDate', e.target.value)}
              />
            </div>

            {/* Country */}
            <select 
              className="cd-select"
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
            >
              <option value="">Select Country</option>
              <option>Hungary</option>
              <option>UK</option>
              <option>Cyprus</option>
              <option>Canada</option>
              <option>Malaysia</option>
              <option>Lithuania</option>
              <option>Latvia</option>
              <option>Germany</option>
              <option>New Zealand</option>
              <option>Estonia</option>
              <option>Australia</option>
              <option>South Korea</option>
              <option>Georgia</option>
              <option>Denmark</option>
              <option>Netherlands</option>
              <option>Sweden</option>
              <option>Norway</option>
              <option>Belgium</option>
              <option>Romania</option>
              <option>Russia</option>
              <option>Turkey</option>
              <option>Ireland</option>
              <option>USA</option>
              <option>Portugal</option>
              <option>Malta</option>
              <option>Slovakia</option>
              <option>Others</option>
            </select>

            {/* Status */}
            <select 
              className="cd-select"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Status</option>
              <option value="New">New</option>
              <option value="In Review">In Review</option>
              <option value="Converted to lead">Converted to lead</option>
              <option value="Not Interested">Not Interested</option>
              <option value="Converted to student">Converted to student</option>
            </select>

            {/* Intake */}
            <select 
              className="cd-select"
              value={filters.intake}
              onChange={(e) => handleFilterChange('intake', e.target.value)}
            >
              <option value="">Intake</option>
              <option value="February">February</option>
              <option value="September">September</option>
              <option value="Other">Other</option>
            </select>

            <button className="cd-reset" onClick={resetFilters}>Reset Filters</button>
            <button className="cd-apply" onClick={applyFilters}>Apply Filters</button>
          </div>

          {/* KPI Cards */}
          <div className="cd-kpis">
            <div className="cd-kpi-card"><FaUsers /><p>Total Leads</p><h2>{metrics.leads}</h2></div>
            <div className="cd-kpi-card"><FaUserGraduate /><p>Total Students</p><h2>{metrics.students}</h2></div>
            <div className="cd-kpi-card"><FaTasks /><p>Total Tasks</p><h2>{metrics.tasks}</h2></div>
            <div className="cd-kpi-card"><FaReply /><p>Total Follow-ups</p><h2>{metrics.followups}</h2></div>
          </div>

          <div className="cd-kpi-card efficiency-box">
            <FaChartLine />
            <p>Efficiency</p>
            <h2>Conversion: {conversionRate}%</h2>
          </div>

          {/* Tables */}
          <div className="cd-tables">
            <h4>Recent Leads</h4>
            <div className="cd-table-box">
              <table className="cd-table">
                <thead><tr><th>Name</th><th>Country</th><th>Intake</th><th>Status</th><th>Last Follow-up</th></tr></thead>
                <tbody>
                  {filteredRecentLeads.length > 0 ? (
                    filteredRecentLeads.map((lead, i) => (
                      <tr key={i}>
                        <td>{lead.name}</td>
                        <td>{lead.country}</td>
                        <td>{lead.intake || "-"}</td>
                        <td>{lead.status}</td>
                        <td>{lead.last_follow_up ? new Date(lead.last_follow_up).toLocaleDateString() : "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data">No leads found with the selected filters</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <h4>Student Application List</h4>
            <div className="cd-table-box">
              <table className="cd-table">
                <thead><tr><th>Name</th><th>Email</th><th>University Name</th></tr></thead>
                <tbody>
                  {filteredApplications.length > 0 ? (
                    filteredApplications.map((app, i) => (
                      <tr key={i}>
                        <td>{app?.full_name}</td>
                        <td>{app.email}</td>
                        <td>{app?.university_name}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="no-data">No applications found with the selected filters</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <h4>Pending Student Tasks</h4>
            <div className="cd-table-box">
              <table className="cd-table">
                <thead>
                  <tr>
                    <th>Task Name</th>
                    <th>Student</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allTasks.length > 0 ? (
                    allTasks.map((task, i) => (
                      <tr key={task.id || i}>
                        <td>{task.title}</td>
                        <td>{task.student_name}</td>
                        <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : "-"}</td>
                        <td>
                          <span className={`badge ${task.status === "Completed" ? "bg-success" : "bg-warning text-dark"}`}>
                            {task.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="no-data">No pending tasks found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'ai-assistant' && (
        <div className="mt-4">
          <AIAssistantTab />
        </div>
      )}

      <style jsx global>{`
        .fullscreen-loader {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(255, 255, 255, 0.95);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }
        .loader-container { text-align: center; }
        .spinner {
          border: 5px solid rgba(90, 103, 216, 0.2);
          border-radius: 50%;
          border-top: 5px solid #5a67d8;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .cd-wrapper { padding: 20px; max-width: 1200px; margin: 0 auto; }
        .cd-filters { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
        .date-range-container { display: flex; align-items: center; gap: 8px; background-color: white; border: 1px solid #ccc; border-radius: 4px; padding: 8px 12px; }
        .cd-select { padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; background-color: white; min-width: 150px; }
        .cd-date-input { border: 1px solid #ccc; border-radius: 4px; outline: none; padding: 4px 8px; font-size: 14px; width: 130px; }
        .cd-reset, .cd-apply { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
        .cd-reset { background-color: #f0f0f0; color: #333; }
        .cd-apply { background-color: #5a67d8; color: white; }
        .cd-kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .cd-kpi-card { background-color: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; flex-direction: column; align-items: center; text-align: center; }
        .cd-kpi-card svg { font-size: 24px; color: #5a67d8; margin-bottom: 10px; }
        .efficiency-box { grid-column: span 2; display: flex; flex-direction: column; align-items: center; }
        .cd-tables { margin-top: 30px; }
        .cd-table-box { overflow-x: auto; margin-bottom: 30px; }
        .cd-table { width: 100%; border-collapse: collapse; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .cd-table th { background-color: #5a67d8; color: white; padding: 12px 15px; text-align: left; }
        .cd-table td { padding: 12px 15px; border-bottom: 1px solid #eee; }
        .no-data { text-align: center; color: #666; font-style: italic; }
      `}</style>
    </div>
  );
};

export default CounselorDashboard;
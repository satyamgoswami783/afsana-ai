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

  const followupEfficiency = kpiData.conversionRate || "0.00";
  const conversionRate = kpiData.conversionRate || "0.00";

  const funnelData = {
    labels: ["Inquiries", "Leads", "Students", "Applicants"],
    datasets: [
      {
        label: "Count",
        data: [metrics.inquiries, metrics.leads, metrics.students, metrics.applications],
        backgroundColor: "#10b981",
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

      <div className="cd-header-bar d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="cd-page-title mb-1">Counselor Dashboard</h2>
          <p className="cd-page-subtitle mb-0">Track your leads, student applications, and conversion performance</p>
        </div>
        <ul className="nav nav-pills cd-nav-pills">
          <li className="nav-item">
            <button
              className={`nav-link cd-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link cd-tab-btn ${activeTab === 'ai-assistant' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai-assistant')}
            >
              <i className="fa-solid fa-robot me-1"></i> AI Assistant
            </button>
          </li>
        </ul>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Filters */}
          <div className="cd-filters">
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
            <div className="cd-kpi-card kpi-emerald">
              <div className="cd-kpi-icon"><FaUsers /></div>
              <p>Total Leads</p>
              <h2>{metrics.leads}</h2>
            </div>
            <div className="cd-kpi-card kpi-gold">
              <div className="cd-kpi-icon"><FaUserGraduate /></div>
              <p>Total Students</p>
              <h2>{metrics.students}</h2>
            </div>
            <div className="cd-kpi-card kpi-teal">
              <div className="cd-kpi-icon"><FaTasks /></div>
              <p>Total Tasks</p>
              <h2>{metrics.tasks}</h2>
            </div>
            <div className="cd-kpi-card kpi-amber">
              <div className="cd-kpi-icon"><FaReply /></div>
              <p>Total Follow-ups</p>
              <h2>{metrics.followups}</h2>
            </div>
          </div>

          <div className="cd-kpi-card efficiency-box">
            <div className="efficiency-icon-wrap">
              <FaChartLine />
            </div>
            <p className="efficiency-label">Efficiency & Growth</p>
            <h2 className="efficiency-value">Conversion: <span>{conversionRate}%</span></h2>
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

      <style>{`
        .fullscreen-loader {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(244, 247, 246, 0.92);
          backdrop-filter: blur(8px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }
        body.dark-theme .fullscreen-loader {
          background-color: rgba(8, 12, 9, 0.92);
          color: #f1f5f9;
        }
        .loader-container { text-align: center; }
        .spinner {
          border: 4px solid rgba(16, 185, 129, 0.2);
          border-radius: 50%;
          border-top: 4px solid #10b981;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        .cd-wrapper {
          padding: 24px;
          max-width: 1320px;
          margin: 0 auto;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .cd-page-title {
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #0f172a;
        }
        body.dark-theme .cd-page-title {
          color: #f1f5f9;
        }
        .cd-page-subtitle {
          font-size: 0.9rem;
          color: #64748b;
        }
        body.dark-theme .cd-page-subtitle {
          color: #94a3b8;
        }

        /* Nav Pills */
        .cd-nav-pills {
          background: rgba(16, 185, 129, 0.08);
          padding: 5px;
          border-radius: 14px;
          border: 1px solid rgba(16, 185, 129, 0.22);
          gap: 6px;
        }
        body.dark-theme .cd-nav-pills {
          background: rgba(16, 24, 19, 0.9);
          border-color: rgba(16, 185, 129, 0.28);
        }
        .cd-tab-btn {
          border-radius: 10px !important;
          font-weight: 600 !important;
          font-size: 0.9rem !important;
          padding: 8px 18px !important;
          color: #0f172a !important;
          background: transparent !important;
          border: none !important;
          transition: all 0.25s ease !important;
        }
        body.dark-theme .cd-tab-btn {
          color: #cbd5e1 !important;
        }
        .cd-tab-btn.active {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
          color: #ffffff !important;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35) !important;
        }

        /* Filters */
        .cd-filters {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
          align-items: center;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(16, 185, 129, 0.22);
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 8px 24px -4px rgba(15, 23, 42, 0.05);
        }
        body.dark-theme .cd-filters {
          background: linear-gradient(160deg, rgba(16, 24, 19, 0.95) 0%, rgba(10, 16, 12, 0.95) 100%);
          border-color: rgba(16, 185, 129, 0.25);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.45);
        }
        .date-range-container {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: #f8fafc;
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 10px;
          padding: 6px 12px;
          font-weight: 600;
          font-size: 0.85rem;
          color: #334155;
        }
        body.dark-theme .date-range-container {
          background-color: rgba(20, 32, 24, 0.88);
          border-color: rgba(16, 185, 129, 0.28);
          color: #cbd5e1;
        }
        .cd-select {
          padding: 9px 14px;
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 10px;
          background-color: #f8fafc;
          color: #0f172a;
          min-width: 150px;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }
        .cd-date-input {
          border: 1px solid rgba(16, 185, 129, 0.22);
          border-radius: 8px;
          outline: none;
          padding: 5px 10px;
          font-size: 0.85rem;
          width: 135px;
          background-color: #ffffff;
          color: #0f172a;
        }
        .cd-select:focus, .cd-date-input:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.18);
        }
        .cd-reset, .cd-apply {
          padding: 9px 18px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 700;
          font-size: 0.88rem;
          transition: all 0.25s ease;
        }
        .cd-reset {
          background: rgba(245, 158, 11, 0.1);
          color: #d97706;
          border: 1px solid rgba(245, 158, 11, 0.35);
        }
        body.dark-theme .cd-reset {
          background: rgba(245, 158, 11, 0.14);
          color: #fbbf24;
          border-color: rgba(245, 158, 11, 0.35);
        }
        .cd-reset:hover {
          background: rgba(245, 158, 11, 0.2);
          transform: translateY(-1px);
        }
        .cd-apply {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          border: 1px solid rgba(16, 185, 129, 0.4);
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
          margin-left: auto;
        }
        .cd-apply:hover {
          background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45);
          transform: translateY(-1px);
        }

        /* KPI Cards - Luxury Emerald & Gold Palette */
        .cd-kpis {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }
        .cd-kpi-card {
          background: linear-gradient(145deg, #0d1f17 0%, #132e22 100%);
          border: 1px solid rgba(16, 185, 129, 0.32);
          border-radius: 18px;
          padding: 24px 20px;
          box-shadow: 0 12px 28px -6px rgba(13, 31, 23, 0.25);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          overflow: hidden;
          color: #ffffff;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .cd-kpi-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #10b981, #fbbf24, #10b981);
        }
        .cd-kpi-card:hover {
          transform: translateY(-4px);
          border-color: rgba(52, 211, 153, 0.6);
          box-shadow: 0 18px 36px -8px rgba(16, 185, 129, 0.3);
        }
        .cd-kpi-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          background: rgba(16, 185, 129, 0.16);
          border: 1px solid rgba(16, 185, 129, 0.35);
        }
        .cd-kpi-card svg {
          font-size: 24px;
          color: #34d399;
          margin-bottom: 0;
        }
        .cd-kpi-card.kpi-gold .cd-kpi-icon,
        .cd-kpi-card.kpi-amber .cd-kpi-icon {
          background: rgba(245, 158, 11, 0.16);
          border-color: rgba(251, 191, 36, 0.38);
        }
        .cd-kpi-card.kpi-gold svg,
        .cd-kpi-card.kpi-amber svg {
          color: #fbbf24;
        }
        .cd-kpi-card p {
          color: #cbd5e1 !important;
          font-weight: 600;
          font-size: 0.92rem;
          margin-bottom: 6px;
          letter-spacing: 0.01em;
        }
        .cd-kpi-card h2 {
          color: #ffffff !important;
          font-weight: 800;
          font-size: 2.1rem;
          margin: 0;
        }

        /* Efficiency Banner - Landing Page Emerald & Gold Hero Style */
        .cd-kpi-card.efficiency-box {
          background: linear-gradient(135deg, #091510 0%, #112a1f 50%, #1a2512 100%) !important;
          border: 1px solid rgba(251, 191, 36, 0.4) !important;
          border-radius: 20px;
          padding: 28px 24px;
          margin-bottom: 30px;
          box-shadow: 0 18px 40px -10px rgba(0, 0, 0, 0.35);
          position: relative;
        }
        .cd-kpi-card.efficiency-box::after {
          content: '';
          position: absolute;
          top: -50%;
          right: -5%;
          width: 280px;
          height: 280px;
          background: radial-gradient(circle, rgba(251, 191, 36, 0.16) 0%, transparent 70%);
          pointer-events: none;
        }
        .efficiency-icon-wrap {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%);
          border: 1px solid rgba(251, 191, 36, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
        }
        .cd-kpi-card.efficiency-box svg {
          color: #fbbf24 !important;
          font-size: 26px;
        }
        .efficiency-label {
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 0.8rem !important;
          color: #34d399 !important;
          font-weight: 700 !important;
        }
        .efficiency-value {
          font-size: 2rem !important;
          font-weight: 800 !important;
          color: #ffffff !important;
        }
        .efficiency-value span {
          color: #fbbf24;
        }

        /* Tables */
        .cd-tables { margin-top: 30px; }
        .cd-tables h4 {
          font-weight: 700;
          font-size: 1.15rem;
          margin-bottom: 14px;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .cd-tables h4::before {
          content: '';
          display: inline-block;
          width: 5px;
          height: 20px;
          border-radius: 4px;
          background: linear-gradient(180deg, #10b981 0%, #fbbf24 100%);
        }
        body.dark-theme .cd-tables h4 {
          color: #f1f5f9;
        }
        .cd-table-box {
          overflow-x: auto;
          margin-bottom: 30px;
          background: #ffffff;
          border-radius: 16px;
          padding: 12px;
          border: 1px solid rgba(16, 185, 129, 0.2);
          box-shadow: 0 8px 24px -4px rgba(15, 23, 42, 0.05);
        }
        .cd-table {
          width: 100%;
          border-collapse: collapse;
          background-color: transparent;
          border-radius: 12px;
          overflow: hidden;
        }
        .cd-table th {
          background: linear-gradient(135deg, #0d1f17 0%, #143325 100%) !important;
          color: #34d399 !important;
          padding: 14px 16px;
          text-align: left;
          font-weight: 700;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 2px solid rgba(16, 185, 129, 0.4) !important;
        }
        .cd-table td {
          padding: 13px 16px;
          border-bottom: 1px solid rgba(16, 185, 129, 0.12);
          color: #1e293b;
        }
        .no-data {
          text-align: center !important;
          color: #64748b !important;
          font-style: italic;
          padding: 24px !important;
        }
      `}</style>
    </div>
  );
};

export default CounselorDashboard;

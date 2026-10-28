import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import api from "../../../interceptors/axiosInterceptor";
import BASE_URL from "../../../Config";

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

const ProcessorsDashboard = () => {
  const [totalApplications, setTotalApplications] = useState(0);
  const [totaldocumentCount, setTotalDocumentCount] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [recentTasks, setRecentTasks] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [allStages, setAllStages] = useState({});

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");

  const countryOptions = [
    "Hungary", "UK", "Cyprus", "Canada", "Malaysia", "Lithuania", 
    "Latvia", "Germany", "New Zealand", "Estonia", "Australia", 
    "South Korea", "Georgia", "Denmark", "Netherlands", "Sweden", 
    "Norway", "Belgium", "Romania", "Russia", "Turkey", "Ireland", 
    "USA", "Portugal", "Malta", "Slovakia", "Others"
  ];

  const processorId = localStorage.getItem("user_id");

  const fetchDashboardData = async () => {
    try {
      if (!processorId) return;
      
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append("search", searchQuery);
      if (fromDate) queryParams.append("fromDate", fromDate);
      if (toDate) queryParams.append("toDate", toDate);
      if (selectedCountry) queryParams.append("country", selectedCountry);
      if (selectedUniversity) queryParams.append("university", selectedUniversity);

      const res = await api.get(`${BASE_URL}processordashboard/${processorId}?${queryParams.toString()}`);
      if (res.data.success) {
        const { totalapplication, totaldocumentCount, totaltasks, chart_data, recentTasks, all_stages } = res.data.data;
        setTotalApplications(totalapplication);
        setTotalDocumentCount(totaldocumentCount);
        setTotalTasks(totaltasks || 0);
        setRecentTasks(recentTasks || []);
        setChartData(chart_data || []);
        setAllStages(all_stages || {});
      }
    } catch (error) {
      console.error("Error fetching processor dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [processorId]); // Remove filters from dependency to only fetch on button click or initial load. Wait, let's fetch on apply.

  const handleApplyFilters = () => {
    fetchDashboardData();
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setFromDate("");
    setToDate("");
    setSelectedCountry("");
    setSelectedUniversity("");
    // We need to fetch data after state updates. setTimeout is a hack, better to use a useEffect or just pass empty params.
    setTimeout(() => {
       api.get(`${BASE_URL}processordashboard/${processorId}`).then(res => {
         if (res.data.success) {
            const { totalapplication, totaldocumentCount, totaltasks, chart_data, recentTasks, all_stages } = res.data.data;
            setTotalApplications(totalapplication);
            setTotalDocumentCount(totaldocumentCount);
            setTotalTasks(totaltasks || 0);
            setRecentTasks(recentTasks || []);
            setChartData(chart_data || []);
            setAllStages(all_stages || {});
         }
       });
    }, 0);
  };

  const handleExport = () => {
    // Helper function to properly escape CSV values
    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = [];
    
    // Section 1: Summary
    rows.push(["Summary Report"]);
    rows.push(["Metric", "Value"]);
    rows.push(["Assigned Students", totalApplications]);
    rows.push(["Visa Processing", totaldocumentCount]);
    rows.push(["Total Tasks", totalTasks]);
    rows.push([]);

    // Section 2: Visa Stages
    rows.push(["Visa Stages Overview"]);
    rows.push(["Stage", "Count"]);
    Object.entries(allStages).forEach(([stage, count]) => {
      rows.push([stage, count]);
    });
    rows.push([]);

    // Section 3: Pending Tasks
    rows.push(["Pending Tasks Details"]);
    rows.push(["Task Name", "Student Name", "Due Date", "Status"]);
    if (recentTasks && recentTasks.length > 0) {
      recentTasks.forEach(task => {
        rows.push([
          task.task_name,
          task.student_name,
          task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A',
          task.status || 'Pending'
        ]);
      });
    } else {
      rows.push(["No pending tasks found"]);
    }

    // Join rows with correct \n newline
    const csvContent = rows.map(row => row.map(escapeCsv).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `processor_dashboard_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const barData = {
    labels: chartData.map((item) => item.label),
    datasets: [
      {
        label: "Count",
        data: chartData.map((item) => item.value),
        backgroundColor: ["#4F46E5", "#F59E0B", "#10B981"],
        borderRadius: 8,
      },
    ],
  };

  const pieData = {
    labels: chartData.map((item) => item.label),
    datasets: [
      {
        label: "Distribution",
        data: chartData.map((item) => item.value),
        backgroundColor: ["#4F46E5", "#F59E0B", "#10B981"],
        borderWidth: 0,
        hoverOffset: 15,
      },
    ],
  };

  return (
    <div className="p-4" style={{ backgroundColor: "#F9FAFB", minHeight: "100vh" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ fontWeight: "700", color: "#111827", margin: 0 }}>Processor Dashboard</h2>
        <button className="btn btn-success" onClick={handleExport}>
          <i className="fa-solid fa-file-export me-2"></i> Export Report
        </button>
      </div>

      {/* Filter Section */}
      <div className="card shadow-sm mb-4 border-0" style={{ borderRadius: "12px" }}>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label" style={{ fontSize: "0.85rem", fontWeight: "600", color: "#4B5563" }}>Search</label>
              <input type="text" className="form-control" placeholder="Name or Email" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="col-md-2">
              <label className="form-label" style={{ fontSize: "0.85rem", fontWeight: "600", color: "#4B5563" }}>From Date</label>
              <input type="date" className="form-control" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="col-md-2">
              <label className="form-label" style={{ fontSize: "0.85rem", fontWeight: "600", color: "#4B5563" }}>To Date</label>
              <input type="date" className="form-control" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
            <div className="col-md-2">
              <label className="form-label" style={{ fontSize: "0.85rem", fontWeight: "600", color: "#4B5563" }}>Country</label>
              <select className="form-select" value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
                <option value="">All</option>
                {countryOptions.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label" style={{ fontSize: "0.85rem", fontWeight: "600", color: "#4B5563" }}>University</label>
              <input type="text" className="form-control" placeholder="University Name" value={selectedUniversity} onChange={(e) => setSelectedUniversity(e.target.value)} />
            </div>
            <div className="col-12 d-flex justify-content-end gap-2 mt-3">
              <button className="btn btn-light" onClick={handleResetFilters} style={{ fontWeight: "500", border: "1px solid #E5E7EB" }}>Reset</button>
              <button className="btn btn-primary" onClick={handleApplyFilters} style={{ fontWeight: "500", background: "#4F46E5", border: "none" }}>Apply Filters</button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row g-4 mb-4">
        {/* Total Assigned Students */}
        <div className="col-12 col-md-4">
          <div
            style={{
              background: "linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)",
              color: "#fff",
              padding: "24px",
              borderRadius: "16px",
              textAlign: "left",
              boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.3)",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div style={{ position: "relative", zIndex: 2 }}>
              <h6 style={{ opacity: 0.8, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Assigned Students</h6>
              <h2 style={{ fontSize: "2.5rem", fontWeight: "800", margin: "8px 0" }}>{totalApplications}</h2>
              <p style={{ fontSize: "0.8rem", margin: 0, opacity: 0.9 }}>Total students under management</p>
            </div>
            <i className="fa-solid fa-user-graduate" style={{ position: "absolute", right: "20px", bottom: "20px", fontSize: "4rem", opacity: 0.15, zIndex: 1 }}></i>
          </div>
        </div>

        {/* Total Visa Processing */}
        <div className="col-12 col-md-4">
          <div
            style={{
              background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
              color: "#fff",
              padding: "24px",
              borderRadius: "16px",
              textAlign: "left",
              boxShadow: "0 10px 15px -3px rgba(245, 158, 11, 0.3)",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div style={{ position: "relative", zIndex: 2 }}>
              <h6 style={{ opacity: 0.8, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Visa Processing</h6>
              <h2 style={{ fontSize: "2.5rem", fontWeight: "800", margin: "8px 0" }}>{totaldocumentCount}</h2>
              <p style={{ fontSize: "0.8rem", margin: 0, opacity: 0.9 }}>Applications in visa stage</p>
            </div>
            <i className="fa-solid fa-passport" style={{ position: "absolute", right: "20px", bottom: "20px", fontSize: "4rem", opacity: 0.15, zIndex: 1 }}></i>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="col-12 col-md-4">
          <div
            style={{
              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              color: "#fff",
              padding: "24px",
              borderRadius: "16px",
              textAlign: "left",
              boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.3)",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div style={{ position: "relative", zIndex: 2 }}>
              <h6 style={{ opacity: 0.8, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Tasks</h6>
              <h2 style={{ fontSize: "2.5rem", fontWeight: "800", margin: "8px 0" }}>{totalTasks}</h2>
              <p style={{ fontSize: "0.8rem", margin: 0, opacity: 0.9 }}>Pending tasks for students</p>
            </div>
            <i className="fa-solid fa-list-check" style={{ position: "absolute", right: "20px", bottom: "20px", fontSize: "4rem", opacity: 0.15, zIndex: 1 }}></i>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Workload Bar Chart */}
        <div className="col-12 col-md-6">
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              height: "100%",
            }}
          >
            <h5 className="mb-4" style={{ fontWeight: "600", color: "#374151" }}>Workload Overview</h5>
            <Bar
              data={barData}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: { beginAtZero: true, grid: { display: false } },
                  x: { grid: { display: false } }
                }
              }}
            />
          </div>
        </div>

        {/* Distribution Pie Chart */}
        <div className="col-12 col-md-6">
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              height: "100%",
            }}
          >
            <h5 className="mb-4" style={{ fontWeight: "600", color: "#374151" }}>Distribution</h5>
            <div style={{ height: "300px", display: "flex", justifyContent: "center" }}>
              <Pie
                data={pieData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom' }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tasks Table */}
      <div className="row g-4 mt-4">
        <div className="col-12">
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h5 className="mb-4" style={{ fontWeight: "600", color: "#374151" }}>Pending Tasks for Students</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Task Name</th>
                    <th>Student Name</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTasks.length > 0 ? (
                    recentTasks.map((task, i) => (
                      <tr key={task.id || i}>
                        <td style={{ fontWeight: "500" }}>{task.name}</td>
                        <td>{task.student_name}</td>
                        <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : "-"}</td>
                        <td>
                          <span 
                            className="badge" 
                            style={{ 
                              backgroundColor: task.status === "Completed" ? "#D1FAE5" : "#FEF3C7", 
                              color: task.status === "Completed" ? "#065F46" : "#92400E" 
                            }}
                          >
                            {task.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">No pending tasks found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* All Stages Overview */}
      <div className="row g-4 mt-2">
        <div className="col-12">
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h5 className="mb-4" style={{ fontWeight: "600", color: "#374151" }}>All Stages Overview</h5>
            <div className="row g-3">
              {Object.entries(allStages).map(([stage, count], index) => (
                <div className="col-6 col-md-3" key={index}>
                  <div style={{
                    padding: "16px",
                    borderRadius: "12px",
                    backgroundColor: "#F3F4F6",
                    borderLeft: "4px solid #4F46E5",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center"
                  }}>
                    <span style={{ fontSize: "0.85rem", color: "#6B7280", fontWeight: "600", textTransform: "uppercase" }}>{stage}</span>
                    <span style={{ fontSize: "1.8rem", color: "#111827", fontWeight: "800" }}>{count}</span>
                  </div>
                </div>
              ))}
              {Object.keys(allStages).length === 0 && (
                <div className="col-12 text-center text-muted py-3">No stage data available</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessorsDashboard;

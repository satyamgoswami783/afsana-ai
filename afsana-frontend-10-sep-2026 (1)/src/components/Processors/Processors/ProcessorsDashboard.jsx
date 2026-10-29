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
  }, [processorId]);

  const handleApplyFilters = () => {
    fetchDashboardData();
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setFromDate("");
    setToDate("");
    setSelectedCountry("");
    setSelectedUniversity("");
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
    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = [];
    rows.push(["Summary Report"]);
    rows.push(["Metric", "Value"]);
    rows.push(["Assigned Students", totalApplications]);
    rows.push(["Visa Processing", totaldocumentCount]);
    rows.push(["Total Tasks", totalTasks]);
    rows.push([]);

    rows.push(["Visa Stages Overview"]);
    rows.push(["Stage", "Count"]);
    Object.entries(allStages).forEach(([stage, count]) => {
      rows.push([stage, count]);
    });
    rows.push([]);

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
        backgroundColor: ["#10B981", "#F59E0B", "#059669"],
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
        backgroundColor: ["#10B981", "#F59E0B", "#059669"],
        borderWidth: 0,
        hoverOffset: 15,
      },
    ],
  };

  return (
    <div className="p-4 dashboard-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ fontWeight: "800", margin: 0 }}>Processor Dashboard</h2>
        <button
          className="btn text-white fw-semibold"
          onClick={handleExport}
          style={{
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            border: "none",
            borderRadius: "10px",
            boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
          }}
        >
          <i className="fa-solid fa-file-export me-2"></i> Export Report
        </button>
      </div>

      {/* Filter Section */}
      <div className="card shadow-sm mb-4 border-0" style={{ borderRadius: "16px" }}>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label" style={{ fontSize: "0.85rem", fontWeight: "600" }}>Search</label>
              <input type="text" className="form-control" placeholder="Name or Email" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="col-md-2">
              <label className="form-label" style={{ fontSize: "0.85rem", fontWeight: "600" }}>From Date</label>
              <input type="date" className="form-control" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="col-md-2">
              <label className="form-label" style={{ fontSize: "0.85rem", fontWeight: "600" }}>To Date</label>
              <input type="date" className="form-control" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
            <div className="col-md-2">
              <label className="form-label" style={{ fontSize: "0.85rem", fontWeight: "600" }}>Country</label>
              <select className="form-select" value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
                <option value="">All</option>
                {countryOptions.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label" style={{ fontSize: "0.85rem", fontWeight: "600" }}>University</label>
              <input type="text" className="form-control" placeholder="University Name" value={selectedUniversity} onChange={(e) => setSelectedUniversity(e.target.value)} />
            </div>
            <div className="col-12 d-flex justify-content-end gap-2 mt-3">
              <button
                className="btn"
                onClick={handleResetFilters}
                style={{
                  fontWeight: "600",
                  background: "rgba(245, 158, 11, 0.12)",
                  color: "#d97706",
                  border: "1px solid rgba(245, 158, 11, 0.35)",
                  borderRadius: "10px",
                }}
              >
                Reset
              </button>
              <button
                className="btn text-white"
                onClick={handleApplyFilters}
                style={{
                  fontWeight: "600",
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  border: "none",
                  borderRadius: "10px",
                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row g-4 mb-4">
        {/* Total Assigned Students */}
        <div className="col-12 col-md-4">
          <div
            style={{
              background: "linear-gradient(145deg, #0d1f17 0%, #132e22 100%)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              color: "#fff",
              padding: "24px",
              borderRadius: "16px",
              textAlign: "left",
              boxShadow: "0 12px 24px -6px rgba(13, 31, 23, 0.35)",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div style={{ position: "relative", zIndex: 2 }}>
              <h6 style={{ color: "#34d399", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Assigned Students</h6>
              <h2 style={{ fontSize: "2.5rem", fontWeight: "800", margin: "8px 0", color: "#ffffff" }}>{totalApplications}</h2>
              <p style={{ fontSize: "0.8rem", margin: 0, color: "#cbd5e1" }}>Total students under management</p>
            </div>
            <i className="fa-solid fa-user-graduate" style={{ position: "absolute", right: "20px", bottom: "20px", fontSize: "4rem", color: "#34d399", opacity: 0.18, zIndex: 1 }}></i>
          </div>
        </div>

        {/* Total Visa Processing */}
        <div className="col-12 col-md-4">
          <div
            style={{
              background: "linear-gradient(135deg, #091510 0%, #1f2912 100%)",
              border: "1px solid rgba(251, 191, 36, 0.4)",
              color: "#fff",
              padding: "24px",
              borderRadius: "16px",
              textAlign: "left",
              boxShadow: "0 12px 24px -6px rgba(245, 158, 11, 0.25)",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div style={{ position: "relative", zIndex: 2 }}>
              <h6 style={{ color: "#fbbf24", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Visa Processing</h6>
              <h2 style={{ fontSize: "2.5rem", fontWeight: "800", margin: "8px 0", color: "#ffffff" }}>{totaldocumentCount}</h2>
              <p style={{ fontSize: "0.8rem", margin: 0, color: "#cbd5e1" }}>Applications in visa stage</p>
            </div>
            <i className="fa-solid fa-passport" style={{ position: "absolute", right: "20px", bottom: "20px", fontSize: "4rem", color: "#fbbf24", opacity: 0.18, zIndex: 1 }}></i>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="col-12 col-md-4">
          <div
            style={{
              background: "linear-gradient(135deg, #10B981 0%, #047857 100%)",
              color: "#fff",
              padding: "24px",
              borderRadius: "16px",
              textAlign: "left",
              boxShadow: "0 10px 20px -3px rgba(16, 185, 129, 0.35)",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div style={{ position: "relative", zIndex: 2 }}>
              <h6 style={{ opacity: 0.9, fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Tasks</h6>
              <h2 style={{ fontSize: "2.5rem", fontWeight: "800", margin: "8px 0", color: "#ffffff" }}>{totalTasks}</h2>
              <p style={{ fontSize: "0.8rem", margin: 0, opacity: 0.9 }}>Pending tasks for students</p>
            </div>
            <i className="fa-solid fa-list-check" style={{ position: "absolute", right: "20px", bottom: "20px", fontSize: "4rem", opacity: 0.18, zIndex: 1 }}></i>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Workload Bar Chart */}
        <div className="col-12 col-md-6">
          <div className="card border-0 p-4 h-100 shadow-sm" style={{ borderRadius: "16px" }}>
            <h5 className="mb-4 fw-bold">Workload Overview</h5>
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
          <div className="card border-0 p-4 h-100 shadow-sm" style={{ borderRadius: "16px" }}>
            <h5 className="mb-4 fw-bold">Distribution</h5>
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
          <div className="card border-0 p-4 shadow-sm" style={{ borderRadius: "16px" }}>
            <h5 className="mb-4 fw-bold">Pending Tasks for Students</h5>
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
                              backgroundColor: task.status === "Completed" ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)", 
                              color: task.status === "Completed" ? "#10b981" : "#f59e0b" 
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
          <div className="card border-0 p-4 shadow-sm" style={{ borderRadius: "16px" }}>
            <h5 className="mb-4 fw-bold">All Stages Overview</h5>
            <div className="row g-3">
              {Object.entries(allStages).map(([stage, count], index) => (
                <div className="col-6 col-md-3" key={index}>
                  <div
                    className="p-3 rounded-3"
                    style={{
                      background: "rgba(16, 185, 129, 0.08)",
                      border: "1px solid rgba(16, 185, 129, 0.22)",
                      borderLeft: "4px solid #10b981",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center"
                    }}
                  >
                    <span className="text-muted" style={{ fontSize: "0.82rem", fontWeight: "700", textTransform: "uppercase" }}>{stage}</span>
                    <span style={{ fontSize: "1.8rem", color: "#10b981", fontWeight: "800" }}>{count}</span>
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

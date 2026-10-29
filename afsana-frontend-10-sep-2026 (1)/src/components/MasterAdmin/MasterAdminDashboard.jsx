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
import axios from "axios";
import BASE_URL from "../../Config";
import ManagerAISummary from "../AI/ManagerAISummary";
import AISettings from "./AISettings";

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

const MasterAdminDashboard = () => {
  const [totalAdmin, setTotalAdmin] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}masteradmindashboard`);
      if (res.data.success) {
        const { totaladmin, chart_data } = res.data.data;
        setTotalAdmin(totaladmin);
        setChartData(chart_data || []);
      }
    } catch (error) {
      console.error("Error fetching master admin dashboard data:", error);
    }
  };

  const barData = {
    labels: chartData.map((item) => item.label),
    datasets: [
      {
        label: "Count",
        data: chartData.map((item) => item.value),
        backgroundColor: ["#10b981", "#f59e0b"],
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
        backgroundColor: ["#10b981", "#f59e0b"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h2 className="fw-bold mb-0">Master Dashboard</h2>
        <ul
          className="nav nav-pills"
          style={{
            background: "rgba(16, 185, 129, 0.08)",
            padding: "5px",
            borderRadius: "14px",
            border: "1px solid rgba(16, 185, 129, 0.22)",
            gap: "6px",
          }}
        >
          <li className="nav-item">
            <button
              className={`nav-link fw-semibold ${activeTab === 'overview' ? 'active text-white' : ''}`}
              style={
                activeTab === 'overview'
                  ? { background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", borderRadius: "10px" }
                  : { color: "inherit", borderRadius: "10px" }
              }
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link fw-semibold ${activeTab === 'ai-summary' ? 'active text-white' : ''}`}
              style={
                activeTab === 'ai-summary'
                  ? { background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", borderRadius: "10px" }
                  : { color: "inherit", borderRadius: "10px" }
              }
              onClick={() => setActiveTab('ai-summary')}
            >
              <i className="fa-solid fa-wand-magic-sparkles me-1"></i> AI Insights
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link fw-semibold ${activeTab === 'ai-settings' ? 'active text-white' : ''}`}
              style={
                activeTab === 'ai-settings'
                  ? { background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", borderRadius: "10px" }
                  : { color: "inherit", borderRadius: "10px" }
              }
              onClick={() => setActiveTab('ai-settings')}
            >
              <i className="fa-solid fa-gear me-1"></i> AI Settings
            </button>
          </li>
        </ul>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="row g-3 mb-4 mt-2">
            <div className="col-12">
              <div
                style={{
                  background: "linear-gradient(135deg, #0d1f17 0%, #132e22 100%)",
                  border: "1px solid rgba(16, 185, 129, 0.35)",
                  color: "#fff",
                  padding: "24px",
                  borderRadius: "18px",
                  textAlign: "center",
                  height: "100%",
                  boxShadow: "0 12px 28px rgba(0, 0, 0, 0.25)",
                }}
              >
                <h5 style={{ color: "#34d399", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Admin</h5>
                <h2 style={{ color: "#fbbf24", fontWeight: 800, fontSize: "2.4rem", margin: 0 }}>{totalAdmin}</h2>
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="card border-0 p-4 h-100 shadow-sm" style={{ borderRadius: "16px" }}>
                <h5 className="mb-3 fw-bold">Admin</h5>
                <Bar
                  data={barData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                    },
                  }}
                />
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="card border-0 p-4 h-100 shadow-sm" style={{ borderRadius: "16px" }}>
                <h5 className="mb-3 fw-bold">Admin</h5>
                <Pie
                  data={pieData}
                  options={{
                    responsive: true,
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'ai-summary' && <ManagerAISummary />}
      {activeTab === 'ai-settings' && <AISettings />}
    </div>
  );
};

export default MasterAdminDashboard;

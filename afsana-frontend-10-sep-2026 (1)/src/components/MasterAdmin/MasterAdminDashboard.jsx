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
        backgroundColor: ["#0049B7", "#FF6B00"],
        borderRadius: 6,
      },
    ],
  };

  const pieData = {
    labels: chartData.map((item) => item.label),
    datasets: [
      {
        label: "Distribution",
        data: chartData.map((item) => item.value),
        backgroundColor: ["#0049B7", "#FF6B00"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Master Dashboard</h2>
        <ul className="nav nav-pills">
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'overview' ? 'active bg-primary' : 'text-dark'}`} onClick={() => setActiveTab('overview')}>Overview</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'ai-summary' ? 'active bg-primary' : 'text-dark'}`} onClick={() => setActiveTab('ai-summary')}><i className="fa-solid fa-wand-magic-sparkles me-1"></i> AI Insights</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'ai-settings' ? 'active bg-primary' : 'text-dark'}`} onClick={() => setActiveTab('ai-settings')}><i className="fa-solid fa-gear me-1"></i> AI Settings</button>
          </li>
        </ul>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="row g-3 mb-4 mt-2">
            <div className="col-12 ">
              <div
                style={{
                  background: "linear-gradient(135deg, #0049B7, #003f9a)",
                  color: "#fff",
                  padding: "20px",
                  borderRadius: "12px",
                  textAlign: "center",
                  height: "100%",
                }}
              >
                <h5>Total Admin</h5>
                <h2>{totalAdmin}</h2>
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  height: "100%",
                }}
              >
                <h5 className="mb-3">Admin</h5>
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
              <div
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  height: "100%",
                }}
              >
                <h5 className="mb-3">Admin</h5>
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

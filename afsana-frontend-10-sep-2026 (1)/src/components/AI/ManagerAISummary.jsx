import React, { useState, useEffect, useContext } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto'; // Automatically registers required chart.js components
import './AI.css';
import api from '../../interceptors/axiosInterceptor';
import BASE_URL from '../../Config';
import { ThemeContext } from '../../context/ThemeContext';

const ManagerAISummary = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get(`${BASE_URL}ai/analytics`);
        if (response.data && response.data.success) {
          const analytics = response.data.analytics;
          
          // Map dailyTrend to chartData
          const chartLabels = analytics.dailyTrend ? analytics.dailyTrend.map(d => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          const chartDataValues = analytics.dailyTrend ? analytics.dailyTrend.map(d => d.requests) : [0, 0, 0, 0, 0, 0, 0];
          
          setData({
            leadQuality: analytics.leadQuality || { high: 0, medium: 0, low: 0 },
            conversionSuggestions: analytics.conversionSuggestions || [],
            chartData: {
              labels: chartLabels,
              datasets: [
                {
                  label: 'AI Requests (Daily)',
                  data: chartDataValues,
                  backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899', '#6366f1'],
                  borderRadius: 8,
                  maxBarThickness: 44,
                  barPercentage: 0.5,
                  categoryPercentage: 0.5,
                  borderSkipped: false
                }
              ]
            }
          });
        }
      } catch (error) {
        console.error("Error fetching AI analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);

  if (loading) return <div className="text-center py-5"><i className="fa-solid fa-spinner fa-spin fa-2x text-primary mb-3"></i><p>Generating AI Performance Summary...</p></div>;

  return (
    <div className="row g-3 g-xl-4 mb-4 ai-summary-container">
      {/* AI Lead Insights */}
      <div className="col-xl-4 col-lg-4 col-md-12 col-12">
        <div className="ai-glass-card h-100 d-flex flex-column">
          <div className="card-header bg-transparent border-bottom border-light-subtle py-2 px-3 px-md-4 d-flex align-items-center justify-content-between ai-card-header">
            <h6 className="mb-0 fw-bold ai-gradient-text d-flex align-items-center gap-2" style={{ fontSize: '0.88rem' }}>
              <i className="fa-solid fa-lightbulb text-warning ai-pulse-icon"></i>
              AI Lead Insights
            </h6>
            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10 rounded-pill px-2 py-0.5 fw-semibold" style={{ fontSize: '0.7rem' }}>Quality Index</span>
          </div>
          <div className="card-body p-3 px-md-4 d-flex flex-column justify-content-center gap-3">
            <div className="lead-quality-item">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="ai-quality-label fw-semibold" style={{ fontSize: '0.82rem' }}>High Quality (Score &gt; 80)</span>
                <span className="badge bg-success rounded-pill px-2.5 py-0.5 fw-bold text-white" style={{ fontSize: '0.75rem' }}>{data.leadQuality.high}%</span>
              </div>
              <div className="progress progress-modern" style={{ height: '7px' }}>
                <div className="progress-bar bg-success-gradient" role="progressbar" style={{ width: `${data.leadQuality.high}%` }}></div>
              </div>
            </div>
            
            <div className="lead-quality-item">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="ai-quality-label fw-semibold" style={{ fontSize: '0.82rem' }}>Medium Quality (Score 50–80)</span>
                <span className="badge bg-warning text-dark rounded-pill px-2.5 py-0.5 fw-bold" style={{ fontSize: '0.75rem' }}>{data.leadQuality.medium}%</span>
              </div>
              <div className="progress progress-modern" style={{ height: '7px' }}>
                <div className="progress-bar bg-warning-gradient" role="progressbar" style={{ width: `${data.leadQuality.medium}%` }}></div>
              </div>
            </div>

            <div className="lead-quality-item">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="ai-quality-label fw-semibold" style={{ fontSize: '0.82rem' }}>Low Quality (Score &lt; 50)</span>
                <span className="badge bg-danger rounded-pill px-2.5 py-0.5 fw-bold text-white" style={{ fontSize: '0.75rem' }}>{data.leadQuality.low}%</span>
              </div>
              <div className="progress progress-modern" style={{ height: '7px' }}>
                <div className="progress-bar bg-danger-gradient" role="progressbar" style={{ width: `${data.leadQuality.low}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Performance Summary Chart */}
      <div className="col-xl-4 col-lg-4 col-md-12 col-12">
        <div className="ai-glass-card h-100 d-flex flex-column">
          <div className="card-header bg-transparent border-bottom border-light-subtle py-2 px-3 px-md-4 d-flex align-items-center justify-content-between ai-card-header">
            <h6 className="mb-0 fw-bold ai-gradient-text d-flex align-items-center gap-2" style={{ fontSize: '0.88rem' }}>
              <i className="fa-solid fa-chart-pie text-primary"></i>
              Performance Summary
            </h6>
            <span className="badge rounded-pill px-2 py-0.5 fw-semibold" style={{ color: isDarkMode ? '#34d399' : '#10b981', background: 'rgba(16,185,129,0.12)', fontSize: '0.7rem' }}>Weekly Trend</span>
          </div>
          <div className="card-body p-3 px-md-4 d-flex flex-column justify-content-center">
            <div style={{ height: '155px', width: '100%', position: 'relative' }}>
              <Bar 
                data={data.chartData} 
                options={{ 
                  responsive: true,
                  maintainAspectRatio: false, 
                  layout: {
                    padding: { top: 6, bottom: 2 }
                  },
                  plugins: { 
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: '#0f172a',
                      padding: 10,
                      cornerRadius: 8,
                      titleFont: { family: "'Plus Jakarta Sans'", size: 11, weight: '700' },
                      bodyFont: { family: "'Plus Jakarta Sans'", size: 11 },
                      callbacks: {
                        label: (ctx) => ` Requests: ${ctx.parsed.y}`
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      suggestedMax: Math.max(...(data.chartData?.datasets?.[0]?.data || [2]), 2),
                      grid: { color: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)', drawBorder: false },
                      ticks: { font: { family: "'Plus Jakarta Sans'", size: 10 }, color: '#94a3b8', stepSize: 1, precision: 0 }
                    },
                    x: {
                      grid: { display: false },
                      ticks: { font: { family: "'Plus Jakarta Sans'", size: 10 }, color: '#94a3b8' }
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Conversion Suggestions */}
      <div className="col-xl-4 col-lg-4 col-md-12 col-12">
        <div className="ai-glass-card h-100 d-flex flex-column">
          <div className="card-header bg-transparent border-bottom border-light-subtle py-2 px-3 px-md-4 d-flex align-items-center justify-content-between ai-card-header">
            <h6 className="mb-0 fw-bold ai-gradient-text d-flex align-items-center gap-2" style={{ fontSize: '0.88rem' }}>
              <i className="fa-solid fa-wand-magic-sparkles text-info ai-pulse-icon"></i>
              Conversion Suggestions
            </h6>
            <span className="badge bg-info bg-opacity-10 text-info rounded-pill px-2 py-0.5 fw-semibold" style={{ fontSize: '0.7rem' }}>AI Powered</span>
          </div>
          <div className="card-body p-3 px-md-4 d-flex flex-column justify-content-center">
            <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
              {data.conversionSuggestions.map((suggestion, idx) => (
                <li key={idx} className="d-flex align-items-start p-2 px-2.5 rounded-2 ai-suggestion-item shadow-sm">
                  <div className="suggestion-icon-wrap me-2 mt-0.5 flex-shrink-0" style={{ fontSize: '0.82rem' }}>
                    <i className="fa-solid fa-circle-info text-info"></i>
                  </div>
                  <span className="ai-suggestion-text fw-medium lh-sm" style={{ fontSize: '0.8rem' }}>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerAISummary;

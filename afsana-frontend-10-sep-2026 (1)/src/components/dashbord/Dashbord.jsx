import React, { useEffect, useState, useMemo, useContext } from 'react';
import { Container, Row, Col, Card, Form, Table, Modal, Button, Badge } from 'react-bootstrap';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler } from 'chart.js';
import { FaUsers, FaUserGraduate, FaUserTie, FaUniversity, FaTasks, FaQuestionCircle, FaChartLine, FaFilter, FaSearch, FaGlobeAmericas, FaCalendarAlt, FaUserCheck } from 'react-icons/fa';
import api from '../../interceptors/axiosInterceptor';
import BASE_URL from '../../Config';
import './AdminDashboard.css';
import Loader from '../common/Loader';
import ManagerAISummary from '../AI/ManagerAISummary';
import { ThemeContext } from '../../context/ThemeContext';

// Register ChartJS Components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler);

const Dashboard = () => {
    const { isDarkMode } = useContext(ThemeContext);
    const [allDashboardData, setAllDashboardData] = useState({});
    const [dashboardData, setDashboardData] = useState({}); // Filtered data
    const [counselors, setCounselors] = useState([]);
    const [showDateModal, setShowDateModal] = useState(false);
    const [customRange, setCustomRange] = useState({ start: '', end: '' });
    const [loading, setLoading] = useState(false);
    const [growthData, setGrowthData] = useState({
        this_month_conversion_rate: '0%',
        last_month_conversion_rate: '0%',
        growth_rate: '0%',
        top_counselors: [],
        conversion_funnel: { inquiries: 0, leadCount: 0, studentCount: 0, application: 0 },
        country_wise_converted_leads: []
    });

    // Role and User Info
    const user = JSON.parse(localStorage.getItem("login_detail") || "{}");
    const role = localStorage.getItem("role");
    const staff_id = role === "staff" ? user?.staff_id : (user?.id || user?.staff_id);

    const [filters, setFilters] = useState({
        fromDate: '', // Custom date range start
        toDate: '',   // Custom date range end
        country: '',
        counselor: '',
        status: '',
        intake: '',
        leadSource: ''
    });

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

    // Function to fetch dashboard data with filters
    const fetchDashboardData = async (filtersToUse = filters) => {
        setLoading(true);
        try {
            // Build query string from filters
            const queryParams = new URLSearchParams();
            
            // Map fromDate/toDate to startDate/endDate for API
            if (filtersToUse.fromDate) {
                queryParams.append('startDate', filtersToUse.fromDate);
            }
            if (filtersToUse.toDate) {
                queryParams.append('endDate', filtersToUse.toDate);
            }
            
            // Add other filters
            Object.entries(filtersToUse).forEach(([key, value]) => {
                if (value && key !== 'fromDate' && key !== 'toDate') {
                    queryParams.append(key, value);
                }
            });

            let url = "";
            let res = {};

            if (role === "staff") {
                // Use staff-specific dashboard endpoint
                queryParams.append('staff_id', staff_id);
                const queryString = queryParams.toString();
                url = `${BASE_URL}staffdashboard?${queryString}`;
                res = await api.get(url);
                console.log("Staff Dashboard API Response:", res.data);
                
                if (res.data.success) {
                    const staffData = res.data.data;
                    // Map staff data to dashboard structure
                    const mappedData = {
                        totalleads: staffData.total_leads,
                        totalInquiries: staffData.total_inquiries,
                        office_visited: staffData.office_visited,
                        scheduled_visits: staffData.scheduled_visits,
                        total_follow_ups: staffData.total_follow_ups,
                        monthly_achieved: staffData.monthly_achieved,
                        monthly_target: staffData.monthly_target,
                        conversion_rate: staffData.conversion_rate,
                        // Provide defaults for missing fields to avoid UI breaks
                        totalstudents: 0,
                        totalcounselors: 0,
                        totalUniversities: 0,
                        totalTasks: 0,
                        recentLeads: []
                    };
                    setAllDashboardData(mappedData);
                    setDashboardData(mappedData);
                }
            } else {
                // Original Admin Dashboard logic
                const queryString = queryParams.toString();
                url = queryString 
                    ? `${BASE_URL}dashboard?${queryString}`
                    : `${BASE_URL}dashboard`;
                    
                res = await api.get(url);
                console.log("Dashboard API Response with filters:", res.data);
                setAllDashboardData(res.data || {});
                setDashboardData(res.data || {});
            }
        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Apply filters to dashboard data
    const applyFiltersToData = useMemo(() => {
        if (!allDashboardData || Object.keys(allDashboardData).length === 0) {
            return {};
        }

        // Create a deep copy of the data to avoid mutating the original
        const filteredData = JSON.parse(JSON.stringify(allDashboardData));
        
        // Filter recent leads if they exist
        if (filteredData.recentLeads && Array.isArray(filteredData.recentLeads)) {
            filteredData.recentLeads = filteredData.recentLeads.filter(lead => {
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
                
                // Lead Source filter
                if (filters.leadSource) {
                    const leadSource = lead.source ? lead.source.toString().toLowerCase() : "";
                    const filterSource = filters.leadSource.toString().toLowerCase();
                    
                    if (!leadSource.includes(filterSource) && !filterSource.includes(leadSource)) {
                        return false;
                    }
                }
                
                // Custom date range filtering
                if (filters.fromDate || filters.toDate) {
                    const inRange = isDateInCustomRange(lead.created_at, filters.fromDate, filters.toDate);
                    if (!inRange) return false;
                }
                
                return true;
            });
        }
        
        // Filter student applications if they exist
        if (filteredData.studentApplications && Array.isArray(filteredData.studentApplications)) {
            filteredData.studentApplications = filteredData.studentApplications.filter(app => {
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
        }
        
        // Keep the original counts for static metrics
        filteredData.totalleads = allDashboardData.totalleads || 0;
        filteredData.totalstudents = allDashboardData.totalstudents || 0;
        filteredData.totalcounselors = allDashboardData.totalcounselors || 0;
        filteredData.totalUniversities = allDashboardData.totalUniversities || 0;
        filteredData.totalTasks = allDashboardData.totalTasks || 0;
        filteredData.totalInquiries = allDashboardData.totalInquiries || 0;
        
        return filteredData;
    }, [allDashboardData, filters]);

    // Update filtered data when filters change
    useEffect(() => {
        setDashboardData(applyFiltersToData);
    }, [applyFiltersToData]);

    const handleResetFilters = () => {
        const resetFilters = {
            fromDate: '',
            toDate: '',
            country: '',
            counselor: '',
            status: '',
            intake: '',
            leadSource: ''
        };
        setFilters(resetFilters);
        setCustomRange({ start: '', end: '' });
        // Fetch data without filters
        fetchDashboardData(resetFilters);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const handleCustomDateApply = (e) => {
        e.preventDefault();
        setFilters({
            ...filters,
            fromDate: customRange.start,
            toDate: customRange.end
        });
        setShowDateModal(false);
    };

    const handleSearch = () => {
        fetchDashboardData();
    };

    useEffect(() => {
        // Fetch dashboard data automatically when parameters change
        fetchDashboardData();
    }, [filters.country, filters.counselor, filters.status, filters.intake, filters.leadSource, filters.fromDate, filters.toDate]);

    useEffect(() => {
        const fetchGrowthData = async () => {
            try {
                const res = await api.get(`${BASE_URL}dashboardinfo`);
                console.log("Growth Data API Response:", res.data);
                setGrowthData(res.data || {});
            } catch (error) {
                console.error('Failed to fetch growth data', error);
            }
        };

        fetchGrowthData();
    }, []);

    useEffect(() => {
        const fetchCounselors = async () => {
            try {
                const res = await api.get(`${BASE_URL}counselor`);
                setCounselors(res.data);
            } catch (err) {
                console.error("Failed to fetch counselors", err);
            }
        };
        fetchCounselors();
    }, []);

    // Funnel Chart Data
    const funnelData = {
        labels: ['Inquiries', 'Leads', 'Students', 'Applicants'],
        datasets: [{
            label: 'Count',
            data: [
                growthData.conversion_funnel.inquiries || 0,
                growthData.conversion_funnel.leadCount || 0,
                growthData.conversion_funnel.studentCount || 0,
                growthData.conversion_funnel.application || 0
            ],
            backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.85)' : 'rgba(59, 130, 246, 0.8)',
            borderRadius: 8
        }]
    };

    // Day mapping for labels
    const dayShortMap = {
        Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun"
    };

    // Heatmap Data (Enhanced Timeline)
    const heatmapData = {
        labels: (growthData.weekly_inquiries_by_day || []).map(item => dayShortMap[item.day]),
        datasets: [{
            label: 'Inquiries',
            data: (growthData.weekly_inquiries_by_day || []).map(item => item.total_inquiries),
            borderColor: isDarkMode ? '#34d399' : '#6366f1',
            backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.14)' : 'rgba(99, 102, 241, 0.1)',
            fill: true,
            tension: 0.45, // Smoother curves
            pointRadius: 6,
            pointBackgroundColor: isDarkMode ? '#0d1511' : '#fff',
            pointBorderColor: isDarkMode ? '#34d399' : '#6366f1',
            pointBorderWidth: 2,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: isDarkMode ? '#34d399' : '#6366f1',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 3,
        }]
    };

    // World Map simulation with Pie chart (Modernized)
    const countryData = {
        labels: (growthData.country_wise_converted_leads || []).map(item => item.country),
        datasets: [{
            data: (growthData.country_wise_converted_leads || []).map(item => item.inquiries),
            backgroundColor: ['#10b981', '#6366f1', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'],
            borderWidth: 3,
            borderColor: isDarkMode ? '#101813' : '#ffffff',
            hoverOffset: 20
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                position: 'bottom', 
                labels: { 
                    usePointStyle: true, 
                    padding: 20,
                    font: { family: "'Plus Jakarta Sans'", size: 12, weight: '600' },
                    color: isDarkMode ? '#cbd5e1' : '#475569'
                } 
            },
            tooltip: {
                backgroundColor: '#0f172a',
                padding: 15,
                titleFont: { family: "'Plus Jakarta Sans'", size: 14, weight: '700' },
                bodyFont: { family: "'Plus Jakarta Sans'", size: 13 },
                cornerRadius: 12,
                displayColors: false,
                callbacks: {
                    label: (context) => ` ${context.parsed.y || context.parsed} total units`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)', drawBorder: false },
                ticks: { font: { family: "'Plus Jakarta Sans'", size: 11 }, color: isDarkMode ? '#94a3b8' : '#64748b' }
            },
            x: {
                grid: { display: false },
                ticks: { font: { family: "'Plus Jakarta Sans'", size: 11 }, color: isDarkMode ? '#94a3b8' : '#64748b' }
            }
        }
    };

    const pieOptions = {
        ...chartOptions,
        scales: undefined, // Pie charts don't have scales
        plugins: {
            ...chartOptions.plugins,
            legend: { 
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 14,
                    font: { family: "'Plus Jakarta Sans'", size: 11, weight: '600' },
                    color: isDarkMode ? '#cbd5e1' : '#475569'
                }
            }
        }
    };

    const cards = role === "staff" ? [
        { key: 'totalleads', label: 'Total Leads', value: dashboardData.totalleads || 0, icon: <FaUsers />, color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.14)', trend: '', trendUp: null },
        { key: 'office_visited', label: 'Office Visited', value: dashboardData.office_visited || 0, icon: <FaUserCheck />, color: '#10b981', glow: 'rgba(16, 185, 129, 0.14)', trend: '', trendUp: null },
        { key: 'scheduled_visits', label: 'Scheduled Visits', value: dashboardData.scheduled_visits || 0, icon: <FaCalendarAlt />, color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.14)', trend: '', trendUp: null },
        { key: 'total_follow_ups', label: 'Follow Ups', value: dashboardData.total_follow_ups || 0, icon: <FaChartLine />, color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.14)', trend: '', trendUp: null },
        { key: 'conversion_rate', label: 'Conversion Rate', value: `${dashboardData.conversion_rate || 0}%`, icon: <FaTasks />, color: '#ec4899', glow: 'rgba(236, 72, 153, 0.14)', trend: '', trendUp: null },
        { key: 'totalInquiries', label: 'Inquiries', value: dashboardData.totalInquiries || 0, icon: <FaQuestionCircle />, color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.14)', trend: '', trendUp: null },
    ] : [
        { key: 'totalleads', label: 'Total Leads', value: dashboardData.totalleads || 0, icon: <FaUsers />, color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.14)', trend: '+12%', trendUp: true },
        { key: 'totalstudents', label: 'Total Students', value: dashboardData.totalstudents || 0, icon: <FaUserGraduate />, color: '#10b981', glow: 'rgba(16, 185, 129, 0.14)', trend: '+5%', trendUp: true },
        { key: 'totalcounselors', label: 'Total Counselors', value: dashboardData.totalcounselors || 0, icon: <FaUserTie />, color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.14)', trend: 'Stable', trendUp: null },
        { key: 'totalUniversities', label: 'Total Universities', value: dashboardData.totalUniversities || 0, icon: <FaUniversity />, color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.14)', trend: '+2', trendUp: true },
        { key: 'totalTasks', label: 'Total Tasks', value: dashboardData.totalTasks || 0, icon: <FaTasks />, color: '#ec4899', glow: 'rgba(236, 72, 153, 0.14)', trend: '-3%', trendUp: false },
        { key: 'totalInquiries', label: 'Inquiries', value: dashboardData.totalInquiries || 0, icon: <FaQuestionCircle />, color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.14)', trend: '+18%', trendUp: true },
    ];

    return (
        <div className="dashboard-container p-3 p-md-4 p-xl-4 pb-5">
            {loading && <Loader text="Analyzing Analytics Data..." />}
            {/* KPI Metrics */}
            <Row className="g-3 g-xl-4 mb-4">
                {cards.map((card, index) => (
                    <Col key={card.key} xl={2} lg={4} md={4} sm={6} xs={6} className="animate-fade-in" style={{ animationDelay: `${index * 0.08}s` }}>
                        <Card className="glass-card kpi-card">
                            <div className="kpi-header">
                                <div className="icon-wrapper" style={{ color: card.color, background: card.glow }}>
                                    {card.icon}
                                </div>
                                {card.trend && (
                                    <div className={`trend-badge-pill ${card.trendUp === true ? 'trend-up' : card.trendUp === false ? 'trend-down' : 'trend-stable'}`}>
                                        <span>{card.trendUp === true ? '↑' : card.trendUp === false ? '↓' : '•'}</span>
                                        <span>{card.trend}</span>
                                    </div>
                                )}
                            </div>
                            <div className="kpi-content">
                                <h6 title={card.label}>{card.label}</h6>
                                <h3>{card.value.toLocaleString()}</h3>
                                {card.trend && (
                                    <p className="trend-context-text mb-0">vs last month</p>
                                )}
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
            
            {/* Monthly Target Tracking for Staff */}
            {role === "staff" && (
                <Row className="mb-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                    <Col md={12}>
                        <Card className="glass-card p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h5 className="mb-1 fw-bold">Monthly Office Visit Target</h5>
                                    <p className="text-muted small mb-0">Target: {dashboardData.monthly_target || 100} visits per month</p>
                                </div>
                                <div className="text-end">
                                    <h4 className="mb-0 fw-bold" style={{ color: '#10b981' }}>{dashboardData.monthly_achieved || 0} / {dashboardData.monthly_target || 100}</h4>
                                    <Badge bg="emerald" className="mt-1" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
                                        {Math.round(((dashboardData.monthly_achieved || 0) / (dashboardData.monthly_target || 100)) * 100)}% Achieved
                                    </Badge>
                                </div>
                            </div>
                            <div className="progress-wrapper" style={{ height: '12px', background: 'rgba(16, 185, 129, 0.12)', borderRadius: '6px', overflow: 'hidden' }}>
                                <div 
                                    className="progress-bar-fill" 
                                    style={{ 
                                        width: `${Math.min(100, Math.round(((dashboardData.monthly_achieved || 0) / (dashboardData.monthly_target || 100)) * 100))}%`, 
                                        height: '100%', 
                                        background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                                        transition: 'width 1s ease-in-out'
                                    }}
                                />
                            </div>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* AI Summary Section */}
            {role !== 'staff' && (
                <div className="mb-4 animate-fade-in" style={{ animationDelay: '0.65s' }}>
                    <ManagerAISummary />
                </div>
            )}

            {/* Performance Summary Bar */}
            <div className="performance-insight mb-4 mb-lg-5 animate-fade-in" style={{ animationDelay: '0.7s' }}>
                <Row className="align-items-center g-4">
                    <Col lg={6} md={12}>
                        <div className="d-flex align-items-center gap-3 gap-md-4">
                            <div className="insight-icon-box p-3 bg-white bg-opacity-10 rounded-circle border border-white border-opacity-10 shadow-lg flex-shrink-0">
                                <FaChartLine size={28} />
                            </div>
                            <div>
                                <h3 className="m-0 fw-800 insight-title">Conversion Growth Analysis</h3>
                                <p className="opacity-75 mb-0 mt-1 small">Real-time insight into monthly lead-to-student conversion dynamics.</p>
                            </div>
                        </div>
                    </Col>
                    <Col lg={6} md={12}>
                        <div className="d-flex flex-wrap justify-content-lg-end justify-content-start align-items-center gap-3 gap-md-4 mt-2 mt-lg-0">
                            <div className="insight-item">
                                <h4>THIS MONTH</h4>
                                <div className="rate">{growthData.this_month_conversion_rate}</div>
                            </div>
                            <div className="insight-item border-start border-white border-opacity-10 ps-3 ps-md-4">
                                <h4>LAST MONTH</h4>
                                <div className="rate">{growthData.last_month_conversion_rate}</div>
                            </div>
                            <div className={`growth-badge ${parseFloat(growthData.growth_rate) >= 0 ? 'growth-positive' : 'growth-negative'}`}>
                                {parseFloat(growthData.growth_rate) >= 0 ? '▲' : '▼'} {growthData.growth_rate}
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Smart Filter Bar */}
            <Card className="glass-card mb-4 mb-lg-5 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <Card.Body className="p-3 p-md-4">
                    <div className="section-header d-flex justify-content-between align-items-center mb-3 mb-md-4">
                        <div className="d-flex align-items-center gap-2">
                            <FaFilter className="text-emerald" style={{ color: '#10b981' }} />
                            <h5 className="mb-0 fw-bold">Advanced Analytics Filters</h5>
                        </div>
                        <Button variant="link" onClick={handleResetFilters} className="text-danger p-0 text-decoration-none fw-bold small">Clear All Filters</Button>
                    </div>
                    <Row className="g-3">
                        <Col xl={3} lg={3} md={4} sm={6} xs={12}>
                            <div className="filter-input-group">
                                <FaCalendarAlt className="filter-icon" />
                                <Form.Control type="date" name="fromDate" value={filters.fromDate} onChange={handleChange} className="filter-control" />
                            </div>
                        </Col>
                        <Col xl={3} lg={3} md={4} sm={6} xs={12}>
                            <div className="filter-input-group">
                                <FaCalendarAlt className="filter-icon" />
                                <Form.Control type="date" name="toDate" value={filters.toDate} onChange={handleChange} className="filter-control" />
                            </div>
                        </Col>
                        <Col xl={3} lg={3} md={4} sm={6} xs={12}>
                            <div className="filter-input-group">
                                <FaGlobeAmericas className="filter-icon" />
                                <Form.Select name="country" onChange={handleChange} value={filters.country} className="filter-control">
                                    <option value="">All Countries</option>
                                    <option>Hungary</option><option>UK</option><option>Cyprus</option><option>Canada</option>
                                    <option>Malaysia</option><option>Germany</option><option>USA</option><option>Australia</option>
                                </Form.Select>
                            </div>
                        </Col>
                        <Col xl={3} lg={3} md={4} sm={6} xs={12}>
                            <div className="filter-input-group">
                                <FaUserTie className="filter-icon" />
                                <Form.Select name="counselor" onChange={handleChange} value={filters.counselor} className="filter-control">
                                    <option value="">All Counselors</option>
                                    {counselors.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                                </Form.Select>
                            </div>
                        </Col>
                        <Col xl={3} lg={3} md={4} sm={6} xs={12}>
                            <div className="filter-input-group">
                                <FaUserCheck className="filter-icon" />
                                <Form.Select name="status" onChange={handleChange} value={filters.status} className="filter-control">
                                    <option value="">All Statuses</option>
                                    <option value="New">New</option><option value="In Review">In Review</option>
                                    <option value="Converted to lead">Converted to Lead</option><option value="Not Interested">Not Interested</option>
                                </Form.Select>
                            </div>
                        </Col>
                        <Col xl={3} lg={3} md={4} sm={6} xs={12}>
                            <div className="filter-input-group">
                                <FaFilter className="filter-icon" />
                                <Form.Select name="intake" onChange={handleChange} value={filters.intake} className="filter-control">
                                    <option value="">All Intakes</option>
                                    <option value="February">February</option><option value="September">September</option>
                                </Form.Select>
                            </div>
                        </Col>
                        <Col xl={3} lg={3} md={4} sm={6} xs={12}>
                            <div className="filter-input-group">
                                <FaSearch className="filter-icon" />
                                <Form.Select name="leadSource" onChange={handleChange} value={filters.leadSource} className="filter-control">
                                    <option value="">All Sources</option>
                                    <option value="Whatsapp">Whatsapp</option><option value="Facebook">Facebook</option><option value="Website">Website</option>
                                </Form.Select>
                            </div>
                        </Col>
                        <Col xl={3} lg={3} md={4} sm={6} xs={12}>
                            <Button variant="outline-primary" onClick={handleSearch} className="w-100 rounded-pill fw-bold filter-refresh-btn shadow-sm transition-all"><FaSearch className="me-2" /> Refresh Analytics</Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Charts & Tables */}
            <Row className="g-4 animate-fade-in" style={{ animationDelay: '0.8s' }}>
                <Col xl={8} lg={7} md={12}>
                    <Card className="glass-card mb-4">
                        <Card.Body className="p-3 p-md-4">
                            <div className="section-header mb-3"><h5 className="fw-bold mb-0">Conversion Pipeline</h5></div>
                            <div className="chart-wrapper" style={{ height: '330px', position: 'relative' }}>
                                <Bar data={funnelData} options={chartOptions} />
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="glass-card mb-4 mb-xl-0">
                        <Card.Body className="p-3 p-md-4">
                            <div className="section-header mb-3"><h5 className="fw-bold mb-0">Engagement Timeline</h5></div>
                            <div className="chart-wrapper" style={{ height: '330px', position: 'relative' }}>
                                <Line data={heatmapData} options={chartOptions} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xl={4} lg={5} md={12}>
                    <Card className="glass-card mb-4">
                        <Card.Body className="p-3 p-md-4">
                            <div className="section-header mb-3"><h5 className="fw-bold mb-0">Elite Counselors</h5></div>
                            <div className="table-responsive">
                                <Table hover className="leaderboard-table align-middle mb-0">
                                    <thead><tr><th>Rank</th><th>Counselor</th><th>Units</th></tr></thead>
                                    <tbody>
                                        {growthData.top_counselors.map((c, idx) => (
                                            <tr key={c.counselor_id}>
                                                <td><div className={`rank-badge rank-${idx + 1}`}>{idx + 1}</div></td>
                                                <td>
                                                    <div className="fw-700">{c.full_name}</div>
                                                    <div className="small text-muted opacity-75">Senior Consultant</div>
                                                </td>
                                                <td><Badge className="px-3 py-2 rounded-pill border shadow-sm fw-800 counselor-units-badge">{c.converted_leads}</Badge></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="glass-card">
                        <Card.Body className="p-3 p-md-4">
                            <div className="section-header mb-3"><h5 className="fw-bold mb-0">Global Distribution</h5></div>
                            <div className="chart-wrapper" style={{ height: '330px', position: 'relative' }}>
                                <Pie data={countryData} options={pieOptions} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

        </div>
    );
};

export default Dashboard;

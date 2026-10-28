import React, { useState } from "react";
import api from "../../../interceptors/axiosInterceptor";
import BASE_URL from "../../../Config";
import { saveAs } from "file-saver";
import Loader from "../../common/Loader";
import Swal from "sweetalert2";

const ProcessorReports = () => {
  const [loading, setLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState("dashboard");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const processorId = localStorage.getItem("user_id");

  const modules = [
    { value: "dashboard", label: "Dashboard Summary" },
    { value: "students", label: "Assigned Students" },
    { value: "applications", label: "University Applications" },
    { value: "documents", label: "Document Approvals" },
    { value: "tasks", label: "Task Management" },
    { value: "visa", label: "Visa Processing" },
  ];

  const handleQuickDate = (type) => {
    const today = new Date();
    let start = new Date();
    
    if (type === "week") {
      start.setDate(today.getDate() - 7);
    } else if (type === "month") {
      start.setMonth(today.getMonth() - 1);
    }
    
    setFromDate(start.toISOString().split("T")[0]);
    setToDate(today.toISOString().split("T")[0]);
  };

  const downloadCSV = (filename, headers, rows) => {
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(cell => `"${(cell || "").toString().replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, filename);
  };

  const handleExport = async () => {
    if (!processorId) return;

    setLoading(true);
    try {
      if (selectedModule === "dashboard") {
        const queryParams = new URLSearchParams();
        if (fromDate) queryParams.append("fromDate", fromDate);
        if (toDate) queryParams.append("toDate", toDate);

        const res = await api.get(`${BASE_URL}processordashboard/${processorId}?${queryParams.toString()}`);
        if (res.data.success) {
          const { totalapplication, totaldocumentCount, totaltasks, all_stages } = res.data.data;
          
          const headers = ["Metric", "Value"];
          const rows = [
            ["Assigned Students", totalapplication],
            ["Visa Processing", totaldocumentCount],
            ["Total Tasks", totaltasks],
            ["---", "---"],
            ["Stage", "Count"],
            ...Object.entries(all_stages || {}).map(([stage, count]) => [stage, count])
          ];

          downloadCSV(`dashboard_report_${new Date().toISOString().split("T")[0]}.csv`, headers, rows);
        }
      } 
      else if (selectedModule === "students") {
        const res = await api.get(`auth/getAssignedStudentsinProcessordashboard?processor_id=${processorId}`);
        let students = res.data?.users || [];
        
        if (fromDate && toDate) {
          const start = new Date(fromDate).getTime();
          const end = new Date(toDate).getTime();
          students = students.filter(s => {
            const created = new Date(s.created_at).getTime();
            return created >= start && created <= end;
          });
        }

        const headers = ["ID", "Student Name", "Email", "Mobile", "University", "Country", "Stage"];
        const rows = students.map(s => [
          s.id, s.full_name, s.student_email, s.mobile_number, s.university_name, s.country, s.Application_stage === "1" ? "Applied" : "Pending"
        ]);

        downloadCSV(`students_report_${new Date().toISOString().split("T")[0]}.csv`, headers, rows);
      }
      else if (selectedModule === "applications") {
        const res = await api.get(`getAplicationBYProcessorID/${processorId}`);
        let apps = res.data || [];

        if (fromDate && toDate) {
          const start = new Date(fromDate).getTime();
          const end = new Date(toDate).getTime();
          apps = apps.filter(a => {
            const d = new Date(a.created_at).getTime();
            return d >= start && d <= end;
          });
        }

        const headers = ["App ID", "Student Name", "University", "Status", "Date"];
        const rows = apps.map(a => [
          a.id, a.student_name, a.university_name, a.status === 1 ? "Active" : "Inactive", new Date(a.created_at).toLocaleDateString()
        ]);

        downloadCSV(`applications_report_${new Date().toISOString().split("T")[0]}.csv`, headers, rows);
      }
      else if (selectedModule === "documents") {
        const res = await api.get(`${BASE_URL}studentUploads`, { params: { role: "processors", staff_id: processorId } });
        let docs = res.data || [];

        if (fromDate && toDate) {
          const start = new Date(fromDate).getTime();
          const end = new Date(toDate).getTime();
          docs = docs.filter(d => {
            const t = new Date(d.uploaded_at).getTime();
            return t >= start && t <= end;
          });
        }

        const headers = ["ID", "Student", "Type", "Status", "Uploaded At"];
        const rows = docs.map(d => [
          d.id, d.student_name, d.document_type, d.status, new Date(d.uploaded_at).toLocaleString()
        ]);

        downloadCSV(`documents_report_${new Date().toISOString().split("T")[0]}.csv`, headers, rows);
      }
      else if (selectedModule === "tasks") {
        const res = await api.get(`${BASE_URL}tasks/processor/${processorId}`);
        let tasks = res.data || [];

        if (fromDate && toDate) {
          const start = new Date(fromDate).getTime();
          const end = new Date(toDate).getTime();
          tasks = tasks.filter(t => {
            const d = new Date(t.due_date).getTime();
            return d >= start && d <= end;
          });
        }

        const headers = ["ID", "Student", "Task", "Priority", "Status", "Due Date"];
        const rows = tasks.map(t => [
          t.id, t.student_name, t.task_name, t.priority, t.status, t.due_date
        ]);

        downloadCSV(`tasks_report_${new Date().toISOString().split("T")[0]}.csv`, headers, rows);
      }
      else if (selectedModule === "visa") {
        const res = await api.get(`${BASE_URL}getvisaprocessbyprocessorid/VisaProcess/${processorId}`);
        let visas = res.data || [];

        if (fromDate && toDate) {
          const start = new Date(fromDate).getTime();
          const end = new Date(toDate).getTime();
          visas = Array.isArray(visas) ? visas.filter(v => {
            const d = new Date(v.created_at).getTime();
            return d >= start && d <= end;
          }) : [];
        }

        const headers = ["ID", "Student", "University", "Country", "Stage", "Created At"];
        const rows = Array.isArray(visas) ? visas.map(v => [
          v.id, v.full_name, v.university_name, v.country, v.visa_processing_stage || "Initial", new Date(v.created_at).toLocaleDateString()
        ]) : [];

        downloadCSV(`visa_report_${new Date().toISOString().split("T")[0]}.csv`, headers, rows);
      }
      Swal.fire("Success", "Report downloaded successfully!", "success");
    } catch (error) {
      console.error("Export error:", error);
      Swal.fire("Error", "Failed to generate report", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4" style={{ backgroundColor: "#F9FAFB", minHeight: "100vh" }}>
      {loading && <Loader text="Generating Report..." />}
      
      <h2 className="mb-4" style={{ fontWeight: "700", color: "#111827" }}>Reports & Downloads</h2>

      <div className="card shadow-sm border-0" style={{ borderRadius: "16px", maxWidth: "800px" }}>
        <div className="card-body p-4">
          <h5 className="mb-4" style={{ fontWeight: "600", color: "#374151" }}>Generate Report</h5>

          <div className="mb-4">
            <label className="form-label" style={{ fontWeight: "600" }}>Select Module</label>
            <select 
              className="form-select" 
              value={selectedModule} 
              onChange={(e) => setSelectedModule(e.target.value)}
            >
              {modules.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label" style={{ fontWeight: "600" }}>From Date</label>
              <input 
                type="date" 
                className="form-control" 
                value={fromDate} 
                onChange={(e) => setFromDate(e.target.value)} 
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" style={{ fontWeight: "600" }}>To Date</label>
              <input 
                type="date" 
                className="form-control" 
                value={toDate} 
                onChange={(e) => setToDate(e.target.value)} 
              />
            </div>
          </div>

          <div className="d-flex gap-2 mb-4">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => handleQuickDate("week")}>
              Past 7 Days
            </button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => handleQuickDate("month")}>
              Past 30 Days
            </button>
            <button className="btn btn-outline-danger btn-sm" onClick={() => { setFromDate(""); setToDate(""); }}>
              Clear Dates
            </button>
          </div>

          <button 
            className="btn btn-primary w-100 py-2" 
            style={{ fontWeight: "600", borderRadius: "8px", background: "#4F46E5", border: "none" }}
            onClick={handleExport}
          >
            <i className="fa-solid fa-download me-2"></i> Download Report (CSV)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcessorReports;

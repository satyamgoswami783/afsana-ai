import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../../Config";
import { format } from "date-fns";

const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role");
  const counselor_id = localStorage.getItem("counselor_id");
  const loginDetail = JSON.parse(localStorage.getItem("login_detail") || "{}");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const params = {};
      if (role === 'counselor' && counselor_id) {
        params.counselor_id = counselor_id;
      } else if (loginDetail?.id && role !== 'admin') {
        params.counselor_id = loginDetail.id;
      }
      const response = await axios.get(`${config.apiUrl}/ai-dashboards/appointments`, { params });
      setAppointments(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-dark fw-bold mb-0">📅 Upcoming Appointments</h2>
          <p className="text-muted mb-0">Consultations scheduled by AI or manually.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          {appointments.length > 0 ? (
            appointments.map((appt) => (
              <div className="col-md-4 mb-4" key={appt.id}>
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="badge bg-primary px-3 py-2 rounded-pill">
                        {appt.inquiry_type || "Office Visit"}
                      </span>
                      <small className="text-muted fw-bold">
                        {appt.office_visit_date ? format(new Date(appt.office_visit_date), "MMM dd, yyyy - hh:mm a") : "TBD"}
                      </small>
                    </div>
                    <h5 className="fw-bold mb-1">{appt.full_name}</h5>
                    <p className="text-muted mb-3"><i className="bi bi-telephone-fill me-2"></i>{appt.phone_number}</p>
                    <p className="mb-0 text-dark"><i className="bi bi-geo-alt-fill me-2 text-danger"></i>{appt.country || "Not specified"}</p>
                  </div>
                  <div className="card-footer bg-white border-0 text-end">
                    <button className="btn btn-outline-primary btn-sm">View Details</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5">
              <h5 className="text-muted">No upcoming appointments scheduled.</h5>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentsList;

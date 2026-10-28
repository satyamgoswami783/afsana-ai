import React, { useState } from 'react';
import api from '../../interceptors/axiosInterceptor';
import BASE_URL from '../../Config';

const AppointmentBooking = ({ onNext, onCancel, userData }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [booked, setBooked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    if (selectedDate && selectedTime) {
      setLoading(true);
      try {
        // If we have a lead ID, create a follow up task for the counselor
        if (userData && userData.leadId) {
          await api.post(`${BASE_URL}follow_ups`, {
            inquiry_id: userData.leadId,
            follow_up_date: selectedDate,
            next_action: `Counseling session scheduled at ${selectedTime}`,
            notes: "Booked via AI Chatbot",
            status: "Scheduled"
          });
        }
      } catch (err) {
        console.error("Error booking appointment:", err);
      } finally {
        setLoading(false);
        setBooked(true);
        setTimeout(() => {
          onNext();
        }, 2000);
      }
    }
  };

  const timeSlots = ['10:00 AM', '11:30 AM', '02:00 PM', '04:00 PM'];

  if (booked) {
    return (
      <div className="p-4 text-center">
        <i className="fa-solid fa-check-circle text-success fs-1 mb-3"></i>
        <h6 className="text-dark">Appointment Confirmed!</h6>
        <p className="text-muted small">Your counselor will call you on {selectedDate} at {selectedTime}.</p>
      </div>
    );
  }

  return (
    <div className="appointment-booking p-3">
      <h6 className="mb-3 text-primary"><i className="fa-regular fa-calendar-check me-2"></i>Book Counseling Session</h6>
      <p className="small text-muted mb-3">Select a date and time to discuss your options with an expert counselor.</p>
      
      <div className="mb-3">
        <label className="form-label small fw-bold">Select Date</label>
        <input 
          type="date" 
          className="form-control form-control-sm" 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)} 
          min={new Date().toISOString().split("T")[0]}
        />
      </div>

      <div className="mb-3">
        <label className="form-label small fw-bold">Select Time Slot</label>
        <div className="d-flex flex-wrap gap-2">
          {timeSlots.map((slot, idx) => (
            <button 
              key={idx} 
              className={`btn btn-sm ${selectedTime === slot ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setSelectedTime(slot)}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      <div className="d-flex gap-2 mt-4">
        <button 
          className="btn btn-primary btn-sm flex-grow-1" 
          onClick={handleBook}
          disabled={!selectedDate || !selectedTime}
        >
          Confirm Booking
        </button>
      </div>
      <div className="text-center mt-2">
        <button className="btn btn-link btn-sm text-muted text-decoration-none" onClick={onNext}>Skip for now</button>
      </div>
    </div>
  );
};

export default AppointmentBooking;

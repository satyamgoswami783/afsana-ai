import React, { useState } from 'react';

const LeadCaptureForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    education: '',
    ielts: '',
    budget: '',
    country: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="lead-capture-form p-3">
      <h6 className="mb-3 text-primary"><i className="fa-solid fa-clipboard-user me-2"></i>Please provide your details</h6>
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <input type="text" name="name" className="form-control form-control-sm" placeholder="Full Name" required value={formData.name} onChange={handleChange} />
        </div>
        <div className="mb-2">
          <input type="tel" name="phone" className="form-control form-control-sm" placeholder="Phone Number" required value={formData.phone} onChange={handleChange} />
        </div>
        <div className="mb-2">
          <input type="email" name="email" className="form-control form-control-sm" placeholder="Email Address" required value={formData.email} onChange={handleChange} />
        </div>
        <div className="mb-2">
          <select name="education" className="form-select form-select-sm" required value={formData.education} onChange={handleChange}>
            <option value="">Highest Education Level</option>
            <option value="High School">High School / 12th</option>
            <option value="Bachelor's">Bachelor's Degree</option>
            <option value="Master's">Master's Degree</option>
          </select>
        </div>
        <div className="mb-2">
          <select name="ielts" className="form-select form-select-sm" required value={formData.ielts} onChange={handleChange}>
            <option value="">IELTS/TOEFL Score</option>
            <option value="Not Taken">Not Taken</option>
            <option value="Below 6.0">Below 6.0</option>
            <option value="6.0 - 6.5">6.0 - 6.5</option>
            <option value="7.0 and above">7.0 and above</option>
          </select>
        </div>
        <div className="mb-2">
          <select name="budget" className="form-select form-select-sm" required value={formData.budget} onChange={handleChange}>
            <option value="">Expected Budget (per year)</option>
            <option value="Below $10k">Below $10k</option>
            <option value="$10k - $20k">$10k - $20k</option>
            <option value="$20k - $30k">$20k - $30k</option>
            <option value="Above $30k">Above $30k</option>
          </select>
        </div>
        <div className="mb-3">
          <select name="country" className="form-select form-select-sm" required value={formData.country} onChange={handleChange}>
            <option value="">Preferred Study Destination</option>
            <option value="UK">UK</option>
            <option value="USA">USA</option>
            <option value="Canada">Canada</option>
            <option value="Australia">Australia</option>
            <option value="Europe">Europe</option>
            <option value="Undecided">Undecided</option>
          </select>
        </div>
        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary btn-sm flex-grow-1">Start Evaluation</button>
          {onCancel && <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onCancel}>Cancel</button>}
        </div>
      </form>
    </div>
  );
};

export default LeadCaptureForm;

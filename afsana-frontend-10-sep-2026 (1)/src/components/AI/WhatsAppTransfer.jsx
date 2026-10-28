import React from 'react';

const WhatsAppTransfer = ({ userData, onRestart }) => {
  // Using a direct anchor tag instead of window.open for reliable redirects

  return (
    <div className="whatsapp-transfer p-4 text-center">
      <div className="mb-4">
        <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow" style={{ width: '60px', height: '60px' }}>
          <i className="fa-brands fa-whatsapp fs-2"></i>
        </div>
        <h5 className="text-dark">Connect on WhatsApp</h5>
        <p className="text-muted small px-2">
          Have more questions? Our expert counselors are available on WhatsApp to guide you instantly.
        </p>
      </div>

      <a 
        href={`https://wa.me/${userData?.assignedCounselor?.phone ? userData.assignedCounselor.phone.replace(/[^0-9]/g, '') : "1234567890"}?text=${encodeURIComponent(`Hi ${userData?.assignedCounselor?.name || 'Counselor'}, I am ${userData?.name || 'a student'} interested in studying in ${userData?.country || 'abroad'}. Please assist me with my application.`)}`}
        target="_blank"
        rel="noreferrer"
        className="btn btn-success w-100 rounded-pill shadow-sm mb-3 d-flex align-items-center justify-content-center"
      >
        <i className="fa-brands fa-whatsapp me-2"></i> Chat with Counselor
      </a>

      <button className="btn btn-link text-muted small text-decoration-none" onClick={onRestart}>
        <i className="fa-solid fa-rotate-right me-1"></i> Start Over
      </button>
    </div>
  );
};

export default WhatsAppTransfer;

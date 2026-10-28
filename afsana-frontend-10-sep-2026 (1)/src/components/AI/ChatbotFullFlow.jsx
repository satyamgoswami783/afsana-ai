import React, { useState } from 'react';
import LeadCaptureForm from './LeadCaptureForm';
import ConversationalAIChatbot from './ConversationalAIChatbot';
import EligibilityCheck from './EligibilityCheck';
import CountryRecommendation from './CountryRecommendation';
import UniversityRecommendation from './UniversityRecommendation';
import DocumentChecklist from './DocumentChecklist';
import AppointmentBooking from './AppointmentBooking';
import WhatsAppTransfer from './WhatsAppTransfer';
import './AI.css';
import api from '../../interceptors/axiosInterceptor';
import BASE_URL from '../../Config';

const ChatbotFullFlow = () => {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState(null);

  const handleLeadSubmit = async (data) => {
    try {
      // Actually submit the lead to the backend
      const response = await api.post(`${BASE_URL}inquiries`, {
        name: data.name,
        full_name: data.name,
        phone: data.phone,
        phone_number: data.phone,
        email: data.email,
        budget: data.budget,
        country: data.country,
        source: "AI Chatbot",
        inquiry_type: "General",
        priority: "High",
        branch: "Sylhet",
        education_background: [{ level: data.education }],
        overall_score: data.ielts,
        date_of_inquiry: new Date().toISOString().split("T")[0]
      });
      
      // Keep the database ID if we want to update it later
      const leadId = response.data?.insertId || response.data?.id;
      setUserData({ ...data, leadId });
    } catch (err) {
      console.error("Error creating lead from chatbot:", err);
      // Proceed anyway with the local data so the chat doesn't break
      setUserData(data);
    }
    
    setStep(2);
  };

  const handleNextStep = () => {
    setStep((prev) => prev + 1);
  };

  const handleRestart = () => {
    setUserData(null);
    setStep(1);
  };

  // Convert userData to the format expected by recommendation components
  const leadFormat = userData ? {
    full_name: userData.name,
    budget: userData.budget,
    country: userData.country,
    overall_score: userData.ielts,
    study_level: userData.education
  } : null;

  return (
    <div className="chatbot-full-flow ai-glass-card" style={{ width: '350px', maxWidth: '100%', height: '520px', display: 'flex', flexDirection: 'column' }}>
      <div className="chatbot-header text-white p-3 d-flex align-items-center justify-content-between shadow-sm">
        <div className="d-flex align-items-center">
          <i className="fa-solid fa-robot fs-4 me-2 ai-pulse-icon"></i>
          <div>
            <h6 className="mb-0 fw-bold">Afsana AI Assistant</h6>
            <small className="opacity-75">Online</small>
          </div>
        </div>
        {step > 1 && (
          <button className="btn btn-link text-white p-0" onClick={handleRestart} title="Restart">
            <i className="fa-solid fa-rotate-right"></i>
          </button>
        )}
      </div>

      <div className="chatbot-body p-3 overflow-auto" style={{ flexGrow: 1, backgroundColor: 'rgba(248, 249, 250, 0.5)' }}>
        {/* Step 1: Lead Capture via Conversational AI */}
        {step === 1 && (
          <div className="animate__animated animate__fadeIn">
            {/* The ConversationalAIChatbot handles the chat UI and extraction.
                Once extracted, it triggers onLeadCaptured, bypassing the static form. */}
            <ConversationalAIChatbot 
              onLeadCaptured={(data, counselor) => {
                // Backend already saved the lead! We just need to move to Step 2
                // mapping extracted properties to what EligibilityCheck expects
                setUserData({
                   name: data.full_name,
                   phone: data.phone,
                   email: data.email,
                   budget: data.budget,
                   country: data.country_interest,
                   ielts: data.ielts_score,
                   education: data.education_level,
                   assignedCounselor: counselor
                });
                setStep(2);
              }} 
            />
          </div>
        )}

        {/* Step 2: Eligibility Check */}
        {step === 2 && (
          <div className="animate__animated animate__fadeIn">
             <EligibilityCheck userData={userData} onNext={handleNextStep} />
          </div>
        )}

        {/* Step 3: Country Recommendation */}
        {step === 3 && (
          <div className="animate__animated animate__fadeIn">
             <CountryRecommendation lead={leadFormat} />
             <div className="text-center mt-3">
               <button className="btn btn-primary btn-sm rounded-pill px-4" onClick={handleNextStep}>Explore Universities</button>
             </div>
          </div>
        )}

        {/* Step 4: University Recommendation */}
        {step === 4 && (
          <div className="animate__animated animate__fadeIn">
             <UniversityRecommendation lead={leadFormat} />
             <div className="text-center mt-3">
               <button className="btn btn-primary btn-sm rounded-pill px-4" onClick={handleNextStep}>What documents do I need?</button>
             </div>
          </div>
        )}

        {/* Step 5: Document Checklist */}
        {step === 5 && (
          <div className="animate__animated animate__fadeIn">
             <DocumentChecklist />
             <div className="text-center mt-3">
               <button className="btn btn-primary btn-sm rounded-pill px-4" onClick={handleNextStep}>Book an Appointment</button>
             </div>
          </div>
        )}

        {/* Step 6: Appointment Booking */}
        {step === 6 && (
          <div className="animate__animated animate__fadeIn bg-white rounded-3 shadow-sm border p-2">
             <AppointmentBooking onNext={handleNextStep} userData={userData} />
          </div>
        )}

        {/* Step 7: WhatsApp Transfer */}
        {step === 7 && (
          <div className="animate__animated animate__fadeIn bg-white rounded-3 shadow-sm border p-2">
             <WhatsAppTransfer userData={userData} onRestart={handleRestart} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotFullFlow;

import React, { useState } from 'react';
import ChatbotFullFlow from './ChatbotFullFlow';
import './AI.css';

const FloatingAIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* The Chatbot Window */}
      {isOpen && (
        <div 
          className="position-fixed shadow-lg animate__animated animate__fadeInUp" 
          style={{ 
            bottom: '80px', 
            right: '20px', 
            zIndex: 9999, 
            borderRadius: '1rem'
          }}
        >
          <div className="position-relative" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
            <ChatbotFullFlow />
          </div>
          <button 
            className="btn btn-sm btn-danger position-absolute rounded-circle shadow d-flex align-items-center justify-content-center" 
            style={{ top: '-10px', right: '-10px', width: '28px', height: '28px', padding: 0, zIndex: 10000 }}
            onClick={() => setIsOpen(false)}
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
      )}

      {/* The Floating Button */}
      <button 
        className={`btn btn-primary rounded-circle shadow-lg position-fixed d-flex align-items-center justify-content-center ai-pulse-icon ${isOpen ? 'd-none' : ''}`}
        style={{ 
          bottom: '20px', 
          right: '20px', 
          width: '60px', 
          height: '60px', 
          zIndex: 9999,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none'
        }}
        onClick={() => setIsOpen(true)}
      >
        <i className="fa-solid fa-robot fs-3 text-white"></i>
      </button>
    </>
  );
};

export default FloatingAIChatbot;

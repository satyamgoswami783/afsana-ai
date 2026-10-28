import React, { useState, useEffect, useRef } from 'react';
import api from '../../interceptors/axiosInterceptor';
import { Send, User, Bot, Loader2 } from 'lucide-react';

const ConversationalAIChatbot = ({ onLeadCaptured }) => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi there! I am Afsana, your AI guide. How can I help you with your study abroad journey today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatPhase, setChatPhase] = useState('chat');
  const [extractedData, setExtractedData] = useState(null);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [assignedCounselor, setAssignedCounselor] = useState(null);

  // Helper to structure WhatsApp context
  const getWhatsAppLink = (extractedData) => {
    // Basic fallback number
    let phone = '8801700000000'; // Example fallback company number
    let text = 'Hi, I would like to get more information about studying abroad.';
    
    if (assignedCounselor && assignedCounselor.phone) {
      phone = assignedCounselor.phone.replace(/[^0-9]/g, '');
      text = `Hi ${assignedCounselor.name},\nI just completed my profile via the AI Assistant.\nMy Name: ${extractedData.full_name || 'Student'}\nCountry: ${extractedData.country_interest || 'N/A'}\nIELTS: ${extractedData.ielts_score || 'N/A'}\nBudget: $${extractedData.budget || 'N/A'}\nPlease guide me further.`;
    }
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };
  const [sessionToken] = useState(() => 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now());
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await api.post('/aichat/conversational-ask', {
        sessionToken,
        message: userMessage
      });

      if (response.data && response.data.success) {
        setMessages(prev => [...prev, { role: 'ai', text: response.data.reply }]);
        
        if (response.data.isLeadCreated && !eligibilityChecked) {
          setChatPhase('eligibility');
          setEligibilityChecked(true);
          if (response.data.assignedCounselor) {
              setAssignedCounselor(response.data.assignedCounselor);
          }
        }
        
        if (response.data.extractedData) {
           setExtractedData(response.data.extractedData);
        }

        // If the backend indicates the lead is successfully captured and scored!
        if (response.data.isLeadCreated && response.data.extractedData) {
          // Add a small delay so user can read the final confirmation message before transitioning
          setTimeout(() => {
            if (onLeadCaptured) {
               onLeadCaptured(response.data.extractedData, response.data.assignedCounselor);
            }
          }, 2000);
        }
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered a glitch. Could you repeat that?' }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'ai', text: 'I am offline right now. Please try again later.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="d-flex flex-column w-100 bg-white rounded shadow-sm overflow-hidden border" style={{ height: '400px' }}>
      
      {/* Chat Messages Area */}
      <div className="flex-grow-1 p-3 overflow-auto" style={{ backgroundColor: '#f8f9fa' }}>
        {messages.map((msg, index) => (
          <div key={index} className={`d-flex mb-3 ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
            
            {msg.role === 'ai' && (
              <div className="rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0" style={{ width: '32px', height: '32px', backgroundColor: '#e0e7ff' }}>
                <Bot size={16} color="#4f46e5" />
              </div>
            )}
            
            <div 
              className={`px-3 py-2 ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded' 
                  : 'bg-white text-dark border rounded shadow-sm'
              }`}
              style={{ 
                maxWidth: '80%', 
                fontSize: '0.9rem',
                borderBottomRightRadius: msg.role === 'user' ? '0' : undefined,
                borderBottomLeftRadius: msg.role === 'ai' ? '0' : undefined
              }}
            >
              {msg.text}
            </div>

            {msg.role === 'user' && (
              <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center ms-2 flex-shrink-0" style={{ width: '32px', height: '32px' }}>
                <User size={16} color="white" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="d-flex justify-content-start mb-3">
             <div className="rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0" style={{ width: '32px', height: '32px', backgroundColor: '#e0e7ff' }}>
                <Bot size={16} color="#4f46e5" />
              </div>
              <div className="bg-white border rounded px-3 py-2 d-flex align-items-center shadow-sm" style={{ borderBottomLeftRadius: '0' }}>
                 <Loader2 size={14} className="me-2" style={{ animation: 'spin 1s linear infinite', color: '#6c757d' }} />
                 <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>AI is typing...</span>
              </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-2 bg-white border-top">
        {chatPhase === 'eligibility' && extractedData ? (
          <div className="text-center">
            <a 
              href={getWhatsAppLink(extractedData)}
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-success rounded-pill px-4 py-2 w-100 fw-bold d-flex align-items-center justify-content-center"
            >
              Connect with Counselor on WhatsApp
            </a>
          </div>
        ) : (
          <form onSubmit={handleSend} className="d-flex align-items-center m-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="form-control rounded-pill me-2"
              style={{ fontSize: '0.9rem' }}
              disabled={isTyping}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isTyping}
              className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center p-0"
              style={{ width: '38px', height: '38px' }}
            >
              <Send size={16} />
            </button>
          </form>
        )}
      </div>
      
    </div>
  );
};

export default ConversationalAIChatbot;

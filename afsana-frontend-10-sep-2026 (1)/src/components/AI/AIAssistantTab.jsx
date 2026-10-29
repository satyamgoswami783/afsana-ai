import React, { useState, useRef, useEffect } from 'react';
import './AI.css';
import BASE_URL from '../../Config';

const AIAssistantTab = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am your AI Counselor Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(`${BASE_URL}aichat/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, conversationHistory: messages })
      });
      const data = await response.json();
      setIsTyping(false);
      if (data.success) {
        setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: 'Error connecting to AI server.' }]);
      }
    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'ai', content: 'Network error. Please try again later.' }]);
    }
  };

  return (
    <div
      className="ai-assistant-container shadow-sm rounded-4 p-4 d-flex flex-column"
      style={{
        height: '70vh',
        background: 'var(--card-bg, #ffffff)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
      }}
    >
      <h5 className="border-bottom pb-3 mb-3 d-flex align-items-center gap-2" style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }}>
        <span style={{ color: '#10b981' }}>🤖</span> AI Counselor Assistant
      </h5>
      
      <div className="flex-grow-1 overflow-auto mb-3 px-2">
        {messages.map((msg, index) => (
          <div key={index} className={`d-flex mb-3 ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
            <div
              className={`p-3 rounded-3 shadow-sm ${msg.role === 'user' ? 'text-white' : 'bg-light text-dark'}`}
              style={{
                maxWidth: '75%',
                ...(msg.role === 'user'
                  ? {
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                    }
                  : {
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                    }),
              }}
            >
              <strong className="d-block mb-1" style={{ fontSize: '0.82rem', opacity: 0.85, color: msg.role === 'user' ? '#fbbf24' : '#10b981' }}>
                {msg.role === 'user' ? 'You' : 'AI Assistant'}
              </strong>
              <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="d-flex justify-content-start mb-3">
            <div className="p-3 rounded-3 bg-light text-muted" style={{ border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <em>AI is typing...</em>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <div className="input-group gap-2">
        <input 
          type="text" 
          className="form-control rounded-3" 
          placeholder="Ask me about visa requirements, universities, or draft an email..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}
        />
        <button
          className="btn px-4 rounded-3 text-white fw-semibold"
          onClick={handleSend}
          disabled={isTyping || !input.trim()}
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            border: 'none',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
          }}
        >
          <i className="fa-solid fa-paper-plane me-1"></i> Send
        </button>
      </div>
    </div>
  );
};

export default AIAssistantTab;

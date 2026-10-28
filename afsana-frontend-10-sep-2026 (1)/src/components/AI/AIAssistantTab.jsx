import React, { useState, useRef, useEffect } from 'react';
import './AI.css'; // Let's use a shared CSS file
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
    <div className="ai-assistant-container shadow-sm border rounded bg-white p-3 d-flex flex-column" style={{ height: '70vh' }}>
      <h5 className="border-bottom pb-2 mb-3">🤖 AI Counselor Assistant</h5>
      
      <div className="flex-grow-1 overflow-auto mb-3 px-2">
        {messages.map((msg, index) => (
          <div key={index} className={`d-flex mb-3 ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
            <div className={`p-3 rounded-3 shadow-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-light text-dark'}`} style={{ maxWidth: '75%' }}>
              <strong className="d-block mb-1" style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                {msg.role === 'user' ? 'You' : 'AI Assistant'}
              </strong>
              <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="d-flex justify-content-start mb-3">
            <div className="p-3 rounded-3 bg-light text-muted">
              <em>AI is typing...</em>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <div className="input-group">
        <input 
          type="text" 
          className="form-control" 
          placeholder="Ask me about visa requirements, universities, or draft an email..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="btn btn-primary px-4" onClick={handleSend} disabled={isTyping || !input.trim()}>
          <i className="fa-solid fa-paper-plane"></i> Send
        </button>
      </div>
    </div>
  );
};

export default AIAssistantTab;

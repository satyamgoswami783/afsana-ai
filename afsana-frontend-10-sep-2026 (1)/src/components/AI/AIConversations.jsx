import React, { useState, useEffect } from 'react';
import BASE_URL from '../../Config';

const AIConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  // In a real app, you would fetch these from a backend endpoint
  // like GET /api/ai/conversations
  useEffect(() => {
    // For now, we simulate fetching the AI chat history
    setTimeout(() => {
      setConversations([
        {
          id: 1,
          lead_name: "Rahul Sharma",
          phone: "+919876543210",
          platform: "whatsapp",
          student_msg: "Hi, I want to study in Canada. Budget is 20 Lakhs.",
          ai_reply: "Hello Rahul! Canada is a great choice. With a budget of 20 Lakhs, we can look at several good colleges. Have you taken your IELTS yet?",
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          lead_name: "Priya Singh",
          phone: "+919876543211",
          platform: "facebook",
          student_msg: "Details please",
          ai_reply: "Hi Priya! Could you please let us know which country or course you are interested in so we can provide the best details?",
          timestamp: new Date().toISOString()
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getPlatformIcon = (platform) => {
    switch(platform) {
      case 'whatsapp': return <i className="fa-brands fa-whatsapp text-success fs-4"></i>;
      case 'facebook': return <i className="fa-brands fa-facebook-messenger text-primary fs-4"></i>;
      default: return <i className="fa-solid fa-globe text-secondary fs-4"></i>;
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading AI Conversations...</div>;
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">
          <i className="fa-solid fa-comments-dollar text-primary me-2"></i> 
          AI Chat Conversations
        </h3>
        <span className="badge bg-primary fs-6">Live Monitoring</span>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">Platform</th>
                  <th className="px-4 py-3">Student & Phone</th>
                  <th className="px-4 py-3" style={{ width: '30%' }}>Student Message</th>
                  <th className="px-4 py-3" style={{ width: '40%' }}>AI Reply</th>
                  <th className="px-4 py-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {conversations.map((chat) => (
                  <tr key={chat.id}>
                    <td className="px-4 text-center">
                      {getPlatformIcon(chat.platform)}
                    </td>
                    <td className="px-4">
                      <strong>{chat.lead_name}</strong>
                      <br />
                      <small className="text-muted">{chat.phone}</small>
                    </td>
                    <td className="px-4">
                      <div className="p-2 bg-light rounded text-dark" style={{ borderLeft: '4px solid #dee2e6' }}>
                        {chat.student_msg}
                      </div>
                    </td>
                    <td className="px-4">
                      <div className="p-2 rounded text-dark" style={{ backgroundColor: '#e8f4fd', borderLeft: '4px solid #0d6efd' }}>
                        {chat.ai_reply}
                      </div>
                    </td>
                    <td className="px-4 text-muted small">
                      {new Date(chat.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {conversations.length === 0 && (
              <div className="text-center p-5 text-muted">
                No AI conversations found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIConversations;

import React, { useState, useEffect } from 'react';
import BASE_URL from '../../Config';

const AISettings = () => {
  const [settings, setSettings] = useState({
    whatsapp_number: '',
    waba_id: '',
    phone_number_id: '',
    company_name: '',
    chatbot_greeting: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${BASE_URL}public/settings`);
      const data = await response.json();
      if (data.success) {
        setSettings({
          whatsapp_number: data.settings.whatsapp_number || '',
          waba_id: data.settings.waba_id || '',
          phone_number_id: data.settings.phone_number_id || '',
          company_name: data.settings.company_name || '',
          chatbot_greeting: data.settings.chatbot_greeting || '',
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      // NOTE: Using a hypothetical PUT endpoint for settings update. 
      // You may need to adjust the URL according to the exact backend implementation.
      const response = await fetch(`${BASE_URL}ai/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      if (data.success) {
        setMessage('Settings saved successfully!');
      } else {
        setMessage(data.message || 'Failed to save settings.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Network error. Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading AI Settings...</div>;

  return (
    <div className="container mt-4">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white border-bottom py-3">
          <h4 className="mb-0"><i className="fa-solid fa-robot text-primary me-2"></i> Global AI Settings</h4>
        </div>
        <div className="card-body p-4">
          {message && (
            <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'}`} role="alert">
              {message}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label fw-bold">Company Name</label>
              <input 
                type="text" 
                className="form-control" 
                name="company_name" 
                value={settings.company_name} 
                onChange={handleChange} 
                required 
              />
              <div className="form-text">This name will be displayed in the Chatbot and AI templates.</div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">Global WhatsApp Number</label>
              <input 
                type="text" 
                className="form-control" 
                name="whatsapp_number" 
                value={settings.whatsapp_number} 
                onChange={handleChange} 
                required 
              />
              <div className="form-text">Used by the Chatbot for transferring leads to human agents (format: country code without +).</div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">Meta WABA ID (WhatsApp Business Account ID)</label>
              <input 
                type="text" 
                className="form-control" 
                name="waba_id" 
                value={settings.waba_id} 
                onChange={handleChange} 
              />
              <div className="form-text">Non-sensitive ID. The Access Token should be configured securely in the server .env file.</div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">Meta Phone Number ID</label>
              <input 
                type="text" 
                className="form-control" 
                name="phone_number_id" 
                value={settings.phone_number_id} 
                onChange={handleChange} 
              />
              <div className="form-text">Non-sensitive Phone ID provided by Meta Developer Portal.</div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">Chatbot Default Greeting</label>
              <textarea 
                className="form-control" 
                name="chatbot_greeting" 
                rows="3" 
                value={settings.chatbot_greeting} 
                onChange={handleChange} 
                required 
              />
              <div className="form-text">The initial message sent when a user opens the chat.</div>
            </div>

            <button type="submit" className="btn btn-primary px-4" disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AISettings;

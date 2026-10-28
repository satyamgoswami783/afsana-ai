import React, { useState, useRef, useEffect } from 'react';
import './chatBotMain.css';
import BASE_URL from '../../Config';

// ─────────────────────────────────────────────────────────────
// STEP CONSTANTS
// ─────────────────────────────────────────────────────────────
const STEPS = {
  GREETING: 0,
  NAME: 1,
  PHONE: 2,
  EMAIL: 3,
  EDUCATION: 4,
  IELTS: 5,
  BUDGET: 6,
  COUNTRY: 7,
  AI_PROCESSING: 8,
  ELIGIBILITY_RESULT: 9,
  COUNTRY_RESULT: 10,
  UNIVERSITY_RESULT: 11,
  DOCUMENT_CHECKLIST: 12,
  LEAD_SCORE: 13,
  APPOINTMENT: 14,
  WHATSAPP_TRANSFER: 15,
  DONE: 16,
};

const EDUCATION_OPTIONS = ['SSC / O-Level', 'HSC / A-Level', 'Diploma', 'Bachelor\'s', 'Master\'s', 'PhD'];
const BUDGET_OPTIONS = ['Under $5,000/yr', '$5,000 – $10,000/yr', '$10,000 – $20,000/yr', '$20,000 – $30,000/yr', '$30,000+/yr'];
const COUNTRY_OPTIONS = ['Australia', 'UK', 'Canada', 'USA', 'Germany', 'Malaysia', 'Hungary', 'Other'];
const APPOINTMENT_OPTIONS = ['📅 Book Office Visit', '💻 Online Meeting', '📞 Phone Call', '💬 WhatsApp Chat'];

// ─────────────────────────────────────────────────────────────
// CHATBOT COMPONENT
// ─────────────────────────────────────────────────────────────
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatStep, setChatStep] = useState(STEPS.GREETING);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [leadCreated, setLeadCreated] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('8801712345678');
  const [companyName, setCompanyName] = useState('Afsana Consultancy');
  const [studentProfile, setStudentProfile] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    study_level: '',
    ielts_score: '',
    budget: '',
    preferred_country: '',
    source: 'AI Chatbot',
    branch: 'Dhaka',
    inquiry_type: 'student_visa',
  });
  const chatBodyRef = useRef(null);

  // ── Fetch dynamic settings on mount ──────────────────────────
  useEffect(() => {
    fetch(`${BASE_URL}public/settings`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          if (data.settings.whatsapp_number) setWhatsappNumber(data.settings.whatsapp_number);
          if (data.settings.company_name) setCompanyName(data.settings.company_name);
        }
      })
      .catch(() => {}); // silently fail — defaults are set above
  }, []);

  // ── Auto-scroll to bottom ────────────────────────────────────
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // ── Open chat: start greeting ────────────────────────────────
  const openChat = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      setTimeout(() => {
        botSay(`👋 Assalamu Alaikum! Welcome to **${companyName}**.\n\nI am your AI Study Abroad Assistant. I can help you:\n✅ Find the best country & university\n✅ Check your eligibility\n✅ Get a document checklist\n✅ Book an appointment\n\nLet's get started! What is your **full name**?`);
        setChatStep(STEPS.NAME);
      }, 300);
    }
  };

  // ── Add bot message with typing delay ────────────────────────
  const botSay = (text, delay = 0) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'bot', text }]);
      setConversationHistory(prev => [...prev, { role: 'assistant', content: text }]);
    }, delay || 900);
  };

  // ── Add user message ─────────────────────────────────────────
  const userSay = (text) => {
    setMessages(prev => [...prev, { role: 'user', text }]);
    setConversationHistory(prev => [...prev, { role: 'user', content: text }]);
  };

  // ── Process user text input ──────────────────────────────────
  const handleSend = () => {
    const val = input.trim();
    if (!val) return;
    setInput('');
    processInput(val);
  };

  // ── Process quick-reply button clicks ────────────────────────
  const handleQuickReply = (val) => {
    userSay(val);
    processStepData(val);
  };

  // ── Route input to correct step ──────────────────────────────
  const processInput = (val) => {
    userSay(val);
    processStepData(val);
  };

  const processStepData = (val) => {
    switch (chatStep) {
      case STEPS.NAME:
        setStudentProfile(p => ({ ...p, full_name: val }));
        setChatStep(STEPS.PHONE);
        botSay(`Nice to meet you, **${val}**! 📱 Please share your **WhatsApp/phone number** so we can reach you.`);
        break;

      case STEPS.PHONE:
        if (!/^[0-9+\-\s]{7,15}$/.test(val.replace(/\s/g, ''))) {
          botSay('⚠️ Please enter a valid phone number (e.g., 01712345678).', 400);
          return;
        }
        setStudentProfile(p => ({ ...p, phone_number: val }));
        setChatStep(STEPS.EMAIL);
        botSay('Great! ✉️ What is your **email address**?');
        break;

      case STEPS.EMAIL:
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          botSay('⚠️ Please enter a valid email address (e.g., you@gmail.com).', 400);
          return;
        }
        setStudentProfile(p => ({ ...p, email: val }));
        setChatStep(STEPS.EDUCATION);
        botSay('📚 What is your **current education level**?');
        break;

      case STEPS.EDUCATION:
        setStudentProfile(p => ({ ...p, study_level: val }));
        setChatStep(STEPS.IELTS);
        botSay('🗣️ Do you have an **IELTS / PTE / TOEFL** score? Please share your overall band score (e.g., **6.5**), or type **"No Test Yet"** if you haven\'t taken it.');
        break;

      case STEPS.IELTS:
        setStudentProfile(p => ({ ...p, ielts_score: val }));
        setChatStep(STEPS.BUDGET);
        botSay('💰 What is your **annual study budget** (including tuition + living)?');
        break;

      case STEPS.BUDGET:
        setStudentProfile(p => ({ ...p, budget: val }));
        setChatStep(STEPS.COUNTRY);
        botSay('🌍 Which **country** are you most interested in? (You can also type your preference)');
        break;

      case STEPS.COUNTRY:
        setStudentProfile(p => ({ ...p, preferred_country: val }));
        setChatStep(STEPS.AI_PROCESSING);
        botSay(`🔍 Perfect! Let me analyze your profile and find the **best options** for you...\n\nThis will take a few seconds.`, 400);
        setTimeout(() => runAIAnalysis({ ...studentProfile, preferred_country: val }), 1800);
        break;

      case STEPS.APPOINTMENT:
        handleAppointmentChoice(val);
        break;

      default:
        if (chatStep > STEPS.DOCUMENT_CHECKLIST) {
          botSay('Thank you! Is there anything else I can help you with? You can also call us or visit our office. 😊', 500);
        }
    }
  };

  // ── Full AI Analysis Pipeline ────────────────────────────────
  const runAIAnalysis = async (profile) => {
    try {
      // Step 9: Eligibility Check via AI chat
      setIsTyping(true);
      const eligibilityPrompt = `Student Profile:
Name: ${profile.full_name}
Education: ${profile.study_level}
IELTS/Test Score: ${profile.ielts_score}
Budget: ${profile.budget}
Preferred Country: ${profile.preferred_country}

Please check this student's eligibility for studying abroad and give a brief, friendly assessment in 2-3 sentences. Mention their strengths and any potential challenges.`;

      const eligRes = await fetch(`${BASE_URL}aichat/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: eligibilityPrompt,
          conversationHistory: conversationHistory.slice(-6),
        }),
      });
      const eligData = await eligRes.json();
      setIsTyping(false);

      if (eligData.success) {
        setMessages(prev => [...prev, { role: 'bot', text: `📊 **Eligibility Assessment:**\n\n${eligData.reply}` }]);
      }

      // Step 10: Country Recommendation
      setChatStep(STEPS.COUNTRY_RESULT);
      setIsTyping(true);
      await new Promise(r => setTimeout(r, 800));

      const countryRes = await fetch(`${BASE_URL}ai/recommend/countries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            education_level: profile.study_level,
            ielts_overall: profile.ielts_score,
            budget: profile.budget,
            preferred_country: profile.preferred_country,
            name: profile.full_name,
          },
          lead_id: null,
        }),
      });
      const countryData = await countryRes.json();
      setIsTyping(false);

      if (countryData.success && countryData.recommendations) {
        const countryText = countryData.recommendations
          .slice(0, 3)
          .map((c, i) => `${i + 1}. 🌏 **${c.country || c.name}** — ${c.reason || 'Good match for your profile'}`)
          .join('\n');
        setMessages(prev => [...prev, { role: 'bot', text: `🏆 **Top Country Recommendations:**\n\n${countryText}` }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', text: `🌍 Based on your profile, **${profile.preferred_country}** is a strong match. Our counselors can also suggest alternatives during your consultation.` }]);
      }

      // Step 11: University Recommendation
      setChatStep(STEPS.UNIVERSITY_RESULT);
      setIsTyping(true);
      await new Promise(r => setTimeout(r, 800));

      const uniPrompt = `Based on the student profile above, suggest 3 suitable universities in ${profile.preferred_country} for ${profile.study_level} level. Keep it brief and friendly.`;
      const uniRes = await fetch(`${BASE_URL}aichat/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: uniPrompt, conversationHistory: [] }),
      });
      const uniData = await uniRes.json();
      setIsTyping(false);

      if (uniData.success) {
        setMessages(prev => [...prev, { role: 'bot', text: `🎓 **Recommended Universities:**\n\n${uniData.reply}` }]);
      }

      // Step 12: Document Checklist
      setChatStep(STEPS.DOCUMENT_CHECKLIST);
      setIsTyping(true);
      await new Promise(r => setTimeout(r, 700));
      setIsTyping(false);

      const docChecklist = generateDocumentChecklist(profile.study_level, profile.preferred_country);
      setMessages(prev => [...prev, { role: 'bot', text: `📋 **Your Personal Document Checklist:**\n\n${docChecklist}\n\n✅ Our counselors can review these documents and guide you step by step.` }]);

      // Step 13: Lead Score
      setChatStep(STEPS.LEAD_SCORE);
      setIsTyping(true);
      await new Promise(r => setTimeout(r, 800));

      const scorePrompt = `Based on this student profile:\nName: ${profile.full_name}\nEducation: ${profile.study_level}\nIELTS: ${profile.ielts_score}\nBudget: ${profile.budget}\nPreferred Country: ${profile.preferred_country}\n\nGenerate a 'Lead Score' out of 100 indicating their chances of securing admission and visa. Briefly explain the score in 2 sentences. Format strictly as:\n📈 **AI Lead Score:** [Score]/100\n\n[Explanation]`;
      const scoreRes = await fetch(`${BASE_URL}aichat/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: scorePrompt, conversationHistory: [] }),
      });
      const scoreData = await scoreRes.json();
      setIsTyping(false);

      if (scoreData.success) {
        setMessages(prev => [...prev, { role: 'bot', text: scoreData.reply }]);
      }

      // Step 14+15: CRM Lead Creation (silent background)
      if (!leadCreated) {
        createCRMLead(profile);
        setLeadCreated(true);
      }

      // Step 16: Appointment
      await new Promise(r => setTimeout(r, 1200));
      setChatStep(STEPS.APPOINTMENT);
      setMessages(prev => [...prev, { role: 'bot', text: `🎉 Your profile analysis is complete!\n\nWould you like to **book a consultation** with one of our expert counselors to discuss your options in detail?` }]);

    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'bot',
        text: `I've collected your profile! 📝 Our team will review it and contact you within 24 hours at ${profile.phone_number}.\n\nYou can also reach us directly via WhatsApp.`
      }]);
      if (!leadCreated) { createCRMLead(profile); setLeadCreated(true); }
      setChatStep(STEPS.WHATSAPP_TRANSFER);
      showWhatsAppButton();
    }
  };

  // ── Generate Document Checklist ──────────────────────────────
  const generateDocumentChecklist = (studyLevel, country) => {
    const base = ['☐ Valid Passport (min. 18 months validity)', '☐ Academic Certificates & Transcripts', '☐ IELTS/PTE/TOEFL Score Report', '☐ Bank Statement (last 6 months)', '☐ Sponsor\'s Financial Documents'];
    const sop = '☐ Statement of Purpose (SOP)';
    const cv = '☐ Updated CV/Resume';
    const rec = '☐ 2 Reference / Recommendation Letters';
    const birth = '☐ Birth Certificate';
    const med = '☐ Medical Certificate';
    const police = '☐ Police Clearance Certificate';

    if (['Master\'s', 'PhD'].includes(studyLevel)) {
      return [...base, sop, cv, rec].join('\n');
    }
    if (country === 'Australia' || country === 'Canada' || country === 'UK') {
      return [...base, sop, police, med].join('\n');
    }
    return [...base, sop, birth].join('\n');
  };

  // ── Silent CRM Lead Creation ─────────────────────────────────
  const createCRMLead = async (profile) => {
    try {
      await fetch(`${BASE_URL}inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: profile.full_name,
          phone_number: profile.phone_number,
          email: profile.email,
          study_level: profile.study_level,
          country: profile.preferred_country,
          budget: profile.budget,
          source: 'AI Chatbot',
          branch: 'Dhaka',
          inquiry_type: 'student_visa',
          additionalNotes: `IELTS/Test: ${profile.ielts_score} | Budget: ${profile.budget} | Via AI Chatbot`,
          education_background: JSON.stringify([]),
          english_proficiency: JSON.stringify([]),
          preferred_countries: JSON.stringify([profile.preferred_country]),
        }),
      });
      console.log('[AI Chatbot] Lead created in CRM silently.');
    } catch (err) {
      console.error('[AI Chatbot] CRM lead creation failed:', err);
    }
  };

  // ── Handle Appointment Choice ────────────────────────────────
  const handleAppointmentChoice = (choice) => {
    if (choice.includes('WhatsApp')) {
      setChatStep(STEPS.WHATSAPP_TRANSFER);
      botSay(`Great! Click the button below to connect with our counselor on WhatsApp. 💬`, 500);
      setTimeout(() => showWhatsAppButton(), 1500);
    } else {
      setChatStep(STEPS.DONE);
      botSay(`✅ Thank you! Our team will contact you at **${studentProfile.phone_number}** to confirm your appointment.\n\nYou can also reach us on WhatsApp anytime. 🙏`, 500);
      setTimeout(() => showWhatsAppButton(), 2000);
    }
  };

  const showWhatsAppButton = () => {
    setMessages(prev => [...prev, {
      role: 'whatsapp',
      text: whatsappNumber,
      name: studentProfile.full_name,
      country: studentProfile.preferred_country,
    }]);
  };

  // ── Render message text with basic markdown ──────────────────
  const renderText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const formatted = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} style={{ margin: '2px 0' }} />;
    });
  };

  // ── Get quick-reply options for current step ─────────────────
  const getQuickReplies = () => {
    switch (chatStep) {
      case STEPS.EDUCATION: return EDUCATION_OPTIONS;
      case STEPS.BUDGET: return BUDGET_OPTIONS;
      case STEPS.COUNTRY: return COUNTRY_OPTIONS;
      case STEPS.APPOINTMENT: return APPOINTMENT_OPTIONS;
      default: return [];
    }
  };

  const quickReplies = getQuickReplies();
  const showInput = ![STEPS.GREETING, STEPS.AI_PROCESSING, STEPS.DONE].includes(chatStep);

  return (
    <>
      {/* ── Chat Toggle Button ── */}
      <button className="cb-toggle" onClick={isOpen ? () => setIsOpen(false) : openChat} aria-label="Open AI Chat">
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.526 3.66 1.438 5.168L2.05 21.95l4.782-1.388A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.073-1.11l-.29-.173-3.007.872.889-2.924-.19-.3A7.96 7.96 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/><circle cx="8.5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="15.5" cy="12" r="1.5"/></svg>
        )}
        {!isOpen && <span className="cb-toggle-badge">AI</span>}
      </button>

      {/* ── Chat Window ── */}
      {isOpen && (
        <div className="cb-window">
          {/* Header */}
          <div className="cb-header">
            <div className="cb-header-avatar">
              <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.526 3.66 1.438 5.168L2.05 21.95l4.782-1.388A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
            </div>
            <div className="cb-header-info">
              <span className="cb-header-name">AI Study Advisor</span>
              <span className="cb-header-status">🟢 Online • Powered by AI</span>
            </div>
            <button className="cb-header-close" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          {/* Progress Bar */}
          <div className="cb-progress">
            <div
              className="cb-progress-fill"
              style={{ width: `${Math.min(100, (chatStep / 14) * 100)}%` }}
            />
          </div>

          {/* Messages */}
          <div className="cb-body" ref={chatBodyRef}>
            {messages.map((msg, idx) => {
              if (msg.role === 'whatsapp') {
                const waText = encodeURIComponent(`Hi! I am ${msg.name}. I am interested in studying in ${msg.country}. Please guide me.`);
                return (
                  <div key={idx} className="cb-msg-row cb-bot-row">
                    <div className="cb-msg cb-bot-msg">
                      <a
                        href={`https://wa.me/${msg.text}?text=${waText}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cb-wa-btn"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.526 3.66 1.438 5.168L2.05 21.95l4.782-1.388A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
                        Chat on WhatsApp
                      </a>
                    </div>
                  </div>
                );
              }
              return (
                <div key={idx} className={`cb-msg-row ${msg.role === 'user' ? 'cb-user-row' : 'cb-bot-row'}`}>
                  <div className={`cb-msg ${msg.role === 'user' ? 'cb-user-msg' : 'cb-bot-msg'}`}>
                    {renderText(msg.text)}
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="cb-msg-row cb-bot-row">
                <div className="cb-msg cb-bot-msg cb-typing">
                  <span/><span/><span/>
                </div>
              </div>
            )}
          </div>

          {/* Quick Replies */}
          {quickReplies.length > 0 && (
            <div className="cb-quick-replies">
              {quickReplies.map((q, i) => (
                <button key={i} className="cb-qr-btn" onClick={() => handleQuickReply(q)}>{q}</button>
              ))}
            </div>
          )}

          {/* Input Area */}
          {showInput && (
            <div className="cb-input-area">
              <input
                type="text"
                className="cb-input"
                placeholder="Type your message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              />
              <button className="cb-send-btn" onClick={handleSend} aria-label="Send">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="cb-footer">Powered by <strong>Afsana AI</strong> • Responses may vary</div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
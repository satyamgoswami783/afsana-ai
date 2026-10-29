import React from "react";
import { Container, Typography, Box } from "@mui/material";

const PrivacyPolicy = () => {
  return (
    <div
      style={{
        backgroundColor: "#060a08",
        backgroundImage:
          "linear-gradient(to bottom, rgba(6, 10, 8, 0.86) 0%, rgba(6, 10, 8, 0.94) 100%), url('/img/landing_hero_campus.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        paddingTop: "80px",
        paddingBottom: "80px",
        color: "#f8fafc",
      }}
    >
      <Container maxWidth="md" sx={{ py: 5, backgroundColor: "rgba(13, 21, 17, 0.92)", backdropFilter: "blur(16px)", borderRadius: 4, border: '1px solid rgba(16, 185, 129, 0.25)', boxShadow: '0 20px 50px rgba(0,0,0,0.45)', my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, textAlign: "center", background: 'linear-gradient(90deg, #34d399, #10b981, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 5 }}>
          Privacy Policy
        </Typography>

        <Box sx={{ mt: 4, px: { xs: 2, md: 4 } }}>
          <Typography variant="h5" gutterBottom sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: "#38bdf8", mb: 2 }}>
            1. Introduction
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: "#cbd5e1", lineHeight: 1.8, mb: 4 }}>
            Welcome to Study First Info. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and share your information when you visit our website, use our software, or interact with our WhatsApp AI Assistant.
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: "#38bdf8", mb: 2 }}>
            2. Information We Collect
          </Typography>
          <Typography variant="body1" component="div" sx={{ color: "#cbd5e1", lineHeight: 1.8, mb: 4 }}>
            We may collect personal identification information from Users in a variety of ways, including, but not limited to, when Users visit our site, fill out a form, or interact with our WhatsApp AI chatbot.
            <ul style={{ marginTop: '10px' }}>
              <li style={{ marginBottom: '8px' }}><strong style={{ color: '#fff' }}>Personal Data:</strong> Name, email address, phone number, and academic background provided during inquiries.</li>
              <li><strong style={{ color: '#fff' }}>WhatsApp Interactions:</strong> Messages, files, and queries you send to our WhatsApp AI Assistant for lead generation and inquiry processing.</li>
            </ul>
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: "#38bdf8", mb: 2 }}>
            3. How We Use Your Information (Including AI & WhatsApp)
          </Typography>
          <Typography variant="body1" component="div" sx={{ color: "#cbd5e1", lineHeight: 1.8, mb: 4 }}>
            The information we collect is used in the following ways:
            <ul style={{ marginTop: '10px' }}>
              <li style={{ marginBottom: '8px' }}>To provide personalized responses via our WhatsApp AI Assistant.</li>
              <li style={{ marginBottom: '8px' }}>To process inquiries, generate leads, and schedule counseling sessions.</li>
              <li style={{ marginBottom: '8px' }}>To improve customer service and respond more effectively to your requests.</li>
              <li>To send periodic emails or WhatsApp messages regarding your application status or promotional offers.</li>
            </ul>
            <em style={{ color: '#94a3b8' }}>Note: Your conversations with our AI are securely stored to ensure the quality of our service and to track your inquiry progress.</em>
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: "#38bdf8", mb: 2 }}>
            4. How We Protect Your Information
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: "#cbd5e1", lineHeight: 1.8, mb: 4 }}>
            We adopt appropriate data collection, storage, and processing practices and security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information, username, password, transaction information, and data stored on our Site and CRM systems.
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: "#38bdf8", mb: 2 }}>
            5. Sharing Your Personal Information
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: "#cbd5e1", lineHeight: 1.8, mb: 4 }}>
            We do not sell, trade, or rent Users' personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information regarding visitors and users with our business partners, trusted affiliates, and advertisers for the purposes outlined above.
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: "#38bdf8", mb: 2 }}>
            6. Changes to This Privacy Policy
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: "#cbd5e1", lineHeight: 1.8, mb: 4 }}>
            Study First Info has the discretion to update this privacy policy at any time. We encourage Users to frequently check this page for any changes to stay informed about how we are helping to protect the personal information we collect.
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: "#38bdf8", mb: 2 }}>
            7. Contact Us
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: "#cbd5e1", lineHeight: 1.8, mb: 4 }}>
            If you have any questions about this Privacy Policy, the practices of this site, or your dealings with this site or our WhatsApp AI, please contact us at our official email or via our WhatsApp support number.
          </Typography>
        </Box>
      </Container>
    </div>
  );
};

export default PrivacyPolicy;

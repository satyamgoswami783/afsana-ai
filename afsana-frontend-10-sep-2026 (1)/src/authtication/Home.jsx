import React, { useState, useEffect, useContext } from "react";
import {
  Navbar,
  Nav,
  Button,
  Container,
  Row,
  Col,
  Card,
  Modal,
  Form,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import InquiryForm from "./InquiryForm";
import "./Home.css";
import bmu from "../assets/bmulogo.webp";
import hungury from "../assets/hungary.webp";
import gyor from "../assets/gyor.webp";
import devre from "../assets/debre.webp";
import wek from "../assets/wekerle.webp";
import PaymentFormModal from "./PaymentFormModal";
import UniversityCards from "../components/PaymentInvoiceManagement/UniversityCards";

import ReCAPTCHA from "react-google-recaptcha";

const App = () => {
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState(null);

  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  // Import ThemeContext
  // Ensure ThemeContext is imported from '../../context/ThemeContext'


  // Scroll listener to keep navbar fixed and styled smoothly on scroll
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2) Handlers to open/close the modal
  const handleOpenInquiry = () => setShowInquiryModal(true);
  const handleCloseInquiry = () => setShowInquiryModal(false);

  const handleOpenPaymentModal = () => setShowPaymentModal(true);
  const handleClosePaymentModal = () => setShowPaymentModal(false);

  const universities = [
    {
      img: bmu,
      name: "Budapest Metropolitan University",
      location: "Nagy-téteni út 162-164, Budapest, Hungary, 1222",
      popularPrograms: [
        "Tourism and Catering",
        "Animation",
        "Graphic Design",
        "Photography",
      ],
      keyHighlights: [
        "Internationally recognized degrees",
        "Affordable tuition & living costs",
      ],
      contact: "+36 1 273 3090 (International Office)",
      email: "info@metropolitan.hu",
    },
    {
      img: gyor,
      name: "Széchenyi István University",
      location: "Egyetem tér 1, 9026 Győr, Hungary",
      popularPrograms: [
        "Vehicle Engineering",
        "Civil Engineering",
        "Supply Chain Management",
        "Computer Science Engineering",
      ],
      keyHighlights: [
        "Strong reputation in IT fields",
        "Close collaboration with Audi Hungary",
      ],
      contact: "+36 96 503 418 (International Office)",
      email: "international@sze.hu",
    },
    {
      img: devre,
      name: "University of Debrecen",
      location: "Egyetem tér 1, 4032 Debrecen, Hungary",
      popularPrograms: [
        "Medicine",
        "Pharmacy",
        "Dentistry",
        "Computer Science Engineering",
      ],
      keyHighlights: [
        "Top Ranked University in Hungary with strong global reputation",
        "Over 6,000 international students from 120+ countries",
      ],
      contact: "+36 52 258 058 (International Office)",
      email: "admissions@stanford.edu",
    },
    {
      img: hungury,
      name: "Eötvös Loránd University",
      location: "Egyetem tér 1-3, 1053 Budapest, Hungary",
      popularPrograms: [
        "Computer Science",
        "Psychology",
        "Biology",
        "Mathematics",
      ],
      keyHighlights: [
        "One of the Oldest and Most Prestigious Universities in Hungary",
        "Offers a wide range of English-taught programs",
      ],
      contact: "+36 1 411 6500",
      email: "international@elte.hu",
    },
    {
      img: wek,
      name: "Wekerle Sándor Business School",
      location: "Jázmin u. 10, 1084 Budapest, Hungary",
      popularPrograms: ["Commerce and Marketing", "International Relations"],
      keyHighlights: [
        "Located in Budapest, offering great accessibility, culture, and student life",
        "Offers affordable tuition fees compared to Western Europe",
      ],
      contact: "+36 1 323 1000",
      email: "international@wsuf.hu",
    },
    {
      img: hungury,
      name: "Central European University (CEU)",
      location: "Nádor utca 9, 1051 Budapest, Hungary",
      popularPrograms: [
        "Political Science",
        "International Relations",
        "Public Policy",
        "Law",
      ],
      keyHighlights: [
        "One of the leading graduate universities in Europe",
        "Offers programs in English for international students",
      ],
      contact: "+36 1 327 3000 (International Office)",
      email: "admissions@ceu.edu",
    },
  ];

  const topCourses = [
    {
      title: "Tourism Management",
      category: "Tourism and Catering",
      price: "$100",
      rating: "4.5",
      duration: "6 Months",
      instructor: "John Doe",
      university: "University of Vienna, Austria",
      description:
        "Learn how to manage and operate in the global tourism industry.",
      img:
        "https://cache.careers360.mobi/media/article_images/2020/5/11/hotel-management-vs-travel-and-tourism-management.jpg", // Unsplash link
    },
    {
      title: "Animation Basics",
      category: "Animation",
      price: "$120",
      rating: "4.8",
      duration: "8 Months",
      instructor: "Jane Smith",
      university: "Budapest University of Technology and Economics, Hungary", // Added University Name
      description:
        "An introduction to the world of animation using industry-standard tools.",
      img:
        "https://embed-ssl.wistia.com/deliveries/57ca530bc3e8c8bb5f1f9d4f36be415a.jpg?image_crop_resized=640x358", // Unsplash link
    },
    {
      title: "Graphic Design Essentials",
      category: "Graphic Design",
      price: "$90",
      rating: "4.7",
      duration: "5 Months",
      instructor: "Michael Lee",
      university: "University of Debrecen, Hungary",
      description:
        "Master the fundamentals of graphic design for various media formats.",
      img:
        "https://www.attitudetallyacademy.com/Blog/wp-content/uploads/2019/05/why-garphic-designing-course-is-more-imporatant-for-every-business.jpg", // Unsplash link
    },
    {
      title: "Photography Fundamentals",
      category: "Photography",
      price: "$110",
      rating: "4.6",
      duration: "3 Months",
      instructor: "Samantha Adams",
      university: "Eötvös Loránd University, Hungary",
      description:
        "Learn the basics of photography, including camera settings, composition, and editing.",
      img:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcsJp8Nrcqmorag10MAdxBfPq-pmWvtVQenQ&s", // Unsplash link
    },
    {
      title: "Computer Science for Beginners",
      category: "Computer Science",
      price: "$130",
      rating: "4.7",
      duration: "6 Months",
      instructor: "David Brown",
      university: "Corvinus University of Budapest, Hungary",
      description:
        "Get an introduction to programming and computer science concepts.",
      img:
        "https://www.zdnet.com/a/img/resize/89b98c0918a56594a2d7a84d46dd5268678161b2/2021/07/19/e28889a7-7c41-4dd8-9899-2ee60d1850e2/computer-science-course-overview-shutterstock-1377112199.jpg?auto=webp&fit=crop&height=1200&width=1200", // Unsplash link
    },
    {
      title: "Web Development with HTML, CSS, and JavaScript",
      category: "Computer Science",
      price: "$150",
      rating: "4.9",
      duration: "6 Months",
      instructor: "Emily Davis",
      university: "Pázmány Péter Catholic University, Hungary",
      description:
        "Learn how to build responsive websites using HTML, CSS, and JavaScript.",
      img:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYhuaZv2zcldGUHcFtm25YNu_WH5FkznSdFw&s", // Unsplash link
    },
  ];
  const navigate = useNavigate()
  const signup = () => {
    navigate("/signup")
  }
  return (
    <div className={`landing-page-root ${isDarkMode ? "dark-theme-root" : "light-theme-root"}`} style={{ minHeight: '100vh', background: 'transparent', position: 'relative' }}>
      {/* Ambient Shadow-Style Background Photo Layer */}
      <div className="landing-shadow-bg" aria-hidden="true">
        <div className="landing-shadow-photo-primary"></div>
        <div className="landing-shadow-photo-silhouette"></div>
        <div className="landing-shadow-vignette"></div>
      </div>

      <PaymentFormModal
        show={showPaymentModal}
        handleClose={handleClosePaymentModal}
      />
      {/* Navbar — Fixed on top and stays during scroll */}
      <Navbar expand="lg" fixed="top" className={`navbarHome ${isScrolled ? "scrolled" : ""}`}>
        <Container>
          <Navbar.Brand href="#" className="d-flex align-items-center me-2 me-lg-4">
            <img
              src="/img/kiaan_logo.png"
              alt="Kiaan Technology"
              height="44"
              className="me-2 navbar-brand-logo"
              style={{ objectFit: 'contain', borderRadius: '8px' }}
            />
            <div className="brand-text ms-2 d-flex flex-column">
              <span className="fw-bold m-0" style={{ lineHeight: '1', fontSize: '1.45rem' }}>Kiaan</span>
              <span style={{ fontSize: '0.62rem', color: isDarkMode ? '#34d399' : '#059669', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700 }}>Technology</span>
            </div>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mx-auto">
              <Nav.Link href="#courses" className="nav-link-hover mx-2">Courses</Nav.Link>
              <Nav.Link href="#about" className="nav-link-hover mx-2">About</Nav.Link>
              <Nav.Link href="#contact" className="nav-link-hover mx-2">Contact</Nav.Link>
            </Nav>

            <div className="navbar-actions-group d-flex align-items-center flex-wrap gap-2 gap-xl-3">
              {/* Light / Dark Mode Toggle Button */}
              <button
                type="button"
                className="theme-toggle-btn"
                onClick={toggleTheme}
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle Theme"
              >
                {isDarkMode ? "☀️" : "🌙"}
              </button>

              <Button
                className="nav-action-btn d-flex align-items-center justify-content-center px-3 px-xl-4"
                onClick={handleOpenPaymentModal}
                style={{ borderRadius: '50px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', color: '#ffffff', fontWeight: 800, boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'linear-gradient(135deg, #34d399 0%, #10b981 100%)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(16,185,129,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(16,185,129,0.3)'; }}
              >
                <i className="fas fa-credit-card me-2"></i> Enroll Now
              </Button>
              <Link
                to="/login"
                className="nav-action-btn btn px-3 px-xl-4 fw-bold d-flex align-items-center justify-content-center"
                style={{ borderRadius: '50px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.35)', color: isDarkMode ? '#34d399' : '#059669', transition: 'all 0.3s ease' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.22)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.1)'; e.currentTarget.style.color = isDarkMode ? '#34d399' : '#059669'; }}
              >
                Log in
              </Link>
              <Button
                className="nav-action-btn d-flex align-items-center justify-content-center px-3 px-xl-4 fw-bold"
                onClick={handleOpenInquiry}
                style={{ borderRadius: '50px', background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.15)', color: isDarkMode ? '#fff' : '#0f172a', transition: 'all 0.3s ease' }}
                onMouseEnter={e => { e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'; }}
              >
                <i className="fas fa-question-circle me-2"></i> Inquiry
              </Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <section className="hero-section">
        <div className="hero-video-bg"></div>
        <div className="hero-shadow-silhouette"></div>
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <Row className="align-items-center g-4 g-lg-5">
            <Col lg={7}>
              <div className="hero-badge" data-aos="fade-up">
                <span className="hero-badge-dot"></span>
                <span className="hero-badge-text">Trusted International Admissions & Visa Guidance</span>
              </div>
              <h1 className="hero-title" data-aos="fade-up" data-aos-delay="100">
                Your global <br className="d-none d-md-block" />
                <span className="gradient-text">education journey</span>
                <span className="hero-inline-plane" aria-hidden="true">✈️</span>
                <br className="d-none d-md-block" />
                starts here.
              </h1>
              <p className="hero-subtitle" data-aos="fade-up" data-aos-delay="200">
                We partner with students and families to map realistic university pathways, sharpen profiles, and secure visas with absolute confidence.
              </p>
              <div className="hero-buttons d-flex flex-wrap gap-3" data-aos="fade-up" data-aos-delay="300">
                <Button variant="light" size="lg" className="pulse-button" onClick={handleOpenInquiry}>
                  Start Free Assessment <i className="fas fa-arrow-right ms-2"></i>
                </Button>
                <a href="tel:+1231234568977" className="btn hover-fill btn-lg text-decoration-none d-inline-flex align-items-center">
                  <i className="fas fa-phone-alt me-2"></i> Call Consultant
                </a>
              </div>

              {/* Hero Bottom Feature Trust Bar (matches screenshot) */}
              <div className="hero-trust-bar" data-aos="fade-up" data-aos-delay="350">
                <div className="hero-trust-item">
                  <span className="hero-trust-icon">
                    <i className="fas fa-award"></i>
                  </span>
                  <div className="hero-trust-text">
                    <span>Top University</span>
                    <span>Partnerships</span>
                  </div>
                </div>
                <div className="hero-trust-divider"></div>
                <div className="hero-trust-item">
                  <span className="hero-trust-icon">
                    <i className="fas fa-users"></i>
                  </span>
                  <div className="hero-trust-text">
                    <span>Personalized</span>
                    <span>Guidance</span>
                  </div>
                </div>
                <div className="hero-trust-divider"></div>
                <div className="hero-trust-item">
                  <span className="hero-trust-icon">
                    <i className="fas fa-shield-alt"></i>
                  </span>
                  <div className="hero-trust-text">
                    <span>End-to-End</span>
                    <span>Visa Support</span>
                  </div>
                </div>
              </div>
            </Col>

            <Col lg={5} data-aos="fade-left" data-aos-delay="400">
              {/* Airplane Flight Visual Showcase Card */}
              <div className="airplane-card-showcase mb-3">
                <img 
                  src="/img/airplane_hero.jpg" 
                  alt="Global Study Abroad Flight" 
                  className="airplane-card-img"
                />
                <div className="airplane-card-overlay">
                  <div className="flight-badges-row d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                    <span className="flight-status-badge mb-0">
                      <span className="flight-live-dot"></span>
                      FLIGHT TO GLOBAL DREAMS
                    </span>
                    <span className="flight-visa-pill" style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700, background: 'rgba(13, 20, 16, 0.85)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: 50, border: '1px solid rgba(245,158,11,0.4)', whiteSpace: 'nowrap' }}>
                      98.4% Visa Success
                    </span>
                  </div>

                  {/* Interactive Flight Route Display */}
                  <div className="flight-route-display">
                    <div className="route-city">
                      <span className="route-city-code">DEL</span>
                      <span className="route-city-name">Home Country</span>
                    </div>

                    <div className="route-flight-track">
                      <div className="flight-track-line"></div>
                      <span className="flight-plane-icon">✈️</span>
                    </div>

                    <div className="route-city text-end">
                      <span className="route-city-code" style={{ color: '#34d399' }}>GLOBAL</span>
                      <span className="route-city-name">Top Universities</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Stats Grid */}
              <div className="hero-stats-grid">
                <div className="stat-card-small">
                  <div className="stat-icon-box">
                    <i className="fas fa-file-invoice"></i>
                  </div>
                  <span className="stat-value">14,750+</span>
                  <span className="stat-label">Visas processed</span>
                </div>
                <div className="stat-card-small">
                  <div className="stat-icon-box">
                    <i className="fas fa-chart-bar"></i>
                  </div>
                  <span className="stat-value">96%</span>
                  <span className="stat-label">Success rate</span>
                </div>
                <div className="stat-card-small">
                  <div className="stat-icon-box">
                    <i className="fas fa-globe"></i>
                  </div>
                  <span className="stat-value">49+</span>
                  <span className="stat-label">Countries served</span>
                </div>
                <div className="stat-card-small">
                  <div className="stat-icon-box">
                    <i className="fas fa-graduation-cap"></i>
                  </div>
                  <span className="stat-value">500+</span>
                  <span className="stat-label">Partner universities</span>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>


      {/* Our Services Section */}
      <div className="landing-section-services">
        <section className="py-5 position-relative landing-inner-container" id="services" style={{ maxWidth: 1320, margin: '0 auto', padding: '80px 24px 20px', zIndex: 2 }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, color: isDarkMode ? '#fff' : '#0f172a', textAlign: 'center', marginBottom: 8, textShadow: isDarkMode ? '0 2px 12px rgba(0,0,0,0.6)' : '0 2px 14px rgba(255,255,255,0.95)' }}>
            Our Core <span style={{ background: 'linear-gradient(90deg, #10b981, #059669, #d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Services</span>
          </h2>
          <p style={{ textAlign: 'center', color: isDarkMode ? '#cbd5e1' : '#1e293b', fontWeight: 600, fontSize: '1.05rem', marginBottom: 48, textShadow: isDarkMode ? '0 1px 8px rgba(0,0,0,0.6)' : '0 1px 10px rgba(255,255,255,0.95)' }}>Comprehensive support for your international education journey</p>
          <Row className="g-4">
            {[
              { icon: '🎓', title: 'University Admissions', desc: 'Expert guidance in selecting the right university and course to match your career goals.' },
              { icon: '🛂', title: 'Visa Assistance', desc: 'Complete support with visa documentation, application filing, and interview preparation.' },
              { icon: '💼', title: 'Career Counseling', desc: 'Personalized counseling to help you identify the best career pathways globally.' },
              { icon: '💰', title: 'Scholarship Guidance', desc: 'Assistance in identifying and applying for international scholarships and financial aid.' },
              { icon: '✈️', title: 'Pre-Departure Support', desc: 'Briefings and support to ensure a smooth transition to your new host country.' },
              { icon: '🏠', title: 'Accommodation Help', desc: 'Finding safe and affordable housing options near your chosen university.' },
            ].map((service, index) => (
              <Col key={index} lg={4} md={6}>
                <div className="service-card" style={{ background: isDarkMode ? 'linear-gradient(160deg, rgba(16, 24, 19, 0.88) 0%, rgba(8, 13, 10, 0.92) 100%)' : 'rgba(255, 255, 255, 0.92)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(16,185,129,0.22)', borderRadius: 20, padding: 30, height: '100%', transition: 'all 0.3s ease', cursor: 'default', boxShadow: isDarkMode ? '0 14px 34px rgba(0,0,0,0.45)' : '0 12px 30px rgba(15, 23, 42, 0.06)' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(16,185,129,0.18)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.22)'; e.currentTarget.style.boxShadow = isDarkMode ? '0 14px 34px rgba(0,0,0,0.45)' : '0 12px 30px rgba(15, 23, 42, 0.06)'; }}
                >
                  <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: 20 }}>
                    {service.icon}
                  </div>
                  <h4 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: isDarkMode ? '#fff' : '#0f172a', fontSize: '1.25rem', marginBottom: 12 }}>{service.title}</h4>
                  <p style={{ color: isDarkMode ? '#94a3b8' : '#475569', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>{service.desc}</p>
                </div>
              </Col>
            ))}
          </Row>
        </section>
      </div>

      {/* Featured Universities */}
      <div className="landing-section-universities">
        <Container className="py-5 position-relative landing-inner-container" id="about" style={{ zIndex: 2 }}>
          <UniversityCards />
        </Container>
      </div>

      {/* Top-rated Courses */}
      <div className="landing-section-courses">
        <section className="py-5 position-relative landing-inner-container" id="courses" style={{ maxWidth: 1320, margin: '0 auto', padding: '60px 24px 80px', zIndex: 2 }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, color: isDarkMode ? '#fff' : '#0f172a', textAlign: 'center', marginBottom: 8, textShadow: isDarkMode ? '0 2px 12px rgba(0,0,0,0.6)' : '0 2px 14px rgba(255,255,255,0.95)' }}>
            Top-rated <span style={{ background: 'linear-gradient(90deg, #10b981, #059669, #d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Courses</span>
          </h2>
          <p style={{ textAlign: 'center', color: isDarkMode ? '#cbd5e1' : '#1e293b', fontWeight: 600, fontSize: '1.05rem', marginBottom: 48, textShadow: isDarkMode ? '0 1px 8px rgba(0,0,0,0.6)' : '0 1px 10px rgba(255,255,255,0.95)' }}>Discover industry-leading programs designed for global careers</p>
          <Row className="g-4">
            {topCourses.map((course, index) => (
              <Col key={index} lg={4} md={6} className="mb-2">
                <div style={{ position: 'relative', borderRadius: 20, padding: 1, background: 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(245,158,11,0.12), rgba(16,185,129,0.05))', transition: 'all 0.4s cubic-bezier(.4,0,.2,1)', height: '100%' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(52,211,153,0.7), rgba(16,185,129,0.5), rgba(245,158,11,0.3))'; e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = isDarkMode ? '0 20px 50px rgba(0,0,0,0.65), 0 0 25px rgba(16,185,129,0.18)' : '0 20px 45px rgba(15,23,42,0.12), 0 0 25px rgba(16,185,129,0.18)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(245,158,11,0.12), rgba(16,185,129,0.05))'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ background: isDarkMode ? 'linear-gradient(160deg, rgba(16, 24, 19, 0.9) 0%, rgba(8, 13, 10, 0.94) 100%)' : 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderRadius: 19, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Image Section */}
                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                      <img src={course.img} alt={course.title} loading="lazy" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: isDarkMode ? 'linear-gradient(transparent, #080d0a)' : 'linear-gradient(transparent, rgba(255,255,255,0.95))' }} />
                    {/* Price Tag */}
                    <span style={{ position: 'absolute', top: 14, right: 14, background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff', padding: '5px 14px', borderRadius: 50, fontWeight: 800, fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(16,185,129,0.35)' }}>{course.price}</span>
                    {/* Rating */}
                    <span style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', color: '#fbbf24', padding: '5px 12px', borderRadius: 50, fontWeight: 700, fontSize: '0.8rem', border: '1px solid rgba(245,158,11,0.25)' }}>
                      ⭐ {course.rating}
                    </span>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '20px 22px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {/* Category chip */}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 50, padding: '4px 12px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: isDarkMode ? '#34d399' : '#059669', marginBottom: 12, alignSelf: 'flex-start' }}>
                      🎓 {course.category}
                    </span>

                    {/* University */}
                    <h5 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: isDarkMode ? '#fff' : '#0f172a', marginBottom: 4, lineHeight: 1.3 }}>{course.university}</h5>
                    {/* Course Title */}
                    <p style={{ fontSize: '0.9rem', color: isDarkMode ? '#6ee7b7' : '#059669', fontWeight: 600, marginBottom: 12 }}>{course.title}</p>

                    {/* Stats Row */}
                    <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: '0.82rem', color: isDarkMode ? '#94a3b8' : '#475569' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(16,185,129,0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>👨‍🎓</span>
                        156 Students
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(16,185,129,0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>📚</span>
                        18 Lessons
                      </span>
                    </div>

                    {/* Description */}
                    <p style={{ fontSize: '0.85rem', color: isDarkMode ? '#94a3b8' : '#475569', lineHeight: 1.6, marginBottom: 16 }}>{course.description}</p>

                    {/* Progress */}
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: isDarkMode ? '#34d399' : '#059669' }}>Success Rate</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isDarkMode ? '#fff' : '#0f172a' }}>75%</span>
                      </div>
                      <div style={{ background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)', height: 6, borderRadius: 10, overflow: 'hidden' }}>
                        <div style={{ width: '75%', height: '100%', borderRadius: 10, background: 'linear-gradient(90deg, #10b981, #fbbf24)', transition: 'width 1s ease' }} />
                      </div>
                    </div>

                    {/* Spacer */}
                    <div style={{ flex: 1 }} />

                    {/* Apply Button */}
                    <Link to="/login" style={{ display: 'block', width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', fontWeight: 800, fontSize: '0.95rem', textAlign: 'center', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', textDecoration: 'none', boxShadow: '0 4px 15px rgba(16,185,129,0.3)', transition: 'all 0.3s ease' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'linear-gradient(135deg, #34d399 0%, #10b981 100%)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(16,185,129,0.5)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(16,185,129,0.3)'; }}
                    >
                      🚀 Apply Now
                    </Link>
                  </div>
                </div>
              </div>
              </Col>
            ))}
          </Row>
        </section>
      </div>

      {/* Exclusive Offer */}
      <section className="offer-section text-center position-relative">
        <div className="offer-overlay">
          <Container>
            <div className="offer-content">
              <div className="offer-icon mb-4">
                <i className="fas fa-gift"></i>
              </div>
              <h3 className="offer-title mb-4">
                <span className="gradient-text">Special Offer</span> for New
                Students
              </h3>
              <p className="offer-description mb-4">
                Join our community today and get 20% off on all courses!
                Subscribe to our newsletter for exclusive updates and
                promotions.
              </p>
              <div className="newsletter-form">
                <Row className="justify-content-center">
                  <Col md={6}>
                    <form
                      action="https://api.web3forms.com/submit"
                      method="POST"
                    >
                      <input
                        type="hidden"
                        name="access_key"
                        value="295df667-5bb4-4c46-a599-bef4f4e754f3"
                      />

                      <div className="input-group">
                        <input
                          type="email"
                          placeholder="Enter your email address"
                          name="email"
                          required
                          className="form-control newsletter-input"
                        />

                        <button
                          type="submit"
                          className="btn btn-primary subscribe-btn"
                          disabled={!recaptchaValue}
                        >
                          <i className="fas fa-paper-plane me-2"></i>
                          Subscribe Now
                        </button>
                      </div>
                    </form>

                    {/* Google reCAPTCHA Checkbox outside the form to avoid Web3Forms Pro validation */}
                    <div className="d-flex justify-content-center mt-3 w-100">
                      <ReCAPTCHA
                        sitekey="6LdibZstAAAAAOTUrGzitpD5wFSipVH2Llc60MUt"
                        onChange={(value) => setRecaptchaValue(value)}
                      />
                    </div>
                  </Col>
                </Row>
              </div>
              <div className="offer-features mt-4">
                <span>
                  <i className="fas fa-check-circle me-2"></i>Weekly Updates
                </span>
                <span>
                  <i className="fas fa-check-circle me-2"></i>Special Discounts
                </span>
                <span>
                  <i className="fas fa-check-circle me-2"></i>New Course Alerts
                </span>
              </div>
            </div>
          </Container>
        </div>
      </section>
      {/* Footer */}
      <footer id="contact" className="landing-footer" style={{ borderTop: '1px solid rgba(16,185,129,0.2)', position: 'relative', overflow: 'hidden' }}>
        {/* Top gradient line */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, transparent, #34d399, #10b981, #fbbf24, transparent)' }} />

        {/* Decorative glow */}
        <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 400, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <Container className="footer-main-container landing-inner-container" style={{ padding: '60px 24px 30px', position: 'relative', zIndex: 2 }}>
          <Row className="g-5">
            {/* Brand Column */}
            <Col lg={4} md={6}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <img src="/img/kiaan_logo.png" alt="Kiaan Technology" height="48" style={{ objectFit: 'contain' }} />
                <div>
                  <h5 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, margin: 0, fontSize: '1.3rem', color: isDarkMode ? '#fff' : '#0f172a' }}>Kiaan</h5>
                  <span style={{ fontSize: '0.65rem', color: isDarkMode ? '#34d399' : '#059669', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>Technology</span>
                </div>
              </div>
              <p style={{ color: isDarkMode ? '#94a3b8' : '#475569', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 300, marginBottom: 24 }}>
                Your trusted partner for international university admissions, visa guidance, and global career pathways.
              </p>
              {/* Social Icons */}
              <div style={{ display: 'flex', gap: 10 }}>
                {['facebook', 'instagram', 'linkedin', 'youtube'].map((social) => (
                  <a key={social} href="#" style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDarkMode ? '#34d399' : '#059669', fontSize: '0.9rem', transition: 'all 0.3s ease', textDecoration: 'none' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.25)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <i className={`fab fa-${social}`}></i>
                  </a>
                ))}
              </div>
            </Col>

            {/* Quick Links */}
            <Col lg={2} md={6}>
              <h6 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: isDarkMode ? '#34d399' : '#059669', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20 }}>Quick Links</h6>
              {['About Us', 'Courses', 'Universities', 'Apply Now', 'Blog'].map((link) => (
                <a key={link} href="#" style={{ display: 'block', color: isDarkMode ? '#94a3b8' : '#475569', fontSize: '0.88rem', marginBottom: 12, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#10b981'; e.currentTarget.style.paddingLeft = '4px'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#475569'; e.currentTarget.style.paddingLeft = '0'; }}
                >{link}</a>
              ))}
            </Col>

            {/* Services */}
            <Col lg={3} md={6}>
              <h6 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: isDarkMode ? '#34d399' : '#059669', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20 }}>Services</h6>
              {['University Admissions', 'Visa Assistance', 'Career Counseling', 'Scholarship Guidance', 'Pre-Departure Support'].map((service) => (
                <a key={service} href="#" style={{ display: 'block', color: isDarkMode ? '#94a3b8' : '#475569', fontSize: '0.88rem', marginBottom: 12, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#10b981'; e.currentTarget.style.paddingLeft = '4px'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#475569'; e.currentTarget.style.paddingLeft = '0'; }}
                >{service}</a>
              ))}
            </Col>

            {/* Contact Info */}
            <Col lg={3} md={6}>
              <h6 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: isDarkMode ? '#34d399' : '#059669', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20 }}>Contact Us</h6>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { icon: '📱', label: 'Hotline', value: '09613752752' },
                  { icon: '💬', label: 'WhatsApp', value: '+4915217531538' },
                  { icon: '✉️', label: 'Email', value: 'studyfirstinfo@gmail.com' },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>{item.icon}</span>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{item.label}</span>
                      <p style={{ margin: 0, color: isDarkMode ? '#cbd5e1' : '#0f172a', fontSize: '0.88rem', fontWeight: 500 }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Col>
          </Row>

          {/* Bottom Bar */}
          <div className="footer-bottom-bar" style={{ marginTop: 48, paddingTop: 24, borderTop: isDarkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(15,23,42,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <p style={{ margin: 0, color: '#475569', fontSize: '0.82rem' }}>© 2026 Kiaan Technology. All rights reserved.</p>
            <div style={{ display: 'flex', gap: 24 }}>
              {[
                { name: 'Privacy Policy', path: '/privacy-policy' },
                { name: 'Terms of Use', path: '#' },
                { name: 'Cookie Policy', path: '#' }
              ].map((item) => (
                <Link key={item.name} to={item.path} style={{ color: '#475569', fontSize: '0.82rem', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#10b981'}
                  onMouseLeave={e => e.currentTarget.style.color = '#475569'}
                >{item.name}</Link>
              ))}
            </div>
          </div>
        </Container>
      </footer>

      <Modal
        show={showInquiryModal}
        onHide={handleCloseInquiry}
        size="xl"
        centered
        className="inquiry-custom-modal"
      >
        <Modal.Header>
          <Modal.Title>
            <span>📝</span>
            <span>Student Inquiry Form</span>
          </Modal.Title>
          <button
            type="button"
            className="modal-close-cross-btn"
            onClick={handleCloseInquiry}
            title="Close Form (Esc)"
            aria-label="Close"
          >
            ✕
          </button>
        </Modal.Header>
        <Modal.Body style={{ position: 'relative' }}>
          {/* Secondary Sticky floating close pill for quick dismissal while scrolling */}
          <button
            type="button"
            className="modal-sticky-close-badge mb-3"
            onClick={handleCloseInquiry}
            title="Close Form"
          >
            ✕ Close Form
          </button>
          <InquiryForm onClose={handleCloseInquiry} />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={handleCloseInquiry}
            style={{ borderRadius: '50px', padding: '7px 24px', fontWeight: 700 }}
          >
            ✕ Close Form
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default App;

import React, { useState, useEffect } from "react";
import { useSpring, animated, useTrail } from "react-spring";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";

import Swal from "sweetalert2";
import BASE_URL from "../../Config";
import api from "../../interceptors/axiosInterceptor";

/* ── Inline Styles ────────────────────────────────────────── */
const styles = {
  /* Section wrapper */
  section: {
    padding: "60px 24px 80px",
    maxWidth: 1320,
    margin: "0 auto",
  },

  /* Section heading */
  heading: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
    fontWeight: 800,
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  subHeading: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "1.05rem",
    marginBottom: 48,
    fontWeight: 400,
  },

  /* Card outer wrapper — holds the glow border */
  cardOuter: {
    position: "relative",
    borderRadius: 20,
    padding: 1,
    background: "linear-gradient(135deg, rgba(56,189,248,0.3), rgba(99,102,241,0.2), rgba(56,189,248,0.1))",
    transition: "all 0.4s cubic-bezier(.4,0,.2,1)",
    height: "100%",
  },
  cardOuterHover: {
    background: "linear-gradient(135deg, rgba(56,189,248,0.7), rgba(99,102,241,0.5), rgba(56,189,248,0.3))",
    transform: "translateY(-6px)",
    boxShadow: "0 20px 50px rgba(56,189,248,0.15), 0 0 30px rgba(56,189,248,0.08)",
  },

  /* Card inner */
  cardInner: {
    background: "linear-gradient(160deg, #1e293b 0%, #0f172a 100%)",
    borderRadius: 19,
    padding: "28px 24px 24px",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    position: "relative",
    overflow: "hidden",
  },

  /* Decorative glow circle top-right */
  glowCircle: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  },

  /* Top accent bar */
  accentBar: {
    height: 3,
    borderRadius: 4,
    background: "linear-gradient(90deg, #38bdf8, #6366f1, #38bdf8)",
    marginBottom: 22,
    opacity: 0.7,
  },

  /* Logo + name header */
  headerRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 18,
  },
  logoWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: "rgba(56,189,248,0.1)",
    border: "1px solid rgba(56,189,248,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  logoImg: {
    width: 40,
    height: 40,
    objectFit: "cover",
    borderRadius: 10,
  },
  universityName: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: "1.15rem",
    fontWeight: 700,
    color: "#ffffff",
    margin: 0,
    lineHeight: 1.3,
  },

  /* Location chip */
  locationChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(56,189,248,0.08)",
    border: "1px solid rgba(56,189,248,0.15)",
    borderRadius: 50,
    padding: "5px 14px",
    fontSize: "0.8rem",
    color: "#7dd3fc",
    fontWeight: 500,
    marginBottom: 18,
  },

  /* Section label (Programs, Highlights, Contact) */
  sectionLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: "0.78rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "#38bdf8",
    marginBottom: 10,
  },
  sectionIcon: {
    width: 20,
    height: 20,
    borderRadius: 6,
    background: "rgba(56,189,248,0.12)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.7rem",
  },

  /* Program chips */
  chipRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 16,
  },
  chip: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 50,
    padding: "4px 12px",
    fontSize: "0.78rem",
    color: "#cbd5e1",
    fontWeight: 500,
    transition: "all 0.2s ease",
  },

  /* Highlight items */
  highlightItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
    fontSize: "0.85rem",
    color: "#94a3b8",
    lineHeight: 1.5,
  },
  highlightDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#38bdf8",
    marginTop: 7,
    flexShrink: 0,
  },

  /* Read More button */
  readMoreBtn: {
    background: "none",
    border: "none",
    color: "#38bdf8",
    fontSize: "0.82rem",
    fontWeight: 600,
    cursor: "pointer",
    padding: 0,
    marginBottom: 16,
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    transition: "color 0.2s",
  },

  /* Contact section */
  contactRow: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 20,
  },
  contactItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: "0.82rem",
    color: "#94a3b8",
  },
  contactIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: "rgba(56,189,248,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    flexShrink: 0,
  },

  /* Divider */
  divider: {
    height: 1,
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
    margin: "12px 0 16px",
    border: "none",
  },

  /* Apply button */
  applyBtn: {
    display: "block",
    width: "100%",
    padding: "12px 0",
    borderRadius: 12,
    border: "none",
    fontWeight: 700,
    fontSize: "0.95rem",
    textAlign: "center",
    background: "linear-gradient(135deg, #38bdf8, #6366f1)",
    color: "#ffffff",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
    textDecoration: "none",
    letterSpacing: "0.02em",
    boxShadow: "0 4px 15px rgba(56,189,248,0.25)",
  },
  applyBtnHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 25px rgba(56,189,248,0.35)",
  },

  /* Delete button */
  deleteBtn: {
    width: "100%",
    marginTop: 8,
    borderRadius: 12,
    fontWeight: 600,
    fontSize: "0.85rem",
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.2)",
    color: "#f87171",
    padding: "10px 0",
    transition: "all 0.2s",
  },
};

const UniversityCards = () => {
  const [universities, setUniversities] = useState([]);
  const [expandedCards, setExpandedCards] = useState({});
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const role = localStorage.getItem("login"); // To check if the user is an admin

  const toggleExpand = (index) => {
    setExpandedCards((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Fetch universities on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`${BASE_URL}universities`);
        setUniversities(response.data); // Set fetched universities to state
      } catch (error) {
        console.log("Error fetching universities:", error);
      }
    };

    fetchData();
  }, []);

  // Staggered trail animation for cards
  const trail = useTrail(universities.length, {
    opacity: 1,
    transform: "translateY(0px)",
    from: { opacity: 0, transform: "translateY(30px)" },
    config: { tension: 220, friction: 24 },
  });

  // Handle delete action for university
  const handleDeleteUniversity = async (id) => {
    try {
      await api.delete(`${BASE_URL}universities/${id}`);
      Swal.fire({
        title: "Deleted Successfully!",
        text: "The university has been deleted.",
        icon: "success",
        confirmButtonText: "Close",
      });
      // Filter out the deleted university from the list
      setUniversities((prevUniversities) =>
        prevUniversities.filter((university) => university.id !== id)
      );
    } catch (error) {
      console.error("Error deleting university:", error);
      Swal.fire({
        title: "Error!",
        text: "Something went wrong. Please try again.",
        icon: "error",
        confirmButtonText: "Close",
      });
    }
  };

  return (
    <div style={styles.section}>
      {/* ── Section Header ── */}
      <h2 style={styles.heading}>
        Top International <span style={{ background: "linear-gradient(90deg,#38bdf8,#6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Universities</span>
      </h2>
      <p style={styles.subHeading}>Explore world-class universities and start your global education journey</p>

      {/* ── Cards Grid ── */}
      <div className="row g-4">
        {universities.length > 0 ? (
          trail.map((springStyle, index) => {
            const university = universities[index];
            if (!university) return null;

            const programs = Array.isArray(university.programs)
              ? university.programs
              : [];
            const highlights = Array.isArray(university.highlights)
              ? university.highlights
              : [];

            const isExpanded = expandedCards[index];
            const displayPrograms = isExpanded ? programs : programs.slice(0, 2);
            const displayHighlights = isExpanded ? highlights : highlights.slice(0, 2);
            const hasMore = programs.length > 2 || highlights.length > 2;
            const isHovered = hoveredCard === index;

            return (
              <animated.div
                key={university.id || index}
                className="col-lg-4 col-md-6 mb-2"
                style={springStyle}
              >
                {/* Card Outer — gradient border */}
                <div
                  style={{
                    ...styles.cardOuter,
                    ...(isHovered ? styles.cardOuterHover : {}),
                  }}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Card Inner */}
                  <div style={styles.cardInner}>
                    {/* Decorative glow */}
                    <div style={styles.glowCircle} />

                    {/* Accent bar */}
                    <div style={styles.accentBar} />

                    {/* ── Header: Logo + Name ── */}
                    <div style={styles.headerRow}>
                      <div style={styles.logoWrapper}>
                        <img
                          src={university.logo_url}
                          alt={`${university.name} Logo`}
                          style={styles.logoImg}
                          crossOrigin="anonymous"
                          onError={(e) => {
                            e.target.onerror = null;
                          }}
                        />
                      </div>
                      <h5 style={styles.universityName}>{university.name}</h5>
                    </div>

                    {/* ── Location ── */}
                    <div>
                      <span style={styles.locationChip}>
                        📍 {university.location}
                      </span>
                    </div>

                    {/* ── Programs ── */}
                    <div style={styles.sectionLabel}>
                      <span style={styles.sectionIcon}>🎓</span>
                      Popular Programs
                    </div>
                    <div style={styles.chipRow}>
                      {displayPrograms.length > 0 ? (
                        displayPrograms.map((program, idx) => (
                          <span key={idx} style={styles.chip}>{program}</span>
                        ))
                      ) : (
                        <span style={{ ...styles.chip, opacity: 0.5 }}>No programs available</span>
                      )}
                    </div>

                    {/* ── Highlights ── */}
                    <div style={styles.sectionLabel}>
                      <span style={styles.sectionIcon}>✨</span>
                      Key Highlights
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      {displayHighlights.length > 0 ? (
                        displayHighlights.map((highlight, idx) => (
                          <div key={idx} style={styles.highlightItem}>
                            <span style={styles.highlightDot} />
                            <span>{highlight}</span>
                          </div>
                        ))
                      ) : (
                        <div style={{ ...styles.highlightItem, opacity: 0.5 }}>
                          <span style={styles.highlightDot} />
                          <span>No highlights available</span>
                        </div>
                      )}
                    </div>

                    {/* ── Read More ── */}
                    {hasMore && (
                      <button
                        style={styles.readMoreBtn}
                        onClick={() => toggleExpand(index)}
                      >
                        {isExpanded ? "▲ Read Less" : "▼ Read More..."}
                      </button>
                    )}

                    {/* ── Divider ── */}
                    <hr style={styles.divider} />

                    {/* ── Contact ── */}
                    <div style={styles.sectionLabel}>
                      <span style={styles.sectionIcon}>📞</span>
                      Contact Info
                    </div>
                    <div style={styles.contactRow}>
                      <div style={styles.contactItem}>
                        <span style={styles.contactIcon}>📱</span>
                        <span>{university.contact_phone || "N/A"}</span>
                      </div>
                      <div style={styles.contactItem}>
                        <span style={styles.contactIcon}>✉️</span>
                        <span>{university.contact_email || "N/A"}</span>
                      </div>
                    </div>

                    {/* ── Spacer to push button to bottom ── */}
                    <div style={{ flex: 1 }} />

                    {/* ── Apply Button ── */}
                    {role === "student" || role === "counselor" ? (
                      <Link
                        to={`/university/${university.id}`}
                        style={{
                          ...styles.applyBtn,
                          ...(hoveredBtn === `apply-${index}` ? styles.applyBtnHover : {}),
                        }}
                        onMouseEnter={() => setHoveredBtn(`apply-${index}`)}
                        onMouseLeave={() => setHoveredBtn(null)}
                        onClick={() => {
                          localStorage.setItem("university_id", university.id);
                        }}
                      >
                        🚀 Apply Now
                      </Link>
                    ) : (
                      <Link
                        to="/login"
                        style={{
                          ...styles.applyBtn,
                          ...(hoveredBtn === `apply-${index}` ? styles.applyBtnHover : {}),
                        }}
                        onMouseEnter={() => setHoveredBtn(`apply-${index}`)}
                        onMouseLeave={() => setHoveredBtn(null)}
                      >
                        🚀 Apply Now
                      </Link>
                    )}

                    {/* ── Admin Delete ── */}
                    {role === "admin" && (
                      <button
                        style={styles.deleteBtn}
                        onClick={() => handleDeleteUniversity(university.id)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(239,68,68,0.25)";
                          e.currentTarget.style.color = "#fca5a5";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(239,68,68,0.12)";
                          e.currentTarget.style.color = "#f87171";
                        }}
                      >
                        🗑️ Delete University
                      </button>
                    )}
                  </div>
                </div>
              </animated.div>
            );
          })
        ) : (
          <div className="col-12 text-center py-5">
            <p style={{ color: "#64748b", fontSize: "1.1rem" }}>No universities available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversityCards;

import React, { useState } from "react";
import { Form, Button, Col, Row, ProgressBar, Card, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./GyorUniversity.css";

const initialData = {
  firstName: "",
  lastName: "",
  email: "",
  dateOfBirth: "",
  passportScan: null,
  medicalCertificate: null,
  proofOfAccommodation: null,
  educationLevel: "",
  schoolName: "",
  graduationYear: "",
  englishTestType: "",
  testScore: "",
  testDate: "",
  admissionLetter: null,
  invitationLetter: null,
  visaApplicationForm: null,
  healthInsurance: null,
  bankStatements: null,
  sponsorshipLetter: null,
};

const MultiStepForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialData);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });

  const handleNext = () => setStep(step + 1);
  const handlePrevious = () => setStep(step - 1);
  const handleSubmit = () => console.log("Form submitted:", formData);

  const progress = (step / 7) * 100;

  const renderFieldLabel = (icon, label) => (
    <>
      <span className="field-icon">{icon}</span> {label}
    </>
  );

  const renderUploadCard = (icon, label, name, fileType) => (
    <Card className="mb-3 upload-card">
      <Card.Body className="d-flex justify-content-between align-items-center">
        <div>
          <strong>
            <span className="field-icon">{icon}</span> {label}
          </strong>
          <br />
          <small className="text-muted">{fileType}</small>
        </div>
        <Form.Control
          type="file"
          name={name}
          onChange={handleFileChange}
          className="upload-button"
        />
      </Card.Body>
    </Card>
  );

  return (
    <div className="application-form-container">
      {localStorage.getItem("isProcessorApplying") === "true" && (
        <Alert variant="info" className="mb-4 d-flex justify-content-between align-items-center" style={{ borderRadius: '15px', borderLeft: '5px solid #0dcaf0' }}>
          <div>
            <h6 className="mb-1"><i className="bi bi-info-circle-fill me-2"></i>PROCESSOR MODE: APPLYING ON BEHALF OF STUDENT</h6>
            <p className="mb-0 small">You are currently filling this university application form for a student. All details submitted will be linked to their profile.</p>
          </div>
          <Button variant="outline-info" size="sm" className="rounded-pill px-3" onClick={() => {
            localStorage.removeItem("isProcessorApplying");
            navigate("/processorApply");
          }}>Exit & Back</Button>
        </Alert>
      )}
      <h2 className="form-title">University of Gyor - Application Form</h2>
      <ProgressBar now={progress} className="step-progress-bar mb-4" />

      {step === 1 && (
        <>
          <h4 className="section-title">👤 Personal Information</h4>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>{renderFieldLabel("🧑", "First Name")}</Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>{renderFieldLabel("🧑", "Last Name")}</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  {renderFieldLabel("✉️", "Email Address")}
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  {renderFieldLabel("📅", "Date of Birth")}
                </Form.Label>
                <Form.Control
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <div className="navigation-buttons">
            <Button onClick={handleNext}>Next</Button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h4 className="section-title">🎓 Educational Background</h4>
          <Form.Group>
            <Form.Label>{renderFieldLabel("🏫", "Education Level")}</Form.Label>
            <Form.Control
              as="select"
              name="educationLevel"
              value={formData.educationLevel}
              onChange={handleChange}
            >
              <option>Select</option>
              <option>High School</option>
              <option>Bachelor's</option>
              <option>Master's</option>
            </Form.Control>
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label>
              {renderFieldLabel("🏫", "School/College Name")}
            </Form.Label>
            <Form.Control
              type="text"
              name="schoolName"
              value={formData.schoolName}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label>{renderFieldLabel("📅", "Graduation Year")}</Form.Label>
            <Form.Control
              type="text"
              name="graduationYear"
              value={formData.graduationYear}
              onChange={handleChange}
            />
          </Form.Group>
          <div className="navigation-buttons">
            <Button onClick={handlePrevious}>Previous</Button>
            <Button onClick={handleNext}>Next</Button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h4 className="section-title">📖 Language Proficiency</h4>
          <Form.Group>
            <Form.Label>
              {renderFieldLabel("🌍", "English Test Type")}
            </Form.Label>
            <Form.Control
              as="select"
              name="englishTestType"
              value={formData.englishTestType}
              onChange={handleChange}
            >
              <option>Select</option>
              <option>IELTS</option>
              <option>TOEFL</option>
            </Form.Control>
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label>{renderFieldLabel("📊", "Test Score")}</Form.Label>
            <Form.Control
              type="text"
              name="testScore"
              value={formData.testScore}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label>{renderFieldLabel("📅", "Test Date")}</Form.Label>
            <Form.Control
              type="date"
              name="testDate"
              value={formData.testDate}
              onChange={handleChange}
            />
          </Form.Group>
          <div className="navigation-buttons">
            <Button onClick={handlePrevious}>Previous</Button>
            <Button onClick={handleNext}>Next</Button>
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <h4 className="section-title">📄 Document Uploads</h4>
          {renderUploadCard(
            "🛂",
            "Passport Scan",
            "passportScan",
            "PDF or JPG, max 5MB"
          )}
          {renderUploadCard(
            "🏥",
            "Medical Certificate",
            "medicalCertificate",
            "PDF only, max 5MB"
          )}
          {renderUploadCard(
            "🏠",
            "Proof of Accommodation",
            "proofOfAccommodation",
            "PDF only, max 5MB"
          )}
          <div className="navigation-buttons">
            <Button onClick={handlePrevious}>Previous</Button>
            <Button onClick={handleNext}>Next</Button>
          </div>
        </>
      )}

      {step === 5 && (
        <>
          <h4 className="section-title">📑 Admission and Visa Documents</h4>
          {renderUploadCard(
            "📃",
            "Admission Letter",
            "admissionLetter",
            "PDF only, max 5MB"
          )}
          {renderUploadCard(
            "📨",
            "Invitation Letter",
            "invitationLetter",
            "PDF only, max 5MB"
          )}
          {renderUploadCard(
            "🛂",
            "Visa Application Form",
            "visaApplicationForm",
            "PDF only, max 5MB"
          )}
          {renderUploadCard(
            "🏥",
            "Health Insurance",
            "healthInsurance",
            "PDF only, max 5MB"
          )}
          <div className="navigation-buttons">
            <Button onClick={handlePrevious}>Previous</Button>
            <Button onClick={handleNext}>Next</Button>
          </div>
        </>
      )}

      {step === 6 && (
        <>
          <h4 className="section-title">💰 Financial Documents</h4>
          {renderUploadCard(
            "🏦",
            "Bank Statements",
            "bankStatements",
            "PDF only, max 5MB"
          )}
          {renderUploadCard(
            "📝",
            "Sponsorship Letter",
            "sponsorshipLetter",
            "PDF only, max 5MB"
          )}
          <div className="navigation-buttons">
            <Button onClick={handlePrevious}>Previous</Button>
            <Button onClick={handleNext}>Next</Button>
          </div>
        </>
      )}

      {step === 7 && (
        <>
          <h4 className="section-title">✅ Review & Submit</h4>
          <p>
            Please review all your provided information and uploaded documents.
            Once you are sure, click the Submit button below.
          </p>
          <div className="navigation-buttons">
            <Button onClick={handlePrevious}>Previous</Button>
            <Button onClick={handleSubmit}>Submit Application</Button>
          </div>
        </>
      )}
    </div>
  );
};

export default MultiStepForm;

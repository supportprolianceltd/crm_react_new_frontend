import React from "react";
import usePageTitle from "../../../hooks/usecrmPageTitle";
import { CheckCircle2, ChevronRight, Play } from "lucide-react";
import "./Features.css";
import { Link } from "react-router-dom";

const Admin = () => {
  usePageTitle();

  return (
    <div className="features-page">
      {/* Hero Section */}
      <section className="features-hero-section">
        <div className="features-container features-hero-content">
          <div className="features-badge">
            <span className="features-badge-new">New</span>
            <span className="features-badge-text">Admin</span>
            <ChevronRight size={12} />
          </div>

          <h1 className="features-hero-title">Admin Module</h1>

          <p className="features-hero-description">
            The E3OS Admin Module brings all clients, staff, schedules, and
            requests into one simple dashboard, giving administrators clear,
            real-time control over daily operations
          </p>

          <Link to="/book-a-demo">
            <button className="features-btn features-btn-primary">
              Book a Demo
            </button>
          </Link>

          <div className="features-hero-bg-pattern" />
        </div>
      </section>

      {/* Video Placeholder Banner */}
      <div className="features-container features-video-banner-wrapper">
        <div className="features-video-banner">
          {/* Background decoration */}
          <div className="features-video-banner-bg-decor">
            <div className="features-blob features-blob-1"></div>
            <div className="features-blob features-blob-2"></div>
          </div>

          {/* <div className="features-video-banner-content">
                <h3 className="features-video-title">E30S <br/> Crash Course</h3>
                <p className="features-video-subtitle">in 20 mins</p>
                </div> */}

          <div>
            <img src="./admin-hero.jpg" alt="admin-hero" />
          </div>

          <div className="features-video-overlay">
            {/* <div className="features-play-button-large">
                    <Play size={32} className="features-play-icon" fill="currentColor" />
                </div> */}
          </div>

          {/* Simulated UI elements */}
          {/* <div className="features-video-ui-bar">
                    <div className="features-video-progress-bar">
                        <div className="features-video-progress-fill"></div>
                    </div>
                </div> */}
        </div>
      </div>

      {/* Comparison Section */}
      <section className="features-section features-comparison-section">
        <div className="elements-container">
          <div className="features-grid-2-col">
            {/* Pain Points */}
            <div className="features-card features-pain-card">
              <h3 className="features-card-title">Pain Points</h3>
              <ul className="features-feature-list features-pain-list">
                {[
                  "Disconnected Client Information",
                  "Poor visibility into employee activity",
                  "Inaccurate attendance and visit tracking",
                  "Unstructured request handling",
                  "Limited audit readiness and reporting",
                ].map((item, i) => (
                  <li key={i}>
                    <div className="features-bullet-dot" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What It Does */}
            <div className="features-card features-gain-card">
              <h3 className="features-card-title">What It Does</h3>
              <ul className="features-feature-list features-gain-list">
                {[
                  "Client Management",
                  "Employee Management",
                  "Visits & Attendance Management",
                  "Request Management",
                  "Audit & Reporting",
                ].map((item, i) => (
                  <li key={i}>
                    <div className="features-bullet-dot" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="features-section features-how-it-works-section">
        <div className="elements-container">
          <h2 className="features-section-title">How it works</h2>

          <div className="features-steps-container">
            {/* Step 1 */}
            <div className="features-step-row">
              <div className="features-step-content">
                <h3 className="features-step-title">Client Management</h3>
                <ul className="features-check-list">
                  {[
                    "Centralizes all client details in one secure profile",
                    "Stores care needs, service history, and assigned carers",
                    "Tracks client status, visits, and ongoing services in real time",
                    "Links each client to requests, schedules, and attendance records",
                  ].map((item, i) => (
                    <li key={i}>
                      <CheckCircle2 className="features-check-icon" size={24} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="features-step-media">
                <div className="features-media-placeholder">
                  <div>
                    <img src="./admin-card.png" alt="admin-card" />
                  </div>
                  {/* <div className="features-play-button-small">
                            <Play size={24} className="features-play-icon" fill="currentColor" />
                        </div> */}
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="features-step-row features-reverse-mobile">
              <div className="features-step-media">
                <div className="features-media-placeholder">
                  <div>
                    <img src="./admin-card.png" alt="admin-card" />
                  </div>
                  {/* <div className="features-play-button-small">
                            <Play size={24} className="features-play-icon" fill="currentColor" />
                        </div> */}
                </div>
              </div>
              <div className="features-step-content">
                <h3 className="features-step-title">Employee Management</h3>
                <ul className="features-check-list">
                  {[
                    "Centralizes all employee details in one secure profile",
                    "Tracks attendance, assigned visits, and work history",
                    "Manages onboarding documents and compliance records",
                    "Provides quick access to performance and activity insights",
                  ].map((item, i) => (
                    <li key={i}>
                      <CheckCircle2 className="features-check-icon" size={24} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="features-step-row">
              <div className="features-step-content">
                <h3 className="features-step-title">Request Management</h3>
                <ul className="features-check-list">
                  {[
                    "Handles both internal and external requests seamlessly",
                    "Enables quick review, approval, or reassignment of requests",
                    "Tracks request progress from submission to completion",
                    "Reduces back-and-forth communication and manual follow-ups",
                  ].map((item, i) => (
                    <li key={i}>
                      <CheckCircle2 className="features-check-icon" size={24} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="features-step-media">
                <div className="features-media-placeholder">
                  <div>
                    <img src="./admin-hero.jpg" alt="admin-card" />
                  </div>
                  {/* <div className="features-play-button-small">
                            <Play size={24} className="features-play-icon" fill="currentColor" />
                        </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="features-section features-cta-section">
        <div className="features-container features-text-center">
          <h2 className="features-section-title">
            Your Operational Command Center
          </h2>
          <p className="features-cta-description">
            Oversee staff, clients, attendance, and requests with clarity,
            structure, and real-time insights.
          </p>
          <Link to="/book-a-demo">
            <button className="features-btn features-btn-primary">
              Book a Demo
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Admin;

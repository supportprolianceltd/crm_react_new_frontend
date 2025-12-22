import React from "react";
import { Link } from "react-router-dom";
import usePageTitle from "../../../hooks/usecrmPageTitle";
import { CheckCircle2, ChevronRight, Play } from "lucide-react";
import "./Features.css";

const AuditCompliance = () => {
  usePageTitle();

  return (
    <div className="features-page">
      {/* Hero Section */}
      <section className="features-hero-section">
        <div className="features-container features-hero-content">
          <div className="features-badge">
            <span className="features-badge-new">New</span>
            <span className="features-badge-text">Audit & Compliance</span>
            <ChevronRight size={12} />
          </div>

          <h1 className="features-hero-title">
            Built-In Compliance. Complete Audit Confidence.
          </h1>

          <p className="features-hero-description">
            Monitor audits, employee readiness, and operations in real
            time—without manual tracking or guesswork.
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
            <img src="./preview.png" alt="preview" />
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
                  "Unclear compliance oversight",
                  "Unclear compliance oversight",
                  "Delayed detection of breaches",
                  "Unmanaged risks across operations",
                  "Fragmented incident trackingFragmented incident tracking",
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
                  "Compliance Monitoring",
                  "Audit Trails",
                  "Minimizes travel time",
                  "Risk Management",
                  "Incident Logging",
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
                <h3 className="features-step-title">Compliance Monitoring</h3>
                <ul className="features-check-list">
                  {[
                    "Automatically monitors if processes and staff actions meet compliance standards.",
                    "Notifies managers when something doesn’t follow the rules.",
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
                    <img src="./preview.png" alt="preview" />
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
                    <img src="./preview.png" alt="preview" />
                  </div>
                  {/* <div className="features-play-button-small">
                        <Play size={24} className="features-play-icon" fill="currentColor" />
                    </div> */}
                </div>
              </div>
              <div className="features-step-content">
                <h3 className="features-step-title">Audit Trails</h3>
                <ul className="features-check-list">
                  {[
                    "Automatically records all key actions and changes across the system",
                    "Logs who did what, when it happened, and what was changed",
                    "Keeps a clear, time-stamped history for staff, clients, and workflows",
                    "Ensures accountability and transparency across all operations",
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
                <h3 className="features-step-title">Manage Requests</h3>
                <ul className="features-check-list">
                  {[
                    "Allows employees to submit requests from one central place",
                    "Supports common requests like leave, schedule changes, and approvals",
                    "Provides clear status updates so nothing gets lost or delayed",
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
                    <img src="./preview.png" alt="preview" />
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
            Stay Compliant. Reduce Risk. Simplify Audits
          </h2>
          <p className="features-cta-description">
            Monitor compliance, track incidents, and detect breaches—all in one
            intelligent system
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

export default AuditCompliance;

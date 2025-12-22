import React from "react";
import { Link } from "react-router-dom";
import usePageTitle from "../../../hooks/usecrmPageTitle";
import { CheckCircle2, ChevronRight, Play } from "lucide-react";
import "./Features.css";

const HumanResources = () => {
  usePageTitle();

  return (
    <div className="features-page">
      {/* Hero Section */}
      <section className="features-hero-section">
        <div className="features-container features-hero-content">
          <div className="features-badge">
            <span className="features-badge-new">New</span>
            <span className="features-badge-text">Human Resources</span>
            <ChevronRight size={12} />
          </div>

          <h1 className="features-hero-title">
            Intelligent Human Resource, Built for Compliance and Performance
          </h1>

          <p className="features-hero-description">
            The E3OS Human Resource management system is an intelligent HR
            management system that centralizes employee data, automates key
            processes, and supports perfomance tracking and documentation. Built
            for high compliance environment, it ensures accuracy, transparency,
            and regulatory adherence while offering user friendly workspace and
            analytics that enhance workforce management and overall
            organizational efficiency.
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
            <img src="./hr-hero.png" alt="recruitment-hero" />
          </div>

          <div className="features-video-overlay">
            {/* <div className="features-play-button-large">
                <Play size={32} className="features-play-icon" fill="currentColor" />
              </div> */}
          </div>

          {/* Simulated UI elements */}
          <div className="features-video-ui-bar">
            <div className="features-video-progress-bar">
              <div className="features-video-progress-fill"></div>
            </div>
          </div>
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
                  "Employee information scattered across systems",
                  "Limited visibility into employee performance",
                  "Manual and slow request handling",
                  "Missed document expiries and compliance risks",
                  "Inefficient and paper-heavy onboarding processes",
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
                  "Centralizes staff profiles",
                  "Tracks employee performance",
                  "Manages requests",
                  "Automates document expiries",
                  "Supports digital onboarding with documents",
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
                <h3 className="features-step-title">
                  Centralizes Staff Profiles
                </h3>
                <ul className="features-check-list">
                  {[
                    "Brings all employee information into one secure, organised profile",
                    "Keeps records updated in real time as changes happen",
                    "Makes staff information easy to find, review, and manage",
                    "Ensures the right people always have access to the right information",
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
                    <img src="./hr-hero.png" alt="recruitment-hero" />
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
                    <img src="./hr-hero.png" alt="recruitment-hero" />
                  </div>
                  {/* <div className="features-play-button-small">
                        <Play size={24} className="features-play-icon" fill="currentColor" />
                    </div> */}
                </div>
              </div>
              <div className="features-step-content">
                <h3 className="features-step-title">
                  Tracks Employee Perfomance
                </h3>
                <ul className="features-check-list">
                  {[
                    "Records attendance, task completion, and work consistency automatically",
                    "Provides clear visibility into individual and team performance over time",
                    "Helps managers recognise high performers and address issues early",
                    "Creates a transparent performance history for growth and accountability",
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
                    <img src="./hr-hero.png" alt="recruitment-hero" />
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
            One HR Platform. Complete Workforce Visibility.
          </h2>
          <p className="features-cta-description">
            E3OS HR centralises employee management, automates critical
            processes, and ensures compliance at every stage. Gain clarity,
            consistency, and confidence in how your workforce is managed —
            without the operational complexity.
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

export default HumanResources;

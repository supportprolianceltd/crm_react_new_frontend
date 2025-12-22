import React from "react";
import { Link } from "react-router-dom";
import usePageTitle from "../../../hooks/usecrmPageTitle";
import { CheckCircle2, ChevronRight, Play } from "lucide-react";
import "./Features.css";

const Finance = () => {
  usePageTitle();

  return (
    <div className="features-page">
      {/* Hero Section */}
      <section className="features-hero-section">
        <div className="features-container features-hero-content">
          <div className="features-badge">
            <span className="features-badge-new">New</span>
            <span className="features-badge-text">Finance</span>
            <ChevronRight size={12} />
          </div>

          <h1 className="features-hero-title">
            Smart AI Finance That Ensures Every Shift Is Covered
          </h1>

          <p className="features-hero-description">
            The E3OS Finance Module is an AI-powered scheduling system that
            automatically matches staff to client visits based on skills,
            availability, location, compliance, and continuity-of-care needs. It
            provides real-time visibility of shifts, workloads, and gaps
            ensuring efficient operations, full coverage, and consistently
            reliable service delivery.
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
                  "Inefficient and Time-Consuming Schedule Planning",
                  "Difficulty Matching the Right Carers to the Right Clients",
                  "Excessive Travel Time for Carers",
                  "Increasing Risk of Compliance Violations",
                  "Tracks No Clear Visibility of Carer Availability",
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
                  "Creates efficient daily and weekly schedules.",
                  "Assigns the most suitable carers to clients.",
                  "Minimizes travel time",
                  "Maintains compliance",
                  "Tracks availability",
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
                  Assigns the best carer to client
                </h3>
                <ul className="features-check-list">
                  {[
                    "Understands client needs and highlights carers who best match required care types/members",
                    "Prioritizes qualified carers based on relevant skills, training, and certifications.",
                    "Checks real-time availability to ensure carers selected are free for the visit.",
                    "Ranks carers intelligently, making it easy for coordinators to choose the best match.",
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
                <h3 className="features-step-title">
                  Creates Efficient and Weekly Schedules
                </h3>
                <ul className="features-check-list">
                  {[
                    "Provides clear, easy-to-follow schedules for both coordinators and carers.",
                    "Maintains continuity of care while optimizing daily and weekly planning.",
                    "Groups nearby visits together to reduce unnecessary travel and delays.",
                    "Balances workloads across carers to avoid burnout and uneven schedules.",
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
                <h3 className="features-step-title">Application Management</h3>
                <ul className="features-check-list">
                  {[
                    "Collects and organises all applications in one central workspace",
                    "Automatically links candidates to the right job roles and requests",
                    "Provides clear visibility into application status at every stage",
                    "Helps recruitment teams act faster without losing quality",
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
            Smarter Finance starts here
          </h2>
          <p className="features-cta-description">
            From intelligent scheduling to real-time availability and compliance
            checks, E3OS removes the complexity from Finance so your teams can
            focus on delivering quality care.
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

export default Finance;

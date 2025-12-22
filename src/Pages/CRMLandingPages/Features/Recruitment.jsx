import React from "react";
import { Link } from "react-router-dom";
import usePageTitle from "../../../hooks/usecrmPageTitle";
import { CheckCircle2, ChevronRight, Play } from "lucide-react";
import "./Features.css";

const Recruitment = () => {
  usePageTitle();

  return (
    <div className="features-page">
      {/* Hero Section */}
      <section className="features-hero-section">
        <div className="features-container features-hero-content">
          <div className="features-badge">
            <span className="features-badge-new">New</span>
            <span className="features-badge-text">Recruitment</span>
            <ChevronRight size={12} />
          </div>

          <h1 className="features-hero-title">
            From Job Request to Onboarding — All in One Place
          </h1>

          <p className="features-hero-description">
            The E3OS Recruitment Module streamlines the complete hiring process,
            covering job requests, applications, candidate evaluation, and
            onboarding. It maintains compliance and structured workflows for job
            advertising, shortlisting, interviews, and verification, enabling
            recruitment teams to make timely, well-informed, and effective
            hiring decisions
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
            <img src="./recruitment-hero.png" alt="recruitment-hero" />
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
      <section className="features-section `features-comparison-section`">
        <div className="elements-container">
          <div className="features-grid-2-col">
            {/* Pain Points */}
            <div className="features-card features-pain-card">
              <h3 className="features-card-title">Pain Points</h3>
              <ul className="features-feature-list features-pain-list">
                {[
                  "Hiring requests are often informal, unclear, or poorly tracked",
                  "Poorly managed adverts attract unqualified candidates",
                  "Recruiters struggle to track candidate status and progress",
                  "Lack of structure leads to inconsistent interview experiences",
                  "Teams lack confidence that hires meet required standards",
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
                  "Job Requisition Management",
                  "Job Advert Management",
                  "Application Management",
                  "Interview Coordination",
                  "Compliance Check",
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
                <h3 className="features-step-title">Job Requisition</h3>
                <ul className="features-check-list">
                  {[
                    "Centralizes all job requests in one clear, structured workflow",
                    "Ensures every request follows an approval process before hiring begins",
                    "Aligns hiring needs with real staffing demand",
                    "Provides visibility into open, pending, and approved requisitions",
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
                    <img src="./recruitment-hero.png" alt="recruitment-hero" />
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
                    <img
                      src="./recruitment-job-ad.png"
                      alt="recruitment-hero"
                    />
                  </div>
                  {/* <div className="features-play-button-small">
                        <Play size={24} className="features-play-icon" fill="currentColor" />
                    </div> */}
                </div>
              </div>
              <div className="features-step-content">
                <h3 className="features-step-title">Job Advert Management</h3>
                <ul className="features-check-list">
                  {[
                    "Creates and manages job adverts from approved requisitions in one place",
                    "Ensures job postings are clear, consistent, and role-specific",
                    "Keeps adverts up to date as roles, requirements, or availability change",
                    "Tracks active, paused, and closed job adverts at a glance",
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
                    <img
                      src="./recruitment-job-ad.png"
                      alt="recruitment-hero"
                    />
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
            Hire Faster. Hire Smarter. Stay Compliant.
          </h2>
          <p className="features-cta-description">
            Hire the right talent faster. Streamline requests, approvals, and
            compliant hiring—all in one system. Book a demo today
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

export default Recruitment;

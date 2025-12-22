import React from "react";

import "./About.css";
import {
  InfoIcon,
  LayoutDashboardIcon,
  ShieldCheckIcon,
  ShieldIcon,
  SparklesIcon,
} from "lucide-react";

const About = () => {
  return (
    <div className="about-container">
      <div className="features-container features-hero-content">
        <div className="about-top">
          <h1 className="features-hero-title">About E3OS</h1>
        </div>

        <div className="features-hero-bg-pattern" />
      </div>

      <div className="about-intro-section">
        <p className="about-description">
          E3OS is a powerful platform that centralizes operations for
          healthcare, staffing, and service organizations. By automating
          workflows and maintaining accurate, up-to-date records, the platform
          reduces manual administrative tasks and minimizes errors, enabling
          organizations to focus on strategic objectives.
        </p>
      </div>

      <div className="about-grid">
        <div className="about-card">
          <div className="about-card-icon-wrapper icon-bg-purple">
            <LayoutDashboardIcon className="about-card-icon icon-text-purple" />
          </div>
          <h3 className="about-card-title">Seamless Operations</h3>
          <p className="about-card-text">
            Featuring modules like Recruitment, HR, Payroll, Rostering, Finance,
            Asset Management, and Audit & Compliance. E3OS provides a unified
            system to efficiently manage staff, clients, schedules, internal &
            external requests, financial processes, and regulatory obligations.
          </p>
        </div>

        <div className="about-card">
          <div className="about-card-icon-wrapper icon-bg-emerald">
            <SparklesIcon className="about-card-icon icon-text-emerald" />
          </div>
          <h3 className="about-card-title">Real-time Insights</h3>
          <p className="about-card-text">
            E3OS delivers real-time insights through intuitive dashboards,
            supporting informed decision-making and enhancing overall
            operational visibility. Centralizing information improves
            collaboration and enhances user experience.
          </p>
        </div>
      </div>
      <div className="about-card-large">
        <div className="about-card-icon-wrapper icon-bg-emerald">
          <ShieldIcon className="about-card-icon icon-text-emerald" />
        </div>
        <h3 className="about-card-title">Security & Compliance</h3>
        <p className="about-card-text">
          The platform prioritizes data security and compliance, employing
          advanced measures such as encryption, multi-factor authentication, and
          role-based access to protect sensitive information and ensure audit
          readiness. It also supports regulatory compliance by maintaining
          transparent records, tracking changes, and providing audit-ready
          documentation across all modules.
        </p>
      </div>
    </div>
  );
};

export default About;

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

const faqData = [
  {
    question: "What industries does this CRM platform support?",
    answer:
      "Our CRM platform is designed to serve a broad range of industries, including healthcare, recruitment, finance, HR, and sectors requiring strict compliance. Its modular design allows organizations to tailor the system to specific workflows and operational needs across different verticals.",
  },
  {
    question: "Is the system multi-tenant and scalable for enterprise use?",
    answer:
      "Yes, the platform is built on a multi-tenant, microservices architecture that enables organizations of all sizes to scale effortlessly. Whether you're a startup or a global enterprise, our cloud-native infrastructure ensures optimal performance, uptime, and resource allocation across tenants.",
  },
  {
    question: "Does the platform support international teams?",
    answer:
      "Absolutely. We support internationalization (i18n) out of the box, allowing organizations to localize the platform for various regions, including language support, time zones, currency formats, and region-specific compliance settings, making it ideal for global workforces.",
  },
  {
    question: "Can I integrate it with our existing systems?",
    answer:
      "Yes. The platform includes well-documented, RESTful integration APIs that support seamless data exchange with third-party systems such as payroll, ERP, identity management, background check services, and more. This ensures smooth workflow continuity and minimal disruption to existing operations.",
  },
  {
    question: "How does AI improve recruitment on this platform?",
    answer:
      "The platform uses AI and machine learning to streamline recruitment by automatically screening resumes, ranking candidates based on skill match, predicting candidate success, and optimizing interview scheduling. This significantly reduces hiring time and improves the quality of hires.",
  },
  {
    question: "What kind of analytics does the platform provide?",
    answer:
      "Our advanced analytics module provides real-time dashboards, KPI tracking, forecasting tools, and compliance reporting. Users can customize reports, drill down into metrics like team performance, hiring pipelines, audit logs, and financial trends to make data-driven decisions.",
  },
  {
    question: "Is mobile access supported?",
    answer:
      "Yes, the system is built using a mobile-first design philosophy, ensuring a fully responsive and intuitive interface on smartphones, tablets, and other mobile devices. This empowers users to access critical features and workflows on the go without compromising functionality.",
  },
  {
    question: "How secure is the system?",
    answer:
      "Security is a top priority. The platform enforces granular, role-based access control, supports encrypted data transmission, maintains detailed audit trails, and adheres to enterprise-grade compliance standards such as GDPR and HIPAA. Multi-factor authentication and regular security audits are also in place.",
  },
  {
    question: "Can I manage HR functions from this platform?",
    answer:
      "Yes, the platform provides a full suite of HR tools, including employee onboarding, training management, time-off tracking, performance reviews, and workforce analytics. It simplifies administrative tasks while improving visibility into team engagement and compliance.",
  },
  {
    question: "Does the platform support compliance automation?",
    answer:
      "Definitely. The platform is built to automate compliance by tracking certifications, managing regulatory documents, alerting on expirations or policy changes, and generating audit-ready reports. This reduces manual effort, lowers risk, and keeps your organization aligned with industry regulations.",
  },
];

const FAQSlider = () => {
  const [index, setIndex] = useState(0);

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % faqData.length);
  };

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + faqData.length) % faqData.length);
  };

  const handleDotClick = (i) => {
    setIndex(i);
  };

  return (
    <div className="faq-container">
      <h2 className="faq-heading mid-text">Frequently Asked Questions</h2>

      <div className="faq-slide-wrapper">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="faq-slide"
          >
            <h3 className="faq-question">{faqData[index].question}</h3>
            <p className="faq-answer">{faqData[index].answer}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="faq-dots">
        {faqData.map((_, i) => (
          <button
            key={i}
            onClick={() => handleDotClick(i)}
            className={`dot ${i === index ? "active" : ""}`}
            aria-label={`Go to FAQ ${i + 1}`}
          />
        ))}
      </div>

      <div className="faq-buttons">
        <button onClick={handlePrev} className="faq-btn prev-btn">
          <ChevronLeftIcon />
        </button>
        <button onClick={handleNext} className="faq-btn next-btn">
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
};

export default FAQSlider;

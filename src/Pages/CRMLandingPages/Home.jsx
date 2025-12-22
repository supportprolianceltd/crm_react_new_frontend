// src/components/Home.js
import React from "react";
import { Link } from "react-router-dom";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import HeroBanner from "../../assets/Img/hero-img.png";
import DisplayHero from "/Display-Hero.png";
import { IoIosArrowDown } from "react-icons/io";

import AdminIcon from "../../assets/icons/AdminIcon";
import HumanResourcesIcon from "../../assets/icons/HumanResourcesIcon";
import PayrollIcon from "../../assets/icons/PayrollIcon";
import TrainingIcon from "../../assets/icons/TrainingIcon";
import AuditComplianceIcon from "../../assets/icons/AuditComplianceIcon";
import FinanceIcon from "../../assets/icons/FinanceIcon";
import RecruitmentIcon from "../../assets/icons/RecruitmentIcon";
import RosteringIcon from "../../assets/icons/RosteringIcon";
import ChatIcon from "../../assets/Img/chat-icon.png";
import MessageIcon from "../../assets/icons/MessageIcon";
import SupportChat from "./SupportChat";

function Home() {
  const [openIndex, setOpenIndex] = React.useState(0);
  const [chatOpen, setChatOpen] = React.useState(false);
  const chatRef = React.useRef(null);

  React.useEffect(() => {
    function handleOutside(e) {
      if (chatRef.current && !chatRef.current.contains(e.target)) {
        setChatOpen(false);
      }
    }

    function handleEsc(e) {
      if (e.key === "Escape") setChatOpen(false);
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <div className="homepage-container">
      <header className="crm-hero-sec">
        <div className="hero-container">
          <div className="crm-hero">
            <h1 className="hero-text">
              All-in-One ERP{" "}
              <span className="big-text-color">for Smarter Workforce</span> &
              Care Management
            </h1>
            <p className="hero-small-text">
              8 connected modules — from HR to AI-powered rostering — built to
              simplify operations for modern businesses and healthcare
              providers.
            </p>

            <div className="hero-btns">
              {/* <Link to="/login">
                <button className="hero-trial-btn">Start Trial</button>
              </Link> */}
              <Link to="/book-a-demo">
                <button className="hero-demo-btn">
                  Request for Demo
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="8"
                    height="11"
                    viewBox="0 0 8 11"
                    fill="none"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M0.405377 0.0804408C0.653818 -0.0486197 0.95112 -0.0207676 1.17333 0.152385L7.04 4.72381C7.22466 4.8677 7.33333 5.09352 7.33333 5.33333C7.33333 5.57315 7.22466 5.79897 7.04 5.94286L1.17333 10.5143C0.95112 10.6874 0.653818 10.7153 0.405377 10.5862C0.156935 10.4572 0 10.1933 0 9.90476V0.761909C0 0.473321 0.156935 0.209501 0.405377 0.0804408ZM1.46667 2.28572V8.38095L5.37778 5.33333L1.46667 2.28572Z"
                      fill="white"
                    />
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        </div>

        <SupportChat />

        <section className="hero-bannner">
          <img src={DisplayHero} />
        </section>
      </header>

      {/* <section className="items-centered">
        <p className="sub-texts">Trusted by top Companies</p>
        <div className="trusted-companies-logos">
          <img src={CompanyLogo1} alt="company-logo1" />
          <img src={CompanyLogo2} alt="company-logo2" />
          <img src={CompanyLogo3} alt="company-logo3" />
          <img src={CompanyLogo4} alt="company-logo4" />
          <img src={CompanyLogo5} alt="company-logo5" />
          <img
            className="Fritop-Nav-Mobile"
            src={CompanyLogo6}
            alt="company-logo6"
          />
        </div>
      </section>  */}

      <section className="items-centered">
        <p className="mid-texts">
          Everything you need to manage your workforce efficiently
        </p>
        <p className="mid-title">8 Powerful Modules, One Platform</p>
      </section>

      <section className="products-section">
        <div className="product-card">
          <Link to="/admin">
            <div className="product-icon-container">
              {" "}
              <AdminIcon />
            </div>
            <p className="product-title">System Administrator</p>
            <p className="product-desc">Manage users, access and settings</p>
          </Link>
        </div>

        <div className="product-card">
          <Link to="/recruitment">
            <div className="product-icon-container">
              {" "}
              <RecruitmentIcon />{" "}
            </div>
            <p className="product-title">Recruitment</p>
            <p className="product-desc">Simplify hiring and onboarding.</p>
          </Link>
        </div>

        <div className="product-card">
          <Link to="human-resources">
            <div className="product-icon-container">
              {" "}
              <HumanResourcesIcon />
            </div>
            <p className="product-title">Human Resources</p>
            <p className="product-desc">
              Track employee data, attendance, and benefits.
            </p>
          </Link>
        </div>

        <div className="product-card">
          <Link to="/rostering">
            <div className="product-icon-container">
              {" "}
              <RosteringIcon />{" "}
            </div>
            <p className="product-title">Rostering</p>
            <p className="product-desc">
              Automate payments, deductions, and slips.
            </p>
          </Link>
        </div>

        {/* <div className="product-card">
          <div className="product-icon-container">
            {" "}
            <PayrollIcon />{" "}
          </div>
          <p className="product-title">Payroll</p>
          <p className="product-desc">
            Automate payments, deductions, and slips.
          </p>
        </div> */}

        <div className="product-card">
          <Link to="/finance">
            <div className="product-icon-container">
              {" "}
              <FinanceIcon />{" "}
            </div>
            <p className="product-title">Finance</p>
            <p className="product-desc">
              Payroll system, monitor budgets, invoices, and expenses
            </p>
          </Link>
        </div>

        <div className="product-card">
          <Link to="/training">
            <div className="product-icon-container">
              {" "}
              <TrainingIcon />{" "}
            </div>
            <p className="product-title">Training</p>
            <p className="product-desc">
              Manage courses, learners, and certificates
            </p>
          </Link>
        </div>

        <div className="product-card">
          <Link to="/audit-compliance">
            <div className="product-icon-container">
              {" "}
              <AuditComplianceIcon />{" "}
            </div>
            <p className="product-title">Audit & Compliance</p>
            <p className="product-desc">
              Stay legally aligned and inspection-ready.
            </p>
          </Link>
        </div>

        <div className="product-card">
          <Link to="/assets-management">
            <div className="product-icon-container">
              {" "}
              <AuditComplianceIcon />{" "}
            </div>
            <p className="product-title">Assets Management</p>
            <p className="product-desc">
              Smart AI Assets Management That Ensures Every Shift Is Covered
            </p>
          </Link>
        </div>
      </section>

      <section className="features-sec items-centered">
        <p className="mid-texts">
          Everything you need to manage your workforce efficiently
        </p>
        <p className="mid-title">Smarter Scheduling with AI</p>

        <div className="crm-features-section">
          <div className="feature-card feature-card-one">
            <p>Suggests carers based on skill, availability, distance</p>
          </div>
          <div className="feature-card feature-card-two">
            <p>Minimises travel time and improves utilisation</p>
          </div>
          <div className="feature-card feature-card-three">
            <p>Dynamic re-clustering when schedules change</p>
          </div>
        </div>

        <div className="video-banner">
          <img src="/video-banner.png" alt="tutorial-video" />
        </div>
      </section>

      <section className="items-centered">
        <p className="mid-texts">Solutions</p>
        <p className="mid-title">Problems E3OS Solves</p>
      </section>

      <section className="solution-section">
        <div className="solution-card">
          <div className="solution-icon-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
            >
              <path
                d="M14.75 3.75C14.75 2.81812 14.75 2.35218 14.9022 1.98463C15.1052 1.49458 15.4946 1.10523 15.9846 0.902241C16.3522 0.75 16.8181 0.75 17.75 0.75C18.6819 0.75 19.1478 0.75 19.5154 0.902241C20.0054 1.10523 20.3948 1.49458 20.5978 1.98463C20.75 2.35218 20.75 2.81812 20.75 3.75V7.75C20.75 8.68188 20.75 9.14782 20.5978 9.51537C20.3948 10.0054 20.0054 10.3948 19.5154 10.5978C19.1478 10.75 18.6819 10.75 17.75 10.75C16.8181 10.75 16.3522 10.75 15.9846 10.5978C15.4946 10.3948 15.1052 10.0054 14.9022 9.51537C14.75 9.14782 14.75 8.68188 14.75 7.75V3.75Z"
                stroke="#EB41FF"
                stroke-width="1.5"
              />
              <path
                d="M14.75 17.75C14.75 16.8181 14.75 16.3522 14.9022 15.9846C15.1052 15.4946 15.4946 15.1052 15.9846 14.9022C16.3522 14.75 16.8181 14.75 17.75 14.75C18.6819 14.75 19.1478 14.75 19.5154 14.9022C20.0054 15.1052 20.3948 15.4946 20.5978 15.9846C20.75 16.3522 20.75 16.8181 20.75 17.75C20.75 18.6819 20.75 19.1478 20.5978 19.5154C20.3948 20.0054 20.0054 20.3948 19.5154 20.5978C19.1478 20.75 18.6819 20.75 17.75 20.75C16.8181 20.75 16.3522 20.75 15.9846 20.5978C15.4946 20.3948 15.1052 20.0054 14.9022 19.5154C14.75 19.1478 14.75 18.6819 14.75 17.75Z"
                stroke="#EB41FF"
                stroke-width="1.5"
              />
              <path
                d="M0.75 14.75C0.75 12.8644 0.75 11.9216 1.33579 11.3358C1.92157 10.75 2.86438 10.75 4.75 10.75H6.75C8.63562 10.75 9.57843 10.75 10.1642 11.3358C10.75 11.9216 10.75 12.8644 10.75 14.75V16.75C10.75 18.6356 10.75 19.5784 10.1642 20.1642C9.57843 20.75 8.63562 20.75 6.75 20.75H4.75C2.86438 20.75 1.92157 20.75 1.33579 20.1642C0.75 19.5784 0.75 18.6356 0.75 16.75V14.75Z"
                stroke="#EB41FF"
                stroke-width="1.5"
              />
              <path
                d="M0.75 3.75C0.75 2.81812 0.75 2.35218 0.902241 1.98463C1.10523 1.49458 1.49458 1.10523 1.98463 0.902241C2.35218 0.75 2.81812 0.75 3.75 0.75H7.75C8.68188 0.75 9.14782 0.75 9.51537 0.902241C10.0054 1.10523 10.3948 1.49458 10.5978 1.98463C10.75 2.35218 10.75 2.81812 10.75 3.75C10.75 4.68188 10.75 5.14782 10.5978 5.51537C10.3948 6.00542 10.0054 6.39477 9.51537 6.59776C9.14782 6.75 8.68188 6.75 7.75 6.75H3.75C2.81812 6.75 2.35218 6.75 1.98463 6.59776C1.49458 6.39477 1.10523 6.00542 0.902241 5.51537C0.75 5.14782 0.75 4.68188 0.75 3.75Z"
                stroke="#EB41FF"
                stroke-width="1.5"
              />
            </svg>{" "}
          </div>
          <p className="solution-title">Fragmented Systems</p>
          <p className="solution-desc">
            Teams Jugglee separate tools for HR, finance and rostering casuing
            data silos and erros
          </p>
        </div>

        <div className="solution-card">
          <div className="solution-icon-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
            >
              <path
                d="M10.75 6.75V10.75L12.25 12.25"
                stroke="#EB41FF"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M18.2954 15.2034C19.9318 16.087 20.75 16.5289 20.75 17.25C20.75 17.9711 19.9318 18.413 18.2954 19.2966L17.1811 19.8984C15.9244 20.577 15.2961 20.9163 14.9939 20.6696C14.254 20.0654 15.4067 18.5061 15.6903 17.9537C15.9777 17.394 15.9725 17.0959 15.6903 16.5463C15.4067 15.9939 14.254 14.4346 14.9939 13.8304C15.2961 13.5837 15.9244 13.923 17.1811 14.6016L18.2954 15.2034Z"
                stroke="#EB41FF"
                stroke-width="1.5"
              />
              <path
                d="M11.7761 20.698C11.4388 20.7324 11.0964 20.75 10.75 20.75C5.22715 20.75 0.75 16.2728 0.75 10.75C0.75 5.22715 5.22715 0.75 10.75 0.75C16.2728 0.75 20.75 5.22715 20.75 10.75C20.75 11.4349 20.6811 12.1038 20.55 12.75"
                stroke="#EB41FF"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>{" "}
          </div>
          <p className="solution-title">Scheduling Headaches</p>
          <p className="solution-desc">
            Coordinators spend hours matching carers to clients manually
          </p>
        </div>

        <div className="solution-card">
          <div className="solution-icon-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="21"
              height="22"
              viewBox="0 0 21 22"
              fill="none"
            >
              <path
                d="M7.25 13.25H11.25M7.25 8.25L15.25 8.25"
                stroke="#EB41FF"
                stroke-width="1.5"
                stroke-linecap="round"
              />
              <path
                d="M2.25 8.75C2.25 4.97876 2.25 3.09315 3.42157 1.92157C4.59315 0.75 6.47876 0.75 10.25 0.75L11.75 0.75C15.5212 0.75 17.4069 0.75 18.5784 1.92157C19.75 3.09315 19.75 4.97876 19.75 8.75V12.75C19.75 16.5212 19.75 18.4069 18.5784 19.5784C17.4069 20.75 15.5212 20.75 11.75 20.75H10.25C6.47876 20.75 4.59315 20.75 3.42157 19.5784C2.25 18.4069 2.25 16.5212 2.25 12.75L2.25 8.75Z"
                stroke="#EB41FF"
                stroke-width="1.5"
              />
              <path
                d="M3.25 4.75L0.75 4.75M3.25 10.75L0.75 10.75M3.25 16.75H0.75"
                stroke="#EB41FF"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>{" "}
          </div>
          <p className="solution-title">Compliance Breaches</p>
          <p className="solution-desc">
            Missed rest breaks and WTD issues risk penalties and rework.
          </p>
        </div>

        <div className="solution-card">
          <div className="solution-icon-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
            >
              <path
                d="M17.75 8.75C15.745 8.11815 13.3382 7.75 10.75 7.75C8.16179 7.75 5.75499 8.11815 3.75 8.75V12.25C5.75499 11.6182 8.16179 11.25 10.75 11.25C13.3382 11.25 15.745 11.6182 17.75 12.25V8.75Z"
                stroke="#EB41FF"
                stroke-width="1.5"
                stroke-linejoin="round"
              />
              <path
                d="M17.75 11.75V13.7732C17.75 15.9042 16.7179 17.879 15.0312 18.9754L13.6312 19.8854C11.8578 21.0382 9.64225 21.0382 7.86882 19.8854L6.46883 18.9754C4.78208 17.879 3.75 15.9042 3.75 13.7732V11.75"
                stroke="#EB41FF"
                stroke-width="1.5"
                stroke-linecap="round"
              />
              <path
                d="M17.75 8.75L18.8757 8.1571C20.1388 7.32875 20.7703 6.91457 20.7495 6.32281C20.7287 5.73105 20.07 5.37104 18.7525 4.65101L14.0253 2.06756C12.4181 1.18919 11.6145 0.75 10.75 0.75C9.88554 0.75 9.08192 1.18919 7.47468 2.06756L2.74753 4.65101C1.43004 5.37104 0.771289 5.73105 0.750497 6.32281C0.729705 6.91457 1.36125 7.32875 2.62434 8.1571L3.75 8.75"
                stroke="#EB41FF"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>{" "}
          </div>
          <p className="solution-title">Training & Onboarding Gaps</p>
          <p className="solution-desc">
            Tracking certifications and renewals by hand causes lapses.
          </p>
        </div>
      </section>

      <section className="items-centered">
        <p className="mid-texts">Get answers quickly from our FAQ</p>
        <p className="mid-title">Frequently Asked Questions</p>
      </section>

      <section className="faq-accordion">
        {(() => {
          const faqs = [
            {
              question: "What is E3OS?",
              answer: [
                "E3OS is an all-in-one Enterprise Resource Planning (ERP) platform built to help organizations especially in the healthcare and service sectors manage their operations from a single system. It brings together everything from staff management, rostering, payroll, finance, and compliance into one connected workspace.",
                "With AI-powered automation, E3OS simplifies scheduling, reduces administrative workload, and improves overall efficiency.",
              ],
            },
            {
              question: "Is my data safe with E3OS?",
              answer: [
                "E3OS is an all-in-one Enterprise Resource Planning (ERP) platform built to help organizations especially in the healthcare and service sectors manage their operations from a single system. It brings together everything from staff management, rostering, payroll, finance, and compliance into one connected workspace.",
                "With AI-powered automation, E3OS simplifies scheduling, reduces administrative workload, and improves overall efficiency.",
              ],
            },
            {
              question: "Which modules does E3OS Offer?",
              answer: [
                "E3OS is an all-in-one Enterprise Resource Planning (ERP) platform built to help organizations especially in the healthcare and service sectors manage their operations from a single system. It brings together everything from staff management, rostering, payroll, finance, and compliance into one connected workspace.",
                "With AI-powered automation, E3OS simplifies scheduling, reduces administrative workload, and improves overall efficiency.",
              ],
            },
            {
              question: "How do I get support if I encounter issues?",
              answer: [
                "E3OS is an all-in-one Enterprise Resource Planning (ERP) platform built to help organizations especially in the healthcare and service sectors manage their operations from a single system. It brings together everything from staff management, rostering, payroll, finance, and compliance into one connected workspace.",
                "With AI-powered automation, E3OS simplifies scheduling, reduces administrative workload, and improves overall efficiency.",
              ],
            },
            {
              question: "Do you offer a free trial?",
              answer: [
                "E3OS is an all-in-one Enterprise Resource Planning (ERP) platform built to help organizations especially in the healthcare and service sectors manage their operations from a single system. It brings together everything from staff management, rostering, payroll, finance, and compliance into one connected workspace.",
                "With AI-powered automation, E3OS simplifies scheduling, reduces administrative workload, and improves overall efficiency.",
              ],
            },
          ];

          return faqs.map((faq, idx) => (
            <div key={faq.question}>
              <div
                className="accordion-head"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              >
                <div className="accordion-header">
                  <InformationCircleIcon
                    className="hide-btn"
                    width={20}
                    height={20}
                  />
                  <p>{faq.question}</p>
                </div>
                <div>
                  <IoIosArrowDown
                    width={30}
                    height={30}
                    style={{
                      transform:
                        openIndex === idx ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  />
                </div>
              </div>
              {openIndex === idx && (
                <>
                  {faq.answer.map((ans, i) => (
                    <p className="accordion-desc" key={i}>
                      {ans}
                    </p>
                  ))}
                </>
              )}
            </div>
          ));
        })()}
      </section>
    </div>
  );
}

export default Home;

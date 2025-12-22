// Dashboard.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { DateTime } from "luxon";
import axios from "axios";
import CountUp from "react-countup";
import usePageTitle from "../../hooks/useMainPageTitle";
import {
  ChevronRightIcon,
  CheckIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import "./Dashboard.css";
import ScheduleTable from "./ScheduleTable";
import ComplianceCheckTable from "./ComplianceCheckTable";
import JobDecision from "./JobDecision";
import InterviewCalendar from "./InterviewCalendar";
import { API_BASE_URL } from "../../config";

// CircularProgress component
const CircularProgress = ({
  size = 70,
  strokeWidth = 6,
  percentage = 75,
  color = "#7226FF",
  number = 1,
  isActive,
  isClickable = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      className={`circular-progress ${isClickable ? "" : "non-clickable"}`}
    >
      <circle
        stroke="#ebe6ff"
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <motion.circle
        stroke={color}
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeInOut" }}
        style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="23"
        fontWeight="500"
        fill={isActive ? "#7226FF" : "#111827"}
      >
        {number}
      </text>
    </svg>
  );
};

// Alert component for Framer Motion
const Alert = ({ message, type = "success" }) => {
  return (
    <motion.div
      className={`olik-ALlter alert alert-${type}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.3 }}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        backgroundColor: type === "success" ? "#7226FF" : "#f44336",
        color: "white",
        padding: "8px 18px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        zIndex: 1000,
      }}
    >
      {message}
    </motion.div>
  );
};

// Animation variants for slide-down effect
const slideDownVariants = {
  hidden: { y: -5, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const stepTitles = [
  "Job Application",
  "Document Uploads",
  "Interview",
  "Decision",
  "Compliance Check",
];

const Dashboard = () => {
  usePageTitle("Applicant Dashboard");
  const { job_application_code, email, unique_link } = useParams();
  const [activeCard, setActiveCard] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [navigationAlert, setNavigationAlert] = useState("");

  // Calculate step percentages based on data
  const getStepPercentages = (data) => {
    if (!data) return [0, 0, 0, 0, 0];

    // Document Uploads percentage
    const documentsRequired = data.job_requisition.documents_required || [];
    const documentsUploaded = data.job_application.documents || [];
    const documentUploadPercentage =
      documentsRequired.length > 0
        ? Math.min(
            100,
            (documentsUploaded.length / documentsRequired.length) * 100
          )
        : 100;

    // Compliance Check percentage based on accepted status
    const complianceChecklist = data.job_requisition.compliance_checklist || [];
    const complianceStatus = data.job_application.compliance_status || [];

    let compliancePercentage = 0;
    if (complianceChecklist.length > 0) {
      // Count accepted items
      const acceptedCount = complianceStatus.filter(
        (statusItem) => statusItem.status === "accepted"
      ).length;
      compliancePercentage = (acceptedCount / complianceChecklist.length) * 100;
    } else {
      compliancePercentage = 100;
    }

    const isCompleted =
      data.job_application.status === "compliance_completed" ||
      data.job_application.status === "onboarded";

    const isAdvanced =
      data.job_application.status === "interviewed" ||
      data.job_application.status === "hired" ||
      data.job_application.status === "rejected";

    const isRejectedOrInterviewed =
      data.job_application.status === "rejected" ||
      data.job_application.status === "interviewed";

    return [
      100, // Job Application: Always 100% if data is fetched
      isCompleted ? 100 : documentUploadPercentage, // Document Upload
      isCompleted ? 100 : isAdvanced ? 100 : data.schedule_count > 0 ? 50 : 0, // Interview
      isCompleted
        ? 100
        : data.job_application.status === "hired" ||
          data.job_application.status === "rejected"
        ? 100
        : 0, // Decision
      isCompleted ? 100 : isRejectedOrInterviewed ? 0 : compliancePercentage, // Compliance Check: 0% if rejected or interviewed
    ];
  };

  const stepPercentages = data ? getStepPercentages(data) : [0, 0, 0, 0, 0];

  // Check if applicant should have access to Decision and Compliance Check pages
  const shouldAllowDecisionAndComplianceAccess = () => {
    if (!data) return false;

    const status = data.job_application.status;
    // Allow access if status is "hired", "rejected", "compliance_completed", or "onboarded" and documents are 100%
    return (
      (status === "hired" ||
        status === "rejected" ||
        status === "compliance_completed" ||
        status === "onboarded") &&
      stepPercentages[1] === 100
    );
  };

  const fetchApplicationData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/applications-engine/applications/code/${job_application_code}/email/${email}/with-schedules/schedules/?unique_link=${unique_link}`
      );
      setData(response.data);
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to fetch application data"
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationData();
  }, [job_application_code, email, unique_link]);

  // Calculate which step should be active based on completion
  useEffect(() => {
    if (!data) return;

    const stepPercentages = getStepPercentages(data);
    const status = data.job_application.status;

    // If status is rejected, lock to Decision card (4) only if documents 100%, else to 2
    if (status === "rejected") {
      setActiveCard(stepPercentages[1] < 100 ? 2 : 4);
      return;
    }

    // If status is "hired", lock to Decision card (4) only if documents 100%, else to 2
    if (status === "hired") {
      setActiveCard(stepPercentages[1] < 100 ? 2 : 4);
      return;
    }

    // If status is "compliance_completed" or "onboarded", lock to Compliance Check card (5) only if documents 100%, else to 2
    if (status === "compliance_completed" || status === "onboarded") {
      setActiveCard(stepPercentages[1] < 100 ? 2 : 5);
      return;
    }

    // If status is "interviewed", lock to Interview card (3) only if documents are 100%
    if (status === "interviewed") {
      setActiveCard(stepPercentages[1] < 100 ? 2 : 3);
      return;
    }

    // Find the first incomplete step (less than 100%)
    const firstIncompleteStep = stepPercentages.findIndex(
      (percentage) => percentage < 100
    );

    // If all steps are complete, stay on current step or go to first step
    if (firstIncompleteStep === -1) {
      if (activeCard === 3) setActiveCard(1); // Fix initial interview default
      return;
    }

    // Set to the first incomplete step (add 1 since steps are 1-indexed)
    setActiveCard(firstIncompleteStep + 1);
  }, [data]);

  // Calculate overall progress based on completed steps
  const calculateOverallProgress = () => {
    if (!data) return 0;

    const stepPercentages = getStepPercentages(data);
    const completedSteps = stepPercentages.filter(
      (percentage) => percentage === 100
    ).length;

    return (completedSteps / 5) * 100;
  };

  const handleChildComplianceUpdate = (responseData) => {
    const job_application = responseData.job_application || responseData;
    if (job_application) {
      setData((prev) => ({
        ...prev,
        job_application: {
          ...prev.job_application,
          ...job_application,
        },
      }));
    }
  };

  // Function to generate initials from full name
  const getInitials = (fullName) => {
    if (!fullName) return "NA";
    const nameParts = fullName
      .trim()
      .split(" ")
      .filter((part) => part);
    if (nameParts.length === 0) return "NA";
    if (nameParts.length === 1) return nameParts[0][0]?.toUpperCase() || "NA";
    return (
      `${nameParts[0][0]?.toUpperCase() || ""}${
        nameParts[nameParts.length - 1][0]?.toUpperCase() || ""
      }` || "NA"
    );
  };

  // Format interview date and time using Luxon
  const formatInterviewDateTime = (startDateTime, endDateTime, timeZone) => {
    try {
      const startDt = DateTime.fromISO(startDateTime, { zone: "UTC" }).setZone(
        timeZone
      );
      const endDt = DateTime.fromISO(endDateTime, { zone: "UTC" }).setZone(
        timeZone
      );

      if (!startDt.isValid || !endDt.isValid)
        throw new Error(`Invalid timezone: ${timeZone}`);

      return `${startDt.toFormat("M/d/yyyy, h:mm a")} - ${endDt.toFormat(
        "h:mm a"
      )} (${startDt.zoneName})`;
    } catch (error) {
      console.error(`Invalid timezone ${timeZone}:`, error);
      const startDt = DateTime.fromISO(startDateTime, { zone: "UTC" });
      const endDt = DateTime.fromISO(endDateTime, { zone: "UTC" });
      return `${startDt.toFormat("M/d/yyyy, h:mm a")} - ${endDt.toFormat(
        "h:mm a"
      )} (UTC)`;
    }
  };

  const handleCardClick = (cardNumber) => {
    // Prevent access to Interview (3) if document uploads are not 100%
    if (cardNumber === 3 && stepPercentages[1] < 100) {
      setNavigationAlert(
        "Interview section is only available after completing document uploads (100%)."
      );
      setTimeout(() => setNavigationAlert(""), 3000);
      return;
    }

    // Prevent access to Decision (4) or Compliance Check (5) if status is not "hired", "rejected", "compliance_completed", or "onboarded" or documents not 100%
    if (cardNumber === 4 || cardNumber === 5) {
      const status = data?.job_application.status;
      const documentsComplete = stepPercentages[1] === 100;
      if (
        !(
          status === "hired" ||
          status === "rejected" ||
          status === "compliance_completed" ||
          status === "onboarded"
        )
      ) {
        setNavigationAlert(
          `${
            cardNumber === 4 ? "Decision" : "Compliance Check"
          } tab is only available after a final hiring decision has been made.`
        );
        setTimeout(() => setNavigationAlert(""), 3000);
        return;
      }
      if (!documentsComplete) {
        setNavigationAlert(
          `${
            cardNumber === 4 ? "Decision" : "Compliance Check"
          } tab is only available after completing document uploads (100%).`
        );
        setTimeout(() => setNavigationAlert(""), 3000);
        return;
      }
    }

    // Additional existing restrictions
    // Prevent access to Compliance Check (5) if status is "rejected"
    if (cardNumber === 5 && data?.job_application.status === "rejected") {
      setNavigationAlert(
        "Compliance Check is disabled for rejected applications."
      );
      setTimeout(() => setNavigationAlert(""), 3000);
      return;
    }
    setActiveCard(cardNumber);
  };

  // Check if a card should be disabled
  const isCardDisabled = (cardNumber) => {
    if (!data) return false;

    // Interview card is disabled if document upload percentage < 100
    if (cardNumber === 3) {
      return stepPercentages[1] < 100;
    }

    // Decision and Compliance Check cards are disabled if status is not "hired", "rejected", "compliance_completed", or "onboarded" or documents < 100%
    if (cardNumber === 4 || cardNumber === 5) {
      return !shouldAllowDecisionAndComplianceAccess();
    }

    return false;
  };

  if (loading) {
    return (
      <div
        className="Applicant-Dashboard"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100vw",
          position: "fixed",
          top: 0,
          left: 0,
          backgroundColor: "#fff",
          fontSize: "1.5rem",
          color: "#111827",
          zIndex: 9999,
        }}
      >
        <div className="Alll_OOo_LODer">
          <div className="loader"></div>
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="Applicant-Dashboard">
        <div className="site-container">
          <p>
            Error:&nbsp;
            {error.includes("cursor")
              ? "An error occurred. Try again later"
              : error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="Applicant-Dashboard">
      <div className="site-container">
        <div className="AAPpl-NAvsb">
          <div className="AAPpl-NAvsb-Main">
            <div className="AAPpl-NAvsb-1">
              <span>
                {data ? getInitials(data.job_application.full_name) : "NA"}
              </span>
            </div>
            <div className="AAPpl-NAvsb-2">
              <h3>{data?.job_application.full_name || "N/A"}</h3>
              <p>{data?.job_application.email || "N/A"}</p>
            </div>
            <div className="AAPpl-NAvsb-3"></div>
          </div>
        </div>
        <div className="GHH-Top-GTga">
          <p>
            <Link to="/">E3OS</Link>
            <ChevronRightIcon className="chevron-icon" />
            <Link to="/application-dashboard">Applications</Link>
            <ChevronRightIcon className="chevron-icon" />
            <span>{data.job_requisition.title}</span>
          </p>
        </div>
        <div className="OLIK-NAVVVB">
          {stepTitles.map((title, index) => (
            <button
              key={index}
              className={`${activeCard === index + 1 ? "active-OLika" : ""} ${
                isCardDisabled(index + 1) ? "disabled" : ""
              }`}
              onClick={() => handleCardClick(index + 1)}
              disabled={isCardDisabled(index + 1)}
            >
              {title}
            </button>
          ))}
        </div>
        <div className="Gyhat-HG">
          <h3>{data.job_requisition.title}</h3>
          <p>
            Application Progress:&nbsp;
            <span>
              <CountUp
                end={calculateOverallProgress()}
                duration={2}
                suffix="%"
              />
            </span>
          </p>
        </div>
        <div className="oik-pa">
          <p>
            Posted by: <a href="#">{data.job_requisition.company_name}</a>
          </p>
        </div>
        <div className="GYhh-Cardss-SesC">
          {[1, 2, 3, 4, 5].map((num) => (
            <div
              key={num}
              className={`GYhh-Card ${activeCard === num ? "active" : ""} ${
                isCardDisabled(num) ? "disabled" : ""
              }`}
              onClick={() => handleCardClick(num)}
            >
              <div className="progress-Chat">
                <CircularProgress
                  percentage={stepPercentages[num - 1]}
                  color="#7226FF"
                  number={num}
                  isActive={activeCard === num}
                  isClickable={!isCardDisabled(num)}
                />
              </div>
              <p>
                <CountUp
                  end={stepPercentages[num - 1]}
                  duration={2}
                  suffix="%"
                />{" "}
                {stepTitles[num - 1]}
              </p>
            </div>
          ))}
        </div>
        <AnimatePresence>
          {showAlert && <Alert message="Link copied" />}
          {navigationAlert && <Alert message={navigationAlert} type="error" />}
        </AnimatePresence>

        {/* Card 1: Job Application */}
        {activeCard === 1 && (
          <motion.div
            className="OL-Boxas"
            variants={slideDownVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="OL-Boxas-Top">
              <h3>
                Job Application&nbsp;
                <span>
                  Progress: 100%&nbsp;
                  <b className="completed">
                    Completed <CheckIcon className="w-4 h-4 ml-1" />
                  </b>
                </span>
              </h3>
              <p>
                You've successfully completed the first phase of your
                application for the {data.job_requisition.title} role.
              </p>
            </div>
            <div className="OL-Boxas-Body">
              <div className="Ol-Boxxx-Forms">
                <div className="Gr or-INpu-Grid">
                  <div className="GHuh-Form-Input">
                    <label>
                      Full Name
                      <span className="label-Sopppan">
                        Checked <CheckIcon className="w-4 h-4 ml-1" />
                      </span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={data.job_application.full_name}
                      readOnly
                    />
                  </div>
                  <div className="GHuh-Form-Input">
                    <label>
                      Email Address
                      <span className="label-Sopppan">
                        Checked <CheckIcon className="w-4 h-4 ml-1" />
                      </span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={data.job_application.email}
                      readOnly
                    />
                  </div>
                </div>
                <div className="Grga-INpu-Grid">
                  <div className="GHuh-Form-Input">
                    <label>
                      Phone Number
                      <span className="label-Sopppan">
                        Checked <CheckIcon className="w-4 h-4 ml-1" />
                      </span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={data.job_application.phone || "N/A"}
                      readOnly
                    />
                  </div>
                  <div className="GHuh-Form-Input">
                    <label>
                      Date of Birth
                      <span className="label-Sopppan">
                        Checked <CheckIcon className="w-4 h-4 ml-1" />
                      </span>
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={data.job_application.date_of_birth || ""}
                      readOnly
                    />
                  </div>
                </div>
                <div className="Grga-INpu-Grid">
                  <div className="GHuh-Form-Input">
                    <label>
                      Qualification
                      <span className="label-Sopppan">
                        Checked <CheckIcon className="w-4 h-4 ml-1" />
                      </span>
                    </label>
                    <input
                      type="text"
                      name="qualification"
                      value={data.job_application.qualification || "N/A"}
                      readOnly
                    />
                  </div>
                  <div className="GHuh-Form-Input">
                    <label>
                      Experience
                      <span className="label-Sopppan">
                        Checked <CheckIcon className="w-4 h-4 ml-1" />
                      </span>
                    </label>
                    <input
                      type="text"
                      name="experience"
                      value={data.job_application.experience || "N/A"}
                      readOnly
                    />
                  </div>
                </div>
                <div className="Grga-INpu-Grid">
                  <div className="GHuh-Form-Input">
                    <label>
                      Knowledge/Skill
                      <span className="label-Sopppan">
                        Checked <CheckIcon className="w-4 h-4 ml-1" />
                      </span>
                    </label>
                    <input
                      type="text"
                      name="knowledgeSkill"
                      value={data.job_application.knowledge_skill || "N/A"}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Card 2: Document Uploads */}
        {activeCard === 2 && (
          <motion.div
            className="OL-Boxas"
            variants={slideDownVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="OL-Boxas-Top">
              <h3>
                Document Uploads{" "}
                <span>
                  Progress: {stepPercentages[1]}%{" "}
                  <b
                    className={
                      stepPercentages[1] === 100 ? "completed" : "pending"
                    }
                  >
                    {stepPercentages[1] === 100 ? "Completed" : "Pending"}{" "}
                    <CheckIcon className="w-4 h-4 ml-1" />
                  </b>
                </span>
              </h3>
              <p>
                You've&nbsp;
                {stepPercentages[1] === 100
                  ? "successfully uploaded all"
                  : "partially uploaded the"}{" "}
                required supporting documents for your application.
              </p>
            </div>
            <div className="OL-Boxas-Body">
              <table className="Gen-Sys-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Document Type</th>
                    <th>Document Name</th>
                    <th>Upload Date</th>
                    <th>File Format</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.job_application.documents.map((doc, index) => (
                    <tr key={doc.id || index}>
                      <td>{index + 1}</td>
                      <td>{doc.document_type}</td>
                      <td>
                        {data?.job_application.full_name} {doc.document_type}
                      </td>
                      <td>{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                      <td>{doc.file_url.split(".").pop().toUpperCase()}</td>
                      <td>
                        <span className="label-Sopppan">
                          Checked <CheckIcon className="w-4 h-4 ml-1" />
                        </span>
                      </td>
                      <td>
                        <div className="gen-td-btns">
                          <button
                            className="link-btn btn-primary-bg"
                            onClick={() => window.open(doc.file_url, "_blank")}
                          >
                            View Document
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Card 3: Interview - Only show if document upload is 100% */}
        {activeCard === 3 && stepPercentages[1] === 100 && (
          <motion.div
            className="OL-Boxas"
            variants={slideDownVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="OL-Boxas-Top">
              <h3>
                Interview
                <span>
                  Progress: {stepPercentages[2]}%{" "}
                  <b
                    className={
                      stepPercentages[2] === 100
                        ? "completed"
                        : stepPercentages[2] === 50
                        ? "pending"
                        : "not-started"
                    }
                  >
                    {stepPercentages[2] === 100
                      ? "Completed"
                      : stepPercentages[2] === 50
                      ? "Pending"
                      : "Not Started"}{" "}
                    {stepPercentages[2] === 100 ? (
                      <CheckIcon className="w-4 h-4 ml-1" />
                    ) : (
                      <ClockIcon className="w-4 h-4 ml-1" />
                    )}
                  </b>
                </span>
              </h3>
              <p>
                {data.job_application.status === "interviewed" ||
                data.job_application.status === "hired" ||
                data.job_application.status === "rejected"
                  ? `Your interview for the ${data.job_requisition.title} role has been completed.`
                  : data.schedules.length > 0
                  ? `You are invited to interview for the ${
                      data.job_requisition.title
                    } role at ${
                      data.job_requisition.company_name
                    } — Scheduled for ${formatInterviewDateTime(
                      data.schedules[0].interview_start_date_time,
                      data.schedules[0].interview_end_date_time,
                      data.schedules[0].timezone
                    )}.`
                  : `No interview has been scheduled yet for the ${data.job_requisition.title} role.`}
              </p>
            </div>
            <div className="OL-Boxas-Body">
              {data.job_application.status === "interviewed" ||
              data.job_application.status === "hired" ||
              data.job_application.status === "rejected" ? (
                <p>
                  The interview process is complete. Please check the Decision
                  tab for further updates.
                </p>
              ) : data.schedules.length > 0 ? (
                <div className="OUjauj-DAS">
                  <div className="OUjauj-DAS-1">
                    <div className="OUjauj-DAS-1Main">
                      <div className="Calendar-Dspy">
                        <InterviewCalendar
                          interviewDate={
                            new Date(
                              data.schedules[0].interview_start_date_time
                            )
                          }
                        />
                      </div>
                      <div className="OUauj-Biaoo">
                        <h3>Scheduled for this day:</h3>
                        <div className="OUauj-Biaoo-ManD">
                          <h4>Date and Time</h4>
                          <p>
                            {formatInterviewDateTime(
                              data.schedules[0].interview_start_date_time,
                              data.schedules[0].interview_end_date_time,
                              data.schedules[0].timezone
                            )}
                          </p>
                        </div>
                        <div className="OUauj-Biaoo-ManD">
                          <h4>
                            Location{" "}
                            <span>{data.schedules[0].meeting_mode}</span>
                          </h4>
                          {data.schedules[0].meeting_link && (
                            <>
                              <h6
                                className="Gen-Boxshadow"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    data.schedules[0].meeting_link
                                  );
                                  setShowAlert(true);
                                  setTimeout(() => setShowAlert(false), 2000);
                                }}
                              >
                                <span className="meeting-link">
                                  {data.schedules[0].meeting_link}
                                </span>
                              </h6>
                              <button
                                className="launch-meeting-btn btn-primary-bg"
                                onClick={() =>
                                  window.open(
                                    data.schedules[0].meeting_link,
                                    "_blank"
                                  )
                                }
                              >
                                Launch Meeting
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="OUjauj-DAS-2">
                    <div className="HYha-POla">
                      <div className="HYha-POla-Main">
                        <ScheduleTable schedules={data.schedules} />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p>No interviews scheduled yet.</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Show message if trying to access restricted Interview card */}
        {activeCard === 3 && stepPercentages[1] < 100 && (
          <motion.div
            className="OL-Boxas"
            variants={slideDownVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="OL-Boxas-Top">
              <h3>Access Restricted</h3>
            </div>
            <div className="OL-Boxas-Body">
              <p>
                The Interview page is only available after completing document
                uploads (100%). Please complete your document uploads first.
              </p>
            </div>
          </motion.div>
        )}

        {/* Card 4: Decision - Only show if status is "hired", "rejected", "compliance_completed", or "onboarded" and documents 100% */}
        {activeCard === 4 && shouldAllowDecisionAndComplianceAccess() && (
          <motion.div
            className="OL-Boxas"
            variants={slideDownVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="OL-Boxas-Top ooik-PPOla LLok-PPola">
              <h3>
                Decision
                <span>
                  Progress: {stepPercentages[3]}%{" "}
                  <b
                    className={
                      stepPercentages[3] === 100 ? "completed" : "pending"
                    }
                  >
                    {stepPercentages[3] === 100 ? "Completed" : "Pending"}{" "}
                    {stepPercentages[3] === 100 ? (
                      <CheckIcon className="w-4 h-4 ml-1" />
                    ) : (
                      <ClockIcon className="w-4 h-4 ml-1" />
                    )}
                  </b>
                </span>
              </h3>
            </div>
            <div className="OL-Boxas-Body">
              <JobDecision
                jobApplication={data.job_application}
                jobRequisition={data.job_requisition}
                setActiveCard={setActiveCard}
              />
            </div>
          </motion.div>
        )}

        {/* Card 5: Compliance Check - Only show if status is "hired", "rejected", "compliance_completed", or "onboarded" and documents 100% */}
        {activeCard === 5 && shouldAllowDecisionAndComplianceAccess() && (
          <motion.div
            className="OL-Boxas"
            variants={slideDownVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="OL-Boxas-Top ooik-PPOla">
              <h3>
                Compliance Check{" "}
                <span>
                  Progress: {Math.round(stepPercentages[4])}%
                  <b
                    className={
                      stepPercentages[4] === 100
                        ? "completed"
                        : stepPercentages[4] > 0
                        ? "pending"
                        : "not-started"
                    }
                  >
                    {stepPercentages[4] === 100
                      ? "Completed"
                      : stepPercentages[4] > 0
                      ? "Pending"
                      : "Not Started"}{" "}
                    {stepPercentages[4] === 100 ? (
                      <CheckIcon className="w-4 h-4 ml-1" />
                    ) : (
                      <ClockIcon className="w-4 h-4 ml-1" />
                    )}
                  </b>
                </span>
              </h3>
              <p>
                As part of the final stages of our recruitment process, we
                kindly request that you upload the listed documents for a
                mandatory compliance check.
              </p>
            </div>
            <div className="OL-Boxas-Body">
              <ComplianceCheckTable
                complianceChecklist={data.job_requisition.compliance_checklist}
                uploadedDocuments={data.job_application.documents}
                jobApplicationId={data.job_application.id}
                complianceStatus={data.job_application.compliance_status}
                email={data.job_application.email}
                onComplianceUpdate={handleChildComplianceUpdate}
              />
            </div>
          </motion.div>
        )}

        {/* Show message if trying to access restricted cards */}
        {(activeCard === 4 || activeCard === 5) &&
          !shouldAllowDecisionAndComplianceAccess() && (
            <motion.div
              className="OL-Boxas"
              variants={slideDownVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="OL-Boxas-Top">
                <h3>Access Restricted</h3>
              </div>
              <div className="OL-Boxas-Body">
                <p>
                  {stepPercentages[1] < 100
                    ? `The ${
                        activeCard === 4 ? "Decision" : "Compliance Check"
                      } page is only available after completing document uploads (100%). Please complete your document uploads first.`
                    : `The ${
                        activeCard === 4 ? "Decision" : "Compliance Check"
                      } page is only available after a final hiring decision has been made. Please check back later once your application status has been updated.`}
                </p>
              </div>
            </motion.div>
          )}
      </div>
    </div>
  );
};

export default Dashboard;

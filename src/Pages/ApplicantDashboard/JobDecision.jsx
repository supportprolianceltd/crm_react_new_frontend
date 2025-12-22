import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import "./Dashboard.css";
import StatusBadge from "../../components/StatusBadge";

const JobDecision = ({ jobApplication, jobRequisition, setActiveCard }) => {
  const handleDashboardLogin = () => {
    window.location.href = "/staff-dashboard";
  };

  const isHired = jobApplication.status === "hired";
  const isRejected = jobApplication.status === "rejected";

  return (
    <div className="job-decision-wrapper">
      <div className="job-decision-box Gen-Boxshadow">
        {isHired && (
          <div className="congrats-message">
            <h3>Congratulations!</h3>
            <p>
              You have been successfully hired as the {jobRequisition.title}
              &nbsp; at
              {jobRequisition.company_name}. Please expect your onboarding email
              shortly with further instructions and project assignments.
            </p>
          </div>
        )}

        {isRejected && (
          <div className="rejection-message">
            <h3>Application Status Update</h3>
            <p>
              Thank you for your interest in the {jobRequisition.title} position
              at {jobRequisition.company_name}. After careful consideration,
              we've decided to move forward with other candidates at this time.
            </p>
            <p>
              We appreciate the time and effort you put into your application
              and encourage you to apply for future positions that match your
              skills and experience.
            </p>
          </div>
        )}

        <h2 className="job-title">{jobRequisition.title}</h2>
        <p className="job-status">
          Status:&nbsp;
          <StatusBadge status={jobApplication?.status} />
        </p>

        {!isRejected && (
          <div className="job-details">
            <p>
              <strong>Company:</strong> {jobRequisition.company_name}
            </p>
            <p>
              <strong>Start Date:</strong> {jobRequisition.start_date || "TBD"}
            </p>
            <p>
              <strong>Location:</strong> {jobRequisition.location_type}
            </p>
            <p>
              <strong>Company Address:</strong> {jobRequisition.company_address}
            </p>
          </div>
        )}

        <div className="job-progress-summary">
          <h4>Hiring Process Summary</h4>
          <ul className="checklist">
            <li>
              <CheckCircleIcon className="check-icon" /> Job Application
              Completed
            </li>
            <li>
              <CheckCircleIcon className="check-icon" /> Document Uploads{" "}
              {jobApplication.documents.length >=
              jobRequisition.documents_required.length
                ? "Completed"
                : "Pending"}
            </li>
            <li>
              <CheckCircleIcon className="check-icon" /> Interview&nbsp;
              {isHired ? "Scheduled" : "Completed"}
            </li>
            {/* <li>
              <CheckCircleIcon className="check-icon" /> Compliance Check{" "}
              {jobRequisition.compliance_checklist.every((item) =>
                jobApplication.documents.some(
                  (doc) => doc.document_type === item
                )
              )
                ? "Completed"
                : "Pending"}
            </li> */}
            {isHired && (
              <li>
                <CheckCircleIcon className="check-icon" /> Compliance Check
                Pending
              </li>
            )}
          </ul>
        </div>

        {isHired && (
          <button
            className="submit-btn btn-primary-bg"
            onClick={() => setActiveCard(5)}
            style={{ marginTop: "20px" }}
          >
            Proceed to Compliance Check
          </button>
        )}

        {/* {isHired && (
          <button
            className="dashboard-button btn-primary-bg"
            onClick={handleDashboardLogin}
            style={{ marginTop: "30px" }}
          >
            Login to Staff Dashboard
          </button>
        )} */}
      </div>
    </div>
  );
};

export default JobDecision;

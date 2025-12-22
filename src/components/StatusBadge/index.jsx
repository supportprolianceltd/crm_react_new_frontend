import "./styles.css";

const StatusBadge = ({ status }) => {
  const getStatusText = (statusValue) => {
    if (typeof statusValue === "boolean") {
      return statusValue ? "Active" : "Inactive";
    }

    const statusTextMap = {
      // Original
      admin: "Admin",
      active: "Active",
      open: "Open",
      accepted: "Accepted",
      approved: "Approved",
      present: "Present",
      uploaded: "uploaded",
      submitted: "submitted",
      passed: "passed",
      acknowledged: "acknowledged",
      inactive: "Inactive",
      pending: "Pending",
      partial: "Partial",
      absent: "Absent",
      suspended: "Suspended",
      declined: "Declined",
      shortlisted: "Shortlisted",
      rejected: "Rejected",
      hired: "Hired",
      withdrawn: "Withdrawn",

      // New
      new: "New",
      in_review: "In Review",
      interviewing: "Interviewing",
      interviewed: "Interviewed",
      offer_pending: "Offer Pending",
      scheduled: "Scheduled",
      completed: "Completed",
      cancelled: "Cancelled",

      // Compliance status
      compliance_completed: "Compliance Completed",

      // Priority
      low: "Low",
      medium: "Medium",
      high: "High",
    };

    return (
      statusTextMap[statusValue?.toLowerCase()] || statusValue || "Unknown"
    );
  };

  const getStatusClass = (statusValue) => {
    if (typeof statusValue === "boolean") {
      return statusValue ? "active" : "inactive";
    }

    return statusValue?.toLowerCase() || "default";
  };

  const statusText = getStatusText(status);
  const statusClass = getStatusClass(status);

  return <span className={`status-badge ${statusClass}`}>{statusText}</span>;
};

export default StatusBadge;

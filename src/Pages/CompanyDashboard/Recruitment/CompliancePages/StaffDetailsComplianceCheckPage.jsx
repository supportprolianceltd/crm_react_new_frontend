import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { motion } from "framer-motion";
import Table from "../../../../components/Table/Table";
import StatusBadge from "../../../../components/StatusBadge";
import { SkeletonRow } from "../../../../components/SkeletonLoader";
import {
  fetchApplicantDetails,
  completeCompliance,
  saveCompliance,
} from "../../Compliance/config/apiConfig";
import "../../Compliance/styles/StaffDetailsComplianceCheckPage.css";
import LoadingState from "../../../../components/LoadingState";
import DocumentModal from "../../Compliance/modals/DocumentModal";
import ToastNotification from "../../../../components/ToastNotification"; // Add this import
import { normalizeText } from "../../../../utils/helpers";

const StaffDetailsComplianceCheckPage = () => {
  const { applicantId } = useParams();
  const navigate = useNavigate();

  const [applicant, setApplicant] = useState(null);
  const [complianceChecklist, setComplianceChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Toast notification state
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Helper function to check if item has file upload
  const hasFileUpload = (item) => {
    if (!item.document) return false;
    if (Array.isArray(item.document)) {
      return item.document.some((doc) => doc?.file_url);
    } else if (typeof item.document === "object" && item.document !== null) {
      return !!item.document.file_url;
    }
    return false;
  };

  // Helper function to check if item has text-based submission (pending status with non-empty metadata)
  const hasTextSubmission = (item) => {
    return (
      item.status === "pending" &&
      item.metadata &&
      Object.keys(item.metadata).length > 0
    );
  };

  // Function to find expiry date in the document object or metadata
  const findExpiryDate = (documentItem) => {
    if (!documentItem) return null;

    // Common expiry field names to check
    const expiryFields = [
      "expiry_date",
      "expiration_date",
      "valid_until",
      "validity_date",
      "expires_on",
      "expire_date",
      "end_date",
      "valid_till",
      "expiration",
    ];

    // Check document fields
    if (documentItem.document) {
      const doc = documentItem.document;
      for (const field of expiryFields) {
        if (doc[field]) {
          return doc[field];
        }
      }

      // Check nested metadata in document
      if (doc.metadata) {
        for (const field of expiryFields) {
          if (doc.metadata[field]) {
            return doc.metadata[field];
          }
        }
      }
    }

    // Check top-level metadata for text submissions
    if (documentItem.metadata) {
      for (const field of expiryFields) {
        if (documentItem.metadata[field]) {
          return documentItem.metadata[field];
        }
      }
    }

    return null;
  };

  // Function to get expiry notice
  const getExpiryNotice = (documentItem) => {
    const expiryDateStr = findExpiryDate(documentItem);
    if (!expiryDateStr) return "N/A";

    try {
      const expiryDate = new Date(expiryDateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to compare dates only
      expiryDate.setHours(0, 0, 0, 0);

      if (expiryDate < today) {
        return expiryDate.toLocaleDateString();
      }
      return "N/A";
    } catch (error) {
      console.warn("Invalid expiry date format:", expiryDateStr);
      return "N/A";
    }
  };

  // Updated table columns with new Submission Date and Notice columns
  const complianceColumns = [
    {
      key: "name",
      header: "Document Type",
      render: (item) => item.name || "N/A",
    },
    {
      key: "status",
      header: "Status",
      render: (item) => {
        const displayStatus = hasTextSubmission(item)
          ? "Submitted"
          : item.status || "pending";
        return <StatusBadge status={displayStatus} />;
      },
    },
    {
      key: "upload_date",
      header: "Submission Date",
      render: (item) => {
        // Check for file upload date first
        let latestDate;
        if (hasFileUpload(item)) {
          if (Array.isArray(item.document)) {
            if (item.document.length === 0) return "N/A";
            latestDate = item.document
              .filter((doc) => doc?.uploaded_at)
              .map((doc) => new Date(doc.uploaded_at))
              .sort((a, b) => b - a)[0];
          } else if (
            typeof item.document === "object" &&
            item.document !== null
          ) {
            if (item.document.uploaded_at) {
              latestDate = new Date(item.document.uploaded_at);
            }
          }
        }

        // If no file date, check for text submission
        if (latestDate) {
          return latestDate.toLocaleDateString();
        } else if (hasTextSubmission(item)) {
          return "Text Submission";
        }

        return "N/A";
      },
    },
    {
      key: "notice",
      header: "Notice",
      render: (item) => getExpiryNotice(item),
    },
    {
      key: "uploaded",
      header: "Uploaded",
      render: (item) => {
        // Only "Yes" if there's an actual file upload
        return hasFileUpload(item) ? "Yes" : "No";
      },
    },
    {
      key: "missing",
      header: "Missing",
      render: (item) => {
        if (!item.required) return "No";
        // Missing if required and no file and no text submission
        const noFile = !hasFileUpload(item);
        const noText = !hasTextSubmission(item);
        return noFile && noText ? "Yes" : "No";
      },
    },
    {
      key: "view",
      header: "View",
      render: (item) => {
        // View if has file upload (for document modal) or text submission (for metadata view)
        if (hasFileUpload(item) || hasTextSubmission(item)) {
          return (
            <button
              className="view-link underlined"
              onClick={() => handleViewDocument(item)}
              style={{
                textDecoration: "underline",
                color: "#007bff",
                cursor: "pointer",
                background: "none",
                border: "none",
                fontSize: "inherit",
                padding: 0,
              }}
            >
              View
            </button>
          );
        }
        return "-";
      },
    },
    {
      key: "checked_by",
      header: "Checked By",
      render: (item) => {
        if (!item.checked_by) return "-";

        let checker;
        if (typeof item.checked_by === "object" && item.checked_by !== null) {
          checker = item.checked_by;
        } else if (typeof item.checked_by === "string") {
          try {
            let jsonString = item.checked_by
              .replace(/'/g, '"')
              .replace(/(\w+):/g, '"$1":');
            checker = JSON.parse(jsonString);
          } catch (error) {
            console.warn("Failed to parse checked_by:", item.checked_by, error);
            return item.checked_by || "-";
          }
        } else {
          return "-";
        }

        const fullName =
          `${checker.first_name || ""} ${checker.last_name || ""}`.trim() ||
          "N/A";
        const email = checker.email || "N/A";

        return (
          <div style={{ fontSize: "0.875rem", lineHeight: "1.4" }}>
            <div style={{ fontWeight: "500", color: "#333" }}>{fullName}</div>
            <div style={{ color: "#666", fontSize: "0.75rem" }}>{email}</div>
          </div>
        );
      },
    },
    {
      key: "checked_at",
      header: "Checked At",
      render: (item) =>
        item.checked_at ? new Date(item.checked_at).toLocaleDateString() : "-",
    },
    {
      key: "notes",
      header: "Notes",
      render: (item) => item.notes || "-",
    },
  ];

  const interviewColumns = [
    { key: "name", header: "Interviewer Name" },
    { key: "role", header: "Role" },
    { key: "date", header: "Date" },
    { key: "signature", header: "Signature" },
  ];

  // Auto-clear toast messages after 5 seconds
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  // Fetch staff details
  useEffect(() => {
    const fetchSingleStaffDetails = async () => {
      try {
        setLoading(true);
        const response = await fetchApplicantDetails(applicantId);

        // Use compliance_status from the API response
        setApplicant(response);
        // console.log(response.compliance_status);
        setComplianceChecklist(response?.compliance_status || []);
      } catch (error) {
        console.error("Error fetching staff details:", error);
        setErrorMessage("Failed to load applicant details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (applicantId) {
      fetchSingleStaffDetails();
    }
  }, [applicantId]);

  // Handle document view
  const handleViewDocument = (documentItem) => {
    const documents = Array.isArray(documentItem.document)
      ? documentItem.document
      : documentItem.document
      ? [documentItem.document]
      : [];

    // console.log(documents, documentItem);

    setSelectedDocument({
      id: documentItem.id,
      name: documentItem.name,
      documents: documents, // Pass all documents
      document_type: documentItem.name,
      metadata: documentItem?.metadata,
      ...Object.fromEntries(
        Object.entries(documentItem).filter(
          ([key]) =>
            ![
              "description",
              "required",
              "submit",
              "notes",
              "document",
            ].includes(key)
        )
      ),
    });
    setIsModalOpen(true);
  };

  // Handle accept/reject compliance for individual document
  const handleAcceptCompliance = async (documentId, notes = "") => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.id) {
        setErrorMessage(
          "User authentication data is missing. Please log in again."
        );
        return;
      }

      const payload = {
        item_id: documentId,
        status: "accepted",
        notes: notes,
      };

      await completeCompliance(applicantId, payload);

      // Refresh data after update
      const updatedResponse = await fetchApplicantDetails(applicantId);
      setComplianceChecklist(updatedResponse?.compliance_status || []);

      setSuccessMessage(
        `Document "${selectedDocument?.name}" accepted successfully!`
      );
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error accepting compliance:", error);
      setErrorMessage(
        `Failed to accept document: ${
          error.message || "An unexpected error occurred"
        }`
      );
    }
  };

  const handleRejectCompliance = async (documentId, notes = "") => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.id) {
        setErrorMessage(
          "User authentication data is missing. Please log in again."
        );
        return;
      }

      const payload = {
        item_id: documentId,
        status: "rejected",
        notes: notes,
      };

      // Use the new endpoint
      await completeCompliance(applicantId, payload);

      // Refresh data after update
      const updatedResponse = await fetchApplicantDetails(applicantId);
      setComplianceChecklist(updatedResponse?.compliance_status || []);

      setSuccessMessage(
        `Document "${selectedDocument?.name}" rejected successfully!`
      );
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error rejecting compliance:", error);
      setErrorMessage(
        `Failed to reject document: ${
          error.message || "An unexpected error occurred"
        }`
      );
    }
  };

  const handleRequestDocuments = () => {
    const missingDocs = complianceChecklist
      .filter(
        (item) =>
          item.required && !hasFileUpload(item) && !hasTextSubmission(item)
      )
      .map((item) => item.name);

    if (missingDocs.length === 0) {
      setSuccessMessage("All required documents are uploaded!");
      return;
    }

    // TODO: Implement actual API call for requesting documents
    setSuccessMessage(
      `Request sent for missing documents: ${missingDocs.join(", ")}`
    );
  };

  // Add this function to check if all required documents are accepted
  const areAllDocumentsAccepted = () => {
    return complianceChecklist
      .filter((item) => item.required)
      .every((item) => item.status === "accepted");
  };

  const handleSaveCompliance = async () => {
    try {
      // if (!areAllDocumentsAccepted()) {
      //   setErrorMessage(
      //     "Cannot mark as compliance-completed. Not all required documents are accepted."
      //   );
      //   return;
      // }

      setIsSaving(true);

      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.id) {
        setErrorMessage(
          "User authentication data is missing. Please log in again."
        );
        return;
      }

      // console.log(applicant);

      const payload = {
        status: "compliance_completed",
        job_requisition_id: applicant.job_requisition_id,
        email: applicant.email,
      };

      await saveCompliance(applicantId, payload);
      setSuccessMessage("Applicant has successfully passed compliance!");
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (error) {
      console.error("Error updating compliance status:", error);
      setErrorMessage(
        `Failed to update status: ${
          error.message || "An unexpected error occurred"
        }`
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh", // Adjust based on your needs (e.g., '100%' or specific height)
          width: "100%", // Adjust based on your needs
        }}
      >
        <LoadingState text="Loading Applicant Details..." />
      </div>
    );
  if (!applicant) return <p>No applicant found or invalid applicant ID.</p>;

  // Calculate compliance summary
  const totalRequired = complianceChecklist.filter(
    (item) => item.required
  ).length;
  const uploadedRequired = complianceChecklist.filter(
    (item) => item.required && hasFileUpload(item)
  ).length;
  const completedRequired = complianceChecklist.filter(
    (item) => item.required && item.status === "accepted"
  ).length;
  const compliancePercentage =
    totalRequired > 0
      ? Math.round((completedRequired / totalRequired) * 100)
      : 0;

  // Hired by details rendering logic
  const renderHiringManagerInfo = () => {
    if (!applicant.hired_by || Object.keys(applicant.hired_by).length === 0) {
      return (
        <div className="empty-state">
          <p>Hiring manager information not available</p>
        </div>
      );
    }

    let hirer;
    if (typeof applicant.hired_by === "object" && applicant.hired_by !== null) {
      hirer = applicant.hired_by;
    } else if (typeof applicant.hired_by === "string") {
      try {
        let jsonString = applicant.hired_by
          .replace(/'/g, '"')
          .replace(/(\w+):/g, '"$1":');
        hirer = JSON.parse(jsonString);
      } catch (error) {
        console.warn("Failed to parse hired_by:", applicant.hired_by, error);
        return (
          <div className="empty-state">
            <p>Invalid hiring manager information format</p>
          </div>
        );
      }
    } else {
      return (
        <div className="empty-state">
          <p>Hiring manager information not available</p>
        </div>
      );
    }

    const fullName =
      `${hirer.first_name || ""} ${hirer.last_name || ""}`.trim() || "N/A";
    const email = hirer.email || "N/A";
    const role = hirer.job_role || "N/A";

    return (
      <table className="info-table">
        <tbody>
          <tr>
            <td>
              <b>Name</b>
            </td>
            <td>{fullName}</td>
          </tr>
          <tr>
            <td>
              <b>Email</b>
            </td>
            <td>{email}</td>
          </tr>
          <tr>
            <td>
              <b>Role</b>
            </td>
            <td>{role}</td>
          </tr>
        </tbody>
      </table>
    );
  };

  return (
    <>
      <motion.div
        className="compliance-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="header OUkas-POka">
          <IoIosArrowRoundBack onClick={() => navigate(-1)} />
          <div>
            <h2>Applicant Compliance</h2>
            <p>
              Manage and view all applicant compliance - {compliancePercentage}%
              Complete
            </p>
          </div>
        </div>

        {/* Applicant Info */}
        <div className="content-layout">
          <motion.div
            className="card applicant-card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h2>Applicant Information</h2>
            <table className="info-table">
              <tbody>
                <tr>
                  <td>
                    <b>Name</b>
                  </td>
                  <td>{applicant.full_name ?? "N/A"}</td>
                </tr>
                <tr>
                  <td>
                    <b>Applicant ID</b>
                  </td>
                  <td>{applicant.id}</td>
                </tr>
                <tr>
                  <td>
                    <b>Email</b>
                  </td>
                  <td>{applicant.email || "N/A"}</td>
                </tr>
                <tr>
                  <td>
                    <b>Phone</b>
                  </td>
                  <td>{applicant.phone || "N/A"}</td>
                </tr>
                <tr>
                  <td>
                    <b>Applied</b>
                  </td>
                  <td>{applicant.applied_at?.slice(0, 10) || "N/A"}</td>
                </tr>
                <tr>
                  <td>
                    <b>Current Stage</b>
                  </td>
                  <td>
                    <StatusBadge status={applicant.current_stage || "N/A"} />
                  </td>
                </tr>
              </tbody>
            </table>
          </motion.div>

          <motion.div
            className="card job-info-card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h2>Job & Application Details</h2>
            <table className="info-table">
              <tbody>
                <tr>
                  <td>
                    <b>Job Requisition</b>
                  </td>
                  <td>{applicant.job_requisition_id || "N/A"}</td>
                </tr>
                <tr>
                  <td>
                    <b>Source</b>
                  </td>
                  <td>{normalizeText(applicant.source) || "N/A"}</td>
                </tr>
                <tr>
                  <td>
                    <b>Application Status</b>
                  </td>
                  <td>
                    <StatusBadge status={applicant.status || "N/A"} />
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>Screening Status</b>
                  </td>
                  {/* <td>
                    <StatusBadge status={applicant.screening_status || "N/A"} />
                  </td> */}
                </tr>
              </tbody>
            </table>
          </motion.div>
        </div>

        {/* Hiring Details */}
        <motion.div
          className="card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h2>Hiring Manager Information</h2>
          {renderHiringManagerInfo()}
        </motion.div>

        {/* Compliance Docs */}
        <motion.div
          className="card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="card-header">
            <h2>Compliance Documents</h2>
            <div className="compliance-summary">
              <span>Required: {totalRequired}</span>
              <span>Uploaded: {uploadedRequired}</span>
              <span>Missing: {totalRequired - uploadedRequired}</span>
              <span>Completed: {completedRequired}</span>
              <span>{compliancePercentage}% Complete</span>
            </div>
          </div>
          <Table
            columns={complianceColumns}
            data={complianceChecklist}
            isLoading={loading}
            emptyStateIcon="📄"
            emptyStateMessage="No compliance documents found"
            emptyStateDescription="This applicant doesn't have any compliance documents to review yet."
            itemsPerPage={10}
            currentPage={1}
            totalPages={Math.ceil(complianceChecklist.length / 10)}
            // onPageChange={(page) => console.log("Page changed:", page)}
          />
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="compliance-action-buttons"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <button
            className="btn request"
            onClick={handleRequestDocuments}
            disabled={totalRequired === uploadedRequired}
          >
            Request Missing Documents
          </button>
          <button
            className="btn save"
            onClick={handleSaveCompliance}
            disabled={isSaving || !areAllDocumentsAccepted()}
            // disabled={!areAllDocumentsAccepted()}
          >
            Save
          </button>
        </motion.div>

        {/* Document Modal */}
        <DocumentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          document={selectedDocument}
          onAccept={handleAcceptCompliance}
          onReject={handleRejectCompliance}
          applicantId={applicantId}
        />
      </motion.div>

      {/* Toast Notifications - Rendered at the end to appear above everything */}
      <ToastNotification
        successMessage={successMessage}
        errorMessage={errorMessage}
      />
    </>
  );
};

export default StaffDetailsComplianceCheckPage;

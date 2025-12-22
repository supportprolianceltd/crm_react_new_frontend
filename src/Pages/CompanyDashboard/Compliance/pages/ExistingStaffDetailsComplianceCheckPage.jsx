import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { motion } from "framer-motion";
import Table from "../../../../components/Table/Table";
import StatusBadge from "../../../../components/StatusBadge";
import LoadingState from "../../../../components/LoadingState";
import DocumentModal from "../modals/DocumentModal";
import ToastNotification from "../../../../components/ToastNotification";
import { fetchSingleEmployee } from "../../Employees/config/apiService";
import "../styles/StaffDetailsComplianceCheckPage.css";
import { normalizeText } from "../../../../utils/helpers";

const ExistingStaffDetailsComplianceCheckPage = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [complianceChecklist, setComplianceChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Helper function to parse date string as local date
  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr + "T00:00:00");
  };

  // Helper function to format date to YYYY-MM-DD
  const formatToYYYYMMDD = (date) => {
    if (!date || isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Function to find the earliest expiry date string across all documents
  const findExpiryDate = (documentItem) => {
    if (!documentItem?.document) return null;

    let docs;
    if (Array.isArray(documentItem.document)) {
      docs = documentItem.document;
    } else {
      docs = [documentItem.document];
    }

    let expiryStrs = [];
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

    for (const doc of docs) {
      if (!doc) continue;

      // Check direct fields
      for (const field of expiryFields) {
        if (doc[field]) {
          expiryStrs.push(doc[field]);
          break;
        }
      }

      // Check metadata if present
      if (doc.metadata) {
        for (const field of expiryFields) {
          if (doc.metadata[field]) {
            expiryStrs.push(doc.metadata[field]);
            break;
          }
        }
      }
    }

    if (expiryStrs.length === 0) return null;

    // Parse to dates and find the earliest valid one
    const validEntries = expiryStrs
      .map((str) => ({ str, date: parseLocalDate(str) }))
      .filter(({ date }) => date && !isNaN(date.getTime()));

    if (validEntries.length === 0) return null;

    const minDate = validEntries.reduce(
      (min, { date }) => (date < min ? date : min),
      validEntries[0].date
    );

    // Return the original string corresponding to the min date
    const minEntry = validEntries.find(
      ({ date }) => date.getTime() === minDate.getTime()
    );
    return minEntry ? minEntry.str : null;
  };

  // Function to get expiry notice
  const getExpiryNotice = (documentItem) => {
    const expiryDateStr = findExpiryDate(documentItem);
    if (!expiryDateStr) return { text: "N/A", style: {} };

    try {
      const expiryDate = parseLocalDate(expiryDateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const diffTime = expiryDate.getTime() - today.getTime();

      if (diffTime < 0) {
        return { text: "Expired", style: { color: "red" } };
      } else {
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        let text = "N/A";
        if (diffDays === 0) {
          text = "Expires Today";
        } else if (diffDays === 1) {
          text = "Expires Tomorrow";
        } else if (diffDays <= 3) {
          text = `Expires in ${diffDays} days`;
        }
        const style = text !== "N/A" ? { color: "red" } : {};
        return { text, style };
      }
    } catch (error) {
      console.warn("Invalid expiry date format:", expiryDateStr);
      return { text: "N/A", style: {} };
    }
  };

  // Table columns for compliance documents (read-only)
  const complianceColumns = [
    {
      key: "name",
      header: "Document Type",
      render: (item) => item.name || "N/A",
    },
    {
      key: "upload_date",
      header: "Submission Date",
      render: (item) => {
        if (!item.document) return "N/A";
        let latestDate;
        if (Array.isArray(item.document)) {
          if (item.document.length === 0) return "N/A";
          const uploadDates = item.document
            .filter((doc) => doc?.uploaded_at)
            .map((doc) => {
              const dateStr = doc.uploaded_at;
              if (dateStr.includes("T")) {
                return new Date(dateStr);
              } else {
                return parseLocalDate(dateStr);
              }
            })
            .filter((date) => !isNaN(date.getTime()));
          if (uploadDates.length === 0) return "N/A";
          latestDate = uploadDates.sort((a, b) => b - a)[0];
        } else if (
          typeof item.document === "object" &&
          item.document !== null
        ) {
          const dateStr = item.document.uploaded_at;
          if (dateStr) {
            if (dateStr.includes("T")) {
              latestDate = new Date(dateStr);
            } else {
              latestDate = parseLocalDate(dateStr);
            }
          }
        }
        return latestDate && !isNaN(latestDate.getTime())
          ? latestDate.toLocaleDateString()
          : "N/A";
      },
    },
    {
      key: "expiry_date",
      header: "Expiry Date",
      render: (item) => {
        const exp = findExpiryDate(item);
        if (!exp) return "N/A";
        const expDate = parseLocalDate(exp);
        return !isNaN(expDate.getTime()) ? expDate.toLocaleDateString() : "N/A";
      },
    },
    {
      key: "notice",
      header: "Notice",
      render: (item) => {
        const { text, style } = getExpiryNotice(item);
        return <span style={style}>{text}</span>;
      },
    },
    {
      key: "uploaded",
      header: "Uploaded",
      render: (item) => {
        if (!item.document) return "No";
        if (Array.isArray(item.document)) {
          return item.document.some((doc) => doc?.file_url) ? "Yes" : "No";
        } else if (
          typeof item.document === "object" &&
          item.document !== null
        ) {
          return item.document.file_url ? "Yes" : "No";
        }
        return "No";
      },
    },
    {
      key: "missing",
      header: "Missing",
      render: (item) => {
        if (!item.required) return "No";
        if (!item.document) return "Yes";
        if (Array.isArray(item.document)) {
          return item.document.some((doc) => doc?.file_url) ? "No" : "Yes";
        } else if (
          typeof item.document === "object" &&
          item.document !== null
        ) {
          return item.document.file_url ? "No" : "Yes";
        }
        return "Yes";
      },
    },
    {
      key: "view",
      header: "View",
      render: (item) => {
        if (!item.document) return "-";
        const documents = Array.isArray(item.document)
          ? item.document
          : [item.document];
        if (
          documents.some((doc) => doc?.file_url) ||
          (typeof item.document === "object" &&
            item.document !== null &&
            item.document.file_url)
        ) {
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
  ];

  // Auto-clear error messages
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Fetch employee details and map compliance documents
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        setLoading(true);
        const response = await fetchSingleEmployee(employeeId);

        console.log(response);

        // Map compliance documents from employee profile
        const complianceDocs = [
          {
            id: "drivers_licence",
            name: "Driver's License",
            required: response.profile.is_driver,
            document:
              response.profile.drivers_licence_image1_url ||
              response.profile.drivers_licence_image2_url
                ? [
                    ...(response.profile.drivers_licence_image1_url
                      ? [
                          {
                            file_url:
                              response.profile.drivers_licence_image1_url,
                            uploaded_at:
                              response.profile.drivers_licence_date_issue,
                            expiry_date:
                              response.profile.drivers_licence_expiry_date,
                          },
                        ]
                      : []),
                    ...(response.profile.drivers_licence_image2_url
                      ? [
                          {
                            file_url:
                              response.profile.drivers_licence_image2_url,
                            uploaded_at:
                              response.profile.drivers_licence_date_issue,
                            expiry_date:
                              response.profile.drivers_licence_expiry_date,
                          },
                        ]
                      : []),
                  ]
                : null,
            status:
              response.profile.drivers_licence_image1_url ||
              response.profile.drivers_licence_image2_url
                ? response.profile.drivers_licence_status || "pending"
                : "missing",
          },
          // {
          //   id: "vehicle_insurance",
          //   name: "Vehicle Insurance",
          //   required: response.profile.is_driver,
          //   document: response.profile.drivers_licence_insurance_expiry_date
          //     ? [
          //         {
          //           file_url: null,
          //           uploaded_at: null,
          //           expiry_date:
          //             response.profile.drivers_licence_insurance_expiry_date,
          //         },
          //       ]
          //     : null,
          //   status: response.profile.drivers_licence_policy_number
          //     ? "pending"
          //     : "missing",
          // },
          {
            id: "right_to_work",
            name: "Right to Work",
            required: true,
            document: response.profile.Right_to_Work_file_url
              ? [
                  {
                    file_url: response.profile.Right_to_Work_file_url,
                    uploaded_at: response.profile.date_joined,
                    expiry_date:
                      response.profile.Right_to_Work_document_expiry_date,
                  },
                ]
              : null,
            status: response.profile.Right_to_Work_file_url
              ? response.profile.Right_to_Work_status || "pending"
              : "missing",
          },
          {
            id: "dbs_certificate",
            name: "DBS Certificate",
            required: true,
            document:
              response.profile.dbs_certificate_url ||
              response.profile.dbs_update_file_url
                ? [
                    ...(response.profile.dbs_certificate_url
                      ? [
                          {
                            file_url: response.profile.dbs_certificate_url,
                            uploaded_at: response.profile.dbs_issue_date,
                          },
                        ]
                      : []),
                    ...(response.profile.dbs_update_file_url
                      ? [
                          {
                            file_url: response.profile.dbs_update_file_url,
                            uploaded_at: response.profile.dbs_update_issue_date,
                          },
                        ]
                      : []),
                  ]
                : null,
            status:
              response.profile.dbs_certificate_url ||
              response.profile.dbs_update_file_url
                ? response.profile.dbs_status || "pending"
                : "missing",
          },
          {
            id: "insurance_verification",
            name: "Insurance Verification",
            required: true,
            document:
              response.profile.insurance_verifications?.length > 0
                ? response.profile.insurance_verifications.map((iv) => ({
                    file_url: iv.document_url,
                    uploaded_at: iv.coverage_start_date,
                    expiry_date: iv.expiry_date,
                  }))
                : null,
            status:
              response.profile.insurance_verifications?.length > 0
                ? "pending"
                : "missing",
          },
          {
            id: "proof_of_address",
            name: "Proof of Address",
            required: true,
            document:
              response.profile.proof_of_address?.length > 0
                ? response.profile.proof_of_address.map((doc) => {
                    const issueDate = parseLocalDate(doc.issue_date);
                    const expiryDate = new Date(issueDate);
                    expiryDate.setMonth(expiryDate.getMonth() + 3);
                    const expiryStr = formatToYYYYMMDD(expiryDate);
                    return {
                      file_url: doc.document_url || doc.document,
                      uploaded_at: doc.issue_date,
                      expiry_date: expiryStr,
                    };
                  })
                : null,
            status:
              response.profile.proof_of_address?.length > 0
                ? response.profile.proof_of_address_status || "pending"
                : "missing",
          },
        ];

        setEmployee(response);
        setComplianceChecklist(complianceDocs);
      } catch (error) {
        console.error("Error fetching employee details:", error);
        setErrorMessage("Failed to load employee details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchEmployeeDetails();
    }
  }, [employeeId]);

  // Handle document view
  const handleViewDocument = (documentItem) => {
    const documents = Array.isArray(documentItem.document)
      ? documentItem.document
      : documentItem.document
      ? [documentItem.document]
      : [];

    setSelectedDocument({
      id: documentItem.id,
      name: documentItem.name,
      documents,
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

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100%",
        }}
      >
        <LoadingState text="Loading Employee Details..." />
      </div>
    );
  }

  if (!employee) return <p>No employee found or invalid employee ID.</p>;

  // Calculate compliance summary
  const totalRequired = complianceChecklist.filter(
    (item) => item.required
  ).length;
  const uploadedRequired = complianceChecklist.filter(
    (item) =>
      item.required &&
      item.document &&
      (Array.isArray(item.document)
        ? item.document.some((doc) => doc?.file_url)
        : typeof item.document === "object" &&
          item.document !== null &&
          item.document.file_url)
  ).length;
  const validRequired = complianceChecklist.filter(
    (item) =>
      item.required &&
      item.document &&
      (Array.isArray(item.document)
        ? item.document.some((doc) => doc?.file_url)
        : typeof item.document === "object" &&
          item.document !== null &&
          item.document.file_url) &&
      getExpiryNotice(item).text !== "Expired"
  ).length;
  const completedRequired = validRequired;
  const compliancePercentage =
    totalRequired > 0
      ? Math.round((completedRequired / totalRequired) * 100)
      : 0;

  // Calculate expiry analytics
  const expiredCount = complianceChecklist.filter((item) => {
    const notice = getExpiryNotice(item);
    return notice.text === "Expired";
  }).length;

  const expiringSoonCount = complianceChecklist.filter((item) => {
    const notice = getExpiryNotice(item);
    const text = notice.text;
    return (
      text === "Expires Today" ||
      text === "Expires Tomorrow" ||
      (text.startsWith("Expires in ") && parseInt(text.split(" ")[2]) <= 3)
    );
  }).length;

  return (
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
          <h2>Employee Compliance</h2>
          <p>View employee compliance - {compliancePercentage}% Complete</p>
        </div>
      </div>

      {/* Employee Info */}
      <div className="content-layout">
        <motion.div
          className="card applicant-card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h2>Employee Information</h2>
          <table className="info-table">
            <tbody>
              <tr>
                <td>
                  <b>Name</b>
                </td>
                <td>{`${employee.first_name} ${employee.last_name}`}</td>
              </tr>
              <tr>
                <td>
                  <b>Employee ID</b>
                </td>
                <td>{employee.profile.employee_id || "N/A"}</td>
              </tr>
              <tr>
                <td>
                  <b>Email</b>
                </td>
                <td>{employee.email || "N/A"}</td>
              </tr>
              <tr>
                <td>
                  <b>Phone</b>
                </td>
                <td>
                  {employee.profile.work_phone ||
                    employee.profile.personal_phone ||
                    "N/A"}
                </td>
              </tr>
              <tr>
                <td>
                  <b>Joined</b>
                </td>
                <td>{employee.date_joined?.slice(0, 10) || "N/A"}</td>
              </tr>
              <tr>
                <td>
                  <b>Status</b>
                </td>
                <td>
                  <StatusBadge
                    status={employee.is_active ? "active" : "inactive"}
                  />
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
          <h2>Job & Employment Details</h2>
          <table className="info-table">
            <tbody>
              <tr>
                <td>
                  <b>Job Role</b>
                </td>
                <td>{normalizeText(employee.job_role) || "N/A"}</td>
              </tr>
              <tr>
                <td>
                  <b>Department</b>
                </td>
                <td>{employee.profile.department || "N/A"}</td>
              </tr>
              <tr>
                <td>
                  <b>Line Manager</b>
                </td>
                <td>
                  {employee.profile?.employment_details[0]?.line_manager ||
                    "N/A"}
                </td>
              </tr>
              <tr>
                <td>
                  <b>Employment Type</b>
                </td>
                <td>
                  {employee.profile.employment_details[0]?.employment_type ||
                    "N/A"}
                </td>
              </tr>
              <tr>
                <td>
                  <b>Compliance Status</b>
                </td>
                <td>
                  <StatusBadge status={employee.status || "pending"} />
                </td>
              </tr>
            </tbody>
          </table>
        </motion.div>
      </div>

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
            <span>Expired: {expiredCount}</span>
            <span>Expiring Soon: {expiringSoonCount}</span>
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
          emptyStateDescription="This employee doesn't have any compliance documents to review."
          itemsPerPage={10}
          currentPage={1}
          totalPages={Math.ceil(complianceChecklist.length / 10)}
          onPageChange={(page) => console.log("Page changed:", page)}
        />
      </motion.div>

      {/* Document Modal */}
      <DocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        document={selectedDocument}
        employeeId={employeeId}
        isExistingStaff
      />

      {/* Toast Notifications */}
      <ToastNotification errorMessage={errorMessage} />
    </motion.div>
  );
};

export default ExistingStaffDetailsComplianceCheckPage;

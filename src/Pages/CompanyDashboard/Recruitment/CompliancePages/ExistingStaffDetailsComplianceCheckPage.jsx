import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { motion } from "framer-motion";
import Table from "../../../../components/Table/Table";
import StatusBadge from "../../../../components/StatusBadge";
import LoadingState from "../../../../components/LoadingState";
import DocumentModal from "../../Compliance/modals/DocumentModal";
import ToastNotification from "../../../../components/ToastNotification";
import { fetchSingleEmployee } from "../../Employees/config/apiService";
import "../../Compliance/styles/StaffDetailsComplianceCheckPage.css";

const ExistingStaffDetailsComplianceCheckPage = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [complianceChecklist, setComplianceChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Function to find expiry date in the document object
  const findExpiryDate = (documentItem) => {
    if (!documentItem?.document) return null;

    const doc = documentItem.document;
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

    for (const field of expiryFields) {
      if (doc[field]) return doc[field];
    }

    if (doc.metadata) {
      for (const field of expiryFields) {
        if (doc.metadata[field]) return doc.metadata[field];
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
      today.setHours(0, 0, 0, 0);
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

  // Table columns for compliance documents (read-only)
  const complianceColumns = [
    {
      key: "name",
      header: "Document Type",
      render: (item) => item.name || "N/A",
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status || "pending"} />,
    },
    {
      key: "upload_date",
      header: "Submission Date",
      render: (item) => {
        if (!item.document) return "N/A";
        let latestDate;
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
          latestDate = item.document.uploaded_at
            ? new Date(item.document.uploaded_at)
            : findExpiryDate(item)
            ? new Date(findExpiryDate(item))
            : null;
        }
        return latestDate ? latestDate.toLocaleDateString() : "Text Submission";
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
        if (!item.document) return "No";
        if (Array.isArray(item.document)) {
          return item.document.some((doc) => doc?.file_url) ? "Yes" : "No";
        } else if (
          typeof item.document === "object" &&
          item.document !== null
        ) {
          return "Yes";
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
          return "No";
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
          (typeof item.document === "object" && item.document !== null)
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

        // console.log(response);

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
                            expiry_date: response.profile.dbs_update_issue_date,
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
            id: "proof_of_address",
            name: "Proof of Address",
            required: true,
            document:
              response.profile.proof_of_address?.length > 0
                ? response.profile.proof_of_address.map((doc) => ({
                    file_url: doc.document,
                    uploaded_at: doc.uploaded_at,
                    expiry_date: doc.issue_date,
                  }))
                : null,
            status:
              response.profile.proof_of_address?.length > 0
                ? response.profile.proof_of_address_status || "pending"
                : "missing",
          },
          {
            id: "other_documents",
            name: "Other Documents",
            required: false,
            document:
              response.profile.other_user_documents?.length > 0
                ? response.profile.other_user_documents.map((doc) => ({
                    file_url: doc.file,
                    uploaded_at: doc.uploaded_at,
                    expiry_date: doc.expiry_date,
                  }))
                : null,
            status:
              response.profile.other_user_documents?.length > 0
                ? response.profile.other_documents_status || "pending"
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
        : typeof item.document === "object" && item.document !== null)
  ).length;
  const completedRequired = complianceChecklist.filter(
    (item) => item.required && item.status === "accepted"
  ).length;
  const compliancePercentage =
    totalRequired > 0
      ? Math.round((completedRequired / totalRequired) * 100)
      : 0;

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
                <td>{employee.job_role || "N/A"}</td>
              </tr>
              <tr>
                <td>
                  <b>Department</b>
                </td>
                <td>{employee.profile.department || "N/A"}</td>
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
          // onPageChange={(page) => console.log("Page changed:", page)}
        />
      </motion.div>

      {/* Document Modal */}
      <DocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        document={selectedDocument}
        employeeId={employeeId}
      />

      {/* Toast Notifications */}
      <ToastNotification errorMessage={errorMessage} />
    </motion.div>
  );
};

export default ExistingStaffDetailsComplianceCheckPage;

import { parseLocalDate, formatToYYYYMMDD } from "../../../../../utils/helpers";
import Table from "../../../../../components/Table/Table";

const EmployeeDocumentsStep = ({ formData }) => {
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

  // Map formData to complianceDocs
  const complianceDocs = [
    {
      id: "right_to_work",
      name: "Right to Work",
      required: true,
      document: formData.rightToWorkFileUrl
        ? [
            {
              file_url: formData.rightToWorkFileUrl,
              uploaded_at: formData.date_joined || "", // Assume date_joined from employee
              expiry_date: formData.rightToWorkDocumentExpiryDate,
            },
          ]
        : null,
      status: formData.rightToWorkFileUrl ? "accepted" : "missing",
    },
    {
      id: "dbs_certificate",
      name: "DBS Certificate",
      required: true,
      document: formData.dbsCertificatePreview
        ? [
            {
              file_url: formData.dbsCertificatePreview,
              uploaded_at: formData.dbsIssueDate,
            },
          ]
        : null,
      status: formData.dbsCertificatePreview ? "accepted" : "missing",
    },
    {
      id: "dbs_update",
      name: "DBS Update Service",
      required: true,
      document: formData.dbsUpdateServicePreview
        ? [
            {
              file_url: formData.dbsUpdateServicePreview,
              uploaded_at: formData.dbsUpdateIssueDate,
            },
          ]
        : null,
      status: formData.dbsUpdateServicePreview ? "accepted" : "missing",
    },
    {
      id: "drivers_licence",
      name: "Driver's License",
      required: formData.drivingStatus,
      document:
        formData.drivingLicenseFrontPreview ||
        formData.drivingLicenseBackPreview
          ? [
              ...(formData.drivingLicenseFrontPreview
                ? [
                    {
                      file_url: formData.drivingLicenseFrontPreview,
                      uploaded_at: formData.drivingLicenseIssueDate,
                      expiry_date: formData.drivingLicenseExpiryDate,
                    },
                  ]
                : []),
              ...(formData.drivingLicenseBackPreview
                ? [
                    {
                      file_url: formData.drivingLicenseBackPreview,
                      uploaded_at: formData.drivingLicenseIssueDate,
                      expiry_date: formData.drivingLicenseExpiryDate,
                    },
                  ]
                : []),
            ]
          : null,
      status:
        formData.drivingLicenseFrontPreview ||
        formData.drivingLicenseBackPreview
          ? "accepted"
          : "missing",
    },
    {
      id: "insurance_verification",
      name: "Insurance Verification",
      required: true,
      document:
        formData.insuranceVerifications?.length > 0
          ? formData.insuranceVerifications.map((iv) => ({
              file_url: iv.insuranceFileUrl,
              uploaded_at: iv.insuranceCoverageStartDate,
              expiry_date: iv.insuranceExpiryDate,
            }))
          : null,
      status:
        formData.insuranceVerifications?.length > 0 ? "accepted" : "missing",
    },
    {
      id: "proof_of_address",
      name: "Proof of Address",
      required: true,
      document:
        formData.proofOfAddress?.length > 0
          ? formData.proofOfAddress.map((doc) => {
              const issueDate = parseLocalDate(doc.utilityBillDate);
              const expiryDate = new Date(issueDate);
              expiryDate.setMonth(expiryDate.getMonth() + 3);
              const expiryStr = formatToYYYYMMDD(expiryDate);
              return {
                file_url: doc.utilityBillPreview || doc.ninPreview, // Assume one file
                uploaded_at: doc.utilityBillDate,
                expiry_date: expiryStr,
              };
            })
          : null,
      status: formData.proofOfAddress?.length > 0 ? "accepted" : "missing",
    },
    // Add more as needed, e.g., idAndDocuments if uncommented
  ].filter((doc) => doc.required || doc.document); // Show only required or existing

  // Table columns
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
        if (documents.some((doc) => doc?.file_url)) {
          return (
            <button
              onClick={() => {
                const fileUrl = documents.find((doc) => doc.file_url)?.file_url;
                if (fileUrl) {
                  window.open(fileUrl, "_blank");
                }
              }}
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

  return (
    <div className="adjust-table">
      <Table
        columns={complianceColumns}
        data={complianceDocs}
        isLoading={false}
        emptyStateIcon="📄"
        emptyStateMessage="No documents found"
        emptyStateDescription="No employee documents to review."
        itemsPerPage={10}
        currentPage={1}
        totalPages={Math.ceil(complianceDocs.length / 10)}
        onPageChange={(page) => console.log("Page changed:", page)}
      />
    </div>
  );
};

export default EmployeeDocumentsStep;

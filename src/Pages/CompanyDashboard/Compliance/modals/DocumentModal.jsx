import { useState } from "react";
import Modal from "../../../../components/Modal";
import TextAreaField from "../../../../components/Input/TextAreaField";
import { FaDownload } from "react-icons/fa";
import "../styles/StaffDetailsComplianceCheckPage.css";
import {
  normalizeText,
  getFileExtension,
  isImageFile,
} from "../../../../utils/helpers";

const DocumentModal = ({
  isOpen,
  onClose,
  document,
  onAccept,
  onReject,
  isExistingStaff,
  applicantId,
}) => {
  console.log(document);
  const [showNotes, setShowNotes] = useState(false);
  const [currentAction, setCurrentAction] = useState(null); // 'accept' or 'reject'
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAcceptClick = () => {
    setCurrentAction("accept");
    setShowNotes(true);
  };

  const handleRejectClick = () => {
    setCurrentAction("reject");
    setShowNotes(true);
  };

  const handleConfirm = async () => {
    if (!notes.trim()) {
      // Let parent handle the error toast
      return false;
    }

    setIsSubmitting(true);
    try {
      if (currentAction === "accept") {
        await onAccept(document.id, notes);
      } else if (currentAction === "reject") {
        await onReject(document.id, notes);
      }
      return true; // Success
    } catch (error) {
      console.error("Error confirming action:", error);
      return false; // Error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowNotes(false);
    setCurrentAction(null);
    setNotes("");
  };

  const handleDownload = (fileUrl, documentName, index = null) => {
    if (!fileUrl) {
      console.error("No file URL available");
      return false;
    }

    try {
      const link = window.document.createElement("a");
      const filename =
        index !== null
          ? `${documentName || "document"}-${index + 1}.${getFileExtension(
              fileUrl
            )}`
          : `${documentName || "document"}.${getFileExtension(fileUrl)}`;
      link.href = fileUrl;
      link.download = filename;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);

      return true;
    } catch (error) {
      console.error("Download error:", error);
      return false;
    }
  };

  const resetModalState = () => {
    setShowNotes(false);
    setCurrentAction(null);
    setNotes("");
  };

  if (!document) return null;

  // Get documents array, ensuring it's always an array
  const documents = Array.isArray(document.documents)
    ? document.documents
    : document.file_url
    ? [{ file_url: document.file_url, uploaded_at: document.uploaded_at }]
    : [];

  const isSingleDocument = documents.length === 1;
  const singleDoc = isSingleDocument ? documents[0] : null;

  // Create header actions conditionally
  const headerActions =
    !showNotes || documents.length > 0 ? (
      <div className="header-actions-container">
        <button
          className="header-action-button accept"
          onClick={handleAcceptClick}
          disabled={isSubmitting}
          title="Accept document"
        >
          Accept
        </button>
        <button
          className="header-action-button reject"
          onClick={handleRejectClick}
          disabled={isSubmitting}
          title="Reject document"
        >
          Reject
        </button>
        {isSingleDocument && singleDoc?.file_url && (
          <button
            className="header-action-button download"
            onClick={() => handleDownload(singleDoc.file_url, document.name)}
            disabled={isSubmitting}
            title="Download document"
          >
            <FaDownload size={12} /> Download
          </button>
        )}
      </div>
    ) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        resetModalState();
      }}
      title={`${document.name} Compliance Check`}
      message=""
      isLargeModal
      headerActions={!isExistingStaff && headerActions}
    >
      <div className="document-modal-content-wrapper">
        {/* Notes section (only when showNotes is true) */}
        {showNotes && (
          <div className="notes-section">
            <TextAreaField
              label={`${
                currentAction === "accept" ? "Acceptance" : "Rejection"
              } Notes`}
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={`Enter your ${
                currentAction === "accept" ? "acceptance" : "rejection"
              } notes...`}
              maxLength={500}
            />
          </div>
        )}

        {/* Footer actions (only when showNotes is true) */}
        {showNotes && (
          <div className="document-footer-actions">
            <div className="Desaa-Btns">
              <button
                className="accept-Btn"
                onClick={async () => {
                  const success = await handleConfirm();
                  if (success) {
                    resetModalState();
                  }
                }}
                disabled={isSubmitting || !notes.trim()}
              >
                {isSubmitting ? "Processing..." : `Confirm ${currentAction}`}
              </button>
              <button
                className="reject-Btn"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Documents display */}
        <div className="document-iframe-container">
          {documents.length > 0 ? (
            documents.map((doc, index) => {
              console.log(doc.file_url);
              return (
                <div key={index} className="document-item">
                  {!isSingleDocument && <h4>Document {index + 1}</h4>}
                  {doc.file_url ? (
                    isImageFile(doc.file_url) ? (
                      <div className="image-container">
                        <img
                          src={doc.file_url}
                          alt={`${document.name} - ${
                            isSingleDocument ? "" : `Document ${index + 1}`
                          }`}
                          className="document-image"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <iframe
                        src={doc.file_url}
                        title={`${document.name} - ${
                          isSingleDocument ? "" : `Document ${index + 1}`
                        }`}
                        className="document-iframe"
                        loading="lazy"
                      />
                    )
                  ) : (
                    <div className="no-document">
                      <p>No document available</p>
                    </div>
                  )}
                  {!isSingleDocument && (
                    <button
                      className="download-button"
                      onClick={() =>
                        handleDownload(doc.file_url, document.name, index)
                      }
                      disabled={isSubmitting}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "10px",
                        padding: "8px 16px",
                        background: "#007bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      <FaDownload size={12} /> Download Document {index + 1}
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="no-document">
              <p>No documents available</p>
            </div>
          )}
        </div>

        {/* Document details */}
        <div className="document-details">
          <h4>Document Details</h4>
          <div className="details-grid">
            {Object.entries(document).map(([key, value]) => {
              if (
                [
                  "id",
                  "file_url",
                  "description",
                  "submit",
                  "document",
                  "documents",
                  "metadata",
                ].includes(key)
              ) {
                return null;
              }

              if (key === "checked_by" && value && typeof value === "object") {
                const formattedValue = normalizeText(
                  `${value.first_name || ""} ${value.last_name || ""} (${
                    value.email || ""
                  })`
                ).trim();
                return (
                  <div key={key} className="detail-item">
                    <strong>{normalizeText(formatKey(key))}:</strong>&nbsp;
                    {formattedValue || "N/A"}
                  </div>
                );
              }

              if (value && typeof value === "object") {
                value = JSON.stringify(value);
              }

              if (
                value &&
                value !== null &&
                value !== undefined &&
                value !== ""
              ) {
                return (
                  <div key={key} className="detail-item">
                    <strong>{normalizeText(formatKey(key))}:</strong>&nbsp;
                    {normalizeText(formatValue(value))}
                  </div>
                );
              }
              return null;
            })}
            {/* Render metadata separately */}
            {document.metadata && typeof document.metadata === "object" && (
              <>
                {Object.entries(document.metadata).map(
                  ([metaKey, metaValue]) => (
                    <div key={`metadata-${metaKey}`} className="detail-item">
                      <strong>{normalizeText(formatKey(metaKey))}:</strong>
                      &nbsp;
                      {normalizeText(formatValue(metaValue))}
                    </div>
                  )
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Helper functions
const formatKey = (key) => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/([a-z])([A-Z])/g, "$1 $2");
};

const formatValue = (value) => {
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (typeof value === "string" && value.includes("T")) {
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return value;
    }
  }
  return value;
};

export default DocumentModal;

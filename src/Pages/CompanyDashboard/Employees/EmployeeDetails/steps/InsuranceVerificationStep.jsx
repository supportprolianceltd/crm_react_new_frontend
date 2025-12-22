import React, { useEffect } from "react";
import { PencilIcon } from "../../../../../assets/icons/PencilIcon";
import { IoMdClose } from "react-icons/io";
import { FiPlus, FiTrash2, FiEye } from "react-icons/fi";
import FileUploader from "../../../../../components/FileUploader/FileUploader";
import FilePreviewModal from "../../../../../components/Modal/FilePreviewModal";
import useFilePreview from "../../../../../hooks/useFilePreview";

// Insurance type options
const insuranceOptions = [
  { label: "Professional Indemnity", value: "professional_indemnity" },
  { label: "Public Liability", value: "public_liability" },
  { label: "Other", value: "other" },
];

const InsuranceVerificationStep = ({
  formData,
  isEditing,
  handleEditToggle,
  handleInputChange,
  handleInsuranceFileChange,
  removeInsuranceFile,
  insuranceFileRef,
  addInsuranceRecord,
  removeInsuranceRecord,
}) => {
  const {
    previewFile,
    previewType,
    showPreview,
    handlePreviewFile,
    closePreview,
    canPreviewFile,
  } = useFilePreview();

  // Automatically add an empty insurance record when entering edit mode if none exist
  useEffect(() => {
    if (isEditing.insurance && formData.insuranceVerifications.length === 0) {
      addInsuranceRecord();
    }
  }, [
    isEditing.insurance,
    formData.insuranceVerifications,
    addInsuranceRecord,
  ]);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === "admin" || currentUser.role === "co-admin" || currentUser.role === "root-admin";
  const hasStaffInUrl = window.location.pathname.includes("staff");
  const shouldDisableSensitiveFields = hasStaffInUrl || !isAdmin;

  if (!formData) return null;

  // Helper function to handle file preview for insurance documents
  const handleInsurancePreview = (insurance) => {
    handlePreviewFile({
      file: null,
      fileUrl: insurance.insuranceFileUrl,
      filePreview: insurance.insuranceFilePreview,
    });
  };

  // Helper function to check if insurance document can be previewed
  const canPreviewInsurance = (insurance) => {
    return canPreviewFile({
      file: insurance.insuranceFile,
      fileUrl: insurance.insuranceFileUrl,
      filePreview: insurance.insuranceFilePreview,
    });
  };

  // Get label for display (read-only mode)
  const getInsuranceLabel = (value) => {
    const option = insuranceOptions.find((opt) => opt.value === value);
    return option ? option.label : "-";
  };

  return (
    <div className="step-form">
      {/* File Preview Modal */}
      <FilePreviewModal
        showPreview={showPreview}
        previewFile={previewFile}
        previewType={previewType}
        onClose={closePreview}
      />

      <div className="info-card">
        <div className="card-header">
          <h4>Insurance Verification</h4>
          <div>
            <button
              className="edit-button"
              onClick={() => handleEditToggle("insurance")}
            >
              {isEditing.insurance ? (
                <>
                  Cancel <IoMdClose />
                </>
              ) : (
                <>
                  Edit <PencilIcon />
                </>
              )}
            </button>
          </div>
        </div>

        {formData.insuranceVerifications?.length === 0 &&
        !isEditing.insurance ? (
          <p>No insurance details available.</p>
        ) : (
          formData.insuranceVerifications?.map((insurance, index) => {
            const isLast = index === formData.insuranceVerifications.length - 1;

            return (
              <div
                key={index}
                className="info-grid"
                style={{
                  borderBottom: isLast ? "none" : "1px dashed #333",
                  padding: "20px 0",
                }}
              >
                {/* Insurance Type */}
                <div className="info-item">
                  <label>Insurance Type</label>
                  {isEditing.insurance ? (
                    <select
                      name={`insuranceType-${index}`}
                      value={insurance.insuranceType || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "insuranceVerifications",
                          "insuranceType",
                          e.target.value,
                          index
                        )
                      }
                      className="edit-input"
                    >
                      <option value="">Select Insurance Type</option>
                      {insuranceOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span>{getInsuranceLabel(insurance.insuranceType)}</span>
                  )}
                </div>

                {/* Insurance Document */}
                {(insurance.insuranceType === "professional_indemnity" ||
                  insurance.insuranceType === "public_liability") && (
                  <div className="info-item">
                    <label>Insurance Document</label>
                    {isEditing.insurance ? (
                      <div className="certificate-upload-container">
                        <FileUploader
                          title="Upload Insurance Document"
                          currentFile={insurance.insuranceFile}
                          preview={insurance.insuranceFilePreview}
                          onFileChange={(file, preview) =>
                            handleInsuranceFileChange(index, file, preview)
                          }
                          onRemove={() => removeInsuranceFile(index)}
                          ref={insuranceFileRef}
                          acceptedFileTypes="all"
                          uploadText="Click to upload insurance document"
                        />
                        {canPreviewInsurance(insurance) && (
                          <button
                            className="preview-button"
                            onClick={() => handleInsurancePreview(insurance)}
                          >
                            <FiEye /> Preview
                          </button>
                        )}
                      </div>
                    ) : (
                      <span>
                        {insurance.insuranceFileUrl ||
                        insurance.insuranceFile ? (
                          <div className="file-actions">
                            <a
                              href={insurance.insuranceFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="view-link"
                            >
                              View Document
                            </a>
                            <button
                              className="preview-button-small"
                              onClick={() => handleInsurancePreview(insurance)}
                            >
                              <FiEye />
                            </button>
                          </div>
                        ) : (
                          "-"
                        )}
                      </span>
                    )}
                  </div>
                )}

                {/* Provider Name (Professional Indemnity only) */}
                {insurance.insuranceType === "professional_indemnity" && (
                  <div className="info-item">
                    <label>Provider Name</label>
                    {isEditing.insurance ? (
                      <input
                        name={`insuranceProviderName-${index}`}
                        value={insurance.insuranceProviderName || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "insuranceVerifications",
                            "insuranceProviderName",
                            e.target.value,
                            index
                          )
                        }
                        className="edit-input"
                      />
                    ) : (
                      <span>{insurance.insuranceProviderName || "-"}</span>
                    )}
                  </div>
                )}

                {/* Expiry + Start Date */}
                {(insurance.insuranceType === "professional_indemnity" ||
                  insurance.insuranceType === "public_liability") && (
                  <>
                    <div className="info-item">
                      <label>Expiry Date</label>
                      {isEditing.insurance ? (
                        <input
                          name={`insuranceExpiryDate-${index}`}
                          type="date"
                          value={insurance.insuranceExpiryDate || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "insuranceVerifications",
                              "insuranceExpiryDate",
                              e.target.value,
                              index
                            )
                          }
                          className="edit-input"
                        />
                      ) : (
                        <span>{insurance.insuranceExpiryDate || "-"}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Coverage Start Date</label>
                      {isEditing.insurance ? (
                        <input
                          name={`insuranceCoverageStartDate-${index}`}
                          type="date"
                          value={insurance.insuranceCoverageStartDate || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "insuranceVerifications",
                              "insuranceCoverageStartDate",
                              e.target.value,
                              index
                            )
                          }
                          className="edit-input"
                        />
                      ) : (
                        <span>
                          {insurance.insuranceCoverageStartDate || "-"}
                        </span>
                      )}
                    </div>
                  </>
                )}

                {/* Phone Number (Public Liability only) */}
                {insurance.insuranceType === "public_liability" && (
                  <div className="info-item">
                    <label>Phone Number</label>
                    {isEditing.insurance ? (
                      <input
                        type="text"
                        name={`insurancePhone-${index}`}
                        value={insurance.insurancePhone || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "insuranceVerifications",
                            "insurancePhone",
                            e.target.value,
                            index
                          )
                        }
                        className="edit-input"
                      />
                    ) : (
                      <span>{insurance.insurancePhone || "-"}</span>
                    )}
                  </div>
                )}

                {/* Remove Button */}
                {isEditing.insurance &&
                  formData.insuranceVerifications.length > 1 && (
                    <div className="button-container">
                      <button
                        className="icon-button remove-icon-button"
                        onClick={() => removeInsuranceRecord(index)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  )}
              </div>
            );
          })
        )}

        {/* Add Button */}
        {isEditing.insurance && (
          <button
            className="icon-button add-icon-button"
            onClick={addInsuranceRecord}
          >
            <FiPlus />
          </button>
        )}
     
      {(() => {
        const lastUpdated =
          formData.lastUpdatedBy || formData.last_updated_by || formData.profile?.last_updated_by || null;
        if (!lastUpdated) return null;
        return (
          <div className="last-edited-by">
            Last Edited By : {lastUpdated.first_name} {" "}
            {lastUpdated.last_name} - {lastUpdated.email}
          </div>
        );
      })()}
      </div>
    </div>
  );
};

export default InsuranceVerificationStep;

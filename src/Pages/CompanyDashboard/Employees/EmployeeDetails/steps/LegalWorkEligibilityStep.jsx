import React, { useEffect } from "react";
import { PencilIcon } from "../../../../../assets/icons/PencilIcon";
import { IoMdClose } from "react-icons/io";
import { FiPlus, FiTrash2, FiEye } from "react-icons/fi";
import FileUploader from "../../../../../components/FileUploader/FileUploader";
import FilePreviewModal from "../../../../../components/Modal/FilePreviewModal";
import useFilePreview from "../../../../../hooks/useFilePreview";
import useCountries from "../../../../../hooks/useCountries";

// Evidence options
const evidenceOptions = [
  { label: "Yes", value: true },
  { label: "No", value: false },
];

const LegalWorkEligibilityStep = ({
  formData,
  isEditing,
  handleEditToggle,
  handleInputChange,
  handleRightToRentFileChange,
  removeRightToRentFile,
  rightToRentFileRef,
  handleRightToWorkFileChange,
  removeRightToWorkFile,
  rightToWorkFileRef,
  addLegalRecord,
  removeLegalRecord,
}) => {
  const {
    previewFile,
    previewType,
    showPreview,
    handlePreviewFile,
    closePreview,
    canPreviewFile,
  } = useFilePreview();

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === "admin" || currentUser.role === "co-admin" || currentUser.role === "root-admin";
  const hasStaffInUrl = window.location.pathname.includes("staff");
  const shouldDisableSensitiveFields = hasStaffInUrl || !isAdmin;

  const countries = useCountries();

  // Automatically add the right to work record when entering edit mode if none exist
  useEffect(() => {
    if (isEditing.legal && formData.legalVerifications.length === 0) {
      addLegalRecord();
    }
  }, [isEditing.legal, formData.legalVerifications, addLegalRecord]);

  if (!formData) return null;

  // Helper function to handle file preview for right to work
  const handleRightToWorkPreview = () => {
    if (formData.legalVerifications[0]) {
      handlePreviewFile({
        file: formData.legalVerifications[0].rightToWorkFile,
        fileUrl: formData.legalVerifications[0].rightToWorkFileUrl,
        filePreview: formData.legalVerifications[0].rightToWorkFilePreview,
      });
    }
  };

  // Helper function to check if right to work can be previewed
  const canPreviewRightToWork = () => {
    if (formData.legalVerifications[0]) {
      return canPreviewFile({
        file: formData.legalVerifications[0].rightToWorkFile,
        fileUrl: formData.legalVerifications[0].rightToWorkFileUrl,
        filePreview: formData.legalVerifications[0].rightToWorkFilePreview,
      });
    }
    return false;
  };

  // Helper function to handle file preview for legal documents
  const handleLegalDocumentPreview = (legal) => {
    handlePreviewFile({
      file: null,
      fileUrl: legal.rightToRentFileUrl,
      filePreview: legal.rightToRentFilePreview,
    });
  };

  // Helper function to check if legal document can be previewed
  const canPreviewLegalDocument = (legal) => {
    return canPreviewFile({
      file: legal.rightToRentFile,
      fileUrl: legal.rightToRentFileUrl,
      filePreview: legal.rightToRentFilePreview,
    });
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
          <h4>Legal & Work Eligibility</h4>
          <div>
            <button
              className="edit-button"
              onClick={() => handleEditToggle("legal")}
            >
              {isEditing.legal ? (
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

        {/* Right to Work Section */}
        <h5 style={{ marginTop: "20px", marginBottom: "10px" }}>
          Right to Work
        </h5>
        {formData.legalVerifications[0] && (
          <div className="info-grid">
            <div className="info-item">
              <label>Right to Work Status</label>
              {isEditing.legal ? (
                <select
                  name="rightToWorkStatus"
                  value={formData.legalVerifications[0].rightToWorkStatus || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "legalVerifications",
                      "rightToWorkStatus",
                      e.target.value,
                      0
                    )
                  }
                  className="edit-input"
                >
                  <option value="">Select Status</option>
                  <option value="Citizen">Citizen</option>
                  <option value="Visa Holder">Visa Holder</option>
                  <option value="Work Permit">Work Permit</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <span>{formData.legalVerifications[0].rightToWorkStatus || "-"}</span>
              )}
            </div>
            <div className="info-item">
              <label>Passport Holder</label>
              {isEditing.legal ? (
                <select
                  name="passportHolder"
                  value={formData.legalVerifications[0].passportHolder || ""}
                  onChange={(e) =>
                    handleInputChange("legalVerifications", "passportHolder", e.target.value, 0)
                  }
                  className="edit-input"
                >
                  <option value="">Select Option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              ) : (
                <span>{formData.legalVerifications[0].passportHolder || "-"}</span>
              )}
            </div>
            <div className="info-item">
              <label>Document Type</label>
              {isEditing.legal ? (
                <select
                  name="rightToWorkDocumentType"
                  value={formData.legalVerifications[0].rightToWorkDocumentType || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "legalVerifications",
                      "rightToWorkDocumentType",
                      e.target.value,
                      0
                    )
                  }
                  className="edit-input"
                >
                  <option value="">Select Document Type</option>
                  <option value="Biometric Residence Permit">
                    Biometric Residence Permit
                  </option>
                  <option value="Passport">Passport</option>
                  <option value="National ID">National ID</option>
                  <option value="Residence Card">Residence Card</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <span>{formData.legalVerifications[0].rightToWorkDocumentType || "-"}</span>
              )}
            </div>
            <div className="info-item">
              <label>Document Number</label>
              {isEditing.legal ? (
                <input
                  name="rightToWorkDocumentNumber"
                  value={formData.legalVerifications[0].rightToWorkDocumentNumber || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "legalVerifications",
                      "rightToWorkDocumentNumber",
                      e.target.value,
                      0
                    )
                  }
                  className="edit-input"
                />
              ) : (
                <span>{formData.legalVerifications[0].rightToWorkDocumentNumber || "-"}</span>
              )}
            </div>
            <div className="info-item">
              <label>Document Expiry Date</label>
              {isEditing.legal ? (
                <input
                  name="rightToWorkDocumentExpiryDate"
                  type="date"
                  value={formData.legalVerifications[0].rightToWorkDocumentExpiryDate || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "legalVerifications",
                      "rightToWorkDocumentExpiryDate",
                      e.target.value,
                      0
                    )
                  }
                  className="edit-input"
                />
              ) : (
                <span>{formData.legalVerifications[0].rightToWorkDocumentExpiryDate || "-"}</span>
              )}
            </div>
            <div className="info-item">
              <label>Share Code</label>
              {isEditing.legal ? (
                <input
                  name="shareCode"
                  value={formData.legalVerifications[0].shareCode || ""}
                  onChange={(e) =>
                    handleInputChange("legalVerifications", "shareCode", e.target.value, 0)
                  }
                  className="edit-input"
                />
              ) : (
                <span>{formData.legalVerifications[0].shareCode || "-"}</span>
              )}
            </div>
            <div className="info-item">
              <label>Supporting Document</label>
              {isEditing.legal ? (
                <div className="certificate-upload-container">
                  <FileUploader
                    title="Upload Supporting Document"
                    currentFile={formData.legalVerifications[0].rightToWorkFile}
                    preview={formData.legalVerifications[0].rightToWorkFilePreview}
                    onFileChange={(file, preview) =>
                      handleRightToRentFileChange(0, file, preview)
                    }
                    onRemove={() => removeRightToWorkFile()}
                    ref={rightToWorkFileRef}
                    acceptedFileTypes="all"
                    uploadText="Click to upload supporting document"
                  />
                  {canPreviewRightToWork() && (
                    <button
                      className="preview-button"
                      onClick={handleRightToWorkPreview}
                    >
                      <FiEye /> Preview
                    </button>
                  )}
                </div>
              ) : (
                <span>
                  {formData.legalVerifications[0].rightToWorkFileUrl || formData.legalVerifications[0].rightToWorkFile ? (
                    <div className="file-actions">
                      <a
                        href={formData.legalVerifications[0].rightToWorkFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-link"
                      >
                        View Document
                      </a>
                      <button
                        className="preview-button-small"
                        onClick={handleRightToWorkPreview}
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
            <div className="info-item">
              <label>Country of Issue</label>
              {isEditing.legal ? (
                <select
                  name="countryOfIssue"
                  value={formData.legalVerifications[0].countryOfIssue || ""}
                  onChange={(e) =>
                    handleInputChange("legalVerifications", "countryOfIssue", e.target.value, 0)
                  }
                  className="edit-input"
                >
                  <option value="">Select Country</option>
                  {countries?.map((country) => (
                    <option key={country.cca3} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              ) : (
                <span>{formData.legalVerifications[0].countryOfIssue || "-"}</span>
              )}
            </div>
            <div className="info-item">
              <label>Work Restrictions</label>
              {isEditing.legal ? (
                <input
                  name="workRestrictions"
                  value={formData.legalVerifications[0].workRestrictions || ""}
                  onChange={(e) =>
                    handleInputChange("legalVerifications", "workRestrictions", e.target.value, 0)
                  }
                  className="edit-input"
                  placeholder="Describe any restrictions"
                />
              ) : (
                <span>{formData.legalVerifications[0].workRestrictions || "-"}</span>
              )}
            </div>
          </div>
        )}

        {/* Legal Verifications Section */}
        <h5 style={{ marginTop: "30px", marginBottom: "10px" }}>
          Right to Rent
        </h5>
        {formData.legalVerifications?.slice(1).length === 0 && !isEditing.legal ? (
          <p>No legal or work eligibility details available.</p>
        ) : (
          formData.legalVerifications?.slice(1).map((legal, index) => {
            const actualIndex = index + 1;
            const isLast = actualIndex === formData.legalVerifications.length - 1;

            return (
              <div
                key={actualIndex}
                className="info-grid"
                style={{
                  borderBottom: isLast ? "none" : "1px dashed #333",
                  padding: "20px 0",
                }}
              >
                {/* Evidence of Right to Rent */}
                <div className="info-item">
                  <label>Evidence of Right to Rent</label>
                  {isEditing.legal ? (
                    <select
                      name={`evidenceRightToRent-${actualIndex}`}
                      value={legal.evidenceRightToRent ? "true" : "false"}
                      onChange={(e) =>
                        handleInputChange(
                          "legalVerifications",
                          "evidenceRightToRent",
                          e.target.value === "true",
                          actualIndex
                        )
                      }
                      className="edit-input"
                    >
                      {evidenceOptions.map((option) => (
                        <option
                          key={option.value.toString()}
                          value={option.value.toString()}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span>{legal.evidenceRightToRent ? "Yes" : "No"}</span>
                  )}
                </div>

                {/* Right to Rent Document */}
                {legal.evidenceRightToRent && (
                  <div className="info-item">
                    <label>Right to Rent Document</label>
                    {isEditing.legal ? (
                      <div className="certificate-upload-container">
                        <FileUploader
                          title="Upload Right to Rent Document"
                          currentFile={legal.rightToRentFile}
                          preview={legal.rightToRentFilePreview}
                          onFileChange={(file, preview) =>
                            handleRightToRentFileChange(actualIndex, file, preview)
                          }
                          onRemove={() => removeRightToRentFile(actualIndex)}
                          ref={rightToRentFileRef}
                          acceptedFileTypes="all"
                          uploadText="Click to upload right to rent document"
                        />
                        {canPreviewLegalDocument(legal) && (
                          <button
                            className="preview-button"
                            onClick={() => handleLegalDocumentPreview(legal)}
                          >
                            <FiEye /> Preview
                          </button>
                        )}
                      </div>
                    ) : (
                      <span>
                        {legal.rightToRentFileUrl || legal.rightToRentFile ? (
                          <div className="file-actions">
                            <a
                              href={legal.rightToRentFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="view-link"
                            >
                              View Document
                            </a>
                            <button
                              className="preview-button-small"
                              onClick={() => handleLegalDocumentPreview(legal)}
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

                {/* Work Phone Number */}
                <div className="info-item">
                  <label>Work Phone Number</label>
                  {isEditing.legal ? (
                    <input
                      type="text"
                      name={`legalWorkPhone-${actualIndex}`}
                      value={legal.legalWorkPhone || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "legalVerifications",
                          "legalWorkPhone",
                          e.target.value,
                          actualIndex
                        )
                      }
                      className="edit-input"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <span>{legal.legalWorkPhone || "-"}</span>
                  )}
                </div>

                {/* Remove Button */}
                {isEditing.legal && (
                  <div className="button-container">
                    <button
                      className="icon-button remove-icon-button"
                      onClick={() => removeLegalRecord(actualIndex)}
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
        {isEditing.legal && (
          <button
            className="icon-button add-icon-button"
            onClick={addLegalRecord}
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

export default LegalWorkEligibilityStep;

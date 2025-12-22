import { useEffect } from "react";
import { PencilIcon } from "../../../../assets/icons/PencilIcon";
import { IoMdClose } from "react-icons/io";
import { FiEye } from "react-icons/fi";
import FileUploader from "../../../../components/FileUploader/FileUploader";
import FilePreviewModal from "../../../../components/Modal/FilePreviewModal";
import useFilePreview from "../../../../hooks/useFilePreview";
import useCountries from "../../../../hooks/useCountries";

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

  const countries = useCountries();

  // Automatically add an empty legal record when entering edit mode if none exist
  useEffect(() => {
    if (isEditing.legal && formData.legalVerifications.length === 0) {
      addLegalRecord();
    }
  }, [isEditing.legal, formData.legalVerifications, addLegalRecord]);

  if (!formData) return null;

  // Helper function to handle file preview for right to work
  const handleRightToWorkPreview = () => {
    handlePreviewFile({
      file: formData.rightToWorkFile,
      fileUrl: formData.rightToWorkFileUrl,
      filePreview: formData.rightToWorkFilePreview,
    });
  };

  // Helper function to check if right to work can be previewed
  const canPreviewRightToWork = () => {
    return canPreviewFile({
      file: formData.rightToWorkFile,
      fileUrl: formData.rightToWorkFileUrl,
      filePreview: formData.rightToWorkFilePreview,
    });
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
        <div className="info-grid">
          <div className="info-item">
            <label>Right to Work Status</label>
            {isEditing.legal ? (
              <select
                name="rightToWorkStatus"
                value={formData.rightToWorkStatus || ""}
                onChange={(e) =>
                  handleInputChange(
                    "legal",
                    "rightToWorkStatus",
                    e.target.value
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
              <span>{formData.rightToWorkStatus || "-"}</span>
            )}
          </div>
          <div className="info-item">
            <label>Passport Holder</label>
            {isEditing.legal ? (
              <select
                name="passportHolder"
                value={formData.passportHolder || ""}
                onChange={(e) =>
                  handleInputChange("legal", "passportHolder", e.target.value)
                }
                className="edit-input"
              >
                <option value="">Select Option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            ) : (
              <span>{formData.passportHolder || "-"}</span>
            )}
          </div>
          <div className="info-item">
            <label>Document Type</label>
            {isEditing.legal ? (
              <select
                name="rightToWorkDocumentType"
                value={formData.rightToWorkDocumentType || ""}
                onChange={(e) =>
                  handleInputChange(
                    "legal",
                    "rightToWorkDocumentType",
                    e.target.value
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
              <span>{formData.rightToWorkDocumentType || "-"}</span>
            )}
          </div>
          <div className="info-item">
            <label>Document Number</label>
            {isEditing.legal ? (
              <input
                name="rightToWorkDocumentNumber"
                value={formData.rightToWorkDocumentNumber || ""}
                onChange={(e) =>
                  handleInputChange(
                    "legal",
                    "rightToWorkDocumentNumber",
                    e.target.value
                  )
                }
                className="edit-input"
              />
            ) : (
              <span>{formData.rightToWorkDocumentNumber || "-"}</span>
            )}
          </div>
          <div className="info-item">
            <label>Document Expiry Date</label>
            {isEditing.legal ? (
              <input
                name="rightToWorkDocumentExpiryDate"
                type="date"
                value={formData.rightToWorkDocumentExpiryDate || ""}
                onChange={(e) =>
                  handleInputChange(
                    "legal",
                    "rightToWorkDocumentExpiryDate",
                    e.target.value
                  )
                }
                className="edit-input"
              />
            ) : (
              <span>{formData.rightToWorkDocumentExpiryDate || "-"}</span>
            )}
          </div>
          <div className="info-item">
            <label>Share Code</label>
            {isEditing.legal ? (
              <input
                name="shareCode"
                value={formData.shareCode || ""}
                onChange={(e) =>
                  handleInputChange("legal", "shareCode", e.target.value)
                }
                className="edit-input"
              />
            ) : (
              <span>{formData.shareCode || "-"}</span>
            )}
          </div>
          <div className="info-item">
            <label>Supporting Document</label>
            {isEditing.legal ? (
              <div className="certificate-upload-container">
                <FileUploader
                  title="Upload Supporting Document"
                  currentFile={formData.rightToWorkFile}
                  preview={formData.rightToWorkFilePreview}
                  onFileChange={handleRightToWorkFileChange}
                  onRemove={removeRightToWorkFile}
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
                {formData.rightToWorkFileUrl || formData.rightToWorkFile ? (
                  <div className="file-actions">
                    <a
                      href={formData.rightToWorkFileUrl}
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
                value={formData.countryOfIssue || ""}
                onChange={(e) =>
                  handleInputChange("legal", "countryOfIssue", e.target.value)
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
              <span>{formData.countryOfIssue || "-"}</span>
            )}
          </div>
          <div className="info-item">
            <label>Work Restrictions</label>
            {isEditing.legal ? (
              <input
                name="workRestrictions"
                value={formData.workRestrictions || ""}
                onChange={(e) =>
                  handleInputChange("legal", "workRestrictions", e.target.value)
                }
                className="edit-input"
                placeholder="Describe any restrictions"
              />
            ) : (
              <span>{formData.workRestrictions || "-"}</span>
            )}
          </div>
        </div>

        {/* Legal Verifications Section */}
        <h5 style={{ marginTop: "30px", marginBottom: "10px" }}>
          Right to Rent
        </h5>
        {formData.legalVerifications?.length === 0 && !isEditing.legal ? (
          <p>No legal or work eligibility details available.</p>
        ) : (
          formData.legalVerifications?.map((legal, index) => {
            const isLast = index === formData.legalVerifications.length - 1;

            return (
              <div
                key={index}
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
                      name={`evidenceRightToRent-${index}`}
                      value={legal.evidenceRightToRent ? "true" : "false"}
                      onChange={(e) =>
                        handleInputChange(
                          "legalVerifications",
                          "evidenceRightToRent",
                          e.target.value === "true",
                          index
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
                            handleRightToRentFileChange(index, file, preview)
                          }
                          onRemove={() => removeRightToRentFile(index)}
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
                      name={`legalWorkPhone-${index}`}
                      value={legal.legalWorkPhone || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "legalVerifications",
                          "legalWorkPhone",
                          e.target.value,
                          index
                        )
                      }
                      className="edit-input"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <span>{legal.legalWorkPhone || "-"}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LegalWorkEligibilityStep;

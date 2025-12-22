import { PencilIcon } from "../../../../assets/icons/PencilIcon";
import { IoMdClose } from "react-icons/io";
import { FiEye } from "react-icons/fi";
import FileUploader from "../../../../components/FileUploader/FileUploader";
import FilePreviewModal from "../../../../components/Modal/FilePreviewModal";
import useFilePreview from "../../../../hooks/useFilePreview";
import useCountries from "../../../../hooks/useCountries";

const RightToWorkStep = ({
  formData,
  isEditing,
  handleEditToggle,
  handleInputChange,
  handleRightToWorkFileChange,
  removeRightToWorkFile,
  rightToWorkFileRef,
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
          <h4>Right To Work</h4>
          <button
            className="edit-button"
            onClick={() => handleEditToggle("rightToWork")}
          >
            {isEditing.rightToWork ? (
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
        <div className="info-grid">
          <div className="info-item">
            <label>Right to Work Status</label>
            {isEditing.rightToWork ? (
              <select
                name="rightToWorkStatus"
                value={formData.rightToWorkStatus || ""}
                onChange={(e) =>
                  handleInputChange(
                    "rightToWork",
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
            {isEditing.rightToWork ? (
              <select
                name="passportHolder"
                value={formData.passportHolder || ""}
                onChange={(e) =>
                  handleInputChange(
                    "rightToWork",
                    "passportHolder",
                    e.target.value
                  )
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
            {isEditing.rightToWork ? (
              <select
                name="rightToWorkDocumentType"
                value={formData.rightToWorkDocumentType || ""}
                onChange={(e) =>
                  handleInputChange(
                    "rightToWork",
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
            {isEditing.rightToWork ? (
              <input
                name="rightToWorkDocumentNumber"
                value={formData.rightToWorkDocumentNumber || ""}
                onChange={(e) =>
                  handleInputChange(
                    "rightToWork",
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
            {isEditing.rightToWork ? (
              <input
                name="rightToWorkDocumentExpiryDate"
                type="date"
                value={formData.rightToWorkDocumentExpiryDate || ""}
                onChange={(e) =>
                  handleInputChange(
                    "rightToWork",
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
            {isEditing.rightToWork ? (
              <input
                name="shareCode"
                value={formData.shareCode || ""}
                onChange={(e) =>
                  handleInputChange("rightToWork", "shareCode", e.target.value)
                }
                className="edit-input"
              />
            ) : (
              <span>{formData.shareCode || "-"}</span>
            )}
          </div>
          <div className="info-item">
            <label>Supporting Document</label>
            {isEditing.rightToWork ? (
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
            {isEditing.rightToWork ? (
              <select
                name="countryOfIssue"
                value={formData.countryOfIssue || ""}
                onChange={(e) =>
                  handleInputChange(
                    "rightToWork",
                    "countryOfIssue",
                    e.target.value
                  )
                }
                className="edit-input"
              >
                <option value="">Select Country</option>
                {countries?.map((country) => (
                  <option key={country.cca3} value={country.name.common}>
                    {country.name.common}
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
            {isEditing.rightToWork ? (
              <input
                name="workRestrictions"
                value={formData.workRestrictions || ""}
                onChange={(e) =>
                  handleInputChange(
                    "rightToWork",
                    "workRestrictions",
                    e.target.value
                  )
                }
                className="edit-input"
                placeholder="Describe any restrictions"
              />
            ) : (
              <span>{formData.workRestrictions || "-"}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightToWorkStep;

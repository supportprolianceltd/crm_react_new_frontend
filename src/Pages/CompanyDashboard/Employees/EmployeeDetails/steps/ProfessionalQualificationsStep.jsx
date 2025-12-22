import React, { useEffect } from "react";
import { PencilIcon } from "../../../../../assets/icons/PencilIcon";
import { IoMdClose } from "react-icons/io";
import { FiPlus, FiTrash2, FiEye } from "react-icons/fi";
import FileUploader from "../../../../../components/FileUploader/FileUploader";
import FilePreviewModal from "../../../../../components/Modal/FilePreviewModal";
import useFilePreview from "../../../../../hooks/useFilePreview";

const ProfessionalQualificationsStep = ({
  formData,
  isEditing,
  handleEditToggle,
  handleInputChange,
  handleProfessionalQualificationCertificateChange,
  removeProfessionalQualificationCertificate,
  professionalQualificationCertificateRef,
  addProfessionalQualification,
  removeProfessionalQualification,
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

  // Automatically add an empty qualification record when entering edit mode if none exist
  useEffect(() => {
    if (
      isEditing.professionalQualifications &&
      formData.professionalQualifications.length === 0
    ) {
      addProfessionalQualification();
    }
  }, [
    isEditing.professionalQualifications,
    formData.professionalQualifications,
    addProfessionalQualification,
  ]);

  if (!formData) {
    return null;
  }

  // Helper function to handle file preview for qualifications
  const handleQualificationPreview = (qualification) => {
    handlePreviewFile({
      file: qualification.certificate,
      fileUrl: qualification.certificateUrl,
      filePreview: qualification.certificatePreview,
    });
  };

  // Helper function to check if qualification can be previewed
  const canPreviewQualification = (qualification) => {
    return canPreviewFile({
      file: qualification.certificate,
      fileUrl: qualification.certificateUrl,
      filePreview: qualification.certificatePreview,
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
          <h4>Professional Qualifications</h4>
          <div>
            <button
              className="edit-button"
              onClick={() => handleEditToggle("professionalQualifications")}
            >
              {isEditing.professionalQualifications ? (
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
        {formData.professionalQualifications.length === 0 &&
        !isEditing.professionalQualifications ? (
          <p>No professional qualifications available.</p>
        ) : (
          formData.professionalQualifications.map((qualification, index) => {
            const isLast =
              index === formData.professionalQualifications.length - 1;

            return (
              <div
                key={index}
                className="info-grid"
                style={{
                  borderBottom: isLast ? "none" : "1px dashed #333",
                  padding: "20px 0",
                }}
              >
                <div className="info-item">
                  <label>Qualification Name</label>
                  {isEditing.professionalQualifications ? (
                    <input
                      name={`name-${index}`}
                      value={qualification.name || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "professionalQualifications",
                          "name",
                          e.target.value,
                          index
                        )
                      }
                      className="edit-input"
                    />
                  ) : (
                    <span>{qualification.name || "-"}</span>
                  )}
                </div>

                <div className="info-item">
                  <label>Qualification Certificate</label>
                  {isEditing.professionalQualifications ? (
                    <div className="certificate-upload-container">
                      <FileUploader
                        title="Upload Qualification Certificate"
                        currentFile={qualification.certificate}
                        preview={qualification.certificatePreview}
                        onFileChange={(file, preview) =>
                          handleProfessionalQualificationCertificateChange(
                            index,
                            file,
                            preview
                          )
                        }
                        onRemove={() =>
                          removeProfessionalQualificationCertificate(index)
                        }
                        ref={professionalQualificationCertificateRef}
                        acceptedFileTypes="all"
                        uploadText="Click to upload certificate"
                      />
                      {canPreviewQualification(qualification) && (
                        <button
                          className="preview-button"
                          onClick={() =>
                            handleQualificationPreview(qualification)
                          }
                        >
                          <FiEye /> Preview
                        </button>
                      )}
                    </div>
                  ) : (
                    <span>
                      {qualification.certificateUrl ||
                      qualification.certificate ? (
                        <div className="file-actions">
                          <a
                            href={qualification.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="view-link"
                          >
                            View Document
                          </a>
                          <button
                            className="preview-button-small"
                            onClick={() =>
                              handleQualificationPreview(qualification)
                            }
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

                {/* Remove Button */}
                {isEditing.professionalQualifications &&
                  formData.professionalQualifications.length > 1 && (
                    <div className="button-container">
                      <button
                        className="icon-button remove-icon-button"
                        onClick={() => removeProfessionalQualification(index)}
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
        {isEditing.professionalQualifications && (
          <button
            className="icon-button add-icon-button"
            onClick={addProfessionalQualification}
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

export default ProfessionalQualificationsStep;

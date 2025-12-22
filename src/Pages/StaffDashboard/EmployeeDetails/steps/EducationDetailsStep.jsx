import React, { useEffect, useState } from "react";
import { PencilIcon } from "../../../../assets/icons/PencilIcon";
import { IoMdClose } from "react-icons/io";
import { FiPlus, FiTrash2, FiEye, FiDownload } from "react-icons/fi";
import FileUploader from "../../../../components/FileUploader/FileUploader";
import FilePreviewModal from "../../../../components/Modal/FilePreviewModal";
import useFilePreview from "../../../../hooks/useFilePreview";

const EducationDetailsStep = ({
  formData,
  isEditing,
  handleEditToggle,
  handleInputChange,
  handleEducationCertificateChange,
  removeEducationCertificate,
  educationCertificateRef,
  addEducationRecord,
  removeEducationRecord,
}) => {
  const {
    previewFile,
    previewType,
    showPreview,
    handlePreviewFile,
    closePreview,
    canPreviewFile,
  } = useFilePreview();

  const [universities, setUniversities] = useState([]);

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json"
    )
      .then((res) => res.json())
      .then((data) => setUniversities(data))
      .catch((err) => console.error("Error fetching universities:", err));
  }, []);

  useEffect(() => {
    if (isEditing.education && formData.educationDetails.length === 0) {
      addEducationRecord();
    }
  }, [isEditing.education, formData.educationDetails, addEducationRecord]);

  if (!formData) return null;

  const disabledFields = ["Course of Study", "Start Year", "End Year"];

  // Helper function to handle file preview for education
  const handleEducationPreview = (education) => {
    handlePreviewFile({
      file: null,
      fileUrl: education.certificateUrl,
      filePreview: education.certificatePreview,
    });
  };

  // Helper function to check if education can be previewed
  const canPreviewEducation = (education) => {
    return canPreviewFile({
      file: education.certificate,
      fileUrl: education.certificateUrl,
      filePreview: education.certificatePreview,
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
          <h4>Education Details</h4>
          <div>
            <button
              className="edit-button"
              onClick={() => handleEditToggle("education")}
            >
              {isEditing.education ? (
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

        {formData.educationDetails.length === 0 && !isEditing.education ? (
          <p>No education details available.</p>
        ) : (
          formData.educationDetails.map((education, index) => {
            const isLast = index === formData.educationDetails.length - 1;

            return (
              <div
                key={index}
                className="info-grid"
                style={{
                  borderBottom: isLast ? "none" : "1px dashed #333",
                  padding: "20px 0",
                }}
              >
                {/* Institution */}
                <div className="info-item">
                  <label>Institution</label>
                  {isEditing.education ? (
                    <select
                      name={`institution-${index}`}
                      value={education.institution || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "educationDetails",
                          "institution",
                          e.target.value,
                          index
                        )
                      }
                      className="edit-input"
                    >
                      <option value="">Select Institution</option>
                      {universities.map((uni) => (
                        <option key={uni.name} value={uni.name}>
                          {uni.name}
                        </option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <span>{education.institution || "-"}</span>
                  )}
                </div>

                {/* Highest Qualification */}
                <div className="info-item">
                  <label>Highest Qualification</label>
                  {isEditing.education ? (
                    <input
                      name={`highestQualification-${index}`}
                      value={education.highestQualification || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "educationDetails",
                          "highestQualification",
                          e.target.value,
                          index
                        )
                      }
                      className="edit-input"
                    />
                  ) : (
                    <span>{education.highestQualification || "-"}</span>
                  )}
                </div>

                {/* Course of Study */}
                <div
                  className={`info-item ${
                    !isEditing.education && disabledFields.includes("End Year")
                      ? "disabled"
                      : ""
                  }`}
                >
                  <label>Course of Study</label>
                  {isEditing.education ? (
                    <input
                      name={`courseOfStudy-${index}`}
                      value={education.courseOfStudy || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "educationDetails",
                          "courseOfStudy",
                          e.target.value,
                          index
                        )
                      }
                      className="edit-input"
                    />
                  ) : (
                    <span>{education.courseOfStudy || "-"}</span>
                  )}
                </div>

                {/* Start Year */}
                <div
                  className={`info-item ${
                    !isEditing.education && disabledFields.includes("End Year")
                      ? "disabled"
                      : ""
                  }`}
                >
                  <label>Start Year</label>
                  {isEditing.education ? (
                    <input
                      type="number"
                      name={`startYear-${index}`}
                      value={education.startYear || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "educationDetails",
                          "startYear",
                          e.target.value,
                          index
                        )
                      }
                      className="edit-input"
                      placeholder="e.g., 2012"
                    />
                  ) : (
                    <span>{education.startYear || "-"}</span>
                  )}
                </div>

                {/* End Year */}
                <div
                  className={`info-item ${
                    !isEditing.education && disabledFields.includes("End Year")
                      ? "disabled"
                      : ""
                  }`}
                >
                  <label>End Year</label>
                  {isEditing.education ? (
                    <input
                      type="number"
                      name={`endYear-${index}`}
                      value={education.endYear || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "educationDetails",
                          "endYear",
                          e.target.value,
                          index
                        )
                      }
                      className="edit-input"
                      placeholder="e.g., 2016"
                    />
                  ) : (
                    <span>{education.endYear || "-"}</span>
                  )}
                </div>

                {/* Education Certificate */}
                <div className="info-item">
                  <label>Education Certificate</label>
                  {isEditing.education ? (
                    <div className="certificate-upload-container">
                      <FileUploader
                        title="Upload Education Certificate"
                        currentFile={education.certificate}
                        preview={education.certificatePreview}
                        onFileChange={(file, preview) =>
                          handleEducationCertificateChange(index, file, preview)
                        }
                        onRemove={() => removeEducationCertificate(index)}
                        ref={educationCertificateRef}
                        acceptedFileTypes="all"
                        uploadText="Click to upload certificate"
                      />
                      {canPreviewEducation(education) && (
                        <button
                          className="preview-button"
                          onClick={() => handleEducationPreview(education)}
                        >
                          <FiEye /> Preview
                        </button>
                      )}
                    </div>
                  ) : (
                    <span>
                      {education.certificateUrl || education.certificate ? (
                        <div className="file-actions">
                          <a
                            href={education.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="view-link"
                          >
                            View Document
                          </a>
                          <button
                            className="preview-button-small"
                            onClick={() => handleEducationPreview(education)}
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

                {/* Skills */}
                <div
                  className={`info-item ${
                    !isEditing.education && disabledFields.includes("Skills")
                      ? "disabled"
                      : ""
                  }`}
                >
                  <label>Skills (optional)</label>
                  {isEditing.education ? (
                    <input
                      name={`skills-${index}`}
                      value={education.skills || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "educationDetails",
                          "skills",
                          e.target.value,
                          index
                        )
                      }
                      placeholder="List relevant skills separated by commas"
                      className="edit-input"
                    />
                  ) : (
                    <span>{education.skills || "-"}</span>
                  )}
                </div>

                {/* Remove Button */}
                {isEditing.education && (
                  <div className="button-container">
                    <button
                      className="icon-button remove-icon-button"
                      onClick={() => removeEducationRecord(index)}
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
        {isEditing.education && (
          <button
            className="icon-button add-icon-button"
            onClick={addEducationRecord}
          >
            <FiPlus />
          </button>
        )}
      </div>
    </div>
  );
};

export default EducationDetailsStep;

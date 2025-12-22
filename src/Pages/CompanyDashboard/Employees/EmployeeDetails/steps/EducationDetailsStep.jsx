// steps/EducationDetailsStep.jsx
import React, { useEffect, useState } from "react";
import { PencilIcon } from "../../../../../assets/icons/PencilIcon";
import { IoMdClose } from "react-icons/io";
import { FiPlus, FiTrash2, FiEye, FiDownload } from "react-icons/fi";
import FileUploader from "../../../../../components/FileUploader/FileUploader";
import FilePreviewModal from "../../../../../components/Modal/FilePreviewModal";
import useFilePreview from "../../../../../hooks/useFilePreview";
import {
  formatDisplayDate,
  formatDateForInput,
} from "../../../../../utils/helpers";

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === "admin" || currentUser.role === "co-admin" || currentUser.role === "root-admin";
  const hasStaffInUrl = window.location.pathname.includes("staff");
  const shouldDisableSensitiveFields = hasStaffInUrl || !isAdmin;


// Validation function for dates
const validateEndDateAfterStart = (startDate, endDate) => {
  if (!startDate || !endDate) return true;
  return new Date(endDate) >= new Date(startDate);
};
import { useUniversities } from "../../../../../hooks/useUniversities";
import { useHighestQualifications } from "../../../../../hooks/useHighestQualifications";
import { useCoursesOfStudy } from "../../../../../hooks/useCoursesOfStudy";
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
  const universities = useUniversities();
  const highestQualifications = useHighestQualifications();
  const coursesOfStudy = useCoursesOfStudy();
  useEffect(() => {
    if (isEditing.education && formData.educationDetails.length === 0) {
      addEducationRecord();
    }
  }, [isEditing.education, formData.educationDetails, addEducationRecord]);
  if (!formData) return null;
  const disabledFields = ["Course of Study", "Start Date", "End Date"];
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
  const handleEndDateChange = (e, index, education) => {
    const newEndDate = e.target.value || null;
    const startDate = education.startYear;
    if (validateEndDateAfterStart(startDate, newEndDate)) {
      handleInputChange("educationDetails", "endYear", newEndDate, index);
    }
    // Optionally, add user feedback if invalid
  };
  const handleStartDateChange = (e, index, education) => {
    const newStartDate = e.target.value || null;
    const endDate = education.endYear;
    if (validateEndDateAfterStart(newStartDate, endDate)) {
      handleInputChange("educationDetails", "startYear", newStartDate, index);
    }
    // Optionally, add user feedback if invalid
  };
  if (formData.educationDetails.length === 0 && !isEditing.education) {
    return (
      <div className="step-form">
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
          <p>No education details available.</p>
        </div>
      </div>
    );
  }
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
        {formData.educationDetails.map((education, index) => {
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
                  <select
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
                  >
                    <option value="">Select Qualification</option>
                    {highestQualifications.map((qual) => (
                      <option key={qual} value={qual}>
                        {qual}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span>{education.highestQualification || "-"}</span>
                )}
              </div>
              {/* Course of Study */}
              <div
                className={`info-item ${
                  !isEditing.education &&
                  disabledFields.includes("Course of Study")
                    ? "disabled"
                    : ""
                }`}
              >
                <label>Course of Study</label>
                {isEditing.education ? (
                  <select
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
                  >
                    <option value="">Select Course</option>
                    {coursesOfStudy.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span>{education.courseOfStudy || "-"}</span>
                )}
              </div>
              {/* Start Date */}
              <div
                className={`info-item ${
                  !isEditing.education && disabledFields.includes("Start Date")
                    ? "disabled"
                    : ""
                }`}
              >
                <label>Start Date</label>
                {isEditing.education ? (
                  <input
                    type="date"
                    name={`startYear-${index}`}
                    value={formatDateForInput(education.startYear) || ""}
                    onChange={(e) => handleStartDateChange(e, index, education)}
                    className="edit-input"
                  />
                ) : (
                  <span>
                    {formatDisplayDate(education.startYear) || "-"}
                  </span>
                )}
              </div>
              {/* End Date */}
              <div
                className={`info-item ${
                  !isEditing.education && disabledFields.includes("End Date")
                    ? "disabled"
                    : ""
                }`}
              >
                <label>End Date</label>
                {isEditing.education ? (
                  <input
                    type="date"
                    name={`endYear-${index}`}
                    value={formatDateForInput(education.endYear) || ""}
                    min={formatDateForInput(education.startYear) || ""}
                    onChange={(e) => handleEndDateChange(e, index, education)}
                    className="edit-input"
                  />
                ) : (
                  <span>{formatDisplayDate(education.endYear) || "-"}</span>
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
        })}
        {/* Add Button */}
        {isEditing.education && (
          <button
            className="icon-button add-icon-button"
            onClick={addEducationRecord}
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
export default EducationDetailsStep;

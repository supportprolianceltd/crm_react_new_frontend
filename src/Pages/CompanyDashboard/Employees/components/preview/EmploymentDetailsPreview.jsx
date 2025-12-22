import "../../styles/CreateEmployeeStepPreview.css";
import {
  isImageFile,
  isPDFFile,
  isWordFile,
  formatFileSize,
  getFileExtension,
} from "../../../../../utils/helpers";
import { FaFilePdf } from "react-icons/fa6";
import { PiMicrosoftWordLogoFill } from "react-icons/pi";

const EmploymentDetailsPreview = ({ formData }) => {
  const renderFilePreview = (file) => {
    if (!file) return null;

    if (isImageFile(file)) {
      return (
        <div className="file-preview-container">
          <img
            src={URL.createObjectURL(file)}
            alt="Uploaded document"
            className="file-preview-image"
          />
          <div className="file-info">
            <span className="file-name">{file.name}</span>
            <span className="file-size">{formatFileSize(file.size)}</span>
          </div>
        </div>
      );
    }
    return (
      <div className="file-preview-container">
        <div className="document-icon">
          {isPDFFile(file) ? (
            <FaFilePdf style={{ color: "#e53e3e" }} />
          ) : isWordFile(file) ? (
            <PiMicrosoftWordLogoFill />
          ) : (
            <span className="generic-icon">{getFileExtension(file.name)}</span>
          )}
        </div>
        <div className="file-info">
          <span className="file-name">{file.name}</span>
          <span className="file-size">{formatFileSize(file.size)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="info-card">
      {/* Employment Section */}
      <h3 className="section-title">Employment</h3>
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Job Role</span>
          <span className="info-value">{formData.jobRole}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Department</span>
          <span className="info-value">{formData.department}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Work Email</span>
          <span className="info-value email">{formData.workEmail}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Line Manager</span>
          <span className="info-value">{formData.lineManager}
          </span>
        </div>

        <div className="info-item">
          <span className="info-label">Hierarchy</span>
          <span className="info-value">{formData.hierarchy}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Employment Type</span>
          <span className="info-value">{formData.employmentType}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Start Date</span>
          <span className="info-value">{formData.employmentStartDate}</span>
        </div>
        <div className="info-item">
          <span className="info-label">End Date</span>
          <span className="info-value">{formData.employmentEndDate}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Probation End Date</span>
          <span className="info-value">{formData.probationEndDate}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Salary</span>
          <span className="info-value">
            {formData.salaryCurrency} {formData.salary}
          </span>
        </div>

        <div className="info-item">
          <span className="info-label">Working Days</span>
          <span className="info-value">{formData.workingDays}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Max Hours</span>
          <span className="info-value">{formData.maxWorkingHours}</span>
        </div>
      </div>

      {/* Right to Work Section */}
      <h3 className="section-title">Right to Work</h3>
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Right to Work Status</span>
          <span className="info-value">{formData.rightToWorkStatus}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Passport Holder</span>
          <span className="info-value">{formData.passportHolder}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Document Type</span>
          <span className="info-value">{formData.rightToWorkDocumentType}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Document Number</span>
          <span className="info-value">
            {formData.rightToWorkDocumentNumber}
          </span>
        </div>

        <div className="info-item">
          <span className="info-label">Expiry Date</span>
          <span className="info-value">
            {formData.rightToWorkDocumentExpiryDate}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Share Code</span>
          <span className="info-value">{formData.shareCode}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Country of Issue</span>
          <span className="info-value">{formData.countryOfIssue}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Restrictions</span>
          <span className="info-value">{formData.workRestrictions}</span>
        </div>

        {formData?.rightToWorkFile && (
          <div className="info-item file-preview-wrapper">
            <span className="info-label">Right to Work Document</span>
            {renderFilePreview(formData.rightToWorkFile)}
          </div>
        )}
      </div>

      {/* Right to Rent (Legal & Work Eligibility) Section */}
      {(formData.evidenceRightToRent ||
        formData.rightToRentFile ||
        formData.legalWorkExpiryDate ||
        formData.legalWorkPhone) && (
        <>
          <h3 className="section-title">Right to Rent</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Evidence of Right to Rent</span>
              <span className="info-value">{formData.evidenceRightToRent}</span>
            </div>

            {formData?.rightToRentFile && (
              <div className="info-item file-preview-wrapper">
                <span className="info-label">Utility Bill</span>
                {renderFilePreview(formData.rightToRentFile)}
              </div>
            )}

            <div className="info-item">
              <span className="info-label">Expiry Date</span>
              <span className="info-value">{formData.legalWorkExpiryDate}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Phone Number</span>
              <span className="info-value">{formData.legalWorkPhone}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EmploymentDetailsPreview;

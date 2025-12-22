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

export default function DBSVerificationDetailsPreview({ formData }) {
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
      {/* DBS VERIFICATION SECTION */}
      <h3 className="section-title">DBS Verification</h3>
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Type of DBS</span>
          <span className="info-value">{formData.dbsType || "-"}</span>
        </div>

        {(formData.dbsCertificate || formData.dbsCertificatePreview) && (
          <div className="info-item file-preview-wrapper">
            <span className="info-label">DBS Certificate</span>
            {renderFilePreview(
              formData.dbsCertificate,
              formData.dbsCertificatePreview
            )}
          </div>
        )}

        <div className="info-item">
          <span className="info-label">Certificate Number</span>
          <span className="info-value">
            {formData.dbsCertificateNumber || "-"}
          </span>
        </div>

        <div className="info-item">
          <span className="info-label">Issue Date</span>
          <span className="info-value">{formData.dbsIssueDate || "-"}</span>
        </div>

        {(formData.dbsUpdateService || formData.dbsUpdateServicePreview) && (
          <div className="info-item file-preview-wrapper">
            <span className="info-label">DBS Update Service</span>
            {renderFilePreview(
              formData.dbsUpdateService,
              formData.dbsUpdateServicePreview
            )}
          </div>
        )}

        <div className="info-item">
          <span className="info-label">Update Certificate Number</span>
          <span className="info-value">
            {formData.dbsUpdateCertificateNumber || "-"}
          </span>
        </div>

        <div className="info-item">
          <span className="info-label">Update Issue Date</span>
          <span className="info-value">
            {formData.dbsUpdateIssueDate || "-"}
          </span>
        </div>

        <div className="info-item">
          <span className="info-label">Real-time Status Checks</span>
          <span className="info-value">
            {formData.realTimeStatusChecks ? "Enabled" : "Disabled"}
          </span>
        </div>
      </div>

      {/* PROOF OF ADDRESS SECTION */}
      <h3 className="section-title">Proof of Address</h3>
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Type</span>
          <span className="info-value">{formData.addressProofType || "-"}</span>
        </div>

        {(formData.utilityBill || formData.utilityBillPreview) && (
          <div className="info-item file-preview-wrapper">
            <span className="info-label">Proof of Address</span>
            {renderFilePreview(
              formData.utilityBill,
              formData.utilityBillPreview
            )}
          </div>
        )}

        <div className="info-item">
          <span className="info-label">Date of Issue</span>
          <span className="info-value">{formData.utilityBillDate || "-"}</span>
        </div>

        <div className="info-item">
          <span className="info-label">National Insurance Number</span>
          <span className="info-value">{formData.nin || "-"}</span>
        </div>

        {(formData.ninFile || formData.ninPreview) && (
          <div className="info-item file-preview-wrapper">
            <span className="info-label">NIN Document</span>
            {renderFilePreview(formData.ninFile, formData.ninPreview)}
          </div>
        )}
      </div>

      {/* REFERENCE CHECKS SECTION */}
      <h3 className="section-title">Reference Checks</h3>
      <div className="info-grid">
        {/* Referee 1 */}
        <div className="info-item">
          <span className="info-label">Referee 1 Name</span>
          <span className="info-value">{formData.referee1Name || "-"}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Referee 1 Phone</span>
          <span className="info-value">
            {formData.referee1PhoneCode && formData.referee1Phone
              ? `${formData.referee1PhoneCode} ${formData.referee1Phone}`
              : "-"}
          </span>
        </div>

        <div className="info-item">
          <span className="info-label">Referee 1 Email</span>
          <span className="info-value">{formData.referee1Email || "-"}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Referee 1 Relationship</span>
          <span className="info-value">
            {formData.referee1Relationship || "-"}
          </span>
        </div>

        {/* Referee 2 */}
        <div className="info-item">
          <span className="info-label">Referee 2 Name</span>
          <span className="info-value">{formData.referee2Name || "-"}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Referee 2 Phone</span>
          <span className="info-value">
            {formData.referee2PhoneCode && formData.referee2Phone
              ? `${formData.referee2PhoneCode} ${formData.referee2Phone}`
              : "-"}
          </span>
        </div>

        <div className="info-item">
          <span className="info-label">Referee 2 Relationship</span>
          <span className="info-value">
            {formData.referee2Relationship || "-"}
          </span>
        </div>
      </div>
    </div>
  );
}

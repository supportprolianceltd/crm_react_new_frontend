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

export default function DrivingStatusDetailsPreview({ formData }) {
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
      {/* DRIVING STATUS SECTION */}
      <h3 className="section-title">Driving Status</h3>
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Is Employee a Driver?</span>
          <span className="info-value">
            {formData.drivingStatus ? "Yes" : "No"}
          </span>
        </div>

        {formData.drivingStatus && (
          <>
            <div className="info-item">
              <span className="info-label">Vehicle Type</span>
              <span className="info-value">{formData.vehicleType || "-"}</span>
            </div>

            {(formData.drivingLicenseFront ||
              formData.drivingLicenseFrontPreview) && (
              <div className="info-item file-preview-wrapper">
                <span className="info-label">Driving License (Front)</span>
                {renderFilePreview(formData.drivingLicenseFront)}
              </div>
            )}

            {(formData.drivingLicenseBack ||
              formData.drivingLicenseBackPreview) && (
              <div className="info-item file-preview-wrapper">
                <span className="info-label">Driving License (Back)</span>
                {renderFilePreview(formData.drivingLicenseBack)}
              </div>
            )}

            <div className="info-item">
              <span className="info-label">Country of Issue</span>
              <span className="info-value">
                {formData.countryOfDrivingLicenseIssue || "-"}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">License Issue Date</span>
              <span className="info-value">
                {formData.drivingLicenseIssueDate || "-"}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">License Expiry Date</span>
              <span className="info-value">
                {formData.drivingLicenseExpiryDate || "-"}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Insurance Provider</span>
              <span className="info-value">
                {formData.insuranceProvider || "-"}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Insurance Expiry Date</span>
              <span className="info-value">
                {formData.insuranceExpiryDate || "-"}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Issuing Authority</span>
              <span className="info-value">
                {formData.drivingLicenseIssuingAuthority || "-"}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Policy Number</span>
              <span className="info-value">{formData.policyNumber || "-"}</span>
            </div>
          </>
        )}
      </div>

      {/* AVAILABILITY SECTION */}
      <h3 className="section-title">Availability</h3>
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Sync with Roster</span>
          <span className="info-value">
            {formData.isSyncWithRoster ? "Yes" : "No"}
          </span>
        </div>

        {formData.isSyncWithRoster && formData.availability && (
          <div className="info-item full-width">
            <span className="info-label">Availability</span>
            <div className="availability-pills">
              {Object.entries(formData.availability).map(([time, days]) => (
                <div key={time} className="time-group">
                  <strong>{time}:</strong>
                  <div className="days">
                    {Object.entries(days)
                      .filter(([_, available]) => available)
                      .map(([day]) => (
                        <span key={day} className="day-pill">
                          {day}
                        </span>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PERMISSION SECTION */}
      <h3 className="section-title">Permissions</h3>
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Access Duration</span>
          <span className="info-value">
            {formData.accessDuration ? "Enabled" : "Disabled"}
          </span>
        </div>

        {formData.accessDuration && (
          <div className="info-item">
            <span className="info-label">Access Expiry Date</span>
            <span className="info-value">
              {formData.accessExpiryDate || "-"}
            </span>
          </div>
        )}

        <div className="info-item">
          <span className="info-label">System Access</span>
          <span className="info-value">
            {formData.systemAccess ? "Enabled" : "Disabled"}
          </span>
        </div>

        {formData.systemAccess && (
          <div className="info-item">
            <span className="info-label">Systems Granted</span>
            <span className="info-value">
              {formData.systemAccessSelections?.length > 0
                ? formData.systemAccessSelections.join(", ")
                : "-"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

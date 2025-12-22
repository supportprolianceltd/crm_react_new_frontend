import { useEffect, useState } from "react";
import { PencilIcon } from "../../../../assets/icons/PencilIcon";
import { IoMdClose } from "react-icons/io";
import { FiEye } from "react-icons/fi";
import ToggleButton from "../../../../components/ToggleButton";
import CheckboxGroup from "../../../../components/CheckboxGroup";
import FileUploader from "../../../../components/FileUploader/FileUploader";
import FilePreviewModal from "../../../../components/Modal/FilePreviewModal";
import useFilePreview from "../../../../hooks/useFilePreview";

import useCountries from "../../../../hooks/useCountries";

const options = [
  { label: "Personal Vehicle", value: "Personal Vehicle" },
  { label: "Company Vehicle", value: "Company Vehicle" },
  { label: "Both", value: "Both" },
];

const DrivingLicenseAndDBSStep = ({
  formData,
  isEditing,
  handleEditToggle,
  handleInputChange,
  handleDrivingLicenseFrontChange,
  removeDrivingLicenseFront,
  drivingLicenseFrontRef,
  handleDrivingLicenseBackChange,
  removeDrivingLicenseBack,
  drivingLicenseBackRef,
  handleDbsCertificateChange,
  removeDbsCertificate,
  dbsCertificateRef,
  handleDbsUpdateServiceChange,
  removeDbsUpdateService,
  dbsUpdateServiceRef,
  isCompanyView = true, // Default to true for backward compatibility
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

  console.log(previewFile, previewType);

  if (!formData) return null;

  return (
    <div className="step-form">
      {/* File Preview Modal */}
      <FilePreviewModal
        showPreview={showPreview}
        previewFile={previewFile}
        previewType={previewType}
        onClose={closePreview}
      />

      {/* Driving License Card */}
      <div className="info-card">
        <div className="card-header">
          <h4>Driving License</h4>
          <button
            className="edit-button"
            onClick={() => handleEditToggle("drivingLicenseAndDBS")}
          >
            {isEditing.drivingLicenseAndDBS ? (
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
            <label>
              {isCompanyView
                ? "Is this employee a driver?"
                : "Are you a driver?"}
            </label>
            {isEditing.drivingLicenseAndDBS ? (
              <ToggleButton
                isOn={formData.drivingStatus || false}
                onToggle={(value) =>
                  handleInputChange(
                    "drivingLicenseAndDBS",
                    "drivingStatus",
                    value
                  )
                }
              />
            ) : (
              <span>{formData.drivingStatus ? "Yes" : "No"}</span>
            )}
            <p>
              {isCompanyView
                ? "Enable if this employee will be driving as part of their role"
                : "Enable if you will be driving as part of your role"}
            </p>
          </div>
          {formData.drivingStatus && (
            <>
              <div className="info-item">
                <label>Type of Vehicle Used</label>
                {isEditing.drivingLicenseAndDBS ? (
                  <CheckboxGroup
                    options={options}
                    value={formData.vehicleType}
                    onChange={(selectedValue) =>
                      handleInputChange(
                        "drivingLicenseAndDBS",
                        "vehicleType",
                        selectedValue
                      )
                    }
                  />
                ) : (
                  <span>{formData.vehicleType || "-"}</span>
                )}
              </div>
              <div className="info-item">
                <label>Driver's License Front Image</label>
                {isEditing.drivingLicenseAndDBS ? (
                  <div className="certificate-upload-container">
                    <FileUploader
                      title="Upload Driver's License Front Image"
                      currentFile={formData.drivingLicenseFront}
                      preview={formData.drivingLicenseFrontPreview}
                      onFileChange={handleDrivingLicenseFrontChange}
                      onRemove={removeDrivingLicenseFront}
                      ref={drivingLicenseFrontRef}
                      acceptedFileTypes="all"
                      uploadText="Click to upload Driver's License Front Image"
                    />
                    {canPreviewFile(formData, "drivingLicenseFront") && (
                      <button
                        className="preview-button"
                        onClick={() =>
                          handlePreviewFile({
                            file: formData.drivingLicenseFront,
                            fileUrl: formData.drivingLicenseFront,
                            filePreview: formData.drivingLicenseFrontPreview,
                          })
                        }
                      >
                        <FiEye /> Preview
                      </button>
                    )}
                  </div>
                ) : (
                  <span>
                    {formData.drivingLicenseFrontPreview ||
                    formData.drivingLicenseFront ? (
                      <div className="file-actions">
                        <a
                          href={formData.drivingLicenseFrontPreview}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="view-link"
                        >
                          View Front Image
                        </a>
                        <button
                          className="preview-button-small"
                          onClick={() =>
                            handlePreviewFile({
                              file: formData.drivingLicenseFront,
                              fileUrl: formData.drivingLicenseFront,
                              filePreview: formData.drivingLicenseFrontPreview,
                            })
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
              <div className="info-item">
                <label>Driver's License Back Image</label>
                {isEditing.drivingLicenseAndDBS ? (
                  <div className="certificate-upload-container">
                    <FileUploader
                      title="Upload Driver's License Back Image"
                      currentFile={formData.drivingLicenseBack}
                      preview={formData.drivingLicenseBackPreview}
                      onFileChange={handleDrivingLicenseBackChange}
                      onRemove={removeDrivingLicenseBack}
                      ref={drivingLicenseBackRef}
                      acceptedFileTypes="all"
                      uploadText="Click to upload Driver's License Back Image"
                    />
                    {canPreviewFile(formData, "drivingLicenseBack") && (
                      <button
                        className="preview-button"
                        onClick={() =>
                          handlePreviewFile({
                            file: formData.drivingLicenseBack,
                            fileUrl: formData.drivingLicenseBack,
                            filePreview: formData.drivingLicenseBackPreview,
                          })
                        }
                      >
                        <FiEye /> Preview
                      </button>
                    )}
                  </div>
                ) : (
                  <span>
                    {formData.drivingLicenseBackPreview ||
                    formData.drivingLicenseBack ? (
                      <div className="file-actions">
                        <a
                          href={formData.drivingLicenseBackPreview}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="view-link"
                        >
                          View Back Image
                        </a>
                        <button
                          className="preview-button-small"
                          onClick={() =>
                            handlePreviewFile({
                              file: formData.drivingLicenseBack,
                              fileUrl: formData.drivingLicenseBack,
                              filePreview: formData.drivingLicenseBackPreview,
                            })
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
              <div className="info-item">
                <label>Country of Issue</label>
                {isEditing.drivingLicenseAndDBS ? (
                  <select
                    name="countryOfDrivingLicenseIssue"
                    value={formData.countryOfDrivingLicenseIssue || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "drivingLicenseAndDBS",
                        "countryOfDrivingLicenseIssue",
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
                  <span>{formData.countryOfDrivingLicenseIssue || "-"}</span>
                )}
              </div>
              <div className="info-item">
                <label>Date Issued</label>
                {isEditing.drivingLicenseAndDBS ? (
                  <input
                    type="date"
                    name="drivingLicenseIssueDate"
                    value={formData.drivingLicenseIssueDate || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "drivingLicenseAndDBS",
                        "drivingLicenseIssueDate",
                        e.target.value
                      )
                    }
                    className="edit-input"
                  />
                ) : (
                  <span>{formData.drivingLicenseIssueDate || "-"}</span>
                )}
              </div>
              <div className="info-item">
                <label>Expiry Date</label>
                {isEditing.drivingLicenseAndDBS ? (
                  <input
                    type="date"
                    name="drivingLicenseExpiryDate"
                    value={formData.drivingLicenseExpiryDate || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "drivingLicenseAndDBS",
                        "drivingLicenseExpiryDate",
                        e.target.value
                      )
                    }
                    className="edit-input"
                  />
                ) : (
                  <span>{formData.drivingLicenseExpiryDate || "-"}</span>
                )}
              </div>
              <div className="info-item">
                <label>Policy Number</label>
                {isEditing.drivingLicenseAndDBS ? (
                  <input
                    type="text"
                    name="policyNumber"
                    value={formData.policyNumber || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "drivingLicenseAndDBS",
                        "policyNumber",
                        e.target.value
                      )
                    }
                    className="edit-input"
                  />
                ) : (
                  <span>{formData.policyNumber || "-"}</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* DBS Verification Card */}
      <div className="info-card">
        <div className="card-header">
          <h4>DBS Verification</h4>
          <button
            className="edit-button"
            onClick={() => handleEditToggle("drivingLicenseAndDBS")}
          >
            {isEditing.drivingLicenseAndDBS ? (
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
            <label>Type of DBS</label>
            {isEditing.drivingLicenseAndDBS ? (
              <select
                name="dbsType"
                value={formData.dbsType || ""}
                onChange={(e) =>
                  handleInputChange(
                    "drivingLicenseAndDBS",
                    "dbsType",
                    e.target.value
                  )
                }
                className="edit-input"
              >
                <option value="">Select Type</option>
                <option value="Basic">Basic</option>
                <option value="Standard">Standard</option>
                <option value="Enhanced">Enhanced</option>
              </select>
            ) : (
              <span>{formData.dbsType || "-"}</span>
            )}
          </div>
          <div className="info-item">
            <label>DBS Certificate</label>
            {isEditing.drivingLicenseAndDBS ? (
              <div className="certificate-upload-container">
                <FileUploader
                  title="Upload DBS Certificate"
                  currentFile={formData.dbsCertificate}
                  preview={formData.dbsCertificatePreview}
                  onFileChange={handleDbsCertificateChange}
                  onRemove={removeDbsCertificate}
                  ref={dbsCertificateRef}
                  acceptedFileTypes="all"
                  uploadText="Click to upload DBS certificate"
                />
                {canPreviewFile(formData, "dbsCertificate") && (
                  <button
                    className="preview-button"
                    onClick={() =>
                      handlePreviewFile({
                        file: formData.dbsCertificate,
                        fileUrl: formData.dbsCertificate,
                        filePreview: formData.dbsCertificatePreview,
                      })
                    }
                  >
                    <FiEye /> Preview
                  </button>
                )}
              </div>
            ) : (
              <span>
                {formData.dbsCertificatePreview || formData.dbsCertificate ? (
                  <div className="file-actions">
                    <a
                      href={formData.dbsCertificatePreview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-link"
                    >
                      View Certificate
                    </a>
                    <button
                      className="preview-button-small"
                      onClick={() =>
                        handlePreviewFile({
                          file: formData.dbsCertificate,
                          fileUrl: formData.dbsCertificate,
                          filePreview: formData.dbsCertificatePreview,
                        })
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
          <div className="info-item">
            <label>Certificate Number</label>
            {isEditing.drivingLicenseAndDBS ? (
              <input
                type="text"
                name="dbsCertificateNumber"
                value={formData.dbsCertificateNumber || ""}
                onChange={(e) =>
                  handleInputChange(
                    "drivingLicenseAndDBS",
                    "dbsCertificateNumber",
                    e.target.value
                  )
                }
                className="edit-input"
              />
            ) : (
              <span>{formData.dbsCertificateNumber || "-"}</span>
            )}
          </div>
          <div className="info-item">
            <label>Issue Date</label>
            {isEditing.drivingLicenseAndDBS ? (
              <input
                type="date"
                name="dbsIssueDate"
                value={formData.dbsIssueDate || ""}
                onChange={(e) =>
                  handleInputChange(
                    "drivingLicenseAndDBS",
                    "dbsIssueDate",
                    e.target.value
                  )
                }
                className="edit-input"
              />
            ) : (
              <span>{formData.dbsIssueDate || "-"}</span>
            )}
          </div>
          <div className="info-item">
            <label>DBS Update Service Registration (if applicable)</label>
            {isEditing.drivingLicenseAndDBS ? (
              <div className="certificate-upload-container">
                <FileUploader
                  title="Upload DBS Update Service Document"
                  currentFile={formData.dbsUpdateService}
                  preview={formData.dbsUpdateServicePreview}
                  onFileChange={handleDbsUpdateServiceChange}
                  onRemove={removeDbsUpdateService}
                  ref={dbsUpdateServiceRef}
                  acceptedFileTypes="all"
                  uploadText="Click to upload DBS update service document"
                />
                {canPreviewFile(formData, "dbsUpdateService") && (
                  <button
                    className="preview-button"
                    onClick={() =>
                      handlePreviewFile({
                        file: formData.dbsUpdateService,
                        fileUrl: formData.dbsUpdateService,
                        filePreview: formData.dbsUpdateServicePreview,
                      })
                    }
                  >
                    <FiEye /> Preview
                  </button>
                )}
              </div>
            ) : (
              <span>
                {formData.dbsUpdateServicePreview ||
                formData.dbsUpdateService ? (
                  <div className="file-actions">
                    <a
                      href={formData.dbsUpdateServicePreview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-link"
                    >
                      View Update Service
                    </a>
                    <button
                      className="preview-button-small"
                      onClick={() =>
                        handlePreviewFile({
                          file: formData.dbsUpdateService,
                          fileUrl: formData.dbsUpdateService,
                          filePreview: formData.dbsUpdateServicePreview,
                        })
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
          <div className="info-item">
            <label>Update Certificate Number</label>
            {isEditing.drivingLicenseAndDBS ? (
              <input
                type="text"
                name="dbsUpdateCertificateNumber"
                value={formData.dbsUpdateCertificateNumber || ""}
                onChange={(e) =>
                  handleInputChange(
                    "drivingLicenseAndDBS",
                    "dbsUpdateCertificateNumber",
                    e.target.value
                  )
                }
                className="edit-input"
              />
            ) : (
              <span>{formData.dbsUpdateCertificateNumber || "-"}</span>
            )}
          </div>
          <div className="info-item">
            <label>Update Issue Date</label>
            {isEditing.drivingLicenseAndDBS ? (
              <input
                type="date"
                name="dbsUpdateIssueDate"
                value={formData.dbsUpdateIssueDate || ""}
                onChange={(e) =>
                  handleInputChange(
                    "drivingLicenseAndDBS",
                    "dbsUpdateIssueDate",
                    e.target.value
                  )
                }
                className="edit-input"
              />
            ) : (
              <span>{formData.dbsUpdateIssueDate || "-"}</span>
            )}
          </div>
          <div className="info-item">
            <label>Enable real-time status checks</label>
            {isEditing.drivingLicenseAndDBS ? (
              <ToggleButton
                isOn={formData.realTimeStatusChecks || false}
                onToggle={(value) =>
                  handleInputChange(
                    "drivingLicenseAndDBS",
                    "realTimeStatusChecks",
                    value
                  )
                }
              />
            ) : (
              <span>
                {formData.realTimeStatusChecks ? "Enabled" : "Disabled"}
              </span>
            )}
            <p>Next re-check, in 11 months</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrivingLicenseAndDBSStep;

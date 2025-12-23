import { useState } from "react";
import InputField from "../../../../../components/Input/InputField";
import SelectField from "../../../../../components/Input/SelectField";
import FileUploader from "../../../../../components/FileUploader/FileUploader";
import ToggleButton from "../../../../../components/ToggleButton";
import { usePhoneCountryCode } from "../../../../../hooks/usePhoneCountryCode";
import {
  disableFutureDates,
  disablePastDates,
  getFileExtension,
} from "../../../../../utils/helpers";

export default function EmploymentDetailsStep({
  formData,
  handleChange,
  handleRightToWorkFileChange,
  removeRightToWorkFile,
  rightToWorkFileRef,
  handleRightToRentFileChange,
  removeRightToRentFile,
  rightToRentFileRef,
  handleInsuranceFileChange,
  removeInsuranceFile,
  insuranceFileRef,
  handlePhoneChange,
}) {
  // Phone country code hook
  const { options: phoneCodeOptions, loading: phoneCodeLoading } =
    usePhoneCountryCode();

  const [showLegalWork, setShowLegalWork] = useState(false);

  function sanitizeFileName(name) {
    return name
      .replace(/[^a-zA-Z0-9._-]/g, "_") // Replace any char that's not letter, number, dot, underscore, hyphen with _
      .replace(/_{2,}/g, "_") // Replace multiple _ with single
      .replace(/^_+|_+$/g, ""); // Remove leading/trailing _
  }

  const handleSanitizedRightToWorkFileChange = (file) => {
    if (file && typeof handleRightToWorkFileChange === "function") {
      const sanitizedName = sanitizeFileName(file.name);
      const sanitizedFile = new File([file], sanitizedName, {
        type: file.type,
      });
      handleRightToWorkFileChange(sanitizedFile);
    } else if (typeof handleRightToWorkFileChange === "function") {
      handleRightToWorkFileChange(file);
    }
  };

  const handleSanitizedRightToRentFileChange = (file) => {
    if (file && typeof handleRightToRentFileChange === "function") {
      const sanitizedName = sanitizeFileName(file.name);
      const sanitizedFile = new File([file], sanitizedName, {
        type: file.type,
      });
      handleRightToRentFileChange(sanitizedFile);
    } else if (typeof handleRightToRentFileChange === "function") {
      handleRightToRentFileChange(file);
    }
  };

  const handleSanitizedInsuranceFileChange = (file) => {
    if (file && typeof handleInsuranceFileChange === "function") {
      const sanitizedName = sanitizeFileName(file.name);
      const sanitizedFile = new File([file], sanitizedName, {
        type: file.type,
      });
      handleInsuranceFileChange(sanitizedFile);
    } else if (typeof handleInsuranceFileChange === "function") {
      handleInsuranceFileChange(file);
    }
  };

  const handleCurrencyChange = (e) => {
    handleChange({
      target: {
        name: "salaryCurrency",
        value: e.target.value,
      },
    });
  };

  const isImageUrl = (url) => {
    if (typeof url !== "string" || !url) return false;
    const imageExtensions = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"];
    const extension = getFileExtension(url)?.toLowerCase();
    return imageExtensions.includes(extension);
  };

  const renderDocumentPreview = (
    url,
    preview,
    onRemove,
    title = "Document Preview"
  ) => {
    if (!url) return null;

    const extension = getFileExtension(url).toLowerCase();
    let iframeSrc = url;

    // For .docx, use MS Viewer
    if (extension === "docx" || extension === "doc") {
      iframeSrc = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        url
      )}`;
    }
    // Add similar checks for .pptx, .xlsx if needed

    return (
      <div
        style={{
          border: "1px solid #ccc",
          padding: "20px",
          margin: "10px 0",
          position: "relative",
        }}
      >
        <h4>{title}</h4>
        {isImageUrl(url) ? (
          <img
            src={url}
            alt="Document Preview"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        ) : (
          <iframe
            src={iframeSrc}
            width="100%"
            height="400px"
            style={{ border: "none" }}
          />
        )}
        <button
          type="button"
          onClick={onRemove}
          style={{
            position: "absolute",
            top: "5px",
            right: "5px",
            background: "#ff4444",
            color: "white",
            border: "none",
            padding: "5px",
            borderRadius: "3px",
            cursor: "pointer",
          }}
        >
          Remove
        </button>
      </div>
    );
  };

  const rightToWorkPreview = renderDocumentPreview(
    formData.rightToWorkFileUrl,
    formData.rightToWorkFilePreview,
    () => {
      handleChange({ target: { name: "rightToWorkFileUrl", value: "" } });
      handleChange({ target: { name: "rightToWorkFilePreview", value: "" } });
    },
    "Right to Work Document Preview"
  );

  const rightToRentPreview = renderDocumentPreview(
    formData.rightToRentFileUrl,
    formData.rightToRentFilePreview,
    () => {
      handleChange({ target: { name: "rightToRentFileUrl", value: "" } });
      handleChange({ target: { name: "rightToRentFilePreview", value: "" } });
    },
    "Right to Rent Document Preview"
  );

  const insurancePreview = renderDocumentPreview(
    formData.insuranceFileUrl,
    formData.insuranceFilePreview,
    () => {
      handleChange({ target: { name: "insuranceFileUrl", value: "" } });
      handleChange({ target: { name: "insuranceFilePreview", value: "" } });
    },
    "Insurance Document Preview"
  );

  return (
    <>
      <div className="form-section">
        {/* --- EMPLOYMENT DETAILS --- */}
        <h3>Employment Details</h3>
        <InputField
          label="Job role/position"
          name="jobRole"
          value={formData.jobRole || ""}
          onChange={handleChange}
        />

        <SelectField
          label="Department"
          name="department"
          options={["Health", "Finance", "Admin", "Operations", "IT", "HR"]}
          value={formData.department || ""}
          onChange={handleChange}
        />

        <InputField
          label="Line Manager (Team Lead)"
          name="lineManager"
          value={formData.lineManager || ""}
          onChange={handleChange}
        />

        <InputField
          label="Hierarchy"
          name="hierarchy"
          value={formData.hierarchy || ""}
          onChange={handleChange}
        />

        <SelectField
          label="Employment Type"
          name="employmentType"
          options={["Full Time", "Part Time", "Contract", "Temporary"]}
          value={formData.employmentType || ""}
          onChange={handleChange}
        />

        <div className="input-row">
          <InputField
            label="Employment Start Date"
            name="employmentStartDate"
            type="date"
            value={formData.employmentStartDate || ""}
            onChange={handleChange}
          />
          <InputField
            label="Employment End Date (if applicable)"
            name="employmentEndDate"
            type="date"
            value={formData.employmentEndDate || ""}
            onChange={handleChange}
            min={disablePastDates()}
            placeholder=""
          />
        </div>

        <InputField
          label="Probation End Date (if applicable)"
          name="probationEndDate"
          type="date"
          value={formData.probationEndDate || ""}
          onChange={handleChange}
          min={disablePastDates()}
          placeholder=""
        />

        <div className="salary-container GHuh-Form-Input">
          <label className="field-label">Salary</label>
          <div className="salary-input-row">
            <SelectField
              name="salaryCurrency"
              options={[
                { value: "USD", label: "$" },
                { value: "GBP", label: "£" },
                { value: "EUR", label: "€" },
                { value: "NGN", label: "₦" },
              ]}
              value={formData.salaryCurrency || "GBP"}
              onChange={handleCurrencyChange}
              className="currency-select"
            />
            <InputField
              name="salary"
              type="number"
              value={formData.salary || ""}
              onChange={handleChange}
              placeholder="Enter amount"
              className="salary-input"
            />
          </div>
        </div>

        <div className="input-row">
          <InputField
            label="Working Days"
            name="workingDays"
            type="text"
            value={formData.workingDays || ""}
            onChange={handleChange}
            placeholder="e.g., Monday-Friday"
          />
          <InputField
            label="Maximum Working Hours"
            name="maxWorkingHours"
            type="number"
            value={formData.maxWorkingHours || ""}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-section">
        {/* --- RIGHT TO WORK --- */}
        <h3>Right To Work</h3>
        <div className="input-row">
          <SelectField
            label="Right to Work Status"
            name="rightToWorkStatus"
            options={["Citizen", "Visa Holder", "Work Permit", "Other"]}
            value={formData.rightToWorkStatus || ""}
            onChange={handleChange}
          />
          <SelectField
            label="Passport Holder"
            name="passportHolder"
            options={["Yes", "No"]}
            value={formData.passportHolder || ""}
            onChange={handleChange}
          />
        </div>

        <SelectField
          label="Select Document"
          name="rightToWorkDocumentType"
          options={[
            "Biometric Residence Permit",
            "Passport",
            "National ID",
            "Residence Card",
            "Other",
          ]}
          value={formData.rightToWorkDocumentType || ""}
          onChange={handleChange}
        />

        <div className="input-row">
          <InputField
            label="Document Number"
            name="rightToWorkDocumentNumber"
            value={formData.rightToWorkDocumentNumber || ""}
            onChange={handleChange}
          />
          <InputField
            label="Document Expiry Date"
            name="rightToWorkDocumentExpiryDate"
            type="date"
            value={formData.rightToWorkDocumentExpiryDate || ""}
            onChange={handleChange}
            min={disablePastDates()}
          />
        </div>

        <InputField
          label="Share Code (if applicable)"
          name="shareCode"
          value={formData.shareCode || ""}
          onChange={handleChange}
        />

        {rightToWorkPreview || (
          <div style={{ marginTop: "1rem" }}>
            <FileUploader
              title="Upload Supporting Document"
              currentFile={formData.rightToWorkFile}
              preview={formData.rightToWorkFilePreview}
              onFileChange={handleSanitizedRightToWorkFileChange}
              onRemove={removeRightToWorkFile}
              ref={rightToWorkFileRef}
              acceptedFileTypes="all"
              uploadText="Click to upload supporting document"
            />
          </div>
        )}

        <SelectField
          label="Country of Issue"
          name="countryOfIssue"
          options={["UK", "USA", "Nigeria", "Other"]}
          value={formData.countryOfIssue || ""}
          onChange={handleChange}
        />

        <InputField
          label="Are there any restrictions on your right to work?"
          name="workRestrictions"
          value={formData.workRestrictions || ""}
          onChange={handleChange}
          placeholder="Describe any restrictions"
        />
      </div>

      <div className="form-section">
        {/* --- LEGAL & WORK ELIGIBILITY --- */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <h3>Legal & Work Eligibility</h3>
          <ToggleButton
            label=""
            isOn={showLegalWork}
            onToggle={setShowLegalWork}
          />
        </div>

        {showLegalWork && (
          <>
            <SelectField
              label="Evidence of right to rent"
              name="evidenceRightToRent"
              options={["Passport", "Biometric Card", "Share Code", "Other"]}
              value={formData.evidenceRightToRent || ""}
              onChange={handleChange}
            />

            {rightToRentPreview || (
              <div style={{ marginTop: "1rem" }}>
                <FileUploader
                  title="Upload Right to Rent Document"
                  currentFile={formData.rightToRentFile}
                  preview={formData.rightToRentFilePreview}
                  onFileChange={handleSanitizedRightToRentFileChange}
                  onRemove={removeRightToRentFile}
                  ref={rightToRentFileRef}
                  acceptedFileTypes="all"
                  uploadText="Click to upload right to rent document"
                />
              </div>
            )}

            <InputField
              label="Expiry Date"
              name="rightToWorkDocumentExpiryDate"
              type="date"
              value={formData.rightToWorkDocumentExpiryDate || ""}
              onChange={handleChange}
              min={disablePastDates()}
            />

            <InputField label="Work Phone Number (optional)">
              <div className="phone-wrapper">
                <select
                  name="legalWorkPhoneCode"
                  value={formData.legalWorkPhoneCode}
                  onChange={handleChange}
                  disabled={phoneCodeLoading}
                >
                  <option value="">
                    {phoneCodeLoading ? "Loading..." : "Select Code"}
                  </option>
                  {phoneCodeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  name="legalWorkPhone"
                  value={formData.legalWorkPhone}
                  onChange={handlePhoneChange}
                />
              </div>
            </InputField>
          </>
        )}
      </div>

      <div className="form-section">
        {/* INSURANCE VERIFICATION */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <h3>Insurance Verification</h3>
        </div>
        <SelectField
          label="Insurance Type"
          name="insuranceType"
          options={["Professional Indemnity", "Public Liability", "Other"]}
          value={formData.insuranceType || ""}
          onChange={handleChange}
        />

        {(formData.insuranceType === "Professional Indemnity" ||
          formData.insuranceType === "Public Liability") && (
          <>
            {insurancePreview || (
              <div style={{ marginTop: "1rem" }}>
                <FileUploader
                  title="Upload Insurance Document"
                  currentFile={formData.insuranceFile}
                  preview={formData.insuranceFilePreview}
                  onFileChange={handleSanitizedInsuranceFileChange}
                  onRemove={removeInsuranceFile}
                  ref={insuranceFileRef}
                  acceptedFileTypes="all"
                  uploadText="Click to upload insurance document"
                />
              </div>
            )}
          </>
        )}

        {formData.insuranceType === "Professional Indemnity" && (
          <>
            <InputField
              label="Provider Name"
              name="insuranceProviderName"
              value={formData.insuranceProviderName || ""}
              onChange={handleChange}
            />
          </>
        )}
        {(formData.insuranceType === "Professional Indemnity" ||
          formData.insuranceType === "Public Liability") && (
          <>
            <InputField
              label="Expiry Date"
              name="insuranceExpiryDate"
              type="date"
              value={formData.insuranceExpiryDate || ""}
              onChange={handleChange}
              min={disablePastDates()}
            />
            <InputField
              label="Coverage Start Date"
              name="insuranceCoverageStartDate"
              type="date"
              value={formData.insuranceCoverageStartDate || ""}
              onChange={handleChange}
            />
          </>
        )}
        {formData.insuranceType === "Public Liability" && (
          <InputField label="Phone Number">
            <div className="phone-wrapper">
              <select
                name="insurancePhoneCode"
                value={formData.insurancePhoneCode}
                onChange={handleChange}
                disabled={phoneCodeLoading}
              >
                <option value="">
                  {phoneCodeLoading ? "Loading..." : "Select Code"}
                </option>
                {phoneCodeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                name="insurancePhone"
                value={formData.insurancePhone || ""}
                onChange={handlePhoneChange}
              />
            </div>
          </InputField>
        )}
      </div>
    </>
  );
}

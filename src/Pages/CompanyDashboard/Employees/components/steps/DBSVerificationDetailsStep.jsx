import InputField from "../../../../../components/Input/InputField";
import SelectField from "../../../../../components/Input/SelectField";
import FileUploader from "../../../../../components/FileUploader/FileUploader";
import ToggleButton from "../../../../../components/ToggleButton";
import { usePhoneCountryCode } from "../../../../../hooks/usePhoneCountryCode";
import {
  disableFutureDates,
  getMaxDate,
  getMinDate,
  getFileExtension,
} from "../../../../../utils/helpers";

const DBSVerificationDetailsStep = ({
  formData,
  handleChange,
  handleDbsCertificateChange,
  removeDbsCertificate,
  dbsCertificateRef,
  handleDbsUpdateServiceChange,
  removeDbsUpdateService,
  dbsUpdateServiceRef,
  handleUtilityBillUpload,
  removeUtilityBill,
  utilityBillRef,
  handleNinUpload,
  removeNin,
  ninRef,
}) => {
  // Phone country code hook
  const { options: phoneCodeOptions, loading: phoneCodeLoading } = usePhoneCountryCode();

  function sanitizeFileName(name) {
    return name
      .replace(/[^a-zA-Z0-9._-]/g, '_')  // Replace any char that's not letter, number, dot, underscore, hyphen with _
      .replace(/_{2,}/g, '_')           // Replace multiple _ with single
      .replace(/^_+|_+$/g, '');         // Remove leading/trailing _
  }

  const handleSanitizedDbsCertificateChange = (file) => {
    if (file && typeof handleDbsCertificateChange === 'function') {
      const sanitizedName = sanitizeFileName(file.name);
      const sanitizedFile = new File([file], sanitizedName, { type: file.type });
      handleDbsCertificateChange(sanitizedFile);
    } else if (typeof handleDbsCertificateChange === 'function') {
      handleDbsCertificateChange(file);
    }
  };

  const handleSanitizedDbsUpdateServiceChange = (file) => {
    if (file && typeof handleDbsUpdateServiceChange === 'function') {
      const sanitizedName = sanitizeFileName(file.name);
      const sanitizedFile = new File([file], sanitizedName, { type: file.type });
      handleDbsUpdateServiceChange(sanitizedFile);
    } else if (typeof handleDbsUpdateServiceChange === 'function') {
      handleDbsUpdateServiceChange(file);
    }
  };

  const handleSanitizedUtilityBillUpload = (file) => {
    if (file && typeof handleUtilityBillUpload === 'function') {
      const sanitizedName = sanitizeFileName(file.name);
      const sanitizedFile = new File([file], sanitizedName, { type: file.type });
      handleUtilityBillUpload(sanitizedFile);
    } else if (typeof handleUtilityBillUpload === 'function') {
      handleUtilityBillUpload(file);
    }
  };

  const handleSanitizedNinUpload = (file) => {
    if (file && typeof handleNinUpload === 'function') {
      const sanitizedName = sanitizeFileName(file.name);
      const sanitizedFile = new File([file], sanitizedName, { type: file.type });
      handleNinUpload(sanitizedFile);
    } else if (typeof handleNinUpload === 'function') {
      handleNinUpload(file);
    }
  };

  const handleToggleChange = (fieldName, value) => {
    handleChange({
      target: {
        name: fieldName,
        value: value,
      },
    });
  };

  // Define proof of address options with user-friendly labels
  const addressProofOptions = [
    { value: "utility_bill", label: "Utility Bill" },
    { value: "bank_statement", label: "Bank Statement" },
    { value: "tenancy_agreement", label: "Tenancy Agreement" },
    { value: "council_tax", label: "Council Tax" },
  ];

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

  const dbsCertificatePreviewComponent = renderDocumentPreview(
    formData.dbsCertificateUrl,
    formData.dbsCertificatePreview,
    () => {
      handleChange({ target: { name: "dbsCertificateUrl", value: "" } });
      handleChange({ target: { name: "dbsCertificatePreview", value: "" } });
    },
    "DBS Certificate Preview"
  );

  const dbsUpdateServicePreviewComponent = renderDocumentPreview(
    formData.dbsUpdateServiceUrl,
    formData.dbsUpdateServicePreview,
    () => {
      handleChange({ target: { name: "dbsUpdateServiceUrl", value: "" } });
      handleChange({ target: { name: "dbsUpdateServicePreview", value: "" } });
    },
    "DBS Update Service Preview"
  );

  const utilityBillPreviewComponent = renderDocumentPreview(
    formData.utilityBillUrl,
    formData.utilityBillPreview,
    () => {
      handleChange({ target: { name: "utilityBillUrl", value: "" } });
      handleChange({ target: { name: "utilityBillPreview", value: "" } });
    },
    "Utility Bill Preview"
  );

  const ninPreviewComponent = renderDocumentPreview(
    formData.ninFileUrl,
    formData.ninPreview,
    () => {
      handleChange({ target: { name: "ninFileUrl", value: "" } });
      handleChange({ target: { name: "ninPreview", value: "" } });
    },
    "NIN Document Preview"
  );

  return (
    <>
      {/* DBS CERTIFICATE SECTION */}
      <div className="form-section">
        <h3>DBS Verification</h3>
        <SelectField
          label="Type of DBS"
          name="dbsType"
          options={["Basic", "Standard", "Enhanced"]}
          value={formData.dbsType}
          onChange={handleChange}
        />

        <div className="section-title">1. DBS Certificate</div>

        {dbsCertificatePreviewComponent || (
          <FileUploader
            preview={formData.dbsCertificatePreview || ""}
            currentFile={formData.dbsCertificate}
            onFileChange={handleSanitizedDbsCertificateChange}
            onRemove={removeDbsCertificate}
            ref={dbsCertificateRef}
            acceptedFileTypes="all"
            uploadText="Click to upload DBS certificate"
          />
        )}

        <InputField
          label="Certificate Number"
          name="dbsCertificateNumber"
          value={formData.dbsCertificateNumber}
          onChange={handleChange}
        />

        <InputField
          type="date"
          label="Issue Date"
          name="dbsIssueDate"
          value={formData.dbsIssueDate}
          onChange={handleChange}
          max={disableFutureDates()}
        />

        {/* DBS UPDATE SERVICE SECTION */}
        <div className="section-title">
          2. DBS Update Service Registration (if applicable)
        </div>

        {dbsUpdateServicePreviewComponent || (
          <FileUploader
            preview={formData.dbsUpdateServicePreview || ""}
            currentFile={formData.dbsUpdateService}
            onFileChange={handleSanitizedDbsUpdateServiceChange}
            onRemove={removeDbsUpdateService}
            ref={dbsUpdateServiceRef}
            acceptedFileTypes="all"
            uploadText="Click to upload DBS update service document"
          />
        )}

        <InputField
          label="Certificate Number"
          name="dbsUpdateCertificateNumber"
          value={formData.dbsUpdateCertificateNumber}
          onChange={handleChange}
        />

        <InputField
          type="date"
          label="Issue Date"
          name="dbsUpdateIssueDate"
          value={formData.dbsUpdateIssueDate}
          onChange={handleChange}
          max={disableFutureDates()}
        />

        {/* COMPLIANCE SECTION */}
        {/* <h4 className="section-title" style={{ color: "#0A0C11" }}>
          System Compliance Actions
        </h4>
        <div className="compliance-item">
          <ToggleButton
            isOn={formData.realTimeStatusChecks || false}
            onToggle={(value) =>
              handleToggleChange("realTimeStatusChecks", value)
            }
          />
          <div className="compliance-content">
            <h4>Enable real time status checks</h4>
            <p>Next re check, in 11 months</p>
          </div>
        </div> */}
      </div>

      {/* PROOF OF ADDRESS */}
      <div className="form-section">
        <h3>Proof of Address</h3>

        <SelectField
          label="Type"
          name="addressProofType"
          options={addressProofOptions}
          value={formData.addressProofType}
          onChange={handleChange}
        />
        <p className="note">ⓘ Within the last 3 months</p>

        {utilityBillPreviewComponent || (
          <FileUploader
            preview={formData.utilityBillPreview || ""}
            currentFile={formData.utilityBill}
            onFileChange={handleSanitizedUtilityBillUpload}
            onRemove={removeUtilityBill}
            ref={utilityBillRef}
            acceptedFileTypes="all"
            uploadText="Click to upload proof of address"
          />
        )}

        <InputField
          type="date"
          label="Date of Issue"
          name="utilityBillDate"
          value={formData.utilityBillDate}
          onChange={handleChange}
          min={getMinDate()}
          max={getMaxDate()}
        />

        <InputField
          type="text"
          label="National Insurance Number (NIN)"
          name="nin"
          value={formData.nin}
          onChange={handleChange}
        />

        {ninPreviewComponent || (
          <div style={{ marginTop: "12px" }}>
            <FileUploader
              preview={formData.ninPreview || ""}
              currentFile={formData.ninFile}
              onFileChange={handleSanitizedNinUpload}
              onRemove={removeNin}
              ref={ninRef}
              acceptedFileTypes="all"
              uploadText="Click to upload NIN document"
            />
          </div>
        )}
      </div>

      <div className="form-section">
        <h3>Reference Checks</h3>

        {/* Referee 1 */}
        <InputField
          label="Name of Referee 1"
          name="referee1Name"
          value={formData.referee1Name}
          onChange={handleChange}
        />

        <InputField label="Phone Number">
          <div className="phone-wrapper">
            <select
              name="referee1PhoneCode"
              value={formData.referee1PhoneCode}
              onChange={handleChange}
            >
              <option value="+1">+1</option>
              <option value="+44">+44</option>
              <option value="+234">+234</option>
            </select>
            <input
              type="tel"
              name="referee1Phone"
              value={formData.referee1Phone}
              onChange={handleChange}
            />
          </div>
        </InputField>

        <InputField
          label="Email"
          type="email"
          name="referee1Email"
          value={formData.referee1Email}
          onChange={handleChange}
        />

        <InputField
          label="Relationship to Applicant"
          name="referee1Relationship"
          value={formData.referee1Relationship}
          onChange={handleChange}
        />

        {/* Referee 2 */}
        <InputField
          label="Name of Referee 2"
          name="referee2Name"
          value={formData.referee2Name}
          onChange={handleChange}
        />

        <InputField label="Phone Number">
          <div className="phone-wrapper">
            <select
              name="referee2PhoneCode"
              value={formData.referee2PhoneCode}
              onChange={handleChange}
            >
              <option value="+1">+1</option>
              <option value="+44">+44</option>
              <option value="+234">+234</option>
            </select>
            <input
              type="tel"
              name="referee2Phone"
              value={formData.referee2Phone}
              onChange={handleChange}
            />
          </div>
        </InputField>

        <InputField
          label="Email"
          type="email"
          name="referee2Email"
          value={formData.referee2Email}
          onChange={handleChange}
        />

        <InputField
          label="Relationship to Applicant"
          name="referee2Relationship"
          value={formData.referee2Relationship}
          onChange={handleChange}
        />
      </div>
    </>
  );
};

export default DBSVerificationDetailsStep;

import React from "react";
import InputField from "../../../../../components/Input/InputField";
import SelectField from "../../../../../components/Input/SelectField";
import TextAreaField from "../../../../../components/Input/TextAreaField";
import CheckboxGroup from "../../../../../components/CheckboxGroup";
import FileUploader from "../../../../../components/FileUploader/FileUploader";

const AdditionalInfoStep = ({
  formData,
  handleChange,
  handlePhoneChange,
  setFocusedInput,
  focusedInput,
  handleDpaFileChange,
  removeDpaFile,
  dpaFileInputRef,
  handleConsentFileChange,
  removeConsentFile,
  consentFileInputRef,
}) => {
  // Handle Power of Attorney checkbox change
  const handlePowerOfAttorneyChange = (newValue) => {
    handleChange({
      target: {
        name: "hasPowerOfAttorney",
        value: newValue,
      },
    });

    // Clear POA fields if "No" is selected
    if (newValue === false) {
      handleChange({
        target: { name: "poaType", value: "" },
      });
      handleChange({
        target: { name: "poaName", value: "" },
      });
      handleChange({
        target: { name: "poaPhoneCode", value: "+44" },
      });
      handleChange({
        target: { name: "poaPhone", value: "" },
      });
      handleChange({
        target: { name: "poaEmail", value: "" },
      });
      handleChange({
        target: { name: "poaSolicitor", value: "" },
      });
      handleChange({
        target: { name: "poaCertificateNumber", value: "" },
      });
    }
  };

  // Handle POA type change
  const handlePoaTypeChange = (newValues) => {
    handleChange({
      target: {
        name: "poaType",
        value: newValues,
      },
    });
  };

  // Consent checkboxes handler
  const handleConsentChange = (newValues) => {
    handleChange({
      target: {
        name: "digitalConsents",
        value: newValues,
      },
    });
  };

  // Options for Power of Attorney type
  const poaTypeOptions = [
    { value: "healthWelfare", label: "Health & Welfare" },
    { value: "financeProperty", label: "Finance & Property" },
  ];

  // Consent options
  const consentOptions = [
    {
      value: "receiveCare",
      label: "I consent to receive care and support from E3OS",
    },
    {
      value: "dataHandling",
      label:
        "I consent to the handling of my personal and medical data as outlined in GDPR",
    },
    {
      value: "medicationAdmin",
      label:
        "I consent to support with Medication Administration (as required)",
    },
    {
      value: "personalCare",
      label: "I consent to personal care support (e.g., washing, dressing)",
    },
    {
      value: "complaintsPolicy",
      label:
        "I acknowledge I have received and understand the Complaints and Feedback Policy",
    },
  ];

  // Get current POA type values for CheckboxGroup
  const getPoaTypeValues = () => {
    const values = [];
    if (formData.poaType && formData.poaType.includes("healthWelfare")) {
      values.push("healthWelfare");
    }
    if (formData.poaType && formData.poaType.includes("financeProperty")) {
      values.push("financeProperty");
    }
    return values;
  };

  // Get current consent values for CheckboxGroup
  const getConsentValues = () => {
    return formData.digitalConsents || [];
  };

  // Power of Attorney single checkbox options
  const powerOfAttorneyOptions = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  ];

  return (
    <>
      {/* Next of Kin Information */}
      <div className="form-section">
        <h3>Next of Kin/Emergency Contact</h3>

        {/* Next of Kin Full Name */}
        <InputField
          label="Full Name"
          name="nextOfKin"
          value={formData.nextOfKin || ""}
          onChange={handleChange}
          onFocus={() => setFocusedInput("nextOfKin")}
          onBlur={() => setFocusedInput(null)}
          placeholder="Enter full name of next of kin"
        />

        {/* Relationship to Next of Kin */}
        <InputField
          label="Relationship to Next of Kin"
          name="relationship"
          value={formData.relationship || ""}
          onChange={handleChange}
          onFocus={() => setFocusedInput("relationship")}
          onBlur={() => setFocusedInput(null)}
          placeholder="Enter relationship (e.g., spouse, child, parent)"
        />

        {/* Next of Kin Contact Number */}
        <InputField label="Contact Number">
          <div className="phone-wrapper">
            <select
              name="nokPhoneCode1"
              value={formData.nokPhoneCode1}
              onChange={handleChange}
            >
              <option value="+44">+44 (UK)</option>
              <option value="+1">+1 (US)</option>
              <option value="+61">+61 (AU)</option>
              <option value="+64">+64 (NZ)</option>
              <option value="+234">+234 (NG)</option>
            </select>
            <input
              type="tel"
              name="nokPhone1"
              value={formData.nokPhone1 || ""}
              onChange={handlePhoneChange}
              placeholder="Enter phone number"
            />
          </div>
        </InputField>

        {/* Next of Kin Alt Contact Number */}
        <InputField label="Alt Contact Number">
          <div className="phone-wrapper">
            <select
              name="nokPhoneCode2"
              value={formData.nokPhoneCode2}
              onChange={handleChange}
            >
              <option value="+44">+44 (UK)</option>
              <option value="+1">+1 (US)</option>
              <option value="+61">+61 (AU)</option>
              <option value="+64">+64 (NZ)</option>
              <option value="+234">+234 (NG)</option>
            </select>
            <input
              type="tel"
              name="nokPhone2"
              value={formData.nokPhone2 || ""}
              onChange={handlePhoneChange}
              placeholder="Enter alternate phone number"
            />
          </div>
        </InputField>

        {/* Next of Kin Email Address */}
        <InputField
          label="Email Address"
          type="email"
          name="nokEmail"
          value={formData.nokEmail || ""}
          onChange={handleChange}
          onFocus={() => setFocusedInput("nokEmail")}
          onBlur={() => setFocusedInput(null)}
          placeholder="Enter email address"
        />

        {/* Next of Kin Town */}
        <InputField
          label="Town"
          name="nokTown"
          value={formData.nokTown || ""}
          onChange={handleChange}
          onFocus={() => setFocusedInput("nokTown")}
          onBlur={() => setFocusedInput(null)}
          placeholder="Enter town"
        />
      </div>

      {/* Power of Attorney/Legal Guardian Section */}
      <div className="form-section" style={{ marginTop: "2rem" }}>
        <h3>Power of Attorney/Legal Guardian</h3>

        {/* Has Power of Attorney? */}
        <CheckboxGroup
          label="Is there a power of attorney in place?"
          options={powerOfAttorneyOptions}
          value={formData.hasPowerOfAttorney || false}
          onChange={handlePowerOfAttorneyChange}
          multiple={false}
          row={true}
        />

        {/* POA Type - only show if has POA is true */}
        {formData.hasPowerOfAttorney === true && (
          <>
            <CheckboxGroup
              label="Type"
              options={poaTypeOptions}
              value={getPoaTypeValues()}
              onChange={handlePoaTypeChange}
              multiple={true}
              row={true}
            />

            {/* POA Name */}
            <InputField
              label="Name"
              name="poaName"
              value={formData.poaName || ""}
              onChange={handleChange}
              onFocus={() => setFocusedInput("poaName")}
              onBlur={() => setFocusedInput(null)}
              placeholder="Enter name of power of attorney holder"
            />

            {/* POA Contact Number */}
            <InputField label="Contact Number">
              <div className="phone-wrapper">
                <select
                  name="poaPhoneCode"
                  value={formData.poaPhoneCode || "+44"}
                  onChange={handleChange}
                >
                  <option value="+44">+44 (UK)</option>
                  <option value="+1">+1 (US)</option>
                  <option value="+61">+61 (AU)</option>
                  <option value="+64">+64 (NZ)</option>
                  <option value="+234">+234 (NG)</option>
                </select>
                <input
                  type="tel"
                  name="poaPhone"
                  value={formData.poaPhone || ""}
                  onChange={handlePhoneChange}
                  placeholder="Enter phone number"
                />
              </div>
            </InputField>

            {/* POA Email Address */}
            <InputField
              label="Email Address"
              type="email"
              name="poaEmail"
              value={formData.poaEmail || ""}
              onChange={handleChange}
              onFocus={() => setFocusedInput("poaEmail")}
              onBlur={() => setFocusedInput(null)}
              placeholder="Enter email address"
            />

            {/* POA Solicitor/Firm */}
            <InputField
              label="Solicitor/Firm"
              name="poaSolicitor"
              value={formData.poaSolicitor || ""}
              onChange={handleChange}
              onFocus={() => setFocusedInput("poaSolicitor")}
              onBlur={() => setFocusedInput(null)}
              placeholder="Enter solicitor or firm name"
            />

            {/* POA Certificate Number */}
            <InputField
              label="Certificate Number"
              name="poaCertificateNumber"
              value={formData.poaCertificateNumber || ""}
              onChange={handleChange}
              onFocus={() => setFocusedInput("poaCertificateNumber")}
              onBlur={() => setFocusedInput(null)}
              placeholder="Enter certificate number"
            />
          </>
        )}
      </div>
      {/* DPA Certificate Upload */}
      {formData.hasPowerOfAttorney === true && (
        <div className="form-section" style={{ marginTop: "1rem" }}>
          <h4>DPA Certificate</h4>
          <p style={{ marginBottom: "1rem", color: "#666", fontSize: "14px" }}>
            Click to upload certificate/DPA document (SVG, PNG, JPG or GIF (max
            800x400px))
          </p>
          <FileUploader
            preview={formData.dpaCertificatePreview || ""}
            currentFile={formData.dpaCertificate}
            onFileChange={handleDpaFileChange}
            onRemove={removeDpaFile}
            ref={dpaFileInputRef}
            acceptedFileTypes="image"
            uploadText="Click to upload certificate/DPA document"
          />
        </div>
      )}

      {/* Digital Consents & Permissions */}
      <div className="form-section" style={{ marginTop: "2rem" }}>
        <h3>Digital Consents & Permissions</h3>

        <CheckboxGroup
          label=""
          options={consentOptions}
          value={getConsentValues()}
          onChange={handleConsentChange}
          multiple={true}
          row={false}
        />
      </div>

      {/* Consent Document Upload */}
      <FileUploader
        preview={formData.consentDocumentPreview || ""}
        currentFile={formData.consentDocument}
        onFileChange={handleConsentFileChange}
        onRemove={removeConsentFile}
        ref={consentFileInputRef}
        acceptedFileTypes="image"
        uploadText="Click to upload consent document"
      />
    </>
  );
};

export default AdditionalInfoStep;

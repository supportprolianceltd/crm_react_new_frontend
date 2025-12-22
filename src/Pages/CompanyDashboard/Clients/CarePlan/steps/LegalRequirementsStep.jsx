import React, { useState, useEffect } from "react";
import SelectField from "../../../../../components/Input/SelectField";
import InputField from "../../../../../components/Input/InputField";
import CheckboxGroup from "../../../../../components/CheckboxGroup";
import FileUploader from "../../../../../components/FileUploader/FileUploader";
import { usePhoneCountryCode } from "../../../../../hooks/usePhoneCountryCode";
import { FiLoader } from "react-icons/fi";

const LegalRequirementsStep = ({
  formData,
  handleChange,
  handleSingleCheckboxChange,
}) => {
  const poaPhoneHook = usePhoneCountryCode("+44");

  useEffect(() => {
    poaPhoneHook.setCountryCode(formData.poa_code || "+44");
  }, [formData.poa_code, poaPhoneHook]);

  const hasPoa = (formData.has_power_of_attorney || []).includes("yes");

  // Handle POA file change
  const handlePoaFileChange = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleChange({
          name: "poa_upload_preview",
          value: e.target.result,
        });
        handleChange({ name: "poa_upload", value: file });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle remove POA file
  const handleRemovePoa = () => {
    handleChange({ name: "poa_upload", value: null });
    handleChange({ name: "poa_upload_preview", value: "" });
    handleChange({ name: "poa_upload_url", value: "" });
  };

  // Handle ID file change
  const handleIdFileChange = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleChange({
          name: "id_upload_preview",
          value: e.target.result,
        });
        handleChange({ name: "id_upload", value: file });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle remove ID file
  const handleRemoveId = () => {
    handleChange({ name: "id_upload", value: null });
    handleChange({ name: "id_upload_preview", value: "" });
    handleChange({ name: "id_upload_url", value: "" });
  };

  const handlePoaCodeChange = (e) => {
    handleChange(e);
    poaPhoneHook.setCountryCode(e.target.value);
  };

  return (
    <div className="content-section">
      <div className="form-section">
        <h2 style={{ fontWeight: 600 }}>Power of Attorney/Legal Guardian</h2>

        {/* Power of Attorney/Legal Guardian */}
        <div style={{ marginBottom: "2rem" }}>
          <div
            className="checkbox-group-wrapper"
            style={{ marginBottom: "0.8rem" }}
          >
            <CheckboxGroup
              label="Is there a power of attorney in place?"
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              value={formData.has_power_of_attorney || []}
              onChange={(newValues) =>
                handleChange({
                  name: "has_power_of_attorney",
                  value: newValues,
                })
              }
              multiple={false}
              row={true}
            />
          </div>

          {hasPoa && (
            <>
              <div
                className="checkbox-group-wrapper"
                style={{ marginBottom: "0.8rem" }}
              >
                <CheckboxGroup
                  label="Type"
                  options={[
                    { value: "health_welfare", label: "Health & Welfare" },
                    { value: "finance_property", label: "Finance & Property" },
                  ]}
                  value={formData.poa_type || []}
                  onChange={(newValues) =>
                    handleChange({ name: "poa_type", value: newValues })
                  }
                  multiple={true}
                  row={true}
                />
              </div>

              {(formData.poa_type || []).includes("health_welfare") && (
                <InputField
                  label="Name (Health & Welfare)"
                  name="poa_name_health_welfare"
                  value={formData.poa_name_health_welfare || ""}
                  onChange={handleChange}
                  placeholder="Input text"
                />
              )}

              {(formData.poa_type || []).includes("finance_property") && (
                <InputField
                  label="Name (Finance & Property)"
                  name="poa_name_finance_property"
                  value={formData.poa_name_finance_property || ""}
                  onChange={handleChange}
                  placeholder="Input text"
                />
              )}

              <div className="GHuh-Form-Input">
                <label>Contact Number</label>
                <div className="phone-wrapper">
                  {poaPhoneHook.loading ? (
                    <div
                      style={{
                        minWidth: "60px",
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.375rem",
                      }}
                    >
                      <FiLoader className="animate-spin" size={20} />
                    </div>
                  ) : (
                    <select
                      name="poa_code"
                      value={formData.poa_code || "+44"}
                      onChange={handlePoaCodeChange}
                    >
                      {poaPhoneHook.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}
                  <input
                    type="tel"
                    name="poa_contact_number"
                    value={formData.poa_contact_number || ""}
                    onChange={handleChange}
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <InputField
                label="Email Address"
                name="poa_email"
                value={formData.poa_email || ""}
                onChange={handleChange}
                type="email"
                placeholder="Input text"
              />

              <InputField
                label="Solicitor Firm"
                name="poa_solicitor_firm"
                value={formData.poa_solicitor_firm || ""}
                onChange={handleChange}
                placeholder="Input text"
              />

              <InputField
                label="Certificate Number"
                name="poa_certificate_number"
                value={formData.poa_certificate_number || ""}
                onChange={handleChange}
                placeholder="Input text"
              />

              <div style={{ marginTop: "1rem" }}>
                <div className={`GHuh-Form-Input`}>
                  <label>Click to upload supporting document</label>
                </div>
                <FileUploader
                  currentFile={formData.poa_upload}
                  preview={formData.poa_upload_preview}
                  onFileChange={handlePoaFileChange}
                  onRemove={handleRemovePoa}
                  acceptedFileTypes="image"
                  uploadText="SVG, PNG, JPG or GIF (max. 800x400px)"
                />
              </div>
            </>
          )}
        </div>

        {/* Digital Consents & Permissions */}
        <div>
          <h3 style={{ fontWeight: 500, marginBottom: "1rem" }}>
            Digital Consents & Permissions
          </h3>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <input
              type="checkbox"
              checked={formData.consent_data_protection || false}
              onChange={(e) =>
                handleSingleCheckboxChange(
                  "consent_data_protection",
                  e.target.checked
                )
              }
              style={{ marginTop: "0.25rem" }}
            />
            <span>
              I consent to the handling of my personal and medical data as
              outlined in the Data Protection & GDPR Notice
            </span>
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <input
              type="checkbox"
              checked={formData.consent_medication || false}
              onChange={(e) =>
                handleSingleCheckboxChange(
                  "consent_medication",
                  e.target.checked
                )
              }
              style={{ marginTop: "0.25rem" }}
            />
            <span>
              I consent to support with Medication Administration (as required)
            </span>
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <input
              type="checkbox"
              checked={formData.consent_personal_care || false}
              onChange={(e) =>
                handleSingleCheckboxChange(
                  "consent_personal_care",
                  e.target.checked
                )
              }
              style={{ marginTop: "0.25rem" }}
            />
            <span>
              I consent to personal care support (e.g., washing, dressing)
            </span>
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <input
              type="checkbox"
              checked={formData.acknowledge_complaints_policy || false}
              onChange={(e) =>
                handleSingleCheckboxChange(
                  "acknowledge_complaints_policy",
                  e.target.checked
                )
              }
              style={{ marginTop: "0.25rem" }}
            />
            <span>
              I acknowledge I have received and understand the Complaints and
              Feedback Policy
            </span>
          </label>

          <div style={{ marginTop: "1rem" }}>
            <div className={`GHuh-Form-Input`}>
              <label>Click to upload supporting document</label>
            </div>
            <FileUploader
              currentFile={formData.id_upload}
              preview={formData.id_upload_preview}
              onFileChange={handleIdFileChange}
              onRemove={handleRemoveId}
              acceptedFileTypes="image"
              uploadText="SVG, PNG, JPG or GIF (max. 800x400px)"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalRequirementsStep;

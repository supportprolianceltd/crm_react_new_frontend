import React, { useState } from "react";
import FileUploader from "../../../../../components/FileUploader/FileUploader";
import InputField from "../../../../../components/Input/InputField";
import SelectField from "../../../../../components/Input/SelectField";
import CheckboxGroup from "../../../../../components/CheckboxGroup";
import { EyeIcon } from "@heroicons/react/24/outline";
import { EyeSlashIcon } from "@heroicons/react/24/solid";

const PersonalInfoStep = ({
  formData,
  handleChange,
  handlePhoneChange,
  profilePicture,
  profilePreview,
  handleFileChange,
  removeLogo,
  fileInputRef,
  setFocusedInput,
  focusedInput,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleCommunicationChange = (newValues) => {
    handleChange({
      name: "communicationPreferences",
      value: newValues,
    });
  };

  const handleSendCredentialsChange = (value) => {
    handleChange({
      target: {
        name: "sendCredentialsToEmail",
        value: value,
      },
    });
  };

  return (
    <>
      <h3>Upload Profile Picture</h3>
      <FileUploader
        preview={profilePreview}
        currentFile={profilePicture}
        onFileChange={handleFileChange}
        onRemove={removeLogo}
        ref={fileInputRef}
        acceptedFileTypes="image"
        uploadText="Click to upload a photo"
      />

      <div className="form-section">
        <h3>Basic Information</h3>
        <div className="input-row">
          <SelectField
            label="Title"
            name="title"
            value={formData.title || ""}
            options={["Mr", "Mrs", "Miss", "Dr", "Prof", "Other"]}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-row">
          <InputField
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            onFocus={() => setFocusedInput("firstName")}
            onBlur={() => setFocusedInput(null)}
            required
          />
          <InputField
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            onFocus={() => setFocusedInput("lastName")}
            onBlur={() => setFocusedInput(null)}
            required
          />
        </div>
        <SelectField
          label="Gender Identity"
          name="gender"
          value={formData.gender}
          options={["Male", "Female", "Prefer not to say"]}
          onChange={handleChange}
          required
        />
        <div className="input-row">
          <SelectField
            label="Preferred Pronouns"
            name="preferredPronouns"
            value={formData.preferredPronouns || ""}
            options={["He/Him", "She/Her", "Other", "Prefer not to say"]}
            onChange={handleChange}
          />
          <InputField
            label="Date of Birth"
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            onFocus={() => setFocusedInput("dob")}
            onBlur={() => setFocusedInput(null)}
            required
          />
        </div>
        <InputField
          label="Preferred Name"
          name="preferredName"
          value={formData.preferredName || ""}
          onChange={handleChange}
          onFocus={() => setFocusedInput("preferredName")}
          onBlur={() => setFocusedInput(null)}
        />
        <SelectField
          label="Marital Status"
          name="maritalStatus"
          value={formData.maritalStatus}
          options={[
            "Single",
            "Married",
            "Divorced",
            "Widowed",
            "Other",
            "Prefer not to say",
          ]}
          onChange={handleChange}
        />
        <InputField
          label="NHIS Number (if applicable)"
          name="nhisNumber"
          value={formData.nhisNumber || ""}
          onChange={handleChange}
          onFocus={() => setFocusedInput("nhisNumber")}
          onBlur={() => setFocusedInput(null)}
        />
      </div>

      <div className="form-section">
        <h3>Contact Details</h3>
        <InputField
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onFocus={() => setFocusedInput("email")}
          onBlur={() => setFocusedInput(null)}
          required
        />
        <InputField label="Contact Number" required>
          <div className="phone-wrapper">
            <select
              name="phoneCode"
              value={formData.phoneCode}
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
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="Enter phone number"
              required
            />
          </div>
        </InputField>
        <InputField label="Alternate Contact Number (Optional)">
          <div className="phone-wrapper">
            <select
              name="altPhoneCode"
              value={formData.altPhoneCode || "+44"}
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
              name="altPhone"
              value={formData.altPhone || ""}
              onChange={handlePhoneChange}
              placeholder="Enter alternate phone number"
            />
          </div>
        </InputField>
        <InputField
          label="Primary Contact Name"
          name="primaryContact"
          value={formData.primaryContact || ""}
          onChange={handleChange}
          onFocus={() => setFocusedInput("primaryContact")}
          onBlur={() => setFocusedInput(null)}
        />
        <InputField label="Primary Contact Phone Number">
          <div className="phone-wrapper">
            <select
              name="primaryContactPhoneCode"
              value={formData.primaryContactPhoneCode || "+44"}
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
              name="primaryContactPhone"
              value={formData.primaryContactPhone || ""}
              onChange={handlePhoneChange}
              placeholder="Enter primary contact phone number"
            />
          </div>
        </InputField>
        <InputField
          label="Secondary Contact Name"
          name="secondaryContact"
          value={formData.secondaryContact || ""}
          onChange={handleChange}
          onFocus={() => setFocusedInput("secondaryContact")}
          onBlur={() => setFocusedInput(null)}
        />
        <InputField
          label="Primary Contact Email"
          type="email"
          name="primaryContactEmail"
          value={formData.primaryContactEmail || ""}
          onChange={handleChange}
          onFocus={() => setFocusedInput("primaryContactEmail")}
          onBlur={() => setFocusedInput(null)}
        />
        <InputField label="Secondary Contact Phone Number">
          <div className="phone-wrapper">
            <select
              name="secondaryContactPhoneCode"
              value={formData.secondaryContactPhoneCode || "+44"}
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
              name="secondaryContactPhone"
              value={formData.secondaryContactPhone || ""}
              onChange={handlePhoneChange}
              placeholder="Enter secondary contact phone number"
            />
          </div>
        </InputField>
        <InputField
          label="Secondary Contact Email"
          type="email"
          name="secondaryContactEmail"
          value={formData.secondaryContactEmail || ""}
          onChange={handleChange}
          onFocus={() => setFocusedInput("secondaryContactEmail")}
          onBlur={() => setFocusedInput(null)}
        />
        <div className="GHuh-Form-Input" style={{ marginTop: "2rem" }}>
          <CheckboxGroup
            label="Preferred Means of Communicating"
            options={[
              { value: "phone_call", label: "Phone Call" },
              { value: "sms", label: "SMS" },
              { value: "email", label: "Email" },
            ]}
            value={formData.communicationPreferences || []}
            onChange={handleCommunicationChange}
            row={true}
          />
        </div>
      </div>

      <div className="form-section">
        <h3>Default Login Credentials</h3>
        <div className="input-row">
          <InputField
            label="Username (Login Email)"
            name="loginEmail"
            value={formData.loginEmail}
            onChange={handleChange}
            placeholder="Enter login email"
            onFocus={() => setFocusedInput("loginEmail")}
            onBlur={() => setFocusedInput(null)}
            required
          />
          <div className="GHuh-Form-Input">
            <label>Password</label>
            <div className="ool-IINpa">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Auto-generated password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedInput("password")}
                onBlur={() => setFocusedInput(null)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeSlashIcon className="icon" />
                ) : (
                  <EyeIcon className="icon" />
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="checkbox-wrapper">
          <CheckboxGroup
            label=""
            options={[
              {
                value: true,
                label: "Send Login Credentials to client's email",
              },
            ]}
            value={formData.sendCredentialsToEmail || false}
            onChange={handleSendCredentialsChange}
            multiple={false}
            row={true}
          />
        </div>
        {formData.password && (
          <div className="password-strength-indicator">
            <h4>Password Strength</h4>
            <div className="strength-meter">
              <div
                className={`strength-bar ${
                  formData.password.length >= 12 &&
                  /[A-Z]/.test(formData.password) &&
                  /[0-9]/.test(formData.password) &&
                  /[!@#$%^&*]/.test(formData.password)
                    ? "strong"
                    : formData.password.length >= 8
                    ? "medium"
                    : "weak"
                }`}
                style={{
                  width: `${
                    formData.password.length >= 12 &&
                    /[A-Z]/.test(formData.password) &&
                    /[0-9]/.test(formData.password) &&
                    /[!@#$%^&*]/.test(formData.password)
                      ? 100
                      : formData.password.length >= 8
                      ? 66
                      : 33
                  }%`,
                }}
              ></div>
            </div>
            <div className="strength-labels">
              <span className={formData.password.length >= 8 ? "met" : ""}>
                8+ characters
              </span>
              <span className={/[A-Z]/.test(formData.password) ? "met" : ""}>
                Uppercase
              </span>
              <span className={/[0-9]/.test(formData.password) ? "met" : ""}>
                Number
              </span>
              <span
                className={/[!@#$%^&*]/.test(formData.password) ? "met" : ""}
              >
                Special char
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PersonalInfoStep;

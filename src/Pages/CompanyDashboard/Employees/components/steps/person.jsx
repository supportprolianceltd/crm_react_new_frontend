import React, { useState, useEffect, useRef } from "react";
import FileUploader from "../../../../../components/FileUploader/FileUploader";
import InputField from "../../../../../components/Input/InputField";
import SelectField from "../../../../../components/Input/SelectField";
import CheckboxGroup from "../../../../../components/CheckboxGroup";
import { EyeIcon } from "@heroicons/react/24/outline";
import { EyeSlashIcon } from "@heroicons/react/24/solid";
import useCountries from "../../../../../hooks/useCountries";
import useSearchPostcode from "../../../../../hooks/useSearchPostcode";
import axios from "axios";
import { getMaxBirthDate } from "../../../../../utils/helpers";

const PersonalInfoStep = ({
  formData,
  handleChange,
  profilePicture,
  profilePreview,
  handleFileChange,
  handlePhoneChange,
  removeLogo,
  fileInputRef,
  setFocusedInput,
  focusedInput,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [tenantDomain, setTenantDomain] = useState("");
  const [errors, setErrors] = useState({});
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [loadingCities, setLoadingCities] = useState(false);

  const countriesResponse = useCountries();
  const countriesData = countriesResponse || [];

  // Address autocomplete hook
  const {
    suggestions: addressSuggestions,
    showSuggestions,
    handleAddressInputChange,
    handleSuggestionSelect,
    handleBlur,
  } = useSearchPostcode();

  const roleOptions = [
    { value: "hr", label: "HR" },
    { value: "staff", label: "Staff" },
    { value: "carer", label: "Carer" },
    { value: "admin", label: "Admin" },
    { value: "co-admin", label: "Co-Admin" },
  ];

  // Get tenant domain from localStorage
  useEffect(() => {
    const domain = localStorage.getItem("tenantDomain");
    if (domain) {
      setTenantDomain(domain);
    }
  }, []);

  // Correct email domain if it doesn't match tenantDomain
  useEffect(() => {
    if (tenantDomain && formData.workEmail) {
      const [username, currentDomain] = formData.workEmail.split("@");
      if (currentDomain !== tenantDomain && username) {
        handleChange({
          target: { name: "workEmail", value: `${username}@${tenantDomain}` },
        });
      }
    }
  }, [tenantDomain, formData.workEmail]);

  const emailUsername = formData.workEmail
    ? formData.workEmail.split("@")[0]
    : "";

  const handleEmailUsernameChange = (e) => {
    const username = e.target.value;
    const fullEmail = username ? `${username}@${tenantDomain}` : "";
    handleChange({ target: { name: "workEmail", value: fullEmail } });
  };

  // Update states when country changes
  useEffect(() => {
    if (formData.country && countriesData.length > 0) {
      const country = countriesData.find((c) => c.name === formData.country);
      if (country) {
        setSelectedCountry(country);
        setStates(country.states || []);
        setCities([]);
        setSelectedState(null);
        handleChange({ target: { name: "state", value: "" } });
        handleChange({ target: { name: "city", value: "" } });

        // Reset state if it doesn't match the new country's states
        const currentState = formData.state;
        if (
          currentState &&
          !country.states.some((s) => s.name === currentState)
        ) {
          handleChange({ target: { name: "state", value: "" } });
        }
      } else {
        setStates([]);
        setSelectedCountry(null);
      }
    } else {
      setStates([]);
      setSelectedCountry(null);
    }
  }, [formData.country, countriesData]);

  // Fetch cities when state changes
  useEffect(() => {
    if (selectedState && selectedCountry) {
      const fetchCities = async () => {
        setLoadingCities(true);
        try {
          console.log("Fetching cities for:", {
            country: selectedCountry.name,
            state: selectedState.name,
          });

          // Use the correct endpoint for cities
          const response = await axios.post(
            `https://countriesnow.space/api/v0.1/countries/state/cities`,
            {
              country: selectedCountry.name,
              state: selectedState.name,
            }
          );

          const result = response.data;
          console.log("Cities API response:", result);

          if (result && !result.error && result.data) {
            setCities(result.data || []);
          } else {
            console.error("No cities data found in response");
            setCities([]);
          }
        } catch (error) {
          console.error("Error fetching cities:", error);
          setCities([]);
        } finally {
          setLoadingCities(false);
        }
      };

      fetchCities();
      handleChange({ target: { name: "city", value: "" } });
    } else {
      setCities([]);
    }
  }, [selectedState, selectedCountry]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle checkbox change
  const handleSendCredentialsChange = (value) => {
    handleChange({
      target: {
        name: "sendCredentialsToEmail",
        value: value,
      },
    });
  };

  // Get placeholder for email field
  const getEmailPlaceholder = () => {
    return tenantDomain ? `example@${tenantDomain}` : "Enter work email";
  };

  const validateWorkEmail = (value) => {
    if (!value) {
      setErrors((prev) => ({ ...prev, workEmail: "" }));
      return;
    }
    if (!value.includes("@")) {
      setErrors((prev) => ({
        ...prev,
        workEmail: "Please enter a valid email address.",
      }));
      return;
    }
    const emailDomain = value.split("@")[1];
    if (emailDomain !== tenantDomain) {
      setErrors((prev) => ({
        ...prev,
        workEmail: `Email must be from the tenant domain: ${tenantDomain}`,
      }));
    } else {
      setErrors((prev) => ({ ...prev, workEmail: "" }));
    }
  };

  const handleStateChange = (e) => {
    const stateName = e.target.value;
    const stateObj = states.find((s) => s.name === stateName);
    setSelectedState(stateObj || null);
    handleChange(e);
  };

  const isImageUrl = (url) =>
    /\.(jpe?g|png|gif|bmp|webp)$/i.test(url.toLowerCase());

  const renderProfilePreview = () => {
    const url = formData.profilePictureUrl;
    if (url) {
      return (
        <div
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            margin: "10px 0",
            position: "relative",
          }}
        >
          {isImageUrl(url) ? (
            <img
              src={url}
              alt="Profile Preview"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          ) : (
            <iframe
              src={url}
              width="100%"
              height="400px"
              style={{ border: "none" }}
            />
          )}
          <button
            type="button"
            onClick={() => {
              handleChange({
                target: { name: "profilePictureUrl", value: "" },
              });
              handleChange({ target: { name: "profilePreview", value: "" } });
            }}
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
    }
    return null;
  };

  const profilePreviewComponent = renderProfilePreview();

  return (
    <>
      <h3>Upload Profile Picture</h3>
      {profilePreviewComponent || (
        <FileUploader
          preview={profilePreview}
          currentFile={profilePicture}
          onFileChange={handleFileChange}
          onRemove={removeLogo}
          ref={fileInputRef}
          acceptedFileTypes="image"
          uploadText="Click to upload a photo"
        />
      )}

      {/* Basic Information */}
      <div className="form-section">
        <h3>Basic Information</h3>
        <div className="input-row">
          <InputField
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            onFocus={() => setFocusedInput("firstName")}
            onBlur={() => setFocusedInput(null)}
          />
          <InputField
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            onFocus={() => setFocusedInput("lastName")}
            onBlur={() => setFocusedInput(null)}
          />
        </div>

        <div className="input-row">
          <SelectField
            label="Role"
            name="role"
            value={formData.role}
            options={roleOptions}
            onChange={handleChange}
          />
        </div>

        <div className="input-row">
          <SelectField
            label="Gender"
            name="gender"
            value={formData.gender}
            options={["Male", "Female", "Other"]}
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
            max={getMaxBirthDate()}
          />
        </div>

        {/* Work Email */}
        <InputField label="Work Email">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #ccc",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <input
              style={{
                flex: 1,
                border: "none",
                padding: "8px 12px",
                outline: "none",
                fontSize: "14px",
              }}
              type="text"
              placeholder="username"
              value={emailUsername}
              onChange={handleEmailUsernameChange}
              onFocus={() => setFocusedInput("workEmail")}
              onBlur={() => {
                setFocusedInput(null);
                validateWorkEmail(formData.workEmail);
              }}
            />
            <span
              style={{
                padding: "8px 12px",
                backgroundColor: "#f9f9f9",
                color: "#666",
                fontSize: "14px",
                whiteSpace: "nowrap",
              }}
            >
              @{tenantDomain}
            </span>
          </div>
        </InputField>
        {errors.workEmail && (
          <div
            style={{
              fontSize: "12px",
              fontStyle: "italic",
              marginTop: "-8px",
              textAlign: "left",
            }}
            className="error-message"
          >
            {errors.workEmail}
          </div>
        )}

        <SelectField
          label="Marital Status"
          name="maritalStatus"
          value={formData.maritalStatus}
          options={["Single", "Married", "Divorced", "Widowed", "Other"]}
          onChange={handleChange}
        />

        <InputField label="Work Phone Number (optional)">
          <div className="phone-wrapper">
            <select
              name="workPhoneCode"
              value={formData.workPhoneCode}
              onChange={handleChange}
            >
              <option value="">Select Code</option>
              <option value="+1">+1</option>
              <option value="+44">+44</option>
              <option value="+234">+234</option>
            </select>
            <input
              type="tel"
              name="workPhone"
              value={formData.workPhone}
              onChange={handlePhoneChange}
            />
          </div>
        </InputField>

        <InputField label="Personal Phone Number">
          <div className="phone-wrapper">
            <select
              name="personalPhoneCode"
              value={formData.personalPhoneCode}
              onChange={handleChange}
            >
              <option value="">Select Code</option>
              <option value="+1">+1</option>
              <option value="+44">+44</option>
              <option value="+234">+234</option>
            </select>
            <input
              type="tel"
              name="personalPhone"
              value={formData.personalPhone}
              onChange={handlePhoneChange}
            />
          </div>
        </InputField>

        <div className="GHuh-Form-Input">
          <label>Address</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              name="address"
              value={formData.address || ""}
              onChange={(e) => handleAddressInputChange(e.target.value, (val) => handleChange({ target: { name: 'address', value: val } }))}
              onFocus={() => setFocusedInput("address")}
              onBlur={handleBlur}
              placeholder="Enter full address"
              className="form-control"
            />
            {showSuggestions && addressSuggestions.length > 0 && (
              <ul style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'white',
                border: '1px solid #ccc',
                borderTop: 'none',
                listStyle: 'none',
                padding: 0,
                margin: 0,
                zIndex: 1000,
                maxHeight: '200px',
                overflowY: 'auto',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                {addressSuggestions.map((suggestion) => (
                  <li
                    key={suggestion.place_id}
                    onClick={() => handleSuggestionSelect(
                      suggestion,
                      (val) => handleChange({ target: { name: 'address', value: val } }),
                      (val) => handleChange({ target: { name: 'postalCode', value: val } }),
                      () => {},
                      () => {}
                    )}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #eee'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    {suggestion.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <SelectField
          label="Country"
          name="country"
          value={formData.country || ""}
          options={countriesData.map((c) => c.name)}
          onChange={handleChange}
        />

        <SelectField
          label="State/Province"
          name="state"
          value={formData.state || ""}
          options={states.map((s) => s.name)}
          onChange={handleStateChange}
          disabled={!formData.country || states.length === 0}
        />

        <SelectField
          label="City"
          name="city"
          value={formData.city || ""}
          options={cities}
          onChange={handleChange}
          disabled={!formData.state || cities.length === 0 || loadingCities}
        />
        {loadingCities && (
          <div
            style={{ fontSize: "12px", fontStyle: "italic", marginTop: "-8px" }}
          >
            Loading cities...
          </div>
        )}

        <InputField
          label="Post Code/Zip Code"
          name="postalCode"
          value={formData.postalCode}
          onChange={handleChange}
        />
      </div>

      {/* Additional Details */}
      <div className="form-section">
        <h3>Additional Details</h3>
        <div className="input-row">
          <InputField
            label="Next of Kin"
            name="nextOfKin"
            value={formData.nextOfKin}
            onChange={handleChange}
          />
          <InputField
            label="Relationship to Next of Kin"
            name="relationship"
            value={formData.relationship}
            onChange={handleChange}
          />
        </div>
        {/* Next of Kin Email */}
        <InputField
          label="Next of Kin Email"
          name="nokEmail"
          value={formData.nokEmail}
          onChange={handleChange}
          onFocus={() => setFocusedInput("nokEmail")}
          onBlur={() => setFocusedInput(null)}
          placeholder={getEmailPlaceholder()}
        />
        <InputField
          label="Next of Kin Address"
          name="nokAddress"
          value={formData.nokAddress}
          onChange={handleChange}
        />
        <InputField
          label="Next of Kin Town/City"
          name="nokTown"
          value={formData.nokTown}
          onChange={handleChange}
        />
        <InputField
          label="Next of Kin Post Code/Zip Code"
          name="nokPostalCode"
          value={formData.nokPostalCode}
          onChange={handleChange}
        />
        <InputField label="Next of Kin Phone Number">
          <div className="phone-wrapper">
            <select
              name="nokPhoneCode1"
              value={formData.nokPhoneCode1}
              onChange={handleChange}
            >
              <option value="+1">+1</option>
              <option value="+44">+44</option>
              <option value="+234">+234</option>
            </select>
            <input
              type="tel"
              name="nokPhone1"
              value={formData.nokPhone1}
              onChange={handlePhoneChange}
            />
          </div>
        </InputField>
        <InputField label="Next of Kin (Alt. Phone Number)">
          <div className="phone-wrapper">
            <select
              name="nokPhoneCode2"
              value={formData.nokPhoneCode2}
              onChange={handleChange}
            >
              <option value="+1">+1</option>
              <option value="+44">+44</option>
              <option value="+234">+234</option>
            </select>
            <input
              type="tel"
              name="nokPhone2"
              value={formData.nokPhone2}
              onChange={handlePhoneChange}
            />
          </div>
        </InputField>
      </div>

      {/* Login Credentials Section */}
      <div className="form-section">
        <h3>Default Login Credentials</h3>

        <div className="input-row">
          {/* Login Email */}
          <InputField label="Login Email">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #ccc",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <input
                style={{
                  flex: 1,
                  border: "none",
                  padding: "8px 12px",
                  outline: "none",
                  fontSize: "14px",
                }}
                type="text"
                placeholder="username"
                value={emailUsername}
                onChange={handleEmailUsernameChange}
                onFocus={() => setFocusedInput("workEmail")}
                onBlur={() => {
                  setFocusedInput(null);
                  validateWorkEmail(formData.workEmail);
                }}
              />
              <span
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#f9f9f9",
                  color: "#666",
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                }}
              >
                @{tenantDomain}
              </span>
            </div>
          </InputField>

          <div className="GHuh-Form-Input">
            <label>Password</label>
            <div className="ool-IINpa">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Auto-generated password"
                value={formData.password}
                onChange={handleChange}
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
        {errors.workEmail && (
          <div
            style={{
              fontSize: "12px",
              fontStyle: "italic",
              marginTop: "-8px",
              textAlign: "left",
            }}
            className="error-message"
          >
            {errors.workEmail}
          </div>
        )}

        {/* Send Credentials Checkbox */}
        <div className="checkbox-wrapper">
          <CheckboxGroup
            label=""
            options={[
              {
                value: true,
                label: "Send Login Credentials to employee's email",
              },
            ]}
            value={formData.sendCredentialsToEmail || false}
            onChange={handleSendCredentialsChange}
            multiple={false}
            row={true}
          />
        </div>

        {/* Password Strength Indicator */}
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
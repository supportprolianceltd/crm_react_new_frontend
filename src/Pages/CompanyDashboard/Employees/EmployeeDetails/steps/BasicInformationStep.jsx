import { useState, useEffect, useCallback } from "react";
import { PencilIcon } from "../../../../../assets/icons/PencilIcon";
import { IoMdClose } from "react-icons/io";
import useCountries from "../../../../../hooks/useCountries";
import useSearchPostcode from "../../../../../hooks/useSearchPostcode";
import { usePhoneCountryCode } from "../../../../../hooks/usePhoneCountryCode";
import axios from "axios";
import { normalizeText } from "../../../../../utils/helpers";
import { FiLoader } from "react-icons/fi";

const BasicInformationStep = ({
  formData,
  isEditing,
  handleEditToggle,
  handleInputChange,
  handleEventInputChange,
}) => {
  const [errors, setErrors] = useState({});
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [loadingCities, setLoadingCities] = useState(false);
  const [isPersonalPostcodeEditable, setIsPersonalPostcodeEditable] =
    useState(false);
  const [isNokPostcodeEditable, setIsNokPostcodeEditable] = useState(false);

  // Phone hook for shared options
  const phoneHook = usePhoneCountryCode("+234");

  // Consolidated phone states
  const [phoneData, setPhoneData] = useState({
    personal: { code: "+234", number: "" },
    work: { code: "+234", number: "" },
    nok: { code: "+234", number: "" },
    nokAlt: { code: "+234", number: "" },
  });

  const countriesResponse = useCountries();
  const countriesData = countriesResponse || [];

  const personalSearch = useSearchPostcode();
  const nokSearch = useSearchPostcode();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin =
    currentUser.role === "admin" ||
    currentUser.role === "co-admin" ||
    currentUser.role === "root-admin";
  const hasStaffInUrl = window.location.pathname.includes("staff");
  const shouldDisableSensitiveFields = hasStaffInUrl || !isAdmin;

  const roleOptions = [
    { value: "staff", label: "Staff" },
    { value: "admin", label: "Admin" },
    { value: "co-admin", label: "Co-Admin" },
  ];

  const maritalStatusOptions = [
    { value: "Single", label: "Single" },
    { value: "Married", label: "Married" },
    { value: "Divorced", label: "Divorced" },
    { value: "Widowed", label: "Widowed" },
  ];

  const getRoleLabel = (value) => {
    const option = roleOptions.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  // Memoized parse function
  const parsePhone = useCallback((fullPhone, options) => {
    if (!fullPhone) return { code: null, number: "" };
    let clean = fullPhone.replace(/[\s\-\(\)\.]/g, "");
    const hasPlus = clean.startsWith("+");
    if (hasPlus) {
      clean = clean.slice(1);
    }
    for (let opt of options) {
      const codeDigits = opt.value.slice(1);
      if (clean.startsWith(codeDigits)) {
        return {
          code: opt.value,
          number: clean.slice(codeDigits.length),
        };
      }
    }
    return { code: null, number: hasPlus ? "+" + clean : clean };
  }, []);

  // Single effect to initialize all phone data
  useEffect(() => {
    if (phoneHook.options.length === 0) return;

    const newPhoneData = { ...phoneData };

    // Personal phone
    if (formData?.personalPhone) {
      const parsed = parsePhone(formData.personalPhone, phoneHook.options);
      newPhoneData.personal = {
        code: parsed.code || phoneHook.countryCode,
        number: parsed.number,
      };
    }

    // Work phone
    if (formData?.workPhone) {
      const parsed = parsePhone(formData.workPhone, phoneHook.options);
      newPhoneData.work = {
        code: parsed.code || phoneHook.countryCode,
        number: parsed.number,
      };
    }

    // NOK phone
    if (formData?.nextOfKin?.phone) {
      const parsed = parsePhone(formData.nextOfKin.phone, phoneHook.options);
      newPhoneData.nok = {
        code: parsed.code || phoneHook.countryCode,
        number: parsed.number,
      };
    }

    // NOK alt phone
    if (formData?.nextOfKin?.altPhone) {
      const parsed = parsePhone(formData.nextOfKin.altPhone, phoneHook.options);
      newPhoneData.nokAlt = {
        code: parsed.code || phoneHook.countryCode,
        number: parsed.number,
      };
    }

    setPhoneData(newPhoneData);
  }, [
    formData?.personalPhone,
    formData?.workPhone,
    formData?.nextOfKin?.phone,
    formData?.nextOfKin?.altPhone,
    phoneHook.options,
    phoneHook.countryCode,
    parsePhone,
  ]);

  // Single effect to update form data when phone data changes
  useEffect(() => {
    if (!isEditing.personal && !isEditing.nextOfKin) return;

    // Update personal phones
    if (isEditing.personal) {
      const personalFullPhone = phoneData.personal.number
        ? `${phoneData.personal.code} ${phoneData.personal.number}`
        : phoneData.personal.code;

      const workFullPhone = phoneData.work.number
        ? `${phoneData.work.code} ${phoneData.work.number}`
        : phoneData.work.code;

      // Only update if changed to prevent infinite loops
      if (formData?.personalPhone !== personalFullPhone) {
        handleInputChange("personal", "personalPhone", personalFullPhone);
      }

      if (formData?.workPhone !== workFullPhone) {
        handleInputChange("personal", "workPhone", workFullPhone);
      }
    }

    // Update NOK phones
    if (isEditing.nextOfKin) {
      const nokFullPhone = phoneData.nok.number
        ? `${phoneData.nok.code} ${phoneData.nok.number}`
        : phoneData.nok.code;

      const nokAltFullPhone = phoneData.nokAlt.number
        ? `${phoneData.nokAlt.code} ${phoneData.nokAlt.number}`
        : phoneData.nokAlt.code;

      if (formData?.nextOfKin?.phone !== nokFullPhone) {
        handleInputChange("nextOfKin", "phone", nokFullPhone);
      }

      if (formData?.nextOfKin?.altPhone !== nokAltFullPhone) {
        handleInputChange("nextOfKin", "altPhone", nokAltFullPhone);
      }
    }
  }, [
    phoneData,
    isEditing.personal,
    isEditing.nextOfKin,
    formData,
    handleInputChange,
  ]);

  // Phone update handlers
  const handlePhoneChange = useCallback((field, type, value) => {
    setPhoneData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [type]: value,
      },
    }));
  }, []);

  const validateNextOfKinEmail = (value) => {
    if (value && value.includes("@")) {
      const userDomain = formData?.email.split("@")[1];
      const kinDomain = value.split("@")[1];
      if (kinDomain !== userDomain) {
        setErrors((prev) => ({
          ...prev,
          nextOfKinEmail: "Email must be from the same domain as your email.",
        }));
      } else {
        setErrors((prev) => ({ ...prev, nextOfKinEmail: "" }));
      }
    } else if (value) {
      setErrors((prev) => ({
        ...prev,
        nextOfKinEmail: "Please enter a valid email address.",
      }));
    } else {
      setErrors((prev) => ({ ...prev, nextOfKinEmail: "" }));
    }
  };

  // Update states when personal country changes
  useEffect(() => {
    if (formData?.country && countriesData.length > 0) {
      const country = countriesData.find((c) => c.name === formData?.country);
      if (country) {
        setSelectedCountry(country);
        setStates(country?.states || []);
        setCities([]);

        // Reset state if it doesn't match the new country's states
        const currentState = formData?.state;
        if (
          currentState &&
          !country.states.some((s) => s.name === currentState)
        ) {
          handleInputChange("personal", "state", "");
        }
      } else {
        setStates([]);
        setSelectedCountry(null);
      }
    } else {
      setStates([]);
      setSelectedCountry(null);
    }
  }, [formData?.country, countriesData]);

  // Set selected state when states or formData?.state changes
  useEffect(() => {
    if (formData?.state && states.length > 0) {
      const stateObj = states.find((s) => s.name === formData?.state);
      setSelectedState(stateObj || null);
    } else {
      setSelectedState(null);
    }
  }, [formData?.state, states]);

  // Fetch cities when personal state changes
  useEffect(() => {
    if (selectedState && selectedCountry) {
      const fetchCities = async () => {
        setLoadingCities(true);
        try {
          console.log("Fetching cities for:", {
            country: selectedCountry.name,
            state: selectedState.name,
          });

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
    } else {
      setCities([]);
    }
  }, [selectedState, selectedCountry]);

  // Reset city if not in fetched cities
  useEffect(() => {
    if (
      !loadingCities &&
      cities.length > 0 &&
      formData?.city &&
      !cities.includes(formData?.city)
    ) {
      handleInputChange("personal", "city", "");
    }
  }, [cities, formData?.city, loadingCities]);

  const handlePersonalStateChange = (e) => {
    const stateName = e.target.value;
    const stateObj = states.find((s) => s.name === stateName);
    setSelectedState(stateObj || null);
    handleInputChange("personal", "state", stateName);
  };

  const handlePersonalAddressChange = (e) => {
    const value = e.target.value;
    personalSearch.handleAddressInputChange(value, (val) =>
      handleInputChange("personal", "address", val)
    );
  };

  const handleNokAddressChange = (e) => {
    const value = e.target.value;
    nokSearch.handleAddressInputChange(value, (val) =>
      handleInputChange("nextOfKin", "address", val)
    );
  };

  if (!formData) return null;

  return (
    <div className="step-form">
      <div className="info-card">
        <div className="card-header">
          <h4>Personal Information</h4>
          <button
            className="edit-button"
            onClick={() => handleEditToggle("personal")}
          >
            {isEditing.personal ? (
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
            <label>First Name</label>
            {isEditing.personal ? (
              <input
                type="text"
                name="firstName"
                value={formData?.firstName}
                onChange={(e) =>
                  handleInputChange("personal", "firstName", e.target.value)
                }
                className="edit-input"
              />
            ) : (
              <span>{formData?.firstName}</span>
            )}
          </div>
          <div className="info-item">
            <label>Last Name</label>
            {isEditing.personal ? (
              <input
                type="text"
                name="lastName"
                value={formData?.lastName}
                onChange={(e) =>
                  handleInputChange("personal", "lastName", e.target.value)
                }
                className="edit-input"
              />
            ) : (
              <span>{formData?.lastName}</span>
            )}
          </div>
          <div className="info-item">
            <label>Role</label>
            {isEditing.personal ? (
              <select
                name="role"
                value={formData?.role}
                onChange={(e) =>
                  handleInputChange("personal", "role", e.target.value)
                }
                className="edit-input"
              >
                <option value="">Select Role</option>
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <span>{getRoleLabel(normalizeText(formData?.role)) || "-"}</span>
            )}
          </div>
          <div className="info-item disabled">
            <label>Email</label>
            <span>{formData?.email}</span>
          </div>
          <div className="info-item">
            <label>Personal Phone Number</label>
            {isEditing.personal ? (
              <div
                className="phone-input-container"
                style={{ display: "flex", gap: "5px" }}
              >
                {phoneHook.loading ? (
                  <FiLoader />
                ) : (
                  <select
                    value={phoneData.personal.code}
                    onChange={(e) =>
                      handlePhoneChange("personal", "code", e.target.value)
                    }
                    className="edit-input"
                    style={{ width: "65px" }}
                  >
                    {phoneHook.options.map((opt, index) => (
                      <option key={index} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
                <input
                  type="tel"
                  value={phoneData.personal.number}
                  onChange={(e) =>
                    handlePhoneChange(
                      "personal",
                      "number",
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="Phone number"
                  className="edit-input"
                />
              </div>
            ) : (
              <span>{formData?.personalPhone}</span>
            )}
          </div>
          <div className="info-item">
            <label>Work Phone Number</label>
            {isEditing.personal ? (
              <div
                className="phone-input-container"
                style={{ display: "flex", gap: "5px" }}
              >
                {phoneHook.loading ? (
                  <FiLoader />
                ) : (
                  <select
                    value={phoneData.work.code}
                    onChange={(e) =>
                      handlePhoneChange("work", "code", e.target.value)
                    }
                    className="edit-input"
                    style={{ width: "65px" }}
                  >
                    {phoneHook.options.map((opt, index) => (
                      <option key={index} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
                <input
                  type="tel"
                  value={phoneData.work.number}
                  onChange={(e) =>
                    handlePhoneChange(
                      "work",
                      "number",
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="Phone number"
                  className="edit-input"
                />
              </div>
            ) : (
              <span>{formData?.workPhone}</span>
            )}
          </div>
          <div className="info-item">
            <label>Marital Status</label>
            {isEditing.personal ? (
              <select
                name="maritalStatus"
                value={formData?.maritalStatus || ""}
                onChange={(e) =>
                  handleInputChange("personal", "maritalStatus", e.target.value)
                }
                className="edit-input"
              >
                <option value="">Select Marital Status</option>
                {maritalStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <span>{formData?.maritalStatus || "-"}</span>
            )}
          </div>
          {isEditing.personal ? (
            <>
              <div className="info-item">
                <label>Country</label>
                <select
                  name="country"
                  value={formData?.country || ""}
                  onChange={(e) =>
                    handleInputChange("personal", "country", e.target.value)
                  }
                  className="edit-input"
                >
                  <option value="">Select Country</option>
                  {countriesData.map((country, index) => (
                    <option key={index} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="info-item">
                <label>State</label>
                <select
                  name="state"
                  value={formData?.state || ""}
                  onChange={handlePersonalStateChange}
                  disabled={!formData?.country || states.length === 0}
                  className="edit-input"
                >
                  <option value="">Select State</option>
                  {states.map((state, index) => (
                    <option key={index} value={state.name}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="info-item">
                <label>City</label>
                <select
                  name="city"
                  value={formData?.city || ""}
                  onChange={(e) =>
                    handleInputChange("personal", "city", e.target.value)
                  }
                  disabled={
                    !formData?.state || cities.length === 0 || loadingCities
                  }
                  className="edit-input"
                >
                  <option value="">Select City</option>
                  {cities.map((city, index) => (
                    <option key={index} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {loadingCities && (
                  <div className="error">Loading cities...</div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="info-item">
                <label>Country</label>
                <span>{formData?.country || "-"}</span>
              </div>
              <div className="info-item">
                <label>State</label>
                <span>{formData?.state || "-"}</span>
              </div>
              <div className="info-item">
                <label>City</label>
                <span>{formData?.city || "-"}</span>
              </div>
            </>
          )}
          <div className="info-item full-width">
            <label>Address</label>
            {isEditing.personal ? (
              <>
                <input
                  type="text"
                  name="address"
                  value={formData?.address}
                  onChange={handlePersonalAddressChange}
                  onBlur={personalSearch.handleBlur}
                  placeholder="e.g., 10 Downing Street, London"
                  className="edit-input"
                />
                {personalSearch.showSuggestions &&
                  personalSearch.suggestions.length > 0 && (
                    <div
                      className="suggestions-dropdown"
                      style={{ position: "relative", zIndex: 10 }}
                    >
                      {personalSearch.suggestions.map((sug, index) => (
                        <div
                          key={index}
                          className="suggestion-item"
                          onClick={() => {
                            const result =
                              personalSearch.handleSuggestionSelect(
                                sug,
                                (val) =>
                                  handleInputChange("personal", "address", val),
                                (val) =>
                                  handleInputChange("personal", "postCode", val)
                              );
                            setIsPersonalPostcodeEditable(
                              result.postcode === ""
                            );
                          }}
                          style={{
                            padding: "8px",
                            border: "1px solid #ccc",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                            marginBottom: "1px",
                          }}
                        >
                          {sug.display_name}
                        </div>
                      ))}
                    </div>
                  )}
              </>
            ) : (
              <span>{formData?.address}</span>
            )}
          </div>
          <div className="info-item">
            <label>Post Code</label>
            {isEditing.personal ? (
              <input
                type="text"
                name="postCode"
                value={formData?.postCode}
                onChange={(e) => {
                  if (isPersonalPostcodeEditable) {
                    handleInputChange("personal", "postCode", e.target.value);
                  }
                }}
                readOnly={!isPersonalPostcodeEditable}
                placeholder={
                  isPersonalPostcodeEditable
                    ? "Enter postcode manually"
                    : undefined
                }
                className="edit-input"
              />
            ) : (
              <span>{formData?.postCode}</span>
            )}
          </div>
        </div>

        {(() => {
          const lastUpdated =
            formData.lastUpdatedBy || formData.last_updated_by || formData.profile?.last_updated_by || null;
          if (!lastUpdated) return null;
          return (
            <div className="last-edited-by">
              Last Edited By : {lastUpdated.first_name} {" "}
              {lastUpdated.last_name} - {lastUpdated.email}
            </div>
          );
        })()}
      </div>

      <div className="info-card">
        <div className="card-header">
          <h4>Next of Kin</h4>
          <button
            className="edit-button"
            onClick={() => handleEditToggle("nextOfKin")}
          >
            {isEditing.nextOfKin ? (
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
            <label>Name</label>
            {isEditing.nextOfKin ? (
              <input
                type="text"
                name="name"
                value={formData?.nextOfKin.name}
                onChange={(e) =>
                  handleInputChange("nextOfKin", "name", e.target.value)
                }
                className="edit-input"
              />
            ) : (
              <span>{formData?.nextOfKin.name}</span>
            )}
          </div>
          <div className="info-item">
            <label>Email</label>
            {isEditing.nextOfKin ? (
              <>
                <input
                  type="text"
                  name="email"
                  value={formData?.nextOfKin.email}
                  onChange={(e) =>
                    handleInputChange("nextOfKin", "email", e.target.value)
                  }
                  onBlur={(e) => validateNextOfKinEmail(e.target.value)}
                  className="edit-input"
                />
                {errors.nextOfKinEmail && (
                  <div className="error">{errors.nextOfKinEmail}</div>
                )}
              </>
            ) : (
              <span>{formData?.nextOfKin.email}</span>
            )}
          </div>
          <div className="info-item">
            <label>Phone Number</label>
            {isEditing.nextOfKin ? (
              <div
                className="phone-input-container"
                style={{ display: "flex", gap: "5px" }}
              >
                {phoneHook.loading ? (
                  <FiLoader />
                ) : (
                  <select
                    value={phoneData.nok.code}
                    onChange={(e) =>
                      handlePhoneChange("nok", "code", e.target.value)
                    }
                    className="edit-input"
                    style={{ width: "65px" }}
                  >
                    {phoneHook.options.map((opt, index) => (
                      <option key={index} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
                <input
                  type="tel"
                  value={phoneData.nok.number}
                  onChange={(e) =>
                    handlePhoneChange(
                      "nok",
                      "number",
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="Phone number"
                  className="edit-input"
                />
              </div>
            ) : (
              <span>{formData?.nextOfKin.phone}</span>
            )}
          </div>
          <div className="info-item">
            <label>Alt. Phone Number</label>
            {isEditing.nextOfKin ? (
              <div
                className="phone-input-container"
                style={{ display: "flex", gap: "5px" }}
              >
                {phoneHook.loading ? (
                  <FiLoader />
                ) : (
                  <select
                    value={phoneData.nokAlt.code}
                    onChange={(e) =>
                      handlePhoneChange("nokAlt", "code", e.target.value)
                    }
                    className="edit-input"
                    style={{ width: "65px" }}
                  >
                    {phoneHook.options.map((opt, index) => (
                      <option key={index} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
                <input
                  type="tel"
                  value={phoneData.nokAlt.number}
                  onChange={(e) =>
                    handlePhoneChange(
                      "nokAlt",
                      "number",
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="Phone number"
                  className="edit-input"
                />
              </div>
            ) : (
              <span>{formData?.nextOfKin.altPhone}</span>
            )}
          </div>
          <div className="info-item">
            <label>Town</label>
            {isEditing.nextOfKin ? (
              <input
                type="text"
                name="town"
                value={formData?.nextOfKin.town}
                onChange={(e) =>
                  handleInputChange("nextOfKin", "town", e.target.value)
                }
                className="edit-input"
              />
            ) : (
              <span>{formData?.nextOfKin.town}</span>
            )}
          </div>
          <div className="info-item">
            <label>Relationship to Next of Kin</label>
            {isEditing.nextOfKin ? (
              <input
                type="text"
                name="relationship"
                value={formData?.nextOfKin.relationship}
                onChange={(e) =>
                  handleInputChange("nextOfKin", "relationship", e.target.value)
                }
                className="edit-input"
              />
            ) : (
              <span>{formData?.nextOfKin.relationship}</span>
            )}
          </div>
          <div className="info-item full-width">
            <label>Address</label>
            {isEditing.nextOfKin ? (
              <>
                <input
                  type="text"
                  name="address"
                  value={formData?.nextOfKin.address}
                  onChange={handleNokAddressChange}
                  onBlur={nokSearch.handleBlur}
                  placeholder="e.g., 10 Downing Street, London"
                  className="edit-input"
                />
                {nokSearch.showSuggestions &&
                  nokSearch.suggestions.length > 0 && (
                    <div
                      className="suggestions-dropdown"
                      style={{ position: "relative", zIndex: 10 }}
                    >
                      {nokSearch.suggestions.map((sug, index) => (
                        <div
                          key={index}
                          className="suggestion-item"
                          onClick={() => {
                            const result = nokSearch.handleSuggestionSelect(
                              sug,
                              (val) =>
                                handleInputChange("nextOfKin", "address", val),
                              (val) =>
                                handleInputChange("nextOfKin", "postCode", val)
                            );
                            setIsNokPostcodeEditable(result.postcode === "");
                          }}
                          style={{
                            padding: "8px",
                            border: "1px solid #ccc",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                            marginBottom: "1px",
                          }}
                        >
                          {sug.display_name}
                        </div>
                      ))}
                    </div>
                  )}
              </>
            ) : (
              <span>{formData?.nextOfKin.address}</span>
            )}
          </div>
          <div className="info-item">
            <label>Post Code</label>
            {isEditing.nextOfKin ? (
              <input
                type="text"
                name="postCode"
                value={formData?.nextOfKin.postCode}
                onChange={(e) => {
                  if (isNokPostcodeEditable) {
                    handleInputChange("nextOfKin", "postCode", e.target.value);
                  }
                }}
                readOnly={!isNokPostcodeEditable}
                placeholder={
                  isNokPostcodeEditable ? "Enter postcode manually" : undefined
                }
                className="edit-input"
              />
            ) : (
              <span>{formData?.nextOfKin.postCode}</span>
            )}
          </div>
        </div>

        {(() => {
          const lastUpdated =
            formData.lastUpdatedBy || formData.last_updated_by || formData.profile?.last_updated_by || null;
          if (!lastUpdated) return null;
          return (
            <div className="last-edited-by">
              Last Edited By : {lastUpdated.first_name} {" "}
              {lastUpdated.last_name} - {lastUpdated.email}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default BasicInformationStep;

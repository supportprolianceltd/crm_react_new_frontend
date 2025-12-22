import InputField from "../../../../../components/Input/InputField";
import SelectField from "../../../../../components/Input/SelectField";
import TextAreaField from "../../../../../components/Input/TextAreaField";
import CheckboxGroup from "../../../../../components/CheckboxGroup";
import { useState } from "react";
import useSearchPostcode from "../../../../../hooks/useSearchPostcode";

const AddressStep = ({
  formData,
  handleChange,
  setFocusedInput,
  handlePhoneChange,
  focusedInput,
}) => {
  const {
    suggestions: addressSuggestions,
    showSuggestions,
    handleAddressInputChange,
    handleSuggestionSelect,
    handleBlur,
  } = useSearchPostcode();
  // Handle lives alone checkbox change
  const handleLivesAloneChange = (newValue) => {
    const value = newValue; // This will be "yes" or "no"

    // Update the livesAlone field
    handleChange({
      target: {
        name: "livesAlone",
        value: value,
      },
    });

    // Clear the cohabitants field if they live alone (value === "yes")
    if (value === "yes") {
      handleChange({
        target: {
          name: "cohabitants",
          value: "",
        },
      });
    }
  };

  // Options for lives alone checkbox
  const livesAloneOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];

  // Updated type of residence options with value and label
  const typeOfResidenceOptions = [
    { value: "private_home", label: "Private Home" },
    { value: "care_home", label: "Care Home" },
    { value: "assisted_living", label: "Assisted Living" },
    { value: "sheltered", label: "Sheltered Housing" },
  ];

  return (
    <>
      {/* Address */}
      <div className="form-section">
        <h3>Address</h3>

        {/* Address Line */}
        <div className="GHuh-Form-Input">
          <label>Address Line</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              name="address"
              value={formData.address || ""}
              onChange={(e) => handleAddressInputChange(e.target.value, (val) => handleChange({ target: { name: 'address', value: val } }))}
              onFocus={() => setFocusedInput("address")}
              onBlur={handleBlur}
              required
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

        {/* Town/City and County Row */}
        <div className="input-row">
          <InputField
            label="Town/City"
            name="city"
            value={formData.city || ""}
            onChange={handleChange}
            onFocus={() => setFocusedInput("city")}
            onBlur={() => setFocusedInput(null)}
            required
            placeholder="Enter town or city"
          />
          <InputField
            label="County"
            name="county"
            value={formData.county || ""}
            onChange={handleChange}
            onFocus={() => setFocusedInput("county")}
            onBlur={() => setFocusedInput(null)}
            required
            placeholder="Enter county"
          />
        </div>

        {/* Postal Code Row */}
        <div className="input-row">
          <InputField
            label="Postcode"
            name="postalCode"
            value={formData.postalCode || ""}
            onChange={handleChange}
            onFocus={() => setFocusedInput("postalCode")}
            onBlur={() => setFocusedInput(null)}
            required
            placeholder="Enter postcode"
          />
          <div style={{ visibility: "hidden", height: 0 }}>Placeholder</div>
        </div>

        {/* Type of Residence */}
        <SelectField
          label="Type of Residence"
          name="residenceType"
          value={formData.residenceType || ""}
          options={typeOfResidenceOptions}
          onChange={handleChange}
          required
        />

        {/* Does the client live alone? */}
        <div
          className="checkbox-section GHuh-Form-Input"
          style={{ marginTop: "1.5rem" }}
        >
          <CheckboxGroup
            label="Does the client live alone?"
            options={livesAloneOptions}
            value={formData.livesAlone || ""}
            onChange={handleLivesAloneChange}
            multiple={false}
            row={true}
          />
        </div>

        {/* Cohabitants field - only show if lives alone is "no" */}
        {formData.livesAlone === "no" && (
          <TextAreaField
            label="If no, please give details of who else resides at the property?"
            name="cohabitants"
            value={formData.cohabitants || ""}
            onChange={handleChange}
            onFocus={() => setFocusedInput("cohabitants")}
            onBlur={() => setFocusedInput(null)}
            placeholder="Enter details of other residents (names, relationships, etc.)"
            required={formData.livesAlone === "no"}
          />
        )}

        {/* Key Safe/Access Instructions */}
        <TextAreaField
          label="Key Safe/Access Instructions"
          name="keySafeAccessInstructions"
          value={formData.keySafeAccessInstructions || ""}
          onChange={handleChange}
          onFocus={() => setFocusedInput("keySafeAccessInstructions")}
          onBlur={() => setFocusedInput(null)}
          placeholder="Enter any key safe codes, access instructions, or special entry requirements"
        />
      </div>

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
    </>
  );
};

export default AddressStep;

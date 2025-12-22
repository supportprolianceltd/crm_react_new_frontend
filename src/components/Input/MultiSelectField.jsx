// components/Input/MultiSelectField.js
import React from "react";

export default function MultiSelectField({
  label,
  options,
  value = [], // Default to empty array
  onChange,
  name,
  onFocus,
  onBlur,
  className = "",
  placeholder = "",
  size = 4, // Number of visible options
  required = false,
}) {
  const defaultPlaceholder =
    placeholder || `Select ${label ? label.toLowerCase() : "options"}`;

  // Check if options are objects with label/value or simple strings
  const isObjectOptions = options.length > 0 && typeof options[0] === "object";

  const handleChange = (e) => {
    const selectedValues = Array.from(e.target.selectedOptions)
      .map((option) => {
        const val = option.value;
        // Convert to number if it's a numeric string
        return !isNaN(val) && val !== "" ? parseInt(val) : val;
      })
      .filter((val) => val !== ""); // Filter out empty values

    // Create a synthetic event to match the expected format
    const syntheticEvent = {
      target: {
        name: name,
        value: selectedValues,
        type: "multiselect",
      },
    };

    onChange(syntheticEvent);
  };

  return (
    <div className={`GHuh-Form-Input ${className}`}>
      {label && (
        <label>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <div>
        <select
          name={name}
          value={value}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={onBlur}
          multiple
          size={size}
          style={{
            minHeight: "120px",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ddd",
          }}
        >
          <option value="" disabled hidden>
            {defaultPlaceholder}
          </option>
          {options.map((opt, i) => {
            if (isObjectOptions) {
              return (
                <option key={i} value={opt.value}>
                  {opt.label}
                </option>
              );
            } else {
              return (
                <option key={i} value={opt}>
                  {opt}
                </option>
              );
            }
          })}
        </select>
        <small style={{ color: "#666", fontSize: "12px", marginTop: "4px" }}>
          Hold Ctrl/Cmd to select multiple options
        </small>
      </div>
    </div>
  );
}

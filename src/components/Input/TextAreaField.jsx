// components/TextAreaField.jsx
import React from "react";

const TextAreaField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  onFocus,
  onBlur,
  error,
  className = "",
  rows = 3,
  maxLength = 500,
}) => {
  return (
    <div className={`GHuh-Form-Input ${className}`}>
      <label>{label}</label>
      <div>
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={onFocus}
          onBlur={onBlur}
          rows={rows}
          maxLength={maxLength}
          className={error ? "input-error" : ""}
          style={{
            resize: "vertical",
            minHeight: "80px",
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontFamily: "inherit",
            fontSize: "14px",
            lineHeight: "1.4",
            width: "100%",
            boxSizing: "border-box",
          }}
        />
        <div
          style={{
            fontSize: "12px",
            color: "#666",
            textAlign: "right",
            marginTop: "2px",
          }}
        >
          {value?.length || 0}/{maxLength}
        </div>
      </div>
      {error && (
        <div
          className="error-message"
          style={{ color: "red", fontSize: "12px", marginTop: "4px" }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default TextAreaField;

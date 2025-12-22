import React from "react";
import "./styles.css";

const RadioGroup = ({ label, options, value, onChange }) => {
  return (
    <div className="radio-group">
      {label && <p className="radio-title">{label}</p>}

      {options.map((option) => (
        <label key={option.value} className="radio-option">
          <input
            type="radio"
            name={label}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span className="custom-radio"></span>
          {option.label}
        </label>
      ))}
    </div>
  );
};

export default RadioGroup;

import InputField from "./InputField";
import { useState } from "react";

const DateInputField = ({
  label,
  name,
  type,
  value,
  onChange,
  min,
  max,
  onValidationError,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [error, setError] = useState("");

  const handleBlur = (e) => {
    const inputValue = e.target.value;

    if (inputValue) {
      let isValid = true;

      if (max && !validateDateRange(inputValue, null, max)) {
        setError(`Date cannot be after ${formatDisplayDate(max)}`);
        isValid = false;
      } else if (min && !validateDateRange(inputValue, min, null)) {
        setError(`Date cannot be before ${formatDisplayDate(min)}`);
        isValid = false;
      } else {
        setError("");
      }

      if (isValid) {
        onChange({ target: { name, value: inputValue } });
      } else if (onValidationError) {
        onValidationError(name, inputValue);
      }
    } else {
      setError("");
    }
  };

  const handleChange = (e) => {
    setLocalValue(e.target.value);
    setError(""); // Clear error on new input
  };

  return (
    <div>
      <InputField
        label={label}
        name={name}
        type={type}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        min={min}
        max={max}
        error={error}
      />
      {error && (
        <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default DateInputField;

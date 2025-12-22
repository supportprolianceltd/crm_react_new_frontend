import "./styles.css";

// const CheckboxGroup = ({
//   label,
//   options,
//   value,
//   onChange,
//   multiple = false, // Add a prop to toggle between modes
// }) => {
//   const handleChange = (optionValue) => {
//     if (multiple) {
//       // For multiple selections
//       const newValue = value.includes(optionValue)
//         ? value.filter((v) => v !== optionValue) // Remove if already selected
//         : [...value, optionValue]; // Add if not selected
//       onChange(newValue);
//     } else {
//       // For single selection
//       onChange(optionValue);
//     }
//   };

//   return (
//     <div className="checkbox-group">
//       {label && <p className="checkbox-title">{label}</p>}

//       {options.map((option) => (
//         <label key={option.value} className="checkbox-option">
//           <input
//             type={multiple ? "checkbox" : "radio"} // Toggle input type
//             name={label}
//             value={option.value}
//             checked={
//               multiple ? value.includes(option.value) : value === option.value
//             }
//             onChange={() => handleChange(option.value)}
//           />
//           <span className={`custom-${multiple ? "checkbox" : "radio"}`}></span>
//           {option.label}
//         </label>
//       ))}
//     </div>
//   );
// };

const CheckboxGroup = ({
  label,
  options,
  value,
  onChange,
  multiple = false,
  row = false,
}) => {
  const handleChange = (optionValue) => {
    if (multiple) {
      const newValue = value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue];
      onChange(newValue);
    } else {
      // For single checkbox (not radio), toggle the boolean value
      if (options.length === 1 && options[0].value === true) {
        // This is a single checkbox - toggle boolean value
        onChange(!value);
      } else {
        // This is a radio group - set the selected value
        onChange(optionValue);
      }
    }
  };

  return (
    <div className="checkbox-group">
      {label && <p className="checkbox-title">{label}</p>}
      <div className={row ? "checkbox-options-row" : ""}>
        {options.map((option) => (
          <label
            key={option.value}
            className="checkbox-option"
            style={{ display: "flex" }}
          >
            <input
              type={
                multiple || (options.length === 1 && options[0].value === true)
                  ? "checkbox"
                  : "radio"
              }
              name={label}
              value={option.value}
              checked={
                multiple
                  ? value.includes(option.value)
                  : value === option.value ||
                    (options.length === 1 &&
                      options[0].value === true &&
                      value === true)
              }
              onChange={() => handleChange(option.value)}
            />
            <span
              className={`custom-${
                multiple || (options.length === 1 && options[0].value === true)
                  ? "checkbox"
                  : "radio"
              }`}
            ></span>
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
};

export default CheckboxGroup;

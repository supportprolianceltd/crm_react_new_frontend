export default function SelectField({
  label,
  options,
  value,
  onChange,
  name,
  onFocus,
  onBlur,
  className = "",
  placeholder = "",
}) {
  // Generate placeholder text if not provided
  const defaultPlaceholder =
    placeholder || `Select ${label ? "a " + label.toLowerCase() : "an option"}`;

  // Check if options are objects with label/value or simple strings
  const isObjectOptions = options.length > 0 && typeof options[0] === "object";

  return (
    <div className={`GHuh-Form-Input ${className}`}>
      {label && <label>{label}</label>}
      <div>
        <select
          name={name}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
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
      </div>
    </div>
  );
}

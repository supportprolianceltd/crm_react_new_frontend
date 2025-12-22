export default function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  icon,
  children,
  placeholder,
  onFocus,
  onBlur,
  error,
  className = "",
  min,
  max,
}) {
  return (
    <div className={`GHuh-Form-Input ${className}`}>
      <label>{label}</label>
      <div>
        {icon && <span className="icon">{icon}</span>}
        {children || (
          <input
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            onFocus={onFocus}
            onBlur={onBlur}
            className={error ? "input-error" : ""}
            min={min}
            max={max}
          />
        )}
      </div>
    </div>
  );
}

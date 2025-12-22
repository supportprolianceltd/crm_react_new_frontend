import { useState, useEffect } from "react";
import "./styles.css";

const ToggleButton = ({ label, isOn: propIsOn, onToggle, showTick = true }) => {
  const [isOn, setIsOn] = useState(propIsOn);

  // Sync internal state with prop changes
  useEffect(() => {
    setIsOn(propIsOn);
  }, [propIsOn]);

  const handleToggle = () => {
    const newState = !isOn;
    setIsOn(newState);
    if (onToggle) onToggle(newState);
  };

  return (
    <div className="toggle-container">
      <span className="toggle-label">{label}</span>
      <div
        className={`toggle-switch ${isOn ? "on" : ""}`}
        onClick={handleToggle}
      >
        <div className="toggle-knob">
          {isOn && showTick && <span className="checkmark-icon">✔</span>}
        </div>
      </div>
    </div>
  );
};

export default ToggleButton;

import { useState } from "react";
import "./styles.css";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

const SortOptions = ({ options, onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(options[0]);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    onSortChange(option.value);
  };

  return (
    <div className="sort-container">
      <button
        className="sort-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        Sort by: {selectedOption.label}&nbsp;
        <ChevronDownIcon className={`arrow-icon ${isOpen ? "open" : ""}`} />
      </button>

      {isOpen && (
        <div className="sort-dropdown">
          {options.map((option) => (
            <div
              key={option.value}
              className={`dropdown-option ${
                selectedOption.value === option.value ? "selected" : ""
              }`}
              onClick={() => handleOptionClick(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortOptions;

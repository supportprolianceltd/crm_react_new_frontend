import { useState, useEffect, useRef } from "react";
import "./styles.css";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { FilterIcon } from "../../assets/icons/FilterIcon";

const FilterOptions = ({ options, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const filterRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsOpen(false);
        setActiveFilter(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMainOptionClick = (option) => {
    setActiveFilter(activeFilter?.value === option.value ? null : option);
    setIsOpen(true); // Keep dropdown open
  };

  const handleSubOptionChange = (filterType, value, isCheckbox) => {
    if (isCheckbox) {
      const newSelectedOptions = {
        ...selectedOptions,
        [filterType]: selectedOptions[filterType]
          ? selectedOptions[filterType].includes(value)
            ? selectedOptions[filterType].filter((opt) => opt !== value)
            : [...selectedOptions[filterType], value]
          : [value],
      };
      setSelectedOptions(newSelectedOptions);
      onFilterChange(filterType, newSelectedOptions[filterType] || []);
    } else {
      setSelectedOptions({
        ...selectedOptions,
        [filterType]: [value],
      });
      onFilterChange(filterType, value);
      setIsOpen(false);
      setActiveFilter(null);
    }
  };

  const getSelectedLabel = () => {
    // If we have selected options, show them in the format "Filter: Type1, Type2"
    const activeSelections = options
      .map((option) => {
        const selections = selectedOptions[option.value];
        if (selections && selections.length > 0) {
          const subOptionLabels = option.subOptions
            .filter((subOpt) => selections.includes(subOpt.value))
            .map((subOpt) => subOpt.label)
            .join(", ");
          return `${option.label}: ${subOptionLabels}`;
        }
        return null;
      })
      .filter(Boolean)
      .join("; ");

    return activeSelections || "Filter";
  };

  const clearSelections = (filterType) => {
    const newSelectedOptions = { ...selectedOptions };
    delete newSelectedOptions[filterType];
    setSelectedOptions(newSelectedOptions);
    onFilterChange(filterType, []);
  };

  return (
    <div className="filter-container" ref={filterRef}>
      <button
        className="filter-button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setActiveFilter(null);
        }}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="filter-button-text">{getSelectedLabel()}</span>
        <FilterIcon />
      </button>

      {isOpen && (
        <div className="filter-dropdown">
          {options.map((option) => (
            <div key={option.value} className="filter-option-group">
              <div
                className={`dropdown-option main-option ${
                  activeFilter?.value === option.value ? "active" : ""
                }`}
                onClick={() => handleMainOptionClick(option)}
              >
                <div className="main-option-content">
                  <span>{option.label}</span>
                  {selectedOptions[option.value]?.length > 0 && (
                    <button
                      className="clear-selection"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearSelections(option.value);
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
                <ChevronDownIcon
                  className={`arrow-icon ${
                    activeFilter?.value === option.value ? "open" : ""
                  }`}
                />
              </div>

              {activeFilter?.value === option.value && (
                <div className="sub-options-container">
                  {option.subOptions.map((subOption) => (
                    <div
                      key={subOption.value}
                      className="sub-option"
                      onClick={(e) => {
                        if (!option.isCheckbox) {
                          handleSubOptionChange(
                            option.value,
                            subOption.value,
                            option.isCheckbox
                          );
                        }
                        e.stopPropagation();
                      }}
                    >
                      {option.isCheckbox ? (
                        <label className="checkbox-option">
                          <input
                            type="checkbox"
                            checked={
                              selectedOptions[option.value]?.includes(
                                subOption.value
                              ) || false
                            }
                            onChange={() =>
                              handleSubOptionChange(
                                option.value,
                                subOption.value,
                                option.isCheckbox
                              )
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                          {subOption.label}
                        </label>
                      ) : (
                        subOption.label
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterOptions;

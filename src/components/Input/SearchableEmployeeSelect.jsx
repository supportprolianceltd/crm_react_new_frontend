import { useState, useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";

const SearchableEmployeeSelect = ({
  label,
  value,
  onChange,
  users,
  isLoading,
  placeholder,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const displayValue = value ? value : searchQuery;

  useEffect(() => {
    if (users.length > 0 && !value) {
      setFilteredUsers(users);
    }
  }, [users, value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowDropdown(true);
    if (value) {
      onChange({ target: { name: "employee", value: "" } }); // Clear selection if typing
    }
    const filtered = users.filter(
      (user) =>
        (user.first_name || "").toLowerCase().includes(query.toLowerCase()) ||
        (user.last_name || "").toLowerCase().includes(query.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleSelectUser = (user) => {
    const selectedLabel = `${user.first_name || ""} ${user.last_name || ""} (${
      user.email || "N/A"
    })`;
    onChange({ target: { name: "employee", value: selectedLabel } });
    setSearchQuery(selectedLabel);
    setShowDropdown(false);
  };

  const handleClear = () => {
    onChange({ target: { name: "employee", value: "" } });
    setSearchQuery("");
    setShowDropdown(false);
  };

  const handleFocus = () => {
    if (!value && !searchQuery) {
      setShowDropdown(true);
    }
  };

  return (
    <div className="searchable-select-container" ref={dropdownRef}>
      <label className="input-label">{label}</label>
      <div className="searchable-select-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={
            placeholder || "Search for employees by name or email..."
          }
          className="searchable-select-input"
          disabled={isLoading}
          readOnly={!!value && !showDropdown}
        />
        {value && (
          <button
            type="button"
            className="clear-button"
            onClick={handleClear}
            disabled={isLoading}
          >
            <FiX size={14} />
          </button>
        )}
      </div>
      {showDropdown && filteredUsers.length > 0 && (
        <ul className="searchable-select-dropdown">
          {filteredUsers.map((user) => {
            const userLabel = `${user.first_name || ""} ${
              user.last_name || ""
            } (${user.email || "N/A"})`;
            return (
              <li
                key={user.id}
                className="searchable-select-option"
                onClick={() => handleSelectUser(user)}
              >
                <div className="employee-name">{`${user.first_name || ""} ${
                  user.last_name || ""
                }`}</div>
                <div className="employee-details">
                  <span className="employee-dept">
                    {user.job_role || "N/A"}
                  </span>
                  &nbsp; •&nbsp;
                  <span className="employee-email">{user.email || "N/A"}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {showDropdown && filteredUsers.length === 0 && (
        <div className="searchable-select-no-results">No employees found</div>
      )}
    </div>
  );
};

export default SearchableEmployeeSelect;

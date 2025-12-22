import React, { useState, useEffect } from "react";
import EyeIcon from "../../../../../components/Icons/EyeIcon";
import EyeSlashIcon from "../../../../../components/Icons/EyeSlashIcon";
import InputField from "../../../../../components/Input/InputField";
import SelectField from "../../../../../components/Input/SelectField";

export default function LoginCredentialsStep({ formData, handleChange }) {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState(formData.password || "");
  const [username, setUsername] = useState(formData.username || "");

  // Generate random password when component mounts
  useEffect(() => {
    if (!formData.password) {
      const generatedPassword = generateRandomPassword();
      setPassword(generatedPassword);
      handleChange({
        target: {
          name: "password",
          value: generatedPassword,
        },
      });
    }
  }, []);

  // Generate username from first and last name
  useEffect(() => {
    if (formData.firstName && formData.lastName && !formData.username) {
      const generatedUsername = `${formData.firstName.toLowerCase()}${formData.lastName.toLowerCase()}${Math.floor(
        Math.random() * 100
      )}`;
      setUsername(generatedUsername);
      handleChange({
        target: {
          name: "username",
          value: generatedUsername,
        },
      });
    }
  }, [formData.firstName, formData.lastName]);

  const generateRandomPassword = () => {
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const regeneratePassword = () => {
    const newPassword = generateRandomPassword();
    setPassword(newPassword);
    handleChange({
      target: {
        name: "password",
        value: newPassword,
      },
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    handleChange(e);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    handleChange(e);
  };

  return (
    <div className="login-credentials-step">
      <h3>Login Credentials</h3>
      <p className="step-subtitle">
        Set up the employee's login credentials and access permissions
      </p>

      <div className="credentials-grid">
        <div className="input-group">
          <InputField
            label="Username"
            name="username"
            placeholder="Enter username (e.g., olivia09)"
            value={username}
            onChange={handleUsernameChange}
            required
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter Password (min 8 characters)"
              value={password}
              onChange={handlePasswordChange}
              className="password-input"
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <EyeSlashIcon className="icon" />
              ) : (
                <EyeIcon className="icon" />
              )}
            </button>
          </div>
          <button
            type="button"
            className="generate-password-btn"
            onClick={regeneratePassword}
          >
            Generate New Password
          </button>
        </div>

        <div className="input-group">
          <SelectField
            label="Two-Factor Authentication"
            name="twoFactor"
            value={formData.twoFactor || ""}
            onChange={handleChange}
            options={[
              { value: "", label: "Select option" },
              { value: "Enable", label: "Enable" },
              { value: "Disable", label: "Disable" },
            ]}
            required
          />
        </div>

        <div className="input-group">
          <SelectField
            label="Dashboard Access"
            name="dashboard"
            value={formData.dashboard || ""}
            onChange={handleChange}
            options={[
              { value: "", label: "Select dashboard" },
              { value: "Staff", label: "Staff" },
              { value: "Admin", label: "Admin" },
              { value: "Sub Admin", label: "Sub Admin" },
            ]}
            required
          />
        </div>

        <div className="input-group">
          <SelectField
            label="Account Status"
            name="status"
            value={formData.status || ""}
            onChange={handleChange}
            options={[
              { value: "", label: "Select status" },
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" },
            ]}
            required
          />
        </div>
      </div>

      <div className="password-strength">
        <h4>Password Requirements:</h4>
        <ul>
          <li className={password.length >= 8 ? "met" : ""}>
            Minimum 8 characters
          </li>
          <li className={/[A-Z]/.test(password) ? "met" : ""}>
            At least one uppercase letter
          </li>
          <li className={/[0-9]/.test(password) ? "met" : ""}>
            At least one number
          </li>
          <li className={/[!@#$%^&*]/.test(password) ? "met" : ""}>
            At least one special character
          </li>
        </ul>
      </div>
    </div>
  );
}

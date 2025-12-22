import React, { useState, useRef, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import usePageTitle from '../../hooks/usecrmPageTitle';
import { confirmPasswordReset } from './apiConfig';
import ToastNotification from '../../components/ToastNotification';


const FloatingInput = ({ label, type, value, onChange, name, showToggle, onToggle, isVisible }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current) {
        const currentValue = inputRef.current.value;
        if (currentValue && currentValue !== value) {
          onChange({ target: { value: currentValue } });
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [onChange, value]);

  return (
    <div className="input-group" style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        autoComplete="new-password"
        className={value ? 'has-value' : ''}
      />
      <label>{label}</label>

      {showToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="password-toggle-btn"
          aria-label={isVisible ? 'Hide password' : 'Show password'}
        >
          {isVisible ? (
            <EyeSlashIcon className="icon" />
          ) : (
            <EyeIcon className="icon" />
          )}
        </button>
      )}
    </div>
  );
};

const NewPassword = () => {
  usePageTitle();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    uppercase: false,
    number: false,
    match: false,
  });

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return 'Password must be at least 8 characters long';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter';
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number';
    return null;
  };

  const updatePasswordRules = (pwd, conf) => {
    setPasswordRules({
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      match: pwd === conf && pwd !== '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const pwdError = validatePassword(password);
    if (pwdError) {
      setErrorMessage(pwdError);
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match!');
      return;
    }
    setLoading(true);
    try {
      const response = await confirmPasswordReset(token, password, confirmPassword);
      setSuccessMessage('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000); // Navigate after showing success message
    } catch (error) {
      const message = error.message || error.detail || 'Failed to reset password.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastNotification successMessage={successMessage} />
      <ToastNotification errorMessage={errorMessage} />

      <div className="login-container">
        <form className="login-form Gen-Boxshadow" onSubmit={handleSubmit} autoComplete="off">
          <h2 className="form-title">Set New Password</h2>

          <FloatingInput
            label="Reset Token"
            type="text"
            name="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />

          <FloatingInput
            label="New Password"
           type={showPassword ? 'text' : 'password'}
           name="password"
           value={password}
           onChange={(e) => {
             setPassword(e.target.value);
             updatePasswordRules(e.target.value, confirmPassword);
           }}
           showToggle={true}
           onToggle={() => setShowPassword((prev) => !prev)}
           isVisible={showPassword}
         />

        <FloatingInput
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            updatePasswordRules(password, e.target.value);
          }}
          showToggle={true}
          onToggle={() => setShowConfirmPassword((prev) => !prev)}
          isVisible={showConfirmPassword}
        />

        <div className="password-rules" style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
          <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>🔐 Password Rules</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ color: passwordRules.length ? 'green' : '#666' }}>
              {passwordRules.length ? '✓' : '○'} 8+ chars
            </span>
            <span style={{ color: passwordRules.uppercase ? 'green' : '#666' }}>
              {passwordRules.uppercase ? '✓' : '○'} Uppercase
            </span>
            <span style={{ color: passwordRules.number ? 'green' : '#666' }}>
              {passwordRules.number ? '✓' : '○'} Number
            </span>
            <span style={{ color: passwordRules.match ? 'green' : '#666' }}>
              {passwordRules.match ? '✓' : '○'} Match
            </span>
          </div>
        </div>

        <button className="login-btn btn-primary-bg" type="submit" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>

        <div className="FFlaok-paus" style={{ marginTop: '1rem' }}>
          <p>
            Remembered your password? <Link to="/login">Login</Link>
          </p>
        </div>
      </form>
    </div>
    </>
  );
};

export default NewPassword;

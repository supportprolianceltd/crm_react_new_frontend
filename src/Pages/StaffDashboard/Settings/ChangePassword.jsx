import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { confirmPasswordReset } from '../../CompanyDashboard/Recruitment/ApiService';
import './ChangePassword.css';

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

const ChangePassword = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    uppercase: false,
    number: false,
    match: false,
  });
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserEmail(user.email || '');
  }, []);

  const showAlert = (message, type = 'info') => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 5000);
  };

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

    // Validate OTP (demo: require 6 digits)
    if (!otp || otp.length !== 6) {
      showAlert('Please enter a valid 6-digit OTP', 'error');
      return;
    }

    const pwdError = validatePassword(password);
    if (pwdError) {
      showAlert(pwdError, 'error');
      return;
    }
    if (password !== confirmPassword) {
      showAlert('Passwords do not match!', 'error');
      return;
    }

    setLoading(true);
    try {
      const tenantDomain = localStorage.getItem('tenantDomain');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userEmail = user.email;
      const userUsername = user.username;

      let identifierKey = 'username';
      let identifierValue = userUsername;
      if (userEmail && userEmail.includes(tenantDomain)) {
        identifierKey = 'email';
        identifierValue = userEmail;
      }

      const resetData = {
        [identifierKey]: identifierValue,
        token: otp,
        new_password: password,
        confirm_password: confirmPassword,
      };

      await confirmPasswordReset(resetData);
      showAlert('Password reset successfully!', 'success');
      // Clear session and redirect to login
      localStorage.clear();
      navigate('/login');
    } catch (err) {
      const message = err.message || err.detail || 'Failed to reset password. Please try again.';
      showAlert(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  // Resend OTP logic (real API call)
  const handleResendOtp = async () => {
    try {
      const tenantDomain = localStorage.getItem('tenantDomain');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userEmail = user.email;
      const userUsername = user.username;

      let identifierKey = 'username';
      let identifierValue = userUsername;
      if (userEmail && userEmail.includes(tenantDomain)) {
        identifierKey = 'email';
        identifierValue = userEmail;
      }

      // Use the same resetPassword as ForgotPassword
      const { resetPassword } = await import('../../CRMLandingPages/apiConfig');
      await resetPassword(identifierValue);
      showAlert('OTP resent successfully!', 'success');
      setOtp(''); // Clear OTP field
    } catch (err) {
      const message = err?.message || 'Failed to resend OTP. Please try again.';
      showAlert(message, 'error');
    }
  };

  return (
    <div className="ddFFatgs-Polas-container" style={{ position: 'relative' }}>
      <motion.form
        className="login-form"
        onSubmit={handleSubmit}
        autoComplete="off"
        initial={{ opacity: 1, x: 0 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* OTP Verification Section */}
        <div className="JUhj-PPLOa">
        <h2 className="form-title">Change Password</h2>
          <p>We sent an OTP code to <b>{userEmail}</b></p>
        </div>

        <FloatingInput
          label="OTP"
          type="text"
          name="otp"
          value={otp}
          onChange={handleOtpChange}
          showToggle={false}
          maxLength={6}
        />

        <div className="FFlaok-paus fffessd">
          <p>
            Didn't receive a code?{" "}
            <button className="resend-btn" type="button" onClick={handleResendOtp}>
              Resend code
            </button>
          </p>
        </div>

        {/* Password Change Section */}
       

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

        <button className="PG-login-btn btn-primary-bg" type="submit" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </motion.form>

      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{
              position: 'fixed',
              top: '1rem',
              right: '1rem',
              zIndex: 3350,
              padding: '1rem',
              borderRadius: '0.5rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              maxWidth: '20rem',
              backgroundColor: alert.type === 'success' ? '#10b981' : '#ef4444',
              color: 'white',
              fontSize: '0.875rem',
            }}
          >
            {alert.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ChangePassword;
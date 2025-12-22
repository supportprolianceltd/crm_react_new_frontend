import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import usePageTitle from '../../hooks/usecrmPageTitle';
import { motion } from 'framer-motion';

const FloatingInput = ({ label, type, value, onChange, name, showToggle, onToggle, isVisible }) => {
  return (
    <div className="input-group" style={{ position: 'relative' }}>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        autoComplete="on"
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
          {isVisible ? <EyeSlashIcon className="icon" /> : <EyeIcon className="icon" />}
        </button>
      )}
    </div>
  );
};

const Register = () => {
  usePageTitle();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Added loading state
  const [error, setError] = useState(''); // Added error state for better UX

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Set loading to true

    if (!agree) {
      setError('You must agree to the Terms of Use and Privacy Policy.');
      setLoading(false);
      return;
    }

    // Simple validation check (all fields filled)
    const allFieldsFilled = Object.values(formData).every((field) => field.trim() !== '');
    if (!allFieldsFilled) {
      setError('Please fill all fields.');
      setLoading(false);
      return;
    }

    // Password match check
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    // Simulate async registration process (replace with actual API call if needed)
    setTimeout(() => {
      console.log(formData);
      setLoading(false);
      navigate('/code-verification'); // Navigate after "processing"
    }, 1000); // Simulated 1-second delay for demo purposes
  };

  return (
    <div className="login-container">
      <form className="login-form Gen-Boxshadow" onSubmit={handleSubmit} autoComplete="on">
        <h2 className="form-title">Create your account</h2>

        <FloatingInput
          label="First Name"
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
        />
        <FloatingInput
          label="Last Name"
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
        />
        <FloatingInput
          label="Email address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        <FloatingInput
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={formData.password}
          onChange={handleChange}
          showToggle={true}
          onToggle={() => setShowPassword((prev) => !prev)}
          isVisible={showPassword}
        />
        <FloatingInput
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          showToggle={true}
          onToggle={() => setShowConfirmPassword((prev) => !prev)}
          isVisible={showConfirmPassword}
        />

        <div className="terms-checkbox">
          <label>
            <input
              type="checkbox"
              checked={agree}
              onChange={() => setAgree(!agree)}
              required
            />{' '}
            <span>
              I confirm that I have read, consent and agree to laefy{' '}
              <Link to="/terms">Terms of Use</Link> and{' '}
              <Link to="/privacy-policy">Privacy Policy</Link>
            </span>
          </label>
        </div>

        {error && <p className="erro-message-Txt">{error}</p>}

        <button className="login-btn btn-primary-bg" type="submit" disabled={loading}>
          {loading && (
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 15,
                height: 15,
                borderRadius: '50%',
                border: '3px solid #fff',
                borderTopColor: 'transparent',
                marginRight: '5px',
                display: 'inline-block',
              }}
            />
          )}
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <div className="FFlaok-paus">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>

        <div className="social-login">
          <p className="login-divider">
            <span>or</span>
          </p>

          <button className="social-btn google">
            <span className="icon ggole-Pol">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.2 0 5.3 1.4 6.6 2.5l4.9-4.9C32.5 4.3 28.7 2 24 2 14.9 2 7.5 8.4 5.1 16.9l6.6 5.1C13.1 15.3 18.1 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.5 24c0-1.6-.1-2.8-.3-4H24v7.5h12.7c-.5 2.7-2.1 5-4.4 6.5l6.8 5.2c4-3.7 6.4-9.2 6.4-15.2z"
                />
                <path
                  fill="#FBBC05"
                  d="M11.7 28.4c-1-2.7-1-5.7 0-8.4L5.1 14.9C2.1 20.5 2.1 27.6 5.1 33.1l6.6-4.7z"
                />
                <path
                  fill="#34A853"
                  d="M24 46c6.5 0 12-2.1 16-5.6l-6.8-5.2c-2 1.3-4.6 2.1-9.2 2.1-5.9 0-10.9-3.8-12.7-9.1l-6.6 4.7C7.5 39.6 14.9 46 24 46z"
                />
              </svg>
            </span>
            Continue with Google
          </button>

          <button className="social-btn apple">
            <span className="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="black"
              >
                <path d="M16.365 1.43c0 1.14-.47 2.25-1.26 3.06-.84.86-2.19 1.52-3.39 1.43a3.57 3.57 0 0 1-.03-.45c0-1.07.47-2.22 1.29-3.03.85-.84 2.25-1.47 3.39-1.42 0 .13.03.26.03.41zM20.94 17.84c-.34.8-.5 1.12-.93 1.8-.6.94-1.45 2.1-2.52 2.13-1 .03-1.33-.63-2.77-.63s-1.8.6-2.77.66c-1.13.07-2-.99-2.61-1.92-1.81-2.64-3.2-7.45-1.34-10.72.91-1.58 2.53-2.57 4.31-2.59 1.01-.02 1.96.68 2.77.68.8 0 2.01-.84 3.4-.72.58.03 2.21.23 3.27 1.76-.08.05-1.94 1.14-1.91 3.41.03 2.7 2.36 3.59 2.39 3.6z" />
              </svg>
            </span>
            Continue with Apple
          </button>
        </div>

        <div className="Reg-Foot">
          <Link to="/terms">Terms of Use</Link>
          <Link to="/privacy-policy">Privacy Policy</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
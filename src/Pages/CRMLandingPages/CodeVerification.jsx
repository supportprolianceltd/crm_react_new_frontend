import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import usePageTitle from '../../hooks/usecrmPageTitle';

const FloatingInput = ({ label, type, value, onChange, name }) => {
  return (
    <div className="input-group" style={{ position: 'relative' }}>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        autoComplete="off"
        className={value ? 'has-value' : ''}
      />
      <label>{label}</label>
    </div>
  );
};

const CodeVerification = () => {
  usePageTitle();
  const [code, setCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Verification code submitted:', code);
    // Add your verification logic here
  };

  return (
    <div className="login-container">
      <form className="login-form Gen-Boxshadow" onSubmit={handleSubmit} autoComplete="off">
        <h2 className="form-title">Check your inbox</h2>
        <p className='form-sub-title'>Enter the verification code we just sent to princegodson24@gmail.com</p>

        <FloatingInput
          label="Code"
          type="text"
          name="verificationCode"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <button className="login-btn btn-primary-bg" type="submit">
          Continue
        </button>

        <div className="FFlaok-paus">
          <p>
            Didn't receive a code? <button>Resend code</button>
          </p>
        </div>
           <div className='Reg-Foot'>
          <Link to='/terms'>Terms of Use</Link>
          <Link to='/privacy-policy'>Privacy Policy</Link>
        </div>

      </form>
    </div>
  );
};

export default CodeVerification;

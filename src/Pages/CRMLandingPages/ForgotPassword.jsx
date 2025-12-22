import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import usePageTitle from "../../hooks/usecrmPageTitle";
import { resetPassword } from "./apiConfig";
import ToastNotification from "../../components/ToastNotification";
import { motion } from "framer-motion";

const FloatingInput = ({ label, type, value, onChange, name }) => {
  return (
    <div className="input-group" style={{ position: "relative" }}>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        autoComplete="username"
        className={value ? "has-value" : ""}
      />
      <label>{label}</label>
    </div>
  );
};

const ForgotPassword = () => {
  usePageTitle();
  const navigate = useNavigate();

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [emailOrUsername, setEmailOrUsername] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await resetPassword(emailOrUsername);
      setSuccessMessage("Reset code sent successfully");
      navigate("/new-password");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
      // setSuccessMessage("");
      // setErrorMessage("");
    }
  };

  console.log(loading);

  return (
    <>
      <ToastNotification successMessage={successMessage} />
      <ToastNotification errorMessage={errorMessage} />

      <div className="login-container">
        <form
          className="login-form Gen-Boxshadow"
          onSubmit={handleSubmit}
          autoComplete="on"
        >
          <h2 className="form-title">Forgot Password?</h2>

          <FloatingInput
            label="Enter your email or username"
            type="text"
            name="emailOrUsername"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
          />

          <button
            className="login-btn btn-primary-bg"
            type="submit"
            disabled={!emailOrUsername.length || loading}
          >
            {loading && (
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{
                  width: 15,
                  height: 15,
                  borderRadius: "50%",
                  border: "3px solid #fff",
                  borderTopColor: "transparent",
                  marginRight: "5px",
                  display: "inline-block",
                }}
              />
            )}
            {loading ? "Sending..." : "Send Reset Code"}
          </button>

          <div className="FFlaok-paus">
            <p>
              Didn't receive a code? <button>Resend code</button>
            </p>
          </div>

          <div className="FFlaok-paus">
            <p>
              <Link to="/login">Login insted!</Link>
            </p>
          </div>
        </form>
      </div>
    </>
  );
};

export default ForgotPassword;

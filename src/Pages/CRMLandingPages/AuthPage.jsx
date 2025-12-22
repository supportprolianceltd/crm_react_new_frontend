import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import usePageTitle from "../../hooks/usecrmPageTitle";
import { apiClient } from "../../config";
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
        autoComplete="email"
        className={value ? "has-value" : ""}
      />
      <label>{label}</label>
    </div>
  );
};

const AuthPage = () => {
  usePageTitle();
  const navigate = useNavigate();

  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("otpEmail");
    const storedPassword = sessionStorage.getItem("otpPassword");
    const storedLoginType = sessionStorage.getItem("otpLoginType");
    const storedIdentifier = sessionStorage.getItem("otpIdentifier");
    if (storedEmail && storedPassword && storedLoginType && storedIdentifier) {
      setEmail(storedEmail);
      setPassword(storedPassword);
      setLoginType(storedLoginType);
      setIdentifier(storedIdentifier);
    } else {
      // If no data, redirect back to login
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResendMessage("");
    setLoading(true);

    if (!otpCode) {
      setError("Please enter the OTP code.");
      setLoading(false);
      return;
    }

    try {
      const verificationPayload = loginType === "email" ? { email: identifier, otp_code: otpCode } : { username: identifier, otp_code: otpCode };
      const response = await apiClient.post(`/api/verify-otp/`, verificationPayload);

      // Store tokens and user data
      sessionStorage.setItem("tempAccessToken", response.data.access);
      sessionStorage.setItem("tempRefreshToken", response.data.refresh);
      sessionStorage.setItem(
        "tempTenantId",
        response.data.tenant_id.toString()
      );
      sessionStorage.setItem(
        "tempTenantUniqueId",
        response.data.tenant_unique_id
      );
      sessionStorage.setItem("tempTenantSchema", response.data.tenant_schema);
      sessionStorage.setItem("tempTenantDomain", response.data.tenant_domain);
      sessionStorage.setItem("tempUser", JSON.stringify(response.data.user));

      // Clear OTP data
      sessionStorage.removeItem("otpEmail");
      sessionStorage.removeItem("otpUserId");
      sessionStorage.removeItem("otpMethod");
      sessionStorage.removeItem("otpLoginType");
      sessionStorage.removeItem("otpIdentifier");

      // Redirect based on terms acceptance
      if (response.data.has_accepted_terms) {
        const tempUser = JSON.parse(sessionStorage.getItem("tempUser"));
        const fullUser = {
          ...tempUser,
          has_accepted_terms: response.data.has_accepted_terms,
        };

        localStorage.setItem("accessToken", response.data.access);
        localStorage.setItem("refreshToken", response.data.refresh);
        localStorage.setItem("tenantId", response.data.tenant_id.toString());
        localStorage.setItem("tenantUniqueId", response.data.tenant_unique_id);
        localStorage.setItem("tenantSchema", response.data.tenant_schema);
        localStorage.setItem("tenantDomain", response.data.tenant_domain);
        localStorage.setItem("user", JSON.stringify(fullUser));

        [
          "tempAccessToken",
          "tempRefreshToken",
          "tempTenantId",
          "tempTenantUniqueId",
          "tempTenantSchema",
          "tempTenantDomain",
          "tempUser",
        ].forEach((key) => sessionStorage.removeItem(key));

        // Clear OTP data
        [
          "otpEmail",
          "otpPassword",
          "otpUserId",
          "otpMethod",
          "otpLoginType",
          "otpIdentifier",
        ].forEach((key) => sessionStorage.removeItem(key));

        navigate("/staff", { replace: true });
      } else {
        // Clear OTP data
        [
          "otpEmail",
          "otpPassword",
          "otpUserId",
          "otpMethod",
          "otpLoginType",
          "otpIdentifier",
        ].forEach((key) => sessionStorage.removeItem(key));
        navigate("/terms", { replace: true });
      }
    } catch (err) {
      let errorMessage = "An error occurred during OTP verification. Please try again.";
      if (err.response) {
        const { status, data } = err.response;
        if (status === 400) {
          errorMessage = data.detail || "Invalid OTP code. Please check and try again.";
        } else if (status === 401) {
          errorMessage = "OTP verification failed. Please request a new code.";
        } else if (status >= 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (err.request) {
        errorMessage = "No response from server. Please check your internet connection.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return; // Prevent resend if countdown is active
    setResendMessage("");
    setResendLoading(true);

    try {
      const resendPayload = loginType === "email" ? { email: identifier, password } : { username: identifier, password };
      const response = await apiClient.post(`/api/token/`, resendPayload);

      if (response.data.requires_otp) {
        setError(""); // Clear any previous error
        setResendMessage("OTP sent successfully. Please check your email.");
        // Update stored data if needed
        sessionStorage.setItem("otpUserId", response.data.user_id.toString());
        sessionStorage.setItem("otpMethod", response.data.otp_method);
        setCountdown(30); // Reset countdown after resend
      } else {
        setError("Unexpected response. Please try again.");
      }
    } catch (err) {
      let errorMessage = "Failed to resend OTP. Please try again.";
      if (err.response) {
        const { status, data } = err.response;
        if (status === 400) {
          errorMessage = data.detail || "Invalid request.";
        } else if (status === 401) {
          errorMessage = "Invalid credentials.";
        } else if (status >= 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (err.request) {
        errorMessage = "No response from server. Please check your internet connection.";
      }
      setError(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form
        className="login-form Gen-Boxshadow"
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        <div className="JUhj-PPLOa">
          <h2 className="form-title">Verify Your Account</h2>
          <p>We sent an OTP code to <b>{email}</b></p>
        </div>

        <FloatingInput
          label="Enter OTP code"
          type="text"
          name="otp"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value)}
        />

        <button
          className="PG-login-btn btn-primary-bg"
          type="submit"
          disabled={!otpCode.length || loading}
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
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        {error && <p className="erro-message-Txt">{error}</p>}
        {resendMessage && <p className="success-message">{resendMessage}</p>}

        <div className="FFlaok-paus">
          <p>
            Didn't receive a code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || resendLoading}
              className="resend-btn"
            >
              {countdown > 0 ? `Resend in ${countdown}s` : (resendLoading ? "Resending..." : "Resend code")}
            </button>
          </p>
        </div>

        <div className="Reg-Foot">
          <Link to="/terms">Terms of Use</Link>
          <Link to="/privacy-policy">Privacy Policy</Link>
        </div>
      </form>
    </div>
  );
};

export default AuthPage;

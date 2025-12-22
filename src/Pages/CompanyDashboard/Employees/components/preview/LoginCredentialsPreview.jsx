// components/preview/LoginCredentialsPreview.jsx
import React from "react";

export default function LoginCredentialsPreview({ formData }) {
  return (
    <div className="preview-section login-credentials-preview">
      <h4>Login Credentials</h4>
      <div className="preview-grid">
        <div>
          <label>Username</label>
          <p>{formData.username || "Not set"}</p>
        </div>
        <div>
          <label>Password</label>
          <p>••••••••</p>
        </div>
        <div>
          <label>Two-Factor Auth</label>
          <p>{formData.twoFactor || "Not set"}</p>
        </div>
        <div>
          <label>Dashboard Access</label>
          <p>{formData.dashboard || "Not set"}</p>
        </div>
        <div>
          <label>Account Status</label>
          <p>{formData.status || "Not set"}</p>
        </div>
      </div>
    </div>
  );
}

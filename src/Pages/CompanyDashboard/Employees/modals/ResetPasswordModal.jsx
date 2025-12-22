import { useState, useEffect } from "react";
import Modal from "../../../../components/Modal";
import ToastNotification from "../../../../components/ToastNotification";
import { regeneratePassword } from "../config/apiService";
import { FiLoader, FiCopy } from "react-icons/fi";

const ResetPasswordModal = ({ isOpen, onClose, employee }) => {
  const [isResetting, setIsResetting] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // 👇 Reset state when modal closes or employee changes
  useEffect(() => {
    if (!isOpen || !employee) {
      setCredentials(null);
      setSuccessMessage(null);
      setErrorMessage(null);
      setIsResetting(false);
    }
  }, [isOpen, employee]);

  const handleReset = async () => {
    try {
      setIsResetting(true);
      const data = await regeneratePassword(employee?.email);
      setCredentials(data); // { user_email, new_password }
      setSuccessMessage("Password regenerated successfully!");
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage("Failed to reset password. Please try again.");
      setSuccessMessage(null);
    } finally {
      setIsResetting(false);
      setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 3000);
    }
  };

  const handleCopyAll = () => {
    const combined = `Email: ${credentials.email}\nPassword: ${credentials.new_password}`;
    navigator.clipboard.writeText(combined);
    setSuccessMessage("Credentials copied to clipboard!");
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  return (
    <>
      <ToastNotification
        successMessage={successMessage}
        errorMessage={errorMessage}
      />
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Reset Password"
        message={
          credentials
            ? "The password has been reset successfully. Copy and share with the user."
            : `Are you sure you want to reset ${employee?.first_name} ${employee?.last_name}'s password?`
        }
      >
        {credentials ? (
          <div className="credentials-display">
            <div className="credential-row">
              <span className="label">Email:</span>
              <span className="value">{credentials.user_email}</span>
            </div>
            <div className="credential-row">
              <span className="label">Password:</span>&nbsp;
              <span className="value">{credentials.new_password}</span>
            </div>

            {/* Action buttons */}
            <div className="modal-footer" style={{ marginTop: "1rem" }}>
              <button
                className="modal-button modal-button-cancel"
                onClick={onClose}
              >
                Close
              </button>
              <button
                className="modal-button modal-button-confirm"
                onClick={handleCopyAll}
              >
                <FiCopy style={{ marginRight: "0.4rem" }} />
                Copy
              </button>
            </div>
          </div>
        ) : (
          <div className="modal-footer" style={{ marginTop: "1rem" }}>
            <button
              className="modal-button modal-button-cancel"
              onClick={onClose}
              disabled={isResetting}
            >
              Cancel
            </button>
            <button
              className="modal-button modal-button-confirm"
              onClick={handleReset}
              disabled={isResetting}
            >
              {isResetting ? (
                <>
                  <FiLoader
                    style={{
                      animation: "spin 1s linear infinite",
                      margin: "0.5rem 0.3rem 0 0",
                    }}
                  />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ResetPasswordModal;

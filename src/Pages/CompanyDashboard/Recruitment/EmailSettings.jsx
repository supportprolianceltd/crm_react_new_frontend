import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  PlusIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { fetchTenantConfig, updateTenantConfig } from "./ApiService";

// Modal component for confirmation dialogs
const Modal = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 z-40"
      onClick={onCancel}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      exit={{ opacity: 0 }}
    />
    <motion.div
      className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg"
      initial={{ opacity: 0, scale: 0.75 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.75 }}
      role="dialog"
      aria-modal="true"
    >
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      <p className="mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="rounded bg-gray-300 px-4 py-2 font-semibold hover:bg-gray-400"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className="rounded bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
          autoFocus
        >
          {confirmText}
        </button>
      </div>
    </motion.div>
  </AnimatePresence>
);

// AlertModal component for simple alerts
const AlertModal = ({ title, message, onClose }) => (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 z-40"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      exit={{ opacity: 0 }}
    />
    <motion.div
      className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg"
      initial={{ opacity: 0, scale: 0.75 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.75 }}
      role="alertdialog"
      aria-modal="true"
    >
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      <p className="mb-6">{message}</p>
      <div className="flex justify-end">
        <button onClick={onClose} className="btn-primary-bg" autoFocus>
          OK
        </button>
      </div>
    </motion.div>
  </AnimatePresence>
);

// Email Configuration Modal Component
const EmailConfigModal = ({
  isOpen,
  onClose,
  config,
  onSave,
  isSaving = false,
}) => {
  const [emailHost, setEmailHost] = useState(config?.email_host || "");
  const [emailPort, setEmailPort] = useState(config?.email_port || "");
  const [emailUseSsl, setEmailUseSsl] = useState(config?.email_use_ssl ?? true);
  const [emailHostUser, setEmailHostUser] = useState(
    config?.email_host_user || ""
  );
  const [emailHostPassword, setEmailHostPassword] = useState(
    config?.email_host_password || ""
  );
  const [defaultFromEmail, setDefaultFromEmail] = useState(
    config?.default_from_email || ""
  );
  const [error, setError] = useState("");
  const modalContentRef = useRef(null);
  const errorTimeoutRef = useRef(null);

  useEffect(() => {
    if (config) {
      setEmailHost(config.email_host || "");
      setEmailPort(config.email_port || "");
      setEmailUseSsl(config.email_use_ssl ?? true);
      setEmailHostUser(config.email_host_user || "");
      setEmailHostPassword(config.email_host_password || "");

      setDefaultFromEmail(config.default_from_email || "");
    } else {
      setEmailHost("");
      setEmailPort("");
      setEmailUseSsl(true);
      setEmailHostUser("");
      setEmailHostPassword("");
      setDefaultFromEmail("");
    }
  }, [config]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalContentRef.current &&
        !modalContentRef.current.contains(event.target) &&
        isOpen
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    if (!emailHost.trim()) {
      setError("Email host is required");
      errorTimeoutRef.current = setTimeout(() => setError(""), 3000);
      return;
    }
    if (!emailPort || isNaN(emailPort) || emailPort <= 0) {
      setError("Valid email port is required");
      errorTimeoutRef.current = setTimeout(() => setError(""), 3000);
      return;
    }
    if (!emailHostUser.trim()) {
      setError("Email host user is required");
      errorTimeoutRef.current = setTimeout(() => setError(""), 3000);
      return;
    }
    if (!defaultFromEmail.trim()) {
      setError("Default from email is required");
      errorTimeoutRef.current = setTimeout(() => setError(""), 3000);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(defaultFromEmail)) {
      setError("Invalid email format for default from email");
      errorTimeoutRef.current = setTimeout(() => setError(""), 3000);
      return;
    }

    const configData = {
      email_host: emailHost.trim(),
      email_port: parseInt(emailPort),
      email_use_ssl: emailUseSsl,
      email_host_user: emailHostUser.trim(),
      email_host_password: emailHostPassword.trim(),
      default_from_email: defaultFromEmail.trim(),
    };

    onSave(configData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 3000,
        }}
      >
        <motion.div
          className="modal-content custom-scroll-bar okauj-MOadad"
          ref={modalContentRef}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          <h3 className="modal-content h3">
            {config ? "Edit Email Configuration" : "Add Email Configuration"}
          </h3>
          <form onSubmit={handleSubmit} className="p-6">
            <AnimatePresence>
              {error && (
                <motion.div
                  className="error-notification"
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    position: "fixed",
                    top: "20px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#fee2e2",
                    icolor: "#b91c1c",
                    padding: "1rem",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    zIndex: 4001,
                    maxWidth: "500px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  }}
                >
                  <ExclamationTriangleIcon
                    style={{
                      width: "20px",
                      height: "20px",
                      color: "#fff",
                      marginRight: "0.5rem",
                    }}
                  />
                  <span style={{ color: "#fff" }}>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="GGtg-DDDVa">
              <label>Email Host *</label>
              <input
                type="text"
                value={emailHost}
                onChange={(e) => setEmailHost(e.target.value)}
                className="oujka-Inpuauy"
                placeholder="e.g., smtp.gmail.com"
              />
            </div>
            <div className="GGtg-DDDVa deliVa">
              <label>Email Port *</label>
              <input
                type="number"
                value={emailPort}
                onChange={(e) => setEmailPort(e.target.value)}
                className="oujka-Inpuauy"
                placeholder="e.g., 465"
              />
            </div>
            <div className="GGtg-DDDVa">
              <label className="GTha-POka">
                <input
                  type="checkbox"
                  checked={emailUseSsl}
                  onChange={(e) => setEmailUseSsl(e.target.checked)}
                />
                Use SSL
              </label>
            </div>
            <div className="GGtg-DDDVa">
              <label>Email Host User *</label>
              <input
                type="email"
                value={emailHostUser}
                onChange={(e) => setEmailHostUser(e.target.value)}
                className="oujka-Inpuauy"
                placeholder="e.g., user@example.com"
              />
            </div>
            <div className="GGtg-DDDVa">
              <label>Email Host Password</label>
              <input
                type="password"
                value={emailHostPassword}
                onChange={(e) => setEmailHostPassword(e.target.value)}
                className="oujka-Inpuauy"
                placeholder="Enter password"
              />
            </div>
            <div className="GGtg-DDDVa">
              <label>Default From Email *</label>
              <input
                type="email"
                value={defaultFromEmail}
                onChange={(e) => setDefaultFromEmail(e.target.value)}
                className="oujka-Inpuauy"
                placeholder="e.g., no-reply@example.com"
              />
            </div>
            <div className="oioak-POldj-BTn">
              <button
                type="button"
                onClick={onClose}
                className="CLCLCjm-BNtn"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary-bg"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: "3px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        marginRight: "5px",
                      }}
                    />
                    {config ? "Updating..." : "Creating..."}
                  </>
                ) : config ? (
                  "Update Configuration"
                ) : (
                  "Add Configuration"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Main EmailSettings component
const EmailSettings = () => {
  const [emailConfig, setEmailConfig] = useState(null);
  const [showEmailConfigModal, setShowEmailConfigModal] = useState(false);
  const [currentEmailConfig, setCurrentEmailConfig] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch tenant email configuration from the backend
  const fetchEmailConfig = async () => {
    setIsLoading(true);
    try {
      const tenant = await fetchTenantConfig();
      if (tenant) {
        setEmailConfig({
          id: tenant.id,
          email_host: tenant.email_host || "",
          email_port: tenant.email_port || "",
          email_use_ssl: tenant.email_use_ssl ?? true,
          email_host_user: tenant.email_host_user || "",
          email_host_password: tenant.email_host_password || "",
          default_from_email: tenant.default_from_email || "",
          created_date: tenant.created_at.split("T")[0],
          last_modified: tenant.created_at, // Adjust if backend provides a last_modified field
        });
      }
    } catch (err) {
      setError(err.message || "Failed to fetch email configuration");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailConfig();
  }, []);

  const handleEditEmailConfig = () => {
    setCurrentEmailConfig(emailConfig);
    setShowEmailConfigModal(true);
  };

  const handleSaveEmailConfig = async (formData) => {
    setIsSaving(true);
    try {
      const currentTimestamp = new Date();
      const lastModifiedFormatted = `${
        currentTimestamp.toISOString().split("T")[0]
      } ${String(currentTimestamp.getHours()).padStart(2, "0")}:${String(
        currentTimestamp.getMinutes()
      ).padStart(2, "0")}`;

      if (currentEmailConfig) {
        // Update existing tenant
        const updatedTenant = await updateTenantConfig(
          currentEmailConfig.id,
          formData
        );
        setEmailConfig({
          ...emailConfig,
          ...formData,
          last_modified: lastModifiedFormatted,
        });
      }
      setShowEmailConfigModal(false);
    } catch (err) {
      setError(err.message || "Failed to save email configuration");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="APISettings-sec">
      <div className="Dash-OO-Boas Gen-Boxshadow">
        <div className="Dash-OO-Boas-Top">
          <div className="OOOu-KJa">
            <div className="Dash-OO-Boas-Top-1">
              <h3>Email Configuration</h3>
              <p>
                Manage your email server settings and notification preferences
              </p>
            </div>
          </div>
          <button
            className="poli-BTn btn-primary-bg"
            onClick={handleEditEmailConfig}
            disabled={!emailConfig || isLoading}
          >
            <PencilIcon className="h-5 w-5 mr-1" />
            Edit Email Configuration
          </button>
        </div>

        {error && (
          <motion.div
            className="error-notification"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              top: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "1rem",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              zIndex: 4001,
              maxWidth: "500px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <ExclamationTriangleIcon
              style={{
                width: "20px",
                height: "20px",
                color: "#fff",
                marginRight: "0.5rem",
              }}
            />
            <span style={{ color: "#fff" }}>{error}</span>
          </motion.div>
        )}

        <div className="table-container">
          <table className="Gen-Sys-table">
            <thead>
              <tr>
                <th>
                  <span className="flex items-center gap-1">S/N</span>
                </th>
                <th>
                  <span className="flex items-center gap-1">Email Host</span>
                </th>
                <th>
                  <span className="flex items-center gap-1">Port</span>
                </th>
                <th>
                  <span className="flex items-center gap-1">SSL</span>
                </th>
                <th>
                  <span className="flex items-center gap-1">Host User</span>
                </th>
                <th>
                  <span className="flex items-center gap-1">
                    Default From Email
                  </span>
                </th>
                <th>
                  <span className="flex items-center gap-1">Created Date</span>
                </th>
                <th>
                  <span className="flex items-center gap-1">Last Modified</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      fontStyle: "italic",
                    }}
                  >
                    <ul className="tab-Loadding-AniMMA">
                      <li></li>
                      <li></li>
                      <li></li>
                      <li></li>
                      <li></li>
                      <li></li>
                      <li></li>
                      <li></li>
                    </ul>
                  </td>
                </tr>
              ) : emailConfig ? (
                <tr key={emailConfig.id}>
                  <td>1</td>
                  <td>{emailConfig.email_host}</td>
                  <td>{emailConfig.email_port}</td>
                  <td>{emailConfig.email_use_ssl ? "Yes" : "No"}</td>
                  <td>{emailConfig.email_host_user}</td>
                  <td>{emailConfig.default_from_email}</td>
                  <td>{emailConfig.created_date}</td>
                  <td>{emailConfig.last_modified}</td>
                </tr>
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      fontStyle: "italic",
                    }}
                  >
                    No email configuration found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <EmailConfigModal
        isOpen={showEmailConfigModal}
        onClose={() => setShowEmailConfigModal(false)}
        config={currentEmailConfig}
        onSave={handleSaveEmailConfig}
        isSaving={isSaving}
      />
      <AnimatePresence>
        {error && (
          <AlertModal
            title="Error"
            message={error}
            onClose={() => setError("")}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmailSettings;